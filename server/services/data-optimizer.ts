/**
 * Global Data Usage Optimizer
 * Tracks and optimizes API calls, cache hits, memory usage
 * Dashboard for monitoring data efficiency
 */

interface APIUsageMetric {
  endpoint: string;
  callsTotal: number;
  cacheHits: number;
  cacheMisses: number;
  avgResponseTime: number;
}

interface DataUsageReport {
  timestamp: Date;
  totalAPICalls: number;
  cachedHits: number;
  cacheHitRate: string;
  estimatedCostSaved: string;
  memoryUsage: string;
  metrics: APIUsageMetric[];
  recommendations: string[];
}

export class DataOptimizer {
  private metrics = new Map<string, APIUsageMetric>();
  private startTime = Date.now();
  private readonly costPerAPICall = 0.005; // $0.005 per API call (typical)

  /**
   * Track API call
   */
  trackAPICall(endpoint: string, cacheHit: boolean, responseTime: number) {
    let metric = this.metrics.get(endpoint);
    if (!metric) {
      metric = {
        endpoint,
        callsTotal: 0,
        cacheHits: 0,
        cacheMisses: 0,
        avgResponseTime: 0,
      };
      this.metrics.set(endpoint, metric);
    }

    metric.callsTotal++;
    if (cacheHit) {
      metric.cacheHits++;
    } else {
      metric.cacheMisses++;
    }

    // Update average response time
    metric.avgResponseTime =
      (metric.avgResponseTime * (metric.callsTotal - 1) + responseTime) / metric.callsTotal;
  }

  /**
   * Generate efficiency report
   */
  generateReport(): DataUsageReport {
    const metricsArray = Array.from(this.metrics.values());

    const totalAPICalls = metricsArray.reduce((sum, m) => sum + m.callsTotal, 0);
    const cachedHits = metricsArray.reduce((sum, m) => sum + m.cacheHits, 0);
    const cacheHitRate =
      totalAPICalls > 0
        ? `${Math.round((cachedHits / totalAPICalls) * 100)}%`
        : "0%";

    const actualAPICalls = metricsArray.reduce((sum, m) => sum + m.cacheMisses, 0);
    const potentialCost = actualAPICalls * this.costPerAPICall;
    const wastedCost = (totalAPICalls - actualAPICalls) * this.costPerAPICall;

    const memoryUsage = `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`;

    const recommendations = this.generateRecommendations(metricsArray);

    return {
      timestamp: new Date(),
      totalAPICalls,
      cachedHits,
      cacheHitRate,
      estimatedCostSaved: `$${wastedCost.toFixed(2)}`,
      memoryUsage,
      metrics: metricsArray,
      recommendations,
    };
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(metrics: APIUsageMetric[]): string[] {
    const recommendations: string[] = [];

    // Check for low cache hit rates
    for (const metric of metrics) {
      const hitRate = metric.callsTotal > 0 ? metric.cacheHits / metric.callsTotal : 0;
      if (hitRate < 0.3 && metric.callsTotal > 5) {
        recommendations.push(
          `${metric.endpoint}: Cache hit rate is low (${Math.round(hitRate * 100)}%). Consider increasing TTL.`
        );
      }
    }

    // Check for slow endpoints
    const slowEndpoints = metrics.filter((m) => m.avgResponseTime > 1000);
    if (slowEndpoints.length > 0) {
      recommendations.push(
        `${slowEndpoints.map((m) => m.endpoint).join(", ")}: Response times are high (>1s). Consider optimization.`
      );
    }

    // Overall optimization
    if (metrics.length === 0) {
      recommendations.push("No API calls tracked yet. Enable tracking to see recommendations.");
    } else if (metrics.length > 10) {
      recommendations.push("Many endpoints detected. Consider batching API calls to reduce overhead.");
    }

    return recommendations;
  }

  /**
   * Get quick stats for monitoring
   */
  getQuickStats() {
    const metricsArray = Array.from(this.metrics.values());
    const totalCalls = metricsArray.reduce((sum, m) => sum + m.callsTotal, 0);
    const cachedCalls = metricsArray.reduce((sum, m) => sum + m.cacheHits, 0);

    return {
      totalRequests: totalCalls,
      cachedRequests: cachedCalls,
      hitRate: totalCalls > 0 ? `${Math.round((cachedCalls / totalCalls) * 100)}%` : "N/A",
      uptime: `${Math.round((Date.now() - this.startTime) / 1000 / 60)}min`,
      endpoints: metricsArray.length,
    };
  }

  /**
   * Reset metrics (daily)
   */
  reset() {
    this.metrics.clear();
    this.startTime = Date.now();
  }
}

export const dataOptimizer = new DataOptimizer();
