#!/usr/bin/env ts-node
/**
 * Multi-AI Consistency Testing Script
 *
 * Tests all configured AI services (Perplexity, Claude, OpenAI) and compares
 * their outputs for consistency and quality.
 *
 * Usage:
 *   npm run test:ai
 *   or
 *   ts-node scripts/test-ai-consistency.ts
 */

import { perplexityClient } from '../services/ai/perplexity';
import { claudeClient } from '../services/ai/claude';
import { openaiClient } from '../services/ai/openai';
import { logger } from '../utils/logger';
import { validateEnvironment } from '../config/environment';

// Test data: Sample violations
const TEST_VIOLATIONS = [
  {
    id: 'color-contrast',
    impact: 'serious',
    description: 'Elements must have sufficient color contrast',
    help: 'Ensures text has sufficient contrast against the background',
    nodes: [{ target: 'button.submit' }, { target: 'a.nav-link' }],
    tags: ['wcag2aa', 'wcag143'],
  },
  {
    id: 'image-alt',
    impact: 'critical',
    description: 'Images must have alternate text',
    help: 'Ensures <img> elements have alternate text',
    nodes: [{ target: 'img.hero' }, { target: 'img.product' }],
    tags: ['wcag2a', 'wcag111', 'section508'],
  },
  {
    id: 'form-field-multiple-labels',
    impact: 'moderate',
    description: 'Form fields should not have multiple labels',
    help: 'Ensures form fields do not have multiple labels',
    nodes: [{ target: 'input#email' }],
    tags: ['wcag2a', 'wcag332'],
  },
];

const TEST_DOMAIN = 'example.com';

interface AITestResult {
  service: string;
  available: boolean;
  duration?: number;
  response?: string;
  error?: string;
  tokens?: {
    input?: number;
    output?: number;
    total?: number;
  };
}

/**
 * Test Perplexity AI
 */
async function testPerplexity(): Promise<AITestResult> {
  const startTime = Date.now();

  try {
    if (!perplexityClient.isAvailable()) {
      return {
        service: 'Perplexity',
        available: false,
        error: 'API key not configured',
      };
    }

    logger.info('Testing Perplexity AI...');
    const response = await perplexityClient.analyzeViolations(
      TEST_VIOLATIONS,
      TEST_DOMAIN
    );

    return {
      service: 'Perplexity',
      available: true,
      duration: Date.now() - startTime,
      response: response.substring(0, 500) + '...', // Truncate for comparison
    };
  } catch (error: any) {
    return {
      service: 'Perplexity',
      available: true,
      duration: Date.now() - startTime,
      error: error.message,
    };
  }
}

/**
 * Test Claude AI
 */
async function testClaude(): Promise<AITestResult> {
  const startTime = Date.now();

  try {
    if (!claudeClient.isAvailable()) {
      return {
        service: 'Claude',
        available: false,
        error: 'API key not configured',
      };
    }

    logger.info('Testing Claude AI...');
    const response = await claudeClient.analyzeViolations(
      TEST_VIOLATIONS,
      TEST_DOMAIN
    );

    return {
      service: 'Claude',
      available: true,
      duration: Date.now() - startTime,
      response: response.substring(0, 500) + '...',
    };
  } catch (error: any) {
    return {
      service: 'Claude',
      available: true,
      duration: Date.now() - startTime,
      error: error.message,
    };
  }
}

/**
 * Test OpenAI
 */
async function testOpenAI(): Promise<AITestResult> {
  const startTime = Date.now();

  try {
    if (!openaiClient.isAvailable()) {
      return {
        service: 'OpenAI',
        available: false,
        error: 'API key not configured',
      };
    }

    logger.info('Testing OpenAI...');
    const response = await openaiClient.analyzeViolations(
      TEST_VIOLATIONS,
      TEST_DOMAIN
    );

    return {
      service: 'OpenAI',
      available: true,
      duration: Date.now() - startTime,
      response: response.substring(0, 500) + '...',
    };
  } catch (error: any) {
    return {
      service: 'OpenAI',
      available: true,
      duration: Date.now() - startTime,
      error: error.message,
    };
  }
}

/**
 * Compare AI responses for consistency
 */
