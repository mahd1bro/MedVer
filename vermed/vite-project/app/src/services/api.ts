import { ProductLookup, SearchResult, VerifyRequest, VerifyResponse } from '@/types';
import { config } from '@/config/env';
import { CacheService } from './cache';
import { isOnline } from '@/utils/net';

export class ApiService {
  private static readonly CACHE_KEY_SEARCH = 'search_';
  private static readonly CACHE_KEY_VERIFY = 'verify_';
  private static readonly REQUEST_TIMEOUT = 12000; // 12 seconds
  private static readonly MAX_RETRIES = 2;

  /**
   * Generic HTTP request with timeout and retries
   */
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = 0
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

    try {
      const url = `${config.API_BASE_URL}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      // Retry on network errors
      if (retries < this.MAX_RETRIES && this.shouldRetry(error)) {
        const delay = Math.pow(2, retries) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest<T>(endpoint, options, retries + 1);
      }

      throw error;
    }
  }

  /**
   * Determine if error is retryable
   */
  private static shouldRetry(error: any): boolean {
    if (error.name === 'AbortError') return true;
    if (error.message.includes('network')) return true;
    if (error.message.includes('timeout')) return true;
    return false;
  }

  /**
   * Search for medicines
   */
  static async search(query: string): Promise<SearchResult[]> {
    const cacheKey = `${this.CACHE_KEY_SEARCH}${query}`;
    
    // Try cache first
    const cached = await CacheService.get<SearchResult[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const online = await isOnline();
      if (!online) {
        throw new Error('No internet connection');
      }

      const results = await this.makeRequest<SearchResult[]>(`/search?q=${encodeURIComponent(query)}`);
      await CacheService.set(cacheKey, results);
      return results;
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Failed to search medicines. Please check your connection and try again.');
    }
  }

  /**
   * Verify a medicine
   */
  static async verify(request: VerifyRequest): Promise<VerifyResponse> {
    const cacheKey = `${this.CACHE_KEY_VERIFY}${JSON.stringify(request)}`;
    
    // Try cache first
    const cached = await CacheService.get<VerifyResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const online = await isOnline();
      if (!online) {
        throw new Error('No internet connection');
      }

      const response = await this.makeRequest<VerifyResponse>('/verify', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      await CacheService.set(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Verify error:', error);
      throw new Error('Failed to verify medicine. Please check your connection and try again.');
    }
  }

  /**
   * Health check
   */
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      return await this.makeRequest('/health');
    } catch (error) {
      throw new Error('Service unavailable');
    }
  }
}