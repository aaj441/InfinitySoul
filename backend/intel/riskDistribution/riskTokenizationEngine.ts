/**
 * RISK TOKENIZATION ENGINE
 * =========================
 *
 * "Insurance is the only product where you hope you never use what you paid for."
 * "Risk tokens are the only asset where collective ownership creates collective safety."
 *
 * This engine transforms risk into tradeable, distributable tokens.
 * Each token represents a share of risk that can be spread across infinite holders.
 *
 * The Key Insight:
 * ----------------
 * When risk is atomized and distributed across millions of holders,
 * no single entity bears catastrophic exposure. This is the mathematical
 * foundation of all insurance - but we're taking it to the quantum level.
 *
 * @author InfinitySoul Actuarial Engine
 * @version 1.0.0 - Risk Atomization Protocol
 */

import {
  RiskQuantum,
  RiskMolecule,
  RiskState,
  RiskDimension,
  RISK_PERIODIC_TABLE,
  INDUSTRY_RISK_DNA,
  UniversalRiskConverter
} from './universalRiskTaxonomy';

// =============================================================================
// RISK TOKEN PRIMITIVES
// =============================================================================

/**
 * A RiskToken is a tradeable share of a RiskQuantum or RiskMolecule.
 * It's like a stock certificate, but for risk exposure.
 */
export interface RiskToken {
  // Token Identity
  tokenId: string;
  mintTimestamp: Date;
  mintBlock?: number;          // For blockchain integration

  // Underlying Risk
  underlyingType: 'quantum' | 'molecule' | 'synthetic';
  underlyingId: string;
  underlyingNotional: number;

  // Token Economics
  totalSupply: number;         // Total tokens minted for this risk
  tokenIndex: number;          // This token's position (1 of N)
  sharePercentage: number;     // What % of risk this token represents

  // Value Metrics
  notionalExposure: number;    // Dollar exposure this token carries
  expectedLoss: number;        // Expected loss this token carries
  riskPremium: number;         // Premium collected for holding this risk

  // Holder Information
  currentHolder: string;
  holderHistory: Array<{
    holder: string;
    acquiredAt: Date;
    releasedAt?: Date;
    transferPrice?: number;
  }>;

  // Token State
  state: 'active' | 'expired' | 'claimed' | 'burned';
  expirationDate: Date;

  // Metadata
  metadata: {
    sourceIndustry: string;
    sourceGeography: string;
    riskElements: string[];
    correlationTier: 'uncorrelated' | 'low' | 'medium' | 'high' | 'systemic';
    liquidityTier: 'illiquid' | 'low' | 'medium' | 'high' | 'ultra-liquid';
  };
}

/**
 * A RiskTranche is a layer of a risk pool with specific risk/return characteristics.
 * Like CDO tranches, but for any type of risk.
 */
export interface RiskTranche {
  trancheId: string;
  poolId: string;

  // Tranche Positioning
  seniority: 'equity' | 'mezzanine' | 'senior' | 'super-senior';
  attachmentPoint: number;     // Losses below this don't hit this tranche
  detachmentPoint: number;     // Losses above this don't hit this tranche
  thickness: number;           // detachmentPoint - attachmentPoint

  // Economics
  notionalSize: number;
  expectedLoss: number;
  premiumRate: number;         // Annual premium as % of notional
  totalPremiumCollected: number;

  // Risk Metrics
  probabilityOfAttachment: number;  // Probability losses reach attachment
  expectedLossGivenAttachment: number; // If hit, expected loss
  spreadDuration: number;      // Sensitivity to spread changes

  // Tokens
  tokens: RiskToken[];
  totalTokens: number;
}

// =============================================================================
// RISK POOL STRUCTURE
// =============================================================================

/**
 * A RiskPool aggregates multiple risk sources and distributes them
 * across tranches and token holders.
 */
export interface RiskPool {
  poolId: string;
  poolName: string;
  createdAt: Date;

