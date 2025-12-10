/**
 * Files: I/O operations for evidence and reports
 * See: docs/STREET_CYBER_SCAN.md
 * 
 * Responsibility: Write evidence and report files to disk
 * Does NOT: collect, analyze, format, or log leads
 */

import { ScoutResult, CyberRiskAnalysis } from "./types";
import { promises as fs } from "fs";
import * as path from "path";

const EVIDENCE_DIR = path.join(process.cwd(), "evidence");
const REPORTS_DIR = path.join(process.cwd(), "reports");

/**
 * Write scout results to evidence file
 * Returns the file path
 */
export async function writeEvidence(result: ScoutResult): Promise<string> {
  console.log(`[Files] Writing evidence for ${result.domain}`);

  // Ensure evidence directory exists
  await fs.mkdir(EVIDENCE_DIR, { recursive: true });

  // Generate filename with timestamp
  const timestamp = formatTimestamp(result.scannedAt);
  const filename = `${timestamp}-${sanitizeDomain(result.domain)}.json`;
  const filepath = path.join(EVIDENCE_DIR, filename);

  // Write JSON file
  const json = JSON.stringify(result, null, 2);
  await fs.writeFile(filepath, json, { encoding: "utf-8" });

  console.log(`[Files] Evidence written to ${filepath}`);
  return filepath;
}

/**
 * Write analysis report to markdown file
 * Returns the file path
 */
export async function writeReport(
  analysis: CyberRiskAnalysis,
  markdown: string
): Promise<string> {
  console.log(`[Files] Writing report for ${analysis.domain}`);

  // Ensure reports directory exists
  await fs.mkdir(REPORTS_DIR, { recursive: true });

  // Generate filename with timestamp
  const timestamp = formatTimestamp(analysis.scannedAt);
  const filename = `${timestamp}-${sanitizeDomain(analysis.domain)}.md`;
  const filepath = path.join(REPORTS_DIR, filename);

  // Write markdown file
  await fs.writeFile(filepath, markdown, { encoding: "utf-8" });

  console.log(`[Files] Report written to ${filepath}`);
  return filepath;
}

/**
 * Format a Date object into a filename-safe timestamp
 */
function formatTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}-${minutes}-${seconds}`;
}

/**
 * Sanitize domain name for use in filename
 */
function sanitizeDomain(domain: string): string {
  return domain.replace(/[^a-zA-Z0-9.-]/g, "_");
}
