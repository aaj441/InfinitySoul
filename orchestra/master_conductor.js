/**
 * INFINITYSOUL ORCHESTRA - MASTER CONDUCTOR
 *
 * The central nervous system that coordinates the entire symphony.
 * Processes founder input and orchestrates multi-agent collaboration.
 *
 * Like a real conductor: doesn't play an instrument, but makes
 * 100 players sound like one voice.
 */

import { EventEmitter } from 'events';
import { VoiceMemoProcessor } from './voice_memo_processor.js';
import { OrchestrationEngine } from './orchestration_engine.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * @typedef {Object} ClickTrack
 * @property {string} rawInput - Original founder input
 * @property {Object} parsedIntent - Classified intent
 * @property {'prestissimo'|'allegro'|'andante'|'adagio'|'largo'} tempo - Processing speed
 * @property {Object} sharedMemory - Conversation history
 * @property {Object} agentSignals - Inter-agent communication
 * @property {Object} dynamics - Current priority levels per agent
 */

/**
 * @typedef {Object} Symphony
 * @property {string} id - Unique symphony identifier
 * @property {string} status - Current status
 * @property {number} progress - Completion percentage
 * @property {string} currentMovement - Current processing phase
 * @property {Object} stems - Grouped agent outputs
 * @property {Object} finalMix - Combined output
 */

export class MasterConductor extends EventEmitter {
  constructor(config = {}) {
    super();

    this.voiceMemoProcessor = new VoiceMemoProcessor(config.openaiKey);
    this.orchestrationEngine = new OrchestrationEngine();

    // Active symphonies being conducted
    this.symphonies = new Map();

    // Conductor's journal - reflections and learnings
    this.journal = [];

    // Performance metrics
    this.metrics = {
      symphoniesCompleted: 0,
      symphoniesAborted: 0,
      totalProcessingTime: 0,
      averageQualityScore: 0,
    };

    // Artistic direction presets
    this.artisticDirections = {
      more_aesthetic: { aesthetics: 1.2, ethics: 1.0, accessibility: 1.0, revenue: 0.9 },
      more_ethical: { aesthetics: 1.0, ethics: 1.2, accessibility: 1.1, revenue: 0.9 },
      more_revenue: { aesthetics: 1.0, ethics: 1.0, accessibility: 1.0, revenue: 1.3 },
      more_accessible: { aesthetics: 1.0, ethics: 1.1, accessibility: 1.3, revenue: 1.0 },
      founder_vision: { aesthetics: 1.1, ethics: 1.1, accessibility: 1.1, revenue: 1.1 },
    };

    this._setupEventHandlers();
  }

  /**
   * Main entry point - process founder input
   *
   * @param {string} input - Voice memo path or text
   * @param {'voice_memo'|'text'} inputType - Type of input
   * @param {Object} options - Processing options
   * @returns {Promise<Symphony>}
   */
  async processFounderInput(input, inputType = 'text', options = {}) {
    const symphonyId = uuidv4();
    const startTime = Date.now();

    // Initialize symphony
    const symphony = {
      id: symphonyId,
      status: 'initializing',
      progress: 0,
      currentMovement: 'prelude',
      input,
      inputType,
      options,
      stems: {},
      finalMix: null,
      timeline: [{ event: 'created', timestamp: startTime }],
    };

    this.symphonies.set(symphonyId, symphony);
    this.emit('symphony:created', { symphonyId });

    try {
      // MOVEMENT 1: Process voice memo / analyze text
      this._updateSymphony(symphonyId, {
        status: 'processing_input',
        currentMovement: 'voice_analysis',
        progress: 10,
      });

      const processed = await this.voiceMemoProcessor.process(input, inputType);
      symphony.processed = processed;

      // MOVEMENT 2: Create architecture across 4 pillars
      this._updateSymphony(symphonyId, {
        currentMovement: 'architecture_creation',
        progress: 25,
      });

      const architecture = await this.voiceMemoProcessor.createArchitecture(processed);
      symphony.architecture = architecture;

      // MOVEMENT 3: Create click track (shared context)
      const clickTrack = this._createClickTrack(symphony, options);
      symphony.clickTrack = clickTrack;

      // MOVEMENT 4: DOWNBEAT - Start all agents simultaneously
      this._updateSymphony(symphonyId, {
        status: 'orchestrating',
        currentMovement: 'orchestration',
        progress: 40,
      });

      // All agents start at once - TRUE parallel execution
      const agentOutputs = await this.orchestrationEngine.conduct(clickTrack);

      // MOVEMENT 5: Stem mixing
      this._updateSymphony(symphonyId, {
        currentMovement: 'stem_mixing',
        progress: 75,
      });

      symphony.stems = this._groupIntoStems(agentOutputs);

      // MOVEMENT 6: Final mix
      this._updateSymphony(symphonyId, {
        currentMovement: 'final_mix',
        progress: 90,
      });

      symphony.finalMix = await this._createFinalMix(symphony.stems, clickTrack);

      // FINALE: Complete
      const endTime = Date.now();
      this._updateSymphony(symphonyId, {
        status: 'completed',
        currentMovement: 'finale',
        progress: 100,
      });

      // Update metrics
      this.metrics.symphoniesCompleted++;
      this.metrics.totalProcessingTime += (endTime - startTime);

      // Journal entry
      this._addJournalEntry('symphony_completed', {
        symphonyId,
        processingTime: endTime - startTime,
        inputType,
        movements: symphony.timeline.length,
      });

      this.emit('symphony:completed', { symphonyId, symphony });

      return symphony;

    } catch (error) {
      this._updateSymphony(symphonyId, {
        status: 'failed',
        error: error.message,
      });

      this.metrics.symphoniesAborted++;
      this._addJournalEntry('symphony_failed', { symphonyId, error: error.message });
      this.emit('symphony:failed', { symphonyId, error });

      throw error;
    }
  }

