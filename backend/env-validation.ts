/**
 * Environment Variable Validation
 * Crashes immediately if critical ENV vars are missing
 * Prevents silent failures in production
 */

import { logger } from './logger';

interface EnvConfig {
  NODE_ENV: 'development' | 'production';
  PORT: number;
  DATABASE_URL: string;
  REDIS_URL: string;
  BROWSERLESS_API_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  ALLOWED_ORIGINS: string;
}

/**
 * Validate and load environment variables
 * Throws if any critical variable is missing
 */
export function validateEnv(): EnvConfig {
  const requiredVars = [
    'PORT',
    'DATABASE_URL',
    'REDIS_URL',
    'BROWSERLESS_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ];

  const missing: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    logger.error(
      `❌ Missing required environment variables: ${missing.join(', ')}`,
      new Error('ENV_VALIDATION_FAILED'),
      { missing }
    );
    console.error(
      `\n⚠️  CRITICAL: Missing environment variables: ${missing.join(', ')}\n`
    );
    process.exit(1);
  }

  return {
    NODE_ENV: (process.env.NODE_ENV || 'production') as any,
    PORT: parseInt(process.env.PORT || '8000', 10),
    DATABASE_URL: process.env.DATABASE_URL!,
    REDIS_URL: process.env.REDIS_URL!,
    BROWSERLESS_API_KEY: process.env.BROWSERLESS_API_KEY!,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001'
  };
}

/**
 * Print environment status for debugging
 */
export function printEnvStatus() {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║       Environment Configuration        ║');
    console.log('╚════════════════════════════════════════╝\n');

    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`PORT: ${process.env.PORT}`);
    console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✓ set' : '✗ missing'}`);
    console.log(`REDIS_URL: ${process.env.REDIS_URL ? '✓ set' : '✗ missing'}`);
    console.log(`BROWSERLESS_API_KEY: ${process.env.BROWSERLESS_API_KEY ? '✓ set' : '✗ missing'}`);
    console.log(`STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? '✓ set' : '✗ missing'}`);
    console.log(`STRIPE_WEBHOOK_SECRET: ${process.env.STRIPE_WEBHOOK_SECRET ? '✓ set' : '✗ missing'}`);
    console.log(`ALLOWED_ORIGINS: ${process.env.ALLOWED_ORIGINS || 'default'}\n`);
  }
}
