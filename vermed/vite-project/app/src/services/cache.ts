import AsyncStorage from '@react-native-async-storage/async-storage';
import { CacheEntry } from '@/types';
import { config } from '@/config/env';

const CACHE_PREFIX = 'vermed_cache_';
const RECENTS_KEY = 'vermed_recents';
const MAX_RECENTS = 20;

/**
 * Generic cache service with TTL support
 */
export class CacheService {
  /**
   * Store data with TTL
   */
  static async set<T>(key: string, data: T, ttlHours: number = config.CACHE_TTL_HOURS): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlHours * 60 * 60 * 1000 // Convert to milliseconds
    };

    try {
      await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Get data if not expired
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!value) return null;

      const entry: CacheEntry<T> = JSON.parse(value);
      const now = Date.now();

      // Check if expired
      if (now - entry.timestamp > entry.ttl) {
        await this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Remove specific cache entry
   */
  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }

  /**
   * Clear all cache
   */
  static async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

/**
 * Recent lookups management
 */
export class RecentsService {
  /**
   * Add item to recent lookups
   */
  static async add(item: any): Promise<void> {
    try {
      const recents = await this.getAll();
      const updatedRecents = [item, ...recents.filter((r: any) => r.id !== item.id)].slice(0, MAX_RECENTS);
      await AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(updatedRecents));
    } catch (error) {
      console.error('Recents add error:', error);
    }
  }

  /**
   * Get all recent lookups
   */
  static async getAll(): Promise<any[]> {
    try {
      const value = await AsyncStorage.getItem(RECENTS_KEY);
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Recents get error:', error);
      return [];
    }
  }

  /**
   * Clear recent lookups
   */
  static async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(RECENTS_KEY);
    } catch (error) {
      console.error('Recents clear error:', error);
    }
  }
}