  /**
   * Create the click track - shared context for all agents
   */
  _createClickTrack(symphony, options) {
    return {
      symphonyId: symphony.id,
      rawInput: symphony.input,
      parsedIntent: symphony.processed.classification,
      emotionalTexture: symphony.processed.emotionalTexture,
      architecture: symphony.architecture,
      tempo: options.tempo || this._determineTempo(options),
      sharedMemory: options.context || {},
      agentSignals: {},
      dynamics: this._getInitialDynamics(symphony.processed.classification),
      fourPillars: symphony.architecture.pillars,
      founderVibe: symphony.processed.vibe,
    };
  }

  /**
   * Determine processing tempo based on context
   */
  _determineTempo(options) {
    if (options.priority === 'urgent') return 'prestissimo';
    if (options.priority === 'high') return 'allegro';
    if (options.context === 'architecture') return 'adagio';
    if (options.context === 'strategy') return 'largo';
    return 'andante'; // Default: thoughtful but moving
  }

  /**
   * Get initial dynamics based on input classification
   */
  _getInitialDynamics(classification) {
    const baseDynamics = {
      voiceTranslator: 'f',
      research: 'mp',
      architect: 'mf',
      designer: 'mf',
      storyteller: 'mp',
      code: 'p',
      ethics: 'mf',
      bizDev: 'mp',
      validator: 'p',
    };

    // Adjust based on classification tags
    if (classification.tags?.includes('LEAD')) {
      baseDynamics.bizDev = 'f';
      baseDynamics.storyteller = 'mf';
    }
    if (classification.tags?.includes('ETHIC')) {
      baseDynamics.ethics = 'ff';
      baseDynamics.designer = 'f';
    }
    if (classification.tags?.includes('PRODUCT')) {
      baseDynamics.architect = 'f';
      baseDynamics.designer = 'f';
      baseDynamics.code = 'mf';
    }
    if (classification.tags?.includes('SYSTEM')) {
      baseDynamics.architect = 'ff';
      baseDynamics.code = 'f';
    }

    return baseDynamics;
  }

  /**
   * Group agent outputs into stems
   */
  _groupIntoStems(agentOutputs) {
    return {
      INPUT_STEM: {
        voiceTranslator: agentOutputs.voiceTranslator,
        research: agentOutputs.research,
      },
      CORE_STEM: {
        architect: agentOutputs.architect,
        designer: agentOutputs.designer,
        storyteller: agentOutputs.storyteller,
        code: agentOutputs.code,
      },
      COMPLIANCE_STEM: {
        ethics: agentOutputs.ethics,
      },
      REVENUE_STEM: {
        bizDev: agentOutputs.bizDev,
      },
      VALIDATION_STEM: {
        validator: agentOutputs.validator,
      },
    };
  }

