/**
 * Music Coach Agent
 *
 * Generates supportive, personalized coaching plans based on music-derived behavioral traits
 * and risk profiles. This agent never recommends premium increases or coverage denial—only
 * wellness resources, support programs, and concrete actions to improve well-being.
 *
 * See MUSIC_SIGNAL_SPEC.md § 5.3 Use Case Restrictions (Tier 2: Wellness Coaching)
 */

import { MusicDerivedTraits, MusicBehaviorRiskIndicators } from '../../intel/musicSignals';
import { musicEventsToRiskIndicators } from '../riskEngine/musicAdapter';

export interface StudentRiskProfile {
  studentId: string;
  campusId: string;
  riskScore: number; // 0-1
  riskBand: 'low' | 'moderate' | 'elevated' | 'high';
  riskDrivers: string[];
  repairSuggestions: string[];
  musicTraits?: MusicDerivedTraits;
  musicRiskIndicators?: MusicBehaviorRiskIndicators;
}

export interface CoachingPlan {
  studentId: string;
  campusId: string;
  generatedAt: Date;
  overallWellnessScore: number; // 0-1 (higher = better)
  currentRiskBand: 'low' | 'moderate' | 'elevated' | 'high';

  // Personalized insights
  strengths: Array<{
    category: string;
    description: string;
    howToMaintain: string;
  }>;

  areasForGrowth: Array<{
    category: string;
    currentState: string;
    targetState: string;
    priority: 'high' | 'medium' | 'low';
  }>;

  // Actionable suggestions (support-first, NEVER punitive)
  suggestions: Array<{
    category: 'social_engagement' | 'sleep_hygiene' | 'stress_management' | 'routine_building' | 'mindfulness';
    action: string;
    why: string;
    expectedBenefit: string;
    timeline: string;
    resources: string[];
  }>;

  // Campus resources
  campusResources: Array<{
    name: string;
    type: 'counseling' | 'peer_support' | 'wellness_workshop' | 'academic_support' | 'crisis_hotline';
    contact: string;
    availability: string;
  }>;

  // Progress tracking
  nextCheckIn: Date;
  progressMetrics: string[];
}

/**
 * Generate personalized coaching plan from student risk profile
 *
 * @param profile Student risk profile (includes music traits + risk indicators)
 * @param campusResources Available campus support resources
 * @returns Coaching plan with supportive, actionable suggestions
 */
export async function generateMusicCoachingPlan(
  profile: StudentRiskProfile,
  campusResources?: Array<{
    name: string;
    type: string;
    contact: string;
    availability: string;
  }>
): Promise<CoachingPlan> {
  const generatedAt = new Date();

  // Overall wellness score (inverse of risk score)
  const overallWellnessScore = 1 - profile.riskScore;

  // Identify strengths (protective factors)
  const strengths = identifyStrengths(profile);

  // Identify areas for growth (risk factors)
  const areasForGrowth = identifyAreasForGrowth(profile);

  // Generate personalized suggestions
  const suggestions = generateSuggestions(profile);

  // Map campus resources
  const resources = campusResources || getDefaultCampusResources(profile.campusId);

  // Calculate next check-in (weekly for elevated/high, monthly for low/moderate)
  const nextCheckIn = new Date();
  if (profile.riskBand === 'elevated' || profile.riskBand === 'high') {
    nextCheckIn.setDate(nextCheckIn.getDate() + 7); // Weekly
  } else {
    nextCheckIn.setDate(nextCheckIn.getDate() + 30); // Monthly
  }

  // Define progress metrics to track
  const progressMetrics = [
    'Music listening consistency (7-day average)',
    'Social engagement score (shared listening %)',
    'Sleep quality proxy (late-night listening %)',
    'Overall wellness score',
  ];

  return {
    studentId: profile.studentId,
    campusId: profile.campusId,
    generatedAt,
    overallWellnessScore,
    currentRiskBand: profile.riskBand,
    strengths,
    areasForGrowth,
    suggestions,
    campusResources: resources,
    nextCheckIn,
    progressMetrics,
  };
}

