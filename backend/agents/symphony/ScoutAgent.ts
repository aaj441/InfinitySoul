/**
 * Agent #1: ScoutAgent (Financial)
 * 
 * Scans PitchBook, LinkedIn, Discord for distressed MGAs.
 * Makes offers via DocuSign API.
 * Cost: $0 (runs on AWS free tier)
 * 
 * Filter:
 * - Premium: $5M-$20M/year
 * - Combined Ratio: >115% (distressed)
 * - Founder age: >55 (estate sale)
 * - Data: 3+ years claims (CSV files = trapped value)
 * - Community: >500 Discord members (governance potential)
 */

import { v4 as uuid } from 'uuid';
import { MGATarget, MGAOffer, AgentReport } from './types';

export class ScoutAgent {
  private targets: MGATarget[] = [];
  private offers: MGAOffer[] = [];

  /**
   * Scan for distressed MGA targets
   * In production: Query PitchBook API, LinkedIn, Discord
   * For MVP: Use mock data
   */
  async scanTargets(): Promise<MGATarget[]> {
    // Simulated scan - in production, integrate with:
    // - PitchBook API
    // - LinkedIn Sales Navigator
    // - Discord community metrics
    // - Insurance regulatory filings
    
    const mockTargets: MGATarget[] = [
      {
        id: uuid(),
        name: 'CyberShield MGA',
        premium: 8_000_000,
        combinedRatio: 118,
        founderAge: 58,
        dataYears: 5,
        discordMembers: 750,
        distressScore: 85
      },
      {
        id: uuid(),
        name: 'TechRisk Partners',
        premium: 12_000_000,
        combinedRatio: 122,
        founderAge: 61,
        dataYears: 4,
        discordMembers: 520,
        distressScore: 92
      },
      {
        id: uuid(),
        name: 'DataGuard Insurance',
        premium: 6_500_000,
        combinedRatio: 116,
        founderAge: 56,
        dataYears: 3,
        discordMembers: 680,
        distressScore: 78
      }
    ];

    // Filter based on criteria
    this.targets = mockTargets.filter(target => 
      target.premium >= 5_000_000 && 
      target.premium <= 20_000_000 &&
      target.combinedRatio > 115 &&
      target.founderAge > 55 &&
      target.dataYears >= 3 &&
      target.discordMembers >= 500
    );

    // Sort by distress score (highest first)
    this.targets.sort((a, b) => b.distressScore - a.distressScore);

    return this.targets;
  }

  /**
   * Make offer to top N targets
   * Uses standardized offer template
   */
  async makeOffers(count: number): Promise<MGAOffer[]> {
    const topTargets = this.targets.slice(0, count);
    const newOffers: MGAOffer[] = [];

    for (const target of topTargets) {
      const offer: MGAOffer = {
        targetId: target.id,
        cashAtClose: 50_000,
        revsharePercent: 15,
        soulTokens: 1_000,
        offerSentAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'pending'
      };

      // In production: Send via DocuSign API
      console.log(`📧 Offer sent to ${target.name}`);
      console.log(`   - Cash at close: $${offer.cashAtClose.toLocaleString()}`);
      console.log(`   - Revshare: ${offer.revsharePercent}%`);
      console.log(`   - $SOUL tokens: ${offer.soulTokens.toLocaleString()}`);
      console.log(`   - Expires: ${offer.expiresAt.toLocaleDateString()}\n`);

      this.offers.push(offer);
      newOffers.push(offer);
    }

    return newOffers;
  }

  /**
   * Generate daily report
   */
  async generateReport(): Promise<AgentReport> {
    const pendingOffers = this.offers.filter(o => o.status === 'pending').length;
    const acceptedOffers = this.offers.filter(o => o.status === 'accepted').length;

    return {
      agentName: 'ScoutAgent',
      timestamp: new Date(),
      status: 'success',
      summary: `Scanned ${this.targets.length} distressed MGAs. ${pendingOffers} offers pending, ${acceptedOffers} accepted.`,
      metrics: {
        targetsScanned: this.targets.length,
        offersSent: this.offers.length,
        pendingOffers,
        acceptedOffers,
        avgDistressScore: this.targets.reduce((sum, t) => sum + t.distressScore, 0) / this.targets.length
      }
    };
  }

  /**
   * Get pending offers for approval
   */
  getPendingOffers(): MGAOffer[] {
    return this.offers.filter(o => o.status === 'pending');
  }

  /**
   * Approve/reject an offer
   */
  updateOfferStatus(offerId: string, status: 'accepted' | 'rejected'): void {
    const offer = this.offers.find(o => o.targetId === offerId);
    if (offer) {
      offer.status = status;
    }
  }
}
