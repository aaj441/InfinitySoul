/**
 * WellnessGenome - The Marketing Genome Project for Good
 * ========================================================
 *
 * Maps music → behavior correlations to enable data-driven wellness interventions.
 *
 * Philosophy: REDUCE risk, don't predict it.
 * - Music is the intervention, not the diagnostic
 * - 20+ years of listening data = understanding what actually works
 * - Monetize by making people healthier, not by exploiting them
 *
 * "B-A-N-A-N-A-S" - Gwen Stefani accidentally created the most effective
 * spelling intervention in history. This is that, but intentional.
 */

import { ValidationError } from '../../errors';

// =============================================================================
// TYPES
// =============================================================================

export interface MusicFeatures {
  tempo: number;           // BPM
  energy: number;          // 0-1
  valence: number;         // 0-1 (happiness/positivity)
  danceability: number;    // 0-1
  acousticness: number;    // 0-1
  instrumentalness: number; // 0-1
  liveness: number;        // 0-1
  speechiness: number;     // 0-1
  mode: 'major' | 'minor';
  key: string;
  duration: number;        // seconds
}

export interface ListeningContext {
  timestamp: Date;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | 'late_night';
  dayOfWeek: number;
  isWeekend: boolean;
  consecutiveListens: number;  // How many tracks in this session
  sessionDuration: number;     // Minutes
}

export interface BehaviorOutcome {
  type: WellnessBehavior;
  occurred: boolean;
  timestamp: Date;
  intensity?: number;        // 0-1 for graduated behaviors
  source: 'self_report' | 'app_integration' | 'inferred';
  metadata?: Record<string, unknown>;
}

export type WellnessBehavior =
  | 'hydration'           // Drank water
  | 'healthy_meal'        // Ate something nutritious
  | 'exercise'            // Physical activity
  | 'meditation'          // Mindfulness/meditation
  | 'yoga'                // Yoga/stretching
  | 'sleep_quality'       // Good sleep
  | 'social_connection'   // Connected with others
  | 'medication_adherence' // Took prescribed meds
  | 'screen_break'        // Took a break from screens
  | 'outdoor_time'        // Spent time outside
  | 'creative_activity'   // Art, writing, music-making
  | 'learning'            // Educational content
  | 'meal_prep'           // Prepared food (not takeout)
  | 'journaling';         // Reflective writing

export interface MusicBehaviorCorrelation {
  musicFeatures: Partial<MusicFeatures>;
  context: Partial<ListeningContext>;
  behavior: WellnessBehavior;
  correlationStrength: number;  // -1 to 1
  sampleSize: number;
  confidence: number;           // 0-1
  effectSize: number;           // Cohen's d or similar
  lastUpdated: Date;
}

export interface WellnessPlaylist {
  id: string;
  name: string;
  targetBehavior: WellnessBehavior;
  description: string;
  optimalContext: Partial<ListeningContext>;
  expectedEffectSize: number;
  tracks: PlaylistTrack[];
  totalDuration: number;
  createdAt: Date;
  successRate: number;  // % of users who reported target behavior
}

export interface PlaylistTrack {
  trackId: string;
  artist: string;
  title: string;
  features: MusicFeatures;
  contributionScore: number;  // How much this track contributes to the goal
}

export interface UserWellnessProfile {
  userId: string;
  goals: WellnessBehavior[];
  listeningHistory: ListeningSession[];
  behaviorHistory: BehaviorOutcome[];
  personalCorrelations: MusicBehaviorCorrelation[];
  effectivenessScores: Map<WellnessBehavior, number>;
  lastUpdated: Date;
}

export interface ListeningSession {
  sessionId: string;
  tracks: string[];
  context: ListeningContext;
  duration: number;
  completionRate: number;
  followupBehaviors: BehaviorOutcome[];
}

