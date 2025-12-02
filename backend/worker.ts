/**
 * InfinitySoul Background Worker
 * Processes async scan jobs from Redis queue
 * Runs independently from API server
 */

import { Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { chromium } from 'playwright';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Redis connection
const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  enableOfflineQueue: false,
});

// ============================================================================
// SCAN PROCESSING LOGIC
// ============================================================================

async function performScan(url: string, timeoutMs: number = 30000) {
  let browser;

  try {
    console.log(`[Browser] Launching for ${url}`);

    // Launch browser with sandbox disabled for Docker
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--no-first-run',
      ],
    });

    console.log(`[Page] Creating new page`);
    const page = await browser.newPage();

    // Navigate to URL
    console.log(`[Navigate] Going to ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: timeoutMs });

    console.log(`[Axe] Injecting axe-core library`);

    // Inject axe-core library
    await page.evaluate(() => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js';
      script.onload = function () {
        (window as any).axeReady = true;
      };
      document.head.appendChild(script);
    });

    // Wait for axe to load
    console.log(`[Axe] Waiting for axe-core to load`);
    await page.waitForFunction(
      () => (window as any).axeReady && (window as any).axe,
      { timeout: 10000 }
    );

    console.log(`[Axe] Running accessibility scan`);

    // Run axe scan
    const results = await page.evaluate(() => {
      return new Promise((resolve, reject) => {
        (window as any).axe.run((error: any, results: any) => {
          if (error) reject(error);
          else resolve(results);
        });
      });
    });

    await browser.close();
    console.log(`[Scan] Complete for ${url}`);

    return results;
  } catch (error) {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('[Browser Close] Error:', e);
      }
    }
    throw error;
  }
}

// ============================================================================
// WORKER PROCESS
// ============================================================================

const worker = new Worker('scan_jobs', processScanJob, {
  connection: redisConnection,
  concurrency: parseInt(process.env.WORKER_CONCURRENCY || '3'),
  settings: {
    backoffStrategy: async (attemptsMade: number) => {
      return Math.pow(2, attemptsMade) * 1000; // Exponential backoff
    },
  },
});

async function processScanJob(job: any) {
  const { url, email } = job.data;

  try {
    console.log(`\n🎯 [Job ${job.id}] Starting scan`);
    console.log(`   URL: ${url}`);
    console.log(`   Email: ${email || 'not provided'}`);

    job.updateProgress(10);

    // Perform the actual scan
    const scanResults: any = await performScan(url);

    job.updateProgress(70);

    // Parse violation counts
    const violations = {
      critical: scanResults.violations.filter((v: any) => v.impact === 'critical').length,
      serious: scanResults.violations.filter((v: any) => v.impact === 'serious').length,
      moderate: scanResults.violations.filter((v: any) => v.impact === 'moderate').length,
      minor: scanResults.violations.filter((v: any) => v.impact === 'minor').length,
      total: scanResults.violations.length,
    };

    // Calculate risk metrics
    const riskScore = Math.min(violations.total * 1.5 + violations.critical * 5, 100);
    const estimatedCost = 50000 + violations.total * 2500;

    console.log(`   Found: ${violations.total} violations`);
    console.log(`   Risk Score: ${riskScore.toFixed(1)}/100`);
    console.log(`   Est. Lawsuit Cost: $${estimatedCost.toLocaleString()}`);

    job.updateProgress(85);

    // Save to database
    try {
      await prisma.scanResult.create({
        data: {
          url,
          auditId: job.id,
          status: 'success',
          criticalCount: violations.critical,
          seriousCount: violations.serious,
          moderateCount: violations.moderate,
          minorCount: violations.minor,
          totalCount: violations.total,
          riskScore,
          estimatedLawsuitCost: estimatedCost,
          email: email || undefined,
          violationsData: scanResults.violations,
        },
      });

      console.log(`   ✅ Results saved to database`);
    } catch (dbError) {
      console.error(`   ⚠️  Database save failed:`, dbError);
      // Don't fail the job if DB is down
    }

    job.updateProgress(100);

    console.log(`✅ [Job ${job.id}] Complete\n`);

    return {
      success: true,
      violations,
      riskScore,
      estimatedLawsuitCost: estimatedCost,
      completedAt: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ [Job ${job.id}] Failed`);
    console.error(`   Error: ${errorMessage}\n`);

    // Re-throw to trigger retries
    throw error;
  }
}

// ============================================================================
// WORKER EVENT HANDLERS
// ============================================================================

worker.on('completed', (job) => {
  console.log(`🎉 [Job ${job.id}] Completed and saved`);
});

worker.on('failed', (job, err) => {
  console.error(`💥 [Job ${job?.id}] Failed after retries: ${err.message}`);
});

worker.on('error', (error) => {
  console.error(`⚠️  Worker error:`, error);
});

worker.on('closed', () => {
  console.log('Worker closed');
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

process.on('SIGTERM', async () => {
  console.log('\n📤 Shutting down worker gracefully...');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n📤 Shutting down worker gracefully...');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});

// ============================================================================
// STARTUP
// ============================================================================

async function startup() {
  try {
    // Test Redis connection
    const ping = await redisConnection.ping();
    if (ping !== 'PONG') {
      throw new Error('Redis connection test failed');
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ InfinitySoul Worker Started');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`📊 Queue: scan_jobs`);
    console.log(`🔗 Redis: redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`);
    console.log(`⚙️  Concurrency: ${process.env.WORKER_CONCURRENCY || '3'} parallel scans`);
    console.log(`⏱️  Timeout: 30 seconds per scan`);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔴 Waiting for jobs...\n');
  } catch (error) {
    console.error('Failed to start worker:', error);
    process.exit(1);
  }
}

startup();

export default worker;
