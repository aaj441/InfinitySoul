/**
 * MUSIC GENOME FOR RISK
 * ======================
 *
 * "Pandora mapped music to 450 attributes. We map music to risk factors."
 *
 * This module creates a risk profile from musical characteristics. Just as
 * Pandora's Music Genome Project breaks songs into hundreds of musical
 * attributes (melody, harmony, rhythm, instrumentation, vocal style),
 * we map those same attributes to psychological and behavioral risk factors.
 *
 * The Science:
 * ------------
 * Research shows strong correlations between music preferences and:
 * - Big Five personality traits (OCEAN)
 * - Risk tolerance and sensation seeking
 * - Emotional regulation strategies
 * - Decision-making patterns
 * - Social orientation and trust
 *
 * A person who listens to complex, unpredictable music may tolerate
 * ambiguity better. Someone drawn to aggressive music may have higher
 * risk tolerance. Someone who prefers nostalgic music may be more
 * loss-averse.
 *
 * @author InfinitySoul Soul Fingerprint Engine
 * @version 1.0.0
 */

// =============================================================================
// MUSIC GENOME ATTRIBUTES
// =============================================================================

/**
 * The 50 core musical attributes we track, inspired by Pandora's approach
 * but mapped to risk-relevant dimensions
 */
export interface MusicGenome {
  // === STRUCTURAL ATTRIBUTES ===
  tempo: number;                    // BPM, 0-250
  tempoVariability: number;         // 0-1, how much tempo changes
  timeSignatureComplexity: number;  // 0-1, 4/4 = 0, odd meters = higher
  songLength: number;               // seconds
  structuralPredictability: number; // 0-1, verse-chorus = 1, through-composed = 0

  // === HARMONIC ATTRIBUTES ===
  key: string;                      // e.g., "C major", "A minor"
  mode: 'major' | 'minor' | 'modal' | 'atonal';
  harmonicComplexity: number;       // 0-1, simple chords to jazz/classical complexity
  dissonanceLevel: number;          // 0-1, consonant to dissonant
  chromaticism: number;             // 0-1, diatonic to chromatic

  // === MELODIC ATTRIBUTES ===
  melodicRange: number;             // 0-1, narrow to wide vocal/lead range
  melodicContour: 'ascending' | 'descending' | 'static' | 'varied';
  melodicComplexity: number;        // 0-1, simple to ornate
  hookStrength: number;             // 0-1, how memorable/catchy

  // === RHYTHMIC ATTRIBUTES ===
  rhythmicDensity: number;          // 0-1, sparse to dense
  syncopation: number;              // 0-1, on-beat to highly syncopated
  groove: number;                   // 0-1, stiff to groovy
  polyrhythmicComplexity: number;   // 0-1, simple to layered rhythms

  // === TIMBRAL ATTRIBUTES ===
  brightness: number;               // 0-1, dark to bright frequency spectrum
  warmth: number;                   // 0-1, cold/clinical to warm/organic
  density: number;                  // 0-1, sparse to wall-of-sound
  organicVsSynthetic: number;       // 0-1, acoustic to electronic

  // === DYNAMIC ATTRIBUTES ===
  dynamicRange: number;             // 0-1, compressed to wide dynamics
  buildIntensity: number;           // 0-1, static to dramatic builds
  releasePattern: number;           // 0-1, sudden drops to gradual releases
  overallEnergy: number;            // 0-1, calm to intense

  // === VOCAL ATTRIBUTES ===
  vocalPresence: number;            // 0-1, instrumental to vocal-dominant
  vocalStyle: 'clean' | 'breathy' | 'raspy' | 'falsetto' | 'spoken' | 'mixed';
  vocalEmotionality: number;        // 0-1, detached to emotionally intense
  lyricDensity: number;             // 0-1, few words to verbose
  lyricAbstractness: number;        // 0-1, literal/narrative to abstract/poetic

