import {
  normalizeQuery,
  extractNafdacRegNo,
  formatRegNo,
  isBarcode,
  generateLookupId,
  sanitizeInput,
  determineInputType,
} from '@/utils/normalize';

describe('Normalize Utils', () => {
  describe('normalizeQuery', () => {
    it('should normalize text queries', () => {
      expect(normalizeQuery('  PARACETAMOL  500MG  ')).toBe('paracetamol 500mg');
      expect(normalizeQuery('Medicine-Name')).toBe('medicinename');
      expect(normalizeQuery('Special@#$%Chars')).toBe('specialchars');
    });

    it('should handle empty strings', () => {
      expect(normalizeQuery('')).toBe('');
      expect(normalizeQuery('   ')).toBe('');
    });
  });

  describe('extractNafdacRegNo', () => {
    it('should extract registration numbers', () => {
      expect(extractNafdacRegNo('NAFDAC Reg. No.: 04-1234')).toBe('04-1234');
      expect(extractNafdacRegNo('Reg. No: AB12C345')).toBe('AB12C345');
      expect(extractNafdacRegNo('Product AB12C345 info')).toBe('AB12C345');
    });

    it('should return null for invalid patterns', () => {
      expect(extractNafdacRegNo('No registration here')).toBeNull();
      expect(extractNafdacRegNo('')).toBeNull();
    });
  });

  describe('formatRegNo', () => {
    it('should format registration numbers', () => {
      expect(formatRegNo('ab12c345')).toBe('AB12C345');
      expect(formatRegNo(' 04-1234  ')).toBe('04-1234');
    });
  });

  describe('isBarcode', () => {
    it('should identify valid barcodes', () => {
      expect(isBarcode('1234567890123')).toBe(true);
      expect(isBarcode('12345678')).toBe(true);
    });

    it('should reject invalid barcodes', () => {
      expect(isBarcode('1234567')).toBe(false);
      expect(isBarcode('12345678901234')).toBe(false);
      expect(isBarcode('abcd1234')).toBe(false);
    });
  });

  describe('generateLookupId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateLookupId('test', 'manual');
      const id2 = generateLookupId('test', 'barcode');
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(id1.length).toBe(16);
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize user input', () => {
      expect(sanitizeInput('  <script>alert("xss")</script>  ')).toBe('alert("xss")');
      expect(sanitizeInput('Normal text')).toBe('Normal text');
      expect(sanitizeInput('A'.repeat(300))).toHaveLength(200);
    });
  });

  describe('determineInputType', () => {
    it('should determine input types correctly', () => {
      expect(determineInputType('1234567890123')).toBe('barcode');
      expect(determineInputType('NAFDAC Reg. No.: 04-1234')).toBe('manual');
      expect(determineInputType('Paracetamol')).toBe('manual');
    });
  });
});