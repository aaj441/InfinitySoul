/**
 * InfinitySoul Risk Distribution Framework (Production-Grade)
 * ==========================================================
 *
 * "Insurance is the business of spreading risk. We've just expanded the pool
 * to include... everything."
 *
 * This is the unified entry point for the InfinitySoul Universal Risk
 * Distribution Framework. It provides:
 *
 * 1. Universal Risk Taxonomy - The Periodic Table of Risk
 * 2. Risk Tokenization - Atomic units of tradeable risk
 * 3. Genetic Risk Pool - Evolutionary optimization of distribution
 * 4. LLM Oracle Network - Distributed AI risk assessment
 * 5. Data-as-Collateral - Infinite collateral from data assets
 *
 * The Vision:
 * -----------
 * Traditional insurance spreads risk across policyholders.
 * We spread risk across:
 * - Industries (automotive ↔ healthcare ↔ fintech)
 * - Geographies (US ↔ EU ↔ APAC)
 * - Time horizons (short-term ↔ long-term)
 * - Asset classes (financial ↔ operational ↔ data)
 * - AI systems (Claude ↔ GPT ↔ Gemini ↔ Llama)
 * - Infrastructure (data centers ↔ cloud providers)
 *
 * This creates "insurance for insurance" - meta-risk distribution where
 * the act of spreading risk creates value, and all data becomes mineable
 * collateral for the global risk pool.
 *
 * PRODUCTION-GRADE IMPROVEMENTS:
 * - Type-safe with explicit return types and no `any` types
 * - Full input validation using schemas
 * - Comprehensive error handling with custom error classes
 * - Structured logging with correlation IDs
 * - Ethical policy enforcement (fail-safe defaults)
 * - Async safeguards and timeout protection
 * - Clear separation of concerns
 *
 * @author InfinitySoul Actuarial Engine
 * @version 2.0.0 - Production Grade
 * @license Proprietary
 */

// =============================================================================
// EXPORTS
// =============================================================================

// Universal Risk Taxonomy
export {
  RiskDimension,
  RiskState,
  RiskGenesis,
  RISK_PERIODIC_TABLE,
  INDUSTRY_RISK_DNA,
  UniversalRiskConverter,
  type RiskElement,
  type IndustryRiskDNA,
  type RiskQuantum,
  type RiskMolecule
} from './universalRiskTaxonomy';

// Risk Tokenization Engine
export {
  RiskTokenizationEngine,
  type RiskToken,
  type RiskTranche,
  type RiskPool
} from './riskTokenizationEngine';

// Genetic Risk Pool
export {
  GeneticRiskPool,
  HolderType,
  type RiskHolder,
  type RiskChromosome,
  type FitnessScore,
  type GeneticPoolConfig,
  type EvolutionResult,
  type AllocationReport
} from './geneticRiskPool';

// LLM Oracle Network
export {
  LLMOracleNetwork,
  OracleProvider,
  OracleCapability,
  AssessmentType,
  type LLMOracle,
  type RiskAssessmentRequest,
  type OracleAssessment,
  type ConsensusResult,
  type NetworkHealth
} from './llmRiskOracleNetwork';

// Data-as-Collateral
export {
  DataCollateralEngine,
  DataAssetType,
  DataCategory,
  SensitivityLevel,
  PledgeType,
  MiningType,
  type DataAsset,
  type DataValuation,
  type CollateralPledge,
  type MiningPotential,
  type CollateralBackingSummary
} from './dataAsCollateral';

// =============================================================================
// IMPORTS & DEPENDENCIES
// =============================================================================

import { UniversalRiskConverter, RiskQuantum, RiskMolecule } from './universalRiskTaxonomy';
import { RiskTokenizationEngine, RiskToken } from './riskTokenizationEngine';
import { GeneticRiskPool, RiskHolder, HolderType, AllocationReport } from './geneticRiskPool';
import { LLMOracleNetwork, LLMOracle, OracleProvider, OracleCapability, ConsensusResult, AssessmentType, NetworkHealth } from './llmRiskOracleNetwork';
import { DataCollateralEngine, DataAsset, DataCategory, DataAssetType, SensitivityLevel } from './dataAsCollateral';
import { Logger, createLogger, LogLevel } from '../logger';
import { EthicalUsePolicy, globalEthicsPolicy } from '../ethics/EthicalUsePolicy';
import {
  ValidationError,
  OrchestratorError,
  TimeoutError,
  NotFoundError,
} from '../errors';
import {
  validateRiskIngestion,
  validateDataCollateral,
  validateDataPledge,
  formatValidationErrors,
} from '../validation';

