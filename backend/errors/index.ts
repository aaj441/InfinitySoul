/**
 * UNIFIED ERROR HANDLING SYSTEM
 * =============================
 *
 * Consolidated error handling combining:
 * - HTTP status codes for API responses
 * - Correlation IDs for distributed tracing
 * - Utility functions for safe parsing
 *
 * MIGRATION: This replaces both:
 * - /backend/utils/errors.ts
 * - /backend/intel/errors.ts
 */

// =============================================================================
// BASE ERROR CLASS
// =============================================================================

/**
 * Base error class for all InfinitySoul errors
 * Combines HTTP-focused (statusCode) and tracing-focused (correlationId) approaches
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly correlationId: string;
  public readonly context: Record<string, unknown>;
  public readonly timestamp: Date;

  constructor(
    message: string,
    options?: {
      statusCode?: number;
      code?: string;
      isOperational?: boolean;
      correlationId?: string;
      context?: Record<string, unknown>;
    }
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = options?.statusCode || 500;
    this.code = options?.code || 'INTERNAL_ERROR';
    this.isOperational = options?.isOperational ?? true;
    this.correlationId = options?.correlationId || `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.context = options?.context || {};
    this.timestamp = new Date();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      correlationId: this.correlationId,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack,
    };
  }
}

// Legacy alias for backward compatibility
export const InfinitySoulError = AppError;

// =============================================================================
// HTTP ERROR CLASSES (4xx, 5xx)
// =============================================================================

/**
 * Validation error for invalid input (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      isOperational: true,
      context,
    });
  }
}

/**
 * Not found error for missing resources (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    super(`${resource}${identifier ? ` '${identifier}'` : ''} not found`, {
      statusCode: 404,
      code: 'NOT_FOUND',
      isOperational: true,
      context: { resource, identifier },
    });
  }
}

/**
 * External service error for third-party failures (502)
 */
export class ExternalServiceError extends AppError {
  public readonly service: string;

  constructor(service: string, message: string, context?: Record<string, unknown>) {
    super(`${service} error: ${message}`, {
      statusCode: 502,
      code: 'EXTERNAL_SERVICE_ERROR',
      isOperational: true,
      context: { service, ...context },
    });
    this.service = service;
  }
}

/**
 * Database error for persistence layer failures (500)
 */
export class DatabaseError extends AppError {
  constructor(operation: string, message: string) {
    super(`Database ${operation} failed: ${message}`, {
      statusCode: 500,
      code: 'DATABASE_ERROR',
      isOperational: true,
      context: { operation },
    });
  }
}

/**
 * Configuration error for missing or invalid config (500)
 */
export class ConfigurationError extends AppError {
  constructor(message: string) {
    super(message, {
      statusCode: 500,
      code: 'CONFIGURATION_ERROR',
      isOperational: false, // Config errors are programming errors
    });
  }
}

/**
 * Parse error for JSON and data parsing failures (400)
 */
export class ParseError extends AppError {
  constructor(type: string, message: string, context?: Record<string, unknown>) {
    super(`Failed to parse ${type}: ${message}`, {
      statusCode: 400,
      code: 'PARSE_ERROR',
      isOperational: true,
      context,
    });
  }
}

// =============================================================================
// OPERATIONAL ERROR CLASSES
// =============================================================================

/**
 * Orchestrator error - thrown during orchestration failures
 */
export class OrchestratorError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(`Orchestrator Error: ${message}`, {
      statusCode: 500,
      code: 'ORCHESTRATOR_ERROR',
      isOperational: true,
      context,
    });
  }
}

/**
 * Timeout error - thrown when operations exceed time limits
 */
export class TimeoutError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(`Timeout Error: ${message}`, {
      statusCode: 504,
      code: 'TIMEOUT_ERROR',
      isOperational: true,
      context,
    });
  }
}

/**
 * Ethics policy violation error
 */
export class EthicsViolationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(`Ethics Violation: ${message}`, {
      statusCode: 403,
      code: 'ETHICS_VIOLATION',
      isOperational: true,
      context,
    });
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse<T = unknown>(
  json: string,
  fallback?: T
): { success: true; data: T } | { success: false; error: ParseError } {
  try {
    const data = JSON.parse(json) as T;
    return { success: true, data };
  } catch (error) {
    const parseError = new ParseError(
      'JSON',
      error instanceof Error ? error.message : 'Unknown parse error',
      { input: json.slice(0, 100) }
    );

    if (fallback !== undefined) {
      return { success: true, data: fallback };
    }

    return { success: false, error: parseError };
  }
}

/**
 * Safely parse integer with validation
 */
