/**
 * Browserless.io Integration Service
 * Offloads memory-intensive browser scanning from Vercel
 *
 * TIER 1 CRITICAL: Solves memory constraint on Vercel
 *
 * Alternative implementations:
 * 1. Browserless.io (managed, instant setup)
 * 2. Separate Railway app with Docker
 * 3. AWS Lambda + Headless Chrome
 *
 * We implement Browserless for simplicity and cost
 */

import axios from 'axios';
import { logger } from './logger';

interface BrowserlessRequest {
  url: string;
  timeout?: number;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
}

interface BrowserlessScanResult {
  violations: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    total: number;
  };
  riskScore: number;
  estimatedLawsuitCost: number;
  topViolations: Array<{
    code: string;
    description: string;
    violationCount: number;
  }>;
}

/**
 * Browserless.io client
 * Outsources browser to managed service to free up Vercel memory
 */
class BrowserlessService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.BROWSERLESS_API_KEY || '';
    this.apiUrl = 'https://chrome.browserless.io';

    if (!this.apiKey) {
      logger.warn('BROWSERLESS_API_KEY not set. Scans will fail.', {
        suggestion: 'Set BROWSERLESS_API_KEY in environment variables'
      });
    }
  }

  /**
   * Perform accessibility scan via Browserless
   * Automatically injects axe-core and runs scan
   */
  async performScan(req: BrowserlessRequest): Promise<BrowserlessScanResult> {
    const startTime = Date.now();

    try {
      logger.info('Browserless scan starting', { url: req.url });

      // Call Browserless API
      const response = await axios.post(
        `${this.apiUrl}/function`,
        {
          code: this.getAxeInjectionCode(req.url),
          timeout: req.timeout || 30000,
          context: {
            url: req.url
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: (req.timeout || 30000) + 5000 // Add buffer
        }
      );

      const result = response.data;
      const duration = Date.now() - startTime;

      logger.info('Browserless scan completed', {
        url: req.url,
        violations: result.violations.total,
        durationMs: duration
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Browserless scan failed', error as Error, {
        url: req.url,
        durationMs: duration,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  /**
   * Browserless-compatible code that injects axe-core and runs scan
   * This code executes IN Browserless, not in our server
   */
  private getAxeInjectionCode(url: string): string {
    return `
      module.exports = async (page) => {
        // Navigate to URL
        await page.goto('${url}', {
          waitUntil: 'networkidle2',
          timeout: 30000
        });

        // Inject axe-core script
        await page.addScriptTag({
          url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js'
        });

        // Wait for axe to be ready
        await page.waitForFunction(
          () => typeof window.axe !== 'undefined',
          { timeout: 10000 }
        );

        // Run accessibility scan
        const results = await page.evaluate(() => {
          return new Promise((resolve) => {
            window.axe.run({ runOnly: { type: 'tag', values: ['wcag2aa'] } }, (error, results) => {
              resolve(results);
            });
          });
        });

        // Parse violations
        const violations = {
          critical: results.violations.filter(v => v.impact === 'critical').length,
          serious: results.violations.filter(v => v.impact === 'serious').length,
          moderate: results.violations.filter(v => v.impact === 'moderate').length,
          minor: results.violations.filter(v => v.impact === 'minor').length,
          total: results.violations.length
        };

        const topViolations = results.violations
          .slice(0, 5)
          .map(v => ({
            code: v.id,
            description: v.description,
            violationCount: v.nodes.length
          }));

        // Calculate risk score
        const riskScore = Math.min(violations.total * 1.5, 100);
        const estimatedLawsuitCost = 50000 + (violations.total * 2500);

        return {
          violations,
          riskScore,
          estimatedLawsuitCost,
          topViolations
        };
      };
    `;
  }
}

export const browserlessService = new BrowserlessService();

/**
 * Fallback: Local scanning if Browserless is unavailable
 * This maintains backward compatibility
 */
export async function performScanWithFallback(
  url: string,
  useLocal: boolean = false
): Promise<BrowserlessScanResult> {
  if (useLocal || !process.env.BROWSERLESS_API_KEY) {
    logger.warn('Using local browser scanning (not recommended for production)', {
      reason: useLocal ? 'Explicitly requested' : 'BROWSERLESS_API_KEY not set'
    });

    // This would use the original queue.ts implementation
    // For now, we throw an error to force Browserless usage
    throw new Error(
      'Local browser scanning disabled. Set BROWSERLESS_API_KEY environment variable.'
    );
  }

  return browserlessService.performScan({ url });
}

export default browserlessService;