// ============================================================================
// Strengths Identification
// ============================================================================

function identifyStrengths(profile: StudentRiskProfile): Array<{
  category: string;
  description: string;
  howToMaintain: string;
}> {
  const strengths: Array<{ category: string; description: string; howToMaintain: string }> = [];

  const traits = profile.musicTraits;
  if (!traits) return strengths;

  // Social connectedness
  if (traits.socialListeningRatio > 0.3) {
    strengths.push({
      category: 'Social Connectedness',
      description: `You engage with music socially (${Math.round(traits.socialListeningRatio * 100)}% of listening is shared), which indicates strong social support networks.`,
      howToMaintain: 'Continue participating in shared playlists and music communities. Consider joining music-based student groups or attending campus concerts.',
    });
  }

  // Genre diversity (openness)
  if (traits.genreDiversity > 0.6) {
    strengths.push({
      category: 'Openness & Exploration',
      description: `You explore diverse music genres, which indicates openness and cognitive flexibility.`,
      howToMaintain: 'Keep exploring new artists and genres. This curiosity is a valuable strength—apply it to other areas of your life (new courses, clubs, experiences).',
    });
  }

  // Consistent routines
  if (traits.consistencyScore > 0.7) {
    strengths.push({
      category: 'Stable Routines',
      description: 'Your consistent listening patterns suggest you have stable daily routines, which is protective for mental health.',
      howToMaintain: 'Maintain your routines, especially during stressful periods like exams. Routines provide stability and reduce anxiety.',
    });
  }

  // Mood repair pattern
  if (traits.moodRepairPatternDetected) {
    strengths.push({
      category: 'Adaptive Coping',
      description: 'You use music proactively to manage your mood, which is an effective coping strategy.',
      howToMaintain: 'Continue using music as a tool for emotional regulation. Pair it with other healthy coping mechanisms (exercise, mindfulness, journaling).',
    });
  }

  // Stress listening (proactive stress management)
  if (traits.stressListeningRatio > 0.2) {
    strengths.push({
      category: 'Stress Awareness',
      description: 'You engage with music during stressful periods, showing awareness and proactive stress management.',
      howToMaintain: 'Keep using music during high-stress times. Also explore campus stress management resources (workshops, counseling, peer support).',
    });
  }

  return strengths;
}

// ============================================================================
// Areas for Growth Identification
// ============================================================================

function identifyAreasForGrowth(profile: StudentRiskProfile): Array<{
  category: string;
  currentState: string;
  targetState: string;
  priority: 'high' | 'medium' | 'low';
}> {
  const areas: Array<{
    category: string;
    currentState: string;
    targetState: string;
    priority: 'high' | 'medium' | 'low';
  }> = [];

  const traits = profile.musicTraits;
  if (!traits) return areas;

  // Social withdrawal
  if (traits.socialWithdrawalDetected) {
    areas.push({
      category: 'Social Engagement',
      currentState: 'You've reduced social listening by >50% recently, which may indicate isolation.',
      targetState: 'Re-engage with shared playlists and music-based social activities.',
      priority: 'high',
    });
  }

  // High volatility
  if (traits.volatilityIndex > 0.6) {
    areas.push({
      category: 'Emotional Stability',
      currentState: 'Your listening patterns vary significantly day-to-day, which may indicate emotional ups and downs.',
      targetState: 'Develop more consistent daily routines and coping strategies for emotional regulation.',
      priority: 'high',
    });
  }

  // Late-night listening (sleep disruption)
  if (traits.lateNightRatio > 0.3) {
    areas.push({
      category: 'Sleep Hygiene',
      currentState: `${Math.round(traits.lateNightRatio * 100)}% of your listening is 11pm-4am, which may indicate sleep disruption.`,
      targetState: 'Reduce late-night listening to <20% and establish consistent sleep schedule.',
      priority: 'medium',
    });
  }

  // Low consistency (lack of routine)
  if (traits.consistencyScore < 0.4) {
    areas.push({
      category: 'Routine Building',
      currentState: 'Irregular listening patterns suggest you may lack stable daily routines.',
      targetState: 'Build consistent daily routines (regular sleep, meals, study times, music listening).',
      priority: 'medium',
    });
  }

  // Declining engagement
  if (traits.engagementTrend === 'declining') {
    areas.push({
      category: 'Overall Engagement',
      currentState: 'Your music engagement has been decreasing, which may indicate disengagement or withdrawal.',
      targetState: 'Re-engage with activities you enjoy, including music and campus life.',
      priority: 'high',
    });
  }

  return areas;
}