function compareResponses(results: AITestResult[]): void {
  const successfulResults = results.filter((r) => r.available && !r.error);

  if (successfulResults.length === 0) {
    console.log('\n❌ No AI services available for comparison');
    return;
  }

  console.log('\n📊 AI Response Comparison:');
  console.log('='.repeat(80));

  successfulResults.forEach((result) => {
    console.log(`\n${result.service}:`);
    console.log(`  Duration: ${result.duration}ms`);
    console.log(`  Response (first 500 chars):\n  ${result.response?.replace(/\n/g, '\n  ')}`);
  });

  // Analyze consistency
  console.log('\n🔍 Consistency Analysis:');
  console.log('='.repeat(80));

  if (successfulResults.length === 1) {
    console.log(`⚠️  Only one AI service available (${successfulResults[0]?.service || 'unknown'})`);
    console.log('   Cannot compare consistency. Configure additional services.');
  } else {
    // Check for common themes/keywords
    const responses = successfulResults.map((r) => r.response?.toLowerCase() || '');

    const commonKeywords = [
      'risk',
      'compliance',
      'wcag',
      'accessibility',
      'critical',
      'serious',
      'remediation',
      'violation',
    ];

    console.log('Common keywords found:');
    commonKeywords.forEach((keyword) => {
      const count = responses.filter((r) => r.includes(keyword)).length;
      const percentage = (count / successfulResults.length) * 100;
      const indicator = percentage === 100 ? '✅' : percentage >= 50 ? '⚠️ ' : '❌';
      console.log(`  ${indicator} "${keyword}": ${count}/${successfulResults.length} (${percentage.toFixed(0)}%)`);
    });
  }
}

/**
 * Print summary report
 */
function printSummary(results: AITestResult[]): void {
  console.log('\n📋 Test Summary:');
  console.log('='.repeat(80));

  results.forEach((result) => {
    const status = !result.available
      ? '❌ Not Configured'
      : result.error
        ? `❌ Failed: ${result.error}`
        : `✅ Success (${result.duration}ms)`;

    console.log(`${result.service.padEnd(15)} ${status}`);
  });

  const configured = results.filter((r) => r.available).length;
  const successful = results.filter((r) => r.available && !r.error).length;
  const failed = results.filter((r) => r.available && r.error).length;

  console.log('\n' + '='.repeat(80));
  console.log(`Total Services: ${results.length}`);
  console.log(`Configured: ${configured}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`Not Configured: ${results.length - configured}`);

  // Recommendations
  console.log('\n💡 Recommendations:');
  console.log('='.repeat(80));

  if (configured === 0) {
    console.log('❌ No AI services configured!');
    console.log('   Add API keys to .env file:');
    console.log('   - PERPLEXITY_API_KEY=your_key_here');
    console.log('   - ANTHROPIC_API_KEY=your_key_here');
    console.log('   - OPENAI_API_KEY=your_key_here');
  } else if (configured === 1) {
    console.log('⚠️  Only one AI service configured');
    console.log('   Consider adding backup AI services for redundancy');
  } else if (successful < configured) {
    console.log('⚠️  Some configured services failed');
    console.log('   Check API keys and service status');
  } else {
    console.log('✅ All configured AI services working correctly!');
    if (configured < 3) {
      console.log('   Consider configuring additional services for comparison');
    }
  }
}

/**
 * Main test function
 */
async function main() {
  console.log('🤖 InfinitySol Multi-AI Consistency Test');
  console.log('='.repeat(80));

  // Validate environment
  try {
    validateEnvironment();
  } catch (error) {
    console.error('❌ Environment validation failed');
    process.exit(1);
  }

  // Test all AI services in parallel
  console.log('\n🔄 Testing AI services...\n');

  const [perplexityResult, claudeResult, openaiResult] = await Promise.all([
    testPerplexity(),
    testClaude(),
    testOpenAI(),
  ]);

  const results = [perplexityResult, claudeResult, openaiResult];

  // Print results
  printSummary(results);
  compareResponses(results);

  // Exit code
  const allSuccessful = results.every((r) => !r.available || !r.error);
  const anyConfigured = results.some((r) => r.available);

  if (!anyConfigured) {
    console.log('\n⚠️  No AI services configured. Tests skipped.');
    process.exit(0);
  } else if (!allSuccessful) {
    console.log('\n❌ Some tests failed');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  }
}

// Run tests
if (require.main === module) {
  main().catch((error) => {
    logger.error('Test script failed', { error: error.message });
    console.error('\n❌ Test script error:', error.message);
    process.exit(1);
  });
}

export { testPerplexity, testClaude, testOpenAI };