  /**
   * Create final mix from stems
   */
  async _createFinalMix(stems, clickTrack) {
    // Apply stem weights based on classification
    const weights = this._calculateStemWeights(clickTrack);

    return {
      summary: this._extractSummary(stems.INPUT_STEM),
      architecture: stems.CORE_STEM.architect?.content,
      designs: stems.CORE_STEM.designer?.content,
      narrative: stems.CORE_STEM.storyteller?.content,
      implementation: stems.CORE_STEM.code?.content,
      compliance: stems.COMPLIANCE_STEM.ethics?.content,
      revenue: stems.REVENUE_STEM.bizDev?.content,
      validation: stems.VALIDATION_STEM.validator?.content,
      weights,
      qualityScore: this._calculateQualityScore(stems),
    };
  }

  /**
   * Calculate stem weights based on context
   */
  _calculateStemWeights(clickTrack) {
    const base = { input: 1.0, core: 1.0, compliance: 1.0, revenue: 1.0, validation: 1.0 };

    const tags = clickTrack.parsedIntent.tags || [];

    if (tags.includes('LEAD')) base.revenue = 1.3;
    if (tags.includes('ETHIC')) base.compliance = 1.3;
    if (tags.includes('PRODUCT')) base.core = 1.2;

    return base;
  }

  /**
   * Extract summary from input stem
   */
  _extractSummary(inputStem) {
    return {
      classification: inputStem.voiceTranslator?.classification,
      keyInsights: inputStem.voiceTranslator?.keyInsights,
      research: inputStem.research?.findings,
    };
  }

  /**
   * Calculate quality score
   */
  _calculateQualityScore(stems) {
    let score = 0;
    let count = 0;

    Object.values(stems).forEach(stem => {
      Object.values(stem).forEach(output => {
        if (output?.confidence) {
          score += output.confidence;
          count++;
        }
      });
    });

    return count > 0 ? score / count : 0;
  }

  /**
   * Provide high-level artistic direction
   */
  provideArtisticDirection(symphonyId, direction) {
    const symphony = this.symphonies.get(symphonyId);
    if (!symphony) throw new Error(`Symphony ${symphonyId} not found`);

    const multipliers = this.artisticDirections[direction];
    if (!multipliers) throw new Error(`Unknown direction: ${direction}`);

    // Apply direction to click track dynamics
    if (symphony.clickTrack) {
      Object.keys(multipliers).forEach(pillar => {
        // Adjust relevant agent dynamics
        this._adjustDynamicsForPillar(symphony.clickTrack, pillar, multipliers[pillar]);
      });
    }

    symphony.timeline.push({
      event: 'artistic_direction',
      direction,
      timestamp: Date.now(),
    });

    this.emit('conductor:direction', { symphonyId, direction });

    return symphony;
  }

  /**
   * Adjust dynamics for a specific pillar
   */
  _adjustDynamicsForPillar(clickTrack, pillar, multiplier) {
    const pillarAgents = {
      aesthetics: ['designer', 'storyteller'],
      ethics: ['ethics'],
      accessibility: ['ethics', 'designer', 'validator'],
      revenue: ['bizDev', 'strategist'],
    };

    const agents = pillarAgents[pillar] || [];
    agents.forEach(agent => {
      const current = clickTrack.dynamics[agent];
      clickTrack.dynamics[agent] = this._amplifyDynamic(current, multiplier);
    });
  }

  /**
   * Amplify a dynamic level
   */
  _amplifyDynamic(current, multiplier) {
    const levels = ['pp', 'p', 'mp', 'mf', 'f', 'ff'];
    const currentIndex = levels.indexOf(current);
    const newIndex = Math.min(
      levels.length - 1,
      Math.max(0, Math.round(currentIndex * multiplier))
    );
    return levels[newIndex];
  }

  /**
   * Provide specific conductor feedback
   */
  provideConductorFeedback(symphonyId, feedback) {
    const symphony = this.symphonies.get(symphonyId);
    if (!symphony) throw new Error(`Symphony ${symphonyId} not found`);

    symphony.conductorFeedback = symphony.conductorFeedback || [];
    symphony.conductorFeedback.push({
      feedback,
      timestamp: Date.now(),
    });

    // Emit for agents to hear
    if (symphony.clickTrack) {
      symphony.clickTrack.agentSignals.conductor = {
        type: 'feedback',
        message: feedback,
        timestamp: Date.now(),
      };
    }

    this.emit('conductor:feedback', { symphonyId, feedback });

    return symphony;
  }

