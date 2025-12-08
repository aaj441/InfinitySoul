/**
 * LLM RISK ORACLE NETWORK
 * ========================
 *
 * "In the age of AI, risk assessment becomes distributed cognition."
 *
 * This module creates a decentralized network of LLM-based risk oracles.
 * Each LLM instance acts as an independent assessor, and consensus across
 * multiple models creates robust, manipulation-resistant risk scores.
 *
 * The Revolutionary Insight:
 * --------------------------
 * Traditional actuarial models are static - built once, deployed forever.
 * LLM oracles are dynamic - they continuously learn from new data, news,
 * regulatory changes, and market conditions.
 *
 * By distributing risk assessment across multiple LLMs (Claude, GPT, Gemini,
 * Llama, etc.), we create an "oracle network" where:
 * - No single point of failure
 * - Diverse perspectives reduce model bias
 * - Consensus mechanisms detect manipulation
 * - Real-time adaptation to changing conditions
 *
 * Data Centers as Risk Nodes:
 * ---------------------------
 * Every data center running these LLMs becomes a node in the risk distribution
 * network. Their computational capacity IS risk-bearing capacity. If a data
 * center processes risk assessments, they're implicitly backing those risks.
 *
 * @author InfinitySoul Actuarial Engine
 * @version 1.0.0 - Distributed Risk Intelligence
 */

import {
  RiskQuantum,
  RiskMolecule,
  RISK_PERIODIC_TABLE,
  RiskElement,
  RiskGenesis
} from './universalRiskTaxonomy';

import { RiskToken } from './riskTokenizationEngine';

// =============================================================================
// ORACLE NETWORK PRIMITIVES
// =============================================================================

/**
 * An LLM Oracle is a single AI model instance that can assess risk.
 */
export interface LLMOracle {
  oracleId: string;
  modelId: string;           // e.g., "claude-3-opus", "gpt-4-turbo"
  provider: OracleProvider;

  // Capabilities
  capabilities: OracleCapability[];
  maxTokensPerRequest: number;
  costPerMillionTokens: number;

  // Performance metrics
  averageLatencyMs: number;
  uptime: number;            // 0-1
  reliability: number;       // Historical accuracy 0-1

  // Network position
  dataCenterLocation: string;
  dataCenterId: string;
  computeCapacity: number;   // In "risk units" per second

  // State
  status: 'online' | 'degraded' | 'offline';
  currentLoad: number;       // 0-1
  queueDepth: number;

  // Economic
  stakeAmount: number;       // How much value they've staked
  reputationScore: number;   // Earned reputation
  slashHistory: SlashEvent[];
}

export enum OracleProvider {
  ANTHROPIC = 'anthropic',
  OPENAI = 'openai',
  GOOGLE = 'google',
  META = 'meta',
  MISTRAL = 'mistral',
  COHERE = 'cohere',
  CUSTOM = 'custom'
}

export enum OracleCapability {
  RISK_SCORING = 'risk_scoring',
  CORRELATION_ANALYSIS = 'correlation_analysis',
  TAIL_RISK_MODELING = 'tail_risk_modeling',
  SENTIMENT_ANALYSIS = 'sentiment_analysis',
  REGULATORY_INTERPRETATION = 'regulatory_interpretation',
  MARKET_ANALYSIS = 'market_analysis',
  CLAIMS_PREDICTION = 'claims_prediction',
  FRAUD_DETECTION = 'fraud_detection'
}

export interface SlashEvent {
  timestamp: Date;
  reason: string;
  amountSlashed: number;
  evidenceHash: string;
}

/**
 * A RiskAssessmentRequest sent to the oracle network
 */
export interface RiskAssessmentRequest {
  requestId: string;
  timestamp: Date;

  // What to assess
  assessmentType: AssessmentType;
  subject: RiskSubject;

  // Request parameters
  requiredConfidence: number;   // Minimum confidence required
  maxLatencyMs: number;         // Maximum allowed latency
  minOracles: number;           // Minimum oracles needed for consensus
  maxCost: number;              // Budget for this assessment

  // Context
  contextData: any;             // Additional context for assessment
  historicalData?: any;         // Historical data if available
}

