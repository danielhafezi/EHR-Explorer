const fs = require('fs');

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

// Function to safely execute a database operation with retries
function executeWithRetry(operation, maxRetries = 3, delay = 1000) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    function attempt() {
      attempts++;
      
      try {
        operation((err, result) => {
          if (err) {
            // If it's a SQLITE_BUSY error and we haven't exceeded max retries, try again
            if (err.code === 'SQLITE_BUSY' && attempts < maxRetries) {
              console.log(`Database is busy, retrying in ${delay}ms... (attempt ${attempts}/${maxRetries})`);
              setTimeout(attempt, delay);
              return;
            }
            reject(err);
            return;
          }
          resolve(result);
        });
      } catch (error) {
        reject(error);
      }
    }
    
    attempt();
  });
}

// Function to insert patient data into the database
function insertPatientData(db, patientData) {
  return new Promise((resolve, reject) => {
    // Configure database for better concurrency handling
    db.configure("busyTimeout", 5000);
    
    db.serialize(() => {
      // Wrap transaction in retry logic
      executeWithRetry((callback) => {
        db.run('BEGIN TRANSACTION', callback);
      })
        .then(() => {
          const promises = [];
          
          // Insert patient
          if (patientData.patient) {
            promises.push(new Promise((resolvePatient, rejectPatient) => {
              const stmt = db.prepare(`
                INSERT OR REPLACE INTO patients (id, name, gender, birthDate, address, phone, marital_status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
              `);
              
              executeWithRetry((callback) => {
                stmt.run(
                  patientData.patient.id,
                  patientData.patient.name,
                  patientData.patient.gender,
                  patientData.patient.birthDate,
                  patientData.patient.address,
                  patientData.patient.phone,
                  patientData.patient.marital_status,
                  callback
                );
              })
                .then(() => {
                  stmt.finalize();
                  resolvePatient();
                })
                .catch((err) => {
                  console.error('Error inserting patient:', err.message);
                  rejectPatient(err);
                });
            }));

            // Before inserting related records, delete existing ones to prevent duplication
            if (patientData.patient.id) {
              const patientId = patientData.patient.id;
              
              // Delete existing conditions
              promises.push(new Promise((resolveDelete, rejectDelete) => {
                executeWithRetry((callback) => {
                  db.run('DELETE FROM conditions WHERE patient_id = ?', patientId, callback);
                })
                  .then(() => {
                    console.log(`Deleted existing conditions for patient ${patientId}`);
                    resolveDelete();
                  })
                  .catch((err) => {
                    console.error(`Error deleting existing conditions for patient ${patientId}:`, err.message);
                    rejectDelete(err);
                  });
              }));
              
              // Delete existing medications
              promises.push(new Promise((resolveDelete, rejectDelete) => {
                executeWithRetry((callback) => {
                  db.run('DELETE FROM medications WHERE patient_id = ?', patientId, callback);
                })
                  .then(() => {
                    console.log(`Deleted existing medications for patient ${patientId}`);
                    resolveDelete();
                  })
                  .catch((err) => {
                    console.error(`Error deleting existing medications for patient ${patientId}:`, err.message);
                    rejectDelete(err);
                  });
              }));
              
              // Delete existing encounters
              promises.push(new Promise((resolveDelete, rejectDelete) => {
                executeWithRetry((callback) => {
                  db.run('DELETE FROM encounters WHERE patient_id = ?', patientId, callback);
                })
                  .then(() => {
                    console.log(`Deleted existing encounters for patient ${patientId}`);
                    resolveDelete();
                  })
                  .catch((err) => {
                    console.error(`Error deleting existing encounters for patient ${patientId}:`, err.message);
                    rejectDelete(err);
                  });
              }));
            }
          }

          // Insert conditions
          if (patientData.conditions.length > 0) {
            promises.push(new Promise((resolveConditions, rejectConditions) => {
              const stmt = db.prepare(`
                INSERT INTO conditions (patient_id, condition, condition_code, onset_date, abatement_date)
                VALUES (?, ?, ?, ?, ?)
              `);
              
              const conditionPromises = patientData.conditions.map(condition => {
                return executeWithRetry((callback) => {
                  stmt.run(
                    condition.patient_id,
                    condition.condition,
                    condition.condition_code,
                    condition.onset_date,
                    condition.abatement_date,
                    callback
                  );
                }).catch(err => {
                  console.error('Error inserting condition:', err.message);
                  // Don't reject the whole operation for a single condition error
                  return null;
                });
              });
              
              Promise.all(conditionPromises)
                .then(() => {
                  stmt.finalize();
                  resolveConditions();
                })
                .catch(err => {
                  rejectConditions(err);
                });
            }));
          }

          // Insert medications
          if (patientData.medications.length > 0) {
            promises.push(new Promise((resolveMedications, rejectMedications) => {
              const stmt = db.prepare(`
                INSERT INTO medications (patient_id, medication, medication_code, start_date, end_date, status, dosage)
                VALUES (?, ?, ?, ?, ?, ?, ?)
              `);
              
              const medicationPromises = patientData.medications.map(medication => {
                return executeWithRetry((callback) => {
                  stmt.run(
                    medication.patient_id,
                    medication.medication,
                    medication.medication_code,
                    medication.start_date,
                    medication.end_date,
                    medication.status,
                    medication.dosage,
                    callback
                  );
                }).catch(err => {
                  console.error('Error inserting medication:', err.message);
                  // Don't reject the whole operation for a single medication error
                  return null;
                });
              });
              
              Promise.all(medicationPromises)
                .then(() => {
                  stmt.finalize();
                  resolveMedications();
                })
                .catch(err => {
                  rejectMedications(err);
                });
            }));
          }

          // Insert encounters
          if (patientData.encounters.length > 0) {
            promises.push(new Promise((resolveEncounters, rejectEncounters) => {
              const stmt = db.prepare(`
                INSERT INTO encounters (patient_id, encounter_type, start_date, end_date)
                VALUES (?, ?, ?, ?)
              `);
              
              const encounterPromises = patientData.encounters.map(encounter => {
                return executeWithRetry((callback) => {
                  stmt.run(
                    encounter.patient_id,
                    encounter.encounter_type,
                    encounter.start_date,
                    encounter.end_date,
                    callback
                  );
                }).catch(err => {
                  console.error('Error inserting encounter:', err.message);
                  // Don't reject the whole operation for a single encounter error
                  return null;
                });
              });
              
              Promise.all(encounterPromises)
                .then(() => {
                  stmt.finalize();
                  resolveEncounters();
                })
                .catch(err => {
                  rejectEncounters(err);
                });
            }));
          }

          return Promise.all(promises);
        })
        .then(() => {
          return executeWithRetry((callback) => {
            db.run('COMMIT', callback);
          });
        })
        .then(() => {
          resolve();
        })
        .catch((err) => {
          console.error('Error in transaction:', err.message);
          executeWithRetry((callback) => {
            db.run('ROLLBACK', callback);
          })
            .then(() => {
              reject(err);
            })
            .catch((rollbackErr) => {
              console.error('Error rolling back transaction:', rollbackErr.message);
              reject(err); // Still reject with the original error
            });
        });
    });
  });
}

module.exports = {
  processPatientFile,
  insertPatientData
}; 