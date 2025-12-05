/**
 * Improvement Suggestions Generator
 * Concise, actionable recommendations from WCAG violations
 * Minimal data footprint - top 3-5 suggestions only
 */

import type { ScanViolation } from "./wcag-scanner";

export interface Suggestion {
  title: string; // Max 50 chars
  impact: "critical" | "high" | "medium"; // What gets fixed
  effort: "5min" | "1hour" | "1day"; // Estimated time
  action: string; // Single specific action
  priority: number; // 1-10 (higher = more important)
}

export interface SuggestionsBundle {
  quickWins: Suggestion[]; // Can do today (< 1 hour total)
  prioritized: Suggestion[]; // Top priorities for next week
  lowEffort: Suggestion[]; // Easy wins regardless of impact
  estimatedTimeToFix: string; // e.g., "2-3 hours"
  estimatedCost: string; // e.g., "$300-500"
}

export class SuggestionsGenerator {
  /**
   * Generate actionable suggestions from violations
   * Returns only top 3-5 suggestions to avoid cognitive overload
   */
  generateSuggestions(violations: ScanViolation[]): SuggestionsBundle {
    const suggestions: Suggestion[] = [];

    // Group by violation type to avoid duplicates
    const violationMap = new Map<string, ScanViolation[]>();
    for (const violation of violations) {
      const key = violation.violationType;
      if (!violationMap.has(key)) {
        violationMap.set(key, []);
      }
      violationMap.get(key)!.push(violation);
    }

    // Convert to suggestions
    for (const [violationType, group] of violationMap.entries()) {
      const suggestion = this.violationToSuggestion(violationType, group);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }

    // Sort by priority
    suggestions.sort((a, b) => b.priority - a.priority);

    // Return organized bundles
    return this.organizeSuggestions(suggestions.slice(0, 5)); // Top 5 only
  }

  /**
   * Convert a violation group to an actionable suggestion
   */
  private violationToSuggestion(
    violationType: string,
    group: ScanViolation[]
  ): Suggestion | null {
    const count = group.length;

    // Map violation types to specific actions
    const suggestionMap: Record<
      string,
      {
        title: string;
        effort: "5min" | "1hour" | "1day";
        action: string;
        impact: "critical" | "high" | "medium";
      }
    > = {
      "color-contrast": {
        title: "Fix Color Contrast Issues",
        effort: "1hour",
        action: `Update ${count} elements with insufficient contrast to meet WCAG AA standards (4.5:1 ratio)`,
        impact: "high",
      },
      "image-alt": {
        title: "Add Missing Alt Text",
        effort: "5min",
        action: `Add descriptive alt text to ${count} images (1-2 words per image)`,
        impact: "critical",
      },
      "heading-order": {
        title: "Fix Heading Hierarchy",
        effort: "5min",
        action: `Restructure ${count} headings to follow H1 → H2 → H3 sequence`,
        impact: "high",
      },
      "button-name": {
        title: "Label Buttons Properly",
        effort: "5min",
        action: `Add text labels to ${count} unlabeled buttons for screen readers`,
        impact: "critical",
      },
      "form-field-multiple-labels": {
        title: "Link Form Labels",
        effort: "1hour",
        action: `Associate ${count} form inputs with proper <label> elements`,
        impact: "critical",
      },
      "link-name": {
        title: "Clarify Link Text",
        effort: "5min",
        action: `Change ${count} generic links (e.g., "click here") to descriptive text`,
        impact: "high",
      },
      "aria-hidden-focus": {
        title: "Fix Hidden Element Focus",
        effort: "1hour",
        action: `Audit ${count} hidden elements with aria-hidden for keyboard trap issues`,
        impact: "medium",
      },
    };

    const mapped = suggestionMap[violationType];
    if (!mapped) return null;

    const basePriority: Record<"critical" | "high" | "medium", number> = {
      critical: 10,
      high: 7,
      medium: 4,
    };

    return {
      title: mapped.title,
      effort: mapped.effort,
      action: mapped.action,
      impact: mapped.impact,
      priority: basePriority[mapped.impact],
    };
  }

  /**
   * Organize suggestions into actionable bundles
   */
  private organizeSuggestions(suggestions: Suggestion[]): SuggestionsBundle {
    const quickWins = suggestions.filter((s) => s.effort === "5min").slice(0, 3);
    const prioritized = suggestions.slice(0, 3);
    const lowEffort = suggestions.filter((s) => s.effort !== "1day");

    // Estimate time (each suggestion group)
    const totalMinutes = suggestions.reduce((acc, s) => {
      if (s.effort === "5min") return acc + 5;
      if (s.effort === "1hour") return acc + 60;
      if (s.effort === "1day") return acc + 480;
      return acc;
    }, 0);

    const hours = Math.round(totalMinutes / 60);
    const estimatedTimeToFix =
      hours < 1 ? "< 1 hour" : hours <= 4 ? `${hours}-${hours + 1} hours` : `${hours} hours`;

    // Estimate cost ($150/hour typical consulting rate)
    const estimatedCost = `$${Math.round(hours * 150)}-${Math.round(hours * 200)}`;

    return {
      quickWins,
      prioritized,
      lowEffort,
      estimatedTimeToFix,
      estimatedCost,
    };
  }

  /**
   * Generate a compact summary for quick reference
   * Perfect for mobile or PDF reports
   */
  generateSummary(violations: ScanViolation[]): string {
    const suggestions = this.generateSuggestions(violations);
    const lines: string[] = [];

    lines.push("🎯 TOP PRIORITIES:");
    for (const s of suggestions.prioritized.slice(0, 3)) {
      lines.push(`• ${s.title} (${s.effort})`);
    }

    lines.push("\n⚡ QUICK WINS (can do today):");
    if (suggestions.quickWins.length > 0) {
      for (const s of suggestions.quickWins) {
        lines.push(`• ${s.title}`);
      }
    } else {
      lines.push("• No quick wins available");
    }

    lines.push(`\n⏱️ Est. Time: ${suggestions.estimatedTimeToFix}`);
    lines.push(`💰 Est. Cost: ${suggestions.estimatedCost}`);

    return lines.join("\n");
  }
}

export const suggestionsGenerator = new SuggestionsGenerator();
