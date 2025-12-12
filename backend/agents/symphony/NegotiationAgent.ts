/**
 * Agent #9: NegotiationAgent (Personal)
 * 
 * Preps every call with leverage points
 * Win-rate prediction based on historical data
 * You: read the one-liner, execute
 */

import { v4 as uuid } from 'uuid';
import { NegotiationPrep, AgentReport } from './types';

export interface Call {
  id: string;
  with: string;
  at: Date;
  purpose: string;
  context?: string;
}

export class NegotiationAgent {
  private preps: NegotiationPrep[] = [];
  private history: Array<{
    prep: NegotiationPrep;
    outcome: 'won' | 'lost' | 'ongoing';
    actualValue?: number;
  }> = [];

  /**
   * Prepare for upcoming negotiation
   */
  async prep(call: Call): Promise<NegotiationPrep> {
    // Simulated prep - in production:
    // - Query knowledge graph for their pain points
    // - Analyze your leverage (alternatives, timeline, BATNA)
    // - Pull historical negotiation data for similar deals
    // - Use ML model to predict win-rate

    console.log(`\n🎯 Preparing negotiation with ${call.with}...\n`);

    const painPoints = this.analyzePainPoints(call);
    const leverage = this.analyzeLeverage(call);
    const { openingLine, walkAwayPoint } = this.generateStrategy(call, painPoints, leverage);
    const predictedWinRate = this.predictWinRate(painPoints.length, leverage.length);

    const prep: NegotiationPrep = {
      callWith: call.with,
      callAt: call.at,
      painPoints,
      leverage,
      openingLine,
      walkAwayPoint,
      predictedWinRate
    };

    this.preps.push(prep);

    console.log(`   Pain Points (${painPoints.length}):`);
    painPoints.forEach(p => console.log(`     - ${p}`));
    console.log(`\n   Your Leverage (${leverage.length}):`);
    leverage.forEach(l => console.log(`     - ${l}`));
    console.log(`\n   Opening: "${openingLine}"`);
    console.log(`   Walk Away: "${walkAwayPoint}"`);
    console.log(`   Predicted Win Rate: ${(predictedWinRate * 100).toFixed(0)}%\n`);

    return prep;
  }

  /**
   * Analyze counterparty pain points
   */
  private analyzePainPoints(call: Call): string[] {
    // Simulated analysis - in production: Query CRM, LinkedIn, news
    const commonPainPoints = [
      'Losing money on current operations',
      'Founder burnout / wants to exit',
      'Regulatory pressure increasing',
      'Technology debt mounting',
      'Competition intensifying'
    ];

    // Return 2-4 pain points based on context
    const count = Math.floor(Math.random() * 3) + 2;
    return commonPainPoints.slice(0, count);
  }

  /**
   * Analyze your leverage
   */
  private analyzeLeverage(call: Call): string[] {
    // Simulated analysis - in production: Analyze alternatives, timeline, resources
    const leveragePoints = [
      'You have 3 alternative deals in pipeline',
      'You can close in 7 days (they need 30+)',
      'You bring AI/automation expertise they lack',
      'Your network includes 5 strategic acquirers',
      'You have capital ready to deploy'
    ];

    const count = Math.floor(Math.random() * 3) + 2;
    return leveragePoints.slice(0, count);
  }

  /**
   * Generate negotiation strategy
   */
  private generateStrategy(
    call: Call,
    painPoints: string[],
    leverage: string[]
  ): {
    openingLine: string;
    walkAwayPoint: string;
  } {
    // Simulated strategy generation - in production: Use GPT-4
    const openings = [
      'I\'ve been looking at your operation - I think I can help you solve the profitability problem and exit on your terms.',
      'Your MGA has strong fundamentals but the market is changing fast. I have a proposal that could help you pivot.',
      'I know you\'re exploring options. I can move faster than anyone else and give you more upside.',
    ];

    const walkAways = [
      'If combined ratio doesn\'t improve to <95% in 90 days, I walk.',
      'If we can\'t structure this with at least 60% cash at close, I\'m out.',
      'Need access to full claims data - if that\'s not possible, I\'m not interested.',
    ];

    return {
      openingLine: openings[Math.floor(Math.random() * openings.length)],
      walkAwayPoint: walkAways[Math.floor(Math.random() * walkAways.length)]
    };
  }

  /**
   * Predict win rate based on factors
   */
  private predictWinRate(painPointCount: number, leverageCount: number): number {
    // Simple model - in production: Use ML based on historical outcomes
    const baseRate = 0.50;
    const painBonus = painPointCount * 0.08;
    const leverageBonus = leverageCount * 0.06;
    
    return Math.min(baseRate + painBonus + leverageBonus, 0.95);
  }

  /**
   * Record negotiation outcome
   */
  recordOutcome(
    prepId: string,
    outcome: 'won' | 'lost' | 'ongoing',
    actualValue?: number
  ): void {
    const prep = this.preps.find(p => 
      p.callWith === prepId || p.callAt.toISOString() === prepId
    );

    if (prep) {
      this.history.push({
        prep,
        outcome,
        actualValue
      });

      console.log(`\n📊 Negotiation with ${prep.callWith}: ${outcome.toUpperCase()}`);
      if (actualValue) {
        console.log(`   Value: $${actualValue.toLocaleString()}`);
      }
    }
  }

  /**
   * Get win rate statistics
   */
  getWinRate(): {
    overall: number;
    recent: number;
    totalNegotiations: number;
  } {
    const total = this.history.filter(h => h.outcome !== 'ongoing').length;
    const wins = this.history.filter(h => h.outcome === 'won').length;
    
    const recent = this.history.slice(-10).filter(h => h.outcome !== 'ongoing').length;
    const recentWins = this.history.slice(-10).filter(h => h.outcome === 'won').length;

    return {
      overall: total > 0 ? wins / total : 0,
      recent: recent > 0 ? recentWins / recent : 0,
      totalNegotiations: total
    };
  }

  /**
   * Get upcoming negotiations
   */
  getUpcomingNegotiations(): NegotiationPrep[] {
    const now = new Date();
    return this.preps.filter(p => p.callAt > now);
  }

  /**
   * Generate daily report
   */
  async generateReport(): Promise<AgentReport> {
    const winRate = this.getWinRate();
    const upcoming = this.getUpcomingNegotiations();

    const totalValue = this.history
      .filter(h => h.outcome === 'won' && h.actualValue)
      .reduce((sum, h) => sum + (h.actualValue || 0), 0);

    return {
      agentName: 'NegotiationAgent',
      timestamp: new Date(),
      status: upcoming.length > 0 ? 'success' : 'warning',
      summary: `${upcoming.length} negotiations upcoming. Win rate: ${(winRate.overall * 100).toFixed(0)}% overall, ${(winRate.recent * 100).toFixed(0)}% recent (last 10). Total value won: $${totalValue.toLocaleString()}`,
      metrics: {
        upcomingNegotiations: upcoming.length,
        totalNegotiations: winRate.totalNegotiations,
        overallWinRate: winRate.overall,
        recentWinRate: winRate.recent,
        totalValueWon: totalValue,
        avgPredictedWinRate: this.preps.reduce((sum, p) => sum + p.predictedWinRate, 0) / this.preps.length || 0
      }
    };
  }
}