// ============================================================================
// Suggestions Generation
// ============================================================================

function generateSuggestions(profile: StudentRiskProfile): Array<{
  category: 'social_engagement' | 'sleep_hygiene' | 'stress_management' | 'routine_building' | 'mindfulness';
  action: string;
  why: string;
  expectedBenefit: string;
  timeline: string;
  resources: string[];
}> {
  const suggestions: Array<{
    category: 'social_engagement' | 'sleep_hygiene' | 'stress_management' | 'routine_building' | 'mindfulness';
    action: string;
    why: string;
    expectedBenefit: string;
    timeline: string;
    resources: string[];
  }> = [];

  const traits = profile.musicTraits;
  const indicators = profile.musicRiskIndicators;

  // Use recommendations from music risk indicators if available
  if (indicators?.recommendations) {
    for (const rec of indicators.recommendations) {
      let why = '';
      let resources: string[] = [];

      switch (rec.category) {
        case 'social_engagement':
          why = 'Social connections are protective against stress and improve overall well-being. Music is a great way to connect with others.';
          resources = ['Campus music clubs', 'Shared playlist communities', 'Peer support groups', 'Student social events'];
          break;
        case 'sleep_hygiene':
          why = 'Good sleep is foundational for mental health, academic performance, and emotional regulation.';
          resources = ['Campus counseling sleep workshops', 'Sleep tracking apps', 'Relaxation playlists', 'Evening routine guides'];
          break;
        case 'stress_management':
          why = 'Managing stress proactively prevents burnout and helps you stay resilient during challenging times.';
          resources = ['Campus counseling center', 'Mindfulness apps', 'Stress management workshops', 'Peer support groups'];
          break;
        case 'routine_building':
          why = 'Consistent routines provide stability and reduce decision fatigue, freeing mental energy for what matters.';
          resources = ['Time management workshops', 'Habit tracking apps', 'Academic success coaching', 'Study skills resources'];
          break;
      }

      suggestions.push({
        category: rec.category,
        action: rec.action,
        why,
        expectedBenefit: `Estimated ${rec.expectedImpact}% improvement in wellness score`,
        timeline: rec.timeline,
        resources,
      });
    }
  }

  // Add mindfulness suggestion if high volatility or stress
  if (traits && (traits.volatilityIndex > 0.6 || traits.stressListeningRatio > 0.3)) {
    suggestions.push({
      category: 'mindfulness',
      action: 'Practice 10 minutes of mindfulness or meditation daily. Use music as a grounding tool.',
      why: 'Mindfulness helps regulate emotions, reduce stress reactivity, and improve focus.',
      expectedBenefit: '15-20% improvement in emotional stability over 4 weeks',
      timeline: '30 days',
      resources: [
        'Headspace or Calm apps (free for students)',
        'Campus mindfulness workshops',
        'Guided meditation playlists',
        'Counseling center mindfulness groups',
      ],
    });
  }

  return suggestions;
}

// ============================================================================
// Default Campus Resources
// ============================================================================

