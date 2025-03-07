import {
  getPatientById,
  getConditionsByPatientId,
  getMedicationsByPatientId
} from '@/utils/database';
import { generatePatientChatResponse } from '@/utils/gemini';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Parse the request body to get the user's query
    const body = await request.json();
    const { query } = body;
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }
    
    // Get patient ID from params
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
    
    // Generate response using Gemini
    const response = await generatePatientChatResponse(
      patient,
      conditions,
      medications,
      query
    );
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error generating chat response:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
} 