  // === EMOTIONAL ATTRIBUTES ===
  valence: number;                  // 0-1, negative/sad to positive/happy
  arousal: number;                  // 0-1, calm to excited
  tension: number;                  // 0-1, relaxed to tense
  nostalgia: number;                // 0-1, present-focused to nostalgic
  spirituality: number;             // 0-1, secular to spiritual/transcendent

  // === PRODUCTION ATTRIBUTES ===
  productionEra: string;            // e.g., "2010s indie", "1970s analog"
  productionPolish: number;         // 0-1, lo-fi to pristine
  spatialWidth: number;             // 0-1, mono/narrow to wide stereo
  reverbAmount: number;             // 0-1, dry to cavernous
  experimentalism: number;          // 0-1, conventional to avant-garde

  // === CULTURAL ATTRIBUTES ===
  genrePurity: number;              // 0-1, genre-blending to pure genre
  mainstreamness: number;           // 0-1, underground to mainstream
  culturalSpecificity: number;      // 0-1, universal to culturally specific
  temporalAnchoring: number;        // 0-1, timeless to era-specific
}

// =============================================================================
// RISK FACTOR MAPPINGS
// =============================================================================

/**
 * Risk factors derived from musical preferences
 */
export interface MusicRiskFactors {
  // === PERSONALITY-LINKED RISK FACTORS ===
  openness: number;                 // Openness to experience (Big Five)
  conscientiousness: number;        // (Big Five)
  extraversion: number;             // (Big Five)
  agreeableness: number;            // (Big Five)
  neuroticism: number;              // (Big Five)

  // === BEHAVIORAL RISK FACTORS ===
  sensationSeeking: number;         // Tendency to seek novel/intense experiences
  riskTolerance: number;            // Willingness to take risks
  delayedGratification: number;     // Ability to wait for rewards
  impulsivity: number;              // Tendency for impulsive decisions
  ambiguityTolerance: number;       // Comfort with uncertainty

  // === EMOTIONAL RISK FACTORS ===
  emotionalStability: number;       // Resilience to emotional disruption
  stressResponse: number;           // How one handles stress (0=avoidant, 1=engaged)
  emotionalRegulation: number;      // Ability to manage emotions
  anxietyProneness: number;         // Tendency toward anxiety
  depressionVulnerability: number;  // Vulnerability to depression

  // === SOCIAL RISK FACTORS ===
  socialTrust: number;              // Trust in others
  conformity: number;               // Tendency to follow social norms
  leadershipOrientation: number;    // Preference for leading vs following
  competitiveness: number;          // Drive to compete

  // === COGNITIVE RISK FACTORS ===
  analyticalThinking: number;       // Preference for analysis vs intuition
  creativityOrientation: number;    // Creative vs conventional thinking
  attentionSpan: number;            // Sustained attention capability
  complexityPreference: number;     // Preference for complex vs simple

  // === TEMPORAL RISK FACTORS ===
  futureOrientation: number;        // Focus on future vs present
  nostalgiaAffinity: number;        // Attachment to the past
  changeAdaptability: number;       // Ability to adapt to change

  // === MORTALITY/EXISTENTIAL FACTORS ===
  mortalitySalience: number;        // Awareness of mortality
  meaningOrientation: number;       // Need for meaning/purpose
  transcendenceOrientation: number; // Spiritual/transcendent orientation
}

/**
 * Mapping rules from genome to risk factors
 */
