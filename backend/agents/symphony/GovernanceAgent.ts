/**
 * Agent #10: GovernanceAgent (Personal)
 * 
 * Runs your House Committee votes
 * Scope: major life decisions (move, acquire, cut)
 * Vote: on-chain, weighted by skin-in-game
 */

import { v4 as uuid } from 'uuid';
import { GovernanceProposal, AgentReport } from './types';

export interface HouseCommitteeMember {
  name: string;
  role: 'partner' | 'mentor' | 'peer' | 'advisor' | 'founder';
  votingPower: number; // 0-1, sums to 1.0
}

export class GovernanceAgent {
  private proposals: GovernanceProposal[] = [];
  private committee: HouseCommitteeMember[] = [
    { name: 'Partner', role: 'partner', votingPower: 0.30 },
    { name: 'Mentor (Billionaire)', role: 'mentor', votingPower: 0.20 },
    { name: 'Peer (Founder $50M+)', role: 'peer', votingPower: 0.20 },
    { name: 'Advisor (Tech)', role: 'advisor', votingPower: 0.15 },
    { name: 'You', role: 'founder', votingPower: 0.15 }
  ];

  /**
   * Create new proposal
   */
  async createProposal(
    type: GovernanceProposal['type'],
    title: string,
    description: string,
    proposedBy: string = 'You'
  ): Promise<GovernanceProposal> {
    const proposal: GovernanceProposal = {
      id: uuid(),
      type,
      title,
      description,
      proposedBy,
      proposedAt: new Date(),
      votingEndsAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours
      votes: [],
      status: 'voting'
    };

    this.proposals.push(proposal);

    console.log(`\n🗳️  New proposal created: ${title}`);
    console.log(`   Type: ${type}`);
    console.log(`   Description: ${description}`);
    console.log(`   Voting ends: ${proposal.votingEndsAt.toLocaleString()}\n`);

    // In production: Send notifications to all committee members
    console.log(`   Notifying House Committee members...`);
    this.committee.forEach(member => {
      console.log(`     - ${member.name} (${(member.votingPower * 100).toFixed(0)}% voting power)`);
    });

    return proposal;
  }

  /**
   * Cast vote on proposal
   */
  async castVote(
    proposalId: string,
    voter: string,
    vote: 'yes' | 'no' | 'abstain'
  ): Promise<void> {
    const proposal = this.proposals.find(p => p.id === proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }

    if (proposal.status !== 'voting') {
      throw new Error('Proposal is not in voting status');
    }

    const member = this.committee.find(m => m.name === voter);
    if (!member) {
      throw new Error('Voter not in House Committee');
    }

    // Remove existing vote if any
    proposal.votes = proposal.votes.filter(v => v.voter !== voter);

    // Add new vote
    proposal.votes.push({
      voter,
      weight: member.votingPower,
      vote
    });

    console.log(`\n✅ Vote recorded: ${voter} voted ${vote.toUpperCase()} on "${proposal.title}"`);
  }

  /**
   * Tally votes and determine outcome
   */
  async tallyVotes(proposalId: string): Promise<{
    passed: boolean;
    yesVotes: number;
    noVotes: number;
    abstainVotes: number;
    quorum: number;
  }> {
    const proposal = this.proposals.find(p => p.id === proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }

    const yesVotes = proposal.votes
      .filter(v => v.vote === 'yes')
      .reduce((sum, v) => sum + v.weight, 0);

    const noVotes = proposal.votes
      .filter(v => v.vote === 'no')
      .reduce((sum, v) => sum + v.weight, 0);

    const abstainVotes = proposal.votes
      .filter(v => v.vote === 'abstain')
      .reduce((sum, v) => sum + v.weight, 0);

    const quorum = yesVotes + noVotes + abstainVotes;
    const passed = quorum >= 0.60 && yesVotes > noVotes;

    return {
      passed,
      yesVotes,
      noVotes,
      abstainVotes,
      quorum
    };
  }