export enum AssessmentType {
  SINGLE_RISK_SCORE = 'single_risk_score',
  PORTFOLIO_ANALYSIS = 'portfolio_analysis',
  CORRELATION_MATRIX = 'correlation_matrix',
  TAIL_RISK_QUANTILE = 'tail_risk_quantile',
  DYNAMIC_REPRICING = 'dynamic_repricing',
  CLAIMS_PROBABILITY = 'claims_probability',
  MARKET_SENTIMENT = 'market_sentiment'
}

export interface RiskSubject {
  type: 'quantum' | 'molecule' | 'token' | 'portfolio' | 'entity' | 'market';
  id: string;
  data: any;
}

/**
 * Assessment from a single oracle
 */
export interface OracleAssessment {
  oracleId: string;
  requestId: string;
  timestamp: Date;

  // Assessment result
  assessmentType: AssessmentType;
  result: AssessmentResult;

  // Confidence and reasoning
  confidence: number;          // 0-1
  reasoning: string;           // Explanation of the assessment
  evidenceUsed: string[];      // What data/knowledge was used

  // Metadata
  latencyMs: number;
  tokensUsed: number;
  cost: number;

  // Cryptographic proof
  signatureHash: string;       // Oracle's signature of the result
}

export interface AssessmentResult {
  // Core score (interpretation depends on assessmentType)
  primaryScore: number;

  // Breakdown
  componentScores: Record<string, number>;

  // Uncertainty
  confidenceInterval: [number, number];
  standardError: number;

  // Additional outputs
  warnings: string[];
  recommendations: string[];
  metadata: Record<string, any>;
}

/**
 * Consensus result from multiple oracles
 */
export interface ConsensusResult {
  requestId: string;
  timestamp: Date;

  // Participating oracles
  oracleCount: number;
  participatingOracles: string[];
  failedOracles: string[];

  // Consensus assessment
  consensusReached: boolean;
  consensusType: 'unanimous' | 'supermajority' | 'majority' | 'plurality' | 'none';
  aggregatedResult: AssessmentResult;

  // Individual assessments
  individualAssessments: OracleAssessment[];

  // Agreement metrics
  agreementScore: number;      // 0-1, how much oracles agreed
  outlierOracles: string[];    // Oracles that disagreed significantly
  divergenceAnalysis: DivergenceAnalysis;

  // Quality metrics
  overallConfidence: number;
  totalCost: number;
  totalLatencyMs: number;
}

export interface DivergenceAnalysis {
  maxDivergence: number;
  avgDivergence: number;
  divergenceByOracle: Record<string, number>;
  potentialManipulation: boolean;
  manipulationEvidence?: string;
}

// =============================================================================
// LLM ORACLE NETWORK
// =============================================================================

/**
 * The LLMOracleNetwork manages a distributed network of AI risk assessors.
 */
export class LLMOracleNetwork {
  private oracles: Map<string, LLMOracle> = new Map();
  private assessmentHistory: Map<string, ConsensusResult> = new Map();
  private reputationScores: Map<string, number> = new Map();

  // Network configuration
  private config = {
    minOraclesForConsensus: 3,
    supermajorityThreshold: 0.67,
    majorityThreshold: 0.51,
    maxDivergenceForConsensus: 0.2,
    slashThreshold: 0.3,           // Divergence above this = potential slash
    reputationDecayRate: 0.01,
    reputationGainRate: 0.02
  };

  // ==========================================================================
  // ORACLE MANAGEMENT
  // ==========================================================================

  /**
   * Register a new oracle in the network
   */
  registerOracle(oracle: LLMOracle): void {
    if (oracle.stakeAmount < 1000) {
      throw new Error('Minimum stake of 1000 required to join oracle network');
    }

    this.oracles.set(oracle.oracleId, oracle);
    this.reputationScores.set(oracle.oracleId, 0.5); // Start at neutral reputation
  }

  /**
   * Remove an oracle from the network
   */
  deregisterOracle(oracleId: string): void {
    this.oracles.delete(oracleId);
    this.reputationScores.delete(oracleId);
  }

