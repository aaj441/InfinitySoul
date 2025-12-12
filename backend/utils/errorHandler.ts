/**
 * Error Handler - Sanitized Error Responses
 * 
 * Prevents information leakage by returning generic error messages to clients
 * while logging detailed error information internally with request IDs.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Error response format
 */
export interface ErrorResponse {
  success: false;
  error: string;
  requestId: string;
  timestamp: string;
}

/**
 * Internal error log entry
 */
interface ErrorLogEntry {
  requestId: string;
  timestamp: Date;
  error: Error;
  context?: Record<string, any>;
  stack?: string;
}

/**
 * Generic error messages by status code
 */
const GENERIC_ERROR_MESSAGES: Record<number, string> = {
  400: 'Bad request. Please check your input and try again.',
  401: 'Authentication required.',
  403: 'Access denied.',
  404: 'Resource not found.',
  409: 'Conflict. The resource already exists or is in use.',
  422: 'Invalid input. Please check your data and try again.',
  429: 'Too many requests. Please try again later.',
  500: 'An internal error occurred. Please try again later.',
  502: 'Service temporarily unavailable. Please try again later.',
  503: 'Service temporarily unavailable. Please try again later.',
  504: 'Request timeout. Please try again.',
};

/**
 * Format an error for client response (sanitized)
 * @param error - The error object
 * @param statusCode - HTTP status code (default: 500)
 * @param context - Optional context for internal logging
 * @returns Sanitized error response with request ID
 */
export function formatErrorResponse(
  error: Error | unknown,
  statusCode: number = 500,
  context?: Record<string, any>
): ErrorResponse {
  const requestId = uuidv4();
  const timestamp = new Date().toISOString();
  
  // Log the detailed error internally
  logErrorInternal({
    requestId,
    timestamp: new Date(),
    error: error instanceof Error ? error : new Error(String(error)),
    context,
    stack: error instanceof Error ? error.stack : undefined,
  });
  
  // Return generic message to client
  const genericMessage = GENERIC_ERROR_MESSAGES[statusCode] || GENERIC_ERROR_MESSAGES[500];
  
  return {
    success: false,
    error: genericMessage,
    requestId,
    timestamp,
  };
}

/**
 * Format a validation error (can include specific field errors)
 * @param message - User-friendly validation error message
 * @param fields - Optional field-specific errors
 * @returns Error response with validation details
 */
export function formatValidationError(
  message: string,
  fields?: Record<string, string>
): ErrorResponse & { fields?: Record<string, string> } {
  const requestId = uuidv4();
  const timestamp = new Date().toISOString();
  
  const response: ErrorResponse & { fields?: Record<string, string> } = {
    success: false,
    error: message,
    requestId,
    timestamp,
  };
  
  if (fields) {
    response.fields = fields;
  }
  
  return response;
}

/**
 * Check if an error message is safe to expose to clients
 * Safe messages are those explicitly set by application logic (not system errors)
 * @param message - The error message
 * @returns True if the message is safe to expose
 */
export function isSafeErrorMessage(message: string): boolean {
  const safePatterns = [
    /not found/i,
    /already exists/i,
    /invalid/i,
    /required/i,
    /must be/i,
    /cannot be/i,
  ];
  
  // Check if message matches known safe patterns
  return safePatterns.some(pattern => pattern.test(message));
}

/**
 * Format an error with conditional exposure
 * Exposes the actual message only if it's a known safe pattern
 * @param error - The error object
 * @param statusCode - HTTP status code
 * @param context - Optional context
 * @returns Error response with safe or generic message
 */
export function formatErrorConditional(
  error: Error | unknown,
  statusCode: number = 500,
  context?: Record<string, any>
): ErrorResponse {
  const requestId = uuidv4();
  const timestamp = new Date().toISOString();
  
  // Log the detailed error internally
  logErrorInternal({
    requestId,
    timestamp: new Date(),
    error: error instanceof Error ? error : new Error(String(error)),
    context,
    stack: error instanceof Error ? error.stack : undefined,
  });
  
  let errorMessage: string;
  
  if (error instanceof Error && isSafeErrorMessage(error.message)) {
    // Use the actual message if it's safe
    errorMessage = error.message;
  } else {
    // Use generic message
    errorMessage = GENERIC_ERROR_MESSAGES[statusCode] || GENERIC_ERROR_MESSAGES[500];
  }
  
  return {
    success: false,
    error: errorMessage,
    requestId,
    timestamp,
  };
}

/**
 * Log error details internally
 * In production, this should write to a logging service (e.g., Winston, Bunyan, CloudWatch)
 * @param entry - Error log entry
 */
function logErrorInternal(entry: ErrorLogEntry): void {
  // In development, log to console
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] Request ID: ${entry.requestId}`, {
      timestamp: entry.timestamp,
      message: entry.error.message,
      stack: entry.stack,
      context: entry.context,
    });
  } else {
    // In production, this should integrate with your logging service
    // For now, we'll still log to console but in a structured format
    console.error(JSON.stringify({
      level: 'error',
      requestId: entry.requestId,
      timestamp: entry.timestamp,
      message: entry.error.message,
      stack: entry.stack,
      context: entry.context,
    }));
  }
}

/**
 * Express middleware for error handling
 * Usage: app.use(errorHandlerMiddleware)
 */
export function errorHandlerMiddleware(
  error: Error,
  req: any,
  res: any,
  next: any
): void {
  const statusCode = (error as any).statusCode || 500;
  const errorResponse = formatErrorResponse(error, statusCode, {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
  });
  
  res.status(statusCode).json(errorResponse);
}
