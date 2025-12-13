/**
 * Intervention Tracker
 * =====================
 *
 * Tracks wellness interventions and their outcomes.
 * This is the data engine that proves music → behavior works.
 *
 * Key insight: We're not predicting risk, we're REDUCING it
 * by finding what actually helps people achieve their goals.
 */

import { createModuleLogger } from '../../../utils/logger';
import {
  WellnessBehavior,
  BehaviorOutcome,
  WellnessPlaylist,
  ListeningSession,
  MusicBehaviorCorrelation,
} from './WellnessGenome';

const logger = createModuleLogger('InterventionTracker');

// =============================================================================
// TYPES
// =============================================================================

export interface Intervention {
  id: string;
  userId: string;
  playlistId: string;
  targetBehavior: WellnessBehavior;
  startedAt: Date;
  completedAt?: Date;
  completionRate: number;  // 0-1, how much of playlist was listened to
  outcome?: InterventionOutcome;
  context: InterventionContext;
}

export interface InterventionOutcome {
  targetBehaviorOccurred: boolean;
  reportedAt: Date;
  source: 'self_report' | 'app_integration' | 'inferred';
  intensity?: number;  // 0-1 for graduated behaviors
  userFeedback?: {
    helpful: boolean;
    wouldRecommend: boolean;
    notes?: string;
  };
  additionalBehaviors?: WellnessBehavior[];  // Bonus behaviors that occurred
}

export interface InterventionContext {
  timeOfDay: string;
  dayOfWeek: number;
  isWeekend: boolean;
  mood?: 'low' | 'neutral' | 'high';
  energyLevel?: 'low' | 'medium' | 'high';
  location?: 'home' | 'work' | 'gym' | 'commute' | 'other';
}

export interface InterventionStats {
  totalInterventions: number;
  successRate: number;
  avgCompletionRate: number;
  byBehavior: Record<WellnessBehavior, {
    attempts: number;
    successes: number;
    successRate: number;
  }>;
  byTimeOfDay: Record<string, { attempts: number; successes: number }>;
  streakDays: number;
  totalBehaviorChanges: number;
}

export interface PlaylistEffectiveness {
  playlistId: string;
  playlistName: string;
  targetBehavior: WellnessBehavior;
  totalUses: number;
  successfulOutcomes: number;
  successRate: number;
  avgCompletionRate: number;
  bestTimeOfDay: string;
  confidenceScore: number;  // Based on sample size
}

// =============================================================================
// INTERVENTION TRACKER
// =============================================================================

export class InterventionTracker {
  private interventions: Map<string, Intervention> = new Map();
  private userInterventions: Map<string, string[]> = new Map();  // userId -> interventionIds

  constructor() {
    logger.info('InterventionTracker initialized');
  }

