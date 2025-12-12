/**
 * Cyber Risk Models
 * Statistical risk calculation for cyber insurance
 */

export interface ClientProfile {
  revenue?: number;
  employee_count?: number;
  industry?: string;
  has_mfa?: boolean;
  has_edr?: boolean;
  backup_frequency?: "daily" | "weekly" | "monthly" | "none";
  prior_claims?: number;
  [key: string]: any;
}

/**
 * Compute loss probability based on client profile
 * @param clientProfile Client data including security controls
 * @returns Loss probability (0.0 - 1.0)
 */
export function computeLossProbability(clientProfile: ClientProfile): number {
  let base = 0.02;

  const revenue = clientProfile.revenue || 0;
  const employees = clientProfile.employee_count || 0;
  const hasMFA = clientProfile.has_mfa || false;
  const hasEDR = clientProfile.has_edr || false;
  const backupFrequency = clientProfile.backup_frequency || "monthly";
  const priorClaims = clientProfile.prior_claims || 0;

  // Revenue-based risk
  if (revenue > 10_000_000) {
    base += 0.01;
  }

  // Employee-based risk
  if (employees > 50) {
    base += 0.01;
  }

  // Security control penalties
  if (!hasMFA) {
    base += 0.015;
  }
  if (!hasEDR) {
    base += 0.015;
  }

  // Backup frequency risk
  if (backupFrequency === "weekly" || backupFrequency === "monthly") {
    base += 0.01;
  } else if (backupFrequency === "none") {
    base += 0.03;
  }

  // Prior claims history
  base += 0.01 * priorClaims;

  // Cap at 25%
  return Math.min(base, 0.25);
}

/**
 * Suggest premium based on client profile and loss probability
 * @param clientProfile Client data
 * @param lossProbability Computed loss probability
 * @returns Estimated annual premium
 */
export function suggestPremium(
  clientProfile: ClientProfile,
  lossProbability: number
): number {
  const revenue = clientProfile.revenue || 1_000_000;
  const limit = Math.max(250_000, Math.min(revenue, 5_000_000));
  const rate = 0.005 + lossProbability * 0.2;
  return Math.round(limit * rate * 100) / 100;
}
