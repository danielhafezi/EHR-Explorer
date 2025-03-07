const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { processPatientFile, insertPatientData } = require('./process-functions');

// Path to database
const dbPath = path.join(__dirname, '../db/ehr_explorer.db');

// Path to Synthea data files
const dataPath = path.join(__dirname, '../../data/synthea');

console.log('Resetting database and reprocessing all patient data...');

// Create a connection to the database
const db = new sqlite3.Database(dbPath);

// Function to clear all patient-related data
function clearDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('PRAGMA foreign_keys = OFF');
      db.run('BEGIN TRANSACTION');
      
      // Delete all existing data
      db.run('DELETE FROM medications', err => {
        if (err) {
          console.error('Error clearing medications:', err.message);
          reject(err);
          return;
        }
        console.log('Cleared medications table');
      });
      
      db.run('DELETE FROM conditions', err => {
        if (err) {
          console.error('Error clearing conditions:', err.message);
          reject(err);
          return;
        }
        console.log('Cleared conditions table');
      });
      
      db.run('DELETE FROM encounters', err => {
        if (err) {
          console.error('Error clearing encounters:', err.message);
          reject(err);
          return;
        }
        console.log('Cleared encounters table');
      });
      
      db.run('DELETE FROM patients', err => {
        if (err) {
          console.error('Error clearing patients:', err.message);
          reject(err);
          return;
        }
        console.log('Cleared patients table');
      });
      
      db.run('COMMIT', err => {
        if (err) {
          console.error('Error committing transaction:', err.message);
          db.run('ROLLBACK');
          reject(err);
          return;
        }
        
        db.run('PRAGMA foreign_keys = ON');
        console.log('Database cleared successfully');
        resolve();
      });
    });
  });
}

// Process all Synthea files
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
  }
}

// Main function to reset database and reprocess data
async function resetAndReprocessData() {
  try {
    // Clear the database
    await clearDatabase();
    
    // Process all files
    await processAllFiles();
    
    console.log('Database reset and data reprocessing completed successfully');
  } catch (error) {
    console.error('Error during database reset and reprocessing:', error);
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

// Run the reset and reprocess operation
resetAndReprocessData(); 