  /**
   * Get available oracles for a request
   */
  private getAvailableOracles(
    request: RiskAssessmentRequest
  ): LLMOracle[] {
    const available: LLMOracle[] = [];

    for (const oracle of this.oracles.values()) {
      // Check status
      if (oracle.status === 'offline') continue;

      // Check capabilities
      const requiredCapability = this.assessmentTypeToCapability(request.assessmentType);
      if (!oracle.capabilities.includes(requiredCapability)) continue;

      // Check load
      if (oracle.currentLoad > 0.9) continue;

      // Check latency
      if (oracle.averageLatencyMs > request.maxLatencyMs) continue;

      available.push(oracle);
    }

    // Sort by reputation and reliability
    return available.sort((a, b) => {
      const aScore = (this.reputationScores.get(a.oracleId) || 0.5) * a.reliability;
      const bScore = (this.reputationScores.get(b.oracleId) || 0.5) * b.reliability;
      return bScore - aScore;
    });
  }

  private assessmentTypeToCapability(type: AssessmentType): OracleCapability {
    const mapping: Record<AssessmentType, OracleCapability> = {
      [AssessmentType.SINGLE_RISK_SCORE]: OracleCapability.RISK_SCORING,
      [AssessmentType.PORTFOLIO_ANALYSIS]: OracleCapability.RISK_SCORING,
      [AssessmentType.CORRELATION_MATRIX]: OracleCapability.CORRELATION_ANALYSIS,
      [AssessmentType.TAIL_RISK_QUANTILE]: OracleCapability.TAIL_RISK_MODELING,
      [AssessmentType.DYNAMIC_REPRICING]: OracleCapability.MARKET_ANALYSIS,
      [AssessmentType.CLAIMS_PROBABILITY]: OracleCapability.CLAIMS_PREDICTION,
      [AssessmentType.MARKET_SENTIMENT]: OracleCapability.SENTIMENT_ANALYSIS
    };
    return mapping[type];
  }

  // ==========================================================================
  // ASSESSMENT EXECUTION
  // ==========================================================================

  /**
   * Submit an assessment request to the oracle network
   */
  async submitAssessment(
    request: RiskAssessmentRequest
  ): Promise<ConsensusResult> {
    const availableOracles = this.getAvailableOracles(request);

    if (availableOracles.length < request.minOracles) {
      throw new Error(
        `Insufficient oracles: need ${request.minOracles}, have ${availableOracles.length}`
      );
    }

    // Select oracles (use more than minimum for robustness)
    const selectedCount = Math.min(
      availableOracles.length,
      Math.max(request.minOracles, 5)
    );
    const selectedOracles = availableOracles.slice(0, selectedCount);

    // Execute assessments in parallel
    const assessmentPromises = selectedOracles.map(oracle =>
      this.executeAssessment(oracle, request)
    );

    const assessments = await Promise.allSettled(assessmentPromises);

    // Collect successful assessments
    const successfulAssessments: OracleAssessment[] = [];
    const failedOracles: string[] = [];

    for (let i = 0; i < assessments.length; i++) {
      const result = assessments[i];
      if (result.status === 'fulfilled') {
        successfulAssessments.push(result.value);
      } else {
        failedOracles.push(selectedOracles[i].oracleId);
      }
    }

    // Build consensus
    const consensus = this.buildConsensus(request, successfulAssessments, failedOracles);

    // Update reputations
    this.updateReputations(consensus);

    // Store result
    this.assessmentHistory.set(request.requestId, consensus);

    return consensus;
  }

  /**
   * Execute assessment on a single oracle
   */
  private async executeAssessment(
    oracle: LLMOracle,
    request: RiskAssessmentRequest
  ): Promise<OracleAssessment> {
    const startTime = Date.now();

    // Build the prompt for the LLM
    const prompt = this.buildAssessmentPrompt(request);

    // Simulate LLM call (in production, this would call actual API)
    const llmResult = await this.callLLMOracle(oracle, prompt);

    const latencyMs = Date.now() - startTime;

    // Parse and validate result
    const result = this.parseAssessmentResult(llmResult, request.assessmentType);

    return {
      oracleId: oracle.oracleId,
      requestId: request.requestId,
      timestamp: new Date(),
      assessmentType: request.assessmentType,
      result,
      confidence: this.calculateConfidence(result, oracle),
      reasoning: llmResult.reasoning || 'No reasoning provided',
      evidenceUsed: llmResult.evidence || [],
      latencyMs,
      tokensUsed: llmResult.tokensUsed || 0,
      cost: (llmResult.tokensUsed || 0) * oracle.costPerMillionTokens / 1_000_000,
      signatureHash: this.generateSignature(oracle.oracleId, result)
    };
  }

