import { BrowserBackend, type ScanRequest, type ScanResponse } from "./base-backend";

/**
 * Mock Backend - Generates realistic WCAG violations for testing
 * 
 * Returns actual Axe-core format violations without needing a real browser.
 * Perfect for development and testing. Swap to Comet when credentials arrive.
 */
export class MockBackend extends BrowserBackend {
  constructor() {
    super({
      name: "Mock (Development)",
      enabled: !process.env.COMET_API_KEY && !process.env.NEON_API_TOKEN, // Auto-disable if real backend available
      concurrent: 10,
      dailyLimit: undefined, // Unlimited for development
    });
  }

  async initialize(): Promise<void> {
    console.log(`${this.config.name}: Ready (Mock data generation)`);
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
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

      // Generate realistic violations based on domain
      const violations = this.generateViolations(request.url);

      console.log(`${this.config.name}: Generated ${violations.length} violations for ${request.url}`);

      return {
        violations,
        error: undefined,
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

  private generateViolations(url: string) {
    // Seed randomness based on URL for consistency
    const seed = this.hashUrl(url);
    const random = this.seededRandom(seed);

    // Determine violation count (5-25 violations typical)
    const violationCount = 5 + Math.floor(random() * 20);
    const violations = [];

    // Common WCAG violations pool
    const violationTemplates = [
      {
        id: "color-contrast",
        impact: "serious",
        description: "Elements must have sufficient color contrast",
        help: "Ensures text is readable",
        helpUrl: "https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html",
        tags: ["wcag2aa", "wcag21aa", "contrast"],
      },
      {
        id: "image-alt",
        impact: "critical",
        description: "Images must have alternative text",
        help: "Provides text alternative for images",
        helpUrl: "https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html",
        tags: ["wcag2a", "wcag21a", "images"],
      },
      {
        id: "label",
        impact: "critical",
        description: "Form inputs must have labels",
        help: "Form controls need associated labels",
        helpUrl: "https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html",
        tags: ["wcag2a", "wcag21a", "forms"],
      },
      {
        id: "button-name",
        impact: "critical",
        description: "Buttons must have accessible names",
        help: "Buttons need text content or aria-label",
        helpUrl: "https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html",
        tags: ["wcag2a", "wcag21a", "buttons"],
      },
      {
        id: "heading-order",
        impact: "moderate",
        description: "Heading sequence should not skip levels",
        help: "Maintain proper h1-h6 hierarchy",
        helpUrl: "https://www.w3.org/WAI/WCAG21/Understanding/headings-and-labels.html",
        tags: ["wcag2a", "wcag21a", "headings"],
      },
      {
        id: "link-name",
        impact: "serious",
        description: "Links must have discernible text",
        help: "Links should have meaningful text",
        helpUrl: "https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html",
        tags: ["wcag2a", "wcag21a", "links"],
      },
      {
        id: "aria-required-parent",
        impact: "serious",
        description: "ARIA roles should have required parent",
        help: "Follow ARIA hierarchies correctly",
        helpUrl: "https://www.w3.org/WAI/ARIA/apg/",
        tags: ["wcag2a", "wcag21a", "aria"],
      },
      {
        id: "page-title",
        impact: "serious",
        description: "Page must have a title element",
        help: "Every page needs a meaningful title",
        helpUrl: "https://www.w3.org/WAI/WCAG21/Understanding/page-titled.html",
        tags: ["wcag2a", "wcag21a", "page"],
      },
    ];

    // Generate violations
    for (let i = 0; i < violationCount; i++) {
      const template = violationTemplates[Math.floor(random() * violationTemplates.length)];
      
      violations.push({
        id: template.id,
        impact: template.impact,
        description: template.description,
        help: template.help,
        helpUrl: template.helpUrl,
        tags: template.tags,
        nodes: [
          {
            html: `<${Math.random() > 0.5 ? "button" : "a"} class="element-${i}">Content</${Math.random() > 0.5 ? "button" : "a"}>`,
            target: [`.selector-${i}`, `#element-${i}`],
            failureSummary: `Fix ${template.description.toLowerCase()}`,
          },
        ],
      });
    }

    return violations;
  }

  private hashUrl(url: string): number {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  private seededRandom(seed: number) {
    return function() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }
}