export const GENOME_TO_RISK_MAPPINGS: Array<{
  riskFactor: keyof MusicRiskFactors;
  contributors: Array<{
    genomeAttribute: keyof MusicGenome;
    weight: number;
    transform?: 'linear' | 'inverse' | 'quadratic' | 'sigmoid';
  }>;
}> = [
  // Openness = complexity + experimentalism + genre diversity
  {
    riskFactor: 'openness',
    contributors: [
      { genomeAttribute: 'harmonicComplexity', weight: 0.2 },
      { genomeAttribute: 'experimentalism', weight: 0.25 },
      { genomeAttribute: 'genrePurity', weight: 0.15, transform: 'inverse' },
      { genomeAttribute: 'lyricAbstractness', weight: 0.15 },
      { genomeAttribute: 'timeSignatureComplexity', weight: 0.1 },
      { genomeAttribute: 'melodicComplexity', weight: 0.15 }
    ]
  },

  // Conscientiousness = structure + predictability + polish
  {
    riskFactor: 'conscientiousness',
    contributors: [
      { genomeAttribute: 'structuralPredictability', weight: 0.25 },
      { genomeAttribute: 'productionPolish', weight: 0.2 },
      { genomeAttribute: 'tempoVariability', weight: 0.15, transform: 'inverse' },
      { genomeAttribute: 'groove', weight: 0.2 },
      { genomeAttribute: 'hookStrength', weight: 0.2 }
    ]
  },

  // Extraversion = energy + brightness + mainstream
  {
    riskFactor: 'extraversion',
    contributors: [
      { genomeAttribute: 'overallEnergy', weight: 0.25 },
      { genomeAttribute: 'brightness', weight: 0.15 },
      { genomeAttribute: 'mainstreamness', weight: 0.2 },
      { genomeAttribute: 'vocalPresence', weight: 0.15 },
      { genomeAttribute: 'arousal', weight: 0.25 }
    ]
  },

  // Agreeableness = warmth + consonance + positive valence
  {
    riskFactor: 'agreeableness',
    contributors: [
      { genomeAttribute: 'warmth', weight: 0.25 },
      { genomeAttribute: 'dissonanceLevel', weight: 0.2, transform: 'inverse' },
      { genomeAttribute: 'valence', weight: 0.25 },
      { genomeAttribute: 'vocalEmotionality', weight: 0.15 },
      { genomeAttribute: 'tension', weight: 0.15, transform: 'inverse' }
    ]
  },

  // Neuroticism = tension + minor mode + emotional intensity
  {
    riskFactor: 'neuroticism',
    contributors: [
      { genomeAttribute: 'tension', weight: 0.25 },
      { genomeAttribute: 'valence', weight: 0.25, transform: 'inverse' },
      { genomeAttribute: 'vocalEmotionality', weight: 0.2 },
      { genomeAttribute: 'dynamicRange', weight: 0.15 },
      { genomeAttribute: 'dissonanceLevel', weight: 0.15 }
    ]
  },

  // Sensation seeking = energy + tempo + experimentalism
  {
    riskFactor: 'sensationSeeking',
    contributors: [
      { genomeAttribute: 'overallEnergy', weight: 0.25 },
      { genomeAttribute: 'tempo', weight: 0.2 },
      { genomeAttribute: 'experimentalism', weight: 0.2 },
      { genomeAttribute: 'arousal', weight: 0.2 },
      { genomeAttribute: 'buildIntensity', weight: 0.15 }
    ]
  },

  // Risk tolerance = dissonance + unpredictability + experimentalism
  {
    riskFactor: 'riskTolerance',
    contributors: [
      { genomeAttribute: 'dissonanceLevel', weight: 0.2 },
      { genomeAttribute: 'structuralPredictability', weight: 0.2, transform: 'inverse' },
      { genomeAttribute: 'experimentalism', weight: 0.25 },
      { genomeAttribute: 'tempoVariability', weight: 0.15 },
      { genomeAttribute: 'timeSignatureComplexity', weight: 0.2 }
    ]
  },

  // Delayed gratification = song length + build intensity + structural complexity
  {
    riskFactor: 'delayedGratification',
    contributors: [
      { genomeAttribute: 'songLength', weight: 0.3 },
      { genomeAttribute: 'buildIntensity', weight: 0.25 },
      { genomeAttribute: 'structuralPredictability', weight: 0.2, transform: 'inverse' },
      { genomeAttribute: 'hookStrength', weight: 0.25, transform: 'inverse' }
    ]
  },

  // Impulsivity = high tempo + high energy + short songs
  {
    riskFactor: 'impulsivity',
    contributors: [
      { genomeAttribute: 'tempo', weight: 0.25 },
      { genomeAttribute: 'overallEnergy', weight: 0.25 },
      { genomeAttribute: 'songLength', weight: 0.25, transform: 'inverse' },
      { genomeAttribute: 'hookStrength', weight: 0.25 }
    ]
  },

  // Ambiguity tolerance = abstractness + experimentalism + atonality
  {
    riskFactor: 'ambiguityTolerance',
    contributors: [
      { genomeAttribute: 'lyricAbstractness', weight: 0.25 },
      { genomeAttribute: 'experimentalism', weight: 0.25 },
      { genomeAttribute: 'harmonicComplexity', weight: 0.2 },
      { genomeAttribute: 'structuralPredictability', weight: 0.3, transform: 'inverse' }
    ]
  },

  // Emotional stability = inverse of tension + consistent dynamics
  {
    riskFactor: 'emotionalStability',
    contributors: [
      { genomeAttribute: 'tension', weight: 0.3, transform: 'inverse' },
      { genomeAttribute: 'dynamicRange', weight: 0.2, transform: 'inverse' },
      { genomeAttribute: 'valence', weight: 0.25 },
      { genomeAttribute: 'tempoVariability', weight: 0.25, transform: 'inverse' }
    ]
  },

  // Nostalgia affinity
  {
    riskFactor: 'nostalgiaAffinity',
    contributors: [
      { genomeAttribute: 'nostalgia', weight: 0.4 },
      { genomeAttribute: 'warmth', weight: 0.2 },
      { genomeAttribute: 'temporalAnchoring', weight: 0.2 },
      { genomeAttribute: 'reverbAmount', weight: 0.2 }
    ]
  },

  // Mortality salience
  {
    riskFactor: 'mortalitySalience',
    contributors: [
      { genomeAttribute: 'spirituality', weight: 0.3 },
      { genomeAttribute: 'valence', weight: 0.2, transform: 'inverse' },
      { genomeAttribute: 'tension', weight: 0.2 },
      { genomeAttribute: 'lyricAbstractness', weight: 0.15 },
      { genomeAttribute: 'reverbAmount', weight: 0.15 }
    ]
  },

  // Transcendence orientation
  {
    riskFactor: 'transcendenceOrientation',
    contributors: [
      { genomeAttribute: 'spirituality', weight: 0.35 },
      { genomeAttribute: 'reverbAmount', weight: 0.15 },
      { genomeAttribute: 'buildIntensity', weight: 0.2 },
      { genomeAttribute: 'dynamicRange', weight: 0.15 },
      { genomeAttribute: 'spatialWidth', weight: 0.15 }
    ]
  }
];

