/**
 * CELL GOVERNANCE MODULE
 * ======================
 *
 * "The goal is to graduate the cell to self-governance, not flip it for max profit."
 *
 * Inspired by Telluride Association's model of self-governing intellectual communities.
 * Each business unit (MGA, service, etc.) is a "Cell" that can:
 *
 * 1. GOVERN ITSELF via elected House Committee
 * 2. VOTE on risk appetite, profit distribution, policies
 * 3. SHARE PROFITS according to contribution
 * 4. GRADUATE to full independence when ready
 * 5. FORK and leave, taking their data
 *
 * Revenue Flow (Kluge + Telluride):
 * ├── 10% → Commons Tithe (free training, open source)
 * ├── 30% → Cell Treasury (operations, growth)
 * ├── 30% → Member Distribution (profit share)
 * └── 30% → Network Fee (IS HoldCo)
 */

import { v4 as uuidv4 } from 'uuid';

// =============================================================================
// TYPES
// =============================================================================

export interface Cell {
  id: string;
  name: string;
  description: string;
  type: 'mga' | 'service' | 'protocol' | 'commons';
  status: CellStatus;
  createdAt: Date;
  graduatedAt?: Date;

  // Governance
  governance: GovernanceConfig;
  houseCommittee: HouseCommittee;

  // Treasury
  treasury: TreasuryState;

  // Members
  members: Member[];
  memberCount: number;

  // Metrics (for graduation eligibility)
  metrics: CellMetrics;
}

export type CellStatus =
  | 'incubating'    // New cell, under network oversight
  | 'operating'     // Active cell, self-governing within limits
  | 'graduating'    // Voted to graduate, in transition
  | 'independent'   // Fully self-governed, pays network fee only
  | 'forked';       // Left the network with their data

export interface GovernanceConfig {
  // Voting thresholds
  standardQuorum: number;        // % of members needed for vote (default: 51%)
  superMajority: number;         // % needed for major decisions (default: 67%)
  graduationThreshold: number;   // % needed to graduate (default: 75%)

  // Voting periods
  standardVotePeriodDays: number;
  urgentVotePeriodDays: number;

  // Term limits
  committeeTermMonths: number;
  maxConsecutiveTerms: number;

  // Revenue splits (must sum to 100)
  revenueSplit: {
    commonsTithe: number;        // Default: 10%
    cellTreasury: number;        // Default: 30%
    memberDistribution: number;  // Default: 30%
    networkFee: number;          // Default: 30%
  };
}

export interface HouseCommittee {
  id: string;
  cellId: string;
  termStart: Date;
  termEnd: Date;
  termNumber: number;

  // Elected positions
  chair: Member;
  treasurer: Member;
  secretary: Member;
  members: Member[];             // Additional committee members

  // Activity
  meetingsHeld: number;
  proposalsReviewed: number;
}

export interface Member {
  id: string;
  address: string;               // Wallet or email
  displayName: string;
  joinedAt: Date;

  // Contribution tracking
  contributionScore: number;     // 0-100, calculated from activity
  tokenBalance: number;          // $SOUL governance tokens
  profitSharePercent: number;    // Current profit share allocation

  // Voting power
  votingWeight: number;          // Based on contribution + tokens
  votesParticipated: number;
  proposalsCreated: number;

  // Roles
  roles: MemberRole[];
  isCommitteeMember: boolean;
  isFounder: boolean;
}

export type MemberRole =
  | 'founder'
  | 'committee_chair'
  | 'committee_member'
  | 'contributor'
  | 'voter'
  | 'observer';

export interface TreasuryState {
  cellId: string;
  balance: number;               // Current treasury balance (USD)
  totalRevenue: number;          // All-time revenue
  totalDistributed: number;      // All-time member distributions
  totalTithed: number;           // All-time commons contributions
  totalNetworkFees: number;      // All-time network fees paid

  // Pending
  pendingDistribution: number;   // Awaiting next distribution cycle
  reserveBalance: number;        // Emergency reserve (3 months ops)

