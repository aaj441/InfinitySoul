import { BrowserBackend, type ScanRequest, type ScanResponse } from "./base-backend";

/**
 * Comet Backend
 * 
 * Uses Comet's REST API for browser automation
 * Requires: COMET_API_URL and COMET_API_KEY environment variables
 * 
 * Comet provides managed browser instances with:
 * - Pre-installed tools (Axe-core, etc.)
 * - Automatic retries
 * - Screenshot capture
 */
export class CometBackend extends BrowserBackend {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    super({
      name: "Comet",
      enabled: !!process.env.COMET_API_URL && !!process.env.COMET_API_KEY,
      concurrent: 5,
      dailyLimit: process.env.COMET_PAID === "true" ? undefined : 10,
    });

    this.apiUrl = process.env.COMET_API_URL || "";
    this.apiKey = process.env.COMET_API_KEY || "";
  }

  async initialize(): Promise<void> {
    // Verify API credentials - just log warning, don't throw
    if (!this.apiUrl || !this.apiKey) {
      console.log(`${this.config.name}: Skipped (set COMET_API_URL and COMET_API_KEY to enable)`);
      return;
    }
    console.log(`${this.config.name}: Ready (REST API)`);
  }

  async close(): Promise<void> {
    // No cleanup needed for REST API
  }

  async scan(request: ScanRequest): Promise<ScanResponse> {
    if (!this.isAvailable()) {
      throw new Error(`${this.config.name} backend not available`);
    }

    this.incrementUsage();

    try {
      // Call Comet API
      const response = await fetch(`${this.apiUrl}/scan`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: request.url,
          tools: ["axe-core"],
          viewport: request.viewport || { width: 1920, height: 1080 },
          waitUntil: request.waitUntil || "networkidle2",
          screenshot: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Comet API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Download screenshot if URL provided
      let screenshot: Buffer | undefined;
      if (data.screenshotUrl) {
        const imgResponse = await fetch(data.screenshotUrl);
        const arrayBuffer = await imgResponse.arrayBuffer();
        screenshot = Buffer.from(arrayBuffer);
      }

      console.log(`${this.config.name}: Scan completed for ${request.url}`);

      return {
        violations: data.violations || [],
        screenshot,
      };
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
