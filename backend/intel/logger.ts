/**
 * Logger for InfinitySoul
 * =====================
 *
 * Provides structured logging with correlation IDs for tracing across the system.
 * Supports different log levels and contextual information.
 *
 * @module logger
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  correlationId?: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Simple structured logger for InfinitySoul
 * Can be replaced with winston/pino if preferred
 */
export class Logger {
  private minLevel: LogLevel;
  private context: Record<string, any>;
  private defaultCorrelationId?: string;

  constructor(
    minLevel: LogLevel = LogLevel.INFO,
    context?: Record<string, any>,
    defaultCorrelationId?: string
  ) {
    this.minLevel = minLevel;
    this.context = context || {};
    this.defaultCorrelationId = defaultCorrelationId;
  }

  /**
   * Create a child logger with additional context
   */
  createChild(context: Record<string, any>): Logger {
    return new Logger(
      this.minLevel,
      { ...this.context, ...context },
      this.defaultCorrelationId
    );
  }

  /**
   * Log at debug level
   */
  debug(message: string, context?: Record<string, any>, correlationId?: string): void {
    this.log(LogLevel.DEBUG, message, context, correlationId);
  }

  /**
   * Log at info level
   */
  info(message: string, context?: Record<string, any>, correlationId?: string): void {
    this.log(LogLevel.INFO, message, context, correlationId);
  }

  /**
   * Log at warn level
   */
  warn(message: string, context?: Record<string, any>, correlationId?: string): void {
    this.log(LogLevel.WARN, message, context, correlationId);
  }

  /**
   * Log at error level
   */
  error(message: string, error?: Error | Record<string, any>, context?: Record<string, any>, correlationId?: string): void {
    const errorInfo = error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : error;

    this.log(LogLevel.ERROR, message, { ...context, error: errorInfo }, correlationId);
  }

  /**
   * Internal log method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    correlationId?: string
  ): void {
    // Check log level
    const levels = Object.values(LogLevel);
    if (levels.indexOf(level) < levels.indexOf(this.minLevel)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId: correlationId || this.defaultCorrelationId,
      context: { ...this.context, ...context },
    };

    // Output based on level
    const logMethod = level === LogLevel.ERROR ? console.error : console.log;
    logMethod(JSON.stringify(entry));
  }
}

/**
 * Global logger instance
 */
export const globalLogger = new Logger(
  process.env.LOG_LEVEL ? (process.env.LOG_LEVEL as LogLevel) : LogLevel.INFO
);

/**
 * Create a logger for a specific module
 */
export const createLogger = (moduleName: string, correlationId?: string): Logger => {
  return globalLogger.createChild({ module: moduleName, correlationId });
};