// =============================================================================
// INSURANCE RISK CATEGORIES
// =============================================================================

/**
 * Maps psychological risk factors to insurance risk categories
 */
export interface InsuranceRiskProfile {
  // Overall risk score
  overallRiskScore: number;          // 0-100

  // Category-specific scores
  autoInsuranceRisk: number;         // Driving behavior risk
  healthInsuranceRisk: number;       // Health behavior risk
  lifeInsuranceRisk: number;         // Mortality risk factors
  propertyInsuranceRisk: number;     // Property care/protection
  liabilityInsuranceRisk: number;    // Likelihood of causing harm
  cyberInsuranceRisk: number;        // Digital behavior risk
  professionalLiabilityRisk: number; // Professional judgment risk

  // Behavioral predictions
  claimLikelihood: number;           // 0-1
  fraudRisk: number;                 // 0-1
  retentionProbability: number;      // 0-1 (will they stay with carrier)
  premiumSensitivity: number;        // 0-1 (price sensitive?)

  // Risk narrative
  riskNarrative: string;
  keyRiskFactors: string[];
  mitigatingFactors: string[];
  recommendations: string[];
}

// =============================================================================
// GENOME ANALYZER
// =============================================================================

export class MusicGenomeAnalyzer {

  /**
   * Analyze a song and extract its genome
   */
  analyzeSong(songData: {
    title: string;
    artist: string;
    album?: string;
    year?: number;
    duration?: number;
    // Audio features if available (from Spotify API, etc.)
    audioFeatures?: {
      tempo?: number;
      key?: number;
      mode?: number;
      timeSignature?: number;
      danceability?: number;
      energy?: number;
      valence?: number;
      acousticness?: number;
      instrumentalness?: number;
      speechiness?: number;
      liveness?: number;
      loudness?: number;
    };
    // Manual/curated attributes
    curatedAttributes?: Partial<MusicGenome>;
  }): MusicGenome {
    // Start with defaults
    const genome: MusicGenome = this.getDefaultGenome();

    // Apply audio features if available
    if (songData.audioFeatures) {
      const af = songData.audioFeatures;

      if (af.tempo) genome.tempo = af.tempo;
      if (af.energy !== undefined) genome.overallEnergy = af.energy;
      if (af.valence !== undefined) genome.valence = af.valence;
      if (af.acousticness !== undefined) genome.organicVsSynthetic = 1 - af.acousticness;
      if (af.danceability !== undefined) genome.groove = af.danceability;
      if (af.mode !== undefined) genome.mode = af.mode === 1 ? 'major' : 'minor';
      if (af.speechiness !== undefined) genome.lyricDensity = Math.min(1, af.speechiness * 2);
      if (af.instrumentalness !== undefined) genome.vocalPresence = 1 - af.instrumentalness;
    }

    // Apply duration
    if (songData.duration) {
      genome.songLength = songData.duration;
    }

    // Apply curated attributes (override everything)
    if (songData.curatedAttributes) {
      Object.assign(genome, songData.curatedAttributes);
    }

    return genome;
  }

