/**
 * ACTUARIAL RISK PROFILE: "Get Real Get Right" by Sufjan Stevens
 * ================================================================
 *
 * From the album: Carrie & Lowell (2015)
 * Duration: 2:19
 * Genre: Indie folk / Singer-songwriter / Chamber folk
 *
 * CONTEXT:
 * --------
 * "Carrie & Lowell" is Sufjan Stevens' most personal album, written after
 * the death of his mother Carrie, who abandoned him as a child. The album
 * is a meditation on grief, mortality, faith, and the complexity of
 * loving someone who hurt you.
 *
 * "Get Real Get Right" is a gospel-inflected track that serves as a
 * spiritual reckoning—a call to authentic self-examination before
 * meeting one's maker. The title itself is a colloquialism meaning
 * "get serious and align yourself with what matters."
 *
 * This analysis demonstrates the Music Genome for Risk framework by
 * extracting actuarial risk signals from this deeply spiritual song.
 */

import MusicGenomeAnalyzer, {
  MusicGenome,
  MusicRiskFactors,
  InsuranceRiskProfile
} from '../musicGenomeRisk';

// =============================================================================
// SONG GENOME ANALYSIS
// =============================================================================

/**
 * Curated genome for "Get Real Get Right"
 * Based on musicological analysis of the track
 */
export const GET_REAL_GET_RIGHT_GENOME: MusicGenome = {
  // === STRUCTURAL ===
  tempo: 95,                        // Moderate, contemplative pace
  tempoVariability: 0.15,           // Relatively steady
  timeSignatureComplexity: 0.1,     // Standard 4/4
  songLength: 139,                  // 2:19 - short, concentrated
  structuralPredictability: 0.6,    // Follows verse pattern but spare

  // === HARMONIC ===
  key: 'E minor',
  mode: 'minor',                    // Minor key = melancholic
  harmonicComplexity: 0.55,         // Some jazz/folk voicings
  dissonanceLevel: 0.35,            // Occasional tension
  chromaticism: 0.4,                // Some chromatic movement

  // === MELODIC ===
  melodicRange: 0.7,                // Wide range including falsetto
  melodicContour: 'varied',
  melodicComplexity: 0.5,           // Flowing but not ornate
  hookStrength: 0.45,               // Not a "catchy" song per se

  // === RHYTHMIC ===
  rhythmicDensity: 0.25,            // Very sparse
  syncopation: 0.2,                 // Mostly on the beat
  groove: 0.3,                      // Contemplative, not danceable
  polyrhythmicComplexity: 0.15,     // Simple layering

  // === TIMBRAL ===
  brightness: 0.35,                 // Dark, intimate
  warmth: 0.75,                     // Very warm, organic
  density: 0.2,                     // Extremely sparse arrangement
  organicVsSynthetic: 0.1,          // Almost entirely acoustic

  // === DYNAMIC ===
  dynamicRange: 0.55,               // Some swells, mostly quiet
  buildIntensity: 0.4,              // Gentle rises
  releasePattern: 0.6,              // Gradual fade
  overallEnergy: 0.25,              // Low energy, meditative

  // === VOCAL ===
  vocalPresence: 0.9,               // Voice is central
  vocalStyle: 'falsetto',           // Signature Sufjan falsetto
  vocalEmotionality: 0.85,          // Deeply emotional delivery
  lyricDensity: 0.6,                // Moderate word count
  lyricAbstractness: 0.65,          // Spiritual/metaphorical language

  // === EMOTIONAL ===
  valence: 0.25,                    // Melancholic, not happy
  arousal: 0.3,                     // Calm, not excited
  tension: 0.55,                    // Underlying spiritual tension
  nostalgia: 0.7,                   // Looking back at life
  spirituality: 0.95,               // Extremely high spiritual content

  // === PRODUCTION ===
  productionEra: '2010s indie folk',
  productionPolish: 0.7,            // Clean but intimate
  spatialWidth: 0.5,                // Intimate, not wide
  reverbAmount: 0.6,                // Moderate reverb, cathedral-like
  experimentalism: 0.35,            // Conventional folk structures

  // === CULTURAL ===
  genrePurity: 0.6,                 // Mostly folk with gospel tinge
  mainstreamness: 0.25,             // Decidedly indie
  culturalSpecificity: 0.7,         // American folk/gospel tradition
  temporalAnchoring: 0.4            // Timeless quality
};

