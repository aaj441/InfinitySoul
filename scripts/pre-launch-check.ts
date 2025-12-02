#!/usr/bin/env ts-node
/**
 * Pre-Launch Readiness Check Script
 *
 * Validates that all critical systems are configured and operational
 * before deploying to production.
 *
 * Usage:
 *   npm run check:prelaunch
 *   or
 *   ts-node scripts/pre-launch-check.ts
 */

import { validateEnvironment, config, printConfig } from '../config/environment';
import { logger } from '../utils/logger';
import { perplexityClient } from '../services/ai/perplexity';
import { claudeClient } from '../services/ai/claude';
import { openaiClient } from '../services/ai/openai';
import * as fs from 'fs';
import * as path from 'path';

interface CheckResult {
  category: string;
  check: string;
  status: 'pass' | 'warn' | 'fail' | 'skip';
  message: string;
  required: boolean;
}

const results: CheckResult[] = [];

/**
 * Add check result
 */
function addCheck(
  category: string,
  check: string,
  status: 'pass' | 'warn' | 'fail' | 'skip',
  message: string,
  required: boolean = false
): void {
  results.push({ category, check, status, message, required });

  const icon =
    status === 'pass' ? '✅' : status === 'warn' ? '⚠️ ' : status === 'fail' ? '❌' : '⏭️ ';
  const requiredTag = required ? ' [REQUIRED]' : '';
  console.log(`${icon} ${check}${requiredTag}: ${message}`);
}

/**
 * 1. Environment Configuration Checks
 */
function checkEnvironment(): void {
  console.log('\n1️⃣  Environment Configuration');
  console.log('='.repeat(80));

  try {
    validateEnvironment();
    addCheck('Environment', 'Config Validation', 'pass', 'All required variables present', true);
  } catch (error) {
    addCheck('Environment', 'Config Validation', 'fail', 'Validation failed', true);
    return;
  }

  // Check NODE_ENV
  if (config.NODE_ENV === 'production') {
    addCheck('Environment', 'NODE_ENV', 'pass', 'Set to production', true);
  } else {
    addCheck(
      'Environment',
      'NODE_ENV',
      'warn',
      `Currently: ${config.NODE_ENV} (should be 'production' for launch)`,
      true
    );
  }

  // Check PORT
  addCheck('Environment', 'PORT', 'pass', `Configured: ${config.PORT}`, true);

  // Check error tracking
  if (config.SENTRY_DSN) {
    addCheck('Environment', 'Error Tracking', 'pass', 'Sentry DSN configured', true);
  } else {
    addCheck(
      'Environment',
      'Error Tracking',
      'fail',
      'Sentry DSN not configured - CRITICAL for production',
      true
    );
  }

  // Check frontend URL
  if (config.FRONTEND_URL) {
    addCheck('Environment', 'Frontend URL', 'pass', config.FRONTEND_URL, false);
  } else {
    addCheck('Environment', 'Frontend URL', 'warn', 'Not configured (may affect CORS)', false);
  }
}

/**
 * 2. Logging Infrastructure Checks
 */
function checkLogging(): void {
  console.log('\n2️⃣  Logging Infrastructure');
  console.log('='.repeat(80));

  // Check if logger module exists
  const loggerPath = path.join(__dirname, '../utils/logger.ts');
  if (fs.existsSync(loggerPath)) {
    addCheck('Logging', 'Logger Module', 'pass', 'Centralized logger implemented', true);
  } else {
    addCheck('Logging', 'Logger Module', 'fail', 'Logger module not found', true);
    return;
  }

  // Check logs directory (only needed in production)
  if (config.NODE_ENV === 'production') {
    const logsDir = path.join(process.cwd(), 'logs');
    if (fs.existsSync(logsDir)) {
      addCheck('Logging', 'Logs Directory', 'pass', 'logs/ directory exists', false);
    } else {
      addCheck(
        'Logging',
        'Logs Directory',
        'warn',
        'logs/ directory will be created on startup',
        false
      );
    }
  } else {
    addCheck('Logging', 'Logs Directory', 'skip', 'Only required in production', false);
  }

  // Test logger
  try {
    logger.info('Pre-launch check: Logger test');
    addCheck('Logging', 'Logger Functionality', 'pass', 'Logger working', true);
  } catch (error: any) {
    addCheck('Logging', 'Logger Functionality', 'fail', error.message, true);
  }
}

