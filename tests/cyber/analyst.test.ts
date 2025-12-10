/**
 * Tests for Analyst module
 * See: docs/STREET_CYBER_SCAN.md
 */

import { analyzeScoutResult } from "../../backend/cyber/analyst";
import { ScoutResult } from "../../backend/cyber/types";

describe("Analyst", () => {
  describe("analyzeScoutResult", () => {
    it("should generate high severity when HTTPS is not available", () => {
      const mockResult: ScoutResult = {
        domain: "example.com",
        resolvedIp: "93.184.216.34",
        httpReachable: true,
        httpsReachable: false,
        securityHeaders: {},
        openPorts: [80],
        rawFindings: [],
        scannedAt: new Date("2025-12-10T22:00:00Z"),
      };

      const analysis = analyzeScoutResult(mockResult);

      expect(analysis.domain).toBe("example.com");
      expect(analysis.overallSeverity).toBe("high");
      expect(analysis.issues.length).toBeGreaterThan(0);
      expect(analysis.issues.some((i) => i.category === "encryption")).toBe(true);
      expect(analysis.issues.some((i) => i.title.includes("HTTPS"))).toBe(true);
    });

    it("should generate medium severity for missing security headers", () => {
      const mockResult: ScoutResult = {
        domain: "example.com",
        resolvedIp: "93.184.216.34",
        httpReachable: false,
        httpsReachable: true,
        securityHeaders: {
          // All headers missing
        },
        openPorts: [443],
        rawFindings: [],
        scannedAt: new Date("2025-12-10T22:00:00Z"),
      };

      const analysis = analyzeScoutResult(mockResult);

      expect(analysis.overallSeverity).toBe("medium");
      expect(analysis.issues.length).toBeGreaterThan(0);
      expect(analysis.issues.some((i) => i.title.includes("HSTS"))).toBe(true);
    });

    it("should detect exposed database ports as high severity", () => {
      const mockResult: ScoutResult = {
        domain: "example.com",
        resolvedIp: "93.184.216.34",
        httpReachable: false,
        httpsReachable: true,
        securityHeaders: {
          "strict-transport-security": "max-age=31536000",
          "x-frame-options": "DENY",
          "x-content-type-options": "nosniff",
          "content-security-policy": "default-src 'self'",
        },
        openPorts: [443, 3306], // MySQL exposed
        rawFindings: [],
        scannedAt: new Date("2025-12-10T22:00:00Z"),
      };

      const analysis = analyzeScoutResult(mockResult);

      expect(analysis.overallSeverity).toBe("high");
      expect(analysis.issues.some((i) => i.title.includes("MySQL"))).toBe(true);
      expect(analysis.issues.find((i) => i.title.includes("MySQL"))?.severity).toBe("high");
    });

    it("should generate low severity for a well-configured site", () => {
      const mockResult: ScoutResult = {
        domain: "example.com",
        resolvedIp: "93.184.216.34",
        httpReachable: false,
        httpsReachable: true,
        securityHeaders: {
          "strict-transport-security": "max-age=31536000",
          "x-frame-options": "DENY",
          "x-content-type-options": "nosniff",
        },
        openPorts: [443],
        rawFindings: [],
        scannedAt: new Date("2025-12-10T22:00:00Z"),
      };

      const analysis = analyzeScoutResult(mockResult);

      expect(analysis.overallSeverity).toBe("low");
      expect(analysis.issues.length).toBeGreaterThan(0); // Still has CSP missing
    });

    it("should properly categorize issues", () => {
      const mockResult: ScoutResult = {
        domain: "example.com",
        resolvedIp: "93.184.216.34",
        httpReachable: true,
        httpsReachable: true,
        securityHeaders: {},
        openPorts: [80, 443, 3389],
        rawFindings: [],
        scannedAt: new Date("2025-12-10T22:00:00Z"),
      };

      const analysis = analyzeScoutResult(mockResult);

      const categories = new Set(analysis.issues.map((i) => i.category));
      expect(categories.has("encryption") || categories.has("configuration")).toBe(true);
      expect(categories.has("hygiene")).toBe(true);
      expect(categories.has("exposure")).toBe(true);
    });

    it("should generate a summary with issue counts", () => {
      const mockResult: ScoutResult = {
        domain: "example.com",
        resolvedIp: "93.184.216.34",
        httpReachable: true,
        httpsReachable: false,
        securityHeaders: {},
        openPorts: [80],
        rawFindings: [],
        scannedAt: new Date("2025-12-10T22:00:00Z"),
      };

      const analysis = analyzeScoutResult(mockResult);

      expect(analysis.summary).toContain("example.com");
      expect(analysis.summary).toContain("issue");
      expect(typeof analysis.summary).toBe("string");
      expect(analysis.summary.length).toBeGreaterThan(0);
    });

    it("should escalate overall severity with multiple medium issues", () => {
      const mockResult: ScoutResult = {
        domain: "example.com",
        resolvedIp: "93.184.216.34",
        httpReachable: true,
        httpsReachable: true,
        securityHeaders: {}, // Multiple missing headers = multiple medium issues
        openPorts: [80, 443, 22], // SSH open = medium
        rawFindings: [],
        scannedAt: new Date("2025-12-10T22:00:00Z"),
      };

      const analysis = analyzeScoutResult(mockResult);

      // Should have multiple medium issues which escalates to high
      const mediumCount = analysis.issues.filter((i) => i.severity === "medium").length;
      expect(mediumCount).toBeGreaterThanOrEqual(3);
      expect(analysis.overallSeverity).toBe("high");
    });
  });
});
