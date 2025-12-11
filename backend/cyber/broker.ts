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
import { CyberScanConfig } from "../../config/cyber";
import { LeadLogError } from "./errors";

const LEADS_DIR = path.join(process.cwd(), CyberScanConfig.output.leadsDir);
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
      throw new LeadLogError("directory_creation", error as Error);
    }
  }
}

/**
 * Log a lead entry to the JSONL file
 * Throws LeadLogError on failure for explicit error handling
 */
export async function logLead(analysis: CyberRiskAnalysis, notes?: string): Promise<void> {
  try {
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
  } catch (error) {
    // Wrap in explicit error type for better error handling
    throw new LeadLogError(analysis.domain, error as Error);
  }
}

/**
 * Read all leads from the JSONL file
 * Returns empty array if file doesn't exist
 */
export async function readLeads(): Promise<LeadLogEntry[]> {
  try {
    const content = await fs.readFile(LEADS_FILE, "utf-8");
    const lines = content.trim().split("\n").filter(Boolean);
    return lines.map((line) => JSON.parse(line) as LeadLogEntry);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      // File doesn't exist yet - return empty array
      return [];
    }
    throw new LeadLogError("read_all", error as Error);
  }
}
