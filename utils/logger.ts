/**
 * Logger - Stub for MVP deployment
 *
 * Simplified console-based logger that allows the build to succeed.
 * Full Winston integration will be added in Phase V completion.
 */

export interface Logger {
  info(message: string, ...meta: any[]): void;
  error(message: string, ...meta: any[]): void;
  warn(message: string, ...meta: any[]): void;
  debug(message: string, ...meta: any[]): void;
}

class ConsoleLogger implements Logger {
  info(message: string, ...meta: any[]) {
    console.log(`[INFO] ${message}`, ...meta);
  }

  error(message: string, ...meta: any[]) {
    console.error(`[ERROR] ${message}`, ...meta);
  }

  warn(message: string, ...meta: any[]) {
    console.warn(`[WARN] ${message}`, ...meta);
  }

  debug(message: string, ...meta: any[]) {
    console.log(`[DEBUG] ${message}`, ...meta);
  }
}

export const logger = new ConsoleLogger();
export default logger;