  // Pool Composition
  underlyingRisks: Array<{
    riskId: string;
    type: 'quantum' | 'molecule';
    notional: number;
    expectedLoss: number;
    weight: number;
  }>;

  // Pool Metrics
  totalNotional: number;
  totalExpectedLoss: number;
  poolDiversity: number;       // 0-1, higher = more diversified
  averageCorrelation: number;

  // Tranche Structure
  tranches: RiskTranche[];

  // Pool State
  state: 'forming' | 'active' | 'runoff' | 'settled';
  inceptionDate: Date;
  maturityDate: Date;

  // Performance
  realizedLosses: number;
  realizedRecoveries: number;
  premiumsCollected: number;
  premiumsDistributed: number;
}

// =============================================================================
// RISK TOKENIZATION ENGINE
// =============================================================================

/**
 * The RiskTokenizationEngine mints, manages, and distributes risk tokens.
 */
export class RiskTokenizationEngine {
  private pools: Map<string, RiskPool> = new Map();
  private tokens: Map<string, RiskToken> = new Map();
  private tranches: Map<string, RiskTranche> = new Map();

  // ==========================================================================
  // POOL CREATION
  // ==========================================================================

  /**
   * Create a new risk pool from a collection of risk quanta/molecules
   */
  createPool(
    name: string,
    risks: Array<RiskQuantum | RiskMolecule>,
    trancheStructure: Array<{
      seniority: 'equity' | 'mezzanine' | 'senior' | 'super-senior';
      attachmentPct: number;
      detachmentPct: number;
      premiumRate: number;
    }>,
    maturityDays: number = 365
  ): RiskPool {
    const poolId = `POOL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Calculate pool metrics
    const underlyingRisks = risks.map(risk => {
      const isQuantum = 'quantumId' in risk;
      return {
        riskId: isQuantum ? (risk as RiskQuantum).quantumId : (risk as RiskMolecule).moleculeId,
        type: isQuantum ? 'quantum' as const : 'molecule' as const,
        notional: isQuantum ? (risk as RiskQuantum).notionalValue : (risk as RiskMolecule).totalNotional,
        expectedLoss: isQuantum
          ? (risk as RiskQuantum).expectedLoss
          : (risk as RiskMolecule).totalNotional * (risk as RiskMolecule).weightedProbability,
        weight: 0 // Will be calculated
      };
    });

    const totalNotional = underlyingRisks.reduce((sum, r) => sum + r.notional, 0);
    underlyingRisks.forEach(r => r.weight = r.notional / totalNotional);

    const totalExpectedLoss = underlyingRisks.reduce((sum, r) => sum + r.expectedLoss, 0);

    // Calculate diversity score
    const poolDiversity = this.calculateDiversityScore(risks);
    const averageCorrelation = this.calculateAverageCorrelation(risks);

    // Create tranches
    const tranches: RiskTranche[] = trancheStructure.map(ts => {
      const trancheId = `TRNCH-${poolId}-${ts.seniority}`;
      const thickness = ts.detachmentPct - ts.attachmentPct;
      const notionalSize = totalNotional * thickness;

      // Calculate tranche-specific metrics
      const { probAttachment, elga } = this.calculateTrancheMetrics(
        totalExpectedLoss / totalNotional,
        poolDiversity,
        ts.attachmentPct,
        ts.detachmentPct
      );

      const tranche: RiskTranche = {
        trancheId,
        poolId,
        seniority: ts.seniority,
        attachmentPoint: ts.attachmentPct,
        detachmentPoint: ts.detachmentPct,
        thickness,
        notionalSize,
        expectedLoss: notionalSize * probAttachment * elga,
        premiumRate: ts.premiumRate,
        totalPremiumCollected: 0,
        probabilityOfAttachment: probAttachment,
        expectedLossGivenAttachment: elga,
        spreadDuration: this.calculateSpreadDuration(ts.seniority, maturityDays / 365),
        tokens: [],
        totalTokens: 0
      };

      this.tranches.set(trancheId, tranche);
      return tranche;
    });

    const pool: RiskPool = {
      poolId,
      poolName: name,
      createdAt: new Date(),
      underlyingRisks,
      totalNotional,
      totalExpectedLoss,
      poolDiversity,
      averageCorrelation,
      tranches,
      state: 'forming',
      inceptionDate: new Date(),
      maturityDate: new Date(Date.now() + maturityDays * 24 * 60 * 60 * 1000),
      realizedLosses: 0,
      realizedRecoveries: 0,
      premiumsCollected: 0,
      premiumsDistributed: 0
    };

    this.pools.set(poolId, pool);
    return pool;
  }

  // ==========================================================================
  // TOKEN MINTING
  // ==========================================================================

  /**
   * Mint tokens for a tranche
   */
  mintTokens(
    trancheId: string,
    numberOfTokens: number,
    initialHolder: string = 'TREASURY'
  ): RiskToken[] {
    const tranche = this.tranches.get(trancheId);
    if (!tranche) {
      throw new Error(`Tranche not found: ${trancheId}`);
    }

    const pool = this.pools.get(tranche.poolId);
    if (!pool) {
      throw new Error(`Pool not found for tranche: ${trancheId}`);
    }

    const mintedTokens: RiskToken[] = [];
    const sharePerToken = 1 / numberOfTokens;
    const notionalPerToken = tranche.notionalSize * sharePerToken;
    const expectedLossPerToken = tranche.expectedLoss * sharePerToken;
    const premiumPerToken = (tranche.notionalSize * tranche.premiumRate) * sharePerToken;

    // Determine risk element composition from underlying
    const riskElements = this.extractRiskElements(pool);

    // Determine correlation tier based on pool correlation
    const correlationTier = this.determineCorrelationTier(pool.averageCorrelation);

    // Determine liquidity tier based on tranche seniority
    const liquidityTier = this.determineLiquidityTier(tranche.seniority, numberOfTokens);

    for (let i = 0; i < numberOfTokens; i++) {
      const tokenId = `TKN-${trancheId}-${i + 1}`;

      const token: RiskToken = {
        tokenId,
        mintTimestamp: new Date(),
        underlyingType: 'synthetic',
        underlyingId: trancheId,
        underlyingNotional: tranche.notionalSize,
        totalSupply: numberOfTokens,
        tokenIndex: i + 1,
        sharePercentage: sharePerToken * 100,
        notionalExposure: notionalPerToken,
        expectedLoss: expectedLossPerToken,
        riskPremium: premiumPerToken,
        currentHolder: initialHolder,
        holderHistory: [{
          holder: initialHolder,
          acquiredAt: new Date()
        }],
        state: 'active',
        expirationDate: pool.maturityDate,
        metadata: {
          sourceIndustry: this.extractPrimaryIndustry(pool),
          sourceGeography: this.extractPrimaryGeography(pool),
          riskElements,
          correlationTier,
          liquidityTier
        }
      };

      this.tokens.set(tokenId, token);
      mintedTokens.push(token);
    }

    // Update tranche with minted tokens
    tranche.tokens = mintedTokens;
    tranche.totalTokens = numberOfTokens;

    return mintedTokens;
  }

  /**
   * Transfer a token to a new holder
   */
  transferToken(
    tokenId: string,
    newHolder: string,
    transferPrice?: number
  ): RiskToken {
    const token = this.tokens.get(tokenId);
    if (!token) {
      throw new Error(`Token not found: ${tokenId}`);
    }

    if (token.state !== 'active') {
      throw new Error(`Token not active: ${tokenId}, state: ${token.state}`);
    }

    // Close out current holder's history
    const lastHistory = token.holderHistory[token.holderHistory.length - 1];
    lastHistory.releasedAt = new Date();
    lastHistory.transferPrice = transferPrice;

    // Add new holder
    token.holderHistory.push({
      holder: newHolder,
      acquiredAt: new Date()
    });

    token.currentHolder = newHolder;

    return token;
  }

  // ==========================================================================
  // RISK DISTRIBUTION
  // ==========================================================================

  /**
   * Calculate optimal distribution of tokens across holder types
   */
  calculateOptimalDistribution(
    poolId: string,
    holderCapacity: Map<string, { maxNotional: number; riskAppetite: number; correlationLimit: number }>
  ): Map<string, string[]> {
    const pool = this.pools.get(poolId);
    if (!pool) {
      throw new Error(`Pool not found: ${poolId}`);
    }

    const distribution: Map<string, string[]> = new Map();

    for (const tranche of pool.tranches) {
      // Sort holders by risk appetite match to tranche
      const trancheRiskLevel = this.getTrancheRiskLevel(tranche.seniority);

      const sortedHolders = Array.from(holderCapacity.entries())
        .filter(([_, capacity]) => {
          // Filter to holders with capacity and appropriate risk appetite
          return capacity.maxNotional > 0 &&
            Math.abs(capacity.riskAppetite - trancheRiskLevel) < 0.3;
        })
        .sort((a, b) => {
          // Prefer holders with more capacity and closer risk appetite match
          const aScore = a[1].maxNotional * (1 - Math.abs(a[1].riskAppetite - trancheRiskLevel));
          const bScore = b[1].maxNotional * (1 - Math.abs(b[1].riskAppetite - trancheRiskLevel));
          return bScore - aScore;
        });

      // Distribute tokens
      let tokenIndex = 0;
      for (const [holderId, capacity] of sortedHolders) {
        if (tokenIndex >= tranche.tokens.length) break;

        const tokensForHolder: string[] = [];
        let allocatedNotional = 0;

        while (tokenIndex < tranche.tokens.length &&
          allocatedNotional < capacity.maxNotional) {
          const token = tranche.tokens[tokenIndex];
          tokensForHolder.push(token.tokenId);
          allocatedNotional += token.notionalExposure;
          tokenIndex++;

          // Update capacity
          capacity.maxNotional -= token.notionalExposure;
        }

        if (tokensForHolder.length > 0) {
          const existing = distribution.get(holderId) || [];
          distribution.set(holderId, [...existing, ...tokensForHolder]);
        }
      }
    }

    return distribution;
  }

  /**
   * Execute distribution - transfer tokens to their optimal holders
   */
  executeDistribution(
    distribution: Map<string, string[]>,
    priceCalculator: (token: RiskToken) => number
  ): Array<{ tokenId: string; holder: string; price: number }> {
    const transfers: Array<{ tokenId: string; holder: string; price: number }> = [];

    for (const [holder, tokenIds] of distribution.entries()) {
      for (const tokenId of tokenIds) {
        const token = this.tokens.get(tokenId);
        if (token && token.currentHolder !== holder) {
          const price = priceCalculator(token);
          this.transferToken(tokenId, holder, price);
          transfers.push({ tokenId, holder, price });
        }
      }
    }

    return transfers;
  }

  // ==========================================================================
  // ANALYTICS
  // ==========================================================================

  /**
   * Calculate pool diversity score (0-1)
   */
  private calculateDiversityScore(risks: Array<RiskQuantum | RiskMolecule>): number {
    // Extract unique risk elements
    const elements = new Set<string>();
    const industries = new Set<string>();
    const geographies = new Set<string>();

    for (const risk of risks) {
      if ('quantumId' in risk) {
        elements.add(risk.primaryElement);
        industries.add(risk.sourceIndustry);
        geographies.add(risk.sourceGeography);
      } else {
        for (const q of risk.quanta) {
          elements.add(q.primaryElement);
          industries.add(q.sourceIndustry);
          geographies.add(q.sourceGeography);
        }
      }
    }

    // Diversity score based on unique combinations
    const elementScore = Math.min(1, elements.size / 10);
    const industryScore = Math.min(1, industries.size / 5);
    const geoScore = Math.min(1, geographies.size / 5);

    return (elementScore * 0.4 + industryScore * 0.35 + geoScore * 0.25);
  }

  /**
   * Calculate average correlation in pool
   */
  private calculateAverageCorrelation(risks: Array<RiskQuantum | RiskMolecule>): number {
    if (risks.length < 2) return 0;

    let totalCorrelation = 0;
    let pairs = 0;

    for (let i = 0; i < risks.length; i++) {
      for (let j = i + 1; j < risks.length; j++) {
        const risk1 = risks[i];
        const risk2 = risks[j];

        // Get primary elements
        const elem1 = 'quantumId' in risk1
          ? risk1.primaryElement
          : risk1.quanta[0]?.primaryElement || 'OP';
        const elem2 = 'quantumId' in risk2
          ? risk2.primaryElement
          : risk2.quanta[0]?.primaryElement || 'OP';

        // Calculate correlation based on elements
        const e1 = RISK_PERIODIC_TABLE[elem1];
        const e2 = RISK_PERIODIC_TABLE[elem2];

        if (e1 && e2) {
          // Same genesis = higher correlation
          const genesisCorr = e1.genesis === e2.genesis ? 0.4 : 0;
          const reactivityCorr = (e1.reactivity + e2.reactivity) / 4;
          totalCorrelation += genesisCorr + reactivityCorr;
        }
        pairs++;
      }
    }

    return pairs > 0 ? totalCorrelation / pairs : 0;
  }

  /**
   * Calculate tranche-specific metrics using actuarial models
   */
  private calculateTrancheMetrics(
    poolEL: number,        // Pool expected loss ratio
    diversity: number,     // Pool diversity
    attachment: number,    // Attachment point
    detachment: number     // Detachment point
  ): { probAttachment: number; elga: number } {
    // Using a simplified Vasicek single-factor model
    // In production, this would use full Monte Carlo simulation

    // Adjust for diversity - more diverse pools have thinner tails
    const tailFactor = 1 - diversity * 0.5;

    // Probability that losses reach attachment point
    // Using a lognormal approximation
    const sigma = poolEL * tailFactor * 2; // Volatility of losses
    const mu = Math.log(poolEL) - 0.5 * sigma * sigma;

    // P(Loss > attachment)
    const probAttachment = attachment < poolEL
      ? 1 - this.normalCDF((Math.log(attachment) - mu) / sigma)
      : Math.exp(-Math.pow(attachment - poolEL, 2) / (2 * sigma * sigma));

    // Expected loss given attachment
    // Simplified: average of attachment and detachment, capped
    const midpoint = (attachment + detachment) / 2;
    const elga = Math.min(1, (midpoint - attachment) / (detachment - attachment));

    return {
      probAttachment: Math.max(0.001, Math.min(0.999, probAttachment)),
      elga: Math.max(0.1, Math.min(0.9, elga))
    };
  }

  /**
   * Standard normal CDF approximation
   */
  private normalCDF(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return 0.5 * (1.0 + sign * y);
  }

  /**
   * Calculate spread duration for a tranche
   */
  private calculateSpreadDuration(
    seniority: 'equity' | 'mezzanine' | 'senior' | 'super-senior',
    yearsToMaturity: number
  ): number {
    // Spread duration increases with seniority and time
    const seniorityMultiplier = {
      'equity': 0.5,
      'mezzanine': 0.75,
      'senior': 1.0,
      'super-senior': 1.25
    }[seniority];

    return yearsToMaturity * seniorityMultiplier;
  }

  /**
   * Extract risk elements from pool
   */
  private extractRiskElements(pool: RiskPool): string[] {
    const elements = new Set<string>();

    // This is simplified - in production, would traverse actual underlying
    for (const risk of pool.underlyingRisks) {
      // Get first character as element symbol (simplified)
      elements.add('CY'); // Default
    }

    return Array.from(elements);
  }

  /**
   * Extract primary industry from pool
   */
  private extractPrimaryIndustry(pool: RiskPool): string {
    // Would analyze underlying in production
    return 'DIVERSIFIED';
  }

  /**
   * Extract primary geography from pool
   */
  private extractPrimaryGeography(pool: RiskPool): string {
    return 'GLOBAL';
  }

  /**
   * Determine correlation tier
   */
  private determineCorrelationTier(
    avgCorrelation: number
  ): 'uncorrelated' | 'low' | 'medium' | 'high' | 'systemic' {
    if (avgCorrelation < 0.1) return 'uncorrelated';
    if (avgCorrelation < 0.3) return 'low';
    if (avgCorrelation < 0.5) return 'medium';
    if (avgCorrelation < 0.7) return 'high';
    return 'systemic';
  }

  /**
   * Determine liquidity tier
   */
  private determineLiquidityTier(
    seniority: string,
    tokenCount: number
  ): 'illiquid' | 'low' | 'medium' | 'high' | 'ultra-liquid' {
    // More senior tranches and more tokens = more liquid
    const seniorityScore = {
      'equity': 0,
      'mezzanine': 1,
      'senior': 2,
      'super-senior': 3
    }[seniority] || 1;

    const tokenScore = Math.min(4, Math.floor(Math.log10(tokenCount)));
    const totalScore = seniorityScore + tokenScore;

    if (totalScore < 2) return 'illiquid';
    if (totalScore < 3) return 'low';
    if (totalScore < 5) return 'medium';
    if (totalScore < 7) return 'high';
    return 'ultra-liquid';
  }

  /**
   * Get risk level for tranche (0-1)
   */
  private getTrancheRiskLevel(
    seniority: 'equity' | 'mezzanine' | 'senior' | 'super-senior'
  ): number {
    return {
      'equity': 0.9,
      'mezzanine': 0.6,
      'senior': 0.3,
      'super-senior': 0.1
    }[seniority];
  }

  // ==========================================================================
  // GETTERS
  // ==========================================================================

  getPool(poolId: string): RiskPool | undefined {
    return this.pools.get(poolId);
  }

  getToken(tokenId: string): RiskToken | undefined {
    return this.tokens.get(tokenId);
  }

  getTranche(trancheId: string): RiskTranche | undefined {
    return this.tranches.get(trancheId);
  }

  getAllPools(): RiskPool[] {
    return Array.from(this.pools.values());
  }

  getTokensByHolder(holder: string): RiskToken[] {
    return Array.from(this.tokens.values())
      .filter(t => t.currentHolder === holder);
  }

  /**
   * Get aggregate exposure for a holder
   */
  getHolderExposure(holder: string): {
    totalNotional: number;
    totalExpectedLoss: number;
    totalPremium: number;
    tokenCount: number;
    byElement: Record<string, number>;
    byIndustry: Record<string, number>;
    byCorrelationTier: Record<string, number>;
  } {
    const tokens = this.getTokensByHolder(holder);

    const byElement: Record<string, number> = {};
    const byIndustry: Record<string, number> = {};
    const byCorrelationTier: Record<string, number> = {};

    let totalNotional = 0;
    let totalExpectedLoss = 0;
    let totalPremium = 0;

    for (const token of tokens) {
      totalNotional += token.notionalExposure;
      totalExpectedLoss += token.expectedLoss;
      totalPremium += token.riskPremium;

      for (const elem of token.metadata.riskElements) {
        byElement[elem] = (byElement[elem] || 0) + token.notionalExposure;
      }

      byIndustry[token.metadata.sourceIndustry] =
        (byIndustry[token.metadata.sourceIndustry] || 0) + token.notionalExposure;

      byCorrelationTier[token.metadata.correlationTier] =
        (byCorrelationTier[token.metadata.correlationTier] || 0) + token.notionalExposure;
    }

    return {
      totalNotional,
      totalExpectedLoss,
      totalPremium,
      tokenCount: tokens.length,
      byElement,
      byIndustry,
      byCorrelationTier
    };
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default RiskTokenizationEngine;
