/**
 * Normalizes medicine search queries by removing extra whitespace and standardizing format
 */
export function normalizeQuery(query: string): string {
  return query
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
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
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Formats registration number for display
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
 * Formats timestamp for display
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Truncates text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}