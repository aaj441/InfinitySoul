/**
 * Request validation middleware
 * Validates incoming request data before processing
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from './error-handler';
import { logger } from '../logger';

/**
 * Validate request body against a Zod schema
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.reduce(
          (acc, err) => {
            const path = err.path.join('.');
            acc[path] = err.message;
            return acc;
          },
          {} as Record<string, string>,
        );
        next(new ValidationError('Request body validation failed', details));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate UUID format
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate UUID in request params
 */
export function validateUUIDParam(paramName: string = 'id') {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];

    if (!id || !isValidUUID(id)) {
      logger.warn(`Invalid UUID format in ${paramName}`, { id, paramName });
      next(new ValidationError(`Invalid ${paramName} format. Must be a valid UUID.`));
    } else {
      next();
    }
  };
}

/**
 * Validate URL in query or body
 */
export function validateUrlParam(source: 'query' | 'body' = 'body', paramName: string = 'url') {
  return (req: Request, res: Response, next: NextFunction) => {
    const url = source === 'query' ? req.query[paramName] : req.body[paramName];

    if (!url || typeof url !== 'string') {
      next(new ValidationError(`${paramName} is required and must be a string`));
    } else if (!isValidUrl(url)) {
      logger.warn(`Invalid URL format in ${paramName}`, { url, paramName });
      next(new ValidationError(`${paramName} must be a valid URL`));
    } else {
      next();
    }
  };
}
