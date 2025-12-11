import type { BrowserContext, Page, Browser } from "playwright";
import { chromium, firefox, webkit } from "playwright";
import { BrowserBackend, type ScanRequest, type ScanResponse } from "./base-backend";

interface BrowserInstance {
  context: BrowserContext;
  page: Page;
  browser: Browser;
}

export class PlaywrightBackend extends BrowserBackend {
  private browsers: Map<string, BrowserInstance> = new Map();
  private browserTypes = [
    { type: "chromium", name: "Chrome" },
    { type: "firefox", name: "Firefox" },
    { type: "webkit", name: "Safari" },
  ];

  async initialize(): Promise<void> {
    try {
      for (const { type } of this.browserTypes) {
        if (!this.browsers.has(type)) {
          let browserModule;
          if (type === "chromium") browserModule = chromium;
          else if (type === "firefox") browserModule = firefox;
          else browserModule = webkit;

          const browser = await browserModule.launch({
            headless: true,
          });
          const context = await browser.newContext();
          const page = await context.newPage();

          this.browsers.set(type, { browser, context, page });
        }
      }
    } catch (error) {
      console.error(`${this.config.name}: Browser launch failed -`, error instanceof Error ? error.message : String(error));
      this.config.enabled = false;
      throw error;
    }
  }

  async close(): Promise<void> {
    const entries = Array.from(this.browsers.values());
    for (const { browser, context } of entries) {
      await context.close();
      await browser.close();
    }
    this.browsers.clear();
  }

  async scan(request: ScanRequest): Promise<ScanResponse> {
    if (!this.isAvailable()) {
      throw new Error(`${this.config.name} backend not available`);
    }

    this.incrementUsage();

    try {
      await this.initialize();

      const allViolations: any[] = [];
      const screenshots: { browser: string; data: Buffer }[] = [];

      // Scan across all browsers
      for (const { type, name } of this.browserTypes) {
        try {
          const browserInstance = this.browsers.get(type);
          if (!browserInstance) continue;

          const { page } = browserInstance;

          // Set viewport and navigate
          await page.setViewportSize({
            width: request.viewport?.width || 1920,
            height: request.viewport?.height || 1080,
          });

          await page.goto(request.url, {
            waitUntil: request.waitUntil || "networkidle",
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
              axe.run((err, results) => {
                resolve(results || { violations: [] });
              });
            });
          });

          // Tag violations with browser
          if (results.violations) {
            results.violations.forEach((v: any) => {
              v.browsers = v.browsers || [];
              v.browsers.push(name);
            });
            allViolations.push(...results.violations);
          }

          // Capture screenshot
          const screenshot = await page.screenshot({ fullPage: true });
          screenshots.push({ browser: name, data: screenshot });
        } catch (error) {
          console.warn(`${name} scan failed:`, error instanceof Error ? error.message : String(error));
        }
      }

      // Deduplicate violations (same violation across browsers)
      const uniqueViolations = Array.from(
        new Map(allViolations.map((v) => [v.id, v])).values()
      );

      return {
        violations: uniqueViolations,
        screenshot: screenshots[0]?.data, // Return Chrome screenshot as primary
      };
    } finally {
      this.decrementActive();
    }
  }
}
