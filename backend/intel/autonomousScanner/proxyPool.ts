/**
 * Proxy Pool Manager
 *
 * Manages rotating proxies for distributed scanning.
 *
 * IMPORTANT: Proxy rotation should be used responsibly:
 * - Only for legitimate business purposes
 * - Not to bypass access controls or security measures
 * - With respect to terms of service
 * - For load distribution, not evasion
 */

import { logger } from '../../../utils/logger';

export interface ProxyConfig {
  host: string;
  port: number;
  type: 'http' | 'https' | 'socks5';
  country?: string;
  carrier?: 'mobile' | 'broadband' | 'datacenter';
  username?: string;
  password?: string;
  maxConcurrent?: number;
  lastUsed?: number;
  failureCount: number;
  isActive: boolean;
}

export interface ProxyPoolConfig {
  countries?: string[];
  carriers?: Array<'mobile' | 'broadband' | 'datacenter'>;
  maxFailuresBeforeRotate: number;
  rotationStrategy: 'round-robin' | 'least-used' | 'random';
  healthCheckInterval: number; // ms
}

export class ProxyPool {
  private proxies: ProxyConfig[] = [];
  private currentIndex: number = 0;
  private config: ProxyPoolConfig;

  constructor(config: Partial<ProxyPoolConfig> = {}) {
    this.config = {
      countries: ['US', 'CA', 'DE'],
      carriers: ['broadband', 'datacenter'],
      maxFailuresBeforeRotate: 3,
      rotationStrategy: 'round-robin',
      healthCheckInterval: 60000, // 1 minute
      ...config
    };

    // Initialize with default proxies (would be loaded from config/database)
    this.initializeProxies();

    // Start health check interval
    this.startHealthChecks();
  }

  /**
   * Initialize proxy pool
   * In production, this would load from environment variables or database
   */
  private initializeProxies(): void {
    // For now, we'll use direct connections (no proxy)
    // In production, you would configure actual proxy servers

    // Example proxy configuration (commented out):
    /*
    this.proxies = [
      {
        host: 'proxy1.example.com',
        port: 8080,
        type: 'http',
        country: 'US',
        carrier: 'datacenter',
        failureCount: 0,
        isActive: true
      },
      {
        host: 'proxy2.example.com',
        port: 8080,
        type: 'http',
        country: 'CA',
        carrier: 'broadband',
        failureCount: 0,
        isActive: true
      }
    ];
    */

    logger.info('Proxy pool initialized (direct connections only - configure proxies in production)');
  }

  /**
   * Get next proxy from the pool
   */
  getProxy(): ProxyConfig | null {
    if (this.proxies.length === 0) {
      logger.debug('No proxies configured, using direct connection');
      return null;
    }

    const activeProxies = this.proxies.filter(p => p.isActive);

    if (activeProxies.length === 0) {
      logger.warn('No active proxies available');
      return null;
    }

    switch (this.config.rotationStrategy) {
      case 'round-robin':
        return this.getRoundRobinProxy(activeProxies);
      case 'least-used':
        return this.getLeastUsedProxy(activeProxies);
      case 'random':
        return this.getRandomProxy(activeProxies);
      default:
        return this.getRoundRobinProxy(activeProxies);
    }
  }

  /**
   * Round-robin proxy selection
   */
  private getRoundRobinProxy(proxies: ProxyConfig[]): ProxyConfig {
    const proxy = proxies[this.currentIndex % proxies.length];
    this.currentIndex = (this.currentIndex + 1) % proxies.length;
    proxy.lastUsed = Date.now();
    return proxy;
  }

  /**
   * Least-used proxy selection
   */
  private getLeastUsedProxy(proxies: ProxyConfig[]): ProxyConfig {
    const sorted = [...proxies].sort((a, b) => {
      const aLastUsed = a.lastUsed || 0;
      const bLastUsed = b.lastUsed || 0;
      return aLastUsed - bLastUsed;
    });

    const proxy = sorted[0];
    proxy.lastUsed = Date.now();
    return proxy;
  }

