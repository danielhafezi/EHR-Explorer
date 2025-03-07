const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { processPatientFile, insertPatientData } = require('./process-functions');

// Path to Synthea data files
const dataPath = path.join(__dirname, '../../data/synthea');

// Path to database
const dbPath = path.join(__dirname, '../db/ehr_explorer.db');

// Create a connection to the database
const db = new sqlite3.Database(dbPath);

// Main function to process all Synthea files
async function processAllFiles() {
  try {
    // Get list of .json files in the synthea directory
    const files = fs.readdirSync(dataPath).filter(file => file.endsWith('.json'));
    
    console.log(`Found ${files.length} Synthea patient files to process`);
    
    // Process each file
    for (const file of files) {
      console.log(`Processing ${file}...`);
      const filePath = path.join(dataPath, file);
      
      try {
        const patientData = await processPatientFile(filePath);
        await insertPatientData(db, patientData);
        console.log(`Successfully processed ${file}`);
      } catch (error) {
        console.error(`Failed to process ${file}:`, error);
      }
    }
    
    console.log('All files processed successfully');
  } catch (error) {
    console.error('Error processing files:', error);
  } finally {
    // Close the database connection
    db.close(err => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON', err => {
  if (err) {
    console.error('Error enabling foreign keys:', err.message);
    return;
  }
  
  // Start processing files
  processAllFiles();
}); 