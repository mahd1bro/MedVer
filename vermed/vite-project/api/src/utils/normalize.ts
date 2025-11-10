/**
 * Normalization utilities for medicine search queries
 */

/**
 * Normalizes medicine search queries by removing extra whitespace and standardizing format
 */
export function normalizeQuery(query: string): string {
  return query
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/[^\w\s-]/g, ''); // Remove special characters except hyphens
}

/**
 * Extracts NAFDAC registration number from text using regex patterns
 */
export function extractNafdacRegNo(text: string): string | null {
  const patterns = [
    /(?:nafdac\s*reg\.?\s*no\.?\s*[:#]?\s*)([A-Z0-9-]+)/i,
    /(?:reg\.?\s*no\.?\s*[:#]?\s*)([A-Z0-9-]+)/i,
    /\b([A-Z]{2}\d{2,3}[A-Z]?\d{3,4})\b/ // Pattern like AB12C345
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim().toUpperCase();
    }
  }

  return null;
}

/**
 * Formats registration number for consistent storage and searching
 */
export function formatRegNo(regNo: string): string {
  return regNo.toUpperCase().replace(/\s+/g, '');
}

/**
 * Checks if a string looks like a barcode
 */
export function isBarcode(value: string): boolean {
  // Basic check for common barcode patterns (numeric, 8-13 digits)
  return /^\d{8,13}$/.test(value);
}

/**
 * Generates a unique ID for lookup requests
 */
export function generateLookupId(input: string, inputType: string): string {
  const timestamp = Date.now().toString();
  const hash = Buffer.from(`${input}-${inputType}-${timestamp}`).toString('base64');
  return hash.replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
}

/**
 * Sanitizes user input for safe processing
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 200); // Limit length
}

/**
 * Determines input type from the value
 */
export function determineInputType(value: string): 'barcode' | 'manual' | 'ocr' {
  if (isBarcode(value)) {
    return 'barcode';
  }
  
  if (extractNafdacRegNo(value)) {
    return 'manual'; // Registration number entered manually
  }
  
  return 'manual'; // Default to manual for text input
}