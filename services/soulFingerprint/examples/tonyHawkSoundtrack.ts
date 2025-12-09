/**
 * TONY HAWK'S PRO SKATER SOUNDTRACK RISK PROFILES
 * =================================================
 *
 * "These songs didn't just define a video game—they defined a generation."
 *
 * The THPS soundtracks (1999-2005) introduced millions of players to punk,
 * ska, hip-hop, metal, and alternative rock. For many, these were the first
 * "real" songs they ever loved. The risk profiles of THPS listeners tell us
 * about an entire generation's behavioral patterns.
 *
 * This module provides actuarial risk analysis for iconic THPS tracks,
 * demonstrating how genre, energy, and lyrical content map to risk factors.
 *
 * @author InfinitySoul Soul Fingerprint Engine
 * @version 1.0.0
 */

import MusicGenomeAnalyzer, {
  MusicGenome,
  MusicRiskFactors,
  InsuranceRiskProfile
} from '../musicGenomeRisk';

// =============================================================================
// THPS GAME METADATA
// =============================================================================

export type THPSGame =
  | 'THPS1'      // 1999
  | 'THPS2'      // 2000
  | 'THPS3'      // 2001
  | 'THPS4'      // 2002
  | 'THUG'       // Underground, 2003
  | 'THUG2'      // Underground 2, 2004
  | 'THAW'       // American Wasteland, 2005
  | 'THPS1+2';   // Remaster, 2020

export interface THPSSong {
  title: string;
  artist: string;
  game: THPSGame;
  year: number;
  genre: string[];
  isIconic: boolean;  // True if widely recognized as defining THPS
  genome: MusicGenome;
  riskFactors?: MusicRiskFactors;
  insuranceProfile?: InsuranceRiskProfile;
}

// =============================================================================
// ICONIC THPS SONGS - FULL GENOME PROFILES
// =============================================================================

const analyzer = new MusicGenomeAnalyzer();

/**
 * "Superman" - Goldfinger (THPS1, 1999)
 * THE defining THPS song. Ska-punk anthem of optimism and resilience.
 */
export const SUPERMAN_GOLDFINGER: THPSSong = {
  title: 'Superman',
  artist: 'Goldfinger',
  game: 'THPS1',
  year: 1999,
  genre: ['Ska Punk', 'Pop Punk', 'Third Wave Ska'],
  isIconic: true,
  genome: {
    // Structural
    tempo: 172,                       // Fast ska beat
    tempoVariability: 0.15,
    timeSignatureComplexity: 0.2,     // Standard with ska upbeats
    songLength: 224,                  // 3:44
    structuralPredictability: 0.8,    // Classic verse-chorus

    // Harmonic
    key: 'G major',
    mode: 'major',                    // Upbeat major key
    harmonicComplexity: 0.35,         // Simple punk progressions
    dissonanceLevel: 0.15,
    chromaticism: 0.2,

    // Melodic
    melodicRange: 0.65,
    melodicContour: 'varied',
    melodicComplexity: 0.4,
    hookStrength: 0.95,               // EXTREMELY catchy

    // Rhythmic
    rhythmicDensity: 0.75,            // Busy ska rhythms
    syncopation: 0.8,                 // Heavy offbeat ska
    groove: 0.85,                     // Very danceable
    polyrhythmicComplexity: 0.4,

    // Timbral
    brightness: 0.8,                  // Bright, energetic
    warmth: 0.6,
    density: 0.7,
    organicVsSynthetic: 0.15,         // Guitar/horn driven

    // Dynamic
    dynamicRange: 0.5,
    buildIntensity: 0.6,
    releasePattern: 0.5,
    overallEnergy: 0.9,               // HIGH energy

    // Vocal
    vocalPresence: 0.85,
    vocalStyle: 'clean',
    vocalEmotionality: 0.7,
    lyricDensity: 0.7,
    lyricAbstractness: 0.3,           // Direct, motivational

    // Emotional
    valence: 0.9,                     // VERY positive
    arousal: 0.85,                    // High excitement
    tension: 0.25,
    nostalgia: 0.4,
    spirituality: 0.15,

    // Production
    productionEra: '1990s punk',
    productionPolish: 0.65,
    spatialWidth: 0.6,
    reverbAmount: 0.3,
    experimentalism: 0.25,

    // Cultural
    genrePurity: 0.7,                 // Ska-punk blend
    mainstreamness: 0.6,              // Crossover hit
    culturalSpecificity: 0.5,         // California skate culture
    temporalAnchoring: 0.7            // Very 90s
  }
};

/**
 * "Guerrilla Radio" - Rage Against the Machine (THPS2, 2000)
 * Political rap-metal at its peak. Revolutionary energy.
 */
export const GUERRILLA_RADIO_RATM: THPSSong = {
  title: 'Guerrilla Radio',
  artist: 'Rage Against the Machine',
  game: 'THPS2',
  year: 2000,
  genre: ['Rap Metal', 'Alternative Metal', 'Political Rock'],
  isIconic: true,
  genome: {
    tempo: 104,                       // Mid-tempo groove
    tempoVariability: 0.3,
    timeSignatureComplexity: 0.35,
    songLength: 206,                  // 3:26
    structuralPredictability: 0.6,

    key: 'D minor',
    mode: 'minor',
    harmonicComplexity: 0.45,
    dissonanceLevel: 0.5,             // Aggressive dissonance
    chromaticism: 0.4,

    melodicRange: 0.5,
    melodicContour: 'varied',
    melodicComplexity: 0.35,
    hookStrength: 0.85,               // "Lights out" hook

    rhythmicDensity: 0.8,
    syncopation: 0.7,                 // Funk-influenced
    groove: 0.9,                      // HEAVY groove
    polyrhythmicComplexity: 0.5,

    brightness: 0.5,
    warmth: 0.35,                     // Raw, aggressive
    density: 0.8,
    organicVsSynthetic: 0.1,          // All live instruments

    dynamicRange: 0.7,
    buildIntensity: 0.8,
    releasePattern: 0.6,
    overallEnergy: 0.9,

    vocalPresence: 0.9,
    vocalStyle: 'raspy',              // Zack de la Rocha's delivery
    vocalEmotionality: 0.95,          // INTENSE
    lyricDensity: 0.85,
    lyricAbstractness: 0.4,           // Political but direct

    valence: 0.3,                     // Angry, not happy
    arousal: 0.95,                    // MAXIMUM arousal
    tension: 0.85,                    // High tension
    nostalgia: 0.2,
    spirituality: 0.3,                // Revolutionary spirituality

    productionEra: '2000s alt-metal',
    productionPolish: 0.75,
    spatialWidth: 0.7,
    reverbAmount: 0.35,
    experimentalism: 0.55,            // Tom Morello's innovations

    genrePurity: 0.5,                 // Genre-blending
    mainstreamness: 0.65,
    culturalSpecificity: 0.7,         // American political rock
    temporalAnchoring: 0.6
  }
};

/**
 * "Ace of Spades" - Motörhead (THPS3, 2001)
 * Pure heavy metal adrenaline. Lemmy's immortal anthem.
 */
export const ACE_OF_SPADES_MOTORHEAD: THPSSong = {
  title: 'Ace of Spades',
  artist: 'Motörhead',
  game: 'THPS3',
  year: 1980,  // Original release
  genre: ['Heavy Metal', 'Speed Metal', 'Hard Rock'],
  isIconic: true,
  genome: {
    tempo: 142,
    tempoVariability: 0.1,            // Relentless
    timeSignatureComplexity: 0.1,     // Straight 4/4
    songLength: 169,                  // 2:49
    structuralPredictability: 0.85,

    key: 'E minor',
    mode: 'minor',
    harmonicComplexity: 0.25,         // Power chords
    dissonanceLevel: 0.4,
    chromaticism: 0.25,

    melodicRange: 0.45,
    melodicContour: 'static',
    melodicComplexity: 0.25,
    hookStrength: 0.9,

    rhythmicDensity: 0.85,
    syncopation: 0.3,
    groove: 0.8,
    polyrhythmicComplexity: 0.2,

    brightness: 0.55,
    warmth: 0.4,
    density: 0.85,
    organicVsSynthetic: 0.05,         // Raw rock

    dynamicRange: 0.35,               // Consistently loud
    buildIntensity: 0.5,
    releasePattern: 0.4,
    overallEnergy: 0.95,              // MAXIMUM

    vocalPresence: 0.85,
    vocalStyle: 'raspy',              // Lemmy's growl
    vocalEmotionality: 0.75,
    lyricDensity: 0.6,
    lyricAbstractness: 0.35,          // Gambling metaphor

    valence: 0.5,                     // Neutral-aggressive
    arousal: 0.95,
    tension: 0.7,
    nostalgia: 0.3,
    spirituality: 0.1,

    productionEra: '1980s metal',
    productionPolish: 0.5,
    spatialWidth: 0.5,
    reverbAmount: 0.25,
    experimentalism: 0.2,

    genrePurity: 0.85,
    mainstreamness: 0.5,
    culturalSpecificity: 0.6,
    temporalAnchoring: 0.8
  }
};

/**
 * "Police Truck" - Dead Kennedys (THPS1, 1999)
 * Hardcore punk satire. Dark humor about police brutality.
 */
export const POLICE_TRUCK_DK: THPSSong = {
  title: 'Police Truck',
  artist: 'Dead Kennedys',
  game: 'THPS1',
  year: 1980,
  genre: ['Hardcore Punk', 'Punk Rock', 'Political Punk'],
  isIconic: true,
  genome: {
    tempo: 165,
    tempoVariability: 0.2,
    timeSignatureComplexity: 0.15,
    songLength: 180,                  // 3:00
    structuralPredictability: 0.7,

    key: 'A minor',
    mode: 'minor',
    harmonicComplexity: 0.3,
    dissonanceLevel: 0.55,
    chromaticism: 0.35,

    melodicRange: 0.5,
    melodicContour: 'varied',
    melodicComplexity: 0.35,
    hookStrength: 0.7,

    rhythmicDensity: 0.8,
    syncopation: 0.4,
    groove: 0.65,
    polyrhythmicComplexity: 0.25,

    brightness: 0.6,
    warmth: 0.3,
    density: 0.75,
    organicVsSynthetic: 0.1,

    dynamicRange: 0.5,
    buildIntensity: 0.6,
    releasePattern: 0.5,
    overallEnergy: 0.85,

    vocalPresence: 0.9,
    vocalStyle: 'raspy',              // Jello Biafra's sneer
    vocalEmotionality: 0.8,
    lyricDensity: 0.75,
    lyricAbstractness: 0.45,          // Satirical

    valence: 0.25,                    // Dark, angry
    arousal: 0.85,
    tension: 0.75,
    nostalgia: 0.2,
    spirituality: 0.05,

    productionEra: '1980s punk',
    productionPolish: 0.35,           // Raw punk production
    spatialWidth: 0.45,
    reverbAmount: 0.2,
    experimentalism: 0.45,

    genrePurity: 0.85,
    mainstreamness: 0.2,              // Underground
    culturalSpecificity: 0.8,         // American punk
    temporalAnchoring: 0.75
  }
};

