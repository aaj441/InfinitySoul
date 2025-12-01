/**
 * Redis-Based Rate Limiting
 * TIER 1 CRITICAL: Enables horizontal scaling across multiple Vercel instances
 *
 * Replaces in-memory rate limiting which doesn't work with multiple instances
 * Uses Redis to store rate limit counters shared across all servers
 */

import { Redis } from 'ioredis';
import { Request, Response, NextFunction } from 'express';
import redis from './redisConfig';
import { logger } from './logger';

/**
 * Rate limit configuration by route
 */
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window per IP
  message: string; // Error message
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  '/api/v1/scan': {
    windowMs: 60000, // 1 minute
    maxRequests: 10,
    message: 'Too many scan requests. Maximum 10 scans per minute.'
  },
  '/api/v1/litigation/:industry': {
    windowMs: 60000, // 1 minute
    maxRequests: 50,
    message: 'Too many litigation requests. Maximum 50 per minute.'
  },
  '/api/sonar/insights': {
    windowMs: 60000, // 1 minute
    maxRequests: 30,
    message: 'Too many insight requests. Maximum 30 per minute.'
  },
  '/api/sonar/insights-complete': {
    windowMs: 60000, // 1 minute
    maxRequests: 30,
    message: 'Too many insight requests. Maximum 30 per minute.'
  },
  '/api/webhooks/stripe': {
    windowMs: 1000, // 1 second (prevent webhook spam)
    maxRequests: 100,
    message: 'Webhook rate limit exceeded.'
  }
};

/**
 * Create Redis rate limiter middleware
 * Works across multiple server instances
 */
export function createRedisRateLimiter(config: RateLimitConfig) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = `rate-limit:${req.ip}:${req.path}`;
      const now = Date.now();

      // Get current count
      const countStr = await redis.get(key);
      const count = countStr ? parseInt(countStr, 10) : 0;

      // Check if limit exceeded
      if (count >= config.maxRequests) {
        // Get TTL to calculate retry-after
        const ttl = await redis.pttl(key);
        const retryAfter = Math.ceil(ttl / 1000);

        logger.warn('Rate limit exceeded', {
          ip: req.ip,
          path: req.path,
          count,
          maxRequests: config.maxRequests,
          retryAfter
        });

        return res.status(429).json({
          error: 'Too many requests',
          message: config.message,
          retryAfter,
          resetAt: new Date(now + ttl).toISOString()
        });
      }

      // Increment counter
      const newCount = await redis.incr(key);

      // Set expiry on first request in window
      if (newCount === 1) {
        await redis.pexpire(key, config.windowMs);
      }

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', config.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxRequests - newCount));
      res.setHeader('X-RateLimit-Reset', new Date(now + config.windowMs).toISOString());

      // Log rate limit info (sample 1% of requests to avoid noise)
      if (Math.random() < 0.01) {
        logger.debug('Rate limit check', {
          ip: req.ip,
          path: req.path,
          current: newCount,
          limit: config.maxRequests
        });
      }

      next();
    } catch (error) {
      logger.error('Rate limiter error', error as Error, {
        ip: req.ip,
        path: req.path
      });

      // On error, allow request through (fail open)
      // Don't want Redis failure to break the API
      next();
    }
  };
}

/**
 * Apply rate limiting to all routes
 * Call this in server.ts after middleware setup
 */
export function setupRateLimiting(app: any) {
  for (const [path, config] of Object.entries(RATE_LIMIT_CONFIGS)) {
    app.use(path, createRedisRateLimiter(config));
    logger.info('Rate limiter configured', {
      path,
      windowMs: config.windowMs,
      maxRequests: config.maxRequests
    });
  }
}

/**
 * Get current rate limit status for a user
 * Useful for frontend to show remaining requests
 */
export async function getRateLimitStatus(ip: string, path: string) {
  try {
    const config = RATE_LIMIT_CONFIGS[path];
    if (!config) {
      return null;
    }

    const key = `rate-limit:${ip}:${path}`;
    const countStr = await redis.get(key);
    const count = countStr ? parseInt(countStr, 10) : 0;
    const ttl = await redis.pttl(key);

    return {
      limit: config.maxRequests,
      current: count,
      remaining: Math.max(0, config.maxRequests - count),
      resetAt: new Date(Date.now() + (ttl > 0 ? ttl : config.windowMs)).toISOString(),
      nextAvailable: ttl > 0 ? Math.ceil(ttl / 1000) : 0
    };
  } catch (error) {
    logger.error('Error getting rate limit status', error as Error);
    return null;
  }
}

/**
 * Reset rate limit for a specific IP (admin function)
 */
export async function resetRateLimit(ip: string, path?: string) {
  try {
    if (path) {
      const key = `rate-limit:${ip}:${path}`;
      await redis.del(key);
      logger.info('Rate limit reset for IP and path', { ip, path });
    } else {
      // Reset all paths for this IP
      const pattern = `rate-limit:${ip}:*`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      logger.info('Rate limit reset for IP', { ip, paths: keys.length });
    }
  } catch (error) {
    logger.error('Error resetting rate limit', error as Error);
  }
}

/**
 * Whitelist an IP from rate limiting (for internal services)
 */
export async function whitelistIP(ip: string) {
  try {
    const key = `rate-limit-whitelist:${ip}`;
    await redis.set(key, '1', 'EX', 86400); // 24 hour expiry
    logger.info('IP whitelisted', { ip });
  } catch (error) {
    logger.error('Error whitelisting IP', error as Error);
  }
}

/**
 * Check if IP is whitelisted
 */
export async function isIPWhitelisted(ip: string): Promise<boolean> {
  try {
    const key = `rate-limit-whitelist:${ip}`;
    const result = await redis.exists(key);
    return result === 1;
  } catch (error) {
    logger.error('Error checking IP whitelist', error as Error);
    return false;
  }
}

export default {
  createRedisRateLimiter,
  setupRateLimiting,
  getRateLimitStatus,
  resetRateLimit,
  whitelistIP,
  isIPWhitelisted
};
