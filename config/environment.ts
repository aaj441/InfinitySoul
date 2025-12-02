/**
 * Environment Configuration and Validation Module
 *
 * Validates all required environment variables on startup.
 * Fails fast with clear error messages if configuration is invalid.
 *
 * Usage:
 *   import { config, validateEnvironment } from './config/environment';
 *
 *   // Validate on startup
 *   validateEnvironment();
 *
 *   // Access typed configuration
 *   const port = config.PORT;
 *   const apiUrl = config.API_URL;
 */

import Joi from 'joi';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Environment variable schema
 */
const envSchema = Joi.object({
  // Node environment
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production', 'test')
    .default('development'),

  // Server configuration
  PORT: Joi.number()
    .port()
    .default(8000)
    .description('API server port'),

  // Frontend URL (for CORS)
  NEXT_PUBLIC_API_URL: Joi.string()
    .uri()
    .default('http://localhost:8000')
    .description('API URL for frontend'),

  FRONTEND_URL: Joi.string()
    .uri()
    .default('http://localhost:3000')
    .description('Frontend URL for CORS'),

  // Error tracking
  SENTRY_DSN: Joi.string()
    .uri()
    .optional()
    .description('Sentry DSN for error tracking'),

  // Application version (for release tracking)
  APP_VERSION: Joi.string()
    .default('1.0.0')
    .description('Application version'),

  // Email service (optional for now)
  SENDGRID_API_KEY: Joi.string()
    .optional()
    .description('SendGrid API key for email'),

  // Payment processing (optional for now)
  STRIPE_PUBLIC_KEY: Joi.string()
    .optional()
    .description('Stripe public key'),

  STRIPE_SECRET_KEY: Joi.string()
    .optional()
    .description('Stripe secret key'),

  // Analytics (optional)
  MIXPANEL_TOKEN: Joi.string()
    .optional()
    .description('Mixpanel analytics token'),

  // Blockchain (optional for future use)
  POLYGON_RPC_URL: Joi.string()
    .uri()
    .optional()
    .description('Polygon RPC URL'),

  WALLET_ADDRESS: Joi.string()
    .optional()
    .description('Wallet address for blockchain'),

  PRIVATE_KEY: Joi.string()
    .optional()
    .description('Private key for blockchain'),

  // Database (when implemented)
  DATABASE_URL: Joi.string()
    .uri()
    .optional()
    .description('PostgreSQL database URL'),

  // Redis (when implemented)
  REDIS_URL: Joi.string()
    .uri()
    .optional()
    .description('Redis URL for caching'),

  // AI Services
  PERPLEXITY_API_KEY: Joi.string()
    .optional()
    .description('Perplexity AI API key'),

  ANTHROPIC_API_KEY: Joi.string()
    .optional()
    .description('Claude/Anthropic API key'),

  OPENAI_API_KEY: Joi.string()
    .optional()
    .description('OpenAI API key'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: Joi.number()
    .default(60000)
    .description('Rate limit window in milliseconds'),

  RATE_LIMIT_MAX_REQUESTS: Joi.number()
    .default(100)
    .description('Max requests per window'),

  // Security
  API_KEY: Joi.string()
    .optional()
    .description('API key for authentication (if needed)'),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'http', 'debug')
    .default('info')
    .description('Logging level'),

  // CORS origins (comma-separated)
  CORS_ORIGINS: Joi.string()
    .default('http://localhost:3000')
    .description('Allowed CORS origins (comma-separated)'),
})
  .unknown(true); // Allow other env vars

/**
 * Validated and typed configuration object
 */
export interface Config {
  NODE_ENV: 'development' | 'staging' | 'production' | 'test';
  PORT: number;
  NEXT_PUBLIC_API_URL: string;
  FRONTEND_URL: string;
  SENTRY_DSN?: string;
  APP_VERSION: string;
  SENDGRID_API_KEY?: string;
  STRIPE_PUBLIC_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  MIXPANEL_TOKEN?: string;
  POLYGON_RPC_URL?: string;
  WALLET_ADDRESS?: string;
  PRIVATE_KEY?: string;
  DATABASE_URL?: string;
  REDIS_URL?: string;
  PERPLEXITY_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  OPENAI_API_KEY?: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  API_KEY?: string;
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'http' | 'debug';
  CORS_ORIGINS: string;
}

let validatedConfig: Config;

/**
 * Validate environment variables
 * Throws an error if validation fails
 */
export const validateEnvironment = (): Config => {
  const { error, value } = envSchema.validate(process.env, {
    abortEarly: false, // Report all errors, not just the first one
    stripUnknown: false, // Keep unknown env vars
  });

  if (error) {
    const errorMessages = error.details.map((detail) => {
      const key = detail.path.join('.');
      const message = detail.message;
      return `  ❌ ${key}: ${message}`;
    });

    console.error('\n❌ Environment variable validation failed:\n');
    console.error(errorMessages.join('\n'));
    console.error('\n📝 Please check your .env file and ensure all required variables are set.');
    console.error('📄 See .env.example for reference.\n');

    throw new Error('Invalid environment configuration');
  }

  validatedConfig = value as Config;
  return validatedConfig;
};

/**
 * Get validated configuration
 * Must call validateEnvironment() first
 */
export const getConfig = (): Config => {
  if (!validatedConfig) {
    throw new Error('Configuration not validated. Call validateEnvironment() first.');
  }
  return validatedConfig;
};

/**
 * Check if we're in production
 */
export const isProduction = (): boolean => {
  return getConfig().NODE_ENV === 'production';
};

/**
 * Check if we're in development
 */
export const isDevelopment = (): boolean => {
  return getConfig().NODE_ENV === 'development';
};

/**
 * Check if we're in test mode
 */
export const isTest = (): boolean => {
  return getConfig().NODE_ENV === 'test';
};

/**
 * Get CORS origins as array
 */
export const getCorsOrigins = (): string[] => {
  const config = getConfig();
  return config.CORS_ORIGINS.split(',').map((origin) => origin.trim());
};

/**
 * Print configuration summary (sanitized)
 */
export const printConfig = () => {
  const config = getConfig();

  console.log('\n📋 Configuration Summary:');
  console.log('  Environment:', config.NODE_ENV);
  console.log('  Port:', config.PORT);
  console.log('  API URL:', config.NEXT_PUBLIC_API_URL);
  console.log('  Frontend URL:', config.FRONTEND_URL);
  console.log('  Log Level:', config.LOG_LEVEL);
  console.log('  Sentry:', config.SENTRY_DSN ? '✅ Enabled' : '❌ Disabled');
  console.log('  SendGrid:', config.SENDGRID_API_KEY ? '✅ Configured' : '❌ Not configured');
  console.log('  Stripe:', config.STRIPE_SECRET_KEY ? '✅ Configured' : '❌ Not configured');
  console.log('  Perplexity AI:', config.PERPLEXITY_API_KEY ? '✅ Configured' : '❌ Not configured');
  console.log('  Claude AI:', config.ANTHROPIC_API_KEY ? '✅ Configured' : '❌ Not configured');
  console.log('  OpenAI:', config.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured');
  console.log('  Database:', config.DATABASE_URL ? '✅ Connected' : '❌ Not configured');
  console.log('  Redis:', config.REDIS_URL ? '✅ Connected' : '❌ Not configured');
  console.log('');
};

/**
 * Export validated config as default
 */
export let config: Config;

try {
  config = validateEnvironment();
} catch (error) {
  // Will be caught on server startup
  config = {} as Config;
}

export default config;