export interface InterventionRecommendation {
  playlist: WellnessPlaylist;
  expectedOutcome: WellnessBehavior;
  confidence: number;
  personalizedScore: number;  // How well this matches user's patterns
  optimalTime: string;        // When to use this
  reasoning: string;
}

// =============================================================================
// WELLNESS GENOME ENGINE
// =============================================================================

export class WellnessGenomeEngine {
  private globalCorrelations: Map<string, MusicBehaviorCorrelation> = new Map();
  private userProfiles: Map<string, UserWellnessProfile> = new Map();
  private playlists: Map<string, WellnessPlaylist> = new Map();

  constructor() {
    this.initializeBaseCorrelations();
    this.initializeSeedPlaylists();
  }

  /**
   * Initialize with research-backed baseline correlations
   * These will be refined with user data over time
   */
  private initializeBaseCorrelations(): void {
    // Research-backed: Tempo affects arousal and activity
    this.addCorrelation({
      musicFeatures: { tempo: 120, energy: 0.7 },
      context: { timeOfDay: 'morning' },
      behavior: 'exercise',
      correlationStrength: 0.45,
      sampleSize: 0,  // Will be updated with real data
      confidence: 0.6,
      effectSize: 0.3,
      lastUpdated: new Date(),
    });

    // Low tempo + high acousticness → meditation
    this.addCorrelation({
      musicFeatures: { tempo: 60, acousticness: 0.8, instrumentalness: 0.7 },
      context: { timeOfDay: 'morning' },
      behavior: 'meditation',
      correlationStrength: 0.55,
      sampleSize: 0,
      confidence: 0.65,
      effectSize: 0.4,
      lastUpdated: new Date(),
    });

    // Upbeat morning music → healthy breakfast choices
    this.addCorrelation({
      musicFeatures: { valence: 0.7, energy: 0.6 },
      context: { timeOfDay: 'morning' },
      behavior: 'healthy_meal',
      correlationStrength: 0.35,
      sampleSize: 0,
      confidence: 0.5,
      effectSize: 0.2,
      lastUpdated: new Date(),
    });

    // Chill evening music → better sleep
    this.addCorrelation({
      musicFeatures: { tempo: 70, energy: 0.3, acousticness: 0.6 },
      context: { timeOfDay: 'evening' },
      behavior: 'sleep_quality',
      correlationStrength: 0.5,
      sampleSize: 0,
      confidence: 0.6,
      effectSize: 0.35,
      lastUpdated: new Date(),
    });

    // Social/danceable music → social connection
    this.addCorrelation({
      musicFeatures: { danceability: 0.75, valence: 0.65 },
      context: { isWeekend: true },
      behavior: 'social_connection',
      correlationStrength: 0.4,
      sampleSize: 0,
      confidence: 0.55,
      effectSize: 0.25,
      lastUpdated: new Date(),
    });

    // Instrumental focus music → learning
    this.addCorrelation({
      musicFeatures: { instrumentalness: 0.8, tempo: 100, energy: 0.4 },
      context: {},
      behavior: 'learning',
      correlationStrength: 0.45,
      sampleSize: 0,
      confidence: 0.6,
      effectSize: 0.3,
      lastUpdated: new Date(),
    });

    // Energetic cooking music → meal prep
    this.addCorrelation({
      musicFeatures: { tempo: 115, energy: 0.65, valence: 0.6 },
      context: { timeOfDay: 'evening' },
      behavior: 'meal_prep',
      correlationStrength: 0.4,
      sampleSize: 0,
      confidence: 0.5,
      effectSize: 0.25,
      lastUpdated: new Date(),
    });
  }