  /**
   * Random proxy selection
   */
  private getRandomProxy(proxies: ProxyConfig[]): ProxyConfig {
    const index = Math.floor(Math.random() * proxies.length);
    const proxy = proxies[index];
    proxy.lastUsed = Date.now();
    return proxy;
  }

  /**
   * Report proxy failure
   */
  reportFailure(proxy: ProxyConfig): void {
    proxy.failureCount++;

    if (proxy.failureCount >= this.config.maxFailuresBeforeRotate) {
      proxy.isActive = false;
      logger.warn(`Proxy ${proxy.host}:${proxy.port} marked as inactive after ${proxy.failureCount} failures`);
    }
  }

  /**
   * Report proxy success (reset failure count)
   */
  reportSuccess(proxy: ProxyConfig): void {
    proxy.failureCount = 0;
  }

  /**
   * Add proxy to pool
   */
  addProxy(proxy: Omit<ProxyConfig, 'failureCount' | 'isActive'>): void {
    this.proxies.push({
      ...proxy,
      failureCount: 0,
      isActive: true
    });

    logger.info(`Added proxy ${proxy.host}:${proxy.port} to pool`);
  }

  /**
   * Remove proxy from pool
   */
  removeProxy(host: string, port: number): void {
    this.proxies = this.proxies.filter(p => !(p.host === host && p.port === port));
    logger.info(`Removed proxy ${host}:${port} from pool`);
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    setInterval(async () => {
      await this.performHealthChecks();
    }, this.config.healthCheckInterval);
  }

  /**
   * Perform health checks on all proxies
   */
  private async performHealthChecks(): Promise<void> {
    logger.debug('Performing proxy health checks');

    for (const proxy of this.proxies) {
      try {
        // In production, this would actually test the proxy connection
        // For now, we'll just reset failure counts for inactive proxies periodically
        if (!proxy.isActive && proxy.failureCount > 0) {
          proxy.failureCount = Math.max(0, proxy.failureCount - 1);

          // Reactivate if failure count drops to 0
          if (proxy.failureCount === 0) {
            proxy.isActive = true;
            logger.info(`Proxy ${proxy.host}:${proxy.port} reactivated`);
          }
        }
      } catch (error) {
        logger.error(`Health check failed for ${proxy.host}:${proxy.port}:`, error);
        this.reportFailure(proxy);
      }
    }
  }

  /**
   * Get proxy statistics
   */
  getStats() {
    return {
      total: this.proxies.length,
      active: this.proxies.filter(p => p.isActive).length,
      inactive: this.proxies.filter(p => !p.isActive).length,
      byCountry: this.getProxyCountByCountry(),
      byCarrier: this.getProxyCountByCarrier()
    };
  }

  /**
   * Get proxy count by country
   */
  private getProxyCountByCountry(): Record<string, number> {
    const counts: Record<string, number> = {};

    for (const proxy of this.proxies.filter(p => p.isActive)) {
      const country = proxy.country || 'Unknown';
      counts[country] = (counts[country] || 0) + 1;
    }

    return counts;
  }

  /**
   * Get proxy count by carrier type
   */
  private getProxyCountByCarrier(): Record<string, number> {
    const counts: Record<string, number> = {};

    for (const proxy of this.proxies.filter(p => p.isActive)) {
      const carrier = proxy.carrier || 'Unknown';
      counts[carrier] = (counts[carrier] || 0) + 1;
    }

    return counts;
  }

  /**
   * Get proxy configuration string for HTTP client
   */
  getProxyUrl(proxy: ProxyConfig): string {
    const auth = proxy.username && proxy.password
      ? `${proxy.username}:${proxy.password}@`
      : '';

    return `${proxy.type}://${auth}${proxy.host}:${proxy.port}`;
  }
}

/**
 * Singleton instance
 */
export const proxyPool = new ProxyPool({
  rotationStrategy: 'round-robin',
  maxFailuresBeforeRotate: 3
});

/**
 * Factory function for custom configurations
 */
export function createProxyPool(config: Partial<ProxyPoolConfig>): ProxyPool {
  return new ProxyPool(config);
}