  /**
   * Build assessment prompt for LLM
   */
  private buildAssessmentPrompt(request: RiskAssessmentRequest): string {
    const basePrompt = `You are an expert actuarial risk analyst in a decentralized oracle network.
Your assessment will be compared against other oracles for consensus.
Be precise, quantitative, and provide reasoning for your scores.

ASSESSMENT REQUEST:
Type: ${request.assessmentType}
Subject: ${JSON.stringify(request.subject, null, 2)}
Context: ${JSON.stringify(request.contextData, null, 2)}
${request.historicalData ? `Historical Data: ${JSON.stringify(request.historicalData, null, 2)}` : ''}

REQUIRED OUTPUT FORMAT:
{
  "primaryScore": <number 0-100>,
  "componentScores": {
    "frequency": <number 0-100>,
    "severity": <number 0-100>,
    "correlation": <number 0-100>,
    "tail_risk": <number 0-100>,
    "velocity": <number 0-100>
  },
  "confidenceInterval": [<lower>, <upper>],
  "standardError": <number>,
  "warnings": [<array of warning strings>],
  "recommendations": [<array of recommendation strings>],
  "reasoning": "<detailed explanation of your assessment>"
}

Provide your assessment:`;

    return basePrompt;
  }

  /**
   * Call the LLM oracle (simulated for now)
   */
  private async callLLMOracle(
    oracle: LLMOracle,
    prompt: string
  ): Promise<any> {
    // In production, this would call the actual LLM API
    // For now, simulate a response

    await new Promise(resolve => setTimeout(resolve, oracle.averageLatencyMs));

    // Simulate an assessment
    const baseScore = 50 + Math.random() * 30 - 15; // Random around 50
    const noise = (Math.random() - 0.5) * 10; // ±5 noise per oracle

    return {
      primaryScore: Math.max(0, Math.min(100, baseScore + noise)),
      componentScores: {
        frequency: Math.max(0, Math.min(100, 45 + Math.random() * 20)),
        severity: Math.max(0, Math.min(100, 55 + Math.random() * 20)),
        correlation: Math.max(0, Math.min(100, 40 + Math.random() * 20)),
        tail_risk: Math.max(0, Math.min(100, 60 + Math.random() * 20)),
        velocity: Math.max(0, Math.min(100, 50 + Math.random() * 20))
      },
      confidenceInterval: [baseScore - 10, baseScore + 10],
      standardError: 5 + Math.random() * 5,
      warnings: [],
      recommendations: ['Continue monitoring', 'Consider hedging tail risk'],
      reasoning: `Assessment based on ${oracle.modelId} analysis of risk factors.`,
      evidence: ['Historical data', 'Market conditions', 'Regulatory environment'],
      tokensUsed: 1000 + Math.floor(Math.random() * 500)
    };
  }

  /**
   * Parse LLM result into structured assessment
   */
  private parseAssessmentResult(llmResult: any, type: AssessmentType): AssessmentResult {
    return {
      primaryScore: llmResult.primaryScore,
      componentScores: llmResult.componentScores,
      confidenceInterval: llmResult.confidenceInterval,
      standardError: llmResult.standardError,
      warnings: llmResult.warnings || [],
      recommendations: llmResult.recommendations || [],
      metadata: {}
    };
  }

  /**
   * Calculate confidence based on result and oracle reliability
   */
  private calculateConfidence(result: AssessmentResult, oracle: LLMOracle): number {
    const intervalWidth = result.confidenceInterval[1] - result.confidenceInterval[0];
    const narrownessScore = Math.max(0, 1 - intervalWidth / 100);
    const oracleReliability = oracle.reliability;

    return (narrownessScore * 0.4 + oracleReliability * 0.6);
  }