  /**
   * Seed playlists based on wellness goals
   */
  private initializeSeedPlaylists(): void {
    // These would be populated with real tracks via Last.fm/Spotify integration
    const seedPlaylists: Omit<WellnessPlaylist, 'id' | 'createdAt'>[] = [
      {
        name: 'Morning Movement',
        targetBehavior: 'exercise',
        description: 'Wake up your body without feeling like a workout',
        optimalContext: { timeOfDay: 'morning' },
        expectedEffectSize: 0.3,
        tracks: [],
        totalDuration: 0,
        successRate: 0,
      },
      {
        name: 'Hydration Station',
        targetBehavior: 'hydration',
        description: 'Tracks that make you want to take care of yourself',
        optimalContext: {},
        expectedEffectSize: 0.2,
        tracks: [],
        totalDuration: 0,
        successRate: 0,
      },
      {
        name: 'Meal Prep Energy',
        targetBehavior: 'meal_prep',
        description: 'Make cooking feel like a vibe, not a chore',
        optimalContext: { timeOfDay: 'evening' },
        expectedEffectSize: 0.25,
        tracks: [],
        totalDuration: 0,
        successRate: 0,
      },
      {
        name: 'Wind Down',
        targetBehavior: 'sleep_quality',
        description: 'Transition from day to restful night',
        optimalContext: { timeOfDay: 'evening' },
        expectedEffectSize: 0.35,
        tracks: [],
        totalDuration: 0,
        successRate: 0,
      },
      {
        name: 'Mindful Moments',
        targetBehavior: 'meditation',
        description: 'Create space for stillness',
        optimalContext: { timeOfDay: 'morning' },
        expectedEffectSize: 0.4,
        tracks: [],
        totalDuration: 0,
        successRate: 0,
      },
      {
        name: 'Focus Flow',
        targetBehavior: 'learning',
        description: 'Get in the zone for deep work',
        optimalContext: {},
        expectedEffectSize: 0.3,
        tracks: [],
        totalDuration: 0,
        successRate: 0,
      },
      {
        name: 'Sunday Reset',
        targetBehavior: 'yoga',
        description: 'Stretch, breathe, prepare for the week',
        optimalContext: { isWeekend: true, timeOfDay: 'morning' },
        expectedEffectSize: 0.35,
        tracks: [],
        totalDuration: 0,
        successRate: 0,
      },
    ];

    for (const playlist of seedPlaylists) {
      const id = `wellness-${playlist.targetBehavior}-${Date.now()}`;
      this.playlists.set(id, {
        ...playlist,
        id,
        createdAt: new Date(),
      });
    }
  }

  private addCorrelation(correlation: MusicBehaviorCorrelation): void {
    const key = this.correlationKey(correlation);
    this.globalCorrelations.set(key, correlation);
  }

  private correlationKey(correlation: MusicBehaviorCorrelation): string {
    return `${correlation.behavior}-${JSON.stringify(correlation.musicFeatures)}-${JSON.stringify(correlation.context)}`;
  }

  // ===========================================================================
  // PUBLIC API
  // ===========================================================================

  /**
   * Get personalized intervention recommendations for a user
   */
  getRecommendations(
    userId: string,
    targetBehavior?: WellnessBehavior,
    currentContext?: Partial<ListeningContext>
  ): InterventionRecommendation[] {
    const profile = this.userProfiles.get(userId);
    const goals = targetBehavior ? [targetBehavior] : (profile?.goals || ['hydration', 'exercise']);

    const recommendations: InterventionRecommendation[] = [];

    for (const [, playlist] of this.playlists) {
      if (!goals.includes(playlist.targetBehavior)) continue;

      // Calculate personalized score based on user history
      let personalizedScore = 0.5;  // Default
      if (profile) {
        const effectiveness = profile.effectivenessScores.get(playlist.targetBehavior);
        if (effectiveness !== undefined) {
          personalizedScore = effectiveness;
        }
      }

      // Context matching
      let contextMatch = 1.0;
      if (currentContext && playlist.optimalContext) {
        if (playlist.optimalContext.timeOfDay && currentContext.timeOfDay !== playlist.optimalContext.timeOfDay) {
          contextMatch *= 0.7;
        }
        if (playlist.optimalContext.isWeekend !== undefined && currentContext.isWeekend !== playlist.optimalContext.isWeekend) {
          contextMatch *= 0.8;
        }
      }

      recommendations.push({
        playlist,
        expectedOutcome: playlist.targetBehavior,
        confidence: playlist.successRate || 0.5,
        personalizedScore: personalizedScore * contextMatch,
        optimalTime: this.formatOptimalTime(playlist.optimalContext),
        reasoning: this.generateReasoning(playlist, profile),
      });
    }

    // Sort by personalized score
    return recommendations.sort((a, b) => b.personalizedScore - a.personalizedScore);
  }

