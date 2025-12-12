/**
 * Agent #3: ClaimsAgent (Financial)
 * 
 * Investigates claims via LLM + forensics API
 * Populates claims graph with new data
 * Cost: $0.50/claim (vs. $500/human)
 */

import { v4 as uuid } from 'uuid';
import { ClaimInvestigation, AgentReport } from './types';

export interface Claim {
  id: string;
  claimant: string;
  amount: number;
  incidentDate: Date;
  description: string;
  evidence: {
    logs?: string;
    screenshots?: string[];
    forensicData?: string;
  };
}

export class ClaimsAgent {
  private investigations: ClaimInvestigation[] = [];

  /**
   * Investigate claim using LLM + forensics
   */
  async investigate(claim: Claim): Promise<ClaimInvestigation> {
    // Simulated investigation - in production:
    // - Collect logs via API
    // - Run LLM analysis on TTPs (Tactics, Techniques, Procedures)
    // - Query threat intel databases
    // - Recommend payout + control improvements

    console.log(`\n🔍 Investigating claim ${claim.id} for ${claim.claimant}`);

    // Simulated LLM analysis
    const summary = this.analyzeClaim(claim);
    const payoutRecommendation = this.calculatePayout(claim);
    const improvements = this.recommendImprovements(claim);

    const investigation: ClaimInvestigation = {
      claimId: claim.id,
      claimant: claim.claimant,
      amount: claim.amount,
      investigationSummary: summary,
      payoutRecommendation,
      controlImprovements: improvements,
      cost: 0.50 // Cost per claim
    };

    this.investigations.push(investigation);

    console.log(`   Summary: ${summary}`);
    console.log(`   Recommended Payout: $${payoutRecommendation.toLocaleString()}`);
    console.log(`   Cost: $${investigation.cost}`);
    console.log(`   Improvements:`);
    improvements.forEach(imp => console.log(`     - ${imp}`));

    return investigation;
  }

  /**
   * Analyze claim description using simulated LLM
   */
  private analyzeClaim(claim: Claim): string {
    // In production: Call OpenAI/Anthropic to analyze
    const keywords = claim.description.toLowerCase();
    
    if (keywords.includes('ransomware')) {
      return 'Ransomware attack via phishing email. Initial access through compromised credentials. Lateral movement detected across network.';
    } else if (keywords.includes('phishing')) {
      return 'Credential phishing attack. User clicked malicious link, entered credentials on fake login page. No lateral movement detected.';
    } else if (keywords.includes('breach')) {
      return 'Data breach due to misconfigured S3 bucket. Publicly accessible for 30 days before discovery. No evidence of exfiltration.';
    } else {
      return 'Incident analysis in progress. Initial review shows security controls were bypassed. Further investigation needed.';
    }
  }

  /**
   * Calculate recommended payout
   */
  private calculatePayout(claim: Claim): number {
    // Simple payout logic - in production, use ML model
    const description = claim.description.toLowerCase();
    
    if (description.includes('ransomware')) {
      // Ransomware typically 70-80% of claimed amount
      return Math.round(claim.amount * 0.75);
    } else if (description.includes('breach')) {
      // Data breach usually 60-70% of claimed amount
      return Math.round(claim.amount * 0.65);
    } else if (description.includes('phishing')) {
      // Phishing usually lower payout, 50-60%
      return Math.round(claim.amount * 0.55);
    } else {
      // Default to 60% of claimed amount
      return Math.round(claim.amount * 0.60);
    }
  }

  /**
   * Recommend control improvements
   */
  private recommendImprovements(claim: Claim): string[] {
    const description = claim.description.toLowerCase();
    const improvements: string[] = [];

    if (description.includes('ransomware') || description.includes('phishing')) {
      improvements.push('Implement email filtering with advanced threat protection');
      improvements.push('Deploy multi-factor authentication (MFA) across all systems');
      improvements.push('Conduct security awareness training quarterly');
    }

    if (description.includes('breach')) {
      improvements.push('Implement automated security posture management');
      improvements.push('Enable AWS GuardDuty or equivalent cloud security monitoring');
      improvements.push('Conduct quarterly security audits of cloud resources');
    }

    if (description.includes('credentials')) {
      improvements.push('Enforce password manager usage');
      improvements.push('Implement privileged access management (PAM)');
      improvements.push('Enable account activity monitoring and alerting');
    }

    // Default recommendations if no specific ones
    if (improvements.length === 0) {
      improvements.push('Review and update incident response plan');
      improvements.push('Implement security information and event management (SIEM)');
      improvements.push('Conduct penetration testing annually');
    }

    return improvements;
  }

  /**
   * Generate daily report
   */
  async generateReport(): Promise<AgentReport> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalInvestigated = this.investigations.length;
    const totalCost = this.investigations.reduce((sum, i) => sum + i.cost, 0);
    const totalPayout = this.investigations.reduce((sum, i) => sum + i.payoutRecommendation, 0);

    return {
      agentName: 'ClaimsAgent',
      timestamp: new Date(),
      status: 'success',
      summary: `Investigated ${totalInvestigated} claims. Total cost: $${totalCost.toFixed(2)} (vs. $${(totalInvestigated * 500).toLocaleString()} human cost). Recommended payouts: $${totalPayout.toLocaleString()}`,
      metrics: {
        claimsInvestigated: totalInvestigated,
        totalCost,
        avgCostPerClaim: totalInvestigated > 0 ? totalCost / totalInvestigated : 0,
        totalPayoutRecommended: totalPayout,
        costSavings: (totalInvestigated * 500) - totalCost
      }
    };
  }

  /**
   * Get investigation history
   */
  getInvestigations(): ClaimInvestigation[] {
    return this.investigations;
  }
}