  /**
   * Generate signature hash for result
   */
  private generateSignature(oracleId: string, result: AssessmentResult): string {
    const data = `${oracleId}:${result.primaryScore}:${Date.now()}`;
    // In production, use actual cryptographic signing
    return Buffer.from(data).toString('base64').slice(0, 32);
  }

  // ==========================================================================
  // CONSENSUS BUILDING
  // ==========================================================================

  /**
   * Build consensus from multiple oracle assessments
   */
  private buildConsensus(
    request: RiskAssessmentRequest,
    assessments: OracleAssessment[],
    failedOracles: string[]
  ): ConsensusResult {
    if (assessments.length === 0) {
      return {
        requestId: request.requestId,
        timestamp: new Date(),
        oracleCount: 0,
        participatingOracles: [],
        failedOracles,
        consensusReached: false,
        consensusType: 'none',
        aggregatedResult: this.createEmptyResult(),
        individualAssessments: [],
        agreementScore: 0,
        outlierOracles: [],
        divergenceAnalysis: {
          maxDivergence: 0,
          avgDivergence: 0,
          divergenceByOracle: {},
          potentialManipulation: false
        },
        overallConfidence: 0,
        totalCost: 0,
        totalLatencyMs: 0
      };
    }

    // Calculate mean scores
    const meanPrimaryScore = assessments.reduce((sum, a) => sum + a.result.primaryScore, 0)
      / assessments.length;

    // Calculate divergence
    const divergences: Record<string, number> = {};
    let maxDivergence = 0;
    let totalDivergence = 0;

    for (const assessment of assessments) {
      const divergence = Math.abs(assessment.result.primaryScore - meanPrimaryScore) / 100;
      divergences[assessment.oracleId] = divergence;
      maxDivergence = Math.max(maxDivergence, divergence);
      totalDivergence += divergence;
    }

    const avgDivergence = totalDivergence / assessments.length;

    // Identify outliers
    const outlierOracles = assessments
      .filter(a => divergences[a.oracleId] > this.config.maxDivergenceForConsensus)
      .map(a => a.oracleId);

    // Determine consensus type
    const agreementScore = 1 - avgDivergence;
    let consensusType: ConsensusResult['consensusType'] = 'none';
    let consensusReached = false;

    if (avgDivergence < 0.05) {
      consensusType = 'unanimous';
      consensusReached = true;
    } else if (agreementScore >= this.config.supermajorityThreshold) {
      consensusType = 'supermajority';
      consensusReached = true;
    } else if (agreementScore >= this.config.majorityThreshold) {
      consensusType = 'majority';
      consensusReached = true;
    } else if (assessments.length >= this.config.minOraclesForConsensus) {
      consensusType = 'plurality';
      consensusReached = true;
    }

    // Aggregate results (weighted by confidence and reputation)
    const aggregatedResult = this.aggregateResults(assessments);

    // Check for manipulation
    const potentialManipulation = maxDivergence > this.config.slashThreshold;

    return {
      requestId: request.requestId,
      timestamp: new Date(),
      oracleCount: assessments.length,
      participatingOracles: assessments.map(a => a.oracleId),
      failedOracles,
      consensusReached,
      consensusType,
      aggregatedResult,
      individualAssessments: assessments,
      agreementScore,
      outlierOracles,
      divergenceAnalysis: {
        maxDivergence,
        avgDivergence,
        divergenceByOracle: divergences,
        potentialManipulation,
        manipulationEvidence: potentialManipulation
          ? `Oracle(s) ${outlierOracles.join(', ')} diverged significantly from consensus`
          : undefined
      },
      overallConfidence: this.calculateOverallConfidence(assessments, agreementScore),
      totalCost: assessments.reduce((sum, a) => sum + a.cost, 0),
      totalLatencyMs: Math.max(...assessments.map(a => a.latencyMs))
    };
  }

