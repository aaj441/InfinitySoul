/**
 * Files: Evidence and report file management for STREET_CYBER_SCAN
 * See: docs/STREET_CYBER_SCAN.md
 *
 * Handles writing:
 * - Evidence JSON files
 * - Report Markdown files
 */

import { ScoutResult, CyberRiskAnalysis } from "./types";
import { promises as fs } from "fs";
import * as path from "path";

const EVIDENCE_DIR = path.join(process.cwd(), "evidence");
const REPORTS_DIR = path.join(process.cwd(), "reports");

/**
 * Ensure a directory exists
 */
async function ensureDirectory(dir: string): Promise<void> {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code !== "EEXIST") {
      throw error;
    }
  }
}

/**
 * Generate filename with timestamp and domain
 */
function generateFilename(domain: string, extension: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safeDomain = domain.replace(/[^a-z0-9.-]/gi, "_");
  return `${timestamp}-${safeDomain}.${extension}`;
}

/**
 * Write evidence JSON file
 */
export async function writeEvidence(result: ScoutResult): Promise<string> {
  await ensureDirectory(EVIDENCE_DIR);
  
  const filename = generateFilename(result.domain, "json");
  const filepath = path.join(EVIDENCE_DIR, filename);
  
  // Convert ScoutResult to JSON, handling Date serialization
  const json = JSON.stringify(
    {
      ...result,
      scannedAt: result.scannedAt.toISOString(),
    },
    null,
    2
  );
  
  await fs.writeFile(filepath, json, "utf-8");
  return filepath;
}

/**
 * Write report Markdown file
 */
export async function writeReport(analysis: CyberRiskAnalysis, markdown: string): Promise<string> {
  await ensureDirectory(REPORTS_DIR);
  
  const filename = generateFilename(analysis.domain, "md");
  const filepath = path.join(REPORTS_DIR, filename);
  
  await fs.writeFile(filepath, markdown, "utf-8");
  return filepath;
}
