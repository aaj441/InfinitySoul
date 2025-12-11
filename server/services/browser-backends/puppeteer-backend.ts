import puppeteer, { Browser } from "puppeteer";
import { BrowserBackend, type ScanRequest, type ScanResponse } from "./base-backend";

export class PuppeteerBackend extends BrowserBackend {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    try {
      if (!this.browser) {
        this.browser = await puppeteer.launch({
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
          ],
        });
      }
    } catch (error) {
      console.error(`${this.config.name}: Browser launch failed -`, error instanceof Error ? error.message : String(error));
      console.log(`${this.config.name}: Consider using cloud backends (Opera Neon, Comet, BrowserOS)`);
      // Disable this backend
      this.config.enabled = false;
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scan(request: ScanRequest): Promise<ScanResponse> {
    if (!this.isAvailable()) {
      throw new Error(`${this.config.name} backend not available`);
    }

    this.incrementUsage();
    
    try {
      await this.initialize();
      
      if (!this.browser) {
        throw new Error("Browser failed to initialize");
      }

      const page = await this.browser.newPage();

      try {
        await page.setViewport(request.viewport || { width: 1920, height: 1080 });
        await page.goto(request.url, {
          waitUntil: request.waitUntil || "networkidle0",
          timeout: request.timeout || 30000,
        });

        // Inject axe-core
        await page.addScriptTag({
          path: require.resolve("axe-core"),
        });

        // Run axe-core scan
        const results = await page.evaluate(() => {
          return new Promise<any>((resolve) => {
            // @ts-ignore - axe is injected globally
            axe.run().then((results: any) => {
              resolve(results);
            });
          });
        });

        // Capture screenshot
        const screenshot = await page.screenshot({ fullPage: true });

        await page.close();

        return {
          violations: results.violations,
          screenshot,
        };
      } catch (error) {
        await page.close();
        throw error;
      }
    } finally {
      this.decrementActive();
    }
  }
}
