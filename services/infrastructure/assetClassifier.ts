/**
 * Infrastructure Asset Classifier
 * 
 * Classifies InfinitySoul's existing products using the IS Station/Surface/Network/Fiber framework
 */

import {
  InfrastructureAsset,
  AssetType,
  InfrastructureMetrics,
  ExitReadiness,
} from '../../types/infrastructureArbitrage';

/**
 * Classify existing InfinitySoul products
 */
export function classifyInfinitySoulAssets(): InfrastructureAsset[] {
  return [
    classifyWCAGScanner(),
    classifyCyberAuditTool(),
    classifyCampusEarlyWarning(),
    classifyLitigationDatabase(),
    classifyMusicGenomeEngine(),
    classifyLLMOracleNetwork(),
    classifyRiskDistributionFramework(),
  ];
}

/**
 * WCAG Accessibility Scanner
 * Classification: IS Station (sellable compute node)
 */
function classifyWCAGScanner(): InfrastructureAsset {
  return {
    asset_id: 'wcag-scanner',
    asset_type: 'saas_tool',
    name: 'WCAG Accessibility Scanner',
    
    captive_users: 0, // TBD - needs telemetry
    
    coordination_rights: [
      {
        type: 'api_access',
        scope: 'accessibility_scanning',
        value_estimate: 50000, // $50K/year if opened as API
      },
      {
        type: 'data_access',
        scope: 'violation_patterns',
        value_estimate: 100000, // $100K/year for pattern database
      },
    ],
    
    data_exhaust: {
      api_calls_per_day: 0, // Not instrumented yet
      data_points: 0, // Historical scans not counted
      interaction_events_per_day: 0,
      vectorized: false,
      rag_ready: false,
      telemetry_enabled: false,
      sources: [
        {
          type: 'api_logs',
          volume_per_day: 0,
          retention_days: 0,
          structured: false,
        },
      ],
      graph_density: 0.1,
      entity_richness: 0,
    },
    
    monetization_friction: 0.3, // Medium - already has paid tier concept
    
    acquisition: {
      date: new Date('2023-01-01'), // Founding date
      price: 0, // Built in-house
      structure: 'buyout',
    },
    
    metrics: {
      dau: 0,
      mau: 0,
      api_calls_per_month: 0,
      compute_cost_per_month: 100, // Estimated hosting
      revenue_per_month: 0, // Not monetized yet
      margin: -1, // Negative until monetized
      coordination_value_per_month: 0,
      trapped_value_estimate: 150000, // High potential if vectorized + MCP deployed
      agent_coverage: 0, // No agents deployed
      agent_cost_per_month: 0,
      integration_points: 1, // Just the web API
      cross_asset_synergies: 0,
    },
    
    portfolio_classification: 'station', // Sellable
    
    exit_readiness: {
      coordination_value_plateaued: false,
      valuation_multiple: 0, // No revenue yet
      strategic_buyer_interest: ['Accessibility platforms', 'Enterprise GRC'],
      management_attention_percent: 30,
      recommended_action: 'hold',
      estimated_sale_price: 500000, // With 12-18 months of agent deployment
    },
  };
}

/**
 * Cyber Audit Tool
 * Classification: IS Station (sellable)
 */
function classifyCyberAuditTool(): InfrastructureAsset {
  return {
    asset_id: 'cyber-audit',
    asset_type: 'saas_tool',
    name: 'Cyber Audit Tool',
    
    captive_users: 0,
    
    coordination_rights: [
      {
        type: 'api_access',
        scope: 'security_scanning',
        value_estimate: 75000,
      },
      {
        type: 'data_access',
        scope: 'vulnerability_fingerprints',
        value_estimate: 150000,
      },
    ],
    
    data_exhaust: {
      api_calls_per_day: 0,
      data_points: 0,
      interaction_events_per_day: 0,
      vectorized: false,
      rag_ready: false,
      telemetry_enabled: false,
      sources: [],
      graph_density: 0.05,
      entity_richness: 0,
    },
    
    monetization_friction: 0.2, // Low - already designed for paid model
    
    acquisition: {
      date: new Date('2024-01-01'),
      price: 0,
      structure: 'buyout',
    },
    
    metrics: {
      dau: 0,
      mau: 0,
      api_calls_per_month: 0,
      compute_cost_per_month: 50,
      revenue_per_month: 0,
      margin: -1,
      coordination_value_per_month: 0,
      trapped_value_estimate: 200000, // Could be MCP server for security agents
      agent_coverage: 0,
      agent_cost_per_month: 0,
      integration_points: 0,
      cross_asset_synergies: 1, // Bundles with WCAG scanner
    },
    
    portfolio_classification: 'station',
    
    exit_readiness: {
      coordination_value_plateaued: false,
      valuation_multiple: 0,
      strategic_buyer_interest: ['Security platforms', 'GRC vendors'],
      management_attention_percent: 15,
      recommended_action: 'hold',
      estimated_sale_price: 800000, // As part of compliance bundle
    },
  };
}

