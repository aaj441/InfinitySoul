/**
 * Custom Error Classes for InfinitySoul
 * =====================================
 *
 * Provides typed, traceable error handling for the risk distribution framework.
 * Each error includes context, correlation IDs, and proper stack traces.
 *
 * @module errors
 */

/**
 * Base error class for all InfinitySoul errors
 */
export class InfinitySoulError extends Error {
  public readonly correlationId: string;
  public readonly context: Record<string, any>;
  public readonly timestamp: Date;

  constructor(
    message: string,
    correlationId?: string,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.correlationId = correlationId || `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.context = context || {};
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      correlationId: this.correlationId,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack,
    };
  }
}

/**
 * Validation error - thrown when input validation fails
 */
export class ValidationError extends InfinitySoulError {
  constructor(
    message: string,
    correlationId?: string,
    context?: Record<string, any>
  ) {
    super(`Validation Error: ${message}`, correlationId, context);
  }
}

/**
 * Orchestrator error - thrown during orchestration failures
 */
export class OrchestratorError extends InfinitySoulError {
  constructor(
    message: string,
    correlationId?: string,
    context?: Record<string, any>
  ) {
    super(`Orchestrator Error: ${message}`, correlationId, context);
  }
}

/**
 * Timeout error - thrown when operations exceed time limits
 */
export class TimeoutError extends InfinitySoulError {
  constructor(
    message: string,
    correlationId?: string,
    context?: Record<string, any>
  ) {
    super(`Timeout Error: ${message}`, correlationId, context);
  }
}

/**
 * Ethics policy violation error
 */
export class EthicsViolationError extends InfinitySoulError {
  constructor(
    message: string,
    correlationId?: string,
    context?: Record<string, any>
  ) {
    super(`Ethics Violation: ${message}`, correlationId, context);
  }
}

/**
 * Resource not found error
 */
export class NotFoundError extends InfinitySoulError {
  constructor(
    message: string,
    correlationId?: string,
    context?: Record<string, any>
  ) {
    super(`Not Found: ${message}`, correlationId, context);
  }
}

/**
 * Configuration error - invalid or missing configuration
 */
export class ConfigurationError extends InfinitySoulError {
  constructor(
    message: string,
    correlationId?: string,
    context?: Record<string, any>
  ) {
    super(`Configuration Error: ${message}`, correlationId, context);
  }
}