/**
 * "No Cigar" - Millencolin (THPS2, 2000)
 * Swedish skate punk perfection. Pure THPS energy.
 */
export const NO_CIGAR_MILLENCOLIN: THPSSong = {
  title: 'No Cigar',
  artist: 'Millencolin',
  game: 'THPS2',
  year: 1999,
  genre: ['Skate Punk', 'Pop Punk', 'Melodic Hardcore'],
  isIconic: true,
  genome: {
    tempo: 180,                       // Fast punk
    tempoVariability: 0.15,
    timeSignatureComplexity: 0.15,
    songLength: 162,                  // 2:42
    structuralPredictability: 0.85,

    key: 'E major',
    mode: 'major',
    harmonicComplexity: 0.3,
    dissonanceLevel: 0.2,
    chromaticism: 0.2,

    melodicRange: 0.6,
    melodicContour: 'ascending',
    melodicComplexity: 0.45,
    hookStrength: 0.85,

    rhythmicDensity: 0.8,
    syncopation: 0.35,
    groove: 0.75,
    polyrhythmicComplexity: 0.2,

    brightness: 0.75,
    warmth: 0.55,
    density: 0.7,
    organicVsSynthetic: 0.15,

    dynamicRange: 0.45,
    buildIntensity: 0.6,
    releasePattern: 0.5,
    overallEnergy: 0.88,

    vocalPresence: 0.85,
    vocalStyle: 'clean',
    vocalEmotionality: 0.65,
    lyricDensity: 0.7,
    lyricAbstractness: 0.35,

    valence: 0.75,
    arousal: 0.85,
    tension: 0.35,
    nostalgia: 0.35,
    spirituality: 0.1,

    productionEra: '1990s punk',
    productionPolish: 0.65,
    spatialWidth: 0.55,
    reverbAmount: 0.25,
    experimentalism: 0.2,

    genrePurity: 0.9,                 // Pure skate punk
    mainstreamness: 0.45,
    culturalSpecificity: 0.7,
    temporalAnchoring: 0.7
  }
};

/**
 * "When Worlds Collide" - Powerman 5000 (THPS2, 2000)
 * Industrial metal meets nu-metal. Sci-fi aggression.
 */
export const WHEN_WORLDS_COLLIDE_PM5K: THPSSong = {
  title: 'When Worlds Collide',
  artist: 'Powerman 5000',
  game: 'THPS2',
  year: 1999,
  genre: ['Industrial Metal', 'Nu Metal', 'Alternative Metal'],
  isIconic: true,
  genome: {
    tempo: 136,
    tempoVariability: 0.25,
    timeSignatureComplexity: 0.3,
    songLength: 200,                  // 3:20
    structuralPredictability: 0.7,

    key: 'D minor',
    mode: 'minor',
    harmonicComplexity: 0.4,
    dissonanceLevel: 0.55,
    chromaticism: 0.4,

    melodicRange: 0.5,
    melodicContour: 'varied',
    melodicComplexity: 0.4,
    hookStrength: 0.88,

    rhythmicDensity: 0.75,
    syncopation: 0.5,
    groove: 0.8,
    polyrhythmicComplexity: 0.35,

    brightness: 0.55,
    warmth: 0.35,
    density: 0.8,
    organicVsSynthetic: 0.45,         // Synth + guitar blend

    dynamicRange: 0.6,
    buildIntensity: 0.75,
    releasePattern: 0.55,
    overallEnergy: 0.88,

    vocalPresence: 0.85,
    vocalStyle: 'raspy',
    vocalEmotionality: 0.7,
    lyricDensity: 0.6,
    lyricAbstractness: 0.5,           // Sci-fi imagery

    valence: 0.4,
    arousal: 0.85,
    tension: 0.65,
    nostalgia: 0.2,
    spirituality: 0.15,

    productionEra: '2000s industrial',
    productionPolish: 0.75,
    spatialWidth: 0.7,
    reverbAmount: 0.4,
    experimentalism: 0.5,

    genrePurity: 0.55,
    mainstreamness: 0.6,
    culturalSpecificity: 0.5,
    temporalAnchoring: 0.65
  }
};

/**
 * "96 Quite Bitter Beings" - CKY (THPS3, 2001)
 * Bam Margera's band. Skate culture embodied.
 */
export const QUITE_BITTER_BEINGS_CKY: THPSSong = {
  title: '96 Quite Bitter Beings',
  artist: 'CKY',
  game: 'THPS3',
  year: 1999,
  genre: ['Alternative Metal', 'Post-Grunge', 'Hard Rock'],
  isIconic: true,
  genome: {
    tempo: 145,
    tempoVariability: 0.2,
    timeSignatureComplexity: 0.25,
    songLength: 261,                  // 4:21
    structuralPredictability: 0.65,

    key: 'F# minor',
    mode: 'minor',
    harmonicComplexity: 0.5,
    dissonanceLevel: 0.45,
    chromaticism: 0.4,

    melodicRange: 0.55,
    melodicContour: 'varied',
    melodicComplexity: 0.5,
    hookStrength: 0.82,

    rhythmicDensity: 0.7,
    syncopation: 0.45,
    groove: 0.75,
    polyrhythmicComplexity: 0.35,

    brightness: 0.5,
    warmth: 0.45,
    density: 0.75,
    organicVsSynthetic: 0.2,

    dynamicRange: 0.6,
    buildIntensity: 0.7,
    releasePattern: 0.55,
    overallEnergy: 0.8,

    vocalPresence: 0.8,
    vocalStyle: 'clean',
    vocalEmotionality: 0.6,
    lyricDensity: 0.5,
    lyricAbstractness: 0.55,

    valence: 0.35,
    arousal: 0.75,
    tension: 0.55,
    nostalgia: 0.3,
    spirituality: 0.1,

    productionEra: '2000s alt-metal',
    productionPolish: 0.7,
    spatialWidth: 0.65,
    reverbAmount: 0.4,
    experimentalism: 0.4,

    genrePurity: 0.6,
    mainstreamness: 0.5,
    culturalSpecificity: 0.75,        // Skate/Jackass culture
    temporalAnchoring: 0.7
  }
};

/**
 * "Jerry Was a Race Car Driver" - Primus (THPS1, 1999)
 * Funk-metal weirdness. Les Claypool's bass wizardry.
 */
export const JERRY_RACE_CAR_PRIMUS: THPSSong = {
  title: 'Jerry Was a Race Car Driver',
  artist: 'Primus',
  game: 'THPS1',
  year: 1991,
  genre: ['Funk Metal', 'Alternative Metal', 'Experimental Rock'],
  isIconic: true,
  genome: {
    tempo: 104,
    tempoVariability: 0.35,
    timeSignatureComplexity: 0.55,    // Weird Primus time
    songLength: 235,                  // 3:55
    structuralPredictability: 0.45,

    key: 'E minor',
    mode: 'minor',
    harmonicComplexity: 0.6,
    dissonanceLevel: 0.5,
    chromaticism: 0.5,

    melodicRange: 0.5,
    melodicContour: 'varied',
    melodicComplexity: 0.55,
    hookStrength: 0.75,

    rhythmicDensity: 0.85,
    syncopation: 0.8,                 // Extremely syncopated
    groove: 0.9,                      // Funky as hell
    polyrhythmicComplexity: 0.7,      // Complex layering

    brightness: 0.5,
    warmth: 0.5,
    density: 0.65,
    organicVsSynthetic: 0.1,

    dynamicRange: 0.6,
    buildIntensity: 0.55,
    releasePattern: 0.5,
    overallEnergy: 0.75,

    vocalPresence: 0.8,
    vocalStyle: 'mixed',              // Les's weird delivery
    vocalEmotionality: 0.5,
    lyricDensity: 0.6,
    lyricAbstractness: 0.6,           // Absurdist storytelling

    valence: 0.45,
    arousal: 0.7,
    tension: 0.5,
    nostalgia: 0.3,
    spirituality: 0.1,

    productionEra: '1990s alt-metal',
    productionPolish: 0.65,
    spatialWidth: 0.6,
    reverbAmount: 0.35,
    experimentalism: 0.75,            // VERY experimental

    genrePurity: 0.35,                // Genre-defying
    mainstreamness: 0.4,
    culturalSpecificity: 0.5,
    temporalAnchoring: 0.6
  }
};

/**
 * "You" - Bad Religion (THPS2, 2000)
 * Intellectual punk rock. Melodic hardcore perfection.
 */
export const YOU_BAD_RELIGION: THPSSong = {
  title: 'You',
  artist: 'Bad Religion',
  game: 'THPS2',
  year: 2000,
  genre: ['Punk Rock', 'Melodic Hardcore', 'Skate Punk'],
  isIconic: true,
  genome: {
    tempo: 178,
    tempoVariability: 0.15,
    timeSignatureComplexity: 0.15,
    songLength: 127,                  // 2:07 - short and fast
    structuralPredictability: 0.8,

    key: 'A major',
    mode: 'major',
    harmonicComplexity: 0.4,
    dissonanceLevel: 0.25,
    chromaticism: 0.3,

    melodicRange: 0.65,
    melodicContour: 'ascending',
    melodicComplexity: 0.5,
    hookStrength: 0.8,

    rhythmicDensity: 0.8,
    syncopation: 0.35,
    groove: 0.7,
    polyrhythmicComplexity: 0.25,

    brightness: 0.7,
    warmth: 0.5,
    density: 0.7,
    organicVsSynthetic: 0.1,

    dynamicRange: 0.45,
    buildIntensity: 0.55,
    releasePattern: 0.5,
    overallEnergy: 0.85,

    vocalPresence: 0.9,
    vocalStyle: 'clean',
    vocalEmotionality: 0.7,
    lyricDensity: 0.8,                // Dense, intelligent lyrics
    lyricAbstractness: 0.5,

    valence: 0.55,
    arousal: 0.8,
    tension: 0.45,
    nostalgia: 0.25,
    spirituality: 0.2,                // Philosophical punk

    productionEra: '2000s punk',
    productionPolish: 0.7,
    spatialWidth: 0.55,
    reverbAmount: 0.25,
    experimentalism: 0.3,

    genrePurity: 0.85,
    mainstreamness: 0.45,
    culturalSpecificity: 0.65,
    temporalAnchoring: 0.6
  }
};

/**
 * "Drunken Lullabies" - Flogging Molly (THUG, 2003)
 * Celtic punk energy. Irish-American rebel spirit.
 */
