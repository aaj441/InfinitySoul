/**
 * Cyber Scan Configuration
 * Extracted configuration values for maintainability and testability
 */

export const CyberScanConfig = {
  // Timeouts (in milliseconds)
  timeouts: {
    dns: 5000,
    http: 10000,
    https: 10000,
    portScan: 2000,
  },

  // Severity scoring thresholds
  scoring: {
    // Multiple medium issues threshold for escalation to high
    mediumIssuesForHighSeverity: 2,
  },

  // Port scanning configuration
  portScanning: {
    // Common ports checked (shallow scan only)
    // 21=FTP, 22=SSH, 23=Telnet, 25=SMTP, 80=HTTP, 443=HTTPS,
    // 3389=RDP, 5432=PostgreSQL, 3306=MySQL, 27017=MongoDB
    commonPorts: [21, 22, 23, 25, 80, 443, 3389, 5432, 3306, 27017],
  },

  // Security headers to check
  securityHeaders: {
    critical: [
      "strict-transport-security",
      "x-frame-options",
      "x-content-type-options",
      "content-security-policy",
    ],
  },

  // Caching configuration
  cache: {
    // DNS cache TTL in milliseconds (24 hours)
    dnsTTL: 24 * 60 * 60 * 1000,
    // Certificate cache TTL in milliseconds (24 hours)
    certTTL: 24 * 60 * 60 * 1000,
    // Enable/disable caching
    enabled: true,
  },

  // Rate limiting and backoff
  rateLimiting: {
    // Maximum concurrent scans
    maxConcurrent: 10,
    // Initial backoff delay in milliseconds
    initialBackoff: 1000,
    // Maximum backoff delay in milliseconds
    maxBackoff: 30000,
    // Backoff multiplier
    backoffMultiplier: 2,
    // Add random jitter to backoff (0-1 range)
    jitterFactor: 0.1,
  },

  // File output configuration
  output: {
    // Directory paths (relative to cwd)
    evidenceDir: "evidence",
    reportsDir: "reports",
    leadsDir: "leads",
    // Evidence JSON schema version
    schemaVersion: "1.0.0",
  },

  // User agent for HTTP requests
  userAgent: "InfinitySoul-CyberScout/1.0",
} as const;

export type CyberScanConfigType = typeof CyberScanConfig;
