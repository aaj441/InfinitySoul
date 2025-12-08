/**
 * GENETIC RISK POOL
 * ==================
 *
 * "Evolution doesn't care about your portfolio theory. It only cares about survival."
 *
 * This is the evolutionary engine that optimizes risk distribution across the entire
 * economic system. Using genetic algorithms, it breeds risk allocation strategies
 * that maximize diversification while minimizing correlation exposure.
 *
 * The Core Insight:
 * -----------------
 * Traditional portfolio optimization (Markowitz, Black-Litterman) assumes static
 * correlations and normal distributions. Reality is messier. Genetic algorithms
 * can find solutions in non-convex, multi-modal fitness landscapes where
 * traditional optimization fails.
 *
 * The "Swimming Pool" Metaphor:
 * -----------------------------
 * Think of risk like water molecules in a pool. Each molecule (risk token) is
 * constantly moving, interacting with others. The genetic algorithm is like
 * the physics of the pool - it naturally finds equilibrium states where risk
 * is optimally distributed.
 *
 * @author InfinitySoul Actuarial Engine
 * @version 1.0.0 - Evolutionary Risk Optimization
 */

import {
  RiskQuantum,
  RiskMolecule,
  RISK_PERIODIC_TABLE,
  INDUSTRY_RISK_DNA,
  RiskElement,
  IndustryRiskDNA
} from './universalRiskTaxonomy';

import {
  RiskToken,
  RiskPool,
  RiskTranche,
  RiskTokenizationEngine
} from './riskTokenizationEngine';

// =============================================================================
// GENETIC ALGORITHM PRIMITIVES
// =============================================================================

/**
 * A Chromosome represents a complete risk allocation strategy.
 * Each gene is an allocation decision for a specific risk token.
 */
export interface RiskChromosome {
  chromosomeId: string;
  generation: number;

  // The genes - allocation decisions
  genes: RiskGene[];

  // Fitness metrics
  fitness: FitnessScore;

  // Lineage
  parentIds: string[];
  mutationHistory: string[];
}

/**
 * A single gene - one allocation decision
 */
export interface RiskGene {
  tokenId: string;
  allocatedTo: string;       // Holder ID
  allocationWeight: number;  // 0-1, portion of holder's capacity used
}

/**
 * Multi-dimensional fitness score
 */
export interface FitnessScore {
  overall: number;           // Weighted combination (0-100)

  // Component scores
  diversification: number;   // How spread out is the risk?
  correlationMinimization: number; // Low correlation = good
  capacityUtilization: number; // Using available capacity efficiently
  riskReturnBalance: number; // Expected return vs. risk
  concentrationPenalty: number; // Negative score for over-concentration
  tailRiskControl: number;   // Managing extreme scenarios
  liquidityScore: number;    // Can positions be exited?

  // Constraints satisfaction
  constraintViolations: number; // Count of broken rules
  feasible: boolean;         // Does this solution work?
}

/**
 * Configuration for the genetic algorithm
 */
export interface GeneticPoolConfig {
  // Population parameters
  populationSize: number;    // Number of chromosomes per generation
  eliteCount: number;        // Top N chromosomes survive unchanged
  mutationRate: number;      // Probability of gene mutation
  crossoverRate: number;     // Probability of crossover

  // Evolution parameters
  maxGenerations: number;
  convergenceThreshold: number; // Stop if improvement < this
  stagnationLimit: number;   // Restart if no improvement for N generations

  // Fitness weights
  fitnessWeights: {
    diversification: number;
    correlationMinimization: number;
    capacityUtilization: number;
    riskReturnBalance: number;
    concentrationPenalty: number;
    tailRiskControl: number;
    liquidityScore: number;
  };

  // Constraints
  maxConcentrationPerHolder: number; // Max % any holder can have
  minHoldersPerToken: number;        // Minimum distribution
  correlationLimit: number;          // Max correlation allowed
}

// =============================================================================
// HOLDER PROFILES
// =============================================================================