export const DRUNKEN_LULLABIES_FM: THPSSong = {
  title: 'Drunken Lullabies',
  artist: 'Flogging Molly',
  game: 'THUG',
  year: 2002,
  genre: ['Celtic Punk', 'Folk Punk', 'Irish Rock'],
  isIconic: true,
  genome: {
    tempo: 160,
    tempoVariability: 0.2,
    timeSignatureComplexity: 0.35,    // Irish time signatures
    songLength: 252,                  // 4:12
    structuralPredictability: 0.65,

    key: 'D major',
    mode: 'major',
    harmonicComplexity: 0.45,
    dissonanceLevel: 0.2,
    chromaticism: 0.3,

    melodicRange: 0.7,
    melodicContour: 'varied',
    melodicComplexity: 0.55,
    hookStrength: 0.85,

    rhythmicDensity: 0.75,
    syncopation: 0.55,
    groove: 0.85,                     // Very danceable
    polyrhythmicComplexity: 0.45,

    brightness: 0.7,
    warmth: 0.7,                      // Warm folk tones
    density: 0.75,
    organicVsSynthetic: 0.05,         // All acoustic/traditional

    dynamicRange: 0.65,
    buildIntensity: 0.75,
    releasePattern: 0.6,
    overallEnergy: 0.88,

    vocalPresence: 0.85,
    vocalStyle: 'raspy',              // Dave King's delivery
    vocalEmotionality: 0.85,
    lyricDensity: 0.75,
    lyricAbstractness: 0.4,           // Storytelling

    valence: 0.65,                    // Bittersweet joy
    arousal: 0.85,
    tension: 0.4,
    nostalgia: 0.7,                   // Strong nostalgia
    spirituality: 0.35,               // Irish spirituality

    productionEra: '2000s folk punk',
    productionPolish: 0.65,
    spatialWidth: 0.65,
    reverbAmount: 0.35,
    experimentalism: 0.4,

    genrePurity: 0.75,
    mainstreamness: 0.45,
    culturalSpecificity: 0.9,         // Very Irish-American
    temporalAnchoring: 0.5
  }
};

/**
 * "May 16" - Lagwagon (THPS2, 2000)
 * Technical skate punk. Fat Wreck Chords perfection.
 */
export const MAY_16_LAGWAGON: THPSSong = {
  title: 'May 16',
  artist: 'Lagwagon',
  game: 'THPS2',
  year: 1998,
  genre: ['Skate Punk', 'Melodic Hardcore', 'Pop Punk'],
  isIconic: true,
  genome: {
    tempo: 195,                       // Very fast punk
    tempoVariability: 0.15,
    timeSignatureComplexity: 0.2,
    songLength: 147,                  // 2:27
    structuralPredictability: 0.75,

    key: 'C major',
    mode: 'major',
    harmonicComplexity: 0.4,
    dissonanceLevel: 0.2,
    chromaticism: 0.25,

    melodicRange: 0.7,
    melodicContour: 'ascending',
    melodicComplexity: 0.5,
    hookStrength: 0.82,

    rhythmicDensity: 0.85,
    syncopation: 0.4,
    groove: 0.7,
    polyrhythmicComplexity: 0.25,

    brightness: 0.75,
    warmth: 0.5,
    density: 0.7,
    organicVsSynthetic: 0.1,

    dynamicRange: 0.45,
    buildIntensity: 0.6,
    releasePattern: 0.5,
    overallEnergy: 0.9,

    vocalPresence: 0.85,
    vocalStyle: 'clean',
    vocalEmotionality: 0.7,
    lyricDensity: 0.75,
    lyricAbstractness: 0.4,

    valence: 0.6,
    arousal: 0.88,
    tension: 0.4,
    nostalgia: 0.35,
    spirituality: 0.1,

    productionEra: '1990s punk',
    productionPolish: 0.65,
    spatialWidth: 0.55,
    reverbAmount: 0.25,
    experimentalism: 0.25,

    genrePurity: 0.9,
    mainstreamness: 0.35,
    culturalSpecificity: 0.7,
    temporalAnchoring: 0.65
  }
};

/**
 * "New Girl" - The Suicide Machines (THPS1, 1999)
 * Detroit ska-punk aggression. High-velocity positivity.
 */
export const NEW_GIRL_SUICIDE_MACHINES: THPSSong = {
  title: 'New Girl',
  artist: 'The Suicide Machines',
  game: 'THPS1',
  year: 1996,
  genre: ['Ska Punk', 'Skate Punk', 'Hardcore Punk'],
  isIconic: true,
  genome: {
    tempo: 185,
    tempoVariability: 0.2,
    timeSignatureComplexity: 0.25,
    songLength: 168,                  // 2:48
    structuralPredictability: 0.75,

    key: 'E major',
    mode: 'major',
    harmonicComplexity: 0.35,
    dissonanceLevel: 0.25,
    chromaticism: 0.2,

    melodicRange: 0.6,
    melodicContour: 'varied',
    melodicComplexity: 0.4,
    hookStrength: 0.78,

    rhythmicDensity: 0.8,
    syncopation: 0.7,                 // Ska upbeats
    groove: 0.8,
    polyrhythmicComplexity: 0.35,

    brightness: 0.75,
    warmth: 0.5,
    density: 0.7,
    organicVsSynthetic: 0.1,

    dynamicRange: 0.5,
    buildIntensity: 0.65,
    releasePattern: 0.5,
    overallEnergy: 0.88,

    vocalPresence: 0.85,
    vocalStyle: 'raspy',
    vocalEmotionality: 0.75,
    lyricDensity: 0.7,
    lyricAbstractness: 0.3,

    valence: 0.7,
    arousal: 0.85,
    tension: 0.35,
    nostalgia: 0.3,
    spirituality: 0.1,

    productionEra: '1990s punk',
    productionPolish: 0.55,
    spatialWidth: 0.5,
    reverbAmount: 0.25,
    experimentalism: 0.3,

    genrePurity: 0.75,
    mainstreamness: 0.35,
    culturalSpecificity: 0.65,
    temporalAnchoring: 0.7
  }
};

/**
 * "Blood Brothers" - Papa Roach (THPS2, 2000)
 * Nu-metal brotherhood anthem. Mainstream crossover.
 */
export const BLOOD_BROTHERS_PAPA_ROACH: THPSSong = {
  title: 'Blood Brothers',
  artist: 'Papa Roach',
  game: 'THPS2',
  year: 2000,
  genre: ['Nu Metal', 'Alternative Metal', 'Rap Rock'],
  isIconic: true,
  genome: {
    tempo: 92,                        // Mid-tempo groove
    tempoVariability: 0.25,
    timeSignatureComplexity: 0.2,
    songLength: 203,                  // 3:23
    structuralPredictability: 0.75,

    key: 'D minor',
    mode: 'minor',
    harmonicComplexity: 0.35,
    dissonanceLevel: 0.45,
    chromaticism: 0.35,

    melodicRange: 0.55,
    melodicContour: 'varied',
    melodicComplexity: 0.35,
    hookStrength: 0.85,

    rhythmicDensity: 0.7,
    syncopation: 0.5,
    groove: 0.8,
    polyrhythmicComplexity: 0.3,

    brightness: 0.5,
    warmth: 0.4,
    density: 0.75,
    organicVsSynthetic: 0.25,

    dynamicRange: 0.6,
    buildIntensity: 0.7,
    releasePattern: 0.6,
    overallEnergy: 0.82,

    vocalPresence: 0.9,
    vocalStyle: 'mixed',              // Clean + screaming
    vocalEmotionality: 0.85,
    lyricDensity: 0.7,
    lyricAbstractness: 0.35,

    valence: 0.4,
    arousal: 0.8,
    tension: 0.6,
    nostalgia: 0.25,
    spirituality: 0.2,

    productionEra: '2000s nu-metal',
    productionPolish: 0.8,
    spatialWidth: 0.7,
    reverbAmount: 0.4,
    experimentalism: 0.3,

    genrePurity: 0.7,
    mainstreamness: 0.75,
    culturalSpecificity: 0.5,
    temporalAnchoring: 0.75
  }
};

/**
 * "Cyclone" - Dub Pistols (THPS2, 2000)
 * Big beat meets ska. UK dub culture.
 */
export const CYCLONE_DUB_PISTOLS: THPSSong = {
  title: 'Cyclone',
  artist: 'Dub Pistols',
  game: 'THPS2',
  year: 1998,
  genre: ['Big Beat', 'Dub', 'Electronic Rock'],
  isIconic: true,
  genome: {
    tempo: 115,
    tempoVariability: 0.15,
    timeSignatureComplexity: 0.2,
    songLength: 195,                  // 3:15
    structuralPredictability: 0.7,

    key: 'G minor',
    mode: 'minor',
    harmonicComplexity: 0.4,
    dissonanceLevel: 0.3,
    chromaticism: 0.3,

    melodicRange: 0.45,
    melodicContour: 'static',
    melodicComplexity: 0.3,
    hookStrength: 0.75,

    rhythmicDensity: 0.8,
    syncopation: 0.65,                // Dub rhythms
    groove: 0.9,                      // Heavy groove
    polyrhythmicComplexity: 0.5,

    brightness: 0.55,
    warmth: 0.6,
    density: 0.75,
    organicVsSynthetic: 0.55,         // Electronic + live blend

    dynamicRange: 0.55,
    buildIntensity: 0.65,
    releasePattern: 0.6,
    overallEnergy: 0.82,

    vocalPresence: 0.7,
    vocalStyle: 'mixed',
    vocalEmotionality: 0.6,
    lyricDensity: 0.5,
    lyricAbstractness: 0.45,

    valence: 0.5,
    arousal: 0.75,
    tension: 0.5,
    nostalgia: 0.2,
    spirituality: 0.15,

    productionEra: '1990s big beat',
    productionPolish: 0.75,
    spatialWidth: 0.75,
    reverbAmount: 0.5,
    experimentalism: 0.55,

    genrePurity: 0.5,
    mainstreamness: 0.45,
    culturalSpecificity: 0.7,         // UK dub/big beat
    temporalAnchoring: 0.65
  }
};

/**
 * "If You Must" - Del the Funky Homosapien (THPS3, 2001)
 * Alternative hip-hop genius. Hieroglyphics crew.
 */