  /**
   * Get default genome values
   */
  private getDefaultGenome(): MusicGenome {
    return {
      tempo: 120,
      tempoVariability: 0.2,
      timeSignatureComplexity: 0.1,
      songLength: 240,
      structuralPredictability: 0.7,
      key: 'C major',
      mode: 'major',
      harmonicComplexity: 0.4,
      dissonanceLevel: 0.2,
      chromaticism: 0.3,
      melodicRange: 0.5,
      melodicContour: 'varied',
      melodicComplexity: 0.4,
      hookStrength: 0.6,
      rhythmicDensity: 0.5,
      syncopation: 0.3,
      groove: 0.5,
      polyrhythmicComplexity: 0.2,
      brightness: 0.5,
      warmth: 0.5,
      density: 0.5,
      organicVsSynthetic: 0.5,
      dynamicRange: 0.5,
      buildIntensity: 0.4,
      releasePattern: 0.5,
      overallEnergy: 0.5,
      vocalPresence: 0.7,
      vocalStyle: 'clean',
      vocalEmotionality: 0.5,
      lyricDensity: 0.5,
      lyricAbstractness: 0.5,
      valence: 0.5,
      arousal: 0.5,
      tension: 0.3,
      nostalgia: 0.3,
      spirituality: 0.2,
      productionEra: '2010s',
      productionPolish: 0.7,
      spatialWidth: 0.6,
      reverbAmount: 0.4,
      experimentalism: 0.3,
      genrePurity: 0.6,
      mainstreamness: 0.5,
      culturalSpecificity: 0.3,
      temporalAnchoring: 0.4
    };
  }

