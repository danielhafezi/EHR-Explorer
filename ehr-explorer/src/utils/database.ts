import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

// Define types for our database models
export interface Patient {
  id: string;
  name: string;
  gender: string | null;
  birthDate: string | null;
  address: string | null;
  phone: string | null;
  marital_status: string | null;
}

export interface Condition {
  id: number;
  patient_id: string;
  condition: string;
  condition_code: string | null;
  onset_date: string | null;
  abatement_date: string | null;
}

export interface Medication {
  id: number;
  patient_id: string;
  medication: string;
  medication_code: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  dosage: string | null;
}

export interface Encounter {
  id: number;
  patient_id: string;
  encounter_type: string | null;
  start_date: string | null;
  end_date: string | null;
}

// Singleton database connection
let db: Database | null = null;

/**
 * Get the database connection, creating it if it doesn't exist
 */
export async function getDB(): Promise<Database> {
  if (db) return db;

  // Ensure the db directory exists
  const dbDir = path.join(process.cwd(), 'db');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'ehr_explorer.db');
  
  // Open the database
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  
  // Enable foreign keys
  await db.exec('PRAGMA foreign_keys = ON');
  
  return db;
}

/**
 * Get all patients
 */
export async function getPatients(): Promise<Patient[]> {
  const db = await getDB();
  return db.all<Patient[]>('SELECT * FROM patients ORDER BY name');
}

/**
 * Get a single patient by ID
 */
export async function getPatientById(id: string): Promise<Patient | undefined> {
  const db = await getDB();
  return db.get<Patient>('SELECT * FROM patients WHERE id = ?', id);
}

/**
 * Get conditions for a specific patient
 */
export async function getConditionsByPatientId(patientId: string): Promise<Condition[]> {
  const db = await getDB();
  return db.all<Condition[]>(
    'SELECT * FROM conditions WHERE patient_id = ? ORDER BY onset_date',
    patientId
  );
}

/**
 * Get medications for a specific patient
 */
export async function getMedicationsByPatientId(patientId: string): Promise<Medication[]> {
  const db = await getDB();
  return db.all<Medication[]>(
    'SELECT * FROM medications WHERE patient_id = ? ORDER BY start_date',
    patientId
  );
}

/**
 * Get encounters for a specific patient
 */
export async function getEncountersByPatientId(patientId: string): Promise<Encounter[]> {
  const db = await getDB();
  return db.all<Encounter[]>(
    'SELECT * FROM encounters WHERE patient_id = ? ORDER BY start_date',
    patientId
  );
}

/**
 * Get medication count for a specific patient
 */
export async function getMedicationCountByPatientId(patientId: string): Promise<number> {
  const db = await getDB();
  const result = await db.get<{ count: number }>(
    'SELECT COUNT(*) as count FROM medications WHERE patient_id = ?',
    patientId
  );
  return result?.count || 0;
}

/**
 * Get condition count for a specific patient
 */
export async function getConditionCountByPatientId(patientId: string): Promise<number> {
  const db = await getDB();
  const result = await db.get<{ count: number }>(
    'SELECT COUNT(*) as count FROM conditions WHERE patient_id = ?',
    patientId
  );
  return result?.count || 0;
}

/**
 * Get encounter count for a specific patient
 */
export async function getEncounterCountByPatientId(patientId: string): Promise<number> {
  const db = await getDB();
  const result = await db.get<{ count: number }>(
    'SELECT COUNT(*) as count FROM encounters WHERE patient_id = ?',
    patientId
  );
  return result?.count || 0;
}

/**
 * Search patients by name
 */
export async function searchPatientsByName(query: string): Promise<Patient[]> {
  const db = await getDB();
  return db.all<Patient[]>(
    'SELECT * FROM patients WHERE name LIKE ? ORDER BY name LIMIT 20',
    `%${query}%`
  );
} 