export const IF_YOU_MUST_DEL: THPSSong = {
  title: 'If You Must',
  artist: 'Del the Funky Homosapien',
  game: 'THPS3',
  year: 2000,
  genre: ['Alternative Hip Hop', 'Underground Hip Hop', 'West Coast Hip Hop'],
  isIconic: true,
  genome: {
    tempo: 96,
    tempoVariability: 0.1,
    timeSignatureComplexity: 0.2,
    songLength: 225,                  // 3:45
    structuralPredictability: 0.7,

    key: 'C minor',
    mode: 'minor',
    harmonicComplexity: 0.5,
    dissonanceLevel: 0.25,
    chromaticism: 0.35,

    melodicRange: 0.5,
    melodicContour: 'varied',
    melodicComplexity: 0.55,
    hookStrength: 0.82,

    rhythmicDensity: 0.75,
    syncopation: 0.7,                 // Hip-hop syncopation
    groove: 0.88,                     // Funky groove
    polyrhythmicComplexity: 0.45,

    brightness: 0.5,
    warmth: 0.65,
    density: 0.6,
    organicVsSynthetic: 0.4,

    dynamicRange: 0.45,
    buildIntensity: 0.5,
    releasePattern: 0.45,
    overallEnergy: 0.75,

    vocalPresence: 0.95,              // Rap-focused
    vocalStyle: 'clean',
    vocalEmotionality: 0.6,
    lyricDensity: 0.95,               // Dense rap lyrics
    lyricAbstractness: 0.55,          // Playful, clever

    valence: 0.65,
    arousal: 0.7,
    tension: 0.3,
    nostalgia: 0.25,
    spirituality: 0.15,

    productionEra: '2000s alt-hip-hop',
    productionPolish: 0.7,
    spatialWidth: 0.6,
    reverbAmount: 0.3,
    experimentalism: 0.55,

    genrePurity: 0.7,
    mainstreamness: 0.35,
    culturalSpecificity: 0.8,         // Bay Area underground
    temporalAnchoring: 0.55
  }
};

/**
 * "Amoeba" - Adolescents (THPS3, 2001)
 * Classic OC hardcore. First-wave SoCal punk.
 */
export const AMOEBA_ADOLESCENTS: THPSSong = {
  title: 'Amoeba',
  artist: 'Adolescents',
  game: 'THPS3',
  year: 1981,
  genre: ['Hardcore Punk', 'Punk Rock', 'SoCal Punk'],
  isIconic: true,
  genome: {
    tempo: 175,
    tempoVariability: 0.15,
    timeSignatureComplexity: 0.1,
    songLength: 125,                  // 2:05 - short punk
    structuralPredictability: 0.8,

    key: 'A major',
    mode: 'major',
    harmonicComplexity: 0.25,
    dissonanceLevel: 0.35,
    chromaticism: 0.2,

    melodicRange: 0.5,
    melodicContour: 'varied',
    melodicComplexity: 0.3,
    hookStrength: 0.75,

    rhythmicDensity: 0.8,
    syncopation: 0.3,
    groove: 0.65,
    polyrhythmicComplexity: 0.15,

    brightness: 0.7,
    warmth: 0.35,
    density: 0.7,
    organicVsSynthetic: 0.05,

    dynamicRange: 0.4,
    buildIntensity: 0.55,
    releasePattern: 0.45,
    overallEnergy: 0.88,

    vocalPresence: 0.85,
    vocalStyle: 'raspy',
    vocalEmotionality: 0.7,
    lyricDensity: 0.65,
    lyricAbstractness: 0.45,

    valence: 0.5,
    arousal: 0.85,
    tension: 0.55,
    nostalgia: 0.4,
    spirituality: 0.05,

    productionEra: '1980s punk',
    productionPolish: 0.35,
    spatialWidth: 0.4,
    reverbAmount: 0.2,
    experimentalism: 0.2,

    genrePurity: 0.9,
    mainstreamness: 0.2,
    culturalSpecificity: 0.85,        // Orange County punk
    temporalAnchoring: 0.85
  }
};

/**
 * "Shimmy" - System of a Down (THPS4, 2002)
 * Armenian-American metal chaos. Controlled insanity.
 */
export const SHIMMY_SOAD: THPSSong = {
  title: 'Shimmy',
  artist: 'System of a Down',
  game: 'THPS4',
  year: 2001,
  genre: ['Alternative Metal', 'Nu Metal', 'Progressive Metal'],
  isIconic: true,
  genome: {
    tempo: 130,
    tempoVariability: 0.4,            // SOAD tempo changes
    timeSignatureComplexity: 0.6,     // Complex meters
    songLength: 251,                  // 4:11
    structuralPredictability: 0.45,

    key: 'D minor',
    mode: 'minor',
    harmonicComplexity: 0.6,
    dissonanceLevel: 0.6,
    chromaticism: 0.55,

    melodicRange: 0.75,
    melodicContour: 'varied',
    melodicComplexity: 0.65,
    hookStrength: 0.8,

    rhythmicDensity: 0.85,
    syncopation: 0.7,
    groove: 0.75,
    polyrhythmicComplexity: 0.6,

    brightness: 0.5,
    warmth: 0.35,
    density: 0.85,
    organicVsSynthetic: 0.1,

    dynamicRange: 0.75,
    buildIntensity: 0.8,
    releasePattern: 0.65,
    overallEnergy: 0.9,

    vocalPresence: 0.9,
    vocalStyle: 'mixed',              // Serj's range
    vocalEmotionality: 0.9,
    lyricDensity: 0.7,
    lyricAbstractness: 0.65,          // Political/surreal

    valence: 0.3,
    arousal: 0.9,
    tension: 0.75,
    nostalgia: 0.15,
    spirituality: 0.35,               // Armenian spiritual themes

    productionEra: '2000s alt-metal',
    productionPolish: 0.8,
    spatialWidth: 0.7,
    reverbAmount: 0.35,
    experimentalism: 0.7,             // Very experimental

    genrePurity: 0.4,                 // Genre-defying
    mainstreamness: 0.6,
    culturalSpecificity: 0.75,        // Armenian-American
    temporalAnchoring: 0.6
  }
};

/**
 * "TNT" - AC/DC (THPS4, 2002)
 * Classic hard rock. Australian thunder.
 */
export const TNT_ACDC: THPSSong = {
  title: 'TNT',
  artist: 'AC/DC',
  game: 'THPS4',
  year: 1975,
  genre: ['Hard Rock', 'Classic Rock', 'Blues Rock'],
  isIconic: true,
  genome: {
    tempo: 126,
    tempoVariability: 0.1,
    timeSignatureComplexity: 0.1,
    songLength: 215,                  // 3:35
    structuralPredictability: 0.85,

    key: 'E major',
    mode: 'major',
    harmonicComplexity: 0.25,
    dissonanceLevel: 0.3,
    chromaticism: 0.2,

    melodicRange: 0.55,
    melodicContour: 'varied',
    melodicComplexity: 0.3,
    hookStrength: 0.95,               // ICONIC hook

    rhythmicDensity: 0.7,
    syncopation: 0.35,
    groove: 0.85,
    polyrhythmicComplexity: 0.15,

    brightness: 0.65,
    warmth: 0.55,
    density: 0.7,
    organicVsSynthetic: 0.05,

    dynamicRange: 0.5,
    buildIntensity: 0.6,
    releasePattern: 0.5,
    overallEnergy: 0.88,

    vocalPresence: 0.9,
    vocalStyle: 'raspy',              // Bon Scott's scream
    vocalEmotionality: 0.8,
    lyricDensity: 0.55,
    lyricAbstractness: 0.25,

    valence: 0.7,
    arousal: 0.85,
    tension: 0.45,
    nostalgia: 0.5,
    spirituality: 0.05,

    productionEra: '1970s rock',
    productionPolish: 0.55,
    spatialWidth: 0.55,
    reverbAmount: 0.3,
    experimentalism: 0.15,

    genrePurity: 0.9,
    mainstreamness: 0.7,
    culturalSpecificity: 0.6,         // Australian rock
    temporalAnchoring: 0.8
  }
};

/**
 * "Dig It" - Skinny Puppy (THUG, 2003)
 * Industrial darkness. Vancouver underground.
 */
export const DIG_IT_SKINNY_PUPPY: THPSSong = {
  title: 'Dig It',
  artist: 'Skinny Puppy',
  game: 'THUG',
  year: 1986,
  genre: ['Industrial', 'Electro-Industrial', 'EBM'],
  isIconic: false,
  genome: {
    tempo: 118,
    tempoVariability: 0.25,
    timeSignatureComplexity: 0.35,
    songLength: 275,                  // 4:35
    structuralPredictability: 0.5,

    key: 'B minor',
    mode: 'minor',
    harmonicComplexity: 0.55,
    dissonanceLevel: 0.7,
    chromaticism: 0.55,

    melodicRange: 0.45,
    melodicContour: 'static',
    melodicComplexity: 0.4,
    hookStrength: 0.65,

    rhythmicDensity: 0.75,
    syncopation: 0.5,
    groove: 0.7,
    polyrhythmicComplexity: 0.5,

    brightness: 0.35,
    warmth: 0.25,
    density: 0.8,
    organicVsSynthetic: 0.8,          // Heavily electronic

    dynamicRange: 0.6,
    buildIntensity: 0.7,
    releasePattern: 0.55,
    overallEnergy: 0.75,

    vocalPresence: 0.8,
    vocalStyle: 'mixed',
    vocalEmotionality: 0.7,
    lyricDensity: 0.5,
    lyricAbstractness: 0.75,          // Abstract/dark

    valence: 0.2,                     // Dark
    arousal: 0.7,
    tension: 0.75,
    nostalgia: 0.2,
    spirituality: 0.25,

    productionEra: '1980s industrial',
    productionPolish: 0.6,
    spatialWidth: 0.7,
    reverbAmount: 0.6,
    experimentalism: 0.8,

    genrePurity: 0.8,
    mainstreamness: 0.15,
    culturalSpecificity: 0.7,
    temporalAnchoring: 0.7
  }
};

/**
 * "Blame It on the Girls" - Mika (THPS 1+2 Remaster, 2020)
 * Modern pop-rock glam. Theatrical energy.
 */
export const BLAME_IT_ON_GIRLS_MIKA: THPSSong = {
  title: 'Blame It on the Girls',
  artist: 'Mika',
  game: 'THPS1+2',
  year: 2009,
  genre: ['Pop Rock', 'Glam Rock', 'Alternative Pop'],
  isIconic: false,
  genome: {
    tempo: 150,
    tempoVariability: 0.15,
    timeSignatureComplexity: 0.2,
    songLength: 200,                  // 3:20
    structuralPredictability: 0.8,

    key: 'F major',
    mode: 'major',
    harmonicComplexity: 0.45,
    dissonanceLevel: 0.15,
    chromaticism: 0.3,

    melodicRange: 0.85,               // Mika's range
    melodicContour: 'ascending',
    melodicComplexity: 0.55,
    hookStrength: 0.85,

    rhythmicDensity: 0.7,
    syncopation: 0.45,
    groove: 0.8,
    polyrhythmicComplexity: 0.3,

    brightness: 0.85,
    warmth: 0.65,
    density: 0.7,
    organicVsSynthetic: 0.35,

    dynamicRange: 0.65,
    buildIntensity: 0.7,
    releasePattern: 0.6,
    overallEnergy: 0.85,

    vocalPresence: 0.95,
    vocalStyle: 'clean',
    vocalEmotionality: 0.8,
    lyricDensity: 0.7,
    lyricAbstractness: 0.35,

    valence: 0.8,
    arousal: 0.8,
    tension: 0.3,
    nostalgia: 0.35,
    spirituality: 0.1,

    productionEra: '2000s pop',
    productionPolish: 0.9,
    spatialWidth: 0.7,
    reverbAmount: 0.35,
    experimentalism: 0.35,

    genrePurity: 0.6,
    mainstreamness: 0.75,
    culturalSpecificity: 0.4,
    temporalAnchoring: 0.5
  }
};

