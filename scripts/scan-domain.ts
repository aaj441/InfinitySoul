#!/usr/bin/env node
/**
 * CLI: scan-domain command for STREET_CYBER_SCAN
 * See: docs/STREET_CYBER_SCAN.md
 *
 * Orchestrates the complete scan pipeline:
 * Scout → Analyst → Scribe → Files → Broker
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
  const domain = domainArg.split("=")[1];

  if (!domain || domain.trim() === "") {
    console.error("Error: Domain cannot be empty");
    process.exit(1);
  }

  console.log(`Scanning domain: ${domain}...`);

  // Step 1: Scout - perform technical checks
  console.log("Running technical reconnaissance...");
  const scout = await runScout(domain);

  // Step 2: Analyst - analyze findings
  console.log("Analyzing security posture...");
  const analysis = analyzeScoutResult(scout);

  // Step 3: Scribe - generate report
  console.log("Generating report...");
  const markdown = renderMarkdownReport(analysis);

  // Step 4: Write files
  console.log("Writing outputs...");
  const evidencePath = await writeEvidence(scout);
  const reportPath = await writeReport(analysis, markdown);

  // Step 5: Log lead
  await logLead(analysis);

  console.log("\n✓ Scan complete.");
  console.log(`  Evidence: ${evidencePath}`);
  console.log(`  Report:   ${reportPath}`);
  console.log(`\nSummary: ${analysis.summary}`);
  console.log(`Overall Risk: ${analysis.overallSeverity.toUpperCase()}`);
  console.log(`Issues Found: ${analysis.issues.length}`);
}

main().catch((err) => {
  console.error("Scan failed:", err);
  process.exit(1);
});
