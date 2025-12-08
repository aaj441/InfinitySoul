/**
 * INFINITYSOUL ORCHESTRA - VOICE MEMO PROCESSOR
 *
 * Translates founder chaos into structured architecture.
 * Like a recording engineer capturing raw performance and
 * preparing it for multi-track processing.
 */

import { EventEmitter } from 'events';

/**
 * @typedef {Object} EmotionalTexture
 * @property {number} urgency - 0-1 scale
 * @property {number} playfulness - 0-1 scale
 * @property {number} contemplation - 0-1 scale
 * @property {number} frustration - 0-1 scale
 * @property {number} excitement - 0-1 scale
 * @property {string[]} crypticInsights - Decoded founder language
 */

/**
 * @typedef {Object} FourPillarArchitecture
 * @property {Object} aesthetics - Design requirements
 * @property {Object} ethics - Privacy and dignity requirements
 * @property {Object} accessibility - WCAG and a11y requirements
 * @property {Object} revenue - Business model requirements
 */

// Founder language translations - the rosetta stone
const FOUNDER_TRANSLATIONS = {
  // Cryptic phrases → Technical meaning
  'lucy feels hungry': {
    meaning: 'Audit engine needs more depth',
    pillars: {
      aesthetics: 'Richer data visualizations',
      accessibility: 'More comprehensive coverage',
      revenue: 'Premium tier feature opportunity',
    },
  },
  'snowfall interface': {
    meaning: 'Minimal, elegant, subtle animations',
    pillars: {
      aesthetics: 'Subtle falling animations, minimal UI',
      accessibility: 'Respect prefers-reduced-motion',
      revenue: 'Premium aesthetic differentiator',
    },
  },
  'nice shit': {
    meaning: 'Production-ready quality, polished',
    pillars: {
      aesthetics: 'Polished, professional, refined',
      ethics: 'Thoughtful, considered design',
      revenue: 'Premium pricing justified',
    },
  },
  'poetic government': {
    meaning: 'WCAG as art, compliance as beauty',
    pillars: {
      aesthetics: 'Compliance as visual feature',
      ethics: 'Accessibility as core value',
      accessibility: 'WCAG AAA as design constraint',
    },
  },
  'church vibes': {
    meaning: 'Welcoming, warm, trustworthy',
    pillars: {
      aesthetics: 'Warm colors, inviting typography',
      ethics: 'Trustworthy, dignified',
      revenue: 'Religious organization targeting',
    },
  },
  'make it feel heavy': {
    meaning: 'Physics-based animations, weight',
    pillars: {
      aesthetics: 'High stiffness springs, gravity feel',
      accessibility: 'Still respect reduced motion',
    },
  },
};

// Emotional texture markers in founder language
const EMOTIONAL_MARKERS = {
  urgency: [
    'asap', 'now', 'immediately', 'urgent', 'quick', 'fast',
    'today', 'need this', 'gotta', 'hurry',
  ],
  playfulness: [
    'fun', 'play', 'vibe', 'cool', 'nice', 'sick', 'dope',
    'wild', 'crazy', 'experiment',
  ],
  contemplation: [
    'thinking', 'wondering', 'maybe', 'could', 'might',
    'what if', 'imagine', 'consider', 'philosophy',
  ],
  frustration: [
    'annoying', 'frustrated', 'broken', 'doesn\'t work',
    'hate', 'terrible', 'awful', 'fix this',
  ],
  excitement: [
    'love', 'amazing', 'perfect', 'exactly', 'yes',
    'brilliant', 'genius', 'breakthrough', '!',
  ],
};

export class VoiceMemoProcessor extends EventEmitter {
  constructor(openaiKey) {
    super();
    this.openaiKey = openaiKey;
    this.processingHistory = [];
  }

  /**
   * Main processing entry point
   *
   * @param {string} input - Voice memo path or text
   * @param {'voice_memo'|'text'} inputType
   * @returns {Promise<Object>} Processed output
   */
  async process(input, inputType) {
    let text;

    if (inputType === 'voice_memo') {
      text = await this._transcribeVoiceMemo(input);
    } else {
      text = input;
    }

    // Clean and normalize
    const cleaned = this._cleanTranscript(text);

    // Analyze emotional texture
    const emotionalTexture = this._analyzeEmotionalTexture(cleaned);

    // Translate founder language
    const translations = this._translateFounderLanguage(cleaned);

    // Classify intent
    const classification = await this._classifyIntent(cleaned, emotionalTexture);

    // Extract raw gold (key insights)
    const keyInsights = this._extractKeyInsights(cleaned, translations);

    // Determine vibe
    const vibe = this._determineVibe(emotionalTexture, translations);

    const result = {
      original: input,
      transcript: text,
      cleaned,
      emotionalTexture,
      translations,
      classification,
      keyInsights,
      vibe,
      timestamp: Date.now(),
    };

    this.processingHistory.push(result);
    this.emit('processed', result);

    return result;
  }