/**
 * Configuration for RiskDistributionOrchestrator
 */
export interface OrchestratorConfig {
  oracleTimeoutMs?: number;
  maxRetries?: number;
  logLevel?: LogLevel;
}

/**
 * The RiskDistributionOrchestrator coordinates all components of the
 * risk distribution framework into a unified system.
 *
 * PRODUCTION-GRADE FEATURES:
 * - Type-safe with explicit error handling
 * - Input validation on all entry points
 * - Ethical policy enforcement
 * - Structured logging with correlation IDs
 * - Async operation timeouts
 */
export class RiskDistributionOrchestrator {
  private readonly tokenizationEngine: RiskTokenizationEngine;
  private readonly geneticPool: GeneticRiskPool;
  private readonly oracleNetwork: LLMOracleNetwork;
  private readonly collateralEngine: DataCollateralEngine;
  private readonly logger: Logger;
  private readonly ethicsPolicy: EthicalUsePolicy;
  private readonly config: Required<OrchestratorConfig>;

  /**
   * Initialize the orchestrator with optional configuration
   *
   * @param config Optional configuration
   * @param logger Optional custom logger
   * @param ethicsPolicy Optional custom ethics policy
   * @throws ConfigurationError if configuration is invalid
   */
  constructor(
    config: OrchestratorConfig = {},
    logger?: Logger,
    ethicsPolicy?: EthicalUsePolicy
  ) {
    this.tokenizationEngine = new RiskTokenizationEngine();
    this.geneticPool = new GeneticRiskPool();
    this.oracleNetwork = new LLMOracleNetwork();
    this.collateralEngine = new DataCollateralEngine();
    this.logger = logger || createLogger('RiskDistributionOrchestrator');
    this.ethicsPolicy = ethicsPolicy || globalEthicsPolicy;

    // Validate and set configuration
    this.config = {
      oracleTimeoutMs: config.oracleTimeoutMs ?? 5000,
      maxRetries: config.maxRetries ?? 3,
      logLevel: config.logLevel ?? LogLevel.INFO,
    };

    if (this.config.oracleTimeoutMs <= 0) {
      throw new OrchestratorError('oracleTimeoutMs must be positive');
    }
    if (this.config.maxRetries < 0) {
      throw new OrchestratorError('maxRetries must be non-negative');
    }
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  /**
   * Initialize the orchestrator with default oracles and holders
   *
   * @param correlationId Optional correlation ID for tracing
   * @throws OrchestratorError if initialization fails
   */
  async initialize(correlationId?: string): Promise<void> {
    const actualCorrelationId = correlationId || `init-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Ethical check for initialization
      this.ethicsPolicy.checkUseCase({
        purpose: 'risk_distribution_initialization',
        context: 'system_startup',
        correlationId: actualCorrelationId,
      });

      this.logger.info('Initializing RiskDistributionOrchestrator', {
        correlationId: actualCorrelationId,
      });

      // Register default LLM oracles
      await this.registerDefaultOracles(actualCorrelationId);

      const oracleCount = this.oracleNetwork.getAllOracles().length;
      this.logger.info('RiskDistributionOrchestrator initialized successfully', {
        correlationId: actualCorrelationId,
        oraclesRegistered: oracleCount,
        collateralEngineReady: true,
        geneticPoolConfigured: true,
      });
    } catch (error) {
      this.logger.error('Failed to initialize RiskDistributionOrchestrator', error as Error, {
        correlationId: actualCorrelationId,
      });
      throw error instanceof OrchestratorError
        ? error
        : new OrchestratorError(
            `Initialization failed: ${error instanceof Error ? error.message : String(error)}`,
            actualCorrelationId
          );
    }
  }

  /**
   * Register default oracles from major AI providers
   *
   * @param correlationId For tracing
   * @throws OrchestratorError if oracle registration fails
   */
  private async registerDefaultOracles(correlationId: string): Promise<void> {
    const defaultOracles: LLMOracle[] = [
      {
        oracleId: 'ORACLE-CLAUDE-OPUS',
        modelId: 'claude-3-opus-20240229',
        provider: OracleProvider.ANTHROPIC,
        capabilities: [
          OracleCapability.RISK_SCORING,
          OracleCapability.CORRELATION_ANALYSIS,
          OracleCapability.TAIL_RISK_MODELING,
          OracleCapability.REGULATORY_INTERPRETATION
        ],
        maxTokensPerRequest: 4096,
        costPerMillionTokens: 15,
        averageLatencyMs: 2000,
        uptime: 0.999,
        reliability: 0.95,
        dataCenterLocation: 'US-WEST',
        dataCenterId: 'DC-ANTHROPIC-01',
        computeCapacity: 1000,
        status: 'online',
        currentLoad: 0.3,
        queueDepth: 5,
        stakeAmount: 10000,
        reputationScore: 0.9,
        slashHistory: []
      },
      {
        oracleId: 'ORACLE-GPT4-TURBO',
        modelId: 'gpt-4-turbo-preview',
        provider: OracleProvider.OPENAI,
        capabilities: [
          OracleCapability.RISK_SCORING,
          OracleCapability.MARKET_ANALYSIS,
          OracleCapability.SENTIMENT_ANALYSIS,
          OracleCapability.CLAIMS_PREDICTION
        ],
        maxTokensPerRequest: 4096,
        costPerMillionTokens: 10,
        averageLatencyMs: 1500,
        uptime: 0.998,
        reliability: 0.92,
        dataCenterLocation: 'US-EAST',
        dataCenterId: 'DC-OPENAI-01',
        computeCapacity: 1200,
        status: 'online',
        currentLoad: 0.4,
        queueDepth: 8,
        stakeAmount: 8000,
        reputationScore: 0.88,
        slashHistory: []
      },
      {
        oracleId: 'ORACLE-GEMINI-PRO',
        modelId: 'gemini-pro',
        provider: OracleProvider.GOOGLE,
        capabilities: [
          OracleCapability.RISK_SCORING,
          OracleCapability.CORRELATION_ANALYSIS,
          OracleCapability.MARKET_ANALYSIS
        ],
        maxTokensPerRequest: 2048,
        costPerMillionTokens: 5,
        averageLatencyMs: 1000,
        uptime: 0.997,
        reliability: 0.88,
        dataCenterLocation: 'US-CENTRAL',
        dataCenterId: 'DC-GOOGLE-01',
        computeCapacity: 1500,
        status: 'online',
        currentLoad: 0.25,
        queueDepth: 3,
        stakeAmount: 7000,
        reputationScore: 0.85,
        slashHistory: []
      }
    ];

    try {
      for (const oracle of defaultOracles) {
        this.oracleNetwork.registerOracle(oracle);
        this.logger.debug('Registered oracle', {
          correlationId,
          oracleId: oracle.oracleId,
          provider: oracle.provider,
        });
      }
    } catch (error) {
      throw new OrchestratorError(
        `Failed to register oracles: ${error instanceof Error ? error.message : String(error)}`,
        correlationId
      );
    }
  }

  // ==========================================================================
  // RISK INGESTION
  // ==========================================================================

  /**
   * Ingest raw risk from any industry and convert to tokens
   *
   * @param sourceRisk Input risk data (will be validated)
   * @param correlationId Optional correlation ID for tracing
   * @returns Array of risk tokens created from the input
   * @throws ValidationError if input validation fails
   * @throws EthicsViolationError if ethics policy denies the operation
   * @throws OrchestratorError if ingestion fails
   */
  async ingestRisk(
    sourceRisk: {
      type: string;
      value: number;
      probability: number;
      industry: string;
      geography: string;
      duration: number;
      description?: string;
    },
    correlationId?: string
  ): Promise<RiskToken[]> {
    const actualCorrelationId = correlationId || `ingest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Validate input
      const validation = validateRiskIngestion(sourceRisk);
      if (!validation.success) {
        throw new ValidationError(
          `Risk ingestion validation failed: ${formatValidationErrors(validation.errors!)}`,
          actualCorrelationId,
          { input: sourceRisk }
        );
      }

      // Ethical check
      this.ethicsPolicy.checkUseCase({
        purpose: 'risk_ingestion',
        context: sourceRisk.industry,
        correlationId: actualCorrelationId,
      });

      this.logger.info('Ingesting risk', {
        correlationId: actualCorrelationId,
        industry: sourceRisk.industry,
        riskValue: sourceRisk.value,
      });

      // Step 1: Convert to risk quanta
      const quanta = UniversalRiskConverter.atomize(sourceRisk);

      // Step 2: Synthesize into a molecule
      const molecule = UniversalRiskConverter.synthesize(
        quanta,
        sourceRisk.description || `Risk from ${sourceRisk.industry}`
      );

      // Step 3: Create a pool and tokenize
      const pool = this.tokenizationEngine.createPool(
        `Pool-${Date.now()}`,
        [molecule],
        [
          { seniority: 'equity', attachmentPct: 0, detachmentPct: 0.1, premiumRate: 0.15 },
          { seniority: 'mezzanine', attachmentPct: 0.1, detachmentPct: 0.3, premiumRate: 0.08 },
          { seniority: 'senior', attachmentPct: 0.3, detachmentPct: 0.7, premiumRate: 0.04 },
          { seniority: 'super-senior', attachmentPct: 0.7, detachmentPct: 1.0, premiumRate: 0.02 }
        ],
        sourceRisk.duration
      );

      // Step 4: Mint tokens for each tranche
      const allTokens: RiskToken[] = [];
      for (const tranche of pool.tranches) {
        const tokens = this.tokenizationEngine.mintTokens(
          tranche.trancheId,
          100, // 100 tokens per tranche
          'TREASURY'
        );
        allTokens.push(...tokens);
      }

      this.logger.info('Risk ingested successfully', {
        correlationId: actualCorrelationId,
        tokenCount: allTokens.length,
        poolId: pool.poolId,
      });

      return allTokens;
    } catch (error) {
      if (error instanceof (ValidationError || OrchestratorError)) {
        throw error;
      }
      this.logger.error('Failed to ingest risk', error as Error, {
        correlationId: actualCorrelationId,
        input: sourceRisk,
      });
      throw new OrchestratorError(
        `Risk ingestion failed: ${error instanceof Error ? error.message : String(error)}`,
        actualCorrelationId
      );
    }
  }

