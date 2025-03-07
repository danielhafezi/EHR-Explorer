const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Path to Synthea data files
const dataPath = path.join(__dirname, '../../data/synthea');

// Path to database
const dbPath = path.join(__dirname, '../db/ehr_explorer.db');

// Create a connection to the database
const db = new sqlite3.Database(dbPath);

// Function to extract patient data from a Synthea JSON file
function processPatientFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file ${filePath}:`, err);
        reject(err);
        return;
      }

      try {
        const jsonData = JSON.parse(data);
        const patientData = {
          patient: null,
          conditions: [],
          medications: [],
          encounters: []
        };

        // Process each entry in the bundle
        jsonData.entry.forEach(entry => {
          const resource = entry.resource;

          // Extract patient data
          if (resource.resourceType === 'Patient') {
            const name = resource.name?.[0];
            const fullName = name ? `${name.given?.[0] || ''} ${name.family || ''}`.trim() : 'Unknown';
            
            patientData.patient = {
              id: resource.id,
              name: fullName,
              gender: resource.gender || null,
              birthDate: resource.birthDate || null,
              address: resource.address?.[0] ? JSON.stringify(resource.address[0]) : null,
              phone: resource.telecom?.[0]?.value || null,
              marital_status: resource.maritalStatus?.text || null
            };
          }

          // Extract condition data
          else if (resource.resourceType === 'Condition') {
            patientData.conditions.push({
              patient_id: resource.subject?.reference.split(':').pop().split('/').pop(),
              condition: resource.code?.coding?.[0]?.display || 'Unknown Condition',
              condition_code: resource.code?.coding?.[0]?.code || null,
              onset_date: resource.onsetDateTime || null,
              abatement_date: resource.abatementDateTime || null
            });
          }

          // Extract medication data
          else if (resource.resourceType === 'MedicationRequest') {
            patientData.medications.push({
              patient_id: resource.subject?.reference.split(':').pop().split('/').pop(),
              medication: resource.medicationCodeableConcept?.coding?.[0]?.display || 'Unknown Medication',
              medication_code: resource.medicationCodeableConcept?.coding?.[0]?.code || null,
              start_date: resource.authoredOn || null,
              end_date: null, // Will need post-processing to determine end dates
              status: resource.status || null,
              dosage: resource.dosageInstruction?.[0]?.text || null
            });
          }

          // Extract encounter data
          else if (resource.resourceType === 'Encounter') {
            patientData.encounters.push({
              patient_id: resource.subject?.reference.split(':').pop().split('/').pop(),
              encounter_type: resource.type?.[0]?.coding?.[0]?.display || 'Unknown',
              start_date: resource.period?.start || null,
              end_date: resource.period?.end || null
            });
          }
        });

        resolve(patientData);
      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
        reject(error);
      }
    });
  });
}

// Function to insert patient data into the database
function insertPatientData(patientData) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // Insert patient
      if (patientData.patient) {
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO patients (id, name, gender, birthDate, address, phone, marital_status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
          patientData.patient.id,
          patientData.patient.name,
          patientData.patient.gender,
          patientData.patient.birthDate,
          patientData.patient.address,
          patientData.patient.phone,
          patientData.patient.marital_status,
          function(err) {
            if (err) {
              console.error('Error inserting patient:', err.message);
              db.run('ROLLBACK');
              reject(err);
              return;
            }
            stmt.finalize();
          }
        );
      }

      // Insert conditions
      if (patientData.conditions.length > 0) {
        const stmt = db.prepare(`
          INSERT INTO conditions (patient_id, condition, condition_code, onset_date, abatement_date)
          VALUES (?, ?, ?, ?, ?)
        `);
        
        patientData.conditions.forEach(condition => {
          stmt.run(
            condition.patient_id,
            condition.condition,
            condition.condition_code,
            condition.onset_date,
            condition.abatement_date,
            function(err) {
              if (err) {
                console.error('Error inserting condition:', err.message);
              }
            }
          );
        });
        
        stmt.finalize();
      }

      // Insert medications
      if (patientData.medications.length > 0) {
        const stmt = db.prepare(`
          INSERT INTO medications (patient_id, medication, medication_code, start_date, end_date, status, dosage)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        patientData.medications.forEach(medication => {
          stmt.run(
            medication.patient_id,
            medication.medication,
            medication.medication_code,
            medication.start_date,
            medication.end_date,
            medication.status,
            medication.dosage,
            function(err) {
              if (err) {
                console.error('Error inserting medication:', err.message);
              }
            }
          );
        });
        
        stmt.finalize();
      }

      // Insert encounters
      if (patientData.encounters.length > 0) {
        const stmt = db.prepare(`
          INSERT INTO encounters (patient_id, encounter_type, start_date, end_date)
          VALUES (?, ?, ?, ?)
        `);
        
        patientData.encounters.forEach(encounter => {
          stmt.run(
            encounter.patient_id,
            encounter.encounter_type,
            encounter.start_date,
            encounter.end_date,
            function(err) {
              if (err) {
                console.error('Error inserting encounter:', err.message);
              }
            }
          );
        });
        
        stmt.finalize();
      }

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
        await insertPatientData(patientData);
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