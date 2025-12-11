/**
 * Jest Setup File
 * Configures test environment and mocks
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/infinitysol_test';
process.env.CONSULTANT_SITE_ENABLED = 'true';
process.env.S3_BUCKET_NAME = 'test-bucket';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.EMAIL_QUEUE_ENABLED = 'true';
process.env.VPAT_GENERATION_ENABLED = 'true';

// Extend Jest timeout for integration tests
jest.setTimeout(30000);

// Store original console for potential restoration
const originalConsole = { ...console };

// Mock console methods to reduce noise in tests
// Note: Original console can be restored in specific tests if needed for debugging
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Export original console for tests that need it
(global as any).originalConsole = originalConsole;
