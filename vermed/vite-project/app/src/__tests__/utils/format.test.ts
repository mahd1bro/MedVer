import {
  normalizeQuery,
  extractNafdacRegNo,
  formatRegNo,
  isBarcode,
  formatTimestamp,
  truncateText,
} from '@/utils/format';

describe('Format Utils', () => {
  describe('normalizeQuery', () => {
    it('should trim whitespace and normalize case', () => {
      expect(normalizeQuery('  PARACETAMOL  ')).toBe('paracetamol');
      expect(normalizeQuery('  Medicine  Name  ')).toBe('medicine name');
    });

    it('should collapse multiple spaces', () => {
      expect(normalizeQuery('Paracetamol    500mg')).toBe('paracetamol 500mg');
    });

    it('should handle empty strings', () => {
      expect(normalizeQuery('')).toBe('');
      expect(normalizeQuery('   ')).toBe('');
    });
  });

  describe('extractNafdacRegNo', () => {
    it('should extract NAFDAC registration numbers', () => {
      expect(extractNafdacRegNo('NAFDAC Reg. No.: 04-1234')).toBe('04-1234');
      expect(extractNafdacRegNo('Reg. No: AB12C345')).toBe('AB12C345');
      expect(extractNafdacRegNo('Product with AB12C345 registration')).toBe('AB12C345');
    });

    it('should return null for non-matching patterns', () => {
      expect(extractNafdacRegNo('No registration here')).toBeNull();
      expect(extractNafdacRegNo('')).toBeNull();
    });
  });

  describe('formatRegNo', () => {
    it('should format registration number consistently', () => {
      expect(formatRegNo('ab12c345')).toBe('AB12C345');
      expect(formatRegNo(' 04-1234  ')).toBe('04-1234');
    });
  });

  describe('isBarcode', () => {
    it('should identify valid barcodes', () => {
      expect(isBarcode('1234567890123')).toBe(true); // 13 digits
      expect(isBarcode('12345678')).toBe(true); // 8 digits
    });

    it('should reject invalid barcodes', () => {
      expect(isBarcode('1234567')).toBe(false); // Too short
      expect(isBarcode('12345678901234')).toBe(false); // Too long
      expect(isBarcode('abcd1234')).toBe(false); // Contains letters
    });
  });

  describe('formatTimestamp', () => {
    it('should format timestamp for display', () => {
      const timestamp = '2024-01-15T10:30:00Z';
      const formatted = formatTimestamp(timestamp);
      expect(formatted).toMatch(/\d{2} \w{3} \d{4}, \d{2}:\d{2}/);
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const longText = 'This is a very long text that should be truncated';
      expect(truncateText(longText, 20)).toBe('This is a very lo...');
    });

    it('should return short text unchanged', () => {
      const shortText = 'Short text';
      expect(truncateText(shortText, 20)).toBe('Short text');
    });
  });
});