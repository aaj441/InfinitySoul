/**
 * Tests for custom error types
 * Verifies error hierarchy and metadata
 */

import {
  CyberScanError,
  DnsResolutionError,
  HttpCheckError,
  PortScanError,
  FileWriteError,
  LeadLogError,
  CacheError,
  RateLimitError,
  isCyberScanError,
  isRecoverableError,
} from "../../backend/cyber/errors";

describe("Cyber Scan Errors", () => {
  describe("CyberScanError", () => {
    test("should create base error with metadata", () => {
      const error = new CyberScanError("Test error", "TEST_ERROR", true, { detail: "test" });
      
      expect(error.message).toBe("Test error");
      expect(error.code).toBe("TEST_ERROR");
      expect(error.recoverable).toBe(true);
      expect(error.context).toEqual({ detail: "test" });
      expect(error.name).toBe("CyberScanError");
    });
  });

  describe("DnsResolutionError", () => {
    test("should wrap DNS errors", () => {
      const originalError = new Error("ENOTFOUND");
      const error = new DnsResolutionError("example.com", originalError);
      
      expect(error.message).toContain("example.com");
      expect(error.message).toContain("ENOTFOUND");
      expect(error.code).toBe("DNS_RESOLUTION_FAILED");
      expect(error.recoverable).toBe(true);
      expect(error.context?.domain).toBe("example.com");
    });
  });

  describe("HttpCheckError", () => {
    test("should wrap HTTP errors", () => {
      const originalError = new Error("ECONNREFUSED");
      const error = new HttpCheckError("https://example.com", originalError);
      
      expect(error.message).toContain("https://example.com");
      expect(error.message).toContain("ECONNREFUSED");
      expect(error.code).toBe("HTTP_CHECK_FAILED");
      expect(error.recoverable).toBe(true);
    });
  });

  describe("PortScanError", () => {
    test("should wrap port scan errors", () => {
      const originalError = new Error("ETIMEDOUT");
      const error = new PortScanError("93.184.216.34", 443, originalError);
      
      expect(error.message).toContain("93.184.216.34:443");
      expect(error.message).toContain("ETIMEDOUT");
      expect(error.code).toBe("PORT_SCAN_FAILED");
      expect(error.recoverable).toBe(true);
      expect(error.context?.port).toBe(443);
    });
  });

  describe("FileWriteError", () => {
    test("should wrap file write errors", () => {
      const originalError = new Error("EACCES");
      const error = new FileWriteError("/path/to/file.json", originalError);
      
      expect(error.message).toContain("/path/to/file.json");
      expect(error.message).toContain("EACCES");
      expect(error.code).toBe("FILE_WRITE_FAILED");
      expect(error.recoverable).toBe(false);
    });
  });

  describe("LeadLogError", () => {
    test("should wrap lead logging errors", () => {
      const originalError = new Error("ENOSPC");
      const error = new LeadLogError("example.com", originalError);
      
      expect(error.message).toContain("example.com");
      expect(error.message).toContain("ENOSPC");
      expect(error.code).toBe("LEAD_LOG_FAILED");
      expect(error.recoverable).toBe(false);
    });
  });

  describe("CacheError", () => {
    test("should wrap cache errors", () => {
      const originalError = new Error("OOM");
      const error = new CacheError("dns:example.com", "set", originalError);
      
      expect(error.message).toContain("dns:example.com");
      expect(error.message).toContain("set");
      expect(error.message).toContain("OOM");
      expect(error.code).toBe("CACHE_ERROR");
      expect(error.recoverable).toBe(true);
      expect(error.context?.operation).toBe("set");
    });
  });

  describe("RateLimitError", () => {
    test("should create rate limit error with retry info", () => {
      const error = new RateLimitError("DNS API", 5000);
      
      expect(error.message).toContain("DNS API");
      expect(error.message).toContain("5000ms");
      expect(error.code).toBe("RATE_LIMIT_EXCEEDED");
      expect(error.recoverable).toBe(true);
      expect(error.context?.retryAfter).toBe(5000);
    });

    test("should create rate limit error without retry info", () => {
      const error = new RateLimitError("HTTP API");
      
      expect(error.message).toContain("HTTP API");
      expect(error.message).not.toContain("retry after");
      expect(error.recoverable).toBe(true);
    });
  });

  describe("Type Guards", () => {
    test("isCyberScanError should identify CyberScanError instances", () => {
      const cyberError = new DnsResolutionError("example.com", new Error("test"));
      const regularError = new Error("regular error");
      
      expect(isCyberScanError(cyberError)).toBe(true);
      expect(isCyberScanError(regularError)).toBe(false);
      expect(isCyberScanError("not an error")).toBe(false);
      expect(isCyberScanError(null)).toBe(false);
    });

    test("isRecoverableError should check recoverable flag", () => {
      const recoverableError = new DnsResolutionError("example.com", new Error("test"));
      const nonRecoverableError = new FileWriteError("/path/to/file", new Error("test"));
      const regularError = new Error("regular");
      
      expect(isRecoverableError(recoverableError)).toBe(true);
      expect(isRecoverableError(nonRecoverableError)).toBe(false);
      expect(isRecoverableError(regularError)).toBe(false);
    });
  });

  describe("Error Inheritance", () => {
    test("should maintain Error prototype chain", () => {
      const error = new DnsResolutionError("example.com", new Error("test"));
      
      expect(error instanceof Error).toBe(true);
      expect(error instanceof CyberScanError).toBe(true);
      expect(error instanceof DnsResolutionError).toBe(true);
    });

    test("should preserve stack trace", () => {
      const error = new HttpCheckError("https://example.com", new Error("test"));
      
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("HttpCheckError");
    });
  });
});
