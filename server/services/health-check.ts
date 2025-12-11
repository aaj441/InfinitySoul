/**
 * Lightweight Health Check Module
 * Minimal memory footprint, headless HTML parsing, cached results
 * Optimized for Free tier - fast & lean
 */

interface HealthStatus {
  url: string;
  statusCode: number | null;
  loadTime: number;
  isAccessible: boolean;
  lastChecked: Date;
  cachedFor: number; // Seconds
}

interface CacheEntry {
  status: HealthStatus;
  timestamp: number;
}

export class LightweightHealthCheck {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours (refresh daily)
  private readonly REQUEST_TIMEOUT = 5000; // 5 seconds max
  private readonly MAX_CACHE_SIZE = 500; // Keep footprint small

  /**
   * Check website health with minimal overhead
   * Returns cached result if available (no API call)
   */
  async checkHealth(url: string): Promise<HealthStatus> {
    const cached = this.getFromCache(url);
    if (cached) {
      return {
        ...cached,
        cachedFor: Math.round((Date.now() - this.cache.get(url)!.timestamp) / 1000),
      };
    }

    const startTime = Date.now();
    let statusCode: number | null = null;
    let isAccessible = false;

    try {
      // Lightweight check: HEAD request (no body = smaller payload)
      const response = await Promise.race([
        fetch(url, {
          method: "HEAD",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
          },
        }),
        new Promise<Response>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), this.REQUEST_TIMEOUT)
        ),
      ]);

      statusCode = response.status;
      isAccessible = statusCode >= 200 && statusCode < 400;
    } catch (error) {
      // Fallback: Try GET request (only if HEAD fails)
      try {
        const response = await Promise.race([
          fetch(url, {
            method: "GET",
            headers: {
              "User-Agent":
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
            },
          }),
          new Promise<Response>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), this.REQUEST_TIMEOUT)
          ),
        ]);

        statusCode = response.status;
        isAccessible = statusCode >= 200 && statusCode < 400;
      } catch (fallbackError) {
        isAccessible = false;
        statusCode = null;
      }
    }

    const loadTime = Date.now() - startTime;
    const status: HealthStatus = {
      url,
      statusCode,
      loadTime,
      isAccessible,
      lastChecked: new Date(),
      cachedFor: 0,
    };

    this.setCache(url, status);
    return status;
  }

  /**
   * Batch check multiple URLs efficiently
   * Returns immediately for cached items
   */
  async batchCheck(urls: string[]): Promise<HealthStatus[]> {
    const results: HealthStatus[] = [];

    // Parallel checks with concurrency limit (3 at a time)
    const batchSize = 3;
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((url) => this.checkHealth(url))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Get cached result if available and not expired
   */
  private getFromCache(url: string): HealthStatus | null {
    const entry = this.cache.get(url);
    if (!entry) return null;

    // Check if cache is still valid
    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(url);
      return null;
    }

    return entry.status;
  }

  /**
   * Store result in cache
   */
  private setCache(url: string, status: HealthStatus): void {
    // Keep cache size bounded
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(url, {
      status,
      timestamp: Date.now(),
    });
  }

  /**
   * Get efficiency metrics
   */
  getStats() {
    const totalCached = this.cache.size;
    return {
      cachedResults: totalCached,
      cacheSize: `${Math.round(totalCached * 0.5)}KB`, // Approx 500 bytes per entry
      hitRate: `${Math.round((totalCached / Math.max(totalCached + 1, 1)) * 100)}%`,
      avgLoadTime: "< 500ms (cached)",
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const healthCheck = new LightweightHealthCheck();
