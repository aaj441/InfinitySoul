export interface BrowserBackendConfig {
  name: string;
  enabled: boolean;
  concurrent: number;
  dailyLimit?: number;
}

export interface ScanRequest {
  url: string;
  waitUntil?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
  timeout?: number;
  viewport?: {
    width: number;
    height: number;
  };
}

export interface AxeResults {
  violations: Array<{
    id: string;
    impact: string;
    description: string;
    help: string;
    helpUrl: string;
    tags: string[];
    nodes: Array<{
      html: string;
      target: string[];
      failureSummary?: string;
    }>;
  }>;
}

export interface ScanResponse {
  violations: AxeResults["violations"];
  screenshot?: Buffer;
  error?: string;
}

export abstract class BrowserBackend {
  protected config: BrowserBackendConfig;
  protected activeScans = 0;
  protected dailyScans = 0;
  protected lastResetDate = new Date().toDateString();

  constructor(config: BrowserBackendConfig) {
    this.config = config;
  }

  abstract initialize(): Promise<void>;
  abstract close(): Promise<void>;
  abstract scan(request: ScanRequest): Promise<ScanResponse>;
  
  isAvailable(): boolean {
    if (!this.config.enabled) return false;
    
    // Reset daily counter if new day
    const today = new Date().toDateString();
    if (today !== this.lastResetDate) {
      this.dailyScans = 0;
      this.lastResetDate = today;
    }

    // Check concurrent limit
    if (this.activeScans >= this.config.concurrent) {
      return false;
    }

    // Check daily limit
    if (this.config.dailyLimit && this.dailyScans >= this.config.dailyLimit) {
      return false;
    }

    return true;
  }

  protected incrementUsage() {
    this.activeScans++;
    this.dailyScans++;
  }

  protected decrementActive() {
    this.activeScans = Math.max(0, this.activeScans - 1);
  }

  getName(): string {
    return this.config.name;
  }

  getStats() {
    return {
      name: this.config.name,
      enabled: this.config.enabled,
      activeScans: this.activeScans,
      dailyScans: this.dailyScans,
      dailyLimit: this.config.dailyLimit,
      concurrent: this.config.concurrent,
    };
  }
}