  /**
   * Aggregate results from multiple oracles
   */
  private aggregateResults(assessments: OracleAssessment[]): AssessmentResult {
    // Weight by confidence and reputation
    let totalWeight = 0;
    const weights: number[] = [];

    for (const assessment of assessments) {
      const reputation = this.reputationScores.get(assessment.oracleId) || 0.5;
      const weight = assessment.confidence * reputation;
      weights.push(weight);
      totalWeight += weight;
    }

    // Normalize weights
    const normalizedWeights = weights.map(w => w / totalWeight);

    // Weighted average of primary score
    let weightedPrimaryScore = 0;
    for (let i = 0; i < assessments.length; i++) {
      weightedPrimaryScore += assessments[i].result.primaryScore * normalizedWeights[i];
    }

    // Aggregate component scores
    const componentScores: Record<string, number> = {};
    const componentKeys = Object.keys(assessments[0].result.componentScores);

    for (const key of componentKeys) {
      let weightedScore = 0;
      for (let i = 0; i < assessments.length; i++) {
        weightedScore += (assessments[i].result.componentScores[key] || 0) * normalizedWeights[i];
      }
      componentScores[key] = weightedScore;
    }

    // Aggregate confidence intervals
    const lowerBounds = assessments.map(a => a.result.confidenceInterval[0]);
    const upperBounds = assessments.map(a => a.result.confidenceInterval[1]);

    const aggregatedLower = Math.max(...lowerBounds); // Conservative
    const aggregatedUpper = Math.min(...upperBounds); // Conservative

    // Collect unique warnings and recommendations
    const allWarnings = new Set<string>();
    const allRecommendations = new Set<string>();

    for (const assessment of assessments) {
      assessment.result.warnings.forEach(w => allWarnings.add(w));
      assessment.result.recommendations.forEach(r => allRecommendations.add(r));
    }

    return {
      primaryScore: weightedPrimaryScore,
      componentScores,
      confidenceInterval: [aggregatedLower, aggregatedUpper],
      standardError: Math.min(...assessments.map(a => a.result.standardError)),
      warnings: Array.from(allWarnings),
      recommendations: Array.from(allRecommendations),
      metadata: {
        aggregationMethod: 'weighted_average',
        oracleCount: assessments.length
      }
    };
  }

  /**
   * Calculate overall confidence for consensus
   */
  private calculateOverallConfidence(
    assessments: OracleAssessment[],
    agreementScore: number
  ): number {
    const avgOracleConfidence = assessments.reduce((sum, a) => sum + a.confidence, 0)
      / assessments.length;

    // Confidence increases with agreement and oracle confidence
    return avgOracleConfidence * agreementScore;
  }

  private createEmptyResult(): AssessmentResult {
    return {
      primaryScore: 0,
      componentScores: {},
      confidenceInterval: [0, 0],
      standardError: 0,
      warnings: ['No assessments available'],
      recommendations: [],
      metadata: {}
    };
  }

  // ==========================================================================
  // REPUTATION SYSTEM
  // ==========================================================================

  /**
   * Update oracle reputations based on consensus result
   */
  private updateReputations(consensus: ConsensusResult): void {
    for (const assessment of consensus.individualAssessments) {
      const currentRep = this.reputationScores.get(assessment.oracleId) || 0.5;
      const divergence = consensus.divergenceAnalysis.divergenceByOracle[assessment.oracleId] || 0;

      let newRep: number;

      if (consensus.outlierOracles.includes(assessment.oracleId)) {
        // Penalize outliers
        newRep = Math.max(0, currentRep - this.config.reputationDecayRate * 5);

        // Slash if divergence is too high
        if (divergence > this.config.slashThreshold) {
          this.slashOracle(
            assessment.oracleId,
            `Excessive divergence: ${(divergence * 100).toFixed(1)}%`,
            divergence * 100 // Slash proportional to divergence
          );
        }
      } else {
        // Reward agreeing oracles
        const rewardMultiplier = 1 + (1 - divergence); // Higher reward for closer agreement
        newRep = Math.min(1, currentRep + this.config.reputationGainRate * rewardMultiplier);
      }

      this.reputationScores.set(assessment.oracleId, newRep);
    }
  }

  /**
   * Slash an oracle's stake
   */
  private slashOracle(oracleId: string, reason: string, amount: number): void {
    const oracle = this.oracles.get(oracleId);
    if (!oracle) return;

    const slashAmount = Math.min(oracle.stakeAmount * 0.1, amount); // Max 10% per slash
    oracle.stakeAmount -= slashAmount;

    oracle.slashHistory.push({
      timestamp: new Date(),
      reason,
      amountSlashed: slashAmount,
      evidenceHash: Buffer.from(reason).toString('base64').slice(0, 16)
    });

    // Remove oracle if stake falls too low
    if (oracle.stakeAmount < 500) {
      this.deregisterOracle(oracleId);
    }
  }

