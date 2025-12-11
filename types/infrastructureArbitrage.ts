/**
 * Infinity Soul Infrastructure Arbitrage Types
 * 
 * Distributed systems holding company - treating agent networks, vector stores,
 * and API moats like Kluge treated FCC licenses and transmitter towers.
 */

// ============================================================================
// INFRASTRUCTURE ASSETS (Not "Channels" - Compute Nodes with Trapped Value)
// ============================================================================

export type AssetType = 'api' | 'sdk' | 'extension' | 'data_stream' | 'compute_contract' | 'saas_tool' | 'open_source_lib';

export interface InfrastructureAsset {
  asset_id: string;
  asset_type: AssetType;
  name: string;
  
  // Not "audience" - integrated users with coordination rights
  captive_users: number;
  
  // What agents can hook into
  coordination_rights: CoordinationRight[];
  
  // Data exhaust streams
  data_exhaust: DataFingerprint;
  
  // Ease of adding paywall/agent-tier
  monetization_friction: number; // 0-1, lower = easier
  
  // Acquisition details
  acquisition: {
    date: Date;
    price: number;
    structure: 'buyout' | 'revshare' | 'maintainer_transfer' | 'compute_lease';
  };
  
  // Current metrics
  metrics: InfrastructureMetrics;
  
  // Classification in portfolio
  portfolio_classification: 'station' | 'surface' | 'network' | 'fiber';
  
  // Exit planning
  exit_readiness: ExitReadiness;
}

export interface CoordinationRight {
  type: 'api_access' | 'data_access' | 'compute_access' | 'user_access' | 'integration_hook';
  scope: string;
  limitations?: string[];
  value_estimate: number; // USD/year coordination value
}

export interface DataFingerprint {
  // Volume metrics
  api_calls_per_day: number;
  data_points: number;
  interaction_events_per_day: number;
  
  // Quality metrics
  vectorized: boolean;
  rag_ready: boolean;
  telemetry_enabled: boolean;
  
  // Exhaust streams
  sources: DataSource[];
  
  // Graph potential
  graph_density: number; // 0-1
  entity_richness: number; // entities per 1K data points
}

export interface DataSource {
  type: 'api_logs' | 'support_tickets' | 'github_issues' | 'forum_threads' | 'user_actions';
  volume_per_day: number;
  retention_days: number;
  structured: boolean;
}

export interface InfrastructureMetrics {
  // Usage
  dau: number;
  mau: number;
  api_calls_per_month: number;
  
  // Economics
  compute_cost_per_month: number;
  revenue_per_month: number;
  margin: number;
  
  // Coordination value
  coordination_value_per_month: number; // Actual value created
  trapped_value_estimate: number; // Unrealized potential
  
  // Agent deployment
  agent_coverage: number; // 0-1, % of workflows automated
  agent_cost_per_month: number;
  
  // Network effects
  integration_points: number;
  cross_asset_synergies: number;
}

export interface ExitReadiness {
  coordination_value_plateaued: boolean;
  valuation_multiple: number;
  strategic_buyer_interest: string[];
  management_attention_percent: number;
  recommended_action: 'hold' | 'prepare_exit' | 'exit_now';
  estimated_sale_price: number;
}

// ============================================================================
// SURFACES (Computational Insertion Points)
// ============================================================================

export type SurfaceType = 
  | 'edge_function'
  | 'mcp_server'
  | 'discord_bot'
  | 'vscode_extension'
  | 'chrome_extension'
  | 'slack_app'
  | 'api_gateway'
  | 'smart_contract_listener';

export interface Surface {
  surface_id: string;
  surface_type: SurfaceType;
  name: string;
  
  // Insertion characteristics
  insertion_type: {
    latency: 'realtime' | 'near_realtime' | 'async';
    permissions: string[];
    api_access: string[];
  };
  
  // Traffic characteristics
  traffic: {
    calls_per_day: number;
    unique_users_per_day: number;
    avg_latency_ms: number;
  };
  
  // Monetization
  revenue_per_call: number;
  free_tier_limit: number;
  
  // Connected assets
  connected_assets: string[]; // asset_ids
  
  // Deployment status
  status: 'development' | 'deployed' | 'deprecated';
}

