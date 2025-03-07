/**
 * Client-side utility functions for formatting data
 */

/**
 * Format a patient name by removing numbers
 */
export function formatPatientName(name: string): string {
  // Split the name into parts (typically first and last name)
  const nameParts = name.split(' ');
  
  // Remove numbers from each part and join back with a space
  const formattedParts = nameParts.map(part => 
    part.replace(/\d+/g, '')
  );
  
  return formattedParts.join(' ').trim();
} 