/**
 * Campus Early Warning System
 * Classification: IS Fiber (never sell - this generates core data)
 */
function classifyCampusEarlyWarning(): InfrastructureAsset {
  return {
    asset_id: 'campus-warning',
    asset_type: 'saas_tool',
    name: 'Campus Early Warning System',
    
    captive_users: 0, // Pilot phase
    
    coordination_rights: [
      {
        type: 'data_access',
        scope: 'behavioral_risk_data',
        value_estimate: 500000, // Core IP - behavioral models
      },
      {
        type: 'integration_hook',
        scope: 'university_systems',
        value_estimate: 250000,
      },
    ],
    
    data_exhaust: {
      api_calls_per_day: 0,
      data_points: 0,
      interaction_events_per_day: 0,
      vectorized: true, // Music genome is vectorized
      rag_ready: true,
      telemetry_enabled: false,
      sources: [
        {
          type: 'user_actions',
          volume_per_day: 0, // Pilot starting
          retention_days: 365,
          structured: true,
        },
      ],
      graph_density: 0.7, // High - behavioral correlations
      entity_richness: 100,
    },
    
    monetization_friction: 0.8, // High - ethically sensitive, university budgets
    
    acquisition: {
      date: new Date('2024-01-01'),
      price: 0,
      structure: 'buyout',
    },
    
    metrics: {
      dau: 0,
      mau: 0,
      api_calls_per_month: 0,
      compute_cost_per_month: 200,
      revenue_per_month: 0,
      margin: -1,
      coordination_value_per_month: 0,
      trapped_value_estimate: 1000000, // Huge - feeds IS Fiber
      agent_coverage: 0.3, // Some agent analysis
      agent_cost_per_month: 50,
      integration_points: 0,
      cross_asset_synergies: 5, // Feeds everything else
    },
    
    portfolio_classification: 'fiber', // Never sell
    
    exit_readiness: {
      coordination_value_plateaued: false,
      valuation_multiple: 0,
      strategic_buyer_interest: [], // Not for sale
      management_attention_percent: 40,
      recommended_action: 'hold',
      estimated_sale_price: 0, // Never sell
    },
  };
}

/**
 * Litigation Intelligence Database
 * Classification: IS Fiber (permanent infrastructure)
 */
function classifyLitigationDatabase(): InfrastructureAsset {
  return {
    asset_id: 'litigation-db',
    asset_type: 'data_stream',
    name: 'Litigation Intelligence Database',
    
    captive_users: 0,
    
    coordination_rights: [
      {
        type: 'data_access',
        scope: 'court_records',
        value_estimate: 200000,
      },
      {
        type: 'api_access',
        scope: 'litigation_risk_api',
        value_estimate: 150000,
      },
    ],
    
    data_exhaust: {
      api_calls_per_day: 0,
      data_points: 50000, // Estimated court records
      interaction_events_per_day: 0,
      vectorized: false, // Should be vectorized
      rag_ready: false,
      telemetry_enabled: false,
      sources: [
        {
          type: 'api_logs',
          volume_per_day: 100, // PACER scraping
          retention_days: 3650, // 10 years
          structured: true,
        },
      ],
      graph_density: 0.6,
      entity_richness: 80,
    },
    
    monetization_friction: 0.3,
    
    acquisition: {
      date: new Date('2023-06-01'),
      price: 0,
      structure: 'buyout',
    },
    
    metrics: {
      dau: 0,
      mau: 0,
      api_calls_per_month: 0,
      compute_cost_per_month: 150,
      revenue_per_month: 0,
      margin: -1,
      coordination_value_per_month: 0,
      trapped_value_estimate: 300000, // High if exposed as API + vectorized
      agent_coverage: 0.1,
      agent_cost_per_month: 20,
      integration_points: 1,
      cross_asset_synergies: 2, // Enhances WCAG scanner risk scoring
    },
    
    portfolio_classification: 'fiber', // Keep forever - data compounds
    
    exit_readiness: {
      coordination_value_plateaued: false,
      valuation_multiple: 0,
      strategic_buyer_interest: [], // Licensing only, never sell
      management_attention_percent: 10,
      recommended_action: 'hold',
      estimated_sale_price: 0, // License, don't sell
    },
  };
}