/**
 * "Bring the Noise" - Anthrax ft. Public Enemy (THPS2, 2000)
 * Rap-metal genesis. The crossover that started it all.
 */
export const BRING_THE_NOISE_ANTHRAX: THPSSong = {
  title: 'Bring the Noise',
  artist: 'Anthrax ft. Public Enemy',
  game: 'THPS2',
  year: 1991,
  genre: ['Rap Metal', 'Thrash Metal', 'Hip Hop'],
  isIconic: true,
  genome: {
    tempo: 109,
    tempoVariability: 0.2,
    timeSignatureComplexity: 0.25,
    songLength: 226,                  // 3:46
    structuralPredictability: 0.65,

    key: 'E minor',
    mode: 'minor',
    harmonicComplexity: 0.4,
    dissonanceLevel: 0.5,
    chromaticism: 0.35,

    melodicRange: 0.5,
    melodicContour: 'varied',
    melodicComplexity: 0.4,
    hookStrength: 0.88,

    rhythmicDensity: 0.85,
    syncopation: 0.7,
    groove: 0.85,
    polyrhythmicComplexity: 0.55,

    brightness: 0.55,
    warmth: 0.35,
    density: 0.8,
    organicVsSynthetic: 0.25,

    dynamicRange: 0.6,
    buildIntensity: 0.75,
    releasePattern: 0.55,
    overallEnergy: 0.92,

    vocalPresence: 0.95,
    vocalStyle: 'raspy',
    vocalEmotionality: 0.85,
    lyricDensity: 0.9,                // Dense rap
    lyricAbstractness: 0.45,

    valence: 0.35,
    arousal: 0.92,
    tension: 0.7,
    nostalgia: 0.3,
    spirituality: 0.2,

    productionEra: '1990s rap-metal',
    productionPolish: 0.7,
    spatialWidth: 0.65,
    reverbAmount: 0.3,
    experimentalism: 0.65,

    genrePurity: 0.4,                 // Genre fusion
    mainstreamness: 0.55,
    culturalSpecificity: 0.75,
    temporalAnchoring: 0.7
  }
};

/**
 * "Euro-Barge" - The Vandals (THPS1, 1999)
 * SoCal punk humor. Silly skate energy.
 */
export const EURO_BARGE_VANDALS: THPSSong = {
  title: 'Euro-Barge',
  artist: 'The Vandals',
  game: 'THPS1',
  year: 1998,
  genre: ['Pop Punk', 'Skate Punk', 'Comedy Punk'],
  isIconic: true,
  genome: {
    tempo: 168,
    tempoVariability: 0.2,
    timeSignatureComplexity: 0.2,
    songLength: 158,                  // 2:38
    structuralPredictability: 0.75,

    key: 'G major',
    mode: 'major',
    harmonicComplexity: 0.3,
    dissonanceLevel: 0.2,
    chromaticism: 0.2,

    melodicRange: 0.55,
    melodicContour: 'varied',
    melodicComplexity: 0.35,
    hookStrength: 0.72,

    rhythmicDensity: 0.75,
    syncopation: 0.35,
    groove: 0.7,
    polyrhythmicComplexity: 0.2,

    brightness: 0.75,
    warmth: 0.55,
    density: 0.65,
    organicVsSynthetic: 0.1,

    dynamicRange: 0.45,
    buildIntensity: 0.55,
    releasePattern: 0.5,
    overallEnergy: 0.82,

    vocalPresence: 0.85,
    vocalStyle: 'clean',
    vocalEmotionality: 0.6,
    lyricDensity: 0.7,
    lyricAbstractness: 0.4,           // Humorous

    valence: 0.75,
    arousal: 0.78,
    tension: 0.25,
    nostalgia: 0.3,
    spirituality: 0.05,

    productionEra: '1990s punk',
    productionPolish: 0.6,
    spatialWidth: 0.5,
    reverbAmount: 0.25,
    experimentalism: 0.25,

    genrePurity: 0.85,
    mainstreamness: 0.35,
    culturalSpecificity: 0.7,
    temporalAnchoring: 0.65
  }
};

/**
 * "Lights Out" - Angry Fist (THPS2, 2000)
 * Japanese punk rock. International skate scene.
 */
export const LIGHTS_OUT_ANGRY_FIST: THPSSong = {
  title: 'Lights Out',
  artist: 'Angry Fist',
  game: 'THPS2',
  year: 1999,
  genre: ['Punk Rock', 'Japanese Punk', 'Melodic Punk'],
  isIconic: false,
  genome: {
    tempo: 182,
    tempoVariability: 0.15,
    timeSignatureComplexity: 0.15,
    songLength: 145,                  // 2:25
    structuralPredictability: 0.8,

    key: 'E major',
    mode: 'major',
    harmonicComplexity: 0.3,
    dissonanceLevel: 0.25,
    chromaticism: 0.2,

    melodicRange: 0.6,
    melodicContour: 'ascending',
    melodicComplexity: 0.4,
    hookStrength: 0.75,

    rhythmicDensity: 0.8,
    syncopation: 0.35,
    groove: 0.7,
    polyrhythmicComplexity: 0.2,

    brightness: 0.75,
    warmth: 0.5,
    density: 0.7,
    organicVsSynthetic: 0.1,

    dynamicRange: 0.45,
    buildIntensity: 0.6,
    releasePattern: 0.5,
    overallEnergy: 0.85,

    vocalPresence: 0.85,
    vocalStyle: 'clean',
    vocalEmotionality: 0.65,
    lyricDensity: 0.65,
    lyricAbstractness: 0.35,

    valence: 0.7,
    arousal: 0.82,
    tension: 0.35,
    nostalgia: 0.25,
    spirituality: 0.1,

    productionEra: '1990s punk',
    productionPolish: 0.6,
    spatialWidth: 0.5,
    reverbAmount: 0.25,
    experimentalism: 0.2,

    genrePurity: 0.85,
    mainstreamness: 0.25,
    culturalSpecificity: 0.7,         // Japanese punk scene
    temporalAnchoring: 0.65
  }
};

/**
 * "The Impression That I Get" - Mighty Mighty Bosstones (THPS3, 2001)
 * Ska-core anthem. Boston's finest.
 */
export const IMPRESSION_BOSSTONES: THPSSong = {
  title: 'The Impression That I Get',
  artist: 'Mighty Mighty Bosstones',
  game: 'THPS3',
  year: 1997,
  genre: ['Ska Core', 'Ska Punk', 'Third Wave Ska'],
  isIconic: true,
  genome: {
    tempo: 142,
    tempoVariability: 0.15,
    timeSignatureComplexity: 0.25,
    songLength: 210,                  // 3:30
    structuralPredictability: 0.75,

    key: 'E major',
    mode: 'major',
    harmonicComplexity: 0.4,
    dissonanceLevel: 0.2,
    chromaticism: 0.25,

    melodicRange: 0.6,
    melodicContour: 'varied',
    melodicComplexity: 0.45,
    hookStrength: 0.92,               // MASSIVE hook

    rhythmicDensity: 0.75,
    syncopation: 0.75,                // Heavy ska offbeat
    groove: 0.88,
    polyrhythmicComplexity: 0.4,

    brightness: 0.75,
    warmth: 0.6,
    density: 0.7,
    organicVsSynthetic: 0.1,          // Horns + guitars

    dynamicRange: 0.6,
    buildIntensity: 0.7,
    releasePattern: 0.55,
    overallEnergy: 0.85,

    vocalPresence: 0.9,
    vocalStyle: 'clean',
    vocalEmotionality: 0.75,
    lyricDensity: 0.7,
    lyricAbstractness: 0.4,

    valence: 0.75,
    arousal: 0.8,
    tension: 0.35,
    nostalgia: 0.45,
    spirituality: 0.2,

    productionEra: '1990s ska',
    productionPolish: 0.75,
    spatialWidth: 0.65,
    reverbAmount: 0.3,
    experimentalism: 0.3,

    genrePurity: 0.7,
    mainstreamness: 0.7,              // Radio hit
    culturalSpecificity: 0.65,        // Boston ska scene
    temporalAnchoring: 0.75
  }
};

// =============================================================================
// THUG (2003) - THE GOLDEN ERA
// =============================================================================

/**
 * "Separation of Church and Skate" - NOFX (THUG, 2003)
 * Fat Mike's anti-establishment anthem. Peak political punk.
 */
export const SEPARATION_CHURCH_SKATE_NOFX: THPSSong = {
  title: 'Separation of Church and Skate',
  artist: 'NOFX',
  game: 'THUG',
  year: 2003,
  genre: ['Punk Rock', 'Skate Punk', 'Political Punk'],
  isIconic: true,
  genome: {
    tempo: 188,
    tempoVariability: 0.15,
    timeSignatureComplexity: 0.2,
    songLength: 142,                  // 2:22 - short and fast
    structuralPredictability: 0.75,

    key: 'G major',
    mode: 'major',
    harmonicComplexity: 0.35,
    dissonanceLevel: 0.25,
    chromaticism: 0.25,

    melodicRange: 0.6,
    melodicContour: 'varied',
    melodicComplexity: 0.45,
    hookStrength: 0.8,

    rhythmicDensity: 0.85,
    syncopation: 0.35,
    groove: 0.7,
    polyrhythmicComplexity: 0.2,

    brightness: 0.75,
    warmth: 0.45,
    density: 0.7,
    organicVsSynthetic: 0.1,

    dynamicRange: 0.45,
    buildIntensity: 0.6,
    releasePattern: 0.5,
    overallEnergy: 0.9,

    vocalPresence: 0.9,
    vocalStyle: 'raspy',              // Fat Mike's sneer
    vocalEmotionality: 0.75,
    lyricDensity: 0.8,
    lyricAbstractness: 0.35,          // Direct political

    valence: 0.55,
    arousal: 0.88,
    tension: 0.5,
    nostalgia: 0.25,
    spirituality: 0.15,               // Ironic religious critique

    productionEra: '2000s punk',
    productionPolish: 0.65,
    spatialWidth: 0.55,
    reverbAmount: 0.25,
    experimentalism: 0.3,

    genrePurity: 0.9,
    mainstreamness: 0.35,
    culturalSpecificity: 0.75,        // Fat Wreck scene
    temporalAnchoring: 0.6
  }
};