  /**
   * Start tracking a new intervention (user starts a wellness playlist)
   */
  startIntervention(
    userId: string,
    playlist: WellnessPlaylist,
    context: Partial<InterventionContext> = {}
  ): string {
    const id = `int-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const intervention: Intervention = {
      id,
      userId,
      playlistId: playlist.id,
      targetBehavior: playlist.targetBehavior,
      startedAt: new Date(),
      completionRate: 0,
      context: {
        timeOfDay: context.timeOfDay || this.getCurrentTimeOfDay(),
        dayOfWeek: new Date().getDay(),
        isWeekend: new Date().getDay() === 0 || new Date().getDay() === 6,
        mood: context.mood,
        energyLevel: context.energyLevel,
        location: context.location,
      },
    };

    this.interventions.set(id, intervention);

    // Track by user
    const userInts = this.userInterventions.get(userId) || [];
    userInts.push(id);
    this.userInterventions.set(userId, userInts);

    logger.info('Intervention started', {
      interventionId: id,
      userId,
      targetBehavior: playlist.targetBehavior,
    });

    return id;
  }

  /**
   * Update intervention progress (e.g., user listened to 75% of playlist)
   */
  updateProgress(interventionId: string, completionRate: number): void {
    const intervention = this.interventions.get(interventionId);
    if (!intervention) {
      logger.warn('Intervention not found', { interventionId });
      return;
    }

    intervention.completionRate = Math.max(intervention.completionRate, completionRate);

    if (completionRate >= 0.9 && !intervention.completedAt) {
      intervention.completedAt = new Date();
      logger.info('Intervention completed', { interventionId });
    }
  }

  /**
   * Record the outcome of an intervention
   */
  recordOutcome(
    interventionId: string,
    outcome: Omit<InterventionOutcome, 'reportedAt'>
  ): void {
    const intervention = this.interventions.get(interventionId);
    if (!intervention) {
      logger.warn('Intervention not found for outcome', { interventionId });
      return;
    }

    intervention.outcome = {
      ...outcome,
      reportedAt: new Date(),
    };

    logger.info('Outcome recorded', {
      interventionId,
      targetBehavior: intervention.targetBehavior,
      occurred: outcome.targetBehaviorOccurred,
    });
  }

  /**
   * Quick self-report: "Did you [target behavior] after listening?"
   */
  quickReport(
    interventionId: string,
    didIt: boolean,
    wasHelpful?: boolean
  ): void {
    this.recordOutcome(interventionId, {
      targetBehaviorOccurred: didIt,
      source: 'self_report',
      userFeedback: wasHelpful !== undefined
        ? { helpful: wasHelpful, wouldRecommend: wasHelpful }
        : undefined,
    });
  }

  /**
   * Get intervention stats for a user
   */
  getUserStats(userId: string): InterventionStats {
    const userInts = this.userInterventions.get(userId) || [];
    const interventions = userInts
      .map(id => this.interventions.get(id))
      .filter((i): i is Intervention => i !== undefined);

    const byBehavior: InterventionStats['byBehavior'] = {} as any;
    const byTimeOfDay: InterventionStats['byTimeOfDay'] = {};

    let totalSuccesses = 0;
    let totalCompletionRate = 0;

    for (const int of interventions) {
      // By behavior
      if (!byBehavior[int.targetBehavior]) {
        byBehavior[int.targetBehavior] = { attempts: 0, successes: 0, successRate: 0 };
      }
      byBehavior[int.targetBehavior].attempts++;
      if (int.outcome?.targetBehaviorOccurred) {
        byBehavior[int.targetBehavior].successes++;
        totalSuccesses++;
      }

      // By time of day
      if (!byTimeOfDay[int.context.timeOfDay]) {
        byTimeOfDay[int.context.timeOfDay] = { attempts: 0, successes: 0 };
      }
      byTimeOfDay[int.context.timeOfDay].attempts++;
      if (int.outcome?.targetBehaviorOccurred) {
        byTimeOfDay[int.context.timeOfDay].successes++;
      }

      totalCompletionRate += int.completionRate;
    }

    // Calculate success rates
    for (const behavior of Object.keys(byBehavior) as WellnessBehavior[]) {
      const stats = byBehavior[behavior];
      stats.successRate = stats.attempts > 0 ? stats.successes / stats.attempts : 0;
    }

    return {
      totalInterventions: interventions.length,
      successRate: interventions.length > 0 ? totalSuccesses / interventions.length : 0,
      avgCompletionRate: interventions.length > 0 ? totalCompletionRate / interventions.length : 0,
      byBehavior,
      byTimeOfDay,
      streakDays: this.calculateStreak(interventions),
      totalBehaviorChanges: totalSuccesses,
    };
  }

  /**
   * Get effectiveness metrics for a playlist across all users
   */
  getPlaylistEffectiveness(playlistId: string): PlaylistEffectiveness | null {
    const playlistInterventions = Array.from(this.interventions.values())
      .filter(i => i.playlistId === playlistId);

    if (playlistInterventions.length === 0) return null;

    const first = playlistInterventions[0];
    const withOutcomes = playlistInterventions.filter(i => i.outcome);
    const successful = withOutcomes.filter(i => i.outcome?.targetBehaviorOccurred);

    // Find best time of day
    const byTime: Record<string, { total: number; successes: number }> = {};
    for (const int of playlistInterventions) {
      const tod = int.context.timeOfDay;
      if (!byTime[tod]) byTime[tod] = { total: 0, successes: 0 };
      byTime[tod].total++;
      if (int.outcome?.targetBehaviorOccurred) byTime[tod].successes++;
    }

    let bestTimeOfDay = 'any';
    let bestRate = 0;
    for (const [time, stats] of Object.entries(byTime)) {
      const rate = stats.total > 0 ? stats.successes / stats.total : 0;
      if (rate > bestRate && stats.total >= 3) {
        bestRate = rate;
        bestTimeOfDay = time;
      }
    }

    const avgCompletion = playlistInterventions.reduce((sum, i) => sum + i.completionRate, 0)
      / playlistInterventions.length;

    // Confidence based on sample size
    const confidence = Math.min(1, withOutcomes.length / 30);  // Full confidence at 30 outcomes

    return {
      playlistId,
      playlistName: playlistId,  // Would be looked up from WellnessGenome
      targetBehavior: first.targetBehavior,
      totalUses: playlistInterventions.length,
      successfulOutcomes: successful.length,
      successRate: withOutcomes.length > 0 ? successful.length / withOutcomes.length : 0,
      avgCompletionRate: avgCompletion,
      bestTimeOfDay,
      confidenceScore: confidence,
    };
  }

  /**
   * Get aggregate data for B2B reporting
   */
  getAggregateReport(): {
    totalInterventions: number;
    totalUsers: number;
    overallSuccessRate: number;
    behaviorBreakdown: Record<WellnessBehavior, {
      totalAttempts: number;
      totalSuccesses: number;
      avgSuccessRate: number;
    }>;
    timeOfDayInsights: Record<string, number>;
    topPerformingPlaylists: PlaylistEffectiveness[];
  } {
    const allInterventions = Array.from(this.interventions.values());
    const uniqueUsers = new Set(allInterventions.map(i => i.userId));

    const withOutcomes = allInterventions.filter(i => i.outcome);
    const successful = withOutcomes.filter(i => i.outcome?.targetBehaviorOccurred);

    // Behavior breakdown
    const behaviorBreakdown: Record<string, { totalAttempts: number; totalSuccesses: number; avgSuccessRate: number }> = {};
    for (const int of allInterventions) {
      if (!behaviorBreakdown[int.targetBehavior]) {
        behaviorBreakdown[int.targetBehavior] = { totalAttempts: 0, totalSuccesses: 0, avgSuccessRate: 0 };
      }
      behaviorBreakdown[int.targetBehavior].totalAttempts++;
      if (int.outcome?.targetBehaviorOccurred) {
        behaviorBreakdown[int.targetBehavior].totalSuccesses++;
      }
    }

    for (const stats of Object.values(behaviorBreakdown)) {
      stats.avgSuccessRate = stats.totalAttempts > 0
        ? stats.totalSuccesses / stats.totalAttempts
        : 0;
    }

    // Time of day success rates
    const timeOfDayData: Record<string, { total: number; successes: number }> = {};
    for (const int of allInterventions) {
      const tod = int.context.timeOfDay;
      if (!timeOfDayData[tod]) timeOfDayData[tod] = { total: 0, successes: 0 };
      timeOfDayData[tod].total++;
      if (int.outcome?.targetBehaviorOccurred) timeOfDayData[tod].successes++;
    }

    const timeOfDayInsights: Record<string, number> = {};
    for (const [time, data] of Object.entries(timeOfDayData)) {
      timeOfDayInsights[time] = data.total > 0 ? data.successes / data.total : 0;
    }

    // Top playlists
    const playlistIds = [...new Set(allInterventions.map(i => i.playlistId))];
    const topPerformingPlaylists = playlistIds
      .map(id => this.getPlaylistEffectiveness(id))
      .filter((p): p is PlaylistEffectiveness => p !== null && p.totalUses >= 5)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 10);

    return {
      totalInterventions: allInterventions.length,
      totalUsers: uniqueUsers.size,
      overallSuccessRate: withOutcomes.length > 0 ? successful.length / withOutcomes.length : 0,
      behaviorBreakdown: behaviorBreakdown as Record<WellnessBehavior, any>,
      timeOfDayInsights,
      topPerformingPlaylists,
    };
  }

  /**
   * Find correlations between music listening and behavior outcomes
   * This is the core of the "Marketing Genome Project for Good"
   */
  discoverCorrelations(minSampleSize: number = 10): MusicBehaviorCorrelation[] {
    // Group interventions by behavior and context
    const groups: Map<string, Intervention[]> = new Map();

    for (const int of this.interventions.values()) {
      const key = `${int.targetBehavior}-${int.context.timeOfDay}-${int.context.isWeekend}`;
      const group = groups.get(key) || [];
      group.push(int);
      groups.set(key, group);
    }

    const correlations: MusicBehaviorCorrelation[] = [];

    for (const [key, interventions] of groups) {
      if (interventions.length < minSampleSize) continue;

      const withOutcomes = interventions.filter(i => i.outcome);
      if (withOutcomes.length < minSampleSize) continue;

      const successes = withOutcomes.filter(i => i.outcome?.targetBehaviorOccurred).length;
      const successRate = successes / withOutcomes.length;

      // Calculate effect size (simplified)
      const baselineRate = 0.3;  // Assumed baseline without intervention
      const effectSize = (successRate - baselineRate) / Math.sqrt(baselineRate * (1 - baselineRate));

      const [behavior, timeOfDay, isWeekendStr] = key.split('-');

      correlations.push({
        musicFeatures: {},  // Would be populated from playlist analysis
        context: {
          timeOfDay: timeOfDay as any,
          isWeekend: isWeekendStr === 'true',
        },
        behavior: behavior as WellnessBehavior,
        correlationStrength: successRate - baselineRate,
        sampleSize: withOutcomes.length,
        confidence: Math.min(1, withOutcomes.length / 50),
        effectSize,
        lastUpdated: new Date(),
      });
    }

    return correlations.sort((a, b) => b.correlationStrength - a.correlationStrength);
  }

  // ===========================================================================
  // PRIVATE HELPERS
  // ===========================================================================

  private getCurrentTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    if (hour >= 21 || hour < 1) return 'night';
    return 'late_night';
  }

  private calculateStreak(interventions: Intervention[]): number {
    if (interventions.length === 0) return 0;

    const successfulDates = interventions
      .filter(i => i.outcome?.targetBehaviorOccurred)
      .map(i => {
        const d = new Date(i.startedAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      });

    if (successfulDates.length === 0) return 0;

    const uniqueDates = [...new Set(successfulDates)].sort((a, b) => b - a);

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);

      if (uniqueDates.includes(checkDate.getTime())) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  }
}

// Export singleton
export const interventionTracker = new InterventionTracker();
export default interventionTracker;
