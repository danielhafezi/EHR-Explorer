import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import * as fs from 'fs';

interface SyntheaEntry {
  resource?: {
    resourceType: string;
  };
}

// Check if file is valid JSON
async function isValidJSON(buffer: Buffer): Promise<boolean> {
  try {
    const content = buffer.toString('utf-8');
    const data = JSON.parse(content);
    
    // Basic validation - check if it has the expected Synthea structure
    return data.resourceType === 'Bundle' && 
           Array.isArray(data.entry) && 
           data.entry.some((entry: SyntheaEntry) => entry.resource?.resourceType === 'Patient');
  } catch (error) {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.name.endsWith('.json')) {
      return NextResponse.json(
        { error: 'Only JSON files are allowed' },
        { status: 400 }
      );
    }

    // Read file content
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Validate JSON content
    const isValid = await isValidJSON(buffer);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid patient data format' },
        { status: 400 }
      );
    }

    // Determine the correct path for the data directory
    const projectRoot = process.cwd(); // This will be the ehr-explorer directory
    const parentDir = path.dirname(projectRoot); // Parent of ehr-explorer
    
    // Path to the data/synthea directory
    const dataDir = path.join(parentDir, 'data', 'synthea');
    console.log('Data directory path:', dataDir);
    
    // Ensure the synthea directory exists
    if (!fs.existsSync(path.join(parentDir, 'data'))) {
      fs.mkdirSync(path.join(parentDir, 'data'), { recursive: true });
    }
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Save the file to the synthea directory
    const filePath = path.join(dataDir, file.name);
    await writeFile(filePath, buffer);

    return NextResponse.json({ 
      success: true, 
      message: 'File uploaded successfully',
      fileName: file.name
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 