  /**
   * Calculate risk factors from genome
   */
  calculateRiskFactors(genome: MusicGenome): MusicRiskFactors {
    const factors: Partial<MusicRiskFactors> = {};

    for (const mapping of GENOME_TO_RISK_MAPPINGS) {
      let score = 0;

      for (const contributor of mapping.contributors) {
        let value = this.getGenomeValue(genome, contributor.genomeAttribute);

        // Apply transform
        switch (contributor.transform) {
          case 'inverse':
            value = 1 - value;
            break;
          case 'quadratic':
            value = value * value;
            break;
          case 'sigmoid':
            value = 1 / (1 + Math.exp(-10 * (value - 0.5)));
            break;
          // 'linear' or undefined = no transform
        }

        score += value * contributor.weight;
      }

      factors[mapping.riskFactor] = Math.max(0, Math.min(1, score));
    }

    // Fill in any unmapped factors with defaults
    return this.fillDefaultRiskFactors(factors);
  }

  /**
   * Get normalized genome value (0-1)
   */
  private getGenomeValue(genome: MusicGenome, attribute: keyof MusicGenome): number {
    const value = genome[attribute];

    // Handle special cases
    if (attribute === 'tempo') {
      return Math.min(1, (value as number) / 200); // Normalize tempo to 0-1
    }
    if (attribute === 'songLength') {
      return Math.min(1, (value as number) / 600); // Normalize to 10 min max
    }
    if (attribute === 'mode') {
      return value === 'major' ? 0.7 : value === 'minor' ? 0.3 : 0.5;
    }
    if (typeof value === 'string') {
      return 0.5; // Default for string attributes
    }

    return value as number;
  }

  /**
   * Fill in default values for unmapped risk factors
   */
  private fillDefaultRiskFactors(partial: Partial<MusicRiskFactors>): MusicRiskFactors {
    return {
      openness: partial.openness ?? 0.5,
      conscientiousness: partial.conscientiousness ?? 0.5,
      extraversion: partial.extraversion ?? 0.5,
      agreeableness: partial.agreeableness ?? 0.5,
      neuroticism: partial.neuroticism ?? 0.5,
      sensationSeeking: partial.sensationSeeking ?? 0.5,
      riskTolerance: partial.riskTolerance ?? 0.5,
      delayedGratification: partial.delayedGratification ?? 0.5,
      impulsivity: partial.impulsivity ?? 0.5,
      ambiguityTolerance: partial.ambiguityTolerance ?? 0.5,
      emotionalStability: partial.emotionalStability ?? 0.5,
      stressResponse: partial.stressResponse ?? 0.5,
      emotionalRegulation: partial.emotionalRegulation ?? 0.5,
      anxietyProneness: partial.anxietyProneness ?? 0.5,
      depressionVulnerability: partial.depressionVulnerability ?? 0.5,
      socialTrust: partial.socialTrust ?? 0.5,
      conformity: partial.conformity ?? 0.5,
      leadershipOrientation: partial.leadershipOrientation ?? 0.5,
      competitiveness: partial.competitiveness ?? 0.5,
      analyticalThinking: partial.analyticalThinking ?? 0.5,
      creativityOrientation: partial.creativityOrientation ?? 0.5,
      attentionSpan: partial.attentionSpan ?? 0.5,
      complexityPreference: partial.complexityPreference ?? 0.5,
      futureOrientation: partial.futureOrientation ?? 0.5,
      nostalgiaAffinity: partial.nostalgiaAffinity ?? 0.5,
      changeAdaptability: partial.changeAdaptability ?? 0.5,
      mortalitySalience: partial.mortalitySalience ?? 0.3,
      meaningOrientation: partial.meaningOrientation ?? 0.5,
      transcendenceOrientation: partial.transcendenceOrientation ?? 0.3
    };
  }

