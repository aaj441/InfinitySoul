/**
 * Tests for Cache module
 * Verifies caching behavior and TTL expiration
 */

import { ScanCache, CacheKeys } from "../../backend/cyber/cache";

describe("ScanCache", () => {
  let cache: ScanCache;

  beforeEach(() => {
    cache = new ScanCache(10); // Small cache for testing
  });

  afterEach(() => {
    cache.clear();
  });

  test("should store and retrieve values", () => {
    cache.set("test-key", "test-value", 1000);
    const value = cache.get<string>("test-key");
    expect(value).toBe("test-value");
  });

  test("should return undefined for non-existent keys", () => {
    const value = cache.get<string>("non-existent");
    expect(value).toBeUndefined();
  });

  test("should expire values after TTL", async () => {
    cache.set("short-lived", "value", 100); // 100ms TTL
    
    // Should exist immediately
    expect(cache.get<string>("short-lived")).toBe("value");
    
    // Wait for expiration
    await new Promise((resolve) => setTimeout(resolve, 150));
    
    // Should be expired
    expect(cache.get<string>("short-lived")).toBeUndefined();
  });

  test("should handle LRU eviction when cache is full", () => {
    // Fill cache to capacity
    for (let i = 0; i < 10; i++) {
      cache.set(`key-${i}`, `value-${i}`, 10000);
    }
    
    // Cache should be full
    expect(cache.getStats().size).toBe(10);
    
    // Adding one more should evict the oldest
    cache.set("key-11", "value-11", 10000);
    
    // Size should still be 10
    expect(cache.getStats().size).toBe(10);
    
    // First key should be evicted
    expect(cache.get<string>("key-0")).toBeUndefined();
    
    // New key should exist
    expect(cache.get<string>("key-11")).toBe("value-11");
  });

  test("should clear all entries", () => {
    cache.set("key1", "value1", 1000);
    cache.set("key2", "value2", 1000);
    
    expect(cache.getStats().size).toBe(2);
    
    cache.clear();
    
    expect(cache.getStats().size).toBe(0);
    expect(cache.get<string>("key1")).toBeUndefined();
    expect(cache.get<string>("key2")).toBeUndefined();
  });

  test("should cleanup expired entries", async () => {
    cache.set("short-1", "value1", 100);
    cache.set("short-2", "value2", 100);
    cache.set("long", "value3", 10000);
    
    expect(cache.getStats().size).toBe(3);
    
    // Wait for short-lived entries to expire
    await new Promise((resolve) => setTimeout(resolve, 150));
    
    // Run cleanup
    cache.cleanup();
    
    // Only long-lived entry should remain
    expect(cache.getStats().size).toBe(1);
    expect(cache.get<string>("long")).toBe("value3");
  });

  test("should generate correct cache keys", () => {
    const dnsKey = CacheKeys.dns("example.com");
    expect(dnsKey).toBe("dns:example.com");
    
    const httpKey = CacheKeys.httpCheck("http://example.com");
    expect(httpKey).toBe("http:http://example.com");
    
    const httpsKey = CacheKeys.httpsCheck("https://example.com");
    expect(httpsKey).toBe("https:https://example.com");
    
    const portKey = CacheKeys.portScan("93.184.216.34", 443);
    expect(portKey).toBe("port:93.184.216.34:443");
  });

  test("should return cache statistics", () => {
    cache.set("key1", "value1", 1000);
    cache.set("key2", "value2", 1000);
    
    const stats = cache.getStats();
    expect(stats.size).toBe(2);
    expect(stats.maxSize).toBe(10);
  });
});