  /**
   * Close voting and execute decision
   */
  async closeVoting(proposalId: string): Promise<void> {
    const proposal = this.proposals.find(p => p.id === proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }

    const result = await this.tallyVotes(proposalId);

    console.log(`\n📊 Voting Results for "${proposal.title}":`);
    console.log(`   Yes: ${(result.yesVotes * 100).toFixed(1)}%`);
    console.log(`   No: ${(result.noVotes * 100).toFixed(1)}%`);
    console.log(`   Abstain: ${(result.abstainVotes * 100).toFixed(1)}%`);
    console.log(`   Quorum: ${(result.quorum * 100).toFixed(1)}%`);
    console.log(`   Required: 60%\n`);

    if (result.quorum < 0.60) {
      proposal.status = 'rejected';
      console.log(`   ❌ REJECTED: Quorum not met (${(result.quorum * 100).toFixed(1)}% < 60%)`);
    } else if (result.passed) {
      proposal.status = 'passed';
      console.log(`   ✅ PASSED: Executing decision in 24 hours...`);
    } else {
      proposal.status = 'rejected';
      console.log(`   ❌ REJECTED: No votes exceeded Yes votes`);
    }
  }

  /**
   * Get active proposals
   */
  getActiveProposals(): GovernanceProposal[] {
    return this.proposals.filter(p => p.status === 'voting');
  }

  /**
   * Get proposals needing votes
   */
  getProposalsNeedingVotes(): GovernanceProposal[] {
    return this.proposals.filter(p => {
      if (p.status !== 'voting') return false;
      
      // Check if quorum is met
      const totalWeight = p.votes.reduce((sum, v) => sum + v.weight, 0);
      return totalWeight < 0.60;
    });
  }

  /**
   * Auto-close expired votes
   */
  async autoCloseExpired(): Promise<void> {
    const now = new Date();
    const expired = this.proposals.filter(
      p => p.status === 'voting' && p.votingEndsAt < now
    );

    for (const proposal of expired) {
      await this.closeVoting(proposal.id);
    }
  }

  /**
   * Generate weekly summary
   */
  getWeeklySummary(): {
    totalProposals: number;
    passed: number;
    rejected: number;
    active: number;
  } {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyProposals = this.proposals.filter(
      p => p.proposedAt >= weekAgo
    );

    return {
      totalProposals: weeklyProposals.length,
      passed: weeklyProposals.filter(p => p.status === 'passed').length,
      rejected: weeklyProposals.filter(p => p.status === 'rejected').length,
      active: weeklyProposals.filter(p => p.status === 'voting').length
    };
  }

  /**
   * Generate daily report
   */
  async generateReport(): Promise<AgentReport> {
    await this.autoCloseExpired();

    const active = this.getActiveProposals();
    const needingVotes = this.getProposalsNeedingVotes();
    const summary = this.getWeeklySummary();

    return {
      agentName: 'GovernanceAgent',
      timestamp: new Date(),
      status: needingVotes.length > 0 ? 'warning' : 'success',
      summary: `${active.length} active proposals, ${needingVotes.length} need votes. This week: ${summary.passed} passed, ${summary.rejected} rejected.`,
      metrics: {
        activeProposals: active.length,
        needingVotes: needingVotes.length,
        weeklyProposals: summary.totalProposals,
        weeklyPassed: summary.passed,
        weeklyRejected: summary.rejected,
        avgQuorum: this.calculateAvgQuorum()
      }
    };
  }

  /**
   * Calculate average quorum across recent proposals
   */
  private calculateAvgQuorum(): number {
    const recent = this.proposals.slice(-10);
    if (recent.length === 0) return 0;

    const quorums = recent.map(p => {
      const totalWeight = p.votes.reduce((sum, v) => sum + v.weight, 0);
      return totalWeight;
    });

    return quorums.reduce((sum, q) => sum + q, 0) / quorums.length;
  }
}
