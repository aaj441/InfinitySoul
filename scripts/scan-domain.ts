#!/usr/bin/env node
/**
 * CLI: Domain security scanner
 * See: docs/STREET_CYBER_SCAN.md
 * 
 * Usage: npm run scan:domain -- --domain=example.com
 */

import { runScout } from "../backend/cyber/scout";
import { analyzeScoutResult } from "../backend/cyber/analyst";
import { renderMarkdownReport } from "../backend/cyber/scribe";
import { writeEvidence, writeReport } from "../backend/cyber/files";
import { logLead } from "../backend/cyber/broker";

async function main() {
  const domainArg = process.argv.find((arg) => arg.startsWith("--domain="));
  if (!domainArg) {
    console.error("Usage: scan-domain --domain=example.com");
    process.exit(1);
  }
  const domain = domainArg.split("=")[1]; // Fixed syntax error from spec

  console.log(`Scanning domain: ${domain}...`);
  console.log();

  try {
    // Run scout to collect data
    const scout = await runScout(domain);
    console.log();

    // Analyze the results
    const analysis = analyzeScoutResult(scout);
    console.log();

    // Generate markdown report
    const markdown = renderMarkdownReport(analysis);

    // Write files
    const evidencePath = await writeEvidence(scout);
    const reportPath = await writeReport(analysis, markdown);
    await logLead(analysis);
    console.log();

    // Output results
    console.log("✅ Scan complete.");
    console.log(`Evidence: ${evidencePath}`);
    console.log(`Report:   ${reportPath}`);
  } catch (error) {
    console.error("❌ Scan failed:", error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Scan failed:", err);
  process.exit(1);
});
