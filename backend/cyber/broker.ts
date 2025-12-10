/**
 * Broker: Lead logging and persistence
 * See: docs/STREET_CYBER_SCAN.md
 * 
 * Responsibility: Persist lead information to JSONL log
 * Does NOT: collect data, analyze, or format reports
 */

import { CyberRiskAnalysis, LeadLogEntry } from "./types";
import { promises as fs } from "fs";
import * as path from "path";

const LEADS_DIR = path.join(process.cwd(), "leads");
const LEADS_FILE = path.join(LEADS_DIR, "leads.jsonl");

/**
 * Log a lead to the JSONL file
 */
export async function logLead(
  analysis: CyberRiskAnalysis,
  notes?: string
): Promise<void> {
  console.log(`[Broker] Logging lead for ${analysis.domain}`);

  // Ensure leads directory exists
  try {
    await fs.mkdir(LEADS_DIR, { recursive: true });
  } catch (error) {
    console.error(`[Broker] Failed to create leads directory:`, error);
    throw error;
  }

  // Create lead entry
  const entry: LeadLogEntry = {
    domain: analysis.domain,
    scannedAt: analysis.scannedAt.toISOString(),
    overallSeverity: analysis.overallSeverity,
    issuesCount: analysis.issues.length,
    notes,
  };

  // Append to JSONL file
  const line = JSON.stringify(entry) + "\n";

  try {
    await fs.appendFile(LEADS_FILE, line, { encoding: "utf-8" });
    console.log(`[Broker] Lead logged successfully to ${LEADS_FILE}`);
  } catch (error) {
    console.error(`[Broker] Failed to write lead:`, error);
    throw error;
  }
}
