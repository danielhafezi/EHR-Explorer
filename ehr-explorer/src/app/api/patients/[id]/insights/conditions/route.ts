import { getPatientById, getConditionsByPatientId } from '@/utils/database';
import { generateConditionInsights } from '@/utils/gemini';
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
    
    // Get conditions data
    const conditions = await getConditionsByPatientId(patientId);
    if (conditions.length === 0) {
      return NextResponse.json({
        insights: "This patient doesn't have any condition records to analyze."
      });
    }
    
    // Generate insights using Gemini
    const insights = await generateConditionInsights(patient, conditions);
    
    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error generating condition insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate condition insights' },
      { status: 500 }
    );
  }
} 