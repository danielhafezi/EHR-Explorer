import { getConditionsByPatientId } from '@/utils/database';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const patientId = resolvedParams.id;
    
    const conditions = await getConditionsByPatientId(patientId);
    
    return NextResponse.json({ conditions });
  } catch (error) {
    console.error('Error fetching conditions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conditions' },
      { status: 500 }
    );
  }
} 