  // History
  lastDistributionAt?: Date;
  distributionCount: number;
}

export interface CellMetrics {
  // Financial
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  revenueGrowthPercent: number;

  // Operational
  activeMembers: number;
  proposalPassRate: number;
  avgVoterTurnout: number;

  // Graduation requirements
  consecutiveProfitableMonths: number;
  totalLifetimeRevenue: number;
  governanceMaturityScore: number;
}

// =============================================================================
// PROPOSALS & VOTING
// =============================================================================

export interface Proposal {
  id: string;
  cellId: string;
  type: ProposalType;
  status: ProposalStatus;

  // Content
  title: string;
  description: string;
  author: Member;
  createdAt: Date;

  // Voting
  votingStartsAt: Date;
  votingEndsAt: Date;
  requiredQuorum: number;
  requiredMajority: number;

  // Results
  votes: Vote[];
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  totalVotingWeight: number;
  result?: 'passed' | 'failed' | 'quorum_not_met';
  executedAt?: Date;

  // For specific proposal types
  payload?: ProposalPayload;
}

export type ProposalType =
  | 'policy_change'           // Change cell operating policy
  | 'budget_allocation'       // Allocate treasury funds
  | 'member_admission'        // Admit new member
  | 'member_removal'          // Remove member (requires supermajority)
  | 'committee_election'      // Elect new House Committee
  | 'revenue_split_change'    // Change revenue distribution
  | 'graduation_vote'         // Vote to graduate to independence
  | 'fork_vote'               // Vote to fork from network
  | 'emergency';              // Urgent decision (shorter voting period)

export type ProposalStatus =
  | 'draft'
  | 'pending_review'          // Awaiting committee review
  | 'voting'
  | 'passed'
  | 'failed'
  | 'executed'
  | 'vetoed';                 // Network veto (only for incubating cells)

export interface ProposalPayload {
  // Budget allocation
  budgetAmount?: number;
  budgetRecipient?: string;
  budgetPurpose?: string;

  // Member changes
  memberAddress?: string;
  memberRole?: MemberRole;

  // Revenue split changes
  newRevenueSplit?: GovernanceConfig['revenueSplit'];

  // Policy changes
  policyKey?: string;
  policyOldValue?: unknown;
  policyNewValue?: unknown;
}

export interface Vote {
  id: string;
  proposalId: string;
  voter: Member;
  choice: 'yes' | 'no' | 'abstain';
  weight: number;
  reason?: string;
  castAt: Date;
}

// =============================================================================
// GRADUATION REQUIREMENTS
// =============================================================================

export const GRADUATION_REQUIREMENTS = {
  // Financial stability
  MIN_LIFETIME_REVENUE: 1_000_000,           // $1M total revenue
  MIN_CONSECUTIVE_PROFITABLE_MONTHS: 6,
  MIN_MONTHLY_PROFIT: 10_000,

  // Governance maturity
  MIN_ACTIVE_MEMBERS: 5,
  MIN_PROPOSALS_PASSED: 10,
  MIN_AVG_VOTER_TURNOUT: 0.5,                // 50%
  MIN_COMMITTEE_ELECTIONS: 2,                 // At least 2 term transitions

  // Operational
  MIN_OPERATING_MONTHS: 12,

  // Voting threshold
  GRADUATION_APPROVAL_THRESHOLD: 0.75,        // 75% of votes
} as const;

// =============================================================================
// CELL GOVERNANCE ENGINE
// =============================================================================

export class CellGovernance {
  private cells: Map<string, Cell> = new Map();
  private proposals: Map<string, Proposal> = new Map();
  private votes: Map<string, Vote[]> = new Map();

  // ===========================================================================
  // CELL MANAGEMENT
  // ===========================================================================