export function safeParseInt(
  value: string | number | undefined,
  options?: { min?: number; max?: number; radix?: number; fallback?: number }
): { success: true; value: number } | { success: false; error: ValidationError } {
  const { min, max, radix = 10, fallback } = options || {};

  if (value === undefined || value === null || value === '') {
    if (fallback !== undefined) {
      return { success: true, value: fallback };
    }
    return {
      success: false,
      error: new ValidationError('Value is required'),
    };
  }

  const parsed = typeof value === 'number' ? value : parseInt(String(value), radix);

  if (isNaN(parsed)) {
    if (fallback !== undefined) {
      return { success: true, value: fallback };
    }
    return {
      success: false,
      error: new ValidationError(`Invalid integer: '${value}'`),
    };
  }

  if (min !== undefined && parsed < min) {
    return {
      success: false,
      error: new ValidationError(`Value must be at least ${min}, got ${parsed}`),
    };
  }

  if (max !== undefined && parsed > max) {
    return {
      success: false,
      error: new ValidationError(`Value must be at most ${max}, got ${parsed}`),
    };
  }

  return { success: true, value: parsed };
}

/**
 * Parse range strings like "1-10" or "500K-2M"
 */
export function parseRangeValue(
  value: string | number | undefined,
  options?: { useMidpoint?: boolean }
): { success: true; value: number } | { success: false; error: ValidationError } {
  const { useMidpoint = true } = options || {};

  if (value === undefined || value === null || value === '') {
    return {
      success: false,
      error: new ValidationError('Value is required'),
    };
  }

  if (typeof value === 'number') {
    return { success: true, value };
  }

  const str = String(value).trim();

  // Plain number
  const plainNumber = parseFloat(str);
  if (!isNaN(plainNumber) && !/\d\s*-\s*\d/.test(str)) {
    return { success: true, value: plainNumber };
  }

  // Range format: "1-10"
  const rangeMatch = str.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    return { success: true, value: useMidpoint ? (min + max) / 2 : min };
  }

  // K/M notation
  const multipliers: Record<string, number> = { k: 1000, m: 1000000 };
  const notationMatch = str.match(/^(\d+(?:\.\d+)?)\s*([KkMm])?$/);
  if (notationMatch) {
    const num = parseFloat(notationMatch[1]);
    const mult = multipliers[notationMatch[2]?.toLowerCase()] || 1;
    return { success: true, value: num * mult };
  }

  return {
    success: false,
    error: new ValidationError(`Unable to parse value: '${value}'`),
  };
}

/**
 * Type guard to check if value is non-null/undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Assert value is defined, throw if not
 */
export function assertDefined<T>(
  value: T | null | undefined,
  name: string
): asserts value is T {
  if (!isDefined(value)) {
    throw new ValidationError(`${name} is required but was ${value}`);
  }
}

/**
 * Validate URL to prevent SSRF attacks
 */
export function validateUrl(
  urlString: string,
  options?: {
    allowedProtocols?: string[];
    allowLocalhost?: boolean;
    allowPrivateIPs?: boolean;
  }
): { success: true; url: URL } | { success: false; error: ValidationError } {
  const {
    allowedProtocols = ['http:', 'https:'],
    allowLocalhost = false,
    allowPrivateIPs = false,
  } = options || {};

  try {
    const url = new URL(urlString);

    if (!allowedProtocols.includes(url.protocol)) {
      return {
        success: false,
        error: new ValidationError(
          `Invalid protocol. Only ${allowedProtocols.join(', ')} are allowed`
        ),
      };
    }

    if (!allowLocalhost) {
      const hostname = url.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname === '::1' ||
        hostname.startsWith('127.') ||
        hostname === '0.0.0.0'
      ) {
        return {
          success: false,
          error: new ValidationError('Localhost URLs are not allowed'),
        };
      }
    }

    if (!allowPrivateIPs) {
      const hostname = url.hostname;
      if (
        hostname.startsWith('10.') ||
        /^172\.(1[6-9]|2[0-9]|3[01])\./.test(hostname) ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('169.254.')
      ) {
        return {
          success: false,
          error: new ValidationError('Private IP addresses are not allowed'),
        };
      }
    }

    return { success: true, url };
  } catch (error) {
    return {
      success: false,
      error: new ValidationError(
        `Invalid URL format: ${error instanceof Error ? error.message : 'Unknown error'}`
      ),
    };
  }
}

/**
 * Format error for client response (prevents information leakage)
 */
export function formatErrorResponse(error: unknown): {
  success: false;
  error: string;
  code?: string;
  correlationId?: string;
} {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      correlationId: error.correlationId,
    };
  }

  console.error('Unexpected error:', error);
  return {
    success: false,
    error: 'An unexpected error occurred. Please try again later.',
    code: 'INTERNAL_ERROR',
  };
}
