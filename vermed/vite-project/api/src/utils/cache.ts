import { CacheEntry } from '@/types';

/**
 * Simple in-memory cache with TTL support
 */
export class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private static instance: MemoryCache;

  static getInstance(): MemoryCache {
    if (!MemoryCache.instance) {
      MemoryCache.instance = new MemoryCache();
    }
    return MemoryCache.instance;
  }

  /**
   * Store data with TTL
   */
  set<T>(key: string, data: T, ttlMs: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    };

    this.cache.set(key, entry);
  }

  /**
   * Get data if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Remove specific cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// File-based cache for persistence (optional)
export class FileCache {
  private cacheDir: string;
  private static instance: FileCache;

  constructor(cacheDir = './cache') {
    this.cacheDir = cacheDir;
    this.ensureCacheDir();
  }

  static getInstance(cacheDir?: string): FileCache {
    if (!FileCache.instance) {
      FileCache.instance = new FileCache(cacheDir);
    }
    return FileCache.instance;
  }

  private ensureCacheDir(): void {
    try {
      // In a real implementation, you'd use fs.mkdirSync
      // For now, this is a placeholder
      console.log(`Cache directory: ${this.cacheDir}`);
    } catch (error) {
      console.error('Failed to create cache directory:', error);
    }
  }

  /**
   * Store data to file with TTL
   */
  async set<T>(key: string, data: T, ttlMs: number): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    };

    // In a real implementation, you'd write to file system
    console.log(`Cache set: ${key}`);
  }

  /**
   * Get data from file if not expired
   */
  async get<T>(key: string): Promise<T | null> {
    // In a real implementation, you'd read from file system
    console.log(`Cache get: ${key}`);
    return null;
  }

  /**
   * Clear file cache
   */
  async clear(): Promise<void> {
    console.log('File cache cleared');
  }
}