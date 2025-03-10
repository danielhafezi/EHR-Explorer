import { getPatients, searchPatientsByName } from '@/utils/database';
import { formatPatientName } from '@/utils/formatters';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');

    let patients;
    if (search) {
      patients = await searchPatientsByName(search);
    } else {
      patients = await getPatients();
    }

    // Add formatted names to the response
    const patientsWithFormattedNames = patients.map(patient => ({
      ...patient,
      formattedName: formatPatientName(patient.name)
    }));

    return NextResponse.json({ patients: patientsWithFormattedNames });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
} 