  /**
   * Record a listening session and any subsequent behaviors
   */
  recordSession(
    userId: string,
    session: Omit<ListeningSession, 'sessionId'>
  ): string {
    const profile = this.getOrCreateProfile(userId);
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const fullSession: ListeningSession = {
      ...session,
      sessionId,
    };

    profile.listeningHistory.push(fullSession);
    profile.lastUpdated = new Date();

    // Update correlations based on new data
    this.updateCorrelations(profile, fullSession);

    return sessionId;
  }

  /**
   * Record a behavior outcome (self-reported or app-integrated)
   */
  recordBehavior(
    userId: string,
    behavior: Omit<BehaviorOutcome, 'timestamp'>
  ): void {
    const profile = this.getOrCreateProfile(userId);

    const outcome: BehaviorOutcome = {
      ...behavior,
      timestamp: new Date(),
    };

    profile.behaviorHistory.push(outcome);
    profile.lastUpdated = new Date();

    // Link to recent listening sessions
    this.linkBehaviorToSessions(profile, outcome);
  }

  /**
   * Set user's wellness goals
   */
  setUserGoals(userId: string, goals: WellnessBehavior[]): void {
    const profile = this.getOrCreateProfile(userId);
    profile.goals = goals;
    profile.lastUpdated = new Date();
  }

  /**
   * Get user's wellness dashboard data
   */
  getDashboard(userId: string): {
    goals: WellnessBehavior[];
    recentBehaviors: BehaviorOutcome[];
    effectivenessScores: Record<WellnessBehavior, number>;
    streak: number;
    recommendations: InterventionRecommendation[];
  } {
    const profile = this.userProfiles.get(userId);

    if (!profile) {
      return {
        goals: [],
        recentBehaviors: [],
        effectivenessScores: {} as Record<WellnessBehavior, number>,
        streak: 0,
        recommendations: this.getRecommendations(userId),
      };
    }

    const effectivenessObj: Record<string, number> = {};
    profile.effectivenessScores.forEach((value, key) => {
      effectivenessObj[key] = value;
    });

    return {
      goals: profile.goals,
      recentBehaviors: profile.behaviorHistory.slice(-10),
      effectivenessScores: effectivenessObj as Record<WellnessBehavior, number>,
      streak: this.calculateStreak(profile),
      recommendations: this.getRecommendations(userId),
    };
  }

  /**
   * Get aggregate insights (for B2B reporting)
   */
  getAggregateInsights(): {
    totalUsers: number;
    behaviorFrequency: Record<WellnessBehavior, number>;
    topCorrelations: MusicBehaviorCorrelation[];
    playlistEffectiveness: { playlistId: string; name: string; successRate: number }[];
  } {
    const behaviorFrequency: Record<string, number> = {};

    for (const [, profile] of this.userProfiles) {
      for (const behavior of profile.behaviorHistory) {
        behaviorFrequency[behavior.type] = (behaviorFrequency[behavior.type] || 0) + 1;
      }
    }

    const topCorrelations = Array.from(this.globalCorrelations.values())
      .sort((a, b) => b.correlationStrength - a.correlationStrength)
      .slice(0, 10);

    const playlistEffectiveness = Array.from(this.playlists.values()).map(p => ({
      playlistId: p.id,
      name: p.name,
      successRate: p.successRate,
    }));

    return {
      totalUsers: this.userProfiles.size,
      behaviorFrequency: behaviorFrequency as Record<WellnessBehavior, number>,
      topCorrelations,
      playlistEffectiveness,
    };
  }

