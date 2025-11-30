/**
 * Redis Configuration for BullMQ
 * Hardened for production with retry logic and connection stability
 */

import { Redis } from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

/**
 * Main redis connection
 * CRITICAL: maxRetriesPerRequest: null is MANDATORY for BullMQ
 */
export const redis = new Redis(REDIS_URL, {
  // Connection retry
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  enableOfflineQueue: true,

  // Reconnection strategy
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000); // Max 2 second delay
    return delay;
  },

  // TCP settings
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,

  // Cluster/Sentinel support
  lazyConnect: false,

  // Logging
  ...(process.env.NODE_ENV === 'development' && {
    // Detailed logging in development
  })
});

/**
 * Redis connection events
 */
redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('ready', () => {
  console.log('✅ Redis ready');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});

redis.on('close', () => {
  console.warn('⚠️ Redis connection closed');
});

redis.on('reconnecting', () => {
  console.warn('🔄 Redis reconnecting...');
});

/**
 * Graceful shutdown
 */
export const closeRedis = async () => {
  try {
    await redis.quit();
    console.log('✅ Redis connection closed gracefully');
  } catch (error) {
    console.error('Error closing Redis:', error);
    process.exit(1);
  }
};

export default redis;
