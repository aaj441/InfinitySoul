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
