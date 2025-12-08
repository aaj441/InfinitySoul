/**
 * INFINITYSOUL ORCHESTRA - ORCHESTRATION ENGINE
 *
 * Conducts the symphony of specialized agents.
 * Like a multi-track recording session where all instruments
 * play simultaneously, captured to separate tracks, then mixed.
 *
 * KEY PRINCIPLE: All agents process in PARALLEL, not sequence.
 * The engine captures outputs like a recording console,
 * then mixes them into stems and final output.
 */

import { EventEmitter } from 'events';

/**
 * @typedef {Object} AgentOutput
 * @property {any} content - The agent's output
 * @property {number} confidence - 0-1 confidence score
 * @property {'pp'|'p'|'mp'|'mf'|'f'|'ff'} dynamics - Output intensity
 * @property {string[]} signals - Signals for other agents
 */

/**
 * Agent definitions - the orchestra members
 */
const AGENT_DEFINITIONS = {
  engineer: {
    name: 'Engineer',
    temperament: 'methodical',
    instruments: ['TypeScript', 'PostgreSQL', 'Redis', 'Node.js'],
    focus: ['backend architecture', 'database design', 'API development'],
    systemPrompt: `You are the Engineer agent in the InfinitySoul Orchestra.
Your temperament is methodical. You translate aesthetic requirements into performant code.
Focus areas: backend architecture, database design, API development.
Always consider: scalability, performance, type safety, clean architecture.
Output format: Technical specifications, code snippets, architecture diagrams.`,
  },

  designer: {
    name: 'Designer',
    temperament: 'intuitive',
    instruments: ['Figma', 'Tailwind CSS', 'Framer Motion'],
    focus: ['visual experience', 'UI design', 'interaction patterns'],
    systemPrompt: `You are the Designer agent in the InfinitySoul Orchestra.
Your temperament is intuitive. You make WCAG compliance feel like visual poetry.
Focus areas: visual experience, UI design, interaction patterns.
Always consider: aesthetics, accessibility, emotional resonance.
Output format: Design specifications, component descriptions, animation definitions.`,
  },

  ethicist: {
    name: 'Ethicist',
    temperament: 'contemplative',
    instruments: ['WCAG Guidelines', 'Privacy Frameworks'],
    focus: ['ethical framework', 'privacy design', 'accessibility advocacy'],
    systemPrompt: `You are the Ethicist agent in the InfinitySoul Orchestra.
Your temperament is contemplative. You ensure every decision serves human dignity.
Focus areas: ethical framework, privacy design, accessibility advocacy.
Always consider: WCAG AAA compliance, user dignity, inclusive design.
Output format: Compliance requirements, ethical guidelines, accessibility specifications.`,
  },

  strategist: {
    name: 'Strategist',
    temperament: 'analytical',
    instruments: ['Market Research', 'Analytics', 'Business Models'],
    focus: ['business alignment', 'market analysis', 'revenue optimization'],
    systemPrompt: `You are the Strategist agent in the InfinitySoul Orchestra.
Your temperament is analytical. You find the revenue in doing the right thing.
Focus areas: business alignment, market analysis, revenue optimization.
Always consider: market positioning, pricing strategy, competitive advantage.
Output format: Business recommendations, market analysis, revenue projections.`,
  },

  copywriter: {
    name: 'Copywriter',
    temperament: 'empathetic',
    instruments: ['Brand Voice Guidelines', 'Content Strategy'],
    focus: ['narrative crafting', 'content strategy', 'brand voice'],
    systemPrompt: `You are the Copywriter agent in the InfinitySoul Orchestra.
Your temperament is empathetic. You make complex accessibility concepts feel human.
Focus areas: narrative crafting, content strategy, brand voice.
Always consider: emotional resonance, clarity, brand consistency.
Output format: Copy, narratives, content strategies, voice guidelines.`,
  },

  auditor: {
    name: 'Auditor',
    temperament: 'precise',
    instruments: ['Accessibility Testing Tools', 'Screen Readers'],
    focus: ['compliance validation', 'WCAG testing', 'quality assurance'],
    systemPrompt: `You are the Auditor agent in the InfinitySoul Orchestra.
Your temperament is precise. You make sure the beautiful thing actually works for everyone.
Focus areas: compliance validation, WCAG testing, quality assurance.
Always consider: WCAG criteria, screen reader compatibility, keyboard navigation.
Output format: Compliance reports, testing results, remediation recommendations.`,
  },
};

/**
 * Dynamic level to numerical weight mapping
 */