/**
 * "I Against I" - Mos Def & Massive Attack (THUG, 2003)
 * Hip-hop meets trip-hop. Blade II soundtrack crossover.
 */
export const I_AGAINST_I_MOS_DEF: THPSSong = {
  title: 'I Against I',
  artist: 'Mos Def & Massive Attack',
  game: 'THUG',
  year: 2002,
  genre: ['Trip Hop', 'Alternative Hip Hop', 'Electronic'],
  isIconic: true,
  genome: {
    tempo: 85,
    tempoVariability: 0.15,
    timeSignatureComplexity: 0.25,
    songLength: 258,                  // 4:18
    structuralPredictability: 0.6,

    key: 'D minor',
    mode: 'minor',
    harmonicComplexity: 0.55,
    dissonanceLevel: 0.35,
    chromaticism: 0.4,

    melodicRange: 0.55,
    melodicContour: 'varied',
    melodicComplexity: 0.5,
    hookStrength: 0.82,

    rhythmicDensity: 0.65,
    syncopation: 0.6,
    groove: 0.85,                     // Deep groove
    polyrhythmicComplexity: 0.5,

    brightness: 0.4,
    warmth: 0.6,
    density: 0.7,
    organicVsSynthetic: 0.5,          // Electronic + organic blend

    dynamicRange: 0.6,
    buildIntensity: 0.65,
    releasePattern: 0.55,
    overallEnergy: 0.72,

    vocalPresence: 0.9,
    vocalStyle: 'clean',              // Mos Def's flow
    vocalEmotionality: 0.75,
    lyricDensity: 0.85,
    lyricAbstractness: 0.5,

    valence: 0.35,
    arousal: 0.65,
    tension: 0.6,
    nostalgia: 0.3,
    spirituality: 0.35,               // Conscious hip-hop

    productionEra: '2000s trip-hop',
    productionPolish: 0.85,
    spatialWidth: 0.8,
    reverbAmount: 0.55,
    experimentalism: 0.6,

    genrePurity: 0.45,                // Genre fusion
    mainstreamness: 0.5,
    culturalSpecificity: 0.7,
    temporalAnchoring: 0.55
  }
};

/**
 * "Story of My Life" - Social Distortion (THUG, 2003)
 * Punk rock Americana. Mike Ness's autobiography.
 */
export const STORY_OF_MY_LIFE_SOCIAL_D: THPSSong = {
  title: 'Story of My Life',
  artist: 'Social Distortion',
  game: 'THUG',
  year: 1990,
  genre: ['Punk Rock', 'Cowpunk', 'Roots Rock'],
  isIconic: true,
  genome: {
    tempo: 118,
    tempoVariability: 0.1,
    timeSignatureComplexity: 0.1,
    songLength: 270,                  // 4:30
    structuralPredictability: 0.85,

    key: 'G major',
    mode: 'major',
    harmonicComplexity: 0.35,
    dissonanceLevel: 0.15,
    chromaticism: 0.2,

    melodicRange: 0.6,
    melodicContour: 'varied',
    melodicComplexity: 0.4,
    hookStrength: 0.88,               // Classic hook

    rhythmicDensity: 0.6,
    syncopation: 0.3,
    groove: 0.75,
    polyrhythmicComplexity: 0.15,

    brightness: 0.6,
    warmth: 0.7,                      // Warm roots tone
    density: 0.6,
    organicVsSynthetic: 0.05,

    dynamicRange: 0.55,
    buildIntensity: 0.55,
    releasePattern: 0.5,
    overallEnergy: 0.7,

    vocalPresence: 0.9,
    vocalStyle: 'raspy',              // Mike Ness's gravel
    vocalEmotionality: 0.9,           // Deeply emotional
    lyricDensity: 0.65,
    lyricAbstractness: 0.25,          // Direct storytelling

    valence: 0.45,                    // Bittersweet
    arousal: 0.65,
    tension: 0.4,
    nostalgia: 0.85,                  // VERY nostalgic
    spirituality: 0.25,

    productionEra: '1990s alt-rock',
    productionPolish: 0.7,
    spatialWidth: 0.6,
    reverbAmount: 0.35,
    experimentalism: 0.2,

    genrePurity: 0.7,
    mainstreamness: 0.55,
    culturalSpecificity: 0.8,         // SoCal punk/Americana
    temporalAnchoring: 0.75
  }
};

/**
 * "The Metro" - Alkaline Trio (THUG, 2003)
 * Berlin cover. Dark pop-punk perfection.
 */
export const THE_METRO_ALKALINE_TRIO: THPSSong = {
  title: 'The Metro',
  artist: 'Alkaline Trio',
  game: 'THUG',
  year: 2003,
  genre: ['Pop Punk', 'Dark Punk', 'Post-Punk Revival'],
  isIconic: true,
  genome: {
    tempo: 132,
    tempoVariability: 0.1,
    timeSignatureComplexity: 0.15,
    songLength: 220,                  // 3:40
    structuralPredictability: 0.8,

    key: 'B minor',
    mode: 'minor',
    harmonicComplexity: 0.45,
    dissonanceLevel: 0.3,
    chromaticism: 0.35,

    melodicRange: 0.65,
    melodicContour: 'ascending',
    melodicComplexity: 0.5,
    hookStrength: 0.9,                // Massive hook

    rhythmicDensity: 0.7,
    syncopation: 0.4,
    groove: 0.75,
    polyrhythmicComplexity: 0.25,

    brightness: 0.5,
    warmth: 0.45,
    density: 0.7,
    organicVsSynthetic: 0.2,

    dynamicRange: 0.6,
    buildIntensity: 0.7,
    releasePattern: 0.6,
    overallEnergy: 0.8,

    vocalPresence: 0.9,
    vocalStyle: 'clean',
    vocalEmotionality: 0.85,
    lyricDensity: 0.7,
    lyricAbstractness: 0.45,

    valence: 0.35,                    // Dark, melancholic
    arousal: 0.75,
    tension: 0.55,
    nostalgia: 0.6,
    spirituality: 0.15,

    productionEra: '2000s punk',
    productionPolish: 0.75,
    spatialWidth: 0.65,
    reverbAmount: 0.4,
    experimentalism: 0.35,

    genrePurity: 0.7,
    mainstreamness: 0.5,
    culturalSpecificity: 0.6,
    temporalAnchoring: 0.65
  }
};

/**
 * "Castaway" - Face to Face (THUG, 2003)
 * California melodic punk. Fat Wreck classic.
 */
export const CASTAWAY_FACE_TO_FACE: THPSSong = {
  title: 'Castaway',
  artist: 'Face to Face',
  game: 'THUG',
  year: 2003,
  genre: ['Melodic Punk', 'Pop Punk', 'Skate Punk'],
  isIconic: true,
  genome: {
    tempo: 175,
    tempoVariability: 0.15,
    timeSignatureComplexity: 0.15,
    songLength: 165,                  // 2:45
    structuralPredictability: 0.8,

    key: 'A major',
    mode: 'major',
    harmonicComplexity: 0.35,
    dissonanceLevel: 0.2,
    chromaticism: 0.2,

    melodicRange: 0.65,
    melodicContour: 'ascending',
    melodicComplexity: 0.45,
    hookStrength: 0.82,

    rhythmicDensity: 0.8,
    syncopation: 0.35,
    groove: 0.7,
    polyrhythmicComplexity: 0.2,

    brightness: 0.75,
    warmth: 0.5,
    density: 0.7,
    organicVsSynthetic: 0.1,

    dynamicRange: 0.5,
    buildIntensity: 0.6,
    releasePattern: 0.5,
    overallEnergy: 0.85,

    vocalPresence: 0.85,
    vocalStyle: 'clean',
    vocalEmotionality: 0.7,
    lyricDensity: 0.7,
    lyricAbstractness: 0.35,

    valence: 0.6,
    arousal: 0.82,
    tension: 0.4,
    nostalgia: 0.35,
    spirituality: 0.1,

    productionEra: '2000s punk',
    productionPolish: 0.7,
    spatialWidth: 0.55,
    reverbAmount: 0.25,
    experimentalism: 0.2,

    genrePurity: 0.85,
    mainstreamness: 0.4,
    culturalSpecificity: 0.7,
    temporalAnchoring: 0.6
  }
};

/**
 * "Backslider" - Less Than Jake (THUG, 2003)
 * Ska-punk energy. Gainesville scene.
 */
export const BACKSLIDER_LESS_THAN_JAKE: THPSSong = {
  title: 'Backslider',
  artist: 'Less Than Jake',
  game: 'THUG',
  year: 2003,
  genre: ['Ska Punk', 'Pop Punk', 'Third Wave Ska'],
  isIconic: true,
  genome: {
    tempo: 165,
    tempoVariability: 0.2,
    timeSignatureComplexity: 0.25,
    songLength: 178,                  // 2:58
    structuralPredictability: 0.7,

    key: 'E major',
    mode: 'major',
    harmonicComplexity: 0.4,
    dissonanceLevel: 0.2,
    chromaticism: 0.25,

    melodicRange: 0.6,
    melodicContour: 'varied',
    melodicComplexity: 0.45,
    hookStrength: 0.8,

    rhythmicDensity: 0.8,
    syncopation: 0.7,                 // Ska upbeats
    groove: 0.85,
    polyrhythmicComplexity: 0.4,

    brightness: 0.8,
    warmth: 0.55,
    density: 0.75,
    organicVsSynthetic: 0.1,          // Horns

    dynamicRange: 0.55,
    buildIntensity: 0.65,
    releasePattern: 0.55,
    overallEnergy: 0.88,

    vocalPresence: 0.85,
    vocalStyle: 'clean',
    vocalEmotionality: 0.65,
    lyricDensity: 0.75,
    lyricAbstractness: 0.35,

    valence: 0.7,
    arousal: 0.85,
    tension: 0.35,
    nostalgia: 0.3,
    spirituality: 0.1,

    productionEra: '2000s ska-punk',
    productionPolish: 0.7,
    spatialWidth: 0.65,
    reverbAmount: 0.3,
    experimentalism: 0.3,

    genrePurity: 0.75,
    mainstreamness: 0.5,
    culturalSpecificity: 0.65,        // Florida ska scene
    temporalAnchoring: 0.6
  }
};

/**
 * "Positive Contact" - Deltron 3030 (THUG, 2003)
 * Futuristic hip-hop. Del + Dan the Automator + Kid Koala.
 */