/**
 * 3. Error Tracking Checks
 */
function checkErrorTracking(): void {
  console.log('\n3️⃣  Error Tracking');
  console.log('='.repeat(80));

  // Check if error tracking module exists
  const errorTrackingPath = path.join(__dirname, '../utils/errorTracking.ts');
  if (fs.existsSync(errorTrackingPath)) {
    addCheck('Error Tracking', 'Module', 'pass', 'Error tracking module exists', true);
  } else {
    addCheck('Error Tracking', 'Module', 'fail', 'Error tracking module not found', true);
    return;
  }

  // Check Sentry configuration
  if (config.SENTRY_DSN) {
    addCheck('Error Tracking', 'Sentry', 'pass', 'Sentry DSN configured', true);

    // Validate DSN format
    if (config.SENTRY_DSN.startsWith('https://') && config.SENTRY_DSN.includes('@')) {
      addCheck('Error Tracking', 'Sentry DSN Format', 'pass', 'Valid format', true);
    } else {
      addCheck('Error Tracking', 'Sentry DSN Format', 'warn', 'DSN format may be invalid', true);
    }
  } else {
    addCheck('Error Tracking', 'Sentry', 'fail', 'Not configured - REQUIRED for production', true);
  }
}

/**
 * 4. AI Services Checks
 */
function checkAIServices(): void {
  console.log('\n4️⃣  Multi-AI Integration');
  console.log('='.repeat(80));

  let configuredCount = 0;

  // Check Perplexity
  if (perplexityClient.isAvailable()) {
    addCheck('AI Services', 'Perplexity', 'pass', 'API key configured', false);
    configuredCount++;
  } else {
    addCheck('AI Services', 'Perplexity', 'warn', 'Not configured (optional)', false);
  }

  // Check Claude
  if (claudeClient.isAvailable()) {
    addCheck('AI Services', 'Claude', 'pass', 'API key configured', false);
    configuredCount++;
  } else {
    addCheck('AI Services', 'Claude', 'warn', 'Not configured (optional)', false);
  }

  // Check OpenAI
  if (openaiClient.isAvailable()) {
    addCheck('AI Services', 'OpenAI', 'pass', 'API key configured', false);
    configuredCount++;
  } else {
    addCheck('AI Services', 'OpenAI', 'warn', 'Not configured (optional)', false);
  }

  // Summary
  if (configuredCount === 0) {
    addCheck(
      'AI Services',
      'Summary',
      'warn',
      'No AI services configured - AI features will not work',
      false
    );
  } else if (configuredCount === 1) {
    addCheck(
      'AI Services',
      'Summary',
      'warn',
      `Only ${configuredCount} service configured - consider adding more for redundancy`,
      false
    );
  } else {
    addCheck(
      'AI Services',
      'Summary',
      'pass',
      `${configuredCount} services configured - good for redundancy`,
      false
    );
  }
}

/**
 * 5. File Structure Checks
 */
