/**
 * Error Tracking and Monitoring Module for InfinitySol
 *
 * Integrates with Sentry for real-time error tracking and monitoring.
 * Provides custom error classes and error handling utilities.
 *
 * Usage:
 *   import { initErrorTracking, captureError, AppError } from './utils/errorTracking';
 *
 *   // Initialize on startup
 *   initErrorTracking();
 *
 *   // Capture errors
 *   throw new AppError('Invalid input', 400, 'VALIDATION_ERROR');
 *   captureError(error, { url, userId });
 */

import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { logger } from './logger';

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error class
 */
export class ValidationError extends AppError {
  constructor(message: string, public details?: any) {
    super(message, 400, 'VALIDATION_ERROR', true);
  }
}

/**
 * Not Found error class
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND', true);
  }
}

/**
 * Unauthorized error class
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED', true);
  }
}

/**
 * Rate Limit error class
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', true);
  }
}

/**
 * External Service error class
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super(`${service} error: ${message}`, 503, 'EXTERNAL_SERVICE_ERROR', false);
  }
}

/**
 * Initialize Sentry error tracking
 */
export const initErrorTracking = () => {
  const sentryDsn = process.env.SENTRY_DSN;

  if (!sentryDsn) {
    logger.warn('SENTRY_DSN not configured. Error tracking disabled.');
    logger.warn('To enable error tracking, set SENTRY_DSN environment variable.');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.APP_VERSION || 'unknown',

    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      new ProfilingIntegration(),
    ],

    // Filter sensitive data
    beforeSend(event, hint) {
      // Don't send operational errors to Sentry (validation, not found, etc.)
      const error = hint.originalException;
      if (error instanceof AppError && error.isOperational) {
        return null;
      }

      // Sanitize sensitive data
      if (event.request) {
        // Remove sensitive headers
        if (event.request.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
          delete event.request.headers['x-api-key'];
        }

        // Remove sensitive query params
        if (event.request.query_string && typeof event.request.query_string === 'string') {
          event.request.query_string = event.request.query_string
            .replace(/api[_-]?key=[^&]*/gi, 'api_key=[REDACTED]')
            .replace(/token=[^&]*/gi, 'token=[REDACTED]')
            .replace(/password=[^&]*/gi, 'password=[REDACTED]');
        }
      }

      // Sanitize user data
      if (event.user) {
        delete event.user.ip_address;
      }

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Browser errors
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      // Network errors
      'Network request failed',
      'NetworkError',
      // Validation errors (handled operationally)
      'VALIDATION_ERROR',
      'NOT_FOUND',
    ],
  });

  logger.info('✅ Sentry error tracking initialized');
};

/**
 * Capture an error and send it to Sentry
 */
export const captureError = (
  error: Error,
  context?: {
    userId?: string;
    url?: string;
    operation?: string;
    extra?: Record<string, any>;
  }
) => {
  // Log to console/file
  logger.error('Error captured', {
    error: error.message,
    stack: error.stack,
    ...context,
  });

  // Send to Sentry if initialized
  const client = Sentry.getClient();
  if (client) {
    Sentry.captureException(error, {
      user: context?.userId ? { id: context.userId } : undefined,
      tags: {
        operation: context?.operation,
        url: context?.url,
      },
      extra: context?.extra,
    });
  }
};

/**
 * Capture a message (for non-error events you want to track)
 */
export const captureMessage = (
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, any>
) => {
  logger[level === 'warning' ? 'warn' : level](message, context);

  const client = Sentry.getClient();
  if (client) {
    Sentry.captureMessage(message, {
      level: level === 'warning' ? 'warning' : level,
      extra: context,
    });
  }
};

/**
 * Add user context to error tracking
 */
export const setUserContext = (userId: string, email?: string) => {
  const client = Sentry.getClient();
  if (client) {
    Sentry.setUser({ id: userId, email });
  }
};

/**
 * Add custom context to error tracking
 */
export const addBreadcrumb = (message: string, category: string, data?: any) => {
  const client = Sentry.getClient();
  if (client) {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
      timestamp: Date.now() / 1000,
    });
  }
};

/**
 * Express error handler middleware
 * Should be added AFTER all routes
 */
export const errorHandler = (err: Error, req: any, res: any, _next: any) => {
  // Handle known application errors
  if (err instanceof AppError) {
    logger.warn('Application error', {
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      url: req.url,
      method: req.method,
    });

    return res.status(err.statusCode).json({
      status: 'error',
      code: err.code,
      message: err.message,
      ...(err instanceof ValidationError && err.details ? { details: err.details } : {}),
    });
  }

  // Handle unknown errors
  captureError(err, {
    url: req.url,
    operation: `${req.method} ${req.path}`,
    extra: {
      body: req.body,
      params: req.params,
      query: req.query,
    },
  });

  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  return res.status(500).json({
    status: 'error',
    code: 'INTERNAL_ERROR',
    message: isDevelopment ? err.message : 'An unexpected error occurred',
    ...(isDevelopment ? { stack: err.stack } : {}),
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Shutdown error tracking gracefully
 */
export const shutdownErrorTracking = async () => {
  const client = Sentry.getClient();
  if (client) {
    logger.info('Shutting down error tracking...');
    await Sentry.close(2000);
    logger.info('Error tracking shut down');
  }
};

export default {
  initErrorTracking,
  captureError,
  captureMessage,
  setUserContext,
  addBreadcrumb,
  errorHandler,
  asyncHandler,
  shutdownErrorTracking,
  // Error classes
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  RateLimitError,
  ExternalServiceError,
};
