/**
 * Agent #2: UnderwritingAgent (Financial)
 * 
 * Quotes cyber risk in 30 seconds.
 * Ingests: claims graph, CVE feeds, threat intel
 * Output: premium + risk factors
 */

import { v4 as uuid } from 'uuid';
import { UnderwritingQuote, AgentReport } from './types';

export interface Submission {
  id: string;
  company: string;
  revenue: number;
  employees: number;
  industry: string;
  techStack: string[];
  hasSecurityTeam: boolean;
  hasCyberInsurance: boolean;
}

export class UnderwritingAgent {
  private quotes: UnderwritingQuote[] = [];

  /**
   * Quote cyber risk in 30 seconds
   * Uses vector DB for similar companies + Bayesian model
   */
  async quote(submission: Submission): Promise<UnderwritingQuote> {
    // Simulated underwriting - in production:
    // - Query vector DB for similar companies
    // - Pull latest CISA advisories
    // - Run Bayesian model on historical claims
    // - Check CVE feeds for tech stack vulnerabilities

    const baseRate = 40_000; // Base premium
    let riskMultiplier = 1.0;
    const riskFactors: string[] = [];

    // Industry risk adjustment
    const highRiskIndustries = ['healthcare', 'finance', 'crypto'];
    if (highRiskIndustries.includes(submission.industry.toLowerCase())) {
      riskMultiplier *= 1.3;
      riskFactors.push(`High-risk industry: ${submission.industry}`);
    }

    // Tech stack vulnerabilities
    const vulnerableTech = ['wordpress', 'drupal', 'joomla'];
    const hasVulnerableTech = submission.techStack.some(tech => 
      vulnerableTech.includes(tech.toLowerCase())
    );
    if (hasVulnerableTech) {
      riskMultiplier *= 1.2;
      riskFactors.push('Vulnerable tech stack detected');
    }

    // Security controls
    if (!submission.hasSecurityTeam) {
      riskMultiplier *= 1.4;
      riskFactors.push('No dedicated security team');
    }

    if (!submission.hasCyberInsurance) {
      riskMultiplier *= 1.1;
      riskFactors.push('No prior cyber insurance');
    }

    // Company size risk
    if (submission.employees < 10) {
      riskMultiplier *= 1.2;
      riskFactors.push('Small team - limited security resources');
    }

    // Calculate premium and loss probability
    const premium = Math.round(baseRate * riskMultiplier);
    const lossProbability = Math.min(0.03 * riskMultiplier, 0.15); // Cap at 15%

    const quote: UnderwritingQuote = {
      submissionId: submission.id,
      company: submission.company,
      premium,
      lossProbability,
      riskFactors,
      quotedAt: new Date()
    };

    this.quotes.push(quote);

    console.log(`\n📊 Quote generated for ${submission.company}`);
    console.log(`   Premium: $${premium.toLocaleString()}/year`);
    console.log(`   Loss Probability: ${(lossProbability * 100).toFixed(1)}%`);
    console.log(`   Risk Factors:`);
    riskFactors.forEach(factor => console.log(`     - ${factor}`));

    return quote;
  }

  /**
   * Batch quote multiple submissions
   */
  async batchQuote(submissions: Submission[]): Promise<UnderwritingQuote[]> {
    const quotes = await Promise.all(
      submissions.map(sub => this.quote(sub))
    );
    return quotes;
  }

  /**
   * Generate daily report
   */
  async generateReport(): Promise<AgentReport> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayQuotes = this.quotes.filter(q => 
      q.quotedAt >= today
    );

    const avgPremium = todayQuotes.length > 0
      ? todayQuotes.reduce((sum, q) => sum + q.premium, 0) / todayQuotes.length
      : 0;

    return {
      agentName: 'UnderwritingAgent',
      timestamp: new Date(),
      status: 'success',
      summary: `Generated ${todayQuotes.length} quotes today. Avg premium: $${avgPremium.toLocaleString()}`,
      metrics: {
        quotesGenerated: todayQuotes.length,
        totalQuotes: this.quotes.length,
        avgPremium: Math.round(avgPremium),
        avgLossProbability: todayQuotes.reduce((sum, q) => sum + q.lossProbability, 0) / todayQuotes.length
      }
    };
  }

  /**
   * Get quote history
   */
  getQuotes(): UnderwritingQuote[] {
    return this.quotes;
  }
}