// ============================================================================
// AGENTS (Coordination Workers)
// ============================================================================

export type AgentMission = 
  | 'scout'        // Ingests logs, builds knowledge graphs
  | 'analyst'      // Runs embeddings, identifies monetization opportunities
  | 'syndicator'   // Exposes graphs via new surfaces
  | 'writer'       // Auto-generates docs, SDK examples
  | 'coordinator'  // Orchestrates other agents
  | 'value_extractor'; // Optimizes monetization

export interface CoordinationAgent {
  agent_id: string;
  name: string;
  mission: AgentMission;
  
  // Capabilities
  tools: AgentTool[];
  
  // Constraints
  policy: AgentPolicy;
  
  // Performance tracking
  ledger: AgentLedger;
  
  // Assignment
  assigned_assets: string[]; // asset_ids
  
  status: 'active' | 'paused' | 'terminated';
}

export interface AgentTool {
  tool_type: 'vector_query' | 'mcp_server' | 'discord_bot' | 'api_call' | 'github_api' | 'compute_job';
  endpoint?: string;
  permissions: string[];
  cost_per_use: number;
}

export interface AgentPolicy {
  // Cost controls
  max_cost_per_day: number;
  max_api_calls_per_minute: number;
  
  // Quality requirements
  quality_threshold: number; // 0-1
  human_review_required: boolean;
  
  // Risk limits
  max_simultaneous_operations: number;
  rollback_on_error: boolean;
}

export interface AgentLedger {
  // Value created
  total_value_created: number; // USD
  value_by_asset: Map<string, number>;
  
  // Costs incurred
  total_cost: number;
  cost_by_operation: Map<string, number>;
  
  // ROI
  roi: number;
  
  // Performance
  tasks_completed: number;
  success_rate: number;
  avg_quality_score: number;
}

// ============================================================================
// COORDINATION EVENTS (Telemetry Stream)
// ============================================================================

export interface CoordinationEvent {
  event_id: string;
  timestamp: Date;
  
  // What happened
  event_type: 'api_call' | 'vector_query' | 'agent_invocation' | 'compute_job' | 'surface_deployment';
  
  // Where
  asset_id: string;
  surface_id?: string;
  agent_id?: string;
  
  // Who
  user_id: string; // Identity graph node
  
  // Economics
  cost: number; // Our cost to serve
  value: number; // Value created (usage metric)
  revenue?: number; // Actual revenue collected
  
  // Context
  metadata: Record<string, any>;
}

// ============================================================================
// VALUE LEDGER (Revenue Allocation)
// ============================================================================

export interface ValueLedger {
  // Per-asset accounting
  asset_values: Map<string, AssetValue>;
  
  // Per-agent accounting
  agent_values: Map<string, AgentValue>;
  
  // Cross-asset synergies
  synergy_values: SynergyValue[];
  
  // Overall portfolio
  total_value_created: number;
  total_cost: number;
  net_coordination_value: number;
}

export interface AssetValue {
  asset_id: string;
  
  // Direct value
  direct_revenue: number;
  direct_cost: number;
  
  // Coordination value
  coordination_events: number;
  coordination_value: number;
  
  // Data value
  data_contribution: number; // Value to IS Fiber
  
  // Network effects
  cross_asset_value: number; // Value created for other assets
}

export interface AgentValue {
  agent_id: string;
  value_created: number;
  cost_incurred: number;
  roi: number;
}

export interface SynergyValue {
  asset_ids: string[];
  synergy_type: 'data_enrichment' | 'cross_sell' | 'shared_infrastructure' | 'bundled_exit';
  value: number;
}

// ============================================================================
// PORTFOLIO ORCHESTRATOR
// ============================================================================

export interface InfinitySoulNetwork {
  // Asset registry
  assets: AssetRegistry;
  
  // Surface mesh
  surfaces: SurfaceMesh;
  
  // Agent pool
  agents: AgentOrchestrator;
  
  // Value tracking
  ledger: ValueLedger;
  
