/**
 * Structured error response handler
 * Converts errors to consistent JSON format
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';
import { ZodError } from 'zod';

export interface ErrorResponse {
  error: string;
  code: string;
  timestamp: string;
  details?: Record<string, any>;
}

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error | AppError | ZodError | any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';
  let details: Record<string, any> | undefined;

  // Handle AppError (custom application errors)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  }
  // Handle Zod validation errors
  else if (err instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Request validation failed';
    details = err.errors.reduce(
      (acc, error) => {
        const path = error.path.join('.');
        acc[path] = error.message;
        return acc;
      },
      {} as Record<string, string>,
    );
  }
  // Handle standard errors
  else if (err instanceof Error) {
    message = err.message;
    code = err.name || 'ERROR';
  }

  const response: ErrorResponse = {
    error: message,
    code,
    timestamp: new Date().toISOString(),
    ...(details && { details }),
  };

  // Log error
  logger.error(message, err instanceof Error ? err : new Error(String(err)), {
    statusCode,
    code,
  });

  res.status(statusCode).json(response);
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super('Too many requests', 429, 'RATE_LIMITED');
  }
}
