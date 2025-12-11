/**
 * Structured logging system
 * Provides consistent JSON-based logging with severity levels
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: string;
}

class Logger {
  private isDev = process.env.NODE_ENV !== 'production';

  log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context }),
      ...(error && { error: error.message }),
    };

    const output = this.isDev
      ? this.formatDev(entry)
      : JSON.stringify(entry);

    const logFn = level === 'error' ? console.error : console.log;
    logFn(output);
  }

  private formatDev(entry: LogEntry): string {
    const icon = {
      debug: '🔍',
      info: 'ℹ️ ',
      warn: '⚠️ ',
      error: '❌',
    }[entry.level];

    const contextStr = entry.context
      ? ` ${JSON.stringify(entry.context)}`
      : '';

    const errorStr = entry.error ? ` - ${entry.error}` : '';

    return `${icon} [${entry.timestamp}] ${entry.message}${contextStr}${errorStr}`;
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
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
}

export const logger = new Logger();
