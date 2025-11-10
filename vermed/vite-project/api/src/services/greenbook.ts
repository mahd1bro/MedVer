import { MemoryCache } from '@/utils/cache';
import { Logger } from '@/utils/logger';
import { GreenbookProduct } from '@/types';

const GREENBOOK_BASE_URL = 'https://www.nafdac.gov.ng';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const REQUEST_TIMEOUT_MS = 10000; // 10 seconds

/**
 * NAFDAC Greenbook service for medicine verification
 */
export class GreenbookService {
  private static cache = MemoryCache.getInstance();

  /**
   * Build deterministic deep-link for Greenbook search
   */
  static buildSearchLink(query: string): string {
    const encodedQuery = encodeURIComponent(query.trim());
    return `${GREENBOOK_BASE_URL}/our-services/registered-products/?search=${encodedQuery}`;
  }

  /**
   * Build deep-link for specific registration number
   */
  static buildRegNoLink(regNo: string): string {
    const formattedRegNo = regNo.toUpperCase().replace(/\s+/g, '');
    return `${GREENBOOK_BASE_URL}/our-services/registered-products/?reg_no=${formattedRegNo}`;
  }

  /**
   * Search for medicines in Greenbook
   */
  static async search(query: string): Promise<GreenbookProduct[]> {
    const cacheKey = `search:${query}`;
    
    // Try cache first
    const cached = this.cache.get<GreenbookProduct[]>(cacheKey);
    if (cached) {
      Logger.debug('Cache hit for search', { query });
      return cached;
    }

    try {
      Logger.info('Searching Greenbook', { query });
      
      // For MVP, return mock data
      // In production, this would scrape or use official API
      const results = await this.mockSearch(query);
      
      // Cache results
      this.cache.set(cacheKey, results, CACHE_TTL_MS);
      
      Logger.info('Greenbook search completed', { query, resultCount: results.length });
      return results;
    } catch (error) {
      Logger.error('Greenbook search failed', error as Error);
      return [];
    }
  }

  /**
   * Verify medicine by registration number
   */
  static async verifyByRegNo(regNo: string): Promise<GreenbookProduct | null> {
    const cacheKey = `verify:${regNo}`;
    
    // Try cache first
    const cached = this.cache.get<GreenbookProduct>(cacheKey);
    if (cached) {
      Logger.debug('Cache hit for verification', { regNo });
      return cached;
    }

    try {
      Logger.info('Verifying medicine by Reg No', { regNo });
      
      // For MVP, return mock data
      // In production, this would scrape or use official API
      const result = await this.mockVerify(regNo);
      
      if (result) {
        // Cache result
        this.cache.set(cacheKey, result, CACHE_TTL_MS);
      }
      
      Logger.info('Reg No verification completed', { regNo, found: !!result });
      return result;
    } catch (error) {
      Logger.error('Reg No verification failed', error as Error);
      return null;
    }
  }

  /**
   * Verify medicine by name
   */
  static async verifyByName(name: string): Promise<GreenbookProduct | null> {
    const cacheKey = `verify_name:${name}`;
    
    // Try cache first
    const cached = this.cache.get<GreenbookProduct>(cacheKey);
    if (cached) {
      Logger.debug('Cache hit for name verification', { name });
      return cached;
    }

    try {
      Logger.info('Verifying medicine by name', { name });
      
      // For MVP, return mock data
      const result = await this.mockVerifyByName(name);
      
      if (result) {
        // Cache result
        this.cache.set(cacheKey, result, CACHE_TTL_MS);
      }
      
      Logger.info('Name verification completed', { name, found: !!result });
      return result;
    } catch (error) {
      Logger.error('Name verification failed', error as Error);
      return null;
    }
  }

