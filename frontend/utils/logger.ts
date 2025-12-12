/**
 * Conditional Logger for Frontend
 * 
 * Prevents console logging in production environments
 * Only logs in development mode
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Logger interface that mirrors console but only logs in development
 */
export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  
  table: (...args: any[]) => {
    if (isDevelopment) {
      console.table(...args);
    }
  },
};

/**
 * Create a scoped logger with a prefix
 * @param scope - The scope/module name
 * @returns Logger with scope prefix
 */
export function createLogger(scope: string) {
  return {
    log: (...args: any[]) => logger.log(`[${scope}]`, ...args),
    info: (...args: any[]) => logger.info(`[${scope}]`, ...args),
    warn: (...args: any[]) => logger.warn(`[${scope}]`, ...args),
    error: (...args: any[]) => logger.error(`[${scope}]`, ...args),
    debug: (...args: any[]) => logger.debug(`[${scope}]`, ...args),
  };
}

export default logger;
