/**
 * Four Registers Governance Framework
 *
 * Stories, Fables, Myths, and Numbers - operating as unified governance infrastructure.
 *
 * @module governance
 *
 * @example
 * ```typescript
 * import { GovernanceEngine } from './services/governance';
 *
 * // Initialize the engine
 * GovernanceEngine.initializeGovernanceEngine();
 *
 * // Respond to an incident with all four registers
 * const response = GovernanceEngine.initiateIncidentResponse({
 *   title: 'Disparate Impact Detected',
 *   description: 'Model producing 1.3x disparate impact ratio',
 *   severity: Severity.HIGH,
 *   type: 'fairness',
 *   affectedEntities: ['model_xyz'],
 *   affectedPartyCount: 1500
 * });
 *
 * // Get current state
 * const state = GovernanceEngine.getOrchestratorState();
 *
 * // Generate comprehensive report
 * const report = GovernanceEngine.generateGovernanceReport(30);
 * ```
 */

// Core types
export * from './types';

// Individual registers
export { default as StoriesEngine, StandardAudiences } from './stories';
export { default as FablesRegistry, CanonicalFables } from './fables';
export { default as SonicFablesRegistry, SonicFables } from './sonic-fables';
export { default as MythsInfrastructure, FoundationalMyths } from './myths';
export { default as NumbersAuditSystem, CanonicalMetrics } from './numbers';

// Unified engine
export { default as GovernanceEngine } from './engine';

// Convenience re-exports
export {
  // Stories
  createStory,
  buildFullConfession,
  checkNarrativeCoherence,
  generateIncidentStory
} from './stories';

export {
  // Fables
  getFableByShortName,
  analyzeForPatterns,
  applyFable,
  generateTrainingScenarios
} from './fables';

export {
  // Sonic Fables
  getSonicFable,
  getSonicFableByTitle,
  getAllSonicFables,
  matchSonicFables,
  assessWithSonicFables
} from './sonic-fables';

export {
  // Myths
  calculateLegitimacyScore,
  assessMythHealth,
  createRepairAction,
  generateReinforcementPlan
} from './myths';

export {
  // Numbers
  recordMetricValue,
  createIncident,
  createCertification,
  generateDashboard
} from './numbers';

export {
  // Engine
  initiateIncidentResponse,
  assessCertificationCandidate,
  getOrchestratorState,
  generateGovernanceReport,
  initializeGovernanceEngine
} from './engine';
