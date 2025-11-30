/**
 * Global Error Handling System
 * Catches all crashes and prevents server meltdowns
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, true);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, true);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, true);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class RateLimitError extends AppError {
  constructor(public retryAfter: number) {
    super('Too many requests', 429, true);
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Wrapper for async route handlers
 * Catches promise rejections and passes to error middleware
 */
export const catchAsync = (fn: any) => {
  return (req: any, res: any, next: any) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Global error handler middleware
 * MUST be last in the middleware stack
 */
export const globalErrorHandler = (err: any, req: any, res: any, next: any) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Something went wrong!';

  // Wrong MongoDB ID error
  if (err.name === 'CastError') {
    err.statusCode = 400;
    err.message = `Invalid ${err.path}`;
  }

  // Log detailed error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 ERROR STACK:', err);
  }

  // Send error response
  if (err.isOperational) {
    // Operational, trusted error - send details to client
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      ...(err.retryAfter && { retryAfter: err.retryAfter })
    });
  } else {
    // Programming or unknown error - don't leak details to client
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Our team has been notified.',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
};

/**
 * Catch-all for unhandled promise rejections
 */
export const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (reason: any) => {
    console.error('💥 UNHANDLED REJECTION:', reason);
    // In production, send to error tracking service (Sentry, etc)
    // process.exit(1); // Restart the process
  });
};

/**
 * Catch-all for uncaught exceptions
 */
export const handleUncaughtException = () => {
  process.on('uncaughtException', (error: Error) => {
    console.error('💥 UNCAUGHT EXCEPTION:', error);
    // In production, send to error tracking service (Sentry, etc)
    // process.exit(1); // Restart the process
  });
};