  // ==========================================================================
  // NETWORK ANALYTICS
  // ==========================================================================

  /**
   * Get network health metrics
   */
  getNetworkHealth(): NetworkHealth {
    const oracles = Array.from(this.oracles.values());

    const onlineCount = oracles.filter(o => o.status === 'online').length;
    const degradedCount = oracles.filter(o => o.status === 'degraded').length;
    const offlineCount = oracles.filter(o => o.status === 'offline').length;

    const avgReputation = Array.from(this.reputationScores.values())
      .reduce((sum, r) => sum + r, 0) / (this.reputationScores.size || 1);

    const avgLoad = oracles.reduce((sum, o) => sum + o.currentLoad, 0) / (oracles.length || 1);

    const totalStake = oracles.reduce((sum, o) => sum + o.stakeAmount, 0);
    const totalCapacity = oracles.reduce((sum, o) => sum + o.computeCapacity, 0);

    // Provider diversity
    const providerCounts = new Map<OracleProvider, number>();
    for (const oracle of oracles) {
      providerCounts.set(oracle.provider, (providerCounts.get(oracle.provider) || 0) + 1);
    }

    // Geographic diversity
    const locationCounts = new Map<string, number>();
    for (const oracle of oracles) {
      locationCounts.set(
        oracle.dataCenterLocation,
        (locationCounts.get(oracle.dataCenterLocation) || 0) + 1
      );
    }

    return {
      timestamp: new Date(),
      totalOracles: oracles.length,
      onlineCount,
      degradedCount,
      offlineCount,
      averageReputation: avgReputation,
      averageLoad: avgLoad,
      totalStake,
      totalCapacity,
      providerDiversity: this.calculateDiversity(providerCounts),
      geographicDiversity: this.calculateDiversity(locationCounts),
      assessmentsLast24h: this.countRecentAssessments(24),
      averageConsensusTime: this.calculateAverageConsensusTime()
    };
  }

  private calculateDiversity(counts: Map<any, number>): number {
    const total = Array.from(counts.values()).reduce((sum, c) => sum + c, 0);
    if (total === 0) return 0;

    let entropy = 0;
    for (const count of counts.values()) {
      const p = count / total;
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
    }

    const maxEntropy = Math.log2(counts.size);
    return maxEntropy > 0 ? entropy / maxEntropy : 0;
  }

  private countRecentAssessments(hours: number): number {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return Array.from(this.assessmentHistory.values())
      .filter(a => a.timestamp > cutoff)
      .length;
  }

  private calculateAverageConsensusTime(): number {
    const results = Array.from(this.assessmentHistory.values());
    if (results.length === 0) return 0;

    const totalLatency = results.reduce((sum, r) => sum + r.totalLatencyMs, 0);
    return totalLatency / results.length;
  }

  // ==========================================================================
  // GETTERS
  // ==========================================================================

  getOracle(oracleId: string): LLMOracle | undefined {
    return this.oracles.get(oracleId);
  }

  getAllOracles(): LLMOracle[] {
    return Array.from(this.oracles.values());
  }

  getAssessment(requestId: string): ConsensusResult | undefined {
    return this.assessmentHistory.get(requestId);
  }

  getOracleReputation(oracleId: string): number {
    return this.reputationScores.get(oracleId) || 0.5;
  }
}

// =============================================================================
// TYPES
// =============================================================================

export interface NetworkHealth {
  timestamp: Date;
  totalOracles: number;
  onlineCount: number;
  degradedCount: number;
  offlineCount: number;
  averageReputation: number;
  averageLoad: number;
  totalStake: number;
  totalCapacity: number;
  providerDiversity: number;
  geographicDiversity: number;
  assessmentsLast24h: number;
  averageConsensusTime: number;
}

// =============================================================================
// EXPORTS
// =============================================================================

export default LLMOracleNetwork;
