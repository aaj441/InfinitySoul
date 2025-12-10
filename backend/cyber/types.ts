/**
 * Type definitions for the Cyber Risk Scan Pipeline
 * See: docs/STREET_CYBER_SCAN.md
 */

export interface ScoutResult {
  domain: string;
  resolvedIp?: string;
  httpReachable: boolean;
  httpsReachable: boolean;
  securityHeaders: Record<string, string | undefined>;
  openPorts: number[];
  rawFindings: string[]; // free-form notes
  scannedAt: Date;
}

export type RiskCategory =
  | "exposure"
  | "configuration"
  | "encryption"
  | "hygiene"
  | "other";

export type Severity = "low" | "medium" | "high";

export interface RiskIssue {
  id: string;
  category: RiskCategory;
  severity: Severity;
  title: string;
  description: string;
  evidenceHint?: string;
}

export interface CyberRiskAnalysis {
  domain: string;
  scannedAt: Date;
  overallSeverity: Severity;
  issues: RiskIssue[];
  summary: string;
}

export interface LeadLogEntry {
  domain: string;
  scannedAt: string; // ISO
  overallSeverity: Severity;
  issuesCount: number;
  notes?: string;
}