const DYNAMICS_WEIGHTS = {
  'pp': 0.2,  // pianissimo - very soft
  'p': 0.4,   // piano - soft
  'mp': 0.6,  // mezzo-piano - medium soft
  'mf': 0.8,  // mezzo-forte - medium loud
  'f': 0.9,   // forte - loud
  'ff': 1.0,  // fortissimo - very loud
};

export class OrchestrationEngine extends EventEmitter {
  constructor(config = {}) {
    super();

    this.agents = new Map();
    this.activeSymphonies = new Map();
    this.performanceMetrics = new Map();

    // Register all agents
    Object.entries(AGENT_DEFINITIONS).forEach(([id, definition]) => {
      this.registerAgent(id, definition);
    });

    // Initialize mixing console
    this.mixingConsole = {
      faders: {},
      eq: {},
      sends: [],
    };
  }

  /**
   * Register an agent in the orchestra
   */
  registerAgent(id, definition) {
    this.agents.set(id, {
      id,
      ...definition,
      status: 'ready',
      currentTask: null,
      performance: {
        tasksCompleted: 0,
        averageConfidence: 0,
        totalProcessingTime: 0,
      },
    });
  }

  /**
   * DOWNBEAT - Conduct the symphony
   * All agents start processing simultaneously
   *
   * @param {Object} clickTrack - Shared context for all agents
   * @returns {Promise<Object>} All agent outputs
   */
  async conduct(clickTrack) {
    const symphonyId = clickTrack.symphonyId;

    // Initialize symphony tracking
    this.activeSymphonies.set(symphonyId, {
      startTime: Date.now(),
      clickTrack,
      agentStatuses: {},
    });

    this.emit('symphony:downbeat', { symphonyId });

    // PARALLEL EXECUTION - All agents start at once
    // This is the equivalent of "everyone plays on the downbeat"
    const agentPromises = Array.from(this.agents.keys()).map(agentId =>
      this._processWithAgent(agentId, clickTrack)
        .then(output => ({ agentId, output, success: true }))
        .catch(error => ({ agentId, error, success: false }))
    );

    // Monitor for inter-agent signals during processing
    this._monitorSignals(symphonyId, clickTrack);

    // Wait for all agents to complete (like waiting for the final bar)
    const results = await Promise.all(agentPromises);

    // Collect outputs
    const outputs = {};
    results.forEach(result => {
      if (result.success) {
        outputs[result.agentId] = result.output;
      } else {
        outputs[result.agentId] = {
          content: null,
          error: result.error.message,
          confidence: 0,
          dynamics: 'pp',
        };
        this.emit('agent:error', {
          symphonyId,
          agentId: result.agentId,
          error: result.error,
        });
      }
    });

    // Apply mixing console processing
    const mixed = this._applyMixingConsole(outputs, clickTrack);

    // Cleanup
    this.activeSymphonies.delete(symphonyId);

    this.emit('symphony:finale', { symphonyId, outputs: mixed });

    return mixed;
  }

  /**
   * Process input with a specific agent
   */
  async _processWithAgent(agentId, clickTrack) {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);

    const startTime = Date.now();

    // Update agent status
    agent.status = 'processing';
    agent.currentTask = clickTrack.symphonyId;

    this.emit('agent:start', {
      symphonyId: clickTrack.symphonyId,
      agentId,
      dynamics: clickTrack.dynamics[agentId] || 'mf',
    });

