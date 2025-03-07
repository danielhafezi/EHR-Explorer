import { NextRequest, NextResponse } from 'next/server';
import EventEmitter from 'events';

// Declare the global type
declare global {
  var dataChangeEmitter: EventEmitter | undefined;
}

// Create a global event emitter that persists between API calls
if (!global.dataChangeEmitter) {
  global.dataChangeEmitter = new EventEmitter();
}

const emitter = global.dataChangeEmitter;

// Function to emit data change events
export function notifyDataChange() {
  emitter.emit('data-change', { timestamp: new Date().toISOString() });
}

export async function GET(request: NextRequest) {
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  
  // Define the handler for data change events
  const changeHandler = (data: any) => {
    const event = `data: ${JSON.stringify(data)}\n\n`;
    writer.write(new TextEncoder().encode(event));
  };
  
  // Register the event handler
  emitter.on('data-change', changeHandler);
  
  // Remove the event handler when the connection is closed
  request.signal.addEventListener('abort', () => {
    emitter.off('data-change', changeHandler);
  });
  
  // Write the initial header
  writer.write(new TextEncoder().encode(': ping\n\n'));
  
  // Return a streaming response
  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
} 