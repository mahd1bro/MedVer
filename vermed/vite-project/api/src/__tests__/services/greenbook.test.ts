import { GreenbookService } from '@/services/greenbook';
import { MemoryCache } from '@/utils/cache';

// Mock the cache
jest.mock('@/utils/cache', () => ({
  MemoryCache: {
    getInstance: jest.fn(() => ({
      get: jest.fn(),
      set: jest.fn(),
    })),
  },
}));

describe('GreenbookService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buildSearchLink', () => {
    it('should build search link correctly', () => {
      const link = GreenbookService.buildSearchLink('paracetamol');
      expect(link).toBe('https://www.nafdac.gov.ng/our-services/registered-products/?search=paracetamol');
    });

    it('should handle special characters in search', () => {
      const link = GreenbookService.buildSearchLink('medicine & drug');
      expect(link).toBe('https://www.nafdac.gov.ng/our-services/registered-products/?search=medicine%20%26%20drug');
    });
  });

  describe('buildRegNoLink', () => {
    it('should build registration number link correctly', () => {
      const link = GreenbookService.buildRegNoLink('04-1234');
      expect(link).toBe('https://www.nafdac.gov.ng/our-services/registered-products/?reg_no=04-1234');
    });

    it('should format registration number', () => {
      const link = GreenbookService.buildRegNoLink(' 04-1234  ');
      expect(link).toBe('https://www.nafdac.gov.ng/our-services/registered-products/?reg_no=04-1234');
    });
  });

  describe('search', () => {
    it('should search for medicines', async () => {
      const results = await GreenbookService.search('paracetamol');
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      
      if (results.length > 0) {
        expect(results[0]).toHaveProperty('title');
        expect(results[0]).toHaveProperty('status');
      }
    });

    it('should return empty array for no results', async () => {
      const results = await GreenbookService.search('nonexistent');
      expect(results).toEqual([]);
    });
  });

  describe('verifyByRegNo', () => {
    it('should verify valid registration number', async () => {
      const result = await GreenbookService.verifyByRegNo('04-1234');
      
      expect(result).toBeDefined();
      if (result) {
        expect(result.status).toBe('registered');
        expect(result.title).toBeDefined();
        expect(result.regNo).toBe('04-1234');
      }
    });

    it('should return null for invalid registration number', async () => {
      const result = await GreenbookService.verifyByRegNo('99-9999');
      expect(result).toBeNull();
    });
  });

  describe('verifyByName', () => {
    it('should verify valid medicine name', async () => {
      const result = await GreenbookService.verifyByName('paracetamol');
      
      expect(result).toBeDefined();
      if (result) {
        expect(result.status).toBe('registered');
        expect(result.title).toContain('Paracetamol');
      }
    });

    it('should return null for unknown medicine', async () => {
      const result = await GreenbookService.verifyByName('unknown medicine');
      expect(result).toBeNull();
    });
  });

  describe('healthCheck', () => {
    it('should return health status', async () => {
      const health = await GreenbookService.healthCheck();
      
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('responseTime');
      expect(['healthy', 'unhealthy']).toContain(health.status);
      expect(typeof health.responseTime).toBe('number');
    });
  });
});