  // Core operations
  ingestExhaust(asset: InfrastructureAsset): Promise<KnowledgeGraph>;
  deployCoordinationAgents(asset: InfrastructureAsset, missions: AgentMission[]): Promise<AgentSwarm>;
  syndicateGraph(graph: KnowledgeGraph, surfaces: string[]): Promise<SyndicationResult>;
  measureCoordinationValue(): Promise<PortfolioMetrics>;
  rebalancePortfolio(): Promise<RebalanceDecision[]>;
}

export interface AssetRegistry {
  assets: Map<string, InfrastructureAsset>;
  
  add(asset: InfrastructureAsset): void;
  get(asset_id: string): InfrastructureAsset | undefined;
  list(filter?: AssetFilter): InfrastructureAsset[];
  
  // Acquisition opportunities
  findMispricedInfrastructure(criteria: AcquisitionCriteria): InfrastructureAsset[];
  
  // Exit opportunities
  getExitReady(): InfrastructureAsset[];
}

export interface AssetFilter {
  portfolio_classification?: 'station' | 'surface' | 'network' | 'fiber';
  min_coordination_value?: number;
  min_valuation_multiple?: number;
  asset_types?: AssetType[];
}

export interface AcquisitionCriteria {
  min_captive_users?: number;
  max_purchase_price?: number;
  required_coordination_rights?: string[];
  min_trapped_value?: number;
  licenses?: string[]; // e.g., ['MIT', 'Apache-2.0']
}

export interface SurfaceMesh {
  surfaces: Map<string, Surface>;
  
  add(surface: Surface): void;
  get(surface_id: string): Surface | undefined;
  list(filter?: SurfaceFilter): Surface[];
  
  // Deployment
  deployNewSurface(config: SurfaceDeploymentConfig): Promise<Surface>;
  
  // Integration
  connectAsset(surface_id: string, asset_id: string): void;
}

export interface SurfaceFilter {
  surface_type?: SurfaceType;
  min_traffic?: number;
  connected_to_asset?: string;
}

export interface SurfaceDeploymentConfig {
  surface_type: SurfaceType;
  graph_subset: string; // Which knowledge graph to expose
  monetization: MonetizationConfig;
  integration: IntegrationConfig;
}

export interface MonetizationConfig {
  model: 'pay_per_call' | 'subscription' | 'freemium' | 'enterprise';
  rate?: number; // USD per call
  free_tier_limit?: number; // calls per month
  enterprise_pricing?: number; // USD per month
}

export interface IntegrationConfig {
  platforms: string[];
  permissions: string[];
  api_endpoints?: string[];
}

export interface AgentOrchestrator {
  agents: Map<string, CoordinationAgent>;
  
  add(agent: CoordinationAgent): void;
  get(agent_id: string): CoordinationAgent | undefined;
  list(filter?: AgentFilter): CoordinationAgent[];
  
  // Deployment
  deploySwarm(asset_id: string, missions: AgentMission[], budget: AgentBudget): Promise<AgentSwarm>;
  
  // Management
  assignToAsset(agent_id: string, asset_id: string): void;
  reassignAgent(agent_id: string, from_asset: string, to_asset: string): void;
  terminateAgent(agent_id: string): void;
}

export interface AgentFilter {
  mission?: AgentMission;
  status?: 'active' | 'paused' | 'terminated';
  assigned_to_asset?: string;
  min_roi?: number;
}

export interface AgentBudget {
  max_cost_per_day: number;
  max_cost_per_month: number;
  max_api_calls: number;
}

export interface AgentSwarm {
  swarm_id: string;
  asset_id: string;
  agents: CoordinationAgent[];
  coordination_strategy: 'sequential' | 'parallel' | 'hierarchical';
  estimated_value_creation: number; // USD/year
  deployed_at: Date;
}

// ============================================================================
// KNOWLEDGE GRAPHS (Data Exhaust → Structured Knowledge)
// ============================================================================

export interface KnowledgeGraph {
  graph_id: string;
  asset_id: string;
  
  // Graph structure
  nodes: GraphNode[];
  edges: GraphEdge[];
  
  // Vectorization
  embeddings: Embedding[];
  vector_dimensions: number;
  
  // Metadata
  created_from: DataSource[];
  created_at: Date;
  last_updated: Date;
  
  // Value metrics
  coordination_value_estimate: number;
  recommended_surfaces: SurfaceType[];
}

