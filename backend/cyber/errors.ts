/**
 * Custom Error Types for Cyber Scan Pipeline
 * Provides explicit error states for better error handling and debugging
 */

export class CyberScanError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly recoverable: boolean = false,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "CyberScanError";
    Object.setPrototypeOf(this, CyberScanError.prototype);
  }
}

export class DnsResolutionError extends CyberScanError {
  constructor(domain: string, originalError: Error) {
    super(
      `DNS resolution failed for ${domain}: ${originalError.message}`,
      "DNS_RESOLUTION_FAILED",
      true,
      { domain, originalError: originalError.message }
    );
    this.name = "DnsResolutionError";
  }
}

export class HttpCheckError extends CyberScanError {
  constructor(url: string, originalError: Error) {
    super(
      `HTTP check failed for ${url}: ${originalError.message}`,
      "HTTP_CHECK_FAILED",
      true,
      { url, originalError: originalError.message }
    );
    this.name = "HttpCheckError";
  }
}

export class PortScanError extends CyberScanError {
  constructor(host: string, port: number, originalError: Error) {
    super(
      `Port scan failed for ${host}:${port}: ${originalError.message}`,
      "PORT_SCAN_FAILED",
      true,
      { host, port, originalError: originalError.message }
    );
    this.name = "PortScanError";
  }
}

export class FileWriteError extends CyberScanError {
  constructor(filepath: string, originalError: Error) {
    super(
      `Failed to write file ${filepath}: ${originalError.message}`,
      "FILE_WRITE_FAILED",
      false,
      { filepath, originalError: originalError.message }
    );
    this.name = "FileWriteError";
  }
}

export class LeadLogError extends CyberScanError {
  constructor(domain: string, originalError: Error) {
    super(
      `Failed to log lead for ${domain}: ${originalError.message}`,
      "LEAD_LOG_FAILED",
      false,
      { domain, originalError: originalError.message }
    );
    this.name = "LeadLogError";
  }
}

export class CacheError extends CyberScanError {
  constructor(key: string, operation: "get" | "set", originalError: Error) {
    super(
      `Cache ${operation} failed for key ${key}: ${originalError.message}`,
      "CACHE_ERROR",
      true,
      { key, operation, originalError: originalError.message }
    );
    this.name = "CacheError";
  }
}

export class RateLimitError extends CyberScanError {
  constructor(resource: string, retryAfter?: number) {
    super(
      `Rate limit exceeded for ${resource}${retryAfter ? `, retry after ${retryAfter}ms` : ""}`,
      "RATE_LIMIT_EXCEEDED",
      true,
      { resource, retryAfter }
    );
    this.name = "RateLimitError";
  }
}

/**
 * Type guard to check if error is a CyberScanError
 */
export function isCyberScanError(error: unknown): error is CyberScanError {
  return error instanceof CyberScanError;
}

/**
 * Type guard to check if error is recoverable
 */
export function isRecoverableError(error: unknown): boolean {
  return isCyberScanError(error) && error.recoverable;
}
