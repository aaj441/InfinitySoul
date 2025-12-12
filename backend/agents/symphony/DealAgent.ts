/**
 * Agent #5: DealAgent (Personal)
 * 
 * Scans for: partnerships, M&A, talent
 * Surfaces: 1 high-value opportunity/day
 * You: approve in 1 second
 */

import { v4 as uuid } from 'uuid';
import { Deal, AgentReport } from './types';

export class DealAgent {
  private deals: Deal[] = [];

  /**
   * Scan for deals across multiple sources
   * In production: Integrate with Crunchbase, LinkedIn, email inbox
   */
  async scan(): Promise<Deal[]> {
    // Simulated scan - in production:
    // - Query Crunchbase for underpriced startups
    // - LinkedIn for burned-out founders
    // - Parse inbox for warm intros
    // - Monitor Twitter/Discord for opportunities

    const mockDeals: Deal[] = [
      {
        id: uuid(),
        type: 'ma',
        description: 'Distressed SaaS company, $2M ARR, founder burnout, asking $4M',
        value: 4_000_000,
        priority: 9,
        source: 'Crunchbase',
        surfacedAt: new Date()
      },
      {
        id: uuid(),
        type: 'partnership',
        description: 'InsurTech partnership opportunity - API integration, 50K potential leads',
        value: 500_000,
        priority: 8,
        source: 'LinkedIn',
        surfacedAt: new Date()
      },
      {
        id: uuid(),
        type: 'talent',
        description: 'Senior ML engineer from Google, interested in actuarial AI',
        value: 250_000,
        priority: 7,
        source: 'Email inbox',
        surfacedAt: new Date()
      },
      {
        id: uuid(),
        type: 'ma',
        description: 'Cyber MGA with 500 customers, combined ratio 118%, founder retiring',
        value: 3_000_000,
        priority: 10,
        source: 'Industry contact',
        surfacedAt: new Date()
      }
    ];

    // Sort by priority (highest first)
    mockDeals.sort((a, b) => b.priority - a.priority);

    this.deals.push(...mockDeals);

    console.log(`\n💼 Scanned ${mockDeals.length} potential deals`);
    mockDeals.forEach(deal => {
      console.log(`   [Priority ${deal.priority}] ${deal.type.toUpperCase()}: ${deal.description}`);
      console.log(`      Value: $${deal.value.toLocaleString()} | Source: ${deal.source}`);
    });

    return mockDeals;
  }

  /**
   * Get top N opportunities by priority
   */
  getTopOpportunities(count: number = 1): Deal[] {
    const sortedDeals = [...this.deals].sort((a, b) => b.priority - a.priority);
    return sortedDeals.slice(0, count);
  }

  /**
   * Surface the #1 opportunity of the day
   */
  async surfaceTopDeal(): Promise<Deal | null> {
    const topDeals = this.getTopOpportunities(1);
    
    if (topDeals.length === 0) {
      await this.scan();
      const newTopDeals = this.getTopOpportunities(1);
      return newTopDeals.length > 0 ? newTopDeals[0] : null;
    }

    const topDeal = topDeals[0];
    
    console.log(`\n🎯 TOP OPPORTUNITY OF THE DAY:`);
    console.log(`   Type: ${topDeal.type.toUpperCase()}`);
    console.log(`   Description: ${topDeal.description}`);
    console.log(`   Value: $${topDeal.value.toLocaleString()}`);
    console.log(`   Priority: ${topDeal.priority}/10`);
    console.log(`   Source: ${topDeal.source}`);
    console.log(`\n   ⏱️  Decision needed in 1 second...`);

    return topDeal;
  }

  /**
   * Filter deals by type
   */
  getDealsByType(type: 'partnership' | 'ma' | 'talent'): Deal[] {
    return this.deals.filter(d => d.type === type);
  }

  /**
   * Mark deal as pursued or passed
   */
  updateDealStatus(dealId: string, status: 'pursued' | 'passed'): void {
    const dealIndex = this.deals.findIndex(d => d.id === dealId);
    if (dealIndex !== -1) {
      // Remove from active deals list if pursued or passed
      this.deals.splice(dealIndex, 1);
      console.log(`   Deal ${status === 'pursued' ? '✅ pursued' : '❌ passed'}`);
    }
  }

  /**
   * Generate daily report
   */
  async generateReport(): Promise<AgentReport> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayDeals = this.deals.filter(d => d.surfacedAt >= today);
    const totalValue = todayDeals.reduce((sum, d) => sum + d.value, 0);
    const avgPriority = todayDeals.length > 0
      ? todayDeals.reduce((sum, d) => sum + d.priority, 0) / todayDeals.length
      : 0;

    const dealsByType = {
      ma: todayDeals.filter(d => d.type === 'ma').length,
      partnership: todayDeals.filter(d => d.type === 'partnership').length,
      talent: todayDeals.filter(d => d.type === 'talent').length
    };

    return {
      agentName: 'DealAgent',
      timestamp: new Date(),
      status: todayDeals.length > 0 ? 'success' : 'warning',
      summary: `Sourced ${todayDeals.length} deals today. Total value: $${totalValue.toLocaleString()}. Avg priority: ${avgPriority.toFixed(1)}/10`,
      metrics: {
        dealsSourced: todayDeals.length,
        totalDealsActive: this.deals.length,
        totalValue,
        avgPriority,
        maDeals: dealsByType.ma,
        partnershipDeals: dealsByType.partnership,
        talentDeals: dealsByType.talent
      }
    };
  }
}
