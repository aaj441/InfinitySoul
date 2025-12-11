/**
 * Autonomous Crawl Node
 *
 * Individual scanning node using Playwright for browser automation.
 * Implements fingerprint randomization and respectful crawling practices.
 */

import { Browser, chromium, firefox, webkit, Page } from 'playwright';
import { logger } from '../../../utils/logger';
import { ProxyConfig } from './proxyPool';
import { generateFingerprint, BrowserFingerprint } from './fingerprinting';

export interface CrawlConfig {
  url: string;
  proxy?: ProxyConfig;
  fingerprint?: BrowserFingerprint;
  timeout?: number;
  waitForSelector?: string;
  screenshotPath?: string;
  collectCookies?: boolean;
}

export interface CrawlResult {
  url: string;
  statusCode: number;
  html: string;
  screenshot?: Buffer;
  cookies?: any[];
  performance?: {
    loadTime: number;
    domContentLoaded: number;
    firstPaint: number;
  };
  violations?: any[];
  error?: string;
  crawledAt: Date;
}

export class CrawlNode {
  private browser: Browser | null = null;
  private nodeId: string;

  constructor(nodeId: string) {
    this.nodeId = nodeId;
  }

  /**
   * Initialize browser instance
   */
  async initialize(): Promise<void> {
    if (this.browser) {
      logger.warn(`Node ${this.nodeId} already initialized`);
      return;
    }

    try {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled'
        ]
      });

      logger.info(`Crawl node ${this.nodeId} initialized`);
    } catch (error) {
      logger.error(`Failed to initialize node ${this.nodeId}:`, error);
      throw error;
    }
  }

  /**
   * Scan a domain using Playwright
   */
  async scanNode(config: CrawlConfig): Promise<CrawlResult> {
    if (!this.browser) {
      await this.initialize();
    }

    const startTime = Date.now();
    let page: Page | null = null;

    try {
      // Create browser context with fingerprint
      const fingerprint = config.fingerprint || generateFingerprint();

      const contextOptions: any = {
        viewport: fingerprint.viewport,
        userAgent: fingerprint.userAgent,
        locale: fingerprint.locale,
        timezoneId: fingerprint.timezone,
        geolocation: fingerprint.geolocation,
        permissions: ['geolocation']
      };

      // Add proxy if configured
      if (config.proxy) {
        contextOptions.proxy = {
          server: `${config.proxy.type}://${config.proxy.host}:${config.proxy.port}`,
          username: config.proxy.username,
          password: config.proxy.password
        };
      }

      const context = await this.browser!.createContext(contextOptions);

      // Create page
      page = await context.newPage();

      // Apply additional fingerprinting
      await this.applyFingerprint(page, fingerprint);

      // Navigate to URL
      const response = await page.goto(config.url, {
        timeout: config.timeout || 30000,
        waitUntil: 'networkidle'
      });

      if (!response) {
        throw new Error('No response received');
      }

      const statusCode = response.status();

      // Wait for specific selector if provided
      if (config.waitForSelector) {
        await page.waitForSelector(config.waitForSelector, {
          timeout: 10000
        }).catch(() => {
          logger.warn(`Selector ${config.waitForSelector} not found`);
        });
      }

      // Get HTML content
      const html = await page.content();

      // Capture screenshot if requested
      let screenshot: Buffer | undefined;
      if (config.screenshotPath) {
        screenshot = await page.screenshot({
          fullPage: true,
          type: 'png'
        });
      }

      // Collect cookies if requested
      let cookies: any[] | undefined;
      if (config.collectCookies) {
        cookies = await context.cookies();
      }

      // Collect performance metrics
      const performance = await this.collectPerformanceMetrics(page);

      // Run accessibility scan
      const violations = await this.runAccessibilityScan(page);

      // Close context
      await context.close();

      const loadTime = Date.now() - startTime;

      return {
        url: config.url,
        statusCode,
        html,
        screenshot,
        cookies,
        performance: {
          ...performance,
          loadTime
        },
        violations,
        crawledAt: new Date()
      };

    } catch (error) {
      logger.error(`Scan failed for ${config.url}:`, error);

      return {
        url: config.url,
        statusCode: 0,
        html: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        crawledAt: new Date()
      };

    } finally {
      if (page) {
        await page.close().catch((closeErr) => {
          logger.warn(`Failed to close page for ${config.url}:`, closeErr);
        });
      }
    }
  }

  /**
   * Apply browser fingerprinting to evade detection
   */
  private async applyFingerprint(page: Page, fingerprint: BrowserFingerprint): Promise<void> {
    // Override navigator properties
    await page.addInitScript((fp: BrowserFingerprint) => {
      // Override webdriver flag
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false
      });

      // Override plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => fp.plugins || []
      });

      // Override languages
      Object.defineProperty(navigator, 'languages', {
        get: () => fp.languages || ['en-US', 'en']
      });

      // Override platform
      Object.defineProperty(navigator, 'platform', {
        get: () => fp.platform || 'Win32'
      });

      // Override hardware concurrency
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        get: () => fp.hardwareConcurrency || 8
      });

      // Override device memory
      if ('deviceMemory' in navigator) {
        Object.defineProperty(navigator, 'deviceMemory', {
          get: () => fp.deviceMemory || 8
        });
      }
    }, fingerprint);
  }

  /**
   * Collect performance metrics
   */
  private async collectPerformanceMetrics(page: Page): Promise<any> {
    try {
      const metrics = await page.evaluate(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as any;

        return {
          domContentLoaded: perfData?.domContentLoadedEventEnd - perfData?.domContentLoadedEventStart || 0,
          firstPaint: performance.getEntriesByType('paint').find(e => e.name === 'first-paint')?.startTime || 0
        };
      });

      return metrics;
    } catch (error) {
      logger.warn('Failed to collect performance metrics:', error);
      return {};
    }
  }

  /**
   * Run accessibility scan using axe-core
   */
  private async runAccessibilityScan(page: Page): Promise<any[]> {
    try {
      // Inject axe-core
      await page.addScriptTag({
        url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js'
      });

      // Run axe scan
      const results = await page.evaluate(async () => {
        // @ts-ignore
        const axeResults = await axe.run();
        return axeResults.violations;
      });

      return results;
    } catch (error) {
      logger.warn('Failed to run accessibility scan:', error);
      return [];
    }
  }

  /**
   * Shutdown the crawl node
   */
  async shutdown(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info(`Crawl node ${this.nodeId} shut down`);
    }
  }

  /**
   * Get node status
   */
  getStatus() {
    return {
      nodeId: this.nodeId,
      initialized: this.browser !== null,
      browserType: 'chromium'
    };
  }
}

/**
 * Create a new crawl node
 */
export async function createCrawlNode(nodeId: string): Promise<CrawlNode> {
  const node = new CrawlNode(nodeId);
  await node.initialize();
  return node;
}