  /**
   * Emergency conductor override
   */
  emergencyConductorOverride(symphonyId, action) {
    const symphony = this.symphonies.get(symphonyId);
    if (!symphony) throw new Error(`Symphony ${symphonyId} not found`);

    switch (action) {
      case 'pause':
        symphony.status = 'paused';
        this.orchestrationEngine.pauseAll(symphonyId);
        break;
      case 'restart':
        symphony.status = 'restarting';
        symphony.progress = 0;
        // Re-process from beginning
        this.processFounderInput(symphony.input, symphony.inputType, symphony.options);
        break;
      case 'abort':
        symphony.status = 'aborted';
        this.orchestrationEngine.abortAll(symphonyId);
        this.metrics.symphoniesAborted++;
        break;
      default:
        throw new Error(`Unknown override action: ${action}`);
    }

    symphony.timeline.push({
      event: 'emergency_override',
      action,
      timestamp: Date.now(),
    });

    this.emit('conductor:override', { symphonyId, action });

    return symphony;
  }

  /**
   * Get symphony status
   */
  getSymphonyStatus(symphonyId) {
    const symphony = this.symphonies.get(symphonyId);
    if (!symphony) return null;

    return {
      id: symphony.id,
      status: symphony.status,
      progress: symphony.progress,
      currentMovement: symphony.currentMovement,
      timeline: symphony.timeline,
    };
  }

  /**
   * Get orchestra status
   */
  getOrchestraStatus() {
    return {
      activeSymphonies: this.symphonies.size,
      metrics: this.metrics,
      agents: this.orchestrationEngine.getAgentStatus(),
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const completed = this.metrics.symphoniesCompleted;
    const total = completed + this.metrics.symphoniesAborted;

    return {
      ...this.metrics,
      successRate: total > 0 ? (completed / total) * 100 : 0,
      averageProcessingTime: completed > 0
        ? this.metrics.totalProcessingTime / completed
        : 0,
    };
  }

  /**
   * Get conductor's journal
   */
  getConductorJournal(limit = 10) {
    return this.journal.slice(-limit);
  }

  /**
   * Add journal entry
   */
  _addJournalEntry(type, data) {
    this.journal.push({
      type,
      data,
      timestamp: Date.now(),
      reflection: this._generateReflection(type, data),
    });

    // Keep journal manageable
    if (this.journal.length > 100) {
      this.journal = this.journal.slice(-50);
    }
  }

  /**
   * Generate conductor reflection
   */
  _generateReflection(type, data) {
    const reflections = {
      symphony_completed: `Symphony ${data.symphonyId?.slice(0, 8)} completed in ${data.processingTime}ms. The orchestra performed well.`,
      symphony_failed: `Symphony ${data.symphonyId?.slice(0, 8)} failed: ${data.error}. Learning from this for next time.`,
      artistic_direction: `Adjusted artistic direction. The orchestra is responding.`,
    };

    return reflections[type] || `${type}: Noted for the record.`;
  }

  /**
   * Update symphony state
   */
  _updateSymphony(symphonyId, updates) {
    const symphony = this.symphonies.get(symphonyId);
    if (!symphony) return;

    Object.assign(symphony, updates);

    if (updates.currentMovement) {
      symphony.timeline.push({
        event: `movement:${updates.currentMovement}`,
        timestamp: Date.now(),
      });
    }

    this.emit('symphony:updated', { symphonyId, updates });
  }

  /**
   * Setup internal event handlers
   */
  _setupEventHandlers() {
    // Listen for agent signals
    this.orchestrationEngine.on('agent:signal', (signal) => {
      // Propagate to active symphonies
      this.symphonies.forEach((symphony) => {
        if (symphony.clickTrack && symphony.status === 'orchestrating') {
          symphony.clickTrack.agentSignals[signal.agent] = signal;
        }
      });
    });

    // Listen for validation issues
    this.orchestrationEngine.on('validation:issue', (issue) => {
      this._addJournalEntry('validation_issue', issue);
    });
  }
}

export default MasterConductor;
