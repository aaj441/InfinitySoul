/**
 * Cyber Audit Service
 * Integrates Python cyber audit script with InfinitySoul backend
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

export interface CyberAuditIssue {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  type: string;
  message: string;
  impact: number;
}

export interface CyberAuditResult {
  domain: string;
  timestamp: string;
  checks: Record<string, any>;
  score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  issues: CyberAuditIssue[];
  recommendations: string[];
  insurance_recommendation: string;
}

export interface CyberAuditRequest {
  domain: string;
  email?: string;
  businessName?: string;
  industry?: string;
}

export interface CyberAuditResponse {
  auditId: string;
  status: 'success' | 'failed';
  result?: CyberAuditResult;
  error?: string;
  reportUrl?: string;
}

/**
 * Run cyber audit on a domain
 */
export async function runCyberAudit(
  request: CyberAuditRequest
): Promise<CyberAuditResponse> {
  const auditId = uuidv4();
  
  try {
    // Validate domain
    if (!request.domain || typeof request.domain !== 'string') {
      throw new Error('Invalid domain provided');
    }
    
    // Sanitize domain input to prevent command injection
    const sanitizedDomain = request.domain
      .trim()
      .replace(/[^a-zA-Z0-9.-]/g, '')
      .toLowerCase();
    
    if (!sanitizedDomain) {
      throw new Error('Invalid domain format');
    }
    
    // Path to Python script
    const scriptPath = path.join(
      __dirname,
      '..',
      '..',
      'automation',
      'cyber_audit.py'
    );
    
    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '..', '..', 'audit-results');
    await fs.mkdir(outputDir, { recursive: true });
    
    const outputFile = path.join(outputDir, `${auditId}.json`);
    
    // Run Python script
    const command = `python3 "${scriptPath}" --domain "${sanitizedDomain}" --json --output "${outputFile}"`;
    
    console.log(`Running cyber audit for domain: ${sanitizedDomain}`);
    
    try {
      await execAsync(command, {
        timeout: 60000, // 60 second timeout
        maxBuffer: 1024 * 1024 // 1MB buffer
      });
    } catch (execError: any) {
      // Script exits with code 1 for HIGH/CRITICAL risk, which is expected
      if (execError.code === 1 || execError.code === 0) {
        // This is fine, continue processing
      } else {
        throw execError;
      }
    }
    
    // Read results
    const resultData = await fs.readFile(outputFile, 'utf-8');
    const result: CyberAuditResult = JSON.parse(resultData);
    
    // Log audit
    console.log(`Cyber audit completed for ${sanitizedDomain}:`);
    console.log(`- Score: ${result.score}/100`);
    console.log(`- Risk Level: ${result.risk_level}`);
    console.log(`- Issues: ${result.issues.length}`);
    
    return {
      auditId,
      status: 'success',
      result,
      reportUrl: `/api/cyber-audit/report/${auditId}`
    };
    
  } catch (error: any) {
    console.error(`Cyber audit failed for ${request.domain}:`, error);
    
    return {
      auditId,
      status: 'failed',
      error: error.message || 'Audit failed'
    };
  }
}

/**
 * Get audit result by ID
 */
export async function getAuditResult(auditId: string): Promise<CyberAuditResult | null> {
  try {
    const outputDir = path.join(__dirname, '..', '..', 'audit-results');
    const outputFile = path.join(outputDir, `${auditId}.json`);
    
    const resultData = await fs.readFile(outputFile, 'utf-8');
    return JSON.parse(resultData);
  } catch (error) {
    console.error(`Failed to read audit result ${auditId}:`, error);
    return null;
  }
}

/**
 * Get audit recommendations as formatted text for email
 */
export function formatAuditForEmail(result: CyberAuditResult): string {
  let email = `Cyber Security Audit Report for ${result.domain}\n\n`;
  email += `📊 Risk Score: ${result.score}/100\n`;
  email += `🚦 Risk Level: ${result.risk_level}\n\n`;
  
  if (result.issues.length > 0) {
    email += `🔍 Issues Found (${result.issues.length}):\n`;
    result.issues.forEach((issue, idx) => {
      const icon = issue.severity === 'CRITICAL' ? '🚨' : 
                   issue.severity === 'HIGH' ? '⚠️' : '⚡';
      email += `${idx + 1}. ${icon} [${issue.severity}] ${issue.message}\n`;
    });
    email += '\n';
  }
  
  if (result.recommendations.length > 0) {
    email += `💡 Recommendations (${result.recommendations.length}):\n`;
    result.recommendations.forEach((rec, idx) => {
      email += `${idx + 1}. ${rec}\n`;
    });
    email += '\n';
  }
  
  email += `🛡️ Insurance Recommendation:\n`;
  email += `${result.insurance_recommendation}\n\n`;
  
  email += `---\n`;
  email += `This is a technical security assessment. Consult with a qualified\n`;
  email += `attorney for legal guidance. Insurance eligibility is subject to\n`;
  email += `carrier approval.\n`;
  
  return email;
}

/**
 * Calculate insurance premium estimate based on risk
 */
export function estimateInsurancePremium(
  result: CyberAuditResult,
  coverageAmount: number = 1000000
): number {
  // Base premium rate per $1000 of coverage
  const baseRates = {
    LOW: 0.5,      // $500 per $1M
    MEDIUM: 1.0,   // $1000 per $1M
    HIGH: 2.0,     // $2000 per $1M
    CRITICAL: 4.0  // $4000 per $1M
  };
  
  const rate = baseRates[result.risk_level] || baseRates.MEDIUM;
  return (coverageAmount / 1000) * rate;
}

/**
 * Generate sales follow-up email content
 */
export function generateFollowUpEmail(
  result: CyberAuditResult,
  businessName: string,
  contactName: string
): string {
  const premium = estimateInsurancePremium(result);
  
  return `
Subject: Your cyber security scan results - ${businessName}

Hi ${contactName},

I ran the cyber security scan on ${result.domain}. Here's what I found:

📊 Risk Score: ${result.score}/100
🚦 Risk Level: ${result.risk_level}

${result.issues.length > 0 ? `Key Issues:
${result.issues.slice(0, 3).map((issue, idx) => 
  `${idx + 1}. [${issue.severity}] ${issue.message}`
).join('\n')}

Good News:
- These are all fixable
- I can help you implement the fixes
- Once fixed, you'll qualify for better insurance rates

Estimated Annual Premium: $${premium.toLocaleString()} for $1M coverage
` : `Great news! Your security posture is strong.

Estimated Annual Premium: $${premium.toLocaleString()} for $1M coverage
`}

Next Steps:
1. 15-minute call to review findings
2. ${result.issues.length > 0 ? 'Connect you with vendors to fix issues (or help DIY)' : 'Discuss coverage options'}
3. Get you a competitive cyber insurance quote

When works for you this week?

Best,
[Your Name]
Infinity Soul Cyber Insurance

---
This is a technical assessment only and does not constitute legal advice.
Insurance eligibility subject to carrier approval.
`.trim();
}

export default {
  runCyberAudit,
  getAuditResult,
  formatAuditForEmail,
  estimateInsurancePremium,
  generateFollowUpEmail
};