/**
 * A RiskHolder is an entity that can hold risk tokens.
 * Could be: insurance company, reinsurer, hedge fund, pension fund,
 * catastrophe bond investor, data center, LLM operator, etc.
 */
export interface RiskHolder {
  holderId: string;
  holderType: HolderType;
  holderName: string;

  // Capacity
  totalCapacity: number;     // Maximum notional they can hold
  availableCapacity: number; // Current available
  utilizationRate: number;   // Currently used / total

  // Risk Appetite
  riskAppetite: number;      // 0-1, higher = more risk seeking
  preferredElements: string[]; // Risk elements they prefer
  excludedElements: string[]; // Risk elements they avoid
  maxCorrelation: number;    // Max correlation in their book

  // Constraints
  regulatoryCapital: number; // Capital they must hold per unit risk
  concentrationLimit: number; // Max % in any single risk
  jurisdictionLimits: Record<string, number>; // Geo limits

  // Current Holdings
  currentHoldings: RiskToken[];
  currentExposure: Record<string, number>; // By element
}

export enum HolderType {
  PRIMARY_INSURER = 'primary_insurer',
  REINSURER = 'reinsurer',
  ILS_FUND = 'ils_fund',          // Insurance-linked securities
  HEDGE_FUND = 'hedge_fund',
  PENSION_FUND = 'pension_fund',
  SOVEREIGN_WEALTH = 'sovereign_wealth',
  CAPTIVE = 'captive',            // Corporate captive insurer
  DATA_CENTER = 'data_center',    // Novel: Data centers as risk holders
  LLM_OPERATOR = 'llm_operator',  // Novel: AI companies as risk distributors
  BLOCKCHAIN_POOL = 'blockchain_pool', // Novel: Decentralized risk pools
  COMMUNITY_MUTUAL = 'community_mutual' // Novel: Community-owned risk pools
}

// =============================================================================
// GENETIC RISK POOL ENGINE
// =============================================================================

/**
 * The GeneticRiskPool uses evolutionary algorithms to find optimal
 * risk distributions across all holders.
 */
export class GeneticRiskPool {
  private config: GeneticPoolConfig;
  private population: RiskChromosome[] = [];
  private bestChromosome: RiskChromosome | null = null;
  private generationHistory: GenerationStats[] = [];

  private tokens: RiskToken[] = [];
  private holders: RiskHolder[] = [];
  private correlationMatrix: Map<string, Map<string, number>> = new Map();

