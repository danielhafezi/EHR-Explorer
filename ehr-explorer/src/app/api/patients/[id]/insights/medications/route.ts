import { getPatientById, getMedicationsByPatientId } from '@/utils/database';
import { generateMedicationInsights } from '@/utils/gemini';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Await params before accessing its properties
    const resolvedParams = await params;
    const patientId = resolvedParams.id;
    
    // Get patient data
    const patient = await getPatientById(patientId);
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    // Get medications data
    const medications = await getMedicationsByPatientId(patientId);
    if (medications.length === 0) {
      return NextResponse.json({
        insights: "This patient doesn't have any medication records to analyze."
      });
    }
    
    // Generate insights using Gemini
    const insights = await generateMedicationInsights(patient, medications);
    
    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error generating medication insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate medication insights' },
      { status: 500 }
    );
  }
} 