function checkFileStructure(): void {
  console.log('\n5️⃣  File Structure');
  console.log('='.repeat(80));

  const criticalFiles = [
    { path: 'backend/server.ts', name: 'Backend Server' },
    { path: 'services/wcagScanner.ts', name: 'WCAG Scanner' },
    { path: 'types/index.ts', name: 'Type Definitions' },
    { path: 'utils/logger.ts', name: 'Logger' },
    { path: 'utils/errorTracking.ts', name: 'Error Tracking' },
    { path: 'config/environment.ts', name: 'Environment Config' },
    { path: 'tsconfig.json', name: 'TypeScript Config' },
    { path: '.env', name: 'Environment Variables' },
  ];

  criticalFiles.forEach((file) => {
    const fullPath = path.join(process.cwd(), file.path);
    if (fs.existsSync(fullPath)) {
      addCheck('File Structure', file.name, 'pass', `${file.path} exists`, true);
    } else {
      addCheck('File Structure', file.name, 'fail', `${file.path} not found`, true);
    }
  });
}

/**
 * 6. TypeScript Configuration Checks
 */
function checkTypeScript(): void {
  console.log('\n6️⃣  TypeScript Configuration');
  console.log('='.repeat(80));

  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');

  if (fs.existsSync(tsconfigPath)) {
    addCheck('TypeScript', 'Config File', 'pass', 'tsconfig.json exists', true);

    try {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));

      // Check compiler options
      if (tsconfig.compilerOptions) {
        addCheck('TypeScript', 'Compiler Options', 'pass', 'Compiler options configured', true);

        // Check strict mode
        if (tsconfig.compilerOptions.strict) {
          addCheck('TypeScript', 'Strict Mode', 'pass', 'Enabled', false);
        } else {
          addCheck('TypeScript', 'Strict Mode', 'warn', 'Not enabled (recommended)', false);
        }

        // Check output directory
        if (tsconfig.compilerOptions.outDir) {
          addCheck('TypeScript', 'Output Directory', 'pass', tsconfig.compilerOptions.outDir, true);
        } else {
          addCheck('TypeScript', 'Output Directory', 'warn', 'Not specified', false);
        }
      } else {
        addCheck('TypeScript', 'Compiler Options', 'fail', 'Missing compiler options', true);
      }
    } catch (error) {
      addCheck('TypeScript', 'Config Parsing', 'fail', 'Invalid JSON', true);
    }
  } else {
    addCheck('TypeScript', 'Config File', 'fail', 'tsconfig.json not found - REQUIRED', true);
  }
}

/**
 * 7. Security Checks
 */
function checkSecurity(): void {
  console.log('\n7️⃣  Security');
  console.log('='.repeat(80));

  // Check .env file not in git
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
    if (gitignore.includes('.env')) {
      addCheck('Security', 'Environment File Protection', 'pass', '.env in .gitignore', true);
    } else {
      addCheck(
        'Security',
        'Environment File Protection',
        'fail',
        '.env not in .gitignore - SECURITY RISK',
        true
      );
    }
  } else {
    addCheck('Security', 'GitIgnore', 'warn', '.gitignore not found', false);
  }

  // Check for exposed secrets (basic check)
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    if (
      envContent.includes('your_key_here') ||
      envContent.includes('changeme') ||
      envContent.includes('TODO')
    ) {
      addCheck('Security', 'Placeholder Secrets', 'warn', 'Contains placeholder values', false);
    } else {
      addCheck('Security', 'Placeholder Secrets', 'pass', 'No obvious placeholders', false);
    }
  }

  // Check CORS configuration
  if (config.CORS_ORIGINS) {
    if (config.CORS_ORIGINS.includes('*')) {
      addCheck(
        'Security',
        'CORS Configuration',
        'warn',
        'Allows all origins (*) - restrict for production',
        false
      );
    } else {
      addCheck('Security', 'CORS Configuration', 'pass', 'Restricted origins', false);
    }
  }
}

/**
 * 8. Build System Checks
 */