  constructor(config?: Partial<GeneticPoolConfig>) {
    this.config = {
      populationSize: 100,
      eliteCount: 5,
      mutationRate: 0.1,
      crossoverRate: 0.7,
      maxGenerations: 500,
      convergenceThreshold: 0.0001,
      stagnationLimit: 50,
      fitnessWeights: {
        diversification: 0.20,
        correlationMinimization: 0.20,
        capacityUtilization: 0.15,
        riskReturnBalance: 0.15,
        concentrationPenalty: 0.15,
        tailRiskControl: 0.10,
        liquidityScore: 0.05
      },
      maxConcentrationPerHolder: 0.25,
      minHoldersPerToken: 3,
      correlationLimit: 0.7,
      ...config
    };
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  /**
   * Initialize the pool with tokens and holders
   */
  initialize(tokens: RiskToken[], holders: RiskHolder[]): void {
    this.tokens = tokens;
    this.holders = holders;
    this.buildCorrelationMatrix();
    this.population = this.createInitialPopulation();
  }

  /**
   * Build correlation matrix between all tokens
   */
  private buildCorrelationMatrix(): void {
    this.correlationMatrix.clear();

    for (const token1 of this.tokens) {
      const row = new Map<string, number>();

      for (const token2 of this.tokens) {
        if (token1.tokenId === token2.tokenId) {
          row.set(token2.tokenId, 1.0);
        } else {
          // Calculate correlation based on risk elements
          const corr = this.calculateTokenCorrelation(token1, token2);
          row.set(token2.tokenId, corr);
        }
      }

      this.correlationMatrix.set(token1.tokenId, row);
    }
  }

  /**
   * Calculate correlation between two tokens
   */
  private calculateTokenCorrelation(t1: RiskToken, t2: RiskToken): number {
    // Same industry = higher correlation
    const industryCorr = t1.metadata.sourceIndustry === t2.metadata.sourceIndustry ? 0.3 : 0;

    // Same geography = higher correlation
    const geoCorr = t1.metadata.sourceGeography === t2.metadata.sourceGeography ? 0.2 : 0;

    // Overlapping risk elements = higher correlation
    const elements1 = new Set(t1.metadata.riskElements);
    const elements2 = new Set(t2.metadata.riskElements);
    const overlap = [...elements1].filter(e => elements2.has(e)).length;
    const elementCorr = overlap / Math.max(elements1.size, elements2.size) * 0.4;

    // Base correlation from correlation tiers
    const tierCorr = {
      'systemic': 0.3,
      'high': 0.2,
      'medium': 0.1,
      'low': 0.05,
      'uncorrelated': 0
    };
    const baseCorr = (tierCorr[t1.metadata.correlationTier] + tierCorr[t2.metadata.correlationTier]) / 2;

    return Math.min(0.95, industryCorr + geoCorr + elementCorr + baseCorr);
  }

  /**
   * Create initial population of chromosomes
   */
  private createInitialPopulation(): RiskChromosome[] {
    const population: RiskChromosome[] = [];

    for (let i = 0; i < this.config.populationSize; i++) {
      const chromosome = this.createRandomChromosome(0);
      chromosome.fitness = this.evaluateFitness(chromosome);
      population.push(chromosome);
    }

    // Sort by fitness
    population.sort((a, b) => b.fitness.overall - a.fitness.overall);

    return population;
  }

  /**
   * Create a random chromosome
   */
  private createRandomChromosome(generation: number): RiskChromosome {
    const genes: RiskGene[] = [];

    // Create a copy of available capacities
    const availableCapacity = new Map<string, number>();
    for (const holder of this.holders) {
      availableCapacity.set(holder.holderId, holder.availableCapacity);
    }

    // Randomly allocate each token
    for (const token of this.tokens) {
      // Find eligible holders (have capacity and accept this risk type)
      const eligibleHolders = this.holders.filter(h => {
        const capacity = availableCapacity.get(h.holderId) || 0;
        if (capacity < token.notionalExposure) return false;

        // Check if holder accepts these risk elements
        const hasExcluded = token.metadata.riskElements.some(
          e => h.excludedElements.includes(e)
        );
        if (hasExcluded) return false;

        return true;
      });

      if (eligibleHolders.length === 0) {
        // No eligible holder - assign to first holder anyway (will be penalized in fitness)
        genes.push({
          tokenId: token.tokenId,
          allocatedTo: this.holders[0].holderId,
          allocationWeight: 1.0
        });
      } else {
        // Randomly select a holder weighted by capacity
        const totalCapacity = eligibleHolders.reduce(
          (sum, h) => sum + (availableCapacity.get(h.holderId) || 0),
          0
        );

        let random = Math.random() * totalCapacity;
        let selectedHolder = eligibleHolders[0];

        for (const holder of eligibleHolders) {
          random -= availableCapacity.get(holder.holderId) || 0;
          if (random <= 0) {
            selectedHolder = holder;
            break;
          }
        }

        genes.push({
          tokenId: token.tokenId,
          allocatedTo: selectedHolder.holderId,
          allocationWeight: Math.random() * 0.5 + 0.5 // 50-100%
        });

        // Update available capacity
        const newCapacity = (availableCapacity.get(selectedHolder.holderId) || 0)
          - token.notionalExposure;
        availableCapacity.set(selectedHolder.holderId, Math.max(0, newCapacity));
      }
    }

    return {
      chromosomeId: `CHR-${generation}-${Math.random().toString(36).substr(2, 9)}`,
      generation,
      genes,
      fitness: { overall: 0 } as FitnessScore,
      parentIds: [],
      mutationHistory: []
    };
  }

  // ==========================================================================
  // FITNESS EVALUATION
  // ==========================================================================

  /**
   * Evaluate the fitness of a chromosome
   */
  private evaluateFitness(chromosome: RiskChromosome): FitnessScore {
    // Build allocation map: holder -> tokens
    const allocations = new Map<string, RiskToken[]>();
    for (const gene of chromosome.genes) {
      const token = this.tokens.find(t => t.tokenId === gene.tokenId);
      if (!token) continue;

      const existing = allocations.get(gene.allocatedTo) || [];
      existing.push(token);
      allocations.set(gene.allocatedTo, existing);
    }

    // Calculate component scores
    const diversification = this.scoreDiversification(allocations);
    const correlationMinimization = this.scoreCorrelationMinimization(allocations);
    const capacityUtilization = this.scoreCapacityUtilization(allocations);
    const riskReturnBalance = this.scoreRiskReturnBalance(allocations);
    const concentrationPenalty = this.scoreConcentrationPenalty(allocations);
    const tailRiskControl = this.scoreTailRiskControl(allocations);
    const liquidityScore = this.scoreLiquidity(allocations);

    // Count constraint violations
    const constraintViolations = this.countConstraintViolations(chromosome, allocations);
    const feasible = constraintViolations === 0;

    // Calculate overall fitness
    const w = this.config.fitnessWeights;
    let overall = (
      diversification * w.diversification +
      correlationMinimization * w.correlationMinimization +
      capacityUtilization * w.capacityUtilization +
      riskReturnBalance * w.riskReturnBalance +
      concentrationPenalty * w.concentrationPenalty +
      tailRiskControl * w.tailRiskControl +
      liquidityScore * w.liquidityScore
    ) * 100;

    // Penalty for constraint violations
    overall -= constraintViolations * 10;
    overall = Math.max(0, overall);

    return {
      overall,
      diversification,
      correlationMinimization,
      capacityUtilization,
      riskReturnBalance,
      concentrationPenalty,
      tailRiskControl,
      liquidityScore,
      constraintViolations,
      feasible
    };
  }

  /**
   * Score diversification - how spread out is the risk?
   */
  private scoreDiversification(allocations: Map<string, RiskToken[]>): number {
    if (allocations.size === 0) return 0;

    // Calculate Herfindahl-Hirschman Index (HHI)
    const totalNotional = this.tokens.reduce((sum, t) => sum + t.notionalExposure, 0);

    let hhi = 0;
    for (const [_, tokens] of allocations) {
      const holderNotional = tokens.reduce((sum, t) => sum + t.notionalExposure, 0);
      const share = holderNotional / totalNotional;
      hhi += share * share;
    }

    // Lower HHI = better diversification
    // HHI of 1 = all in one holder (worst)
    // HHI of 1/N = perfectly spread (best)
    const minHHI = 1 / this.holders.length;
    const normalizedHHI = (hhi - minHHI) / (1 - minHHI);

    return 1 - normalizedHHI;
  }

  /**
   * Score correlation minimization - lower correlation = better
   */
  private scoreCorrelationMinimization(allocations: Map<string, RiskToken[]>): number {
    let totalCorrelation = 0;
    let pairs = 0;

    for (const [_, tokens] of allocations) {
      // Calculate average pairwise correlation within each holder's book
      for (let i = 0; i < tokens.length; i++) {
        for (let j = i + 1; j < tokens.length; j++) {
          const corr = this.correlationMatrix.get(tokens[i].tokenId)?.get(tokens[j].tokenId) || 0;
          totalCorrelation += corr;
          pairs++;
        }
      }
    }

    if (pairs === 0) return 1;

    const avgCorrelation = totalCorrelation / pairs;
    return 1 - avgCorrelation; // Lower correlation = higher score
  }

  /**
   * Score capacity utilization - using available capacity efficiently
   */
  private scoreCapacityUtilization(allocations: Map<string, RiskToken[]>): number {
    let totalUsed = 0;
    let totalAvailable = 0;

    for (const holder of this.holders) {
      const tokens = allocations.get(holder.holderId) || [];
      const used = tokens.reduce((sum, t) => sum + t.notionalExposure, 0);
      totalUsed += used;
      totalAvailable += holder.availableCapacity;
    }

    if (totalAvailable === 0) return 0;

    return totalUsed / totalAvailable;
  }

  /**
   * Score risk-return balance
   */
  private scoreRiskReturnBalance(allocations: Map<string, RiskToken[]>): number {
    let totalScore = 0;
    let count = 0;

    for (const [holderId, tokens] of allocations) {
      const holder = this.holders.find(h => h.holderId === holderId);
      if (!holder) continue;

      // Calculate holder's portfolio metrics
      const totalNotional = tokens.reduce((sum, t) => sum + t.notionalExposure, 0);
      const totalPremium = tokens.reduce((sum, t) => sum + t.riskPremium, 0);
      const totalExpectedLoss = tokens.reduce((sum, t) => sum + t.expectedLoss, 0);

      // Return on risk
      const returnOnRisk = totalPremium / Math.max(1, totalExpectedLoss);

      // Compare to holder's risk appetite
      const appetiteMatch = 1 - Math.abs(holder.riskAppetite - (totalExpectedLoss / totalNotional));

      totalScore += (returnOnRisk * 0.5 + appetiteMatch * 0.5);
      count++;
    }

    return count > 0 ? Math.min(1, totalScore / count) : 0;
  }

  /**
   * Score concentration penalty - penalize over-concentration
   */
  private scoreConcentrationPenalty(allocations: Map<string, RiskToken[]>): number {
    const totalNotional = this.tokens.reduce((sum, t) => sum + t.notionalExposure, 0);
    let penalties = 0;

    for (const [holderId, tokens] of allocations) {
      const holderNotional = tokens.reduce((sum, t) => sum + t.notionalExposure, 0);
      const concentration = holderNotional / totalNotional;

      if (concentration > this.config.maxConcentrationPerHolder) {
        penalties += concentration - this.config.maxConcentrationPerHolder;
      }
    }

    return Math.max(0, 1 - penalties * 2);
  }

  /**
   * Score tail risk control
   */
  private scoreTailRiskControl(allocations: Map<string, RiskToken[]>): number {
    let tailRiskScore = 0;
    let count = 0;

    for (const [_, tokens] of allocations) {
      // Check for systemic correlation exposure
      const systemicTokens = tokens.filter(
        t => t.metadata.correlationTier === 'systemic' || t.metadata.correlationTier === 'high'
      );

      const systemicRatio = systemicTokens.length / Math.max(1, tokens.length);
      tailRiskScore += 1 - systemicRatio;
      count++;
    }

    return count > 0 ? tailRiskScore / count : 1;
  }

  /**
   * Score liquidity
   */
  private scoreLiquidity(allocations: Map<string, RiskToken[]>): number {
    const liquidityScores = {
      'ultra-liquid': 1.0,
      'high': 0.8,
      'medium': 0.6,
      'low': 0.4,
      'illiquid': 0.2
    };

    let totalScore = 0;
    let count = 0;

    for (const token of this.tokens) {
      totalScore += liquidityScores[token.metadata.liquidityTier] || 0.5;
      count++;
    }

    return count > 0 ? totalScore / count : 0.5;
  }

  /**
   * Count constraint violations
   */
  private countConstraintViolations(
    chromosome: RiskChromosome,
    allocations: Map<string, RiskToken[]>
  ): number {
    let violations = 0;

    // Check concentration limits
    const totalNotional = this.tokens.reduce((sum, t) => sum + t.notionalExposure, 0);

    for (const [holderId, tokens] of allocations) {
      const holder = this.holders.find(h => h.holderId === holderId);
      if (!holder) continue;

      const holderNotional = tokens.reduce((sum, t) => sum + t.notionalExposure, 0);

      // Concentration violation
      if (holderNotional / totalNotional > this.config.maxConcentrationPerHolder) {
        violations++;
      }

      // Capacity violation
      if (holderNotional > holder.availableCapacity) {
        violations++;
      }

      // Correlation limit violation
      for (let i = 0; i < tokens.length; i++) {
        for (let j = i + 1; j < tokens.length; j++) {
          const corr = this.correlationMatrix.get(tokens[i].tokenId)?.get(tokens[j].tokenId) || 0;
          if (corr > this.config.correlationLimit) {
            violations++;
          }
        }
      }
    }

    return violations;
  }

  // ==========================================================================
  // GENETIC OPERATORS
  // ==========================================================================

  /**
   * Select parents using tournament selection
   */
  private selectParent(): RiskChromosome {
    const tournamentSize = 3;
    let best: RiskChromosome | null = null;

    for (let i = 0; i < tournamentSize; i++) {
      const idx = Math.floor(Math.random() * this.population.length);
      const candidate = this.population[idx];

      if (!best || candidate.fitness.overall > best.fitness.overall) {
        best = candidate;
      }
    }

    return best!;
  }

  /**
   * Crossover two chromosomes to produce offspring
   */
  private crossover(parent1: RiskChromosome, parent2: RiskChromosome, generation: number): RiskChromosome {
    if (Math.random() > this.config.crossoverRate) {
      // No crossover - return copy of better parent
      const better = parent1.fitness.overall > parent2.fitness.overall ? parent1 : parent2;
      return {
        ...better,
        chromosomeId: `CHR-${generation}-${Math.random().toString(36).substr(2, 9)}`,
        generation,
        parentIds: [parent1.chromosomeId, parent2.chromosomeId],
        mutationHistory: []
      };
    }

    // Uniform crossover - each gene comes from random parent
    const childGenes: RiskGene[] = [];

    for (let i = 0; i < parent1.genes.length; i++) {
      const gene = Math.random() < 0.5 ? parent1.genes[i] : parent2.genes[i];
      childGenes.push({ ...gene });
    }

    return {
      chromosomeId: `CHR-${generation}-${Math.random().toString(36).substr(2, 9)}`,
      generation,
      genes: childGenes,
      fitness: { overall: 0 } as FitnessScore,
      parentIds: [parent1.chromosomeId, parent2.chromosomeId],
      mutationHistory: []
    };
  }

  /**
   * Mutate a chromosome
   */
  private mutate(chromosome: RiskChromosome): void {
    for (const gene of chromosome.genes) {
      if (Math.random() < this.config.mutationRate) {
        // Randomly reassign to a different holder
        const newHolder = this.holders[Math.floor(Math.random() * this.holders.length)];
        gene.allocatedTo = newHolder.holderId;
        gene.allocationWeight = Math.random() * 0.5 + 0.5;

        chromosome.mutationHistory.push(
          `Gene ${gene.tokenId} mutated to ${newHolder.holderId}`
        );
      }
    }
  }

  // ==========================================================================
  // EVOLUTION
  // ==========================================================================

  /**
   * Evolve the population for one generation
   */
  private evolveGeneration(generation: number): void {
    const newPopulation: RiskChromosome[] = [];

    // Elitism - keep top chromosomes
    for (let i = 0; i < this.config.eliteCount; i++) {
      newPopulation.push({
        ...this.population[i],
        generation
      });
    }

    // Fill rest with offspring
    while (newPopulation.length < this.config.populationSize) {
      const parent1 = this.selectParent();
      const parent2 = this.selectParent();

      const child = this.crossover(parent1, parent2, generation);
      this.mutate(child);
      child.fitness = this.evaluateFitness(child);

      newPopulation.push(child);
    }

    // Sort by fitness
    newPopulation.sort((a, b) => b.fitness.overall - a.fitness.overall);

    this.population = newPopulation;
  }

  /**
   * Run the full evolution process
   */
  evolve(): EvolutionResult {
    let stagnationCounter = 0;
    let lastBestFitness = 0;

    for (let gen = 0; gen < this.config.maxGenerations; gen++) {
      this.evolveGeneration(gen);

      const currentBest = this.population[0];
      const avgFitness = this.population.reduce((sum, c) => sum + c.fitness.overall, 0)
        / this.population.length;

      // Record generation stats
      this.generationHistory.push({
        generation: gen,
        bestFitness: currentBest.fitness.overall,
        avgFitness,
        feasibleCount: this.population.filter(c => c.fitness.feasible).length,
        diversityScore: this.calculatePopulationDiversity()
      });

      // Check for improvement
      const improvement = currentBest.fitness.overall - lastBestFitness;
      if (improvement < this.config.convergenceThreshold) {
        stagnationCounter++;
      } else {
        stagnationCounter = 0;
      }

      lastBestFitness = currentBest.fitness.overall;

      // Update best chromosome
      if (!this.bestChromosome || currentBest.fitness.overall > this.bestChromosome.fitness.overall) {
        this.bestChromosome = currentBest;
      }

      // Check convergence
      if (stagnationCounter >= this.config.stagnationLimit) {
        // Restart with fresh population, keeping best
        this.restartPopulation(gen);
        stagnationCounter = 0;
      }
    }

    return {
      bestChromosome: this.bestChromosome!,
      generationsRun: this.generationHistory.length,
      finalPopulation: this.population,
      history: this.generationHistory,
      converged: this.bestChromosome?.fitness.feasible || false
    };
  }

  /**
   * Calculate population diversity
   */
  private calculatePopulationDiversity(): number {
    // Measure diversity as variance in allocations
    const allocationCounts = new Map<string, number[]>();

    for (const chromosome of this.population) {
      for (const gene of chromosome.genes) {
        const key = `${gene.tokenId}-${gene.allocatedTo}`;
        const counts = allocationCounts.get(key) || [];
        counts.push(1);
        allocationCounts.set(key, counts);
      }
    }

    // Calculate entropy
    const totalGenes = this.population.length * this.tokens.length;
    let entropy = 0;

    for (const [_, counts] of allocationCounts) {
      const prob = counts.length / totalGenes;
      if (prob > 0) {
        entropy -= prob * Math.log2(prob);
      }
    }

    // Normalize entropy
    const maxEntropy = Math.log2(this.holders.length);
    return entropy / maxEntropy;
  }

  /**
   * Restart population with fresh chromosomes, keeping best
   */
  private restartPopulation(generation: number): void {
    const newPop: RiskChromosome[] = [];

    // Keep the best
    if (this.bestChromosome) {
      newPop.push(this.bestChromosome);
    }

    // Fill with fresh random chromosomes
    while (newPop.length < this.config.populationSize) {
      const chromosome = this.createRandomChromosome(generation);
      chromosome.fitness = this.evaluateFitness(chromosome);
      newPop.push(chromosome);
    }

    newPop.sort((a, b) => b.fitness.overall - a.fitness.overall);
    this.population = newPop;
  }

  // ==========================================================================
  // OUTPUT
  // ==========================================================================

  /**
   * Get the optimal allocation from the best chromosome
   */
  getOptimalAllocation(): Map<string, RiskToken[]> {
    if (!this.bestChromosome) {
      throw new Error('No evolution has been run yet');
    }

    const allocation = new Map<string, RiskToken[]>();

    for (const gene of this.bestChromosome.genes) {
      const token = this.tokens.find(t => t.tokenId === gene.tokenId);
      if (!token) continue;

      const existing = allocation.get(gene.allocatedTo) || [];
      existing.push(token);
      allocation.set(gene.allocatedTo, existing);
    }

    return allocation;
  }

  /**
   * Generate allocation report
   */
  generateReport(): AllocationReport {
    const allocation = this.getOptimalAllocation();
    const holderSummaries: HolderAllocationSummary[] = [];

    for (const holder of this.holders) {
      const tokens = allocation.get(holder.holderId) || [];
      const totalNotional = tokens.reduce((sum, t) => sum + t.notionalExposure, 0);
      const totalExpectedLoss = tokens.reduce((sum, t) => sum + t.expectedLoss, 0);
      const totalPremium = tokens.reduce((sum, t) => sum + t.riskPremium, 0);

      // Element breakdown
      const byElement: Record<string, number> = {};
      for (const token of tokens) {
        for (const elem of token.metadata.riskElements) {
          byElement[elem] = (byElement[elem] || 0) + token.notionalExposure;
        }
      }

      holderSummaries.push({
        holderId: holder.holderId,
        holderName: holder.holderName,
        holderType: holder.holderType,
        tokenCount: tokens.length,
        totalNotional,
        totalExpectedLoss,
        totalPremium,
        utilizationRate: totalNotional / holder.availableCapacity,
        byElement,
        byCorrelationTier: this.groupByCorrelationTier(tokens)
      });
    }

    return {
      timestamp: new Date(),
      totalTokensAllocated: this.tokens.length,
      totalHoldersUsed: holderSummaries.filter(h => h.tokenCount > 0).length,
      fitness: this.bestChromosome?.fitness || null,
      generationsRun: this.generationHistory.length,
      holderSummaries,
      systemRiskMetrics: this.calculateSystemRiskMetrics(allocation)
    };
  }

  private groupByCorrelationTier(tokens: RiskToken[]): Record<string, number> {
    const result: Record<string, number> = {};
    for (const token of tokens) {
      result[token.metadata.correlationTier] =
        (result[token.metadata.correlationTier] || 0) + token.notionalExposure;
    }
    return result;
  }

  private calculateSystemRiskMetrics(allocation: Map<string, RiskToken[]>): SystemRiskMetrics {
    const totalNotional = this.tokens.reduce((sum, t) => sum + t.notionalExposure, 0);
    const totalExpectedLoss = this.tokens.reduce((sum, t) => sum + t.expectedLoss, 0);

    // Calculate system-wide correlation
    let totalCorr = 0;
    let corrPairs = 0;
    for (const t1 of this.tokens) {
      for (const t2 of this.tokens) {
        if (t1.tokenId !== t2.tokenId) {
          totalCorr += this.correlationMatrix.get(t1.tokenId)?.get(t2.tokenId) || 0;
          corrPairs++;
        }
      }
    }

    return {
      totalNotionalDistributed: totalNotional,
      totalExpectedLoss,
      systemWideCorrelation: corrPairs > 0 ? totalCorr / corrPairs : 0,
      diversificationBenefit: this.bestChromosome?.fitness.diversification || 0,
      concentrationRisk: 1 - (this.bestChromosome?.fitness.concentrationPenalty || 0),
      tailRiskExposure: 1 - (this.bestChromosome?.fitness.tailRiskControl || 0)
    };
  }
}

// =============================================================================
// TYPES
// =============================================================================

export interface GenerationStats {
  generation: number;
  bestFitness: number;
  avgFitness: number;
  feasibleCount: number;
  diversityScore: number;
}

export interface EvolutionResult {
  bestChromosome: RiskChromosome;
  generationsRun: number;
  finalPopulation: RiskChromosome[];
  history: GenerationStats[];
  converged: boolean;
}

export interface HolderAllocationSummary {
  holderId: string;
  holderName: string;
  holderType: HolderType;
  tokenCount: number;
  totalNotional: number;
  totalExpectedLoss: number;
  totalPremium: number;
  utilizationRate: number;
  byElement: Record<string, number>;
  byCorrelationTier: Record<string, number>;
}

export interface SystemRiskMetrics {
  totalNotionalDistributed: number;
  totalExpectedLoss: number;
  systemWideCorrelation: number;
  diversificationBenefit: number;
  concentrationRisk: number;
  tailRiskExposure: number;
}

export interface AllocationReport {
  timestamp: Date;
  totalTokensAllocated: number;
  totalHoldersUsed: number;
  fitness: FitnessScore | null;
  generationsRun: number;
  holderSummaries: HolderAllocationSummary[];
  systemRiskMetrics: SystemRiskMetrics;
}

// =============================================================================
// EXPORTS
// =============================================================================

export default GeneticRiskPool;