  // ==========================================================================
  // RISK ASSESSMENT
  // ==========================================================================

  /**
   * Get consensus risk assessment from the oracle network
   *
   * @param token Risk token to assess
   * @param correlationId Optional correlation ID for tracing
   * @returns Consensus result from oracle network
   * @throws TimeoutError if assessment exceeds timeout
   * @throws OrchestratorError if assessment fails
   */
  async assessRisk(token: RiskToken, correlationId?: string): Promise<ConsensusResult> {
    const actualCorrelationId = correlationId || `assess-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Ethical check
      this.ethicsPolicy.checkUseCase({
        purpose: 'risk_assessment',
        context: token.metadata.sourceIndustry,
        correlationId: actualCorrelationId,
      });

      this.logger.info('Assessing risk token', {
        correlationId: actualCorrelationId,
        tokenId: token.tokenId,
        industry: token.metadata.sourceIndustry,
      });

      const request = {
        requestId: `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        assessmentType: AssessmentType.SINGLE_RISK_SCORE,
        subject: {
          type: 'token' as const,
          id: token.tokenId,
          data: token
        },
        requiredConfidence: 0.7,
        maxLatencyMs: this.config.oracleTimeoutMs,
        minOracles: 3,
        maxCost: 1.0,
        contextData: {
          industry: token.metadata.sourceIndustry,
          geography: token.metadata.sourceGeography,
          riskElements: token.metadata.riskElements
        }
      };