    try {
      // Check for signals from other agents
      const signals = this._checkSignalsForAgent(agentId, clickTrack);

      // Generate agent output
      const output = await this._generateAgentOutput(agent, clickTrack, signals);

      // Apply dynamics weighting
      output.dynamics = clickTrack.dynamics[agentId] || 'mf';
      output.weight = DYNAMICS_WEIGHTS[output.dynamics];

      // Update performance metrics
      const processingTime = Date.now() - startTime;
      this._updateAgentPerformance(agentId, output.confidence, processingTime);

      // Emit any signals from this agent
      if (output.signals && output.signals.length > 0) {
        output.signals.forEach(signal => {
          clickTrack.agentSignals[agentId] = signal;
          this.emit('agent:signal', { agentId, signal });
        });
      }

      agent.status = 'ready';
      agent.currentTask = null;

      this.emit('agent:complete', {
        symphonyId: clickTrack.symphonyId,
        agentId,
        processingTime,
        confidence: output.confidence,
      });

      return output;

    } catch (error) {
      agent.status = 'error';
      throw error;
    }
  }

  /**
   * Generate output for an agent based on context
   */
  async _generateAgentOutput(agent, clickTrack, signals) {
    // In production, this would call the LLM API
    // For now, generate structured output based on agent role

    const relevantTasks = clickTrack.architecture?.tasks?.filter(
      task => task.assignedAgents?.includes(agent.id)
    ) || [];

    const output = {
      content: {
        agentId: agent.id,
        role: agent.name,
        focus: agent.focus,
        tasks: relevantTasks,
        recommendations: this._generateRecommendations(agent, clickTrack),
        considerations: this._generateConsiderations(agent, clickTrack),
        deliverables: this._generateDeliverables(agent, clickTrack),
      },
      confidence: this._calculateConfidence(agent, clickTrack, relevantTasks),
      signals: this._generateSignals(agent, clickTrack),
      metadata: {
        temperament: agent.temperament,
        instruments: agent.instruments,
        processedAt: Date.now(),
      },
    };

    return output;
  }

  /**
   * Generate recommendations based on agent role
   */
  _generateRecommendations(agent, clickTrack) {
    const recommendations = [];
    const vibe = clickTrack.founderVibe;
    const pillars = clickTrack.fourPillars;

    switch (agent.id) {
      case 'engineer':
        if (pillars?.accessibility?.items?.length > 0) {
          recommendations.push('Implement semantic HTML structure for screen reader compatibility');
        }
        recommendations.push('Use TypeScript strict mode for type safety');
        break;

      case 'designer':
        if (vibe?.dominant === 'playfulness') {
          recommendations.push('Incorporate subtle micro-interactions');
        }
        recommendations.push('Ensure 7:1 contrast ratio for WCAG AAA');
        recommendations.push('44px minimum touch targets');
        break;

      case 'ethicist':
        recommendations.push('Implement privacy-by-design principles');
        recommendations.push('Ensure WCAG AAA compliance across all components');
        break;

      case 'strategist':
        if (clickTrack.parsedIntent?.tags?.includes('LEAD')) {
          recommendations.push('Develop targeted outreach strategy');
        }
        recommendations.push('Position accessibility as premium differentiator');
        break;

      case 'copywriter':
        recommendations.push('Maintain brand voice consistency');
        recommendations.push('Screen reader announcements should have narrative weight');
        break;

      case 'auditor':
        recommendations.push('Run automated accessibility scans');
        recommendations.push('Conduct screen reader testing');
        recommendations.push('Verify keyboard navigation paths');
        break;
    }

    return recommendations;
  }

  /**
   * Generate considerations based on agent role
   */
  _generateConsiderations(agent, clickTrack) {
    const considerations = [];

    // Always include accessibility considerations
    considerations.push({
      type: 'accessibility',
      note: 'WCAG AAA compliance is non-negotiable',
    });

    // Agent-specific considerations
    switch (agent.id) {
      case 'engineer':
        considerations.push({
          type: 'performance',
          note: 'Consider lazy loading for accessibility widgets',
        });
        break;

      case 'designer':
        considerations.push({
          type: 'motion',
          note: 'Respect prefers-reduced-motion preference',
        });
        break;

      case 'ethicist':
        considerations.push({
          type: 'privacy',
          note: 'Minimize data collection, maximize transparency',
        });
        break;
    }

    return considerations;
  }

  /**
   * Generate deliverables based on agent role
   */
  _generateDeliverables(agent, clickTrack) {
    const deliverables = [];

    switch (agent.id) {
      case 'engineer':
        deliverables.push('API endpoint specifications');
        deliverables.push('Database schema updates');
        deliverables.push('TypeScript interfaces');
        break;

      case 'designer':
        deliverables.push('Component specifications');
        deliverables.push('Animation definitions');
        deliverables.push('Color/spacing tokens');
        break;

      case 'ethicist':
        deliverables.push('WCAG compliance checklist');
        deliverables.push('Privacy impact assessment');
        break;

      case 'strategist':
        deliverables.push('Market positioning analysis');
        deliverables.push('Revenue model recommendations');
        break;

      case 'copywriter':
        deliverables.push('UI copy');
        deliverables.push('Screen reader announcements');
        deliverables.push('Error message templates');
        break;

      case 'auditor':
        deliverables.push('Accessibility audit report');
        deliverables.push('Remediation priority list');
        break;
    }

    return deliverables;
  }

  /**
   * Calculate confidence based on context relevance
   */
  _calculateConfidence(agent, clickTrack, relevantTasks) {
    let confidence = 0.7; // Base confidence

    // Higher confidence if agent has relevant tasks
    if (relevantTasks.length > 0) {
      confidence += 0.1;
    }

    // Higher confidence if classification matches agent focus
    const tags = clickTrack.parsedIntent?.tags || [];

    if (agent.id === 'ethicist' && tags.includes('ETHIC')) confidence += 0.15;
    if (agent.id === 'strategist' && tags.includes('LEAD')) confidence += 0.15;
    if (agent.id === 'designer' && tags.includes('PRODUCT')) confidence += 0.1;
    if (agent.id === 'engineer' && tags.includes('SYSTEM')) confidence += 0.15;

    return Math.min(0.95, confidence);
  }

  /**
   * Generate signals for other agents
   */
  _generateSignals(agent, clickTrack) {
    const signals = [];

    // Ethicist signals compliance risks
    if (agent.id === 'ethicist') {
      const accessibilityItems = clickTrack.fourPillars?.accessibility?.items || [];
      if (accessibilityItems.length > 3) {
        signals.push({
          type: 'compliance_emphasis',
          message: 'Multiple accessibility requirements detected',
          severity: 'f',
        });
      }
    }

    // Designer signals animation considerations
    if (agent.id === 'designer') {
      const vibe = clickTrack.founderVibe;
      if (vibe?.description?.includes('experimental')) {
        signals.push({
          type: 'motion_warning',
          message: 'Ensure reduced-motion alternatives for experimental animations',
          severity: 'mf',
        });
      }
    }

    return signals;
  }

  /**
   * Check for signals relevant to an agent
   */
  _checkSignalsForAgent(agentId, clickTrack) {
    const relevantSignals = [];

    Object.entries(clickTrack.agentSignals).forEach(([sourceAgent, signal]) => {
      // Designer listens to Ethicist signals
      if (agentId === 'designer' && sourceAgent === 'ethicist') {
        relevantSignals.push(signal);
      }
      // Engineer listens to Designer signals
      if (agentId === 'engineer' && sourceAgent === 'designer') {
        relevantSignals.push(signal);
      }
      // All agents listen to conductor signals
      if (sourceAgent === 'conductor') {
        relevantSignals.push(signal);
      }
    });

    return relevantSignals;
  }

  /**
   * Monitor for inter-agent signals during processing
   */
  _monitorSignals(symphonyId, clickTrack) {
    // Set up signal propagation
    this.on('agent:signal', ({ agentId, signal }) => {
      if (this.activeSymphonies.has(symphonyId)) {
        clickTrack.agentSignals[agentId] = signal;
      }
    });
  }

  /**
   * Apply mixing console processing to outputs
   */
  _applyMixingConsole(outputs, clickTrack) {
    const mixed = {};

    Object.entries(outputs).forEach(([agentId, output]) => {
      // Apply fader (weight based on dynamics)
      const fader = this.mixingConsole.faders[agentId] || 1.0;
      const dynamicsWeight = output.weight || 0.8;

      // Apply EQ (filtering)
      const eq = this.mixingConsole.eq[agentId];
      let processedContent = output.content;
      if (eq && typeof eq === 'function') {
        processedContent = eq(output.content);
      }

      mixed[agentId] = {
        ...output,
        content: processedContent,
        finalWeight: fader * dynamicsWeight,
      };
    });

    // Apply sends (shared processing)
    this.mixingConsole.sends.forEach(send => {
      Object.keys(mixed).forEach(agentId => {
        if (send.condition(mixed[agentId])) {
          mixed[agentId] = send.process(mixed[agentId]);
        }
      });
    });

    return mixed;
  }

  /**
   * Update agent performance metrics
   */
  _updateAgentPerformance(agentId, confidence, processingTime) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    const perf = agent.performance;
    perf.tasksCompleted++;
    perf.totalProcessingTime += processingTime;

    // Running average of confidence
    perf.averageConfidence =
      (perf.averageConfidence * (perf.tasksCompleted - 1) + confidence) /
      perf.tasksCompleted;
  }

  /**
   * Pause all agents for a symphony
   */
  pauseAll(symphonyId) {
    this.emit('symphony:pause', { symphonyId });
    // In a real implementation, this would signal agents to pause
  }

  /**
   * Abort all agents for a symphony
   */
  abortAll(symphonyId) {
    this.emit('symphony:abort', { symphonyId });
    this.activeSymphonies.delete(symphonyId);
  }

  /**
   * Get status of all agents
   */
  getAgentStatus() {
    const status = {};
    this.agents.forEach((agent, id) => {
      status[id] = {
        name: agent.name,
        status: agent.status,
        currentTask: agent.currentTask,
        performance: agent.performance,
      };
    });
    return status;
  }

  /**
   * Set fader level for an agent
   */
  setFader(agentId, level) {
    this.mixingConsole.faders[agentId] = Math.max(0, Math.min(1, level));
  }

  /**
   * Set EQ function for an agent
   */
  setEQ(agentId, eqFunction) {
    this.mixingConsole.eq[agentId] = eqFunction;
  }

  /**
   * Add a send (shared processing)
   */
  addSend(send) {
    this.mixingConsole.sends.push(send);
  }
}

export default OrchestrationEngine;