  /**
   * Create architecture across four pillars
   */
  async createArchitecture(processed) {
    const pillars = {
      aesthetics: this._extractAestheticRequirements(processed),
      ethics: this._extractEthicsRequirements(processed),
      accessibility: this._extractAccessibilityRequirements(processed),
      revenue: this._extractRevenueRequirements(processed),
    };

    // Generate tasks for each pillar
    const tasks = this._generateTasks(pillars, processed);

    return {
      pillars,
      tasks,
      priority: this._determinePriority(processed),
      complexity: this._estimateComplexity(pillars),
    };
  }

  /**
   * Transcribe voice memo using Whisper
   */
  async _transcribeVoiceMemo(filePath) {
    // In production, this would call OpenAI Whisper API
    // For now, simulate the transcription
    if (!this.openaiKey) {
      throw new Error('OpenAI API key required for voice memo transcription');
    }

    try {
      const formData = new FormData();
      const fs = await import('fs');
      const audioBuffer = fs.readFileSync(filePath);
      formData.append('file', new Blob([audioBuffer]), 'audio.mp3');
      formData.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiKey}`,
        },
        body: formData,
      });

      const data = await response.json();
      return data.text;
    } catch (error) {
      this.emit('transcription:error', error);
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  /**
   * Clean and normalize transcript
   */
  _cleanTranscript(text) {
    return text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s'.,!?-]/g, '')
      .trim();
  }

  /**
   * Analyze emotional texture of input
   */
  _analyzeEmotionalTexture(text) {
    const texture = {
      urgency: 0,
      playfulness: 0,
      contemplation: 0,
      frustration: 0,
      excitement: 0,
      crypticInsights: [],
    };

    const words = text.toLowerCase().split(/\s+/);
    const totalWords = words.length;

    // Count emotional markers
    Object.entries(EMOTIONAL_MARKERS).forEach(([emotion, markers]) => {
      let count = 0;
      markers.forEach(marker => {
        const regex = new RegExp(marker, 'gi');
        const matches = text.match(regex);
        if (matches) count += matches.length;
      });
      texture[emotion] = Math.min(1, count / Math.max(1, totalWords / 10));
    });

    // Extract cryptic insights (founder-specific language)
    Object.keys(FOUNDER_TRANSLATIONS).forEach(phrase => {
      if (text.includes(phrase)) {
        texture.crypticInsights.push({
          phrase,
          ...FOUNDER_TRANSLATIONS[phrase],
        });
      }
    });

    return texture;
  }

  /**
   * Translate founder language patterns
   */
  _translateFounderLanguage(text) {
    const translations = [];

    Object.entries(FOUNDER_TRANSLATIONS).forEach(([phrase, translation]) => {
      if (text.includes(phrase)) {
        translations.push({
          original: phrase,
          ...translation,
        });
      }
    });

    return translations;
  }

  /**
   * Classify intent of the input
   */
  async _classifyIntent(text, emotionalTexture) {
    const tags = [];
    const signals = [];

    // Check for lead generation signals
    if (this._containsLeadSignals(text)) {
      tags.push('LEAD');
      signals.push('Lead generation opportunity identified');
    }

    // Check for ethics/compliance signals
    if (this._containsEthicsSignals(text)) {
      tags.push('ETHIC');
      signals.push('Ethical/compliance consideration needed');
    }

    // Check for product signals
    if (this._containsProductSignals(text)) {
      tags.push('PRODUCT');
      signals.push('Product feature/design discussion');
    }

    // Check for system/architecture signals
    if (this._containsSystemSignals(text)) {
      tags.push('SYSTEM');
      signals.push('System architecture consideration');
    }

    // Check for brand/story signals
    if (this._containsBrandSignals(text)) {
      tags.push('BRAND_STORY');
      signals.push('Brand narrative opportunity');
    }

    // Check for research signals
    if (this._containsResearchSignals(text)) {
      tags.push('RESEARCH');
      signals.push('Research/investigation needed');
    }

    return {
      tags,
      signals,
      primaryIntent: tags[0] || 'GENERAL',
      confidence: this._calculateClassificationConfidence(tags, text),
    };
  }

  /**
   * Check for lead generation signals
   */
  _containsLeadSignals(text) {
    const leadTerms = [
      'church', 'medical', 'law firm', 'legal', 'hospital',
      'clinic', 'nonprofit', 'business', 'company', 'client',
      'customer', 'sell', 'pitch', 'outreach', 'cold email',
    ];
    return leadTerms.some(term => text.includes(term));
  }

  /**
   * Check for ethics/compliance signals
   */
  _containsEthicsSignals(text) {
    const ethicsTerms = [
      'wcag', 'accessible', 'accessibility', 'ada', 'compliance',
      'screen reader', 'blind', 'deaf', 'disability', 'inclusive',
      'ethical', 'privacy', 'consent', 'dignity',
    ];
    return ethicsTerms.some(term => text.includes(term));
  }

  /**
   * Check for product signals
   */
  _containsProductSignals(text) {
    const productTerms = [
      'feature', 'design', 'ui', 'ux', 'interface', 'button',
      'page', 'flow', 'component', 'animation', 'visual',
      'user experience', 'dashboard', 'report',
    ];
    return productTerms.some(term => text.includes(term));
  }

  /**
   * Check for system signals
   */
  _containsSystemSignals(text) {
    const systemTerms = [
      'database', 'api', 'backend', 'server', 'architecture',
      'schema', 'model', 'integration', 'performance', 'scale',
      'infrastructure', 'deploy',
    ];
    return systemTerms.some(term => text.includes(term));
  }

  /**
   * Check for brand signals
   */
  _containsBrandSignals(text) {
    const brandTerms = [
      'story', 'narrative', 'message', 'copy', 'voice',
      'brand', 'tone', 'feel', 'vibe', 'emotion',
      'linkedin', 'post', 'content', 'marketing',
    ];
    return brandTerms.some(term => text.includes(term));
  }

  /**
   * Check for research signals
   */
  _containsResearchSignals(text) {
    const researchTerms = [
      'research', 'find out', 'investigate', 'look into',
      'what is', 'how does', 'compare', 'analyze', 'study',
      'data', 'statistics', 'market',
    ];
    return researchTerms.some(term => text.includes(term));
  }

  /**
   * Calculate classification confidence
   */
  _calculateClassificationConfidence(tags, text) {
    if (tags.length === 0) return 0.3;
    if (tags.length === 1) return 0.8;
    if (tags.length > 1) return 0.7; // Multiple signals reduce confidence
    return 0.5;
  }

  /**
   * Extract key insights from processed input
   */
  _extractKeyInsights(text, translations) {
    const insights = [];

    // Extract from translations
    translations.forEach(t => {
      insights.push({
        type: 'founder_language',
        content: t.meaning,
        source: t.original,
      });
    });

    // Extract question patterns
    const questions = text.match(/[^.!?]*\?/g) || [];
    questions.forEach(q => {
      insights.push({
        type: 'question',
        content: q.trim(),
        source: 'direct_question',
      });
    });

    // Extract action items (things starting with "need to", "should", etc.)
    const actionPatterns = text.match(/(need to|should|must|have to|gotta|want to)[^.!?]*/gi) || [];
    actionPatterns.forEach(action => {
      insights.push({
        type: 'action_item',
        content: action.trim(),
        source: 'action_pattern',
      });
    });

    return insights;
  }

  /**
   * Determine overall vibe
   */
  _determineVibe(emotionalTexture, translations) {
    // Find dominant emotion
    const emotions = ['urgency', 'playfulness', 'contemplation', 'frustration', 'excitement'];
    let dominant = 'neutral';
    let maxScore = 0;

    emotions.forEach(emotion => {
      if (emotionalTexture[emotion] > maxScore) {
        maxScore = emotionalTexture[emotion];
        dominant = emotion;
      }
    });

    // Map to vibe description
    const vibeMap = {
      urgency: 'urgent and focused',
      playfulness: 'experimental and creative',
      contemplation: 'thoughtful and exploratory',
      frustration: 'problem-solving mode',
      excitement: 'enthusiastic and energized',
      neutral: 'balanced and steady',
    };

    return {
      dominant,
      score: maxScore,
      description: vibeMap[dominant],
      hasFounderLanguage: translations.length > 0,
    };
  }

  /**
   * Extract aesthetic requirements
   */
  _extractAestheticRequirements(processed) {
    const requirements = {
      priority: 'medium',
      items: [],
    };

    // From translations
    processed.translations.forEach(t => {
      if (t.pillars?.aesthetics) {
        requirements.items.push({
          source: 'founder_language',
          requirement: t.pillars.aesthetics,
        });
      }
    });

    // From emotional texture
    if (processed.emotionalTexture.playfulness > 0.5) {
      requirements.items.push({
        source: 'emotional_texture',
        requirement: 'Playful, experimental visual language',
      });
    }

    if (processed.classification.tags.includes('PRODUCT')) {
      requirements.priority = 'high';
    }

    return requirements;
  }

  /**
   * Extract ethics requirements
   */
  _extractEthicsRequirements(processed) {
    const requirements = {
      priority: 'high', // Ethics always high priority
      items: [],
    };

    // From translations
    processed.translations.forEach(t => {
      if (t.pillars?.ethics) {
        requirements.items.push({
          source: 'founder_language',
          requirement: t.pillars.ethics,
        });
      }
    });

    // Always include baseline
    requirements.items.push({
      source: 'baseline',
      requirement: 'Maintain human dignity in all interactions',
    });

    if (processed.classification.tags.includes('ETHIC')) {
      requirements.priority = 'critical';
    }

    return requirements;
  }

  /**
   * Extract accessibility requirements
   */
  _extractAccessibilityRequirements(processed) {
    const requirements = {
      priority: 'high', // Accessibility always high priority
      items: [],
    };

    // From translations
    processed.translations.forEach(t => {
      if (t.pillars?.accessibility) {
        requirements.items.push({
          source: 'founder_language',
          requirement: t.pillars.accessibility,
        });
      }
    });

    // Always include WCAG AAA baseline
    requirements.items.push({
      source: 'baseline',
      requirement: 'WCAG AAA compliance',
    });
    requirements.items.push({
      source: 'baseline',
      requirement: 'Screen reader compatibility',
    });
    requirements.items.push({
      source: 'baseline',
      requirement: 'Keyboard navigation',
    });

    return requirements;
  }

  /**
   * Extract revenue requirements
   */
  _extractRevenueRequirements(processed) {
    const requirements = {
      priority: 'medium',
      items: [],
    };

    // From translations
    processed.translations.forEach(t => {
      if (t.pillars?.revenue) {
        requirements.items.push({
          source: 'founder_language',
          requirement: t.pillars.revenue,
        });
      }
    });

    if (processed.classification.tags.includes('LEAD')) {
      requirements.priority = 'high';
      requirements.items.push({
        source: 'classification',
        requirement: 'Lead generation opportunity to pursue',
      });
    }

    return requirements;
  }

  /**
   * Generate tasks for each pillar
   */
  _generateTasks(pillars, processed) {
    const tasks = [];

    Object.entries(pillars).forEach(([pillar, requirements]) => {
      requirements.items.forEach((item, index) => {
        tasks.push({
          id: `${pillar}-${index}`,
          pillar,
          description: item.requirement,
          priority: requirements.priority,
          source: item.source,
          assignedAgents: this._determineAgentsForTask(pillar, item),
        });
      });
    });

    return tasks;
  }

  /**
   * Determine which agents should handle a task
   */
  _determineAgentsForTask(pillar, item) {
    const pillarAgents = {
      aesthetics: ['designer', 'storyteller'],
      ethics: ['ethics', 'validator'],
      accessibility: ['ethics', 'designer', 'validator', 'code'],
      revenue: ['bizDev', 'strategist', 'storyteller'],
    };

    return pillarAgents[pillar] || ['architect'];
  }

  /**
   * Determine overall priority
   */
  _determinePriority(processed) {
    if (processed.emotionalTexture.urgency > 0.7) return 'urgent';
    if (processed.classification.tags.includes('ETHIC')) return 'high';
    if (processed.emotionalTexture.frustration > 0.5) return 'high';
    return 'normal';
  }

  /**
   * Estimate complexity of the architecture
   */
  _estimateComplexity(pillars) {
    let totalItems = 0;
    let criticalCount = 0;

    Object.values(pillars).forEach(pillar => {
      totalItems += pillar.items.length;
      if (pillar.priority === 'critical' || pillar.priority === 'high') {
        criticalCount += pillar.items.length;
      }
    });

    if (totalItems > 10 || criticalCount > 5) return 'high';
    if (totalItems > 5 || criticalCount > 2) return 'medium';
    return 'low';
  }
}

export default VoiceMemoProcessor;