      // Use Promise.race to enforce timeout
      const result = await Promise.race([
        this.oracleNetwork.submitAssessment(request),
        new Promise<ConsensusResult>((_, reject) =>
          setTimeout(
            () => reject(new TimeoutError(
              `Oracle assessment timeout after ${this.config.oracleTimeoutMs}ms`,
              actualCorrelationId
            )),
            this.config.oracleTimeoutMs
          )
        )
      ]);

      this.logger.info('Risk assessment completed', {
        correlationId: actualCorrelationId,
        tokenId: token.tokenId,
      });

      return result;
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw error;
      }
      this.logger.error('Risk assessment failed', error as Error, {
        correlationId: actualCorrelationId,
        tokenId: token.tokenId,
      });
      throw error instanceof OrchestratorError
        ? error
        : new OrchestratorError(
            `Risk assessment failed: ${error instanceof Error ? error.message : String(error)}`,
            actualCorrelationId
          );
    }
  }

  // ==========================================================================
  // RISK DISTRIBUTION
  // ==========================================================================

  /**
   * Distribute tokens across holders using genetic optimization
   *
   * @param tokens Risk tokens to distribute
   * @param holders Risk holders to receive tokens
   * @param correlationId Optional correlation ID for tracing
   * @returns Allocation report showing distribution
   * @throws ValidationError if inputs are invalid
   * @throws OrchestratorError if distribution fails
   */
  distributeRisk(
    tokens: RiskToken[],
    holders: RiskHolder[],
    correlationId?: string
  ): AllocationReport {
    const actualCorrelationId = correlationId || `distribute-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Ethical check
      this.ethicsPolicy.checkUseCase({
        purpose: 'risk_distribution',
        context: 'genetic_optimization',
        correlationId: actualCorrelationId,
      });

      // Validate inputs
      if (!Array.isArray(tokens) || tokens.length === 0) {
        throw new ValidationError('Tokens array cannot be empty', actualCorrelationId);
      }
      if (!Array.isArray(holders) || holders.length === 0) {
        throw new ValidationError('Holders array cannot be empty', actualCorrelationId);
      }

      this.logger.info('Distributing risk', {
        correlationId: actualCorrelationId,
        tokenCount: tokens.length,
        holderCount: holders.length,
      });

      // Initialize genetic pool with tokens and holders
      this.geneticPool.initialize(tokens, holders);

      // Run evolution
      const evolutionResult = this.geneticPool.evolve();

      // Generate allocation report
      const report = this.geneticPool.generateReport();

      this.logger.info('Risk distributed successfully', {
        correlationId: actualCorrelationId,
        tokenCount: tokens.length,
        holderCount: holders.length,
      });

      return report;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      this.logger.error('Risk distribution failed', error as Error, {
        correlationId: actualCorrelationId,
      });
      throw error instanceof OrchestratorError
        ? error
        : new OrchestratorError(
            `Risk distribution failed: ${error instanceof Error ? error.message : String(error)}`,
            actualCorrelationId
          );
    }
  }

  // ==========================================================================
  // DATA COLLATERAL
  // ==========================================================================

  /**
   * Register data as collateral and use it to back risk tokens
   *
   * @param data Data asset information (will be validated)
   * @param correlationId Optional correlation ID for tracing
   * @returns Registered data asset
   * @throws ValidationError if input validation fails
   * @throws EthicsViolationError if ethics policy denies the operation
   * @throws OrchestratorError if registration fails
   */
  registerDataCollateral(
    data: {
      name: string;
      category: DataCategory;
      type: DataAssetType;
      recordCount: number;
      sizeBytes: number;
      quality: {
        completeness: number;
        accuracy: number;
        consistency: number;
        timeliness: number;
        uniqueness: number;
      };
      owner: string;
    },
    correlationId?: string
  ): DataAsset {
    const actualCorrelationId = correlationId || `collateral-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Validate input
      const validation = validateDataCollateral(data);
      if (!validation.success) {
        throw new ValidationError(
          `Data collateral validation failed: ${formatValidationErrors(validation.errors!)}`,
          actualCorrelationId,
          { dataName: data.name }
        );
      }

      // Ethical check (data privacy focus)
      this.ethicsPolicy.checkUseCase({
        purpose: 'data_collateral_registration',
        context: String(data.category),
        correlationId: actualCorrelationId,
      });

      this.logger.info('Registering data collateral', {
        correlationId: actualCorrelationId,
        name: data.name,
        category: data.category,
        recordCount: data.recordCount,
      });

      const asset = this.collateralEngine.registerAsset({
        name: data.name,
        lastUpdated: new Date(),
        assetType: data.type,
        dataCategory: data.category,
        sensitivityLevel: SensitivityLevel.INTERNAL,
        origin: {
          sourceType: 'primary',
          sourceEntity: data.owner,
          collectionMethod: 'direct',
          collectionDate: new Date(),
          jurisdiction: 'US',
          consentBasis: 'contract',
          regulatoryFramework: []
        },
        ownershipChain: [{
          owner: data.owner,
          acquiredAt: new Date(),
          transferType: 'generation'
        }],
        currentOwner: data.owner,
        characteristics: {
          recordCount: data.recordCount,
          sizeBytes: data.sizeBytes,
          growthRatePerDay: data.recordCount * 0.01,
          completeness: data.quality.completeness,
          accuracy: data.quality.accuracy,
          consistency: data.quality.consistency,
          timeliness: data.quality.timeliness,
          uniqueness: data.quality.uniqueness,
          temporalRange: {
            start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            end: new Date()
          },
          geographicCoverage: ['US'],
          demographicCoverage: ['general'],
          schemaStability: 0.9,
          attributeCount: 50,
          relationshipDensity: 0.5
        }
      });

      this.logger.info('Data collateral registered successfully', {
        correlationId: actualCorrelationId,
        assetId: asset.assetId,
      });

      return asset;
    } catch (error) {
      if (error instanceof (ValidationError || OrchestratorError)) {
        throw error;
      }
      this.logger.error('Failed to register data collateral', error as Error, {
        correlationId: actualCorrelationId,
      });
      throw new OrchestratorError(
        `Data collateral registration failed: ${error instanceof Error ? error.message : String(error)}`,
        actualCorrelationId
      );
    }
  }

  /**
   * Pledge data collateral to back a risk position
   *
   * @param dataAssetId ID of data asset to pledge
   * @param riskTokenId ID of risk token to back
   * @param pledgeValue Value of the pledge
   * @param correlationId Optional correlation ID for tracing
   * @throws ValidationError if inputs are invalid
   * @throws NotFoundError if token not found
   * @throws OrchestratorError if pledge fails
   */
  pledgeDataToRisk(
    dataAssetId: string,
    riskTokenId: string,
    pledgeValue: number,
    correlationId?: string
  ): void {
    const actualCorrelationId = correlationId || `pledge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Validate inputs
      const validation = validateDataPledge(dataAssetId, riskTokenId, pledgeValue);
      if (!validation.success) {
        throw new ValidationError(
          `Data pledge validation failed: ${formatValidationErrors(validation.errors!)}`,
          actualCorrelationId
        );
      }

      // Ethical check
      this.ethicsPolicy.checkUseCase({
        purpose: 'data_pledging',
        context: 'risk_backing',
        correlationId: actualCorrelationId,
      });

      // Find token
      const token = this.tokenizationEngine.getToken(riskTokenId);
      if (!token) {
        throw new NotFoundError(
          `Token not found: ${riskTokenId}`,
          actualCorrelationId
        );
      }

      this.logger.info('Pledging data to risk', {
        correlationId: actualCorrelationId,
        dataAssetId,
        riskTokenId,
        pledgeValue,
      });

      this.collateralEngine.pledgeAsCollateral(
        dataAssetId,
        'RISK_POOL',
        pledgeValue,
        {
          riskType: 'token',
          riskId: riskTokenId,
          notionalBacked: token.notionalExposure
        }
      );

      this.logger.info('Data pledged successfully', {
        correlationId: actualCorrelationId,
        dataAssetId,
        riskTokenId,
      });
    } catch (error) {
      if (error instanceof (ValidationError || NotFoundError)) {
        throw error;
      }
      this.logger.error('Failed to pledge data to risk', error as Error, {
        correlationId: actualCorrelationId,
      });
      throw error instanceof OrchestratorError
        ? error
        : new OrchestratorError(
            `Data pledge failed: ${error instanceof Error ? error.message : String(error)}`,
            actualCorrelationId
          );
    }
  }

  // ==========================================================================
  // REPORTING
  // ==========================================================================

  /**
   * Generate comprehensive system report
   *
   * @param correlationId Optional correlation ID for tracing
   * @returns Comprehensive system report with all metrics
   * @throws OrchestratorError if report generation fails
   */
  generateSystemReport(correlationId?: string): SystemReport {
    const actualCorrelationId = correlationId || `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Ethical check
      this.ethicsPolicy.checkUseCase({
        purpose: 'system_reporting',
        context: 'monitoring',
        correlationId: actualCorrelationId,
      });

      this.logger.info('Generating system report', {
        correlationId: actualCorrelationId,
      });

      const networkHealth = this.oracleNetwork.getNetworkHealth();
      const allPools = this.tokenizationEngine.getAllPools();
      const allAssets = this.collateralEngine.getAllAssets();
      const miningPotential = this.collateralEngine.getTotalMiningPotential();

      const totalNotional = allPools.reduce((sum, p) => sum + p.totalNotional, 0);
      const totalExpectedLoss = allPools.reduce((sum, p) => sum + p.totalExpectedLoss, 0);
      const totalCollateral = this.collateralEngine.getTotalAvailableCollateral();

      const report: SystemReport = {
        timestamp: new Date(),
        summary: {
          totalPools: allPools.length,
          totalNotional,
          totalExpectedLoss,
          totalCollateral,
          collateralRatio: totalNotional > 0 ? totalCollateral / totalNotional : 0,
          totalDataAssets: allAssets.length,
          totalMiningPotential: miningPotential.totalAnnualRevenue
        },
        oracleNetwork: networkHealth,
        pools: allPools.map(p => ({
          poolId: p.poolId,
          poolName: p.poolName,
          notional: p.totalNotional,
          expectedLoss: p.totalExpectedLoss,
          trancheCount: p.tranches.length,
          state: p.state
        })),
        collateral: {
          totalAssets: allAssets.length,
          totalValue: allAssets.reduce((sum, a) => sum + a.valuation.totalValue, 0),
          totalAvailable: totalCollateral,
          utilizationRate: allAssets.length > 0
            ? allAssets.reduce((sum, a) => sum + a.collateralStatus.utilizationRate, 0) / allAssets.length
            : 0
        },
        miningPotential
      };

      this.logger.info('System report generated successfully', {
        correlationId: actualCorrelationId,
        pools: report.summary.totalPools,
        assets: report.summary.totalDataAssets,
      });

      return report;
    } catch (error) {
      this.logger.error('Failed to generate system report', error as Error, {
        correlationId: actualCorrelationId,
      });
      throw error instanceof OrchestratorError
        ? error
        : new OrchestratorError(
            `Report generation failed: ${error instanceof Error ? error.message : String(error)}`,
            actualCorrelationId
          );
    }
  }

  // ==========================================================================
  // GETTERS
  // ==========================================================================

  getTokenizationEngine(): RiskTokenizationEngine {
    return this.tokenizationEngine;
  }

  getGeneticPool(): GeneticRiskPool {
    return this.geneticPool;
  }

  getOracleNetwork(): LLMOracleNetwork {
    return this.oracleNetwork;
  }

  getCollateralEngine(): DataCollateralEngine {
    return this.collateralEngine;
  }
}

