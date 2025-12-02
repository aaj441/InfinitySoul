#!/usr/bin/env ts-node
/**
 * Environment Validation Script
 * Validates all environment variables and exits with appropriate code
 */

import { validateEnvironment } from '../config/environment';

try {
  validateEnvironment();
  console.log('✅ Environment validated successfully');
  process.exit(0);
} catch (error: any) {
  console.error('❌ Environment validation failed');
  process.exit(1);
}
