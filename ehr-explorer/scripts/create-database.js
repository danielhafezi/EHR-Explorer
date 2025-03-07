const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Create directories if they don't exist
const dbDir = path.join(__dirname, '..', 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create or open the database
const db = new sqlite3.Database(path.join(dbDir, 'ehr_explorer.db'));

// Run all database operations in a transaction
db.serialize(() => {
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Create patients table
  db.run(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      gender TEXT,
      birthDate TEXT,
      address TEXT,
      phone TEXT,
      marital_status TEXT
    )
  `);

  // Create conditions table
  db.run(`
    CREATE TABLE IF NOT EXISTS conditions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT NOT NULL,
      condition TEXT NOT NULL,
      condition_code TEXT,
      onset_date TEXT,
      abatement_date TEXT,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
  `);

  // Create medications table
  db.run(`
    CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT NOT NULL,
      medication TEXT NOT NULL,
      medication_code TEXT,
      start_date TEXT,
      end_date TEXT,
      status TEXT,
      dosage TEXT,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
  `);

  // Create encounters table
  db.run(`
    CREATE TABLE IF NOT EXISTS encounters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT NOT NULL,
      encounter_type TEXT,
      start_date TEXT,
      end_date TEXT,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )
  `);

  // Create indexes
  db.run('CREATE INDEX IF NOT EXISTS idx_patient_id ON patients(id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_condition_patient ON conditions(patient_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_medication_patient ON medications(patient_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_encounter_patient ON encounters(patient_id)');

  console.log('Database schema created successfully');
});

// Close the database connection
db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database connection closed');
  }
}); 