// =============================================================================
// RISK FACTOR CALCULATION
// =============================================================================

const analyzer = new MusicGenomeAnalyzer();

export const GET_REAL_GET_RIGHT_RISK_FACTORS: MusicRiskFactors = analyzer.calculateRiskFactors(
  GET_REAL_GET_RIGHT_GENOME
);

export const GET_REAL_GET_RIGHT_INSURANCE_PROFILE: InsuranceRiskProfile = analyzer.calculateInsuranceProfile(
  GET_REAL_GET_RIGHT_RISK_FACTORS,
  GET_REAL_GET_RIGHT_GENOME
);

// =============================================================================
// DETAILED ANALYSIS REPORT
// =============================================================================

export const FULL_RISK_ANALYSIS = {
  // === SONG METADATA ===
  metadata: {
    title: 'Get Real Get Right',
    artist: 'Sufjan Stevens',
    album: 'Carrie & Lowell',
    year: 2015,
    duration: '2:19',
    genre: ['Indie Folk', 'Singer-Songwriter', 'Chamber Folk', 'Gospel-influenced'],
    themes: [
      'Spiritual reckoning',
      'Mortality',
      'Authenticity',
      'Judgment',
      'Self-examination',
      'Faith',
      'Grief'
    ]
  },

  // === LYRICAL ANALYSIS ===
  lyricAnalysis: {
    keyPhrases: [
      '"Get real, get right with the Lord"',
      '"Now that you\'ve been reborn"',
      '"Spirit of my silence, I can hear you"',
      '"But nothing is wasted"'
    ],
    emotionalTone: 'Pleading, reflective, spiritually urgent',
    narrativeArc: 'A call to spiritual authenticity before death; reckoning with what matters',
    mortalityReferences: 'Pervasive—the entire song is about preparing for death',
    spiritualFramework: 'Christian/gospel-influenced but universally applicable',
    relationshipToAlbum: 'Part of grief processing after mother\'s death; questioning faith and meaning'
  },

  // === GENOME HIGHLIGHTS ===
  genomeHighlights: {
    mostDistinctiveAttributes: [
      { attribute: 'spirituality', value: 0.95, interpretation: 'Among the highest possible—this is fundamentally spiritual music' },
      { attribute: 'vocalEmotionality', value: 0.85, interpretation: 'Sufjan\'s falsetto carries enormous emotional weight' },
      { attribute: 'warmth', value: 0.75, interpretation: 'Despite dark themes, the sound is enveloping and comforting' },
      { attribute: 'nostalgia', value: 0.7, interpretation: 'Looking backward at life, relationships, choices' },
      { attribute: 'density', value: 0.2, interpretation: 'Extremely sparse—every note matters' }
    ],
    genreSignatures: [
      'Sparse acoustic guitar',
      'Falsetto vocals',
      'Gospel-influenced chord progressions',
      'Intimate recording aesthetic',
      'Reverb suggesting sacred space'
    ],
    productionChoices: 'Intentionally stripped-down to create intimacy and vulnerability'
  },

  // === RISK FACTOR ANALYSIS ===
  riskFactorAnalysis: {
    // Big Five Personality
    personality: {
      openness: {
        score: GET_REAL_GET_RIGHT_RISK_FACTORS.openness,
        interpretation: 'Moderate openness—spiritual themes suggest metaphysical curiosity, but musical form is traditional'
      },
      conscientiousness: {
        score: GET_REAL_GET_RIGHT_RISK_FACTORS.conscientiousness,
        interpretation: 'Higher conscientiousness indicated by controlled production and structured approach despite emotional content'
      },
      extraversion: {
        score: GET_REAL_GET_RIGHT_RISK_FACTORS.extraversion,
        interpretation: 'Low extraversion—this is deeply introverted, contemplative music'
      },
      agreeableness: {
        score: GET_REAL_GET_RIGHT_RISK_FACTORS.agreeableness,
        interpretation: 'Moderate to high—warm timbre and spiritual themes suggest prosocial orientation'
      },
      neuroticism: {
        score: GET_REAL_GET_RIGHT_RISK_FACTORS.neuroticism,
        interpretation: 'Elevated neuroticism—minor key, tension, emotional intensity all indicate sensitivity to negative emotion'
      }
    },

    // Behavioral Risk Factors
    behavioral: {
      sensationSeeking: {
        score: GET_REAL_GET_RIGHT_RISK_FACTORS.sensationSeeking,
        interpretation: 'LOW—this is the opposite of thrill-seeking music; it\'s about stillness and reflection'
      },
      riskTolerance: {
        score: GET_REAL_GET_RIGHT_RISK_FACTORS.riskTolerance,
        interpretation: 'Moderate—willingness to confront mortality suggests some comfort with existential risk, but overall cautious'
      },
      impulsivity: {
        score: GET_REAL_GET_RIGHT_RISK_FACTORS.impulsivity,
        interpretation: 'LOW—slow tempo, sparse arrangement, controlled dynamics all indicate deliberate, non-impulsive personality'
      },
      delayedGratification: {
        score: GET_REAL_GET_RIGHT_RISK_FACTORS.delayedGratification,
        interpretation: 'HIGH—lack of immediate hooks, willingness to sit in discomfort, long-form album narrative'
      },
      ambiguityTolerance: {
        score: GET_REAL_GET_RIGHT_RISK_FACTORS.ambiguityTolerance,
        interpretation: 'Moderate to high—spiritual content embraces mystery and uncertainty'
      }
    },

    // Emotional Risk Factors
    emotional: {
      emotionalStability: {
        score: GET_REAL_GET_RIGHT_RISK_FACTORS.emotionalStability,
        interpretation: 'Lower stability indicated—this is emotionally vulnerable music that doesn\'t shy from pain'
      },
      anxietyProneness: {
        score: GET_REAL_GET_RIGHT_RISK_FACTORS.anxietyProneness,
        interpretation: 'Elevated—the tension and minor key suggest familiarity with anxiety states'
      },
      depressionVulnerability: {
        score: GET_REAL_GET_RIGHT_RISK_FACTORS.depressionVulnerability,
        interpretation: 'Elevated—low valence, low energy, melancholic tone all correlate with depression risk'
      },
      emotionalRegulation: {
        score: GET_REAL_GET_RIGHT_RISK_FACTORS.emotionalRegulation,
        interpretation: 'Moderate—the music is emotionally intense but controlled; suggests someone who processes rather than suppresses'
      }
    },

    // Mortality/Existential Factors
    existential: {
      mortalitySalience: {
        score: GET_REAL_GET_RIGHT_RISK_FACTORS.mortalitySalience,
        interpretation: 'EXTREMELY HIGH—the entire song is about preparing for death and judgment'
      },
      meaningOrientation: {
        score: GET_REAL_GET_RIGHT_RISK_FACTORS.meaningOrientation,
        interpretation: 'Extremely high—every element of this song asks "what matters?" and "how should I live?"'
      },
      transcendenceOrientation: {
        score: GET_REAL_GET_RIGHT_RISK_FACTORS.transcendenceOrientation,
        interpretation: 'EXTREMELY HIGH—explicitly spiritual content, seeking connection with the divine'
      },
      nostalgiaAffinity: {
        score: GET_REAL_GET_RIGHT_RISK_FACTORS.nostalgiaAffinity,
        interpretation: 'High—looking back at life, at relationships, at what was and wasn\'t'
      }
    }
  },

  // === INSURANCE RISK PROFILE ===
  insuranceProfile: {
    overallRiskScore: {
      value: GET_REAL_GET_RIGHT_INSURANCE_PROFILE.overallRiskScore,
      rating: GET_REAL_GET_RIGHT_INSURANCE_PROFILE.overallRiskScore < 35 ? 'LOW' :
        GET_REAL_GET_RIGHT_INSURANCE_PROFILE.overallRiskScore < 55 ? 'MODERATE' :
          GET_REAL_GET_RIGHT_INSURANCE_PROFILE.overallRiskScore < 75 ? 'ELEVATED' : 'HIGH',
      interpretation: 'Despite emotional intensity, behavioral indicators suggest conservative risk profile'
    },

    byCategory: {
      auto: {
        score: GET_REAL_GET_RIGHT_INSURANCE_PROFILE.autoInsuranceRisk,
        interpretation: 'LOW—low impulsivity, low sensation seeking, contemplative nature suggests careful driving'
      },
      health: {
        score: GET_REAL_GET_RIGHT_INSURANCE_PROFILE.healthInsuranceRisk,
        interpretation: 'MODERATE-ELEVATED—depression/anxiety vulnerability offset by conscientiousness'
      },
      life: {
        score: GET_REAL_GET_RIGHT_INSURANCE_PROFILE.lifeInsuranceRisk,
        interpretation: 'Mortality awareness high but risk-taking low; complex picture'
      },
      property: {
        score: GET_REAL_GET_RIGHT_INSURANCE_PROFILE.propertyInsuranceRisk,
        interpretation: 'LOW—conscientiousness and non-impulsivity suggest careful stewardship'
      },
      liability: {
        score: GET_REAL_GET_RIGHT_INSURANCE_PROFILE.liabilityInsuranceRisk,
        interpretation: 'LOW—high agreeableness, prosocial spiritual orientation'
      },
      cyber: {
        score: GET_REAL_GET_RIGHT_INSURANCE_PROFILE.cyberInsuranceRisk,
        interpretation: 'LOW-MODERATE—not a risk-seeking digital personality'
      },
      professional: {
        score: GET_REAL_GET_RIGHT_INSURANCE_PROFILE.professionalLiabilityRisk,
        interpretation: 'LOW—conscientiousness and analytical thinking suggest careful work'
      }
    },

    behavioralPredictions: {
      claimLikelihood: {
        value: GET_REAL_GET_RIGHT_INSURANCE_PROFILE.claimLikelihood,
        interpretation: 'Below average claim likelihood due to non-impulsive, conscientious profile'
      },
      fraudRisk: {
        value: GET_REAL_GET_RIGHT_INSURANCE_PROFILE.fraudRisk,
        interpretation: 'Very low—high agreeableness and spiritual/ethical orientation'
      },
      retentionProbability: {
        value: GET_REAL_GET_RIGHT_INSURANCE_PROFILE.retentionProbability,
        interpretation: 'HIGH—nostalgia affinity and conscientiousness suggest loyalty'
      },
      premiumSensitivity: {
        value: GET_REAL_GET_RIGHT_INSURANCE_PROFILE.premiumSensitivity,
        interpretation: 'Moderate—delayed gratification capacity suggests focus on value over price'
      }
    }
  },

  // === ACTUARIAL NARRATIVE ===
  actuarialNarrative: {
    summary: `
"Get Real Get Right" reveals a listener profile characterized by:

1. HIGH EMOTIONAL SENSITIVITY but CONTROLLED EXPRESSION
   The music is emotionally intense but never chaotic. This suggests someone
   who feels deeply but processes emotions through structured means (art,
   spirituality, therapy) rather than impulsive action.

2. LOW SENSATION-SEEKING, HIGH MEANING-SEEKING
   This is not music for thrill-seekers. It's music for people who ask
   "why am I here?" rather than "what's next?" This dramatically reduces
   behavioral risk factors even if psychological complexity is elevated.

3. MORTALITY-AWARE BUT NOT DEATH-SEEKING
   The explicit engagement with death themes suggests someone who has
   confronted mortality—likely through loss—and integrated it into their
   worldview. This typically correlates with BETTER risk outcomes as it
   promotes careful living and legacy-thinking.

4. SPIRITUAL BUT NOT DOGMATIC
   The gospel influence is genuine but not doctrinaire. This suggests
   ethical grounding without rigidity—a positive indicator for honest
   dealing and long-term planning.

5. NOSTALGIC WITH FUTURE ORIENTATION
   Looking back at the past while preparing for what comes next. This
   balance is actually optimal for insurance relationships: values
   stability but understands change is coming.
    `,

    keyInsight: `
The apparent paradox of this song: it's about death, yet it suggests LOW
insurance risk. Why? Because people who consciously engage with mortality
tend to live more carefully. The avoidant, the denial-prone, the "I'll
live forever" mindset—THOSE are the risk factors. Someone who has sat
with "Get Real Get Right" and let it work on them has already done the
psychological work that reduces reckless behavior.
    `,

    underwritingRecommendation: `
FAVORABLE RISK PROFILE

- Standard or preferred rates for most lines
- Mental health support riders recommended but not risk-priced
- High retention probability—offer multi-year discounts
- Low fraud risk—streamlined claims process appropriate
- Consider bundling opportunities given loyalty indicators

SPECIAL CONSIDERATIONS:
- Elevated depression/anxiety indicators warrant proactive wellness resources
- Spiritual/meaning orientation suggests receptivity to holistic health programs
- Nostalgia affinity indicates preference for human touch over pure digital interactions
    `,

    poolingRecommendation: `
OPTIMAL POOL CHARACTERISTICS:
This listener profile fits well with:
- Low-volatility, meaning-oriented cohorts
- Long-term, relationship-based product structures
- Values-aligned insurance offerings (ESG, mutual companies)
- Products that emphasize legacy and family protection

AVOID POOLING WITH:
- High sensation-seeking profiles
- Transactional, price-only shoppers
- Short-term horizon thinkers
    `
  },

  // === META-ANALYSIS ===
  metaAnalysis: {
    whatThisSongReveals: `
"Get Real Get Right" is a perfect test case for the Music Genome for Risk
framework because it shows how EMOTIONAL INTENSITY does not equal BEHAVIORAL
RISK. Traditional actuarial models might flag "depressive" or "death-focused"
content as risk indicators. This analysis shows the opposite can be true.

The song's listener is likely:
- More financially responsible than average
- Less likely to engage in reckless behavior
- More likely to maintain long-term commitments
- More likely to seek help when struggling (not suppress)
- Less likely to commit fraud or misrepresent claims

The music genome approach captures these nuances because it's tracking
BEHAVIOR-CORRELATED attributes (tempo, energy, complexity) rather than
surface-level genre or lyrical content.
    `,

    limitationsOfAnalysis: `
1. Single-song analysis is illustrative, not actuarial
   A true risk profile requires aggregate listening patterns over time

2. Context matters enormously
   Listening to this song at a funeral vs. on a Sunday morning vs. during
   a breakup produces different signal

3. Correlation is not causation
   We're inferring personality from preferences, not measuring directly

4. Cultural context varies
   A listener from a gospel tradition may interpret this differently than
   someone from a secular background
    `,

    futureEnhancements: `
To make this production-ready:
1. Integrate Spotify Audio Features API for objective genome data
2. Aggregate across full listening history, not single tracks
3. Weight by recency, frequency, and listening context (time of day, etc.)
4. Combine with other behavioral data (social media, financial history)
5. Validate against actual claims data through partnership with carriers
    `
  }
};

