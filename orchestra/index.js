/**
 * INFINITYSOUL ORCHESTRA
 *
 * Multi-agent system for translating founder vision into technical reality.
 * Like a recording studio: all instruments play simultaneously,
 * captured to separate tracks, mixed into stems, then mastered.
 */

export { MasterConductor } from './master_conductor.js';
export { VoiceMemoProcessor } from './voice_memo_processor.js';
export { OrchestrationEngine } from './orchestration_engine.js';

// Quick start helper
export async function createOrchestra(config = {}) {
  const { MasterConductor } = await import('./master_conductor.js');
  return new MasterConductor(config);
}

// CLI entry point
export async function processVoiceMemo(filePath, options = {}) {
  const conductor = await createOrchestra(options);
  return conductor.processFounderInput(filePath, 'voice_memo', options);
}

export async function orchestrate(input, options = {}) {
  const conductor = await createOrchestra(options);
  return conductor.processFounderInput(input, 'text', options);
}

export default {
  MasterConductor,
  VoiceMemoProcessor,
  OrchestrationEngine,
  createOrchestra,
  processVoiceMemo,
  orchestrate,
};
