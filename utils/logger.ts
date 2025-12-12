/**
 * Logger - Console-based logging with module context
 */

export interface Logger {
  info(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}

class ConsoleLogger implements Logger {
  private module: string;

  constructor(module?: string) {
    this.module = module || 'app';
  }

  private formatContext(context?: Record<string, unknown>): string {
    return context ? ` ${JSON.stringify(context)}` : '';
  }

  info(message: string, context?: Record<string, unknown>) {
    console.log(`[INFO] [${this.module}] ${message}${this.formatContext(context)}`);
  }

  error(message: string, context?: Record<string, unknown>) {
    console.error(`[ERROR] [${this.module}] ${message}${this.formatContext(context)}`);
  }

  warn(message: string, context?: Record<string, unknown>) {
    console.warn(`[WARN] [${this.module}] ${message}${this.formatContext(context)}`);
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.DEBUG) {
      console.log(`[DEBUG] [${this.module}] ${message}${this.formatContext(context)}`);
    }
  }
}

/**
 * Create a logger for a specific module
 */
export const createModuleLogger = (module: string): Logger => {
  return new ConsoleLogger(module);
};

export const logger = new ConsoleLogger();
export default logger;
