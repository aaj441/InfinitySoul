/**
 * Structured Logging System
 * For production observability on Railway/Vercel
 */

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
  stack?: string;
  userId?: string;
  requestId?: string;
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development';

  log(level: 'info' | 'warn' | 'error' | 'debug', message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      ...(error && { stack: error.stack })
    };

    if (this.isDev) {
      // Pretty print in development
      const color = {
        info: '\x1b[36m', // cyan
        warn: '\x1b[33m', // yellow
        error: '\x1b[31m', // red
        debug: '\x1b[35m' // magenta
      };
      const reset = '\x1b[0m';

      console.log(`${color[level]}[${entry.timestamp}] ${level.toUpperCase()}${reset} ${message}`, context || '');

      if (error) {
        console.error(error.stack);
      }
    } else {
      // JSON output in production (for log aggregation)
      console.log(JSON.stringify(entry));
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log('error', message, context, error);
  }

  debug(message: string, context?: Record<string, any>) {
    if (this.isDev) {
      this.log('debug', message, context);
    }
  }

  /**
   * Log HTTP request (use in middleware)
   */
  httpRequest(method: string, path: string, statusCode: number, duration: number, context?: Record<string, any>) {
    const level = statusCode >= 400 ? 'warn' : 'info';
    this.log(level, `${method} ${path} ${statusCode}`, {
      ...context,
      method,
      path,
      statusCode,
      durationMs: duration
    });
  }

  /**
   * Log database operation
   */
  dbOperation(operation: string, duration: number, success: boolean, context?: Record<string, any>) {
    const level = success ? 'info' : 'error';
    this.log(level, `DB ${operation}`, {
      ...context,
      operation,
      durationMs: duration,
      success
    });
  }

  /**
   * Log external API call
   */
  apiCall(service: string, endpoint: string, statusCode: number, duration: number, context?: Record<string, any>) {
    const level = statusCode >= 400 ? 'warn' : 'info';
    this.log(level, `${service} ${endpoint}`, {
      ...context,
      service,
      endpoint,
      statusCode,
      durationMs: duration
    });
  }
}

export const logger = new Logger();

export default logger;