  // ===========================================================================
  // PRIVATE HELPERS
  // ===========================================================================

  private getOrCreateProfile(userId: string): UserWellnessProfile {
    let profile = this.userProfiles.get(userId);

    if (!profile) {
      profile = {
        userId,
        goals: [],
        listeningHistory: [],
        behaviorHistory: [],
        personalCorrelations: [],
        effectivenessScores: new Map(),
        lastUpdated: new Date(),
      };
      this.userProfiles.set(userId, profile);
    }

    return profile;
  }

  private updateCorrelations(profile: UserWellnessProfile, session: ListeningSession): void {
    // Look for behaviors that occurred within 2 hours of listening
    const windowMs = 2 * 60 * 60 * 1000;
    const sessionEnd = new Date(session.context.timestamp.getTime() + session.duration * 60 * 1000);

    const relatedBehaviors = profile.behaviorHistory.filter(b => {
      const timeDiff = b.timestamp.getTime() - sessionEnd.getTime();
      return timeDiff >= 0 && timeDiff <= windowMs;
    });

    // Update effectiveness scores
    for (const behavior of relatedBehaviors) {
      const currentScore = profile.effectivenessScores.get(behavior.type) || 0.5;
      // Simple moving average update
      const newScore = currentScore * 0.9 + (behavior.occurred ? 1 : 0) * 0.1;
      profile.effectivenessScores.set(behavior.type, newScore);
    }
  }

  private linkBehaviorToSessions(profile: UserWellnessProfile, behavior: BehaviorOutcome): void {
    // Find recent sessions that might have influenced this behavior
    const windowMs = 2 * 60 * 60 * 1000;

    for (const session of profile.listeningHistory.slice(-10)) {
      const sessionEnd = new Date(session.context.timestamp.getTime() + session.duration * 60 * 1000);
      const timeDiff = behavior.timestamp.getTime() - sessionEnd.getTime();

      if (timeDiff >= 0 && timeDiff <= windowMs) {
        session.followupBehaviors.push(behavior);
      }
    }
  }

  private calculateStreak(profile: UserWellnessProfile): number {
    if (profile.behaviorHistory.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);

      const hasActivity = profile.behaviorHistory.some(b => {
        const behaviorDate = new Date(b.timestamp);
        behaviorDate.setHours(0, 0, 0, 0);
        return behaviorDate.getTime() === checkDate.getTime() && b.occurred;
      });

      if (hasActivity) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  }

  private formatOptimalTime(context: Partial<ListeningContext>): string {
    const parts: string[] = [];

    if (context.timeOfDay) {
      parts.push(context.timeOfDay.replace('_', ' '));
    }
    if (context.isWeekend !== undefined) {
      parts.push(context.isWeekend ? 'weekends' : 'weekdays');
    }

    return parts.length > 0 ? parts.join(', ') : 'any time';
  }

  private generateReasoning(playlist: WellnessPlaylist, profile?: UserWellnessProfile): string {
    if (!profile || profile.listeningHistory.length < 5) {
      return `Research suggests ${playlist.name.toLowerCase()} can help with ${playlist.targetBehavior.replace('_', ' ')}.`;
    }

    const effectiveness = profile.effectivenessScores.get(playlist.targetBehavior);
    if (effectiveness && effectiveness > 0.6) {
      return `Based on your history, this type of music has been effective for you ${Math.round(effectiveness * 100)}% of the time.`;
    }

    return `This playlist is designed to support ${playlist.targetBehavior.replace('_', ' ')}. Give it a try!`;
  }
}

// Export singleton
export const wellnessGenome = new WellnessGenomeEngine();
export default wellnessGenome;