  /**
   * Create a new cell
   */
  createCell(params: {
    name: string;
    description: string;
    type: Cell['type'];
    founders: Omit<Member, 'id' | 'joinedAt' | 'votingWeight' | 'votesParticipated' | 'proposalsCreated' | 'isCommitteeMember'>[];
  }): Cell {
    const id = uuidv4();
    const now = new Date();

    // Create founder members
    const members: Member[] = params.founders.map(f => ({
      ...f,
      id: uuidv4(),
      joinedAt: now,
      votingWeight: this.calculateVotingWeight(f.contributionScore, f.tokenBalance),
      votesParticipated: 0,
      proposalsCreated: 0,
      isCommitteeMember: false,
      isFounder: true,
      roles: ['founder', 'voter'] as MemberRole[],
    }));

    // First founder is initial chair
    const chair = members[0];
    chair.roles.push('committee_chair');
    chair.isCommitteeMember = true;

    const cell: Cell = {
      id,
      name: params.name,
      description: params.description,
      type: params.type,
      status: 'incubating',
      createdAt: now,
      governance: this.getDefaultGovernanceConfig(),
      houseCommittee: {
        id: uuidv4(),
        cellId: id,
        termStart: now,
        termEnd: new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000), // 6 months
        termNumber: 1,
        chair,
        treasurer: members[1] || chair,
        secretary: members[2] || chair,
        members: members.slice(3),
        meetingsHeld: 0,
        proposalsReviewed: 0,
      },
      treasury: {
        cellId: id,
        balance: 0,
        totalRevenue: 0,
        totalDistributed: 0,
        totalTithed: 0,
        totalNetworkFees: 0,
        pendingDistribution: 0,
        reserveBalance: 0,
        distributionCount: 0,
      },
      members,
      memberCount: members.length,
      metrics: {
        monthlyRevenue: 0,
        monthlyExpenses: 0,
        monthlyProfit: 0,
        revenueGrowthPercent: 0,
        activeMembers: members.length,
        proposalPassRate: 0,
        avgVoterTurnout: 0,
        consecutiveProfitableMonths: 0,
        totalLifetimeRevenue: 0,
        governanceMaturityScore: 0,
      },
    };

