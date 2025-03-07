import {
  getPatientById,
  getConditionsByPatientId,
  getMedicationsByPatientId
} from '@/utils/database';
import { generateComprehensiveInsights } from '@/utils/gemini';
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
    
    // Get medications and conditions data
    const medications = await getMedicationsByPatientId(patientId);
    const conditions = await getConditionsByPatientId(patientId);
    
    if (medications.length === 0 && conditions.length === 0) {
      return NextResponse.json({
        insights: "This patient doesn't have any medication or condition records to analyze."
      });
    }
    
    // Generate comprehensive insights using Gemini
    const insights = await generateComprehensiveInsights(patient, conditions, medications);
    
    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error generating comprehensive insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate comprehensive insights' },
      { status: 500 }
    );
  }
} 