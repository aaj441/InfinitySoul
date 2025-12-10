/**
 * Tests for Scribe module
 * See: docs/STREET_CYBER_SCAN.md
 */

import { renderMarkdownReport } from "../../backend/cyber/scribe";
import { CyberRiskAnalysis, RiskIssue } from "../../backend/cyber/types";

describe("Scribe", () => {
  describe("renderMarkdownReport", () => {
    it("should generate a markdown report with domain and severity", () => {
      const mockIssue: RiskIssue = {
        id: "test-1",
        category: "encryption",
        severity: "high",
        title: "HTTPS Not Available",
        description: "The website does not support HTTPS connections.",
      };

      const mockAnalysis: CyberRiskAnalysis = {
        domain: "example.com",
        scannedAt: new Date("2025-12-10T22:00:00Z"),
        overallSeverity: "high",
        issues: [mockIssue],
        summary: "Security scan found 1 issue.",
      };

      const markdown = renderMarkdownReport(mockAnalysis);

      expect(markdown).toContain("# Security Report: example.com");
      expect(markdown).toContain("Overall Risk Level:");
      expect(markdown).toContain("HIGH RISK");
      expect(markdown).toContain("example.com");
    });

    it("should include all issues in the report", () => {
      const mockIssues: RiskIssue[] = [
        {
          id: "test-1",
          category: "encryption",
          severity: "high",
          title: "HTTPS Not Available",
          description: "No HTTPS support.",
        },
        {
          id: "test-2",
          category: "hygiene",
          severity: "medium",
          title: "Missing HSTS Header",
          description: "No HSTS configured.",
        },
      ];

      const mockAnalysis: CyberRiskAnalysis = {
        domain: "example.com",
        scannedAt: new Date("2025-12-10T22:00:00Z"),
        overallSeverity: "high",
        issues: mockIssues,
        summary: "Security scan found 2 issues.",
      };

      const markdown = renderMarkdownReport(mockAnalysis);

      expect(markdown).toContain("HTTPS Not Available");
      expect(markdown).toContain("Missing HSTS Header");
      expect(markdown).toContain("No HTTPS support");
      expect(markdown).toContain("No HSTS configured");
    });

    it("should group issues by severity", () => {
      const mockIssues: RiskIssue[] = [
        {
          id: "test-1",
          category: "encryption",
          severity: "high",
          title: "Critical Issue",
          description: "A critical problem.",
        },
        {
          id: "test-2",
          category: "hygiene",
          severity: "medium",
          title: "Medium Issue",
          description: "A medium problem.",
        },
        {
          id: "test-3",
          category: "configuration",
          severity: "low",
          title: "Minor Issue",
          description: "A minor problem.",
        },
      ];

      const mockAnalysis: CyberRiskAnalysis = {
        domain: "example.com",
        scannedAt: new Date("2025-12-10T22:00:00Z"),
        overallSeverity: "high",
        issues: mockIssues,
        summary: "Security scan found 3 issues.",
      };

      const markdown = renderMarkdownReport(mockAnalysis);

      expect(markdown).toContain("Critical Issues");
      expect(markdown).toContain("Moderate Issues");
      expect(markdown).toContain("Minor Issues");
      
      // Check order - critical should come before medium
      const criticalIndex = markdown.indexOf("Critical Issues");
      const mediumIndex = markdown.indexOf("Moderate Issues");
      const minorIndex = markdown.indexOf("Minor Issues");
      
      expect(criticalIndex).toBeLessThan(mediumIndex);
      expect(mediumIndex).toBeLessThan(minorIndex);
    });

    it("should include next steps section", () => {
      const mockAnalysis: CyberRiskAnalysis = {
        domain: "example.com",
        scannedAt: new Date("2025-12-10T22:00:00Z"),
        overallSeverity: "medium",
        issues: [],
        summary: "Security scan completed.",
      };

      const markdown = renderMarkdownReport(mockAnalysis);

      expect(markdown).toContain("What You Can Do Next");
      expect(markdown).toContain("Need Help?");
    });

    it("should tailor recommendations based on severity", () => {
      const highSeverityAnalysis: CyberRiskAnalysis = {
        domain: "example.com",
        scannedAt: new Date("2025-12-10T22:00:00Z"),
        overallSeverity: "high",
        issues: [],
        summary: "Critical issues found.",
      };

      const lowSeverityAnalysis: CyberRiskAnalysis = {
        domain: "example.com",
        scannedAt: new Date("2025-12-10T22:00:00Z"),
        overallSeverity: "low",
        issues: [],
        summary: "Minor issues found.",
      };

      const highMarkdown = renderMarkdownReport(highSeverityAnalysis);
      const lowMarkdown = renderMarkdownReport(lowSeverityAnalysis);

      expect(highMarkdown).toContain("critical");
      expect(highMarkdown).toContain("immediate");
      expect(lowMarkdown).toContain("maintain");
      expect(lowMarkdown).not.toContain("critical");
    });

    it("should include summary section", () => {
      const mockAnalysis: CyberRiskAnalysis = {
        domain: "example.com",
        scannedAt: new Date("2025-12-10T22:00:00Z"),
        overallSeverity: "medium",
        issues: [],
        summary: "Custom summary text here.",
      };

      const markdown = renderMarkdownReport(mockAnalysis);

      expect(markdown).toContain("## Summary");
      expect(markdown).toContain("Custom summary text here.");
    });

    it("should format dates correctly", () => {
      const mockAnalysis: CyberRiskAnalysis = {
        domain: "example.com",
        scannedAt: new Date("2025-12-10T22:15:30Z"),
        overallSeverity: "low",
        issues: [],
        summary: "Scan complete.",
      };

      const markdown = renderMarkdownReport(mockAnalysis);

      expect(markdown).toContain("Scan Date:");
      // Should contain some date formatting
      expect(markdown).toMatch(/\d{4}/); // Year
    });
  });
});