    this.cells.set(id, cell);
    return cell;
  }

  /**
   * Get default governance configuration
   */
  private getDefaultGovernanceConfig(): GovernanceConfig {
    return {
      standardQuorum: 51,
      superMajority: 67,
      graduationThreshold: 75,
      standardVotePeriodDays: 7,
      urgentVotePeriodDays: 2,
      committeeTermMonths: 6,
      maxConsecutiveTerms: 2,
      revenueSplit: {
        commonsTithe: 10,
        cellTreasury: 30,
        memberDistribution: 30,
        networkFee: 30,
      },
    };
  }

  /**
   * Calculate voting weight based on contribution and tokens
   */
  private calculateVotingWeight(contributionScore: number, tokenBalance: number): number {
    // 60% contribution-based, 40% token-based
    const contributionWeight = contributionScore * 0.6;
    const tokenWeight = Math.min(tokenBalance / 1000, 40); // Cap at 40
    return Math.round(contributionWeight + tokenWeight);
  }

  // ===========================================================================
  // PROPOSAL MANAGEMENT
  // ===========================================================================

  /**
   * Create a new proposal
   */
  createProposal(params: {
    cellId: string;
    type: ProposalType;
    title: string;
    description: string;
    authorId: string;
    payload?: ProposalPayload;
  }): Proposal {
    const cell = this.cells.get(params.cellId);
    if (!cell) throw new Error('Cell not found');

    const author = cell.members.find(m => m.id === params.authorId);
    if (!author) throw new Error('Author not a member of cell');

    const now = new Date();
    const isUrgent = params.type === 'emergency';
    const votingPeriod = isUrgent
      ? cell.governance.urgentVotePeriodDays
      : cell.governance.standardVotePeriodDays;

    // Determine required majority
    let requiredMajority = cell.governance.standardQuorum;
    if (['graduation_vote', 'fork_vote', 'member_removal', 'revenue_split_change'].includes(params.type)) {
      requiredMajority = cell.governance.superMajority;
    }

    const proposal: Proposal = {
      id: uuidv4(),
      cellId: params.cellId,
      type: params.type,
      status: 'pending_review',
      title: params.title,
      description: params.description,
      author,
      createdAt: now,
      votingStartsAt: now, // Committee can delay this
      votingEndsAt: new Date(now.getTime() + votingPeriod * 24 * 60 * 60 * 1000),
      requiredQuorum: cell.governance.standardQuorum,
      requiredMajority,
      votes: [],
      yesVotes: 0,
      noVotes: 0,
      abstainVotes: 0,
      totalVotingWeight: 0,
      payload: params.payload,
    };

    this.proposals.set(proposal.id, proposal);
    this.votes.set(proposal.id, []);

    // Update author stats
    author.proposalsCreated++;

    return proposal;
  }

  /**
   * Committee approves proposal for voting
   */
  approveForVoting(proposalId: string, committeeApproverId: string): Proposal {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) throw new Error('Proposal not found');

    const cell = this.cells.get(proposal.cellId);
    if (!cell) throw new Error('Cell not found');

    // Verify approver is committee member
    const isCommittee = cell.houseCommittee.chair.id === committeeApproverId ||
      cell.houseCommittee.treasurer.id === committeeApproverId ||
      cell.houseCommittee.secretary.id === committeeApproverId ||
      cell.houseCommittee.members.some(m => m.id === committeeApproverId);

    if (!isCommittee) {
      throw new Error('Only committee members can approve proposals for voting');
    }

    proposal.status = 'voting';
    proposal.votingStartsAt = new Date();
    const votingDays = proposal.type === 'emergency'
      ? cell.governance.urgentVotePeriodDays
      : cell.governance.standardVotePeriodDays;
    proposal.votingEndsAt = new Date(Date.now() + votingDays * 24 * 60 * 60 * 1000);

    // Update committee stats
    cell.houseCommittee.proposalsReviewed++;

    return proposal;
  }

  /**
   * Cast a vote on a proposal
   */
  castVote(params: {
    proposalId: string;
    voterId: string;
    choice: Vote['choice'];
    reason?: string;
  }): Vote {
    const proposal = this.proposals.get(params.proposalId);
    if (!proposal) throw new Error('Proposal not found');

    if (proposal.status !== 'voting') {
      throw new Error('Proposal is not in voting phase');
    }

    if (new Date() > proposal.votingEndsAt) {
      throw new Error('Voting period has ended');
    }

    const cell = this.cells.get(proposal.cellId);
    if (!cell) throw new Error('Cell not found');

    const voter = cell.members.find(m => m.id === params.voterId);
    if (!voter) throw new Error('Voter not a member of cell');

    // Check for existing vote
    const existingVotes = this.votes.get(params.proposalId) || [];
    if (existingVotes.some(v => v.voter.id === params.voterId)) {
      throw new Error('Member has already voted');
    }

    const vote: Vote = {
      id: uuidv4(),
      proposalId: params.proposalId,
      voter,
      choice: params.choice,
      weight: voter.votingWeight,
      reason: params.reason,
      castAt: new Date(),
    };

    existingVotes.push(vote);
    this.votes.set(params.proposalId, existingVotes);

    // Update proposal tallies
    proposal.votes = existingVotes;
    proposal.totalVotingWeight += vote.weight;

    switch (params.choice) {
      case 'yes':
        proposal.yesVotes += vote.weight;
        break;
      case 'no':
        proposal.noVotes += vote.weight;
        break;
      case 'abstain':
        proposal.abstainVotes += vote.weight;
        break;
    }

    // Update voter stats
    voter.votesParticipated++;

    return vote;
  }

  /**
   * Finalize a proposal after voting ends
   */
  finalizeProposal(proposalId: string): Proposal {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) throw new Error('Proposal not found');

    if (proposal.status !== 'voting') {
      throw new Error('Proposal is not in voting phase');
    }

    const cell = this.cells.get(proposal.cellId);
    if (!cell) throw new Error('Cell not found');

    // Calculate total possible voting weight
    const totalPossibleWeight = cell.members.reduce((sum, m) => sum + m.votingWeight, 0);
    const turnout = proposal.totalVotingWeight / totalPossibleWeight;

    // Check quorum
    if (turnout < proposal.requiredQuorum / 100) {
      proposal.status = 'failed';
      proposal.result = 'quorum_not_met';
      return proposal;
    }

    // Check majority (of votes cast, not total weight)
    const votesForMajority = proposal.yesVotes + proposal.noVotes; // Abstains don't count
    const yesPercent = (proposal.yesVotes / votesForMajority) * 100;

    if (yesPercent >= proposal.requiredMajority) {
      proposal.status = 'passed';
      proposal.result = 'passed';
      this.executeProposal(proposal, cell);
    } else {
      proposal.status = 'failed';
      proposal.result = 'failed';
    }

    // Update cell metrics
    const allProposals = Array.from(this.proposals.values())
      .filter(p => p.cellId === cell.id && p.result);
    cell.metrics.proposalPassRate = allProposals.filter(p => p.result === 'passed').length / allProposals.length;
    cell.metrics.avgVoterTurnout = turnout;

    return proposal;
  }

  /**
   * Execute a passed proposal
   */
  private executeProposal(proposal: Proposal, cell: Cell): void {
    proposal.executedAt = new Date();

    switch (proposal.type) {
      case 'graduation_vote':
        this.graduateCell(cell);
        break;

      case 'fork_vote':
        this.forkCell(cell);
        break;

      case 'revenue_split_change':
        if (proposal.payload?.newRevenueSplit) {
          cell.governance.revenueSplit = proposal.payload.newRevenueSplit;
        }
        break;

      case 'budget_allocation':
        if (proposal.payload?.budgetAmount) {
          cell.treasury.balance -= proposal.payload.budgetAmount;
        }
        break;

      // Other types handled by cell operations
      default:
        break;
    }
  }

  // ===========================================================================
  // GRADUATION & FORKING
  // ===========================================================================

  /**
   * Check if cell is eligible for graduation
   */
  checkGraduationEligibility(cellId: string): {
    eligible: boolean;
    requirements: { name: string; required: number | string; current: number | string; met: boolean }[];
  } {
    const cell = this.cells.get(cellId);
    if (!cell) throw new Error('Cell not found');

    const req = GRADUATION_REQUIREMENTS;
    const m = cell.metrics;

    const requirements = [
      {
        name: 'Lifetime Revenue',
        required: `$${(req.MIN_LIFETIME_REVENUE / 1_000_000).toFixed(1)}M`,
        current: `$${(m.totalLifetimeRevenue / 1_000_000).toFixed(1)}M`,
        met: m.totalLifetimeRevenue >= req.MIN_LIFETIME_REVENUE,
      },
      {
        name: 'Consecutive Profitable Months',
        required: req.MIN_CONSECUTIVE_PROFITABLE_MONTHS,
        current: m.consecutiveProfitableMonths,
        met: m.consecutiveProfitableMonths >= req.MIN_CONSECUTIVE_PROFITABLE_MONTHS,
      },
      {
        name: 'Active Members',
        required: req.MIN_ACTIVE_MEMBERS,
        current: m.activeMembers,
        met: m.activeMembers >= req.MIN_ACTIVE_MEMBERS,
      },
      {
        name: 'Proposals Passed',
        required: req.MIN_PROPOSALS_PASSED,
        current: Array.from(this.proposals.values())
          .filter(p => p.cellId === cellId && p.result === 'passed').length,
        met: Array.from(this.proposals.values())
          .filter(p => p.cellId === cellId && p.result === 'passed').length >= req.MIN_PROPOSALS_PASSED,
      },
      {
        name: 'Avg Voter Turnout',
        required: `${req.MIN_AVG_VOTER_TURNOUT * 100}%`,
        current: `${(m.avgVoterTurnout * 100).toFixed(0)}%`,
        met: m.avgVoterTurnout >= req.MIN_AVG_VOTER_TURNOUT,
      },
      {
        name: 'Committee Elections',
        required: req.MIN_COMMITTEE_ELECTIONS,
        current: cell.houseCommittee.termNumber,
        met: cell.houseCommittee.termNumber >= req.MIN_COMMITTEE_ELECTIONS,
      },
    ];

    return {
      eligible: requirements.every(r => r.met),
      requirements,
    };
  }

  /**
   * Graduate a cell to independence
   */
  private graduateCell(cell: Cell): void {
    cell.status = 'independent';
    cell.graduatedAt = new Date();

    // Update revenue split - independent cells only pay network fee
    cell.governance.revenueSplit = {
      commonsTithe: 10,          // Still contribute to commons
      cellTreasury: 40,          // More to cell
      memberDistribution: 40,    // More to members
      networkFee: 10,            // Reduced network fee (the rails)
    };

    console.log(`[Governance] Cell ${cell.name} graduated to independence`);
  }

  /**
   * Fork a cell from the network
   */
  private forkCell(cell: Cell): void {
    cell.status = 'forked';

    // In a real implementation:
    // 1. Export all cell data
    // 2. Transfer treasury balance
    // 3. Remove network fee obligation
    // 4. Provide data export package

    console.log(`[Governance] Cell ${cell.name} forked from network`);
  }

  // ===========================================================================
  // TREASURY & DISTRIBUTIONS
  // ===========================================================================

  /**
   * Record revenue for a cell
   */
  recordRevenue(cellId: string, amount: number): void {
    const cell = this.cells.get(cellId);
    if (!cell) throw new Error('Cell not found');

    const split = cell.governance.revenueSplit;

    // Calculate splits
    const commonsTithe = amount * (split.commonsTithe / 100);
    const cellTreasury = amount * (split.cellTreasury / 100);
    const memberDistribution = amount * (split.memberDistribution / 100);
    const networkFee = amount * (split.networkFee / 100);

    // Update treasury
    cell.treasury.totalRevenue += amount;
    cell.treasury.balance += cellTreasury;
    cell.treasury.pendingDistribution += memberDistribution;
    cell.treasury.totalTithed += commonsTithe;
    cell.treasury.totalNetworkFees += networkFee;

    // Update metrics
    cell.metrics.totalLifetimeRevenue += amount;
    cell.metrics.monthlyRevenue += amount;
  }

  /**
   * Distribute profits to members
   */
  distributeProfit(cellId: string): {
    totalDistributed: number;
    distributions: { memberId: string; memberName: string; amount: number }[];
  } {
    const cell = this.cells.get(cellId);
    if (!cell) throw new Error('Cell not found');

    const pending = cell.treasury.pendingDistribution;
    if (pending <= 0) {
      return { totalDistributed: 0, distributions: [] };
    }

    // Calculate each member's share based on profit share percent
    const distributions = cell.members.map(m => ({
      memberId: m.id,
      memberName: m.displayName,
      amount: pending * (m.profitSharePercent / 100),
    }));

    // Update treasury
    cell.treasury.pendingDistribution = 0;
    cell.treasury.totalDistributed += pending;
    cell.treasury.lastDistributionAt = new Date();
    cell.treasury.distributionCount++;

    return {
      totalDistributed: pending,
      distributions,
    };
  }

  // ===========================================================================
  // GETTERS
  // ===========================================================================

  getCell(cellId: string): Cell | undefined {
    return this.cells.get(cellId);
  }

  getAllCells(): Cell[] {
    return Array.from(this.cells.values());
  }

  getProposal(proposalId: string): Proposal | undefined {
    return this.proposals.get(proposalId);
  }

  getCellProposals(cellId: string): Proposal[] {
    return Array.from(this.proposals.values())
      .filter(p => p.cellId === cellId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getActiveProposals(cellId: string): Proposal[] {
    return this.getCellProposals(cellId)
      .filter(p => p.status === 'voting' || p.status === 'pending_review');
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default CellGovernance;