function getDefaultCampusResources(campusId: string): Array<{
  name: string;
  type: 'counseling' | 'peer_support' | 'wellness_workshop' | 'academic_support' | 'crisis_hotline';
  contact: string;
  availability: string;
}> {
  // TODO: Replace with actual campus-specific resources from database
  // For now, return generic CSUDH-style resources

  return [
    {
      name: 'Campus Counseling Center',
      type: 'counseling',
      contact: 'counseling@campus.edu | (555) 123-4567',
      availability: 'Mon-Fri 9am-5pm, Walk-ins welcome',
    },
    {
      name: 'Peer Support Groups',
      type: 'peer_support',
      contact: 'peersupport@campus.edu',
      availability: 'Weekly meetings (Tues/Thurs 6pm, Student Center)',
    },
    {
      name: 'Wellness Workshops',
      type: 'wellness_workshop',
      contact: 'wellness@campus.edu',
      availability: 'Monthly workshops (stress management, sleep, mindfulness)',
    },
    {
      name: 'Academic Success Coaching',
      type: 'academic_support',
      contact: 'academicsuccess@campus.edu',
      availability: 'Mon-Fri 10am-4pm, By appointment',
    },
    {
      name: '24/7 Crisis Hotline',
      type: 'crisis_hotline',
      contact: '1-800-CRISIS-1 (1-800-274-7471)',
      availability: '24/7 confidential support',
    },
  ];
}

/**
 * Format coaching plan for console output (plain text)
 */
export function formatCoachingPlan(plan: CoachingPlan): string {
  let output = '\n';
  output += '═'.repeat(80) + '\n';
  output += `  🎵 INFINITYSOUL WELLNESS COACHING PLAN\n`;
  output += '═'.repeat(80) + '\n\n';

  output += `Student ID: ${plan.studentId}\n`;
  output += `Campus: ${plan.campusId}\n`;
  output += `Generated: ${plan.generatedAt.toLocaleString()}\n`;
  output += `Overall Wellness Score: ${Math.round(plan.overallWellnessScore * 100)}/100\n`;
  output += `Current Risk Band: ${plan.currentRiskBand.toUpperCase()}\n\n`;

  // Strengths
  if (plan.strengths.length > 0) {
    output += '✨ Your Strengths:\n\n';
    plan.strengths.forEach((strength, i) => {
      output += `  ${i + 1}. ${strength.category}\n`;
      output += `     ${strength.description}\n`;
      output += `     💡 How to maintain: ${strength.howToMaintain}\n\n`;
    });
  }

  // Areas for growth
  if (plan.areasForGrowth.length > 0) {
    output += '🌱 Areas for Growth:\n\n';
    plan.areasForGrowth.forEach((area, i) => {
      const prioritySymbol = area.priority === 'high' ? '🔴' : area.priority === 'medium' ? '🟡' : '🟢';
      output += `  ${prioritySymbol} ${i + 1}. ${area.category} (${area.priority} priority)\n`;
      output += `     Current: ${area.currentState}\n`;
      output += `     Target: ${area.targetState}\n\n`;
    });
  }

  // Suggestions
  if (plan.suggestions.length > 0) {
    output += '📋 Your Personalized Action Plan:\n\n';
    plan.suggestions.forEach((suggestion, i) => {
      output += `  ${i + 1}. ${suggestion.action}\n`;
      output += `     Why: ${suggestion.why}\n`;
      output += `     Expected benefit: ${suggestion.expectedBenefit}\n`;
      output += `     Timeline: ${suggestion.timeline}\n`;
      output += `     Resources: ${suggestion.resources.join(', ')}\n\n`;
    });
  }

  // Campus resources
  output += '🏫 Campus Resources Available to You:\n\n';
  plan.campusResources.forEach((resource) => {
    output += `  • ${resource.name} (${resource.type})\n`;
    output += `    Contact: ${resource.contact}\n`;
    output += `    Availability: ${resource.availability}\n\n`;
  });

  // Next steps
  output += '📅 Next Steps:\n\n';
  output += `  • Next check-in: ${plan.nextCheckIn.toLocaleDateString()}\n`;
  output += `  • Progress metrics we'll track:\n`;
  plan.progressMetrics.forEach((metric) => {
    output += `    - ${metric}\n`;
  });
  output += '\n';

  output += '💙 Remember: This is about growth and support, not judgment.\n';
  output += 'You're taking proactive steps toward better well-being. We're here to help!\n\n';

  output += '═'.repeat(80) + '\n';

  return output;
}
