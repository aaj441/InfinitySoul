/**
 * Standardized Error Classes for InfinitySoul
 *
 * Provides consistent error handling across the application.
 * Nitpick #14: Add proper error class for consistent error handling
 */

/**
 * Base application error
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    options?: {
      statusCode?: number;
      code?: string;
      isOperational?: boolean;
      context?: Record<string, unknown>;
    }
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = options?.statusCode || 500;
    this.code = options?.code || 'INTERNAL_ERROR';
    this.isOperational = options?.isOperational ?? true;
    this.context = options?.context;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error for invalid input
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
 * Not found error for missing resources
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
 * External service error for third-party failures
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
 * Database error for persistence layer failures
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
 * Configuration error for missing or invalid config
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
 * Parse error for JSON and data parsing failures
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

/**
 * Safely parse JSON with error handling
 * Nitpick #2 helper: JSON.parse with proper error handling
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
 * Nitpick #8 helper: parseInt with proper validation
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
 * Parse range strings like "1-10" or "500K-2M" to their midpoint or minimum value
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

  // If already a number, return it
  if (typeof value === 'number') {
    return { success: true, value };
  }

  const str = String(value).trim();

  // Try to parse as plain number first (but not if it looks like a range)
  const plainNumber = parseFloat(str);
  if (!isNaN(plainNumber) && !/\d\s*-\s*\d/.test(str)) {
    return { success: true, value: plainNumber };
  }

  // Handle range format: "1-10", "100-500", etc.
  const rangeMatch = str.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    const result = useMidpoint ? (min + max) / 2 : min;
    return { success: true, value: result };
  }

  // Handle K/M notation: "500K", "2M", "500K-2M"
  const kNotationMatch = str.match(/^(\d+(?:\.\d+)?)\s*K\s*-\s*(\d+(?:\.\d+)?)\s*M$/i);
  if (kNotationMatch) {
    const min = parseFloat(kNotationMatch[1]) * 1000;
    const max = parseFloat(kNotationMatch[2]) * 1000000;
    const result = useMidpoint ? (min + max) / 2 : min;
    return { success: true, value: result };
  }

  const kRangeMatch = str.match(/^(\d+(?:\.\d+)?)\s*K\s*-\s*(\d+(?:\.\d+)?)\s*K$/i);
  if (kRangeMatch) {
    const min = parseFloat(kRangeMatch[1]) * 1000;
    const max = parseFloat(kRangeMatch[2]) * 1000;
    const result = useMidpoint ? (min + max) / 2 : min;
    return { success: true, value: result };
  }

  const mRangeMatch = str.match(/^(\d+(?:\.\d+)?)\s*M\s*-\s*(\d+(?:\.\d+)?)\s*M$/i);
  if (mRangeMatch) {
    const min = parseFloat(mRangeMatch[1]) * 1000000;
    const max = parseFloat(mRangeMatch[2]) * 1000000;
    const result = useMidpoint ? (min + max) / 2 : min;
    return { success: true, value: result };
  }

  const singleKMatch = str.match(/^(\d+(?:\.\d+)?)\s*K$/i);
  if (singleKMatch) {
    return { success: true, value: parseFloat(singleKMatch[1]) * 1000 };
  }

  const singleMMatch = str.match(/^(\d+(?:\.\d+)?)\s*M$/i);
  if (singleMMatch) {
    return { success: true, value: parseFloat(singleMMatch[1]) * 1000000 };
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
 * Validate and sanitize URL to prevent SSRF attacks
 * Only allows http and https protocols with valid hostnames
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

    // Check protocol
    if (!allowedProtocols.includes(url.protocol)) {
      return {
        success: false,
        error: new ValidationError(
          `Invalid protocol. Only ${allowedProtocols.join(', ')} are allowed`
        ),
      };
    }

    // Check for localhost (including IPv6 and 127.0.0.0/8 range)
    if (!allowLocalhost) {
      const hostname = url.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname === '::1' ||
        hostname.startsWith('127.') ||
        hostname === '0.0.0.0' ||
        hostname === '[::]'
      ) {
        return {
          success: false,
          error: new ValidationError('Localhost URLs are not allowed'),
        };
      }
    }

    // Check for private IP ranges (basic check)
    if (!allowPrivateIPs) {
      const hostname = url.hostname;
      if (
        hostname.startsWith('10.') ||
        /^172\.(1[6-9]|2[0-9]|3[01])\./.test(hostname) || // 172.16.0.0/12
        hostname.startsWith('192.168.') ||
        hostname === '0.0.0.0' ||
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
} {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }

  // Log the full error server-side but return generic message to client
  console.error('Unexpected error:', error);
  return {
    success: false,
    error: 'An unexpected error occurred. Please try again later.',
    code: 'INTERNAL_ERROR',
  };
}