export interface GraphNode {
  node_id: string;
  node_type: string;
  properties: Record<string, any>;
  embedding?: number[];
}

export interface GraphEdge {
  from_node: string;
  to_node: string;
  edge_type: string;
  weight: number;
  properties?: Record<string, any>;
}

export interface Embedding {
  content_id: string;
  vector: number[];
  metadata: Record<string, any>;
}

// ============================================================================
// PORTFOLIO METRICS & REBALANCING
// ============================================================================

export interface PortfolioMetrics {
  // Overview
  total_assets: number;
  total_surfaces: number;
  total_agents: number;
  
  // Financial
  total_revenue: number;
  total_cost: number;
  net_margin: number;
  portfolio_valuation: number;
  
  // Coordination
  total_coordination_value: number;
  coordination_efficiency: number; // value / cost
  trapped_value_estimate: number;
  
  // Per-asset breakdown
  assets: AssetMetrics[];
  
  // Recommendations
  recommendations: PortfolioRecommendation[];
  
  calculated_at: Date;
}

export interface AssetMetrics {
  asset_id: string;
  asset_name: string;
  
  // Classification
  portfolio_classification: 'station' | 'surface' | 'network' | 'fiber';
  
  // Financial
  revenue: number;
  cost: number;
  margin: number;
  
  // Coordination
  coordination_value: number;
  trapped_value: number;
  
  // Valuation
  valuation: number;
  valuation_multiple: number;
  
  // Status
  exit_readiness: 'not_ready' | 'preparing' | 'ready';
}

export interface PortfolioRecommendation {
  action: 'acquire' | 'deploy_agents' | 'deploy_surface' | 'exit' | 'optimize';
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  // Target
  asset_id?: string;
  target_description?: string;
  
  // Rationale
  rationale: string;
  expected_value_impact: number;
  estimated_cost: number;
  
  // Timeline
  timeframe: string;
  confidence: number; // 0-1
}

export interface RebalanceDecision {
  decision_id: string;
  action: 'acquire' | 'exit' | 'deploy_agents' | 'deploy_surface' | 'optimize';
  
  // Target
  asset_id?: string;
  target_type?: string;
  
  // Justification
  rationale: string;
  signals: string[];
  
  // Valuation
  estimated_value: number;
  estimated_cost: number;
  expected_roi: number;
  
  // Execution
  urgency: 'immediate' | 'near_term' | 'long_term';
  confidence: number; // 0-1
  
  timestamp: Date;
}

// ============================================================================
// SYNDICATION RESULTS
// ============================================================================

export interface SyndicationResult {
  graph_id: string;
  surfaces_deployed: SurfaceDeployment[];
  total_reach: number; // Estimated users reached
  total_cost: number;
  estimated_revenue: number;
  timestamp: Date;
}

export interface SurfaceDeployment {
  surface_id: string;
  surface_name: string;
  surface_type: SurfaceType;
  status: 'success' | 'failed';
  deployment_url?: string;
  error?: string;
  reach: number;
  cost: number;
}

// ============================================================================
// ACQUISITION TARGETS (Opportunity Scanner)
// ============================================================================

export interface AcquisitionTarget {
  target_id: string;
  target_type: AssetType;
  name: string;
  
  // Discovery
  discovered_via: 'github_scan' | 'npm_scan' | 'chrome_store_scan' | 'manual';
  discovered_at: Date;
  
  // Metrics
  captive_users: number;
  stars?: number;
  downloads_per_week?: number;
  
  // Signals
  signals: AcquisitionSignal[];
  
  // Valuation
  trapped_value_estimate: number;
  agent_upside_multiplier: number;
  
  // Due diligence
  license: string;
  maintainer_status: 'active' | 'burned_out' | 'abandoned';
  last_activity_date: Date;
  
  // Recommendation
  recommendation: 'strong_acquire' | 'acquire' | 'pass' | 'watch';
  confidence: number;
}

export interface AcquisitionSignal {
  type: 'high_usage' | 'low_monetization' | 'maintainer_burnout' | 'no_telemetry' | 'clean_license' | 'data_exhaust';
  strength: number; // 0-1
  description: string;
}