export const SEARCHIN_DELTRON: THPSSong = {
  title: 'Positive Contact',
  artist: 'Deltron 3030',
  game: 'THUG',
  year: 2000,
  genre: ['Alternative Hip Hop', 'Sci-Fi Hip Hop', 'Underground Hip Hop'],
  isIconic: true,
  genome: {
    tempo: 90,
    tempoVariability: 0.15,
    timeSignatureComplexity: 0.3,
    songLength: 270,                  // 4:30
    structuralPredictability: 0.6,

    key: 'F minor',
    mode: 'minor',
    harmonicComplexity: 0.6,
    dissonanceLevel: 0.35,
    chromaticism: 0.45,

    melodicRange: 0.5,
    melodicContour: 'varied',
    melodicComplexity: 0.55,
    hookStrength: 0.78,

    rhythmicDensity: 0.7,
    syncopation: 0.65,
    groove: 0.85,
    polyrhythmicComplexity: 0.55,

    brightness: 0.45,
    warmth: 0.55,
    density: 0.65,
    organicVsSynthetic: 0.55,         // Sci-fi production

    dynamicRange: 0.55,
    buildIntensity: 0.6,
    releasePattern: 0.5,
    overallEnergy: 0.72,

    vocalPresence: 0.9,
    vocalStyle: 'clean',
    vocalEmotionality: 0.6,
    lyricDensity: 0.92,               // Dense sci-fi rap
    lyricAbstractness: 0.7,           // Futuristic concepts

    valence: 0.5,
    arousal: 0.68,
    tension: 0.45,
    nostalgia: 0.2,
    spirituality: 0.25,

    productionEra: '2000s alt-hip-hop',
    productionPolish: 0.8,
    spatialWidth: 0.75,
    reverbAmount: 0.45,
    experimentalism: 0.75,            // Very experimental

    genrePurity: 0.5,
    mainstreamness: 0.25,
    culturalSpecificity: 0.75,        // Bay Area underground
    temporalAnchoring: 0.45           // Timeless/futuristic
  }
};

/**
 * "Like Glue" - Sean Paul (THUG, 2003)
 * Dancehall crossover. Global party anthem.
 */
export const LIKE_GLUE_SEAN_PAUL: THPSSong = {
  title: 'Like Glue',
  artist: 'Sean Paul',
  game: 'THUG',
  year: 2003,
  genre: ['Dancehall', 'Reggae Fusion', 'Pop'],
  isIconic: true,
  genome: {
    tempo: 95,
    tempoVariability: 0.1,
    timeSignatureComplexity: 0.2,
    songLength: 215,                  // 3:35
    structuralPredictability: 0.8,

    key: 'C minor',
    mode: 'minor',
    harmonicComplexity: 0.35,
    dissonanceLevel: 0.15,
    chromaticism: 0.25,

    melodicRange: 0.55,
    melodicContour: 'varied',
    melodicComplexity: 0.4,
    hookStrength: 0.9,                // MASSIVE hook

    rhythmicDensity: 0.75,
    syncopation: 0.8,                 // Dancehall riddim
    groove: 0.95,                     // Maximum groove
    polyrhythmicComplexity: 0.45,

    brightness: 0.65,
    warmth: 0.7,
    density: 0.65,
    organicVsSynthetic: 0.45,

    dynamicRange: 0.45,
    buildIntensity: 0.55,
    releasePattern: 0.5,
    overallEnergy: 0.82,

    vocalPresence: 0.9,
    vocalStyle: 'mixed',              // Patois delivery
    vocalEmotionality: 0.7,
    lyricDensity: 0.7,
    lyricAbstractness: 0.3,

    valence: 0.8,                     // Party vibes
    arousal: 0.78,
    tension: 0.2,
    nostalgia: 0.25,
    spirituality: 0.15,

    productionEra: '2000s dancehall',
    productionPolish: 0.85,
    spatialWidth: 0.7,
    reverbAmount: 0.4,
    experimentalism: 0.3,

    genrePurity: 0.75,
    mainstreamness: 0.85,             // Radio hit
    culturalSpecificity: 0.85,        // Jamaican dancehall
    temporalAnchoring: 0.7
  }
};

/**
 * "All Hail Me" - Veruca Salt (THUG, 2003)
 * 90s alt-rock revival. Grrl power.
 */
export const ALL_HAIL_ME_VERUCA_SALT: THPSSong = {
  title: 'All Hail Me',
  artist: 'Veruca Salt',
  game: 'THUG',
  year: 2003,
  genre: ['Alternative Rock', 'Grunge', 'Indie Rock'],
  isIconic: false,
  genome: {
    tempo: 128,
    tempoVariability: 0.15,
    timeSignatureComplexity: 0.2,
    songLength: 195,                  // 3:15
    structuralPredictability: 0.75,

    key: 'E minor',
    mode: 'minor',
    harmonicComplexity: 0.45,
    dissonanceLevel: 0.4,
    chromaticism: 0.35,

    melodicRange: 0.7,
    melodicContour: 'varied',
    melodicComplexity: 0.45,
    hookStrength: 0.75,

    rhythmicDensity: 0.7,
    syncopation: 0.4,
    groove: 0.7,
    polyrhythmicComplexity: 0.25,

    brightness: 0.55,
    warmth: 0.45,
    density: 0.75,
    organicVsSynthetic: 0.1,

    dynamicRange: 0.65,
    buildIntensity: 0.7,
    releasePattern: 0.6,
    overallEnergy: 0.78,

    vocalPresence: 0.85,
    vocalStyle: 'clean',
    vocalEmotionality: 0.75,
    lyricDensity: 0.6,
    lyricAbstractness: 0.45,

    valence: 0.4,
    arousal: 0.75,
    tension: 0.55,
    nostalgia: 0.4,
    spirituality: 0.1,

    productionEra: '2000s alt-rock',
    productionPolish: 0.7,
    spatialWidth: 0.65,
    reverbAmount: 0.4,
    experimentalism: 0.35,

    genrePurity: 0.7,
    mainstreamness: 0.45,
    culturalSpecificity: 0.55,
    temporalAnchoring: 0.6
  }
};

/**
 * "Flesh and Bone" - Burning Brides (THUG, 2003)
 * Heavy blues rock. Garage rock revival.
 */
export const FLESH_AND_BONE_BURNING_BRIDES: THPSSong = {
  title: 'Flesh and Bone',
  artist: 'Burning Brides',
  game: 'THUG',
  year: 2003,
  genre: ['Garage Rock', 'Blues Rock', 'Hard Rock'],
  isIconic: false,
  genome: {
    tempo: 135,
    tempoVariability: 0.15,
    timeSignatureComplexity: 0.15,
    songLength: 185,                  // 3:05
    structuralPredictability: 0.75,

    key: 'E minor',
    mode: 'minor',
    harmonicComplexity: 0.35,
    dissonanceLevel: 0.45,
    chromaticism: 0.3,

    melodicRange: 0.55,
    melodicContour: 'varied',
    melodicComplexity: 0.35,
    hookStrength: 0.72,

    rhythmicDensity: 0.75,
    syncopation: 0.4,
    groove: 0.8,
    polyrhythmicComplexity: 0.2,

    brightness: 0.5,
    warmth: 0.55,
    density: 0.8,
    organicVsSynthetic: 0.05,         // Raw garage

    dynamicRange: 0.55,
    buildIntensity: 0.65,
    releasePattern: 0.55,
    overallEnergy: 0.85,

    vocalPresence: 0.85,
    vocalStyle: 'raspy',
    vocalEmotionality: 0.75,
    lyricDensity: 0.55,
    lyricAbstractness: 0.4,

    valence: 0.4,
    arousal: 0.82,
    tension: 0.6,
    nostalgia: 0.35,
    spirituality: 0.1,

    productionEra: '2000s garage',
    productionPolish: 0.5,            // Raw
    spatialWidth: 0.55,
    reverbAmount: 0.35,
    experimentalism: 0.3,

    genrePurity: 0.75,
    mainstreamness: 0.3,
    culturalSpecificity: 0.55,
    temporalAnchoring: 0.55
  }
};

/**
 * "Cracking the Whip" - Quasimoto (THUG, 2003)
 * Madlib's alter-ego. Underground abstract hip-hop.
 */
export const CRACKING_WHIP_QUASIMOTO: THPSSong = {
  title: 'Cracking the Whip',
  artist: 'Quasimoto',
  game: 'THUG',
  year: 2000,
  genre: ['Abstract Hip Hop', 'Underground Hip Hop', 'Experimental'],
  isIconic: true,
  genome: {
    tempo: 88,
    tempoVariability: 0.2,
    timeSignatureComplexity: 0.35,
    songLength: 195,                  // 3:15
    structuralPredictability: 0.5,

    key: 'D minor',
    mode: 'minor',
    harmonicComplexity: 0.6,
    dissonanceLevel: 0.4,
    chromaticism: 0.5,

    melodicRange: 0.45,
    melodicContour: 'varied',
    melodicComplexity: 0.5,
    hookStrength: 0.68,

    rhythmicDensity: 0.7,
    syncopation: 0.75,
    groove: 0.85,
    polyrhythmicComplexity: 0.6,

    brightness: 0.4,
    warmth: 0.65,
    density: 0.6,
    organicVsSynthetic: 0.35,         // Sample-based

    dynamicRange: 0.5,
    buildIntensity: 0.5,
    releasePattern: 0.45,
    overallEnergy: 0.68,

    vocalPresence: 0.85,
    vocalStyle: 'mixed',              // Pitched-up alter ego
    vocalEmotionality: 0.55,
    lyricDensity: 0.8,
    lyricAbstractness: 0.75,          // Very abstract

    valence: 0.45,
    arousal: 0.6,
    tension: 0.5,
    nostalgia: 0.35,
    spirituality: 0.2,

    productionEra: '2000s underground',
    productionPolish: 0.55,           // Lo-fi aesthetic
    spatialWidth: 0.6,
    reverbAmount: 0.4,
    experimentalism: 0.85,            // VERY experimental

    genrePurity: 0.4,
    mainstreamness: 0.1,              // Deep underground
    culturalSpecificity: 0.8,         // Stones Throw/LA beat scene
    temporalAnchoring: 0.4
  }
};

/**
 * "Riot Radio" - The Dead 60s (THUG, 2003)
 * Post-punk revival. Liverpool energy.
 */
export const RIOT_RADIO_DEAD_60S: THPSSong = {
  title: 'Riot Radio',
  artist: 'The Dead 60s',
  game: 'THUG',
  year: 2003,
  genre: ['Post-Punk Revival', 'Dub', 'New Wave'],
  isIconic: false,
  genome: {
    tempo: 140,
    tempoVariability: 0.15,
    timeSignatureComplexity: 0.25,
    songLength: 210,                  // 3:30
    structuralPredictability: 0.7,

    key: 'E minor',
    mode: 'minor',
    harmonicComplexity: 0.45,
    dissonanceLevel: 0.35,
    chromaticism: 0.35,

    melodicRange: 0.55,
    melodicContour: 'varied',
    melodicComplexity: 0.4,
    hookStrength: 0.78,

    rhythmicDensity: 0.75,
    syncopation: 0.6,                 // Dub influence
    groove: 0.82,
    polyrhythmicComplexity: 0.45,

    brightness: 0.55,
    warmth: 0.5,
    density: 0.7,
    organicVsSynthetic: 0.2,

    dynamicRange: 0.55,
    buildIntensity: 0.65,
    releasePattern: 0.55,
    overallEnergy: 0.8,

    vocalPresence: 0.85,
    vocalStyle: 'raspy',
    vocalEmotionality: 0.7,
    lyricDensity: 0.65,
    lyricAbstractness: 0.45,

    valence: 0.45,
    arousal: 0.78,
    tension: 0.55,
    nostalgia: 0.45,
    spirituality: 0.15,

    productionEra: '2000s post-punk',
    productionPolish: 0.7,
    spatialWidth: 0.65,
    reverbAmount: 0.5,
    experimentalism: 0.45,

    genrePurity: 0.65,
    mainstreamness: 0.4,
    culturalSpecificity: 0.75,        // UK post-punk
    temporalAnchoring: 0.55
  }
};

