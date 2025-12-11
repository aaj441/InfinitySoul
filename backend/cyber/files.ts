/**
 * Files: Evidence and report file management for STREET_CYBER_SCAN
 * See: docs/STREET_CYBER_SCAN.md
 *
 * Handles writing:
 * - Evidence JSON files (with schema versioning)
 * - Report Markdown files
 */

import { ScoutResult, CyberRiskAnalysis } from "./types";
import { promises as fs } from "fs";
import * as path from "path";
import { CyberScanConfig } from "../../config/cyber";
import { FileWriteError } from "./errors";

const EVIDENCE_DIR = path.join(process.cwd(), CyberScanConfig.output.evidenceDir);
const REPORTS_DIR = path.join(process.cwd(), CyberScanConfig.output.reportsDir);

/**
 * Evidence output format with schema versioning
 */
interface EvidenceOutput {
  schemaVersion: string;
  data: ScoutResult & {
    scannedAt: string;
  };
  metadata: {
    generatedAt: string;
    generator: string;
  };
}

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
 * Includes milliseconds to prevent collisions from concurrent scans
 */
function generateFilename(domain: string, extension: string): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-");
  const safeDomain = domain.replace(/[^a-z0-9.-]/gi, "_");
  // Add extra entropy with milliseconds to prevent collisions
  const ms = now.getMilliseconds().toString().padStart(3, "0");
  return `${timestamp}-${ms}-${safeDomain}.${extension}`;
}

/**
 * Write evidence JSON file with schema versioning
 * Throws FileWriteError on failure
 */
export async function writeEvidence(result: ScoutResult): Promise<string> {
  try {
    await ensureDirectory(EVIDENCE_DIR);
    
    const filename = generateFilename(result.domain, "json");
    const filepath = path.join(EVIDENCE_DIR, filename);
    
    // Create versioned evidence output
    const evidence: EvidenceOutput = {
      schemaVersion: CyberScanConfig.output.schemaVersion,
      data: {
        ...result,
        scannedAt: result.scannedAt.toISOString(),
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        generator: CyberScanConfig.userAgent,
      },
    };
    
    const json = JSON.stringify(evidence, null, 2);
    await fs.writeFile(filepath, json, "utf-8");
    return filepath;
  } catch (error) {
    throw new FileWriteError(`evidence/${result.domain}`, error as Error);
  }
}

/**
 * Write report Markdown file
 * Throws FileWriteError on failure
 */
export async function writeReport(analysis: CyberRiskAnalysis, markdown: string): Promise<string> {
  try {
    await ensureDirectory(REPORTS_DIR);
    
    const filename = generateFilename(analysis.domain, "md");
    const filepath = path.join(REPORTS_DIR, filename);
    
    await fs.writeFile(filepath, markdown, "utf-8");
    return filepath;
  } catch (error) {
    throw new FileWriteError(`reports/${analysis.domain}`, error as Error);
  }
}
