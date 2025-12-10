/**
 * Broker: Lead logging for STREET_CYBER_SCAN
 * See: docs/STREET_CYBER_SCAN.md
 *
 * Manages append-only lead logging to JSONL file for:
 * - CRM integration
 * - Follow-up tracking
 * - Analytics
 */

import { CyberRiskAnalysis, LeadLogEntry } from "./types";
import { promises as fs } from "fs";
import * as path from "path";

const LEADS_DIR = path.join(process.cwd(), "leads");
const LEADS_FILE = path.join(LEADS_DIR, "leads.jsonl");

/**
 * Ensure leads directory exists
 */
async function ensureLeadsDirectory(): Promise<void> {
  try {
    await fs.mkdir(LEADS_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist, which is fine
    const err = error as NodeJS.ErrnoException;
    if (err.code !== "EEXIST") {
      throw error;
    }
  }
}

/**
 * Log a lead entry to the JSONL file
 */
export async function logLead(analysis: CyberRiskAnalysis, notes?: string): Promise<void> {
  await ensureLeadsDirectory();
  
  const entry: LeadLogEntry = {
    domain: analysis.domain,
    scannedAt: analysis.scannedAt.toISOString(),
    overallSeverity: analysis.overallSeverity,
    issuesCount: analysis.issues.length,
    notes,
  };
  
  // Append JSON line to file
  const jsonLine = JSON.stringify(entry) + "\n";
  await fs.appendFile(LEADS_FILE, jsonLine, "utf-8");
}
