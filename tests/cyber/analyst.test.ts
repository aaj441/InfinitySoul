/**
 * Tests for Analyst module
 * Verifies risk issue generation and severity computation
 */

import { analyzeScoutResult } from "../../backend/cyber/analyst";
import { ScoutResult } from "../../backend/cyber/types";

describe("Analyst - analyzeScoutResult", () => {
  const baseScoutResult: ScoutResult = {
    domain: "example.com",
    resolvedIp: "93.184.216.34",
    httpReachable: true,
    httpsReachable: true,
    securityHeaders: {},
    openPorts: [80, 443],
    rawFindings: [],
    scannedAt: new Date("2024-01-15T10:00:00Z"),
  };

  test("should return low severity for well-configured site", () => {
    const goodResult: ScoutResult = {
      ...baseScoutResult,
      securityHeaders: {
        "strict-transport-security": "max-age=31536000",
        "x-frame-options": "SAMEORIGIN",
        "x-content-type-options": "nosniff",
        "content-security-policy": "default-src 'self'",
      },
      httpReachable: false, // Only HTTPS
    };

    const analysis = analyzeScoutResult(goodResult);

    expect(analysis.domain).toBe("example.com");
    expect(analysis.overallSeverity).toBe("low");
    expect(analysis.issues.length).toBeLessThanOrEqual(1);
  });

  test("should detect missing HTTPS as high severity", () => {
    const noHttpsResult: ScoutResult = {
      ...baseScoutResult,
      httpsReachable: false,
      openPorts: [80],
    };

    const analysis = analyzeScoutResult(noHttpsResult);

    expect(analysis.overallSeverity).toBe("high");
    const httpsIssue = analysis.issues.find((i) => i.title.includes("HTTPS"));
    expect(httpsIssue).toBeDefined();
    expect(httpsIssue?.severity).toBe("high");
    expect(httpsIssue?.category).toBe("encryption");
  });

  test("should detect missing security headers", () => {
    const noHeadersResult: ScoutResult = {
      ...baseScoutResult,
      securityHeaders: {}, // All headers missing
    };

    const analysis = analyzeScoutResult(noHeadersResult);

    const headerIssue = analysis.issues.find((i) => i.title.includes("Security Headers"));
    expect(headerIssue).toBeDefined();
    expect(headerIssue?.category).toBe("hygiene");
  });

  test("should detect risky exposed ports", () => {
    const riskyPortsResult: ScoutResult = {
      ...baseScoutResult,
      openPorts: [80, 443, 3389, 3306], // RDP and MySQL exposed
    };

    const analysis = analyzeScoutResult(riskyPortsResult);

    const rdpIssue = analysis.issues.find((i) => i.title.includes("RDP"));
    const mysqlIssue = analysis.issues.find((i) => i.title.includes("MySQL"));

    expect(rdpIssue).toBeDefined();
    expect(rdpIssue?.severity).toBe("high");
    expect(rdpIssue?.category).toBe("exposure");

    expect(mysqlIssue).toBeDefined();
    expect(mysqlIssue?.severity).toBe("medium");
    expect(mysqlIssue?.category).toBe("exposure");
  });

  test("should compute high severity with multiple medium issues", () => {
    const multipleIssuesResult: ScoutResult = {
      ...baseScoutResult,
      securityHeaders: {}, // Missing headers (medium)
      openPorts: [80, 443, 3306, 5432], // Two databases exposed (2x medium)
    };

    const analysis = analyzeScoutResult(multipleIssuesResult);

    expect(analysis.overallSeverity).toBe("high");
    expect(analysis.issues.length).toBeGreaterThanOrEqual(2);
  });

  test("should detect DNS resolution failure", () => {
    const noDnsResult: ScoutResult = {
      ...baseScoutResult,
      resolvedIp: undefined,
      httpReachable: false,
      httpsReachable: false,
      openPorts: [],
    };

    const analysis = analyzeScoutResult(noDnsResult);

    const dnsIssue = analysis.issues.find((i) => i.title.includes("Domain Not Resolving"));
    expect(dnsIssue).toBeDefined();
    expect(dnsIssue?.severity).toBe("high");
  });

  test("should generate appropriate summary text", () => {
    const result: ScoutResult = {
      ...baseScoutResult,
      httpsReachable: false,
    };

    const analysis = analyzeScoutResult(result);

    expect(analysis.summary).toContain("example.com");
    expect(analysis.summary.length).toBeGreaterThan(20);
  });

  test("should handle site with no issues", () => {
    const perfectResult: ScoutResult = {
      ...baseScoutResult,
      httpReachable: false,
      httpsReachable: true,
      securityHeaders: {
        "strict-transport-security": "max-age=31536000",
        "x-frame-options": "DENY",
        "x-content-type-options": "nosniff",
        "content-security-policy": "default-src 'self'",
      },
      openPorts: [443],
    };

    const analysis = analyzeScoutResult(perfectResult);

    expect(analysis.overallSeverity).toBe("low");
    expect(analysis.issues.length).toBe(0);
    expect(analysis.summary).toContain("no significant security issues");
  });

  test("should include scannedAt timestamp", () => {
    const analysis = analyzeScoutResult(baseScoutResult);

    expect(analysis.scannedAt).toEqual(baseScoutResult.scannedAt);
  });
});
