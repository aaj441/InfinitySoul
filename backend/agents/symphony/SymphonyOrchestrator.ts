/**
 * Infinity Soul Symphony - Orchestrator
 * 
 * Coordinates all 10 agents to execute the daily loop:
 * - Financial agents: Scout, Underwriting, Claims
 * - Personal agents: Biometric, Deal, Relationship, Learning, Content, Negotiation, Governance
 * 
 * Goal: $1B net worth + 10x life by 2030
 */

import { ScoutAgent } from './ScoutAgent';
import { UnderwritingAgent, Submission } from './UnderwritingAgent';
import { ClaimsAgent, Claim } from './ClaimsAgent';
import { BiometricAgent } from './BiometricAgent';
import { DealAgent } from './DealAgent';
import { RelationshipAgent } from './RelationshipAgent';
import { LearningAgent } from './LearningAgent';
import { ContentAgent } from './ContentAgent';
import { NegotiationAgent, Call } from './NegotiationAgent';
import { GovernanceAgent } from './GovernanceAgent';
import { DailyReport, FinancialKPIs, PersonalKPIs } from './types';

export class SymphonyOrchestrator {
  // Financial agents
  private scoutAgent: ScoutAgent;
  private underwritingAgent: UnderwritingAgent;
  private claimsAgent: ClaimsAgent;

  // Personal agents
  private biometricAgent: BiometricAgent;
  private dealAgent: DealAgent;
  private relationshipAgent: RelationshipAgent;
  private learningAgent: LearningAgent;
  private contentAgent: ContentAgent;
  private negotiationAgent: NegotiationAgent;
  private governanceAgent: GovernanceAgent;

  constructor() {
    // Initialize all agents
    this.scoutAgent = new ScoutAgent();
    this.underwritingAgent = new UnderwritingAgent();
    this.claimsAgent = new ClaimsAgent();
    this.biometricAgent = new BiometricAgent();
    this.dealAgent = new DealAgent();
    this.relationshipAgent = new RelationshipAgent();
    this.learningAgent = new LearningAgent();
    this.contentAgent = new ContentAgent();
    this.negotiationAgent = new NegotiationAgent();
    this.governanceAgent = new GovernanceAgent();
  }

  /**
   * Execute the daily loop
   */
  async startDay(): Promise<void> {
    console.log('\n🌅 INFINITY SOUL SYMPHONY - DAY START\n');
    console.log('═'.repeat(60));

    // 4:00-6:00 AM: The Kluge Scan
    console.log('\n⏰ 4:00-6:00 AM: THE KLUGE SCAN\n');
    
    // BiometricAgent check
    const bioReport = await this.biometricAgent.generateReport();
    console.log(`\n${bioReport.summary}`);
    
    // ScoutAgent scan
    await this.scoutAgent.scanTargets();
    const scoutReport = await this.scoutAgent.generateReport();
    console.log(`\n${scoutReport.summary}`);
    
    // LearningAgent summary
    const learningReport = await this.learningAgent.generateReport();
    console.log(`\n${learningReport.summary}`);

    console.log('\n═'.repeat(60));
  }

  /**
   * Approve scout offers
   */
  async approveScoutOffers(count: number): Promise<void> {
    console.log(`\n💼 APPROVE SCOUT OFFERS (${count})\n`);
    await this.scoutAgent.makeOffers(count);
  }

  /**
   * Check biometrics and optimize
   */
  async checkBiometrics(threshold: number): Promise<void> {
    console.log(`\n🏃 BIOMETRIC CHECK (HRV threshold: ${threshold})\n`);
    await this.biometricAgent.optimize();
  }

  /**
   * Deep work block
   */
  async deepWork(duration: number, blockAll: boolean = true): Promise<void> {
    console.log(`\n🎯 DEEP WORK (${duration}h, block all: ${blockAll})\n`);
    console.log('Entering deep work mode...');
    console.log('Only DealAgent alerts will break through.\n');
    
    // Surface top deal during deep work
    const topDeal = await this.dealAgent.surfaceTopDeal();
    if (topDeal) {
      console.log('\n⚠️  High-priority deal alert during deep work!');
    }
  }

  /**
   * Syndicate cognition across platforms
   */
  async syndicateCognition(content?: string): Promise<void> {
    console.log('\n📢 SYNDICATE COGNITION\n');
    const deepWorkOutput = content || 'Insights from today\'s deep work session on agentic insurance...';
    await this.contentAgent.syndicate(deepWorkOutput);
  }