  /**
   * Mock search for MVP development
   */
  private static async mockSearch(query: string): Promise<GreenbookProduct[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const normalizedQuery = query.toLowerCase();
    const mockDatabase = [
      {
        title: 'Paracetamol 500mg Tablets',
        regNo: '04-1234',
        manufacturer: 'May & Baker Nigeria Plc',
        category: 'Analgesic',
        status: 'registered' as const,
        link: this.buildRegNoLink('04-1234'),
      },
      {
        title: 'Amoxicillin 500mg Capsules',
        regNo: '04-5678',
        manufacturer: 'GlaxoSmithKline Nigeria',
        category: 'Antibiotic',
        status: 'registered' as const,
        link: this.buildRegNoLink('04-5678'),
      },
      {
        title: 'Ibuprofen 400mg Tablets',
        regNo: '04-9012',
        manufacturer: 'Pfizer Nigeria',
        category: 'Anti-inflammatory',
        status: 'registered' as const,
        link: this.buildRegNoLink('04-9012'),
      },
      {
        title: 'Vitamin C 500mg Tablets',
        regNo: '04-3456',
        manufacturer: 'Emzor Pharmaceutical Industries',
        category: 'Vitamin Supplement',
        status: 'registered' as const,
        link: this.buildRegNoLink('04-3456'),
      },
    ];

    return mockDatabase.filter(product => 
      product.title.toLowerCase().includes(normalizedQuery) ||
      product.regNo.toLowerCase().includes(normalizedQuery) ||
      product.manufacturer.toLowerCase().includes(normalizedQuery)
    );
  }

  /**
   * Mock verification by registration number
   */
  private static async mockVerify(regNo: string): Promise<GreenbookProduct | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

    const validRegNos = ['04-1234', '04-5678', '04-9012', '04-3456'];
    const normalizedRegNo = regNo.toUpperCase().replace(/\s+/g, '');

    if (validRegNos.includes(normalizedRegNo)) {
      const mockDatabase: Record<string, GreenbookProduct> = {
        '04-1234': {
          title: 'Paracetamol 500mg Tablets',
          regNo: '04-1234',
          manufacturer: 'May & Baker Nigeria Plc',
          category: 'Analgesic',
          status: 'registered',
          link: this.buildRegNoLink('04-1234'),
        },
        '04-5678': {
          title: 'Amoxicillin 500mg Capsules',
          regNo: '04-5678',
          manufacturer: 'GlaxoSmithKline Nigeria',
          category: 'Antibiotic',
          status: 'registered',
          link: this.buildRegNoLink('04-5678'),
        },
        '04-9012': {
          title: 'Ibuprofen 400mg Tablets',
          regNo: '04-9012',
          manufacturer: 'Pfizer Nigeria',
          category: 'Anti-inflammatory',
          status: 'registered',
          link: this.buildRegNoLink('04-9012'),
        },
        '04-3456': {
          title: 'Vitamin C 500mg Tablets',
          regNo: '04-3456',
          manufacturer: 'Emzor Pharmaceutical Industries',
          category: 'Vitamin Supplement',
          status: 'registered',
          link: this.buildRegNoLink('04-3456'),
        },
      };

      return mockDatabase[normalizedRegNo] || null;
    }

    return null;
  }

  /**
   * Mock verification by name
   */
  private static async mockVerifyByName(name: string): Promise<GreenbookProduct | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

    const normalized = name.toLowerCase();
    
    if (normalized.includes('paracetamol')) {
      return {
        title: 'Paracetamol 500mg Tablets',
        regNo: '04-1234',
        manufacturer: 'May & Baker Nigeria Plc',
        category: 'Analgesic',
        status: 'registered',
        link: this.buildRegNoLink('04-1234'),
      };
    }

    if (normalized.includes('amoxicillin')) {
      return {
        title: 'Amoxicillin 500mg Capsules',
        regNo: '04-5678',
        manufacturer: 'GlaxoSmithKline Nigeria',
        category: 'Antibiotic',
        status: 'registered',
        link: this.buildRegNoLink('04-5678'),
      };
    }

    if (normalized.includes('ibuprofen')) {
      return {
        title: 'Ibuprofen 400mg Tablets',
        regNo: '04-9012',
        manufacturer: 'Pfizer Nigeria',
        category: 'Anti-inflammatory',
        status: 'registered',
        link: this.buildRegNoLink('04-9012'),
      };
    }

    return null;
  }

  /**
   * Get health status of Greenbook service
   */
  static async healthCheck(): Promise<{ status: string; responseTime: number }> {
    const startTime = Date.now();
    
    try {
      // For MVP, just check if we can build URLs
      const testLink = this.buildSearchLink('test');
      const responseTime = Date.now() - startTime;
      
      return {
        status: testLink ? 'healthy' : 'unhealthy',
        responseTime,
      };
    } catch (error) {
      Logger.error('Greenbook health check failed', error as Error);
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
      };
    }
  }
}