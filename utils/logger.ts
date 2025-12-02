/**
 * Centralized Logging Module for InfinitySol
 *
 * Provides structured logging with multiple transports:
 * - Console (development)
 * - File rotation (production)
 * - Error tracking integration ready
 *
 * Usage:
 *   import { logger } from './utils/logger';
 *   logger.info('User scan started', { url, userId });
 *   logger.error('Scan failed', { error, url });
 */

import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// Determine log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// Define format for console (more readable in development)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaString}`;
  }),
);

// Define transports
const transports: winston.transport[] = [
  // Console transport (always enabled)
  new winston.transports.Console({
    format: consoleFormat,
  }),
];

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  // Create logs directory if it doesn't exist
  const logsDir = path.join(process.cwd(), 'logs');

  // All logs
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      format,
    }) as winston.transport
  );

  // Error logs only
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      format,
    }) as winston.transport
  );

  // HTTP request logs
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'http.log'),
      level: 'http',
      maxsize: 10485760, // 10MB
      maxFiles: 3,
      format,
    }) as winston.transport
  );
}

// Create the logger
export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false,
});

// Create specialized loggers for different modules
export const createModuleLogger = (module: string) => {
  return {
    error: (message: string, meta?: any) =>
      logger.error(message, { module, ...meta }),
    warn: (message: string, meta?: any) =>
      logger.warn(message, { module, ...meta }),
    info: (message: string, meta?: any) =>
      logger.info(message, { module, ...meta }),
    http: (message: string, meta?: any) =>
      logger.http(message, { module, ...meta }),
    debug: (message: string, meta?: any) =>
      logger.debug(message, { module, ...meta }),
  };
};

// HTTP request logging middleware for Express
export const httpLogger = (req: any, res: any, next: any) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip || req.connection.remoteAddress,
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request completed with error', logData);
    } else {
      logger.http('HTTP Request completed', logData);
    }
  });

  next();
};

// Audit logging for sensitive operations
export const auditLog = (action: string, userId: string | undefined, details: any) => {
  logger.info('AUDIT', {
    action,
    userId: userId || 'anonymous',
    timestamp: new Date().toISOString(),
    ...details,
  });
};

// Performance logging
export const performanceLog = (operation: string, startTime: number, metadata?: any) => {
  const duration = Date.now() - startTime;
  logger.info('Performance', {
    operation,
    duration: `${duration}ms`,
    ...metadata,
  });
};

// Startup banner
export const logStartup = (port: number | string) => {
  logger.info('='.repeat(60));
  logger.info('🚀 InfinitySol API Server Starting');
  logger.info(`📡 Port: ${port}`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📝 Log Level: ${level()}`);
  logger.info('='.repeat(60));
};

export default logger;
