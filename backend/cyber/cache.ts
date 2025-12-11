/**
 * Simple In-Memory Cache for Cyber Scan Results
 * Implements 24hr TTL for DNS and certificate data to avoid redundant lookups
 * 
 * Note: This is an in-memory LRU cache. For production at scale,
 * consider Redis or similar distributed cache.
 */

import { CyberScanConfig } from "../../config/cyber";
import { CacheError } from "./errors";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class ScanCache {
  private cache: Map<string, CacheEntry<unknown>>;
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  /**
   * Get a value from cache
   * Returns undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    if (!CyberScanConfig.cache.enabled) {
      return undefined;
    }

    try {
      const entry = this.cache.get(key) as CacheEntry<T> | undefined;
      
      if (!entry) {
        return undefined;
      }

      // Check if expired
      if (Date.now() > entry.expiresAt) {
        this.cache.delete(key);
        return undefined;
      }

      return entry.value;
    } catch (error) {
      throw new CacheError(key, "get", error as Error);
    }
  }

  /**
   * Set a value in cache with TTL
   */
  set<T>(key: string, value: T, ttl: number): void {
    if (!CyberScanConfig.cache.enabled) {
      return;
    }

    try {
      // Implement simple LRU: if cache is full, remove oldest entry
      if (this.cache.size >= this.maxSize) {
        const firstKey = this.cache.keys().next().value;
        if (firstKey) {
          this.cache.delete(firstKey);
        }
      }

      const expiresAt = Date.now() + ttl;
      this.cache.set(key, { value, expiresAt });
    } catch (error) {
      throw new CacheError(key, "set", error as Error);
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }

  /**
   * Remove expired entries (garbage collection)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const scanCache = new ScanCache();

// Schedule periodic cleanup every hour
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    scanCache.cleanup();
  }, 60 * 60 * 1000);
}

/**
 * Helper to generate cache keys
 */
export const CacheKeys = {
  dns: (domain: string) => `dns:${domain}`,
  httpCheck: (url: string) => `http:${url}`,
  httpsCheck: (url: string) => `https:${url}`,
  portScan: (host: string, port: number) => `port:${host}:${port}`,
} as const;
