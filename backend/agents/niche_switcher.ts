/**
 * Niche Context Switcher
 * Manages industry-specific contexts for cyber insurance
 */

import * as fs from "fs";
import * as path from "path";

export interface NicheContext {
  id: string;
  name: string;
  description: string;
  risk_factors: string[];
  key_questions: string[];
  coverage_priorities: string[];
  typical_limits: {
    min: number;
    recommended: number;
    max: number;
  };
  outreach_templates?: {
    subject_line: string;
    opening: string;
    pain_points: string[];
    cta: string;
  };
  discovery_script_focus?: string[];
  [key: string]: any;
}

export class NicheContextSwitcher {
  private contextDir: string;
  private currentContext: NicheContext;

  constructor(contextDir: string) {
    this.contextDir = contextDir;
    this.currentContext = this.loadContext("generic");
  }

  /**
   * Set the active niche context
   */
  setMode(niche: string): NicheContext {
    this.currentContext = this.loadContext(niche);
    return this.currentContext;
  }

  /**
   * Get the current active context
   */
  getContext(): NicheContext {
    return this.currentContext;
  }

  /**
   * Load context from JSON file
   */
  private loadContext(niche: string): NicheContext {
    const contextPath = path.join(this.contextDir, `${niche}.json`);
    const fallbackPath = path.join(this.contextDir, "generic.json");

    try {
      // Try to load the requested niche
      if (fs.existsSync(contextPath)) {
        const data = fs.readFileSync(contextPath, "utf-8");
        return JSON.parse(data);
      }

      // Fall back to generic if niche not found
      console.warn(`Niche context '${niche}' not found, using generic`);
      if (fs.existsSync(fallbackPath)) {
        const data = fs.readFileSync(fallbackPath, "utf-8");
        return JSON.parse(data);
      }

      // Return minimal default if even generic is missing
      return this.getDefaultContext();
    } catch (error) {
      console.error(`Error loading context for niche '${niche}':`, error);
      return this.getDefaultContext();
    }
  }

  /**
   * Get default context when file loading fails
   */
  private getDefaultContext(): NicheContext {
    return {
      id: "generic",
      name: "Generic Business",
      description: "Default business cyber insurance context",
      risk_factors: ["revenue_size", "employee_count", "security_controls"],
      key_questions: ["What is your primary business?"],
      coverage_priorities: [
        "Data breach response",
        "Business interruption",
        "Ransomware",
      ],
      typical_limits: {
        min: 250000,
        recommended: 1000000,
        max: 5000000,
      },
    };
  }
}