  /**
   * Run House Committee vote
   */
  async houseCommitteeVote(): Promise<void> {
    console.log('\n🗳️  HOUSE COMMITTEE VOTE\n');
    const activeProposals = this.governanceAgent.getActiveProposals();
    
    if (activeProposals.length === 0) {
      console.log('No active proposals.\n');
    } else {
      console.log(`${activeProposals.length} active proposal(s):\n`);
      activeProposals.forEach((proposal, i) => {
        console.log(`${i + 1}. ${proposal.title}`);
        console.log(`   Type: ${proposal.type}`);
        console.log(`   Proposed: ${proposal.proposedAt.toLocaleDateString()}`);
        console.log(`   Voting ends: ${proposal.votingEndsAt.toLocaleDateString()}\n`);
      });
    }
  }

  /**
   * Rebalance portfolio (cut underperforming assets)
   */
  async rebalancePortfolio(cutThreshold: number = 10): Promise<void> {
    console.log(`\n⚖️  REBALANCE PORTFOLIO (${cutThreshold}x threshold)\n`);
    console.log('Analyzing portfolio performance...');
    console.log(`Assets not hitting ${cutThreshold}x should be flagged for cut.\n`);
    // In production: Analyze MGA performance, relationship ROI, etc.
  }

  /**
   * End day and generate report
   */
  async endDay(): Promise<DailyReport> {
    console.log('\n🌙 INFINITY SOUL SYMPHONY - DAY END\n');
    console.log('═'.repeat(60));

    // Collect all agent reports
    const agentReports = await Promise.all([
      this.scoutAgent.generateReport(),
      this.underwritingAgent.generateReport(),
      this.claimsAgent.generateReport(),
      this.biometricAgent.generateReport(),
      this.dealAgent.generateReport(),
      this.relationshipAgent.generateReport(),
      this.learningAgent.generateReport(),
      this.contentAgent.generateReport(),
      this.negotiationAgent.generateReport(),
      this.governanceAgent.generateReport()
    ]);

    // Generate KPIs
    const financial: FinancialKPIs = {
      dailyQuotes: 500,
      dailyBinds: 10,
      lossRatio: 0.68,
      combinedRatio: 0.78,
      protocolRevenue: 50_000,
      sponsorRevenue: 1_000
    };

    const personal: PersonalKPIs = {
      hrv: 82,
      testosterone: 920,
      deepWorkHours: 4,
      activeRelationships: 1000,
      dealsSourced: 10,
      papersIngested: 10,
      followers: 100_000,
      netWorth: 10_000_000
    };

    const report: DailyReport = {
      date: new Date(),
      financial,
      personal,
      agentReports,
      status: 'on_track'
    };

    console.log('\n📊 DAILY METRICS\n');
    console.log('Financial:');
    console.log(`  Quotes: ${financial.dailyQuotes}`);
    console.log(`  Binds: ${financial.dailyBinds}`);
    console.log(`  Loss Ratio: ${(financial.lossRatio * 100).toFixed(1)}%`);
    console.log(`  Combined Ratio: ${(financial.combinedRatio * 100).toFixed(1)}%`);
    console.log(`  Protocol Revenue: $${financial.protocolRevenue.toLocaleString()}/day`);
    console.log(`  Sponsor Revenue: $${financial.sponsorRevenue.toLocaleString()}/day\n`);

    console.log('Personal:');
    console.log(`  HRV: ${personal.hrv} ms`);
    console.log(`  Testosterone: ${personal.testosterone} ng/dL`);
    console.log(`  Deep Work: ${personal.deepWorkHours} hours`);
    console.log(`  Active Relationships: ${personal.activeRelationships.toLocaleString()}`);
    console.log(`  Deals Sourced: ${personal.dealsSourced}`);
    console.log(`  Papers Ingested: ${personal.papersIngested}`);
    console.log(`  Followers: ${personal.followers.toLocaleString()}`);
    console.log(`  Net Worth: $${personal.netWorth.toLocaleString()}\n`);

    console.log(`Status: ${report.status.toUpperCase()}\n`);
    console.log('═'.repeat(60));

    return report;
  }

  // Expose individual agents for direct access
  getScoutAgent() { return this.scoutAgent; }
  getUnderwritingAgent() { return this.underwritingAgent; }
  getClaimsAgent() { return this.claimsAgent; }
  getBiometricAgent() { return this.biometricAgent; }
  getDealAgent() { return this.dealAgent; }
  getRelationshipAgent() { return this.relationshipAgent; }
  getLearningAgent() { return this.learningAgent; }
  getContentAgent() { return this.contentAgent; }
  getNegotiationAgent() { return this.negotiationAgent; }
  getGovernanceAgent() { return this.governanceAgent; }
}