  /**
   * Calculate insurance risk profile from risk factors
   */
  calculateInsuranceProfile(
    factors: MusicRiskFactors,
    genome: MusicGenome
  ): InsuranceRiskProfile {
    // Auto insurance risk: impulsivity, sensation seeking, risk tolerance
    const autoInsuranceRisk = (
      factors.impulsivity * 0.3 +
      factors.sensationSeeking * 0.3 +
      factors.riskTolerance * 0.2 +
      (1 - factors.conscientiousness) * 0.2
    ) * 100;

    // Health insurance risk: neuroticism, stress, depression vulnerability
    const healthInsuranceRisk = (
      factors.neuroticism * 0.25 +
      factors.anxietyProneness * 0.2 +
      factors.depressionVulnerability * 0.2 +
      (1 - factors.emotionalRegulation) * 0.2 +
      factors.sensationSeeking * 0.15
    ) * 100;

    // Life insurance risk: mortality salience + health factors
    const lifeInsuranceRisk = (
      factors.mortalitySalience * 0.2 +
      factors.riskTolerance * 0.25 +
      factors.sensationSeeking * 0.2 +
      (1 - factors.conscientiousness) * 0.2 +
      factors.impulsivity * 0.15
    ) * 100;

    // Property insurance risk: conscientiousness inverse
    const propertyInsuranceRisk = (
      (1 - factors.conscientiousness) * 0.35 +
      factors.impulsivity * 0.25 +
      (1 - factors.delayedGratification) * 0.2 +
      factors.riskTolerance * 0.2
    ) * 100;

    // Liability insurance risk: agreeableness inverse
    const liabilityInsuranceRisk = (
      (1 - factors.agreeableness) * 0.3 +
      factors.competitiveness * 0.2 +
      factors.impulsivity * 0.2 +
      (1 - factors.socialTrust) * 0.15 +
      factors.riskTolerance * 0.15
    ) * 100;

    // Cyber insurance risk: openness + experimentation
    const cyberInsuranceRisk = (
      factors.openness * 0.2 +
      factors.riskTolerance * 0.25 +
      factors.sensationSeeking * 0.2 +
      (1 - factors.conscientiousness) * 0.2 +
      factors.impulsivity * 0.15
    ) * 100;

    // Professional liability: conscientiousness inverse + overconfidence
    const professionalLiabilityRisk = (
      (1 - factors.conscientiousness) * 0.3 +
      factors.riskTolerance * 0.25 +
      factors.impulsivity * 0.2 +
      (1 - factors.analyticalThinking) * 0.25
    ) * 100;

    // Overall risk score (weighted average)
    const overallRiskScore = (
      autoInsuranceRisk * 0.15 +
      healthInsuranceRisk * 0.2 +
      lifeInsuranceRisk * 0.15 +
      propertyInsuranceRisk * 0.15 +
      liabilityInsuranceRisk * 0.15 +
      cyberInsuranceRisk * 0.1 +
      professionalLiabilityRisk * 0.1
    );

    // Behavioral predictions
    const claimLikelihood = (factors.impulsivity * 0.3 + factors.riskTolerance * 0.3 + (1 - factors.conscientiousness) * 0.4);
    const fraudRisk = ((1 - factors.agreeableness) * 0.3 + (1 - factors.conscientiousness) * 0.3 + factors.impulsivity * 0.2 + (1 - factors.socialTrust) * 0.2);
    const retentionProbability = (factors.conscientiousness * 0.3 + (1 - factors.sensationSeeking) * 0.3 + factors.nostalgiaAffinity * 0.2 + (1 - factors.impulsivity) * 0.2);
    const premiumSensitivity = ((1 - factors.delayedGratification) * 0.4 + factors.impulsivity * 0.3 + (1 - factors.conscientiousness) * 0.3);

    // Generate narrative
    const narrative = this.generateRiskNarrative(factors, genome);

    return {
      overallRiskScore,
      autoInsuranceRisk,
      healthInsuranceRisk,
      lifeInsuranceRisk,
      propertyInsuranceRisk,
      liabilityInsuranceRisk,
      cyberInsuranceRisk,
      professionalLiabilityRisk,
      claimLikelihood,
      fraudRisk,
      retentionProbability,
      premiumSensitivity,
      ...narrative
    };
  }

