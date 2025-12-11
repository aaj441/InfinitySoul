import { BrowserBackend, type ScanRequest, type ScanResponse } from "./base-backend";

/**
 * BrowserOS Backend
 * 
 * Uses BrowserOS cloud automation platform
 * Requires: BROWSEROS_API_URL and BROWSEROS_API_KEY environment variables
 * 
 * BrowserOS features:
 * - Distributed browser grid
 * - Real device testing
 * - Advanced anti-detection
 */
export class BrowserOSBackend extends BrowserBackend {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    super({
      name: "BrowserOS",
      enabled: !!process.env.BROWSEROS_API_URL && !!process.env.BROWSEROS_API_KEY,
      concurrent: 3,
      dailyLimit: process.env.BROWSEROS_PAID === "true" ? undefined : 5,
    });

    this.apiUrl = process.env.BROWSEROS_API_URL || "";
    this.apiKey = process.env.BROWSEROS_API_KEY || "";
  }

  async initialize(): Promise<void> {
    if (!this.apiUrl || !this.apiKey) {
      console.log(`${this.config.name}: Skipped (set BROWSEROS_API_URL and BROWSEROS_API_KEY to enable)`);
      return;
    }
    console.log(`${this.config.name}: Ready (Cloud Grid)`);
  }

  async close(): Promise<void> {
    // No cleanup needed
  }

  async scan(request: ScanRequest): Promise<ScanResponse> {
    if (!this.isAvailable()) {
      throw new Error(`${this.config.name} backend not available`);
    }

    this.incrementUsage();

    try {
      // Create session
      const sessionResponse = await fetch(`${this.apiUrl}/sessions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          browserName: "chrome",
          viewport: request.viewport || { width: 1920, height: 1080 },
        }),
      });

      if (!sessionResponse.ok) {
        throw new Error(`BrowserOS session creation failed: ${sessionResponse.statusText}`);
      }

      const session = await sessionResponse.json();
      const sessionId = session.sessionId;

      try {
        // Navigate to URL
        await fetch(`${this.apiUrl}/sessions/${sessionId}/navigate`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: request.url,
            waitUntil: request.waitUntil || "networkidle2",
          }),
        });

        // Execute axe-core script
        const axeResponse = await fetch(`${this.apiUrl}/sessions/${sessionId}/execute`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            script: `
              // Inject axe-core
              const script = document.createElement('script');
              script.src = 'https://cdn.jsdelivr.net/npm/axe-core@4.7.0/axe.min.js';
              document.head.appendChild(script);
              
              // Wait for axe to load and run scan
              return new Promise((resolve) => {
                script.onload = () => {
                  window.axe.run().then(results => resolve(results));
                };
              });
            `,
          }),
        });

        const axeResults = await axeResponse.json();

        // Capture screenshot
        const screenshotResponse = await fetch(`${this.apiUrl}/sessions/${sessionId}/screenshot`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
          },
        });

        let screenshot: Buffer | undefined;
        if (screenshotResponse.ok) {
          const arrayBuffer = await screenshotResponse.arrayBuffer();
          screenshot = Buffer.from(arrayBuffer);
        }

        console.log(`${this.config.name}: Scan completed for ${request.url}`);

        return {
          violations: axeResults.result?.violations || [],
          screenshot,
        };
      } finally {
        // Close session
        await fetch(`${this.apiUrl}/sessions/${sessionId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
          },
        });
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
