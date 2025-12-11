import { BrowserBackend, type ScanRequest, type ScanResponse } from "./base-backend";
import puppeteer from "puppeteer-core";

/**
 * Opera Neon Backend
 * 
 * Connects to Opera Neon's cloud browser service via WebSocket
 * Requires: NEON_WS_URL and NEON_API_TOKEN environment variables
 * 
 * Free tier: 3 scans/day
 * Paid tier: Unlimited with API token
 */
export class NeonBackend extends BrowserBackend {
  private wsUrl: string;
  private apiToken: string;

  constructor() {
    super({
      name: "Opera Neon",
      enabled: !!process.env.NEON_WS_URL && !!process.env.NEON_API_TOKEN,
      concurrent: 2,
      dailyLimit: process.env.NEON_PAID === "true" ? undefined : 3,
    });

    this.wsUrl = process.env.NEON_WS_URL || "";
    this.apiToken = process.env.NEON_API_TOKEN || "";
  }

  async initialize(): Promise<void> {
    // Neon is serverless - no initialization needed
    console.log(`${this.config.name}: Ready (WebSocket connection on-demand)`);
  }

  async close(): Promise<void> {
    // Neon is serverless - no cleanup needed
  }

  async scan(request: ScanRequest): Promise<ScanResponse> {
    if (!this.isAvailable()) {
      throw new Error(`${this.config.name} backend not available`);
    }

    this.incrementUsage();

    try {
      // Connect to Opera Neon via WebSocket
      const wsEndpoint = `${this.wsUrl}?token=${this.apiToken}`;
      
      const browser = await puppeteer.connect({
        browserWSEndpoint: wsEndpoint,
      });

      const page = await browser.newPage();

      try {
        await page.setViewport(request.viewport || { width: 1920, height: 1080 });
        await page.goto(request.url, {
          waitUntil: request.waitUntil || "networkidle2",
          timeout: request.timeout || 30000,
        });

        // Inject axe-core via CDN (since we can't access local files)
        await page.addScriptTag({
          url: "https://cdn.jsdelivr.net/npm/axe-core@4.7.0/axe.min.js",
        });

        // Wait for axe to load
        await page.waitForFunction(() => typeof window.axe !== "undefined");

        // Run axe-core scan
        const results = await page.evaluate(() => {
          return new Promise<any>((resolve) => {
            // @ts-ignore
            window.axe.run().then((results: any) => {
              resolve(results);
            });
          });
        });

        // Capture screenshot
        const screenshot = await page.screenshot({ fullPage: true });

        await page.close();
        await browser.disconnect();

        console.log(`${this.config.name}: Scan completed for ${request.url}`);

        return {
          violations: results.violations,
          screenshot,
        };
      } catch (error) {
        await page.close();
        await browser.disconnect();
        throw error;
      }
    } catch (error) {
      console.error(`${this.config.name}: Scan failed -`, error);
      return {
        violations: [],
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      this.decrementActive();
    }
  }
}
