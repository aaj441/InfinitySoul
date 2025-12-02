/**
 * Batch Scan Script
 * Scans multiple URLs and generates PDF reports
 * Usage: npx ts-node scripts/batch-scan.ts --urls=urls.txt --output=reports/
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';

interface ScanJob {
  jobId: string;
  url: string;
  status: string;
  statusUrl: string;
}

// Configuration
const API_BASE = process.env.API_BASE || 'http://localhost:8000';
const POLL_INTERVAL = 5000; // 5 seconds
const MAX_WAIT_TIME = 120000; // 2 minutes

// Parse arguments
const args = process.argv.slice(2);
const urlsFile = args.find((arg) => arg.startsWith('--urls='))?.split('=')[1];
const outputDir = args.find((arg) => arg.startsWith('--output='))?.split('=')[1];
const batchSize = parseInt(args.find((arg) => arg.startsWith('--batch='))?.split('=')[1] || '50');

if (!urlsFile) {
  console.error('❌ Usage: npx ts-node scripts/batch-scan.ts --urls=urls.txt --output=reports/');
  process.exit(1);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('\n🎯 INFINITYSOUL BATCH SCANNER');
  console.log('═════════════════════════════════════════');
  console.log(`📄 Input file: ${urlsFile}`);
  console.log(`📁 Output dir: ${outputDir || './reports'}`);
  console.log(`🔗 API: ${API_BASE}`);
  console.log('═════════════════════════════════════════\n');

  // Read URLs
  if (!fs.existsSync(urlsFile)) {
    console.error(`❌ File not found: ${urlsFile}`);
    process.exit(1);
  }

  const urls = fs
    .readFileSync(urlsFile, 'utf-8')
    .split('\n')
    .map((url) => url.trim())
    .filter((url) => url && url.startsWith('http'));

  console.log(`📊 Found ${urls.length} URLs to scan`);
  console.log(`🔄 Processing in batches of ${batchSize}\n`);

  // Create output directory
  const reportsDir = outputDir || './reports';
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Process URLs in batches
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    console.log(`\n📦 Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(urls.length / batchSize)}`);
    console.log(`   Processing ${batch.length} URLs...`);

    const jobs: ScanJob[] = [];

    // Submit all URLs in batch
    for (const url of batch) {
      try {
        const response = await axios.post(`${API_BASE}/api/v1/scan`, {
          url,
          email: process.env.SCAN_EMAIL || 'scanner@infinitysoul.local',
        });

        jobs.push({
          jobId: response.data.jobId,
          url,
          status: response.data.status,
          statusUrl: response.data.statusUrl,
        });

        console.log(`   ✓ ${url} → Job ${response.data.jobId.slice(0, 8)}`);
      } catch (error) {
        console.error(`   ✗ ${url} → Error`);
        failCount++;
      }
    }

    // Poll for completion
    console.log(`\n   ⏳ Waiting for scans to complete...`);

    let completed = 0;
    const startTime = Date.now();

    while (completed < jobs.length) {
      const elapsed = Date.now() - startTime;

      if (elapsed > MAX_WAIT_TIME) {
        console.log(`   ⏱️  Timeout: Processing took >2 minutes. Moving to next batch.`);
        break;
      }

      // Check each job
      for (const job of jobs) {
        if (job.status === 'completed') continue;

        try {
          const statusResponse = await axios.get(`${API_BASE}${job.statusUrl}`);
          const data = statusResponse.data;

          if (data.status === 'completed') {
            job.status = 'completed';
            completed++;

            // Log result
            const violations = data.result?.violations || {};
            const riskScore = data.result?.riskScore || 0;

            console.log(
              `   ✅ ${job.url.split('/')[2]} → ${violations.total || 0} violations (Risk: ${riskScore.toFixed(1)})`
            );

            successCount++;

            // Save result
            const filename = path.join(reportsDir, `${job.jobId}.json`);
            fs.writeFileSync(filename, JSON.stringify(data.result, null, 2));
          } else if (data.status === 'failed') {
            job.status = 'failed';
            completed++;
            console.log(`   ❌ ${job.url} → Failed: ${data.error}`);
            failCount++;
          }
        } catch (error) {
          // Ignore polling errors, retry next time
        }
      }

      if (completed < jobs.length) {
        await sleep(POLL_INTERVAL);
      }
    }
  }

  // Summary
  console.log('\n═════════════════════════════════════════');
  console.log('📊 BATCH SCAN COMPLETE');
  console.log('═════════════════════════════════════════');
  console.log(`✅ Successful scans: ${successCount}`);
  console.log(`❌ Failed scans: ${failCount}`);
  console.log(`📁 Reports saved to: ${reportsDir}`);
  console.log('═════════════════════════════════════════\n');

  console.log('📧 Next step: Send reports via cold email');
  console.log('💰 Expected replies: 10% of contacts');
  console.log('📞 Expected demos: 20% of replies');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