// =============================================================================
// TYPES
// =============================================================================

/**
 * Pool summary for system report
 */
export interface PoolSummary {
  poolId: string;
  poolName: string;
  notional: number;
  expectedLoss: number;
  trancheCount: number;
  state: string;
}

/**
 * Collateral summary for system report
 */
export interface CollateralSummary {
  totalAssets: number;
  totalValue: number;
  totalAvailable: number;
  utilizationRate: number;
}

/**
 * Mining opportunity detail
 */
export interface MiningOpportunityDetail {
  assetId: string;
  score: number;
  estimatedAnnualValue: number;
}

/**
 * Mining potential summary
 */
export interface MiningPotentialSummary {
  totalScore: number;
  totalAnnualRevenue: number;
  topOpportunities: MiningOpportunityDetail[];
}

/**
 * System health report from oracle network
 */
export interface SystemReport {
  timestamp: Date;
  summary: {
    totalPools: number;
    totalNotional: number;
    totalExpectedLoss: number;
    totalCollateral: number;
    collateralRatio: number;
    totalDataAssets: number;
    totalMiningPotential: number;
  };
  oracleNetwork: NetworkHealth;
  pools: PoolSummary[];
  collateral: CollateralSummary;
  miningPotential: MiningPotentialSummary;
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default RiskDistributionOrchestrator;
