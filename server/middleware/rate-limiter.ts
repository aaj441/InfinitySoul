/**
 * Simple in-memory rate limiter
 * Tracks requests per IP and enforces limits
 */

import { Request, Response, NextFunction } from 'express';
import { RateLimitError } from './error-handler';
import { logger } from '../logger';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private store = new Map<string, RateLimitEntry>();

  constructor(
    private maxRequests: number,
    private windowMs: number, // in milliseconds
  ) {
    // Cleanup old entries every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (entry.resetTime < now) {
          this.store.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }

  getKey(req: Request): string {
    return req.ip || req.socket.remoteAddress || 'unknown';
  }

  isAllowed(req: Request): boolean {
    const key = this.getKey(req);
    const now = Date.now();
    const entry = this.store.get(key);

    // First request or reset time has passed
    if (!entry || entry.resetTime < now) {
      this.store.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    // Increment and check limit
    entry.count++;
    if (entry.count > this.maxRequests) {
      logger.warn('Rate limit exceeded', {
        ip: key,
        requests: entry.count,
        limit: this.maxRequests,
      });
      return false;
    }

    return true;
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.isAllowed(req)) {
        const resetTime = this.store.get(this.getKey(req))?.resetTime;
        res.set('Retry-After', String(Math.ceil((resetTime! - Date.now()) / 1000)));
        next(new RateLimitError());
      } else {
        next();
      }
    };
  }
}

// Rate limiters for different endpoints
export const quickWinLimiter = new RateLimiter(
  10, // 10 requests
  60 * 60 * 1000, // per hour
);

export const agentTriggerLimiter = new RateLimiter(
  5, // 5 requests
  60 * 1000, // per minute
);

export const apiGeneralLimiter = new RateLimiter(
  100, // 100 requests
  15 * 60 * 1000, // per 15 minutes
);