  /**
   * Generate human-readable risk narrative
   */
  private generateRiskNarrative(
    factors: MusicRiskFactors,
    genome: MusicGenome
  ): { riskNarrative: string; keyRiskFactors: string[]; mitigatingFactors: string[]; recommendations: string[] } {
    const keyRiskFactors: string[] = [];
    const mitigatingFactors: string[] = [];
    const recommendations: string[] = [];

    // Identify key risk factors
    if (factors.impulsivity > 0.6) keyRiskFactors.push('High impulsivity indicated by preference for high-energy, fast-tempo music');
    if (factors.sensationSeeking > 0.6) keyRiskFactors.push('Elevated sensation-seeking suggested by experimental/intense musical choices');
    if (factors.riskTolerance > 0.6) keyRiskFactors.push('High risk tolerance indicated by comfort with dissonance and unpredictability');
    if (factors.neuroticism > 0.6) keyRiskFactors.push('Elevated emotional volatility suggested by preference for tense, minor-key music');
    if (factors.mortalitySalience > 0.6) keyRiskFactors.push('High mortality awareness indicated by spiritual/transcendent musical preferences');

    // Identify mitigating factors
    if (factors.conscientiousness > 0.6) mitigatingFactors.push('Strong conscientiousness indicated by preference for structured, polished productions');
    if (factors.emotionalRegulation > 0.6) mitigatingFactors.push('Good emotional regulation suggested by balanced dynamic preferences');
    if (factors.delayedGratification > 0.6) mitigatingFactors.push('Patience indicated by tolerance for long-form, slow-building compositions');
    if (factors.agreeableness > 0.6) mitigatingFactors.push('Cooperative nature suggested by preference for consonant, warm music');
    if (factors.analyticalThinking > 0.6) mitigatingFactors.push('Analytical mindset indicated by appreciation for complex harmonic structures');

    // Generate recommendations
    if (factors.impulsivity > 0.6) recommendations.push('Consider usage-based auto insurance with real-time feedback');
    if (factors.anxietyProneness > 0.6) recommendations.push('Mental health rider on health insurance recommended');
    if (factors.riskTolerance > 0.7) recommendations.push('Higher deductibles may be appropriate given risk comfort level');
    if (factors.nostalgiaAffinity > 0.7) recommendations.push('Long-term policy commitments likely; offer loyalty discounts');
    if (factors.sensationSeeking > 0.7) recommendations.push('Adventure/extreme sports exclusions may need explicit discussion');

    // Build narrative
    let narrative = 'Musical preference analysis reveals ';

    if (factors.openness > 0.6 && factors.riskTolerance > 0.5) {
      narrative += 'an exploratory, risk-tolerant personality type. ';
    } else if (factors.conscientiousness > 0.6 && factors.riskTolerance < 0.4) {
      narrative += 'a cautious, methodical personality type. ';
    } else if (factors.neuroticism > 0.6) {
      narrative += 'an emotionally sensitive personality type requiring careful risk assessment. ';
    } else {
      narrative += 'a balanced personality profile with moderate risk indicators. ';
    }

    if (genome.spirituality > 0.6) {
      narrative += 'Strong spiritual/transcendent orientation suggests meaning-focused decision-making. ';
    }

    if (genome.nostalgia > 0.6) {
      narrative += 'High nostalgia affinity indicates preference for stability and proven approaches. ';
    }

    if (keyRiskFactors.length > mitigatingFactors.length) {
      narrative += 'Overall risk profile skews elevated; careful underwriting recommended.';
    } else if (mitigatingFactors.length > keyRiskFactors.length) {
      narrative += 'Overall risk profile favorable; standard underwriting appropriate.';
    } else {
      narrative += 'Balanced risk profile; standard assessment protocols apply.';
    }

    return {
      riskNarrative: narrative,
      keyRiskFactors,
      mitigatingFactors,
      recommendations
    };
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default MusicGenomeAnalyzer;
