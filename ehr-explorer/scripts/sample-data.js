const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { processPatientFile, insertPatientData } = require('./process-functions');

// Sample patient data
const samplePatients = [
  {
    id: "sample-patient-1",
    name: "John Smith",
    gender: "male",
    birthDate: "1980-05-15",
    address: JSON.stringify({
      "line": ["123 Main St"],
      "city": "Boston",
      "state": "Massachusetts",
      "postalCode": "02108"
    }),
    phone: "555-123-4567",
    marital_status: "Married"
  },
  {
    id: "sample-patient-2",
    name: "Jane Doe",
    gender: "female",
    birthDate: "1992-10-08",
    address: JSON.stringify({
      "line": ["456 Oak Ave"],
      "city": "Boston",
      "state": "Massachusetts",
      "postalCode": "02109"
    }),
    phone: "555-987-6543",
    marital_status: "Single"
  }
];

// Sample conditions
const sampleConditions = [
  {
    patient_id: "sample-patient-1",
    condition: "Hypertension",
    condition_code: "59621000",
    onset_date: "2015-03-12",
    abatement_date: null
  },
  {
    patient_id: "sample-patient-1",
    condition: "Type 2 Diabetes",
    condition_code: "44054006",
    onset_date: "2018-07-22",
    abatement_date: null
  },
  {
    patient_id: "sample-patient-2",
    condition: "Asthma",
    condition_code: "195967001",
    onset_date: "2010-01-15",
    abatement_date: null
  }
];

// Sample medications
const sampleMedications = [
  {
    patient_id: "sample-patient-1",
    medication: "Lisinopril 10mg",
    medication_code: "314076",
    start_date: "2015-03-15",
    end_date: null,
    status: "active",
    dosage: "Take 1 tablet by mouth once daily"
  },
  {
    patient_id: "sample-patient-1",
    medication: "Metformin 500mg",
    medication_code: "105078",
    start_date: "2018-07-25",
    end_date: null,
    status: "active",
    dosage: "Take 1 tablet by mouth twice daily with meals"
  },
  {
    patient_id: "sample-patient-2",
    medication: "Albuterol Inhaler",
    medication_code: "895994",
    start_date: "2010-01-20",
    end_date: null,
    status: "active",
    dosage: "Inhale 2 puffs every 4-6 hours as needed for shortness of breath"
  }
];

// Sample encounters
const sampleEncounters = [
  {
    patient_id: "sample-patient-1",
    encounter_type: "Outpatient Visit",
    start_date: "2022-03-15",
    end_date: "2022-03-15"
  },
  {
    patient_id: "sample-patient-1",
    encounter_type: "Annual Physical",
    start_date: "2023-05-10",
    end_date: "2023-05-10"
  },
  {
    patient_id: "sample-patient-2",
    encounter_type: "Emergency Room Visit",
    start_date: "2022-11-23",
    end_date: "2022-11-23"
  }
];

// Path to database
const dbPath = path.join(__dirname, '../db/ehr_explorer.db');

// Create a connection to the database
const db = new sqlite3.Database(dbPath);

// Function to clear existing data
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

// Function to insert sample data
function insertSampleData() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('PRAGMA foreign_keys = ON');
      db.run('BEGIN TRANSACTION');
      
      // Insert sample patients
      const patientStmt = db.prepare(`
        INSERT INTO patients (id, name, gender, birthDate, address, phone, marital_status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      samplePatients.forEach(patient => {
        patientStmt.run(
          patient.id,
          patient.name,
          patient.gender,
          patient.birthDate,
          patient.address,
          patient.phone,
          patient.marital_status,
          function(err) {
            if (err) console.error('Error inserting patient:', err.message);
          }
        );
      });
      
      patientStmt.finalize();
      console.log('Inserted sample patients');
      
      // Insert sample conditions
      const conditionStmt = db.prepare(`
        INSERT INTO conditions (patient_id, condition, condition_code, onset_date, abatement_date)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      sampleConditions.forEach(condition => {
        conditionStmt.run(
          condition.patient_id,
          condition.condition,
          condition.condition_code,
          condition.onset_date,
          condition.abatement_date,
          function(err) {
            if (err) console.error('Error inserting condition:', err.message);
          }
        );
      });
      
      conditionStmt.finalize();
      console.log('Inserted sample conditions');
      
      // Insert sample medications
      const medicationStmt = db.prepare(`
        INSERT INTO medications (patient_id, medication, medication_code, start_date, end_date, status, dosage)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      sampleMedications.forEach(medication => {
        medicationStmt.run(
          medication.patient_id,
          medication.medication,
          medication.medication_code,
          medication.start_date,
          medication.end_date,
          medication.status,
          medication.dosage,
          function(err) {
            if (err) console.error('Error inserting medication:', err.message);
          }
        );
      });
      
      medicationStmt.finalize();
      console.log('Inserted sample medications');
      
      // Insert sample encounters
      const encounterStmt = db.prepare(`
        INSERT INTO encounters (patient_id, encounter_type, start_date, end_date)
        VALUES (?, ?, ?, ?)
      `);
      
      sampleEncounters.forEach(encounter => {
        encounterStmt.run(
          encounter.patient_id,
          encounter.encounter_type,
          encounter.start_date,
          encounter.end_date,
          function(err) {
            if (err) console.error('Error inserting encounter:', err.message);
          }
        );
      });
      
      encounterStmt.finalize();
      console.log('Inserted sample encounters');
      
      db.run('COMMIT', function(err) {
        if (err) {
          console.error('Error committing transaction:', err.message);
          db.run('ROLLBACK');
          reject(err);
          return;
        }
        resolve();
      });
    });
  });
}

// Main function to reset and add sample data
async function resetAndAddSampleData() {
  try {
    console.log('Resetting database and adding sample data...');
    
    // Clear the database
    await clearDatabase();
    
    // Insert sample data
    await insertSampleData();
    
    console.log('Sample data added successfully!');
  } catch (error) {
    console.error('Error adding sample data:', error);
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

// Run the function
resetAndAddSampleData(); 