function checkBuildSystem(): void {
  console.log('\n8️⃣  Build System');
  console.log('='.repeat(80));

  const packageJsonPath = path.join(process.cwd(), 'package.json');

  if (fs.existsSync(packageJsonPath)) {
    addCheck('Build System', 'package.json', 'pass', 'Found', true);

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      // Check for build script
      if (packageJson.scripts && packageJson.scripts.build) {
        addCheck('Build System', 'Build Script', 'pass', 'Configured', false);
      } else {
        addCheck('Build System', 'Build Script', 'warn', 'No build script found', false);
      }

      // Check for start script
      if (packageJson.scripts && packageJson.scripts.start) {
        addCheck('Build System', 'Start Script', 'pass', 'Configured', true);
      } else {
        addCheck('Build System', 'Start Script', 'fail', 'No start script found', true);
      }

      // Check critical dependencies
      const criticalDeps = [
        'express',
        'typescript',
        'winston',
        '@sentry/node',
        'joi',
        'playwright',
      ];

      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      criticalDeps.forEach((dep) => {
        if (allDeps[dep]) {
          addCheck('Build System', `Dependency: ${dep}`, 'pass', allDeps[dep], false);
        } else {
          addCheck('Build System', `Dependency: ${dep}`, 'warn', 'Not installed', false);
        }
      });
    } catch (error) {
      addCheck('Build System', 'package.json Parsing', 'fail', 'Invalid JSON', true);
    }
  } else {
    addCheck('Build System', 'package.json', 'fail', 'Not found', true);
  }
}

/**
 * Print final summary
 */
function printSummary(): boolean {
  console.log('\n' + '='.repeat(80));
  console.log('📊 FINAL SUMMARY');
  console.log('='.repeat(80));

  const pass = results.filter((r) => r.status === 'pass').length;
  const warn = results.filter((r) => r.status === 'warn').length;
  const fail = results.filter((r) => r.status === 'fail').length;
  const skip = results.filter((r) => r.status === 'skip').length;

  const requiredFails = results.filter((r) => r.status === 'fail' && r.required).length;

  console.log(`✅ Passed: ${pass}`);
  console.log(`⚠️  Warnings: ${warn}`);
  console.log(`❌ Failed: ${fail}`);
  console.log(`⏭️  Skipped: ${skip}`);
  console.log(`\n🚨 Required Failures: ${requiredFails}`);

  console.log('\n' + '='.repeat(80));

  if (requiredFails > 0) {
    console.log('❌ PRODUCTION DEPLOYMENT: NOT READY');
    console.log('\nCritical issues must be resolved before launch:');
    results
      .filter((r) => r.status === 'fail' && r.required)
      .forEach((r) => {
        console.log(`  ❌ ${r.category} - ${r.check}: ${r.message}`);
      });
    return false;
  } else if (fail > 0) {
    console.log('⚠️  PRODUCTION DEPLOYMENT: PROCEED WITH CAUTION');
    console.log('\nSome non-critical checks failed. Review before launch.');
    return false;
  } else if (warn > 3) {
    console.log('⚠️  PRODUCTION DEPLOYMENT: READY (with warnings)');
    console.log(`\n${warn} warnings found. Recommended to address before launch.`);
    return true;
  } else {
    console.log('✅ PRODUCTION DEPLOYMENT: READY');
    console.log('\nAll critical checks passed! Good to launch! 🚀');
    return true;
  }
}

/**
 * Main check function
 */
async function main() {
  console.log('🚀 InfinitySol Pre-Launch Readiness Check');
  console.log('='.repeat(80));
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(80));

  // Run all checks
  checkEnvironment();
  checkLogging();
  checkErrorTracking();
  checkAIServices();
  checkFileStructure();
  checkTypeScript();
  checkSecurity();
  checkBuildSystem();

  // Print summary
  const isReady = printSummary();

  // Print configuration summary
  if (results.filter((r) => r.status === 'fail' && r.required).length === 0) {
    printConfig();
  }

  // Exit with appropriate code
  process.exit(isReady ? 0 : 1);
}

// Run checks
if (require.main === module) {
  main().catch((error) => {
    console.error('\n❌ Pre-launch check error:', error.message);
    process.exit(1);
  });
}
