import { NextRequest, NextResponse } from 'next/server';
import { notifyDataChange } from '../data-events/route';

export async function POST(request: NextRequest) {
  try {
    // Emit the data change event
    notifyDataChange();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing data change notification:', error);
    return NextResponse.json(
      { error: 'Failed to process data change notification' },
      { status: 500 }
    );
  }
} 