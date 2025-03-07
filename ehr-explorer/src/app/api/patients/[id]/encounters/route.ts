import { getEncountersByPatientId } from '@/utils/database';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const patientId = resolvedParams.id;
    
    const encounters = await getEncountersByPatientId(patientId);
    
    return NextResponse.json({ encounters });
  } catch (error) {
    console.error('Error fetching encounters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch encounters' },
      { status: 500 }
    );
  }
} 