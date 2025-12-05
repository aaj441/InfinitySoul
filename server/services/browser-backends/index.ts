import { BrowserBackend } from "./base-backend";
import { PuppeteerBackend } from "./puppeteer-backend";
import { PlaywrightBackend } from "./playwright-backend";
import { NeonBackend } from "./neon-backend";
import { CometBackend } from "./comet-backend";
import { BrowserOSBackend } from "./browseros-backend";
import { MockBackend } from "./mock-backend";

export type BackendName = "puppeteer" | "playwright" | "neon" | "comet" | "browseros" | "mock";

export class BrowserBackendManager {
  private backends: Map<BackendName, BrowserBackend>;
  private selectionStrategy: "round-robin" | "least-loaded" | "priority";
  private currentRoundRobin = 0;

  constructor(strategy: "round-robin" | "least-loaded" | "priority" = "least-loaded") {
    this.selectionStrategy = strategy;
    this.backends = new Map();

    // Initialize all backends
    this.backends.set("puppeteer", new PuppeteerBackend({
      name: "Puppeteer (Local)",
      enabled: true,
      concurrent: 2,
    }));

    this.backends.set("playwright", new PlaywrightBackend({
      name: "Playwright (Multi-Browser)",
      enabled: true,
      concurrent: 1,
    }));

    this.backends.set("neon", new NeonBackend());
    this.backends.set("comet", new CometBackend());
    this.backends.set("browseros", new BrowserOSBackend());
    this.backends.set("mock", new MockBackend());
  }

  async initialize() {
    console.log("=".repeat(60));
    console.log("🌐 BROWSER BACKEND MANAGER");
    console.log("=".repeat(60));

    for (const [name, backend] of this.backends.entries()) {
      try {
        await backend.initialize();
        const stats = backend.getStats();
        if (stats.enabled) {
          console.log(`✅ ${stats.name}: Available (${stats.concurrent} concurrent, ${stats.dailyLimit || "unlimited"} daily)`);
        } else {
          console.log(`⚠️  ${stats.name}: Disabled (missing configuration)`);
        }
      } catch (error) {
        console.error(`❌ ${name}: Initialization failed, disabling -`, error instanceof Error ? error.message : String(error));
        // Disable backend on initialization failure
        backend.getStats().enabled = false;
      }
    }

    const availableCount = Array.from(this.backends.values()).filter(
      (b) => b.getStats().enabled
    ).length;

    console.log("=".repeat(60));
    console.log(`📊 ${availableCount}/${this.backends.size} backends available`);
    console.log(`🎯 Selection strategy: ${this.selectionStrategy}`);
    console.log("=".repeat(60));
  }

  async close() {
    for (const backend of this.backends.values()) {
      await backend.close();
    }
  }

  selectBackend(preferredBackend?: BackendName): BrowserBackend | null {
    // If preferred backend specified and available, use it
    if (preferredBackend) {
      const backend = this.backends.get(preferredBackend);
      if (backend?.isAvailable()) {
        return backend;
      }
    }

    // Otherwise use selection strategy
    const availableBackends = Array.from(this.backends.values()).filter((b) =>
      b.isAvailable()
    );

    if (availableBackends.length === 0) {
      return null;
    }

    switch (this.selectionStrategy) {
      case "round-robin":
        const selected = availableBackends[this.currentRoundRobin % availableBackends.length];
        this.currentRoundRobin++;
        return selected;

      case "least-loaded":
        return availableBackends.reduce((least, current) => {
          const leastStats = least.getStats();
          const currentStats = current.getStats();
          return currentStats.activeScans < leastStats.activeScans ? current : least;
        });

      case "priority":
        // Priority order: Comet > BrowserOS > Playwright > Neon > Mock > Puppeteer
        const priority: BackendName[] = ["comet", "browseros", "playwright", "neon", "mock", "puppeteer"];
        for (const name of priority) {
          const backend = this.backends.get(name);
          if (backend?.isAvailable()) {
            return backend;
          }
        }
        return availableBackends[0];

      default:
        return availableBackends[0];
    }
  }

  getBackend(name: BackendName): BrowserBackend | undefined {
    return this.backends.get(name);
  }

  getAllStats() {
    return Array.from(this.backends.values()).map((b) => b.getStats());
  }

  getAvailableBackends(): string[] {
    return Array.from(this.backends.values())
      .filter((b) => b.isAvailable())
      .map((b) => b.getName());
  }
}

// Singleton instance
export const browserBackendManager = new BrowserBackendManager();