// =============================================================================
// THPS SONG COLLECTION
// =============================================================================

export const THPS_ICONIC_SONGS: THPSSong[] = [
  // THPS1 (1999)
  SUPERMAN_GOLDFINGER,
  POLICE_TRUCK_DK,
  JERRY_RACE_CAR_PRIMUS,
  NEW_GIRL_SUICIDE_MACHINES,
  EURO_BARGE_VANDALS,

  // THPS2 (2000)
  GUERRILLA_RADIO_RATM,
  NO_CIGAR_MILLENCOLIN,
  WHEN_WORLDS_COLLIDE_PM5K,
  YOU_BAD_RELIGION,
  MAY_16_LAGWAGON,
  BLOOD_BROTHERS_PAPA_ROACH,
  CYCLONE_DUB_PISTOLS,
  BRING_THE_NOISE_ANTHRAX,
  LIGHTS_OUT_ANGRY_FIST,

  // THPS3 (2001)
  ACE_OF_SPADES_MOTORHEAD,
  QUITE_BITTER_BEINGS_CKY,
  IF_YOU_MUST_DEL,
  AMOEBA_ADOLESCENTS,
  IMPRESSION_BOSSTONES,

  // THPS4 (2002)
  SHIMMY_SOAD,
  TNT_ACDC,

  // THUG (2003) - THE PEAK
  DRUNKEN_LULLABIES_FM,
  DIG_IT_SKINNY_PUPPY,
  SEPARATION_CHURCH_SKATE_NOFX,
  I_AGAINST_I_MOS_DEF,
  STORY_OF_MY_LIFE_SOCIAL_D,
  THE_METRO_ALKALINE_TRIO,
  CASTAWAY_FACE_TO_FACE,
  BACKSLIDER_LESS_THAN_JAKE,
  SEARCHIN_DELTRON,
  LIKE_GLUE_SEAN_PAUL,
  ALL_HAIL_ME_VERUCA_SALT,
  FLESH_AND_BONE_BURNING_BRIDES,
  CRACKING_WHIP_QUASIMOTO,
  RIOT_RADIO_DEAD_60S,

  // THPS 1+2 Remaster (2020)
  BLAME_IT_ON_GIRLS_MIKA
];

// =============================================================================
// ANALYSIS FUNCTIONS
// =============================================================================

/**
 * Calculate risk factors for all THPS songs
 */
export function analyzeAllTHPSSongs(): THPSSong[] {
  return THPS_ICONIC_SONGS.map(song => {
    const riskFactors = analyzer.calculateRiskFactors(song.genome);
    const insuranceProfile = analyzer.calculateInsuranceProfile(riskFactors, song.genome);

    return {
      ...song,
      riskFactors,
      insuranceProfile
    };
  });
}

/**
 * Generate comparative analysis report
 */
export function generateTHPSRiskReport(): THPSRiskReport {
  const analyzedSongs = analyzeAllTHPSSongs();

  // Calculate aggregate metrics
  const avgRiskScore = analyzedSongs.reduce(
    (sum, s) => sum + (s.insuranceProfile?.overallRiskScore || 0), 0
  ) / analyzedSongs.length;

  const avgEnergy = analyzedSongs.reduce(
    (sum, s) => sum + s.genome.overallEnergy, 0
  ) / analyzedSongs.length;

  const avgValence = analyzedSongs.reduce(
    (sum, s) => sum + s.genome.valence, 0
  ) / analyzedSongs.length;

  // Find extremes
  const highestRisk = analyzedSongs.reduce((max, s) =>
    (s.insuranceProfile?.overallRiskScore || 0) > (max.insuranceProfile?.overallRiskScore || 0) ? s : max
  );

  const lowestRisk = analyzedSongs.reduce((min, s) =>
    (s.insuranceProfile?.overallRiskScore || 0) < (min.insuranceProfile?.overallRiskScore || 0) ? s : min
  );

  const highestEnergy = analyzedSongs.reduce((max, s) =>
    s.genome.overallEnergy > max.genome.overallEnergy ? s : max
  );

  // Group by game
  const byGame: Record<string, THPSSong[]> = {};
  for (const song of analyzedSongs) {
    if (!byGame[song.game]) byGame[song.game] = [];
    byGame[song.game].push(song);
  }

  return {
    timestamp: new Date(),
    totalSongs: analyzedSongs.length,
    songs: analyzedSongs,
    aggregateMetrics: {
      averageRiskScore: avgRiskScore,
      averageEnergy: avgEnergy,
      averageValence: avgValence,
      averageTempo: analyzedSongs.reduce((sum, s) => sum + s.genome.tempo, 0) / analyzedSongs.length
    },
    extremes: {
      highestRisk: { title: highestRisk.title, artist: highestRisk.artist, score: highestRisk.insuranceProfile?.overallRiskScore || 0 },
      lowestRisk: { title: lowestRisk.title, artist: lowestRisk.artist, score: lowestRisk.insuranceProfile?.overallRiskScore || 0 },
      highestEnergy: { title: highestEnergy.title, artist: highestEnergy.artist, energy: highestEnergy.genome.overallEnergy }
    },
    byGame,
    insights: generateTHPSInsights(analyzedSongs)
  };
}

/**
 * Generate insights about THPS listener risk profile
 */
function generateTHPSInsights(songs: THPSSong[]): string[] {
  const insights: string[] = [];

  const avgRisk = songs.reduce((sum, s) => sum + (s.insuranceProfile?.overallRiskScore || 0), 0) / songs.length;
  const avgEnergy = songs.reduce((sum, s) => sum + s.genome.overallEnergy, 0) / songs.length;
  const avgSensationSeeking = songs.reduce((sum, s) => sum + (s.riskFactors?.sensationSeeking || 0), 0) / songs.length;

  insights.push(
    `THPS soundtracks average ${avgRisk.toFixed(1)}/100 risk score—${avgRisk < 45 ? 'LOWER' : 'HIGHER'} than general population baseline of 50.`
  );

  insights.push(
    `Average energy level of ${(avgEnergy * 100).toFixed(0)}% indicates high-arousal preference, correlating with active lifestyle and physical risk-taking.`
  );

  insights.push(
    `Sensation-seeking index of ${(avgSensationSeeking * 100).toFixed(0)}% suggests THPS listeners are ${avgSensationSeeking > 0.6 ? 'significantly' : 'moderately'} more novelty-seeking than average.`
  );

  insights.push(
    `High prevalence of punk rock (political, satirical) suggests above-average critical thinking and skepticism of authority—positive indicators for fraud resistance.`
  );

  insights.push(
    `Mix of major and minor keys indicates emotional range—listeners can process both positive and negative emotions, suggesting better emotional regulation.`
  );

  insights.push(
    `Fast tempos (avg ${(songs.reduce((sum, s) => sum + s.genome.tempo, 0) / songs.length).toFixed(0)} BPM) correlate with preference for quick decision-making—may indicate higher impulsivity but also faster reaction times.`
  );

  return insights;
}

/**
 * Print formatted report to console
 */
export function printTHPSReport(): void {
  const report = generateTHPSRiskReport();

  console.log('\n' + '='.repeat(80));
  console.log('🛹 TONY HAWK\'S PRO SKATER SOUNDTRACK RISK ANALYSIS');
  console.log('='.repeat(80));

  console.log(`\nAnalyzed ${report.totalSongs} iconic tracks`);
  console.log('-'.repeat(40));

  console.log('\n📊 AGGREGATE METRICS');
  console.log(`Average Risk Score: ${report.aggregateMetrics.averageRiskScore.toFixed(1)}/100`);
  console.log(`Average Energy: ${(report.aggregateMetrics.averageEnergy * 100).toFixed(0)}%`);
  console.log(`Average Valence: ${(report.aggregateMetrics.averageValence * 100).toFixed(0)}%`);
  console.log(`Average Tempo: ${report.aggregateMetrics.averageTempo.toFixed(0)} BPM`);

  console.log('\n🎯 EXTREMES');
  console.log(`Highest Risk: "${report.extremes.highestRisk.title}" - ${report.extremes.highestRisk.artist} (${report.extremes.highestRisk.score.toFixed(1)})`);
  console.log(`Lowest Risk: "${report.extremes.lowestRisk.title}" - ${report.extremes.lowestRisk.artist} (${report.extremes.lowestRisk.score.toFixed(1)})`);
  console.log(`Highest Energy: "${report.extremes.highestEnergy.title}" - ${report.extremes.highestEnergy.artist} (${(report.extremes.highestEnergy.energy * 100).toFixed(0)}%)`);

  console.log('\n📈 INDIVIDUAL SONG RISK SCORES');
  console.log('-'.repeat(60));
  for (const song of report.songs) {
    const risk = song.insuranceProfile?.overallRiskScore || 0;
    const bar = '█'.repeat(Math.floor(risk / 5)) + '░'.repeat(20 - Math.floor(risk / 5));
    console.log(`${song.title.padEnd(30)} ${bar} ${risk.toFixed(1)}`);
  }

  console.log('\n💡 INSIGHTS');
  console.log('-'.repeat(40));
  for (const insight of report.insights) {
    console.log(`• ${insight}`);
  }

  console.log('\n' + '='.repeat(80));
}

// =============================================================================
// TYPES
// =============================================================================

export interface THPSRiskReport {
  timestamp: Date;
  totalSongs: number;
  songs: THPSSong[];
  aggregateMetrics: {
    averageRiskScore: number;
    averageEnergy: number;
    averageValence: number;
    averageTempo: number;
  };
  extremes: {
    highestRisk: { title: string; artist: string; score: number };
    lowestRisk: { title: string; artist: string; score: number };
    highestEnergy: { title: string; artist: string; energy: number };
  };
  byGame: Record<string, THPSSong[]>;
  insights: string[];
}

// =============================================================================
// RUN ANALYSIS
// =============================================================================

printTHPSReport();

export default {
  THPS_ICONIC_SONGS,
  analyzeAllTHPSSongs,
  generateTHPSRiskReport,
  printTHPSReport
};