// =============================================================================
// CONSOLE OUTPUT FOR DEMONSTRATION
// =============================================================================

export function printFullAnalysis(): void {
  console.log('\n' + '='.repeat(80));
  console.log('ACTUARIAL RISK PROFILE: "Get Real Get Right" by Sufjan Stevens');
  console.log('='.repeat(80));

  console.log('\n📀 METADATA');
  console.log('-'.repeat(40));
  console.log(`Title: ${FULL_RISK_ANALYSIS.metadata.title}`);
  console.log(`Artist: ${FULL_RISK_ANALYSIS.metadata.artist}`);
  console.log(`Album: ${FULL_RISK_ANALYSIS.metadata.album} (${FULL_RISK_ANALYSIS.metadata.year})`);
  console.log(`Duration: ${FULL_RISK_ANALYSIS.metadata.duration}`);
  console.log(`Themes: ${FULL_RISK_ANALYSIS.metadata.themes.join(', ')}`);

  console.log('\n🎵 GENOME HIGHLIGHTS');
  console.log('-'.repeat(40));
  for (const attr of FULL_RISK_ANALYSIS.genomeHighlights.mostDistinctiveAttributes) {
    console.log(`${attr.attribute}: ${(attr.value * 100).toFixed(0)}%`);
    console.log(`  → ${attr.interpretation}`);
  }

  console.log('\n🧠 PERSONALITY PROFILE (Big Five)');
  console.log('-'.repeat(40));
  const personality = FULL_RISK_ANALYSIS.riskFactorAnalysis.personality;
  console.log(`Openness:          ${(personality.openness.score * 100).toFixed(0)}%`);
  console.log(`Conscientiousness: ${(personality.conscientiousness.score * 100).toFixed(0)}%`);
  console.log(`Extraversion:      ${(personality.extraversion.score * 100).toFixed(0)}%`);
  console.log(`Agreeableness:     ${(personality.agreeableness.score * 100).toFixed(0)}%`);
  console.log(`Neuroticism:       ${(personality.neuroticism.score * 100).toFixed(0)}%`);

  console.log('\n⚠️  BEHAVIORAL RISK FACTORS');
  console.log('-'.repeat(40));
  const behavioral = FULL_RISK_ANALYSIS.riskFactorAnalysis.behavioral;
  console.log(`Sensation Seeking:     ${(behavioral.sensationSeeking.score * 100).toFixed(0)}%`);
  console.log(`Risk Tolerance:        ${(behavioral.riskTolerance.score * 100).toFixed(0)}%`);
  console.log(`Impulsivity:           ${(behavioral.impulsivity.score * 100).toFixed(0)}%`);
  console.log(`Delayed Gratification: ${(behavioral.delayedGratification.score * 100).toFixed(0)}%`);

  console.log('\n💀 EXISTENTIAL FACTORS');
  console.log('-'.repeat(40));
  const existential = FULL_RISK_ANALYSIS.riskFactorAnalysis.existential;
  console.log(`Mortality Salience:  ${(existential.mortalitySalience.score * 100).toFixed(0)}%`);
  console.log(`Meaning Orientation: ${(existential.meaningOrientation.score * 100).toFixed(0)}%`);
  console.log(`Transcendence:       ${(existential.transcendenceOrientation.score * 100).toFixed(0)}%`);

  console.log('\n📊 INSURANCE RISK SCORES');
  console.log('-'.repeat(40));
  const profile = FULL_RISK_ANALYSIS.insuranceProfile;
  console.log(`OVERALL RISK: ${profile.overallRiskScore.value.toFixed(1)}/100 (${profile.overallRiskScore.rating})`);
  console.log('');
  console.log(`Auto Insurance:     ${profile.byCategory.auto.score.toFixed(1)}`);
  console.log(`Health Insurance:   ${profile.byCategory.health.score.toFixed(1)}`);
  console.log(`Life Insurance:     ${profile.byCategory.life.score.toFixed(1)}`);
  console.log(`Property Insurance: ${profile.byCategory.property.score.toFixed(1)}`);
  console.log(`Liability:          ${profile.byCategory.liability.score.toFixed(1)}`);

  console.log('\n🎯 BEHAVIORAL PREDICTIONS');
  console.log('-'.repeat(40));
  const predictions = profile.behavioralPredictions;
  console.log(`Claim Likelihood:     ${(predictions.claimLikelihood.value * 100).toFixed(0)}%`);
  console.log(`Fraud Risk:           ${(predictions.fraudRisk.value * 100).toFixed(0)}%`);
  console.log(`Retention Probability: ${(predictions.retentionProbability.value * 100).toFixed(0)}%`);

  console.log('\n📝 ACTUARIAL NARRATIVE');
  console.log('-'.repeat(40));
  console.log(FULL_RISK_ANALYSIS.actuarialNarrative.summary.trim());

  console.log('\n💡 KEY INSIGHT');
  console.log('-'.repeat(40));
  console.log(FULL_RISK_ANALYSIS.actuarialNarrative.keyInsight.trim());

  console.log('\n✅ UNDERWRITING RECOMMENDATION');
  console.log('-'.repeat(40));
  console.log(FULL_RISK_ANALYSIS.actuarialNarrative.underwritingRecommendation.trim());

  console.log('\n' + '='.repeat(80));
}

// Run if executed directly
printFullAnalysis();

export default FULL_RISK_ANALYSIS;
