const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const https = require('https');
const http = require('http');
const { processPatientFile, insertPatientData } = require('./process-functions');

// Path to Synthea data files
const dataPath = path.join(__dirname, '../../data/synthea');

// Path to database
const dbPath = path.join(__dirname, '../db/ehr_explorer.db');

console.log(`Watching directory: ${dataPath}`);

// Create a processing queue to prevent concurrent database operations
const processingQueue = [];
let isProcessing = false;

// Function to notify the Next.js app of data changes
function notifyDataChange() {
  try {
    // Use http for localhost
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/notify-data-change',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    req.on('error', (error) => {
      console.error('Error notifying app of data change:', error.message);
    });
    
    req.end(JSON.stringify({ timestamp: new Date().toISOString() }));
    console.log('Notified app of data change');
  } catch (error) {
    console.error('Failed to notify app of data change:', error);
  }
}

// Initialize the watcher
const watcher = chokidar.watch(dataPath, {
  persistent: true,
  ignoreInitial: false, // Process existing files on startup
  awaitWriteFinish: {
    stabilityThreshold: 2000, // Wait for file to be stable for 2 seconds before processing
    pollInterval: 100
  }
});

// Function to process the next file in the queue
async function processNextInQueue() {
  if (processingQueue.length === 0 || isProcessing) {
    return;
  }
  
  isProcessing = true;
  const filePath = processingQueue.shift();
  
  console.log(`Processing file from queue: ${path.basename(filePath)}`);
  
  // Create a connection to the database
  const db = new sqlite3.Database(dbPath);
  
  // Enable busy timeout to wait for locks to be released
  db.configure("busyTimeout", 5000);
  
  db.run('PRAGMA foreign_keys = ON');
  
  try {
    const patientData = await processPatientFile(filePath);
    await insertPatientData(db, patientData);
    console.log(`Successfully processed ${path.basename(filePath)}`);
    
    // Notify the app of the data change
    notifyDataChange();
  } catch (error) {
    console.error(`Failed to process ${path.basename(filePath)}:`, error);
  } finally {
    // Close the database connection
    db.close(err => {
      if (err) {
        console.error('Error closing database:', err.message);
      }
      
      // Mark as done processing and process next file
      isProcessing = false;
      processNextInQueue();
    });
  }
}

// Process a single file by adding it to the queue
function queueFileProcessing(filePath) {
  if (!filePath.endsWith('.json')) return;
  
  console.log(`Queuing file: ${path.basename(filePath)}`);
  
  // Add to queue if not already in it
  if (!processingQueue.includes(filePath)) {
    processingQueue.push(filePath);
    // Start processing if not already processing
    if (!isProcessing) {
      processNextInQueue();
    }
  }
}

// Handle file add/change events
watcher
  .on('add', filePath => {
    console.log(`New file detected: ${path.basename(filePath)}`);
    queueFileProcessing(filePath);
  })
  .on('change', filePath => {
    console.log(`File changed: ${path.basename(filePath)}`);
    queueFileProcessing(filePath);
  })
  .on('unlink', filePath => {
    console.log(`File removed: ${path.basename(filePath)}`);
    // Here you could implement logic to remove the patient from the database
    // when their file is deleted, if that's desired behavior
    
    // Notify the app of the data change in case the file was removed
    notifyDataChange();
  })
  .on('error', error => {
    console.error(`Watcher error: ${error}`);
  });

console.log('Watching for changes in the synthea directory...'); 