/**
 * Music Genome Risk Engine (Soul Fingerprint)
 * Classification: IS Fiber (core IP)
 */
function classifyMusicGenomeEngine(): InfrastructureAsset {
  return {
    asset_id: 'music-genome',
    asset_type: 'data_stream',
    name: 'Music Genome Risk Engine',
    
    captive_users: 1, // Founder's 21 years of data
    
    coordination_rights: [
      {
        type: 'data_access',
        scope: '21_year_listening_history',
        value_estimate: 1000000, // Irreplaceable
      },
      {
        type: 'api_access',
        scope: 'behavioral_risk_scoring',
        value_estimate: 500000,
      },
    ],
    
    data_exhaust: {
      api_calls_per_day: 0,
      data_points: 500000, // 21 years of scrobbles
      interaction_events_per_day: 0,
      vectorized: true,
      rag_ready: true,
      telemetry_enabled: false,
      sources: [
        {
          type: 'user_actions',
          volume_per_day: 0,
          retention_days: 7665, // 21 years
          structured: true,
        },
      ],
      graph_density: 0.9, // Extremely rich
      entity_richness: 450, // Pandora's 450 attributes
    },
    
    monetization_friction: 0.9, // Very high - ethically sensitive
    
    acquisition: {
      date: new Date('2003-01-01'), // When Last.fm started
      price: 0, // Personal data
      structure: 'buyout',
    },
    
    metrics: {
      dau: 0,
      mau: 0,
      api_calls_per_month: 0,
      compute_cost_per_month: 100,
      revenue_per_month: 0,
      margin: -1,
      coordination_value_per_month: 0,
      trapped_value_estimate: 2000000, // Licensing to insurers, research
      agent_coverage: 0.5, // Analyst agents deployed
      agent_cost_per_month: 100,
      integration_points: 1,
      cross_asset_synergies: 10, // Core IP for everything
    },
    
    portfolio_classification: 'fiber', // Never sell - this is the thesis
    
    exit_readiness: {
      coordination_value_plateaued: false,
      valuation_multiple: 0,
      strategic_buyer_interest: [], // License to insurers, never sell
      management_attention_percent: 50, // Core research
      recommended_action: 'hold',
      estimated_sale_price: 0, // Priceless
    },
  };
}

/**
 * LLM Oracle Network
 * Classification: IS Network (coordination layer)
 */
function classifyLLMOracleNetwork(): InfrastructureAsset {
  return {
    asset_id: 'llm-oracle',
    asset_type: 'compute_contract',
    name: 'LLM Risk Oracle Network',
    
    captive_users: 0,
    
    coordination_rights: [
      {
        type: 'compute_access',
        scope: 'multi_llm_validation',
        value_estimate: 300000,
      },
      {
        type: 'api_access',
        scope: 'consensus_oracle',
        value_estimate: 200000,
      },
    ],
    
    data_exhaust: {
      api_calls_per_day: 0,
      data_points: 0,
      interaction_events_per_day: 0,
      vectorized: false,
      rag_ready: false,
      telemetry_enabled: false,
      sources: [],
      graph_density: 0.2,
      entity_richness: 10,
    },
    
    monetization_friction: 0.4,
    
    acquisition: {
      date: new Date('2024-01-01'),
      price: 0,
      structure: 'buyout',
    },
    
    metrics: {
      dau: 0,
      mau: 0,
      api_calls_per_month: 0,
      compute_cost_per_month: 50,
      revenue_per_month: 0,
      margin: -1,
      coordination_value_per_month: 0,
      trapped_value_estimate: 500000, // Agent orchestration for all assets
      agent_coverage: 1.0, // IS the agent layer
      agent_cost_per_month: 50,
      integration_points: 0,
      cross_asset_synergies: 10, // Coordinates everything
    },
    
    portfolio_classification: 'network', // Never sell - coordination layer
    
    exit_readiness: {
      coordination_value_plateaued: false,
      valuation_multiple: 0,
      strategic_buyer_interest: [],
      management_attention_percent: 20,
      recommended_action: 'hold',
      estimated_sale_price: 0, // Core infrastructure
    },
  };
}

/**
 * Universal Risk Distribution Framework
 * Classification: IS Fiber (permanent rails)
 */
function classifyRiskDistributionFramework(): InfrastructureAsset {
  return {
    asset_id: 'risk-framework',
    asset_type: 'compute_contract',
    name: 'Universal Risk Distribution Framework',
    
    captive_users: 0,
    
    coordination_rights: [
      {
        type: 'data_access',
        scope: 'risk_taxonomy',
        value_estimate: 500000,
      },
      {
        type: 'api_access',
        scope: 'risk_tokenization',
        value_estimate: 400000,
      },
    ],
    
    data_exhaust: {
      api_calls_per_day: 0,
      data_points: 0,
      interaction_events_per_day: 0,
      vectorized: true,
      rag_ready: true,
      telemetry_enabled: false,
      sources: [],
      graph_density: 0.8,
      entity_richness: 200,
    },
    
    monetization_friction: 0.7, // High - complex value prop
    
    acquisition: {
      date: new Date('2024-01-01'),
      price: 0,
      structure: 'buyout',
    },
    
    metrics: {
      dau: 0,
      mau: 0,
      api_calls_per_month: 0,
      compute_cost_per_month: 100,
      revenue_per_month: 0,
      margin: -1,
      coordination_value_per_month: 0,
      trapped_value_estimate: 5000000, // Licensing to insurers, banks
      agent_coverage: 0.4,
      agent_cost_per_month: 80,
      integration_points: 0,
      cross_asset_synergies: 15, // Foundation for everything
    },
    
    portfolio_classification: 'fiber', // Never sell - the operating system
    
    exit_readiness: {
      coordination_value_plateaued: false,
      valuation_multiple: 0,
      strategic_buyer_interest: [], // This is the HoldCo itself
      management_attention_percent: 30,
      recommended_action: 'hold',
      estimated_sale_price: 0, // The company IS this
    },
  };
}

/**
 * Generate portfolio summary
 */
export function summarizePortfolio(assets: InfrastructureAsset[]): string {
  const stations = assets.filter(a => a.portfolio_classification === 'station');
  const surfaces = assets.filter(a => a.portfolio_classification === 'surface');
  const network = assets.filter(a => a.portfolio_classification === 'network');
  const fiber = assets.filter(a => a.portfolio_classification === 'fiber');
  
  const totalTrappedValue = assets.reduce((sum, a) => sum + a.metrics.trapped_value_estimate, 0);
  const totalRevenue = assets.reduce((sum, a) => sum + a.metrics.revenue_per_month * 12, 0);
  
  return `
InfinitySoul Portfolio Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IS Stations (Sellable): ${stations.length}
  - ${stations.map(s => s.name).join('\n  - ')}

IS Surfaces (Insertion Points): ${surfaces.length}
  - ${surfaces.length === 0 ? 'None deployed yet' : surfaces.map(s => s.name).join('\n  - ')}

IS Network (Coordination): ${network.length}
  - ${network.map(n => n.name).join('\n  - ')}

IS Fiber (Permanent): ${fiber.length}
  - ${fiber.map(f => f.name).join('\n  - ')}

Financial Status:
  Current ARR: $${(totalRevenue / 1000).toFixed(0)}K
  Trapped Value: $${(totalTrappedValue / 1000000).toFixed(1)}M
  
Trapped value represents coordination opportunities from:
  - Vectorizing data exhaust
  - Deploying agent layers
  - Creating MCP servers and insertion points
  - Cross-asset synergies

Next Steps:
  1. Deploy telemetry to IS Stations
  2. Vectorize litigation + court data (IS Fiber)
  3. Deploy WCAG scanner as MCP server
  4. Launch first agent swarm on accessibility tool
  5. Identify first acquisition target
  `;
}
