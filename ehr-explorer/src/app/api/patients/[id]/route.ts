import {
  getPatientById,
  getConditionCountByPatientId,
  getMedicationCountByPatientId,
  getEncounterCountByPatientId
} from '@/utils/database';
import { formatPatientName } from '@/utils/formatters';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Await params before accessing its properties
    const resolvedParams = await params;
    const patientId = resolvedParams.id;
    
    const patient = await getPatientById(patientId);
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    // Get counts for summary statistics
    const medicationCount = await getMedicationCountByPatientId(patientId);
    const conditionCount = await getConditionCountByPatientId(patientId);
    const encounterCount = await getEncounterCountByPatientId(patientId);
    
    // Add formatted name to the patient object
    const patientWithFormattedName = {
      ...patient,
      formattedName: formatPatientName(patient.name)
    };
    
    return NextResponse.json({
      patient: patientWithFormattedName,
      summary: {
        medicationCount,
        conditionCount,
        encounterCount
      }
    });
  } catch (error) {
    console.error('Error fetching patient details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient details' },
      { status: 500 }
    );
  }
} 