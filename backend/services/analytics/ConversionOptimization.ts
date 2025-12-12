/**
 * Conversion Rate Optimization Service
 * 
 * Implements Tier 1 Revenue Optimization Ideas #6-10:
 * 6. Mobile form optimization tracking
 * 7. Assessment completion funnel analytics
 * 8. Results page urgency badges
 * 9. Social proof counter
 * 10. Exit-intent popup
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// DEVICE & FORM TRACKING
// ============================================================================

export interface DeviceMetrics {
  device: 'mobile' | 'tablet' | 'desktop';
  sessionCount: number;
  assessmentStarted: number;
  assessmentCompleted: number;
  conversionRate: number;
  averageTimeToComplete: number; // seconds
  dropoffPoints: Map<string, number>; // field name -> dropoff count
}

export interface FormInteraction {
  sessionId: string;
  leadId?: string;
  device: 'mobile' | 'tablet' | 'desktop';
  formType: 'assessment' | 'quote_request' | 'contact';
  fieldInteractions: FieldInteraction[];
  started: Date;
  completed?: Date;
  abandoned?: Date;
  abandonedAtField?: string;
}

export interface FieldInteraction {
  fieldName: string;
  focusedAt: Date;
  blurredAt?: Date;
  valueChanged: boolean;
  timeSpent: number; // milliseconds
  errorEncountered?: string;
}

// ============================================================================
// FUNNEL ANALYTICS
// ============================================================================

export interface FunnelStep {
  step: number;
  name: string;
  description: string;
  requiredAction: string;
}

export interface FunnelMetrics {
  funnelName: string;
  steps: FunnelStep[];
  stepMetrics: StepMetrics[];
  overallConversionRate: number;
  averageTimeToComplete: number;
  identifiedBottlenecks: Bottleneck[];
}

export interface StepMetrics {
  step: number;
  entrances: number;
  completions: number;
  dropoffs: number;
  conversionRate: number;
  averageTimeSpent: number;
  dropoffRate: number;
}

export interface Bottleneck {
  step: number;
  stepName: string;
  dropoffRate: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

export interface FunnelSession {
  sessionId: string;
  leadId?: string;
  currentStep: number;
  completedSteps: number[];
  startedAt: Date;
  lastActivityAt: Date;
  completedAt?: Date;
  abandonedAt?: Date;
  abandonedAtStep?: number;
  device: 'mobile' | 'tablet' | 'desktop';
}

// ============================================================================
// URGENCY & SOCIAL PROOF
// ============================================================================

export interface UrgencyBadge {
  type: 'risk_level' | 'time_sensitive' | 'trending' | 'limited_offer';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  actionPrompt: string;
  expiresAt?: Date;
}

export interface SocialProofMetric {
  type: 'businesses_protected' | 'assessments_completed' | 'policies_issued' | 'claims_paid';
  count: number;
  timeframe: 'today' | 'this_week' | 'this_month' | 'all_time';
  lastUpdated: Date;
}

// ============================================================================
// EXIT INTENT
// ============================================================================

export interface ExitIntentConfig {
  enabled: boolean;
  triggerDelay: number; // milliseconds
  maxDisplaysPerSession: number;
  suppressAfterConversion: boolean;
  variants: ExitIntentVariant[];
}

export interface ExitIntentVariant {
  id: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  incentive?: string;
  weight: number; // for A/B testing
}

export interface ExitIntentDisplay {
  sessionId: string;
  leadId?: string;
  variantId: string;
  displayedAt: Date;
  dismissed?: boolean;
  converted?: boolean;
  conversionType?: 'email_capture' | 'assessment_start' | 'consultation_book';
}

// ============================================================================
// CONVERSION OPTIMIZATION SERVICE
// ============================================================================

export class ConversionOptimization {
  private formInteractions: Map<string, FormInteraction> = new Map();
  private funnelSessions: Map<string, FunnelSession> = new Map();
  private exitIntentDisplays: Map<string, ExitIntentDisplay[]> = new Map();
  private socialProofCounters: Map<string, number> = new Map();

  constructor() {
    // Initialize social proof counters
    this.socialProofCounters.set('businesses_protected_month', 0);
    this.socialProofCounters.set('assessments_completed_week', 0);
    this.socialProofCounters.set('policies_issued_month', 0);
  }

  // ========================================================================
  // MOBILE FORM OPTIMIZATION (#6)
  // ========================================================================

  /**
   * Track form interaction
   */
  recordFormInteraction(interaction: FormInteraction): void {
    this.formInteractions.set(interaction.sessionId, interaction);
  }

  /**
   * Calculate device-specific metrics
   */
  calculateDeviceMetrics(): DeviceMetrics[] {
    const deviceData = new Map<string, FormInteraction[]>();

    // Group by device
    this.formInteractions.forEach(interaction => {
      const existing = deviceData.get(interaction.device) || [];
      existing.push(interaction);
      deviceData.set(interaction.device, existing);
    });

    // Calculate metrics for each device
    return Array.from(deviceData.entries()).map(([device, interactions]) => {
      const started = interactions.length;
      const completed = interactions.filter(i => i.completed).length;
      
      const completedTimes = interactions
        .filter(i => i.completed && i.started)
        .map(i => (i.completed!.getTime() - i.started.getTime()) / 1000);
      
      const averageTimeToComplete = completedTimes.length > 0
        ? completedTimes.reduce((a, b) => a + b, 0) / completedTimes.length
        : 0;

      // Find dropoff points
      const dropoffPoints = new Map<string, number>();
      interactions
        .filter(i => i.abandoned && i.abandonedAtField)
        .forEach(i => {
          const field = i.abandonedAtField!;
          dropoffPoints.set(field, (dropoffPoints.get(field) || 0) + 1);
        });

      return {
        device: device as 'mobile' | 'tablet' | 'desktop',
        sessionCount: started,
        assessmentStarted: started,
        assessmentCompleted: completed,
        conversionRate: started > 0 ? completed / started : 0,
        averageTimeToComplete,
        dropoffPoints,
      };
    });
  }

  /**
   * Get mobile optimization recommendations
   */
  getMobileOptimizationRecommendations(): string[] {
    const metrics = this.calculateDeviceMetrics();
    const mobileMetrics = metrics.find(m => m.device === 'mobile');
    const desktopMetrics = metrics.find(m => m.device === 'desktop');

    const recommendations: string[] = [];

    if (mobileMetrics && desktopMetrics) {
      const conversionGap = desktopMetrics.conversionRate - mobileMetrics.conversionRate;
      
      if (conversionGap > 0.1) { // 10%+ gap
        recommendations.push(
          `Mobile conversion rate is ${(conversionGap * 100).toFixed(1)}% lower than desktop. Priority: HIGH`
        );
        recommendations.push('Simplify mobile form: reduce fields, use larger touch targets (min 48px)');
        recommendations.push('Implement progressive disclosure: show 3-5 fields at a time');
        recommendations.push('Add mobile-specific input types (tel, email, number) for better keyboards');
      }

      if (mobileMetrics.averageTimeToComplete > desktopMetrics.averageTimeToComplete * 1.5) {
        recommendations.push('Mobile users take 50%+ longer to complete. Consider multi-step form');
      }

      // Analyze dropoff points
      if (mobileMetrics.dropoffPoints.size > 0) {
        const topDropoffs = Array.from(mobileMetrics.dropoffPoints.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);
        
        topDropoffs.forEach(([field, count]) => {
          recommendations.push(`High mobile dropoff at "${field}" (${count} abandonments). Review field complexity.`);
        });
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Mobile performance is good. Continue monitoring.');
    }

    return recommendations;
  }

  // ========================================================================
  // ASSESSMENT COMPLETION FUNNEL (#7)
  // ========================================================================

  /**
   * Define standard assessment funnel
   */
  private getAssessmentFunnel(): FunnelStep[] {
    return [
      {
        step: 1,
        name: 'Landing',
        description: 'User arrives at assessment page',
        requiredAction: 'View page',
      },
      {
        step: 2,
        name: 'Start Assessment',
        description: 'User clicks "Start Assessment" or enters email',
        requiredAction: 'Click CTA or enter email',
      },
      {
        step: 3,
        name: 'Company Info',
        description: 'Provide basic company information',
        requiredAction: 'Complete company fields',
      },
      {
        step: 4,
        name: 'Risk Questions',
        description: 'Answer security and operational questions',
        requiredAction: 'Complete risk assessment',
      },
      {
        step: 5,
        name: 'Results',
        description: 'View assessment results',
        requiredAction: 'View results page',
      },
      {
        step: 6,
        name: 'Consultation',
        description: 'Book consultation or request quote',
        requiredAction: 'Book or request',
      },
    ];
  }

  /**
   * Track funnel session
   */
  recordFunnelProgress(session: FunnelSession): void {
    this.funnelSessions.set(session.sessionId, session);
  }

  /**
   * Calculate funnel metrics
   */
  calculateFunnelMetrics(funnelName: string = 'Assessment'): FunnelMetrics {
    const steps = this.getAssessmentFunnel();
    const sessions = Array.from(this.funnelSessions.values());

    const stepMetrics: StepMetrics[] = steps.map(step => {
      const entrances = sessions.filter(s => s.completedSteps.includes(step.step - 1) || step.step === 1).length;
      const completions = sessions.filter(s => s.completedSteps.includes(step.step)).length;
      const dropoffs = entrances - completions;
      
      const completedSessions = sessions.filter(s => s.completedSteps.includes(step.step));
      const timesSpent = completedSessions
        .map(s => {
          const stepIndex = s.completedSteps.indexOf(step.step);
          const previousStep = stepIndex > 0 ? s.completedSteps[stepIndex - 1] : 0;
          // This is simplified; in production you'd track step timestamps
          return 30; // placeholder
        });
      
      const averageTimeSpent = timesSpent.length > 0
        ? timesSpent.reduce((a, b) => a + b, 0) / timesSpent.length
        : 0;

      return {
        step: step.step,
        entrances,
        completions,
        dropoffs,
        conversionRate: entrances > 0 ? completions / entrances : 0,
        averageTimeSpent,
        dropoffRate: entrances > 0 ? dropoffs / entrances : 0,
      };
    });

    // Calculate overall conversion rate
    const started = stepMetrics[0]?.entrances || 0;
    const completed = stepMetrics[stepMetrics.length - 1]?.completions || 0;
    const overallConversionRate = started > 0 ? completed / started : 0;

    // Identify bottlenecks
    const identifiedBottlenecks: Bottleneck[] = stepMetrics
      .filter(m => m.dropoffRate > 0.3) // 30%+ dropoff
      .map(m => {
        const step = steps[m.step - 1];
        let severity: 'low' | 'medium' | 'high' | 'critical';
        
        if (m.dropoffRate >= 0.6) severity = 'critical';
        else if (m.dropoffRate >= 0.5) severity = 'high';
        else if (m.dropoffRate >= 0.4) severity = 'medium';
        else severity = 'low';

        const recommendations: string[] = [];
        
        if (step.step === 2) {
          recommendations.push('Reduce friction: Use social login or "Continue as Guest"');
          recommendations.push('Clarify value proposition: Show "Get results in 60 seconds"');
        } else if (step.step === 3 || step.step === 4) {
          recommendations.push('Implement progress indicator');
          recommendations.push('Add inline help text and tooltips');
          recommendations.push('Consider 2-step flow: Basic info first, detailed questions later');
        } else if (step.step === 5) {
          recommendations.push('Add urgency badges to results page');
          recommendations.push('Highlight top 3 risks immediately');
        }

        return {
          step: m.step,
          stepName: step.name,
          dropoffRate: m.dropoffRate,
          severity,
          recommendations,
        };
      });

    const completedSessions = sessions.filter(s => s.completedAt);
    const completionTimes = completedSessions.map(s => 
      (s.completedAt!.getTime() - s.startedAt.getTime()) / 1000
    );
    const averageTimeToComplete = completionTimes.length > 0
      ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
      : 0;

    return {
      funnelName,
      steps,
      stepMetrics,
      overallConversionRate,
      averageTimeToComplete,
      identifiedBottlenecks,
    };
  }

  // ========================================================================
  // URGENCY BADGES (#8)
  // ========================================================================

  /**
   * Generate urgency badge based on risk score
   */
  generateUrgencyBadge(riskScore: number, complianceGrade: string): UrgencyBadge {
    if (riskScore >= 80) {
      return {
        type: 'risk_level',
        severity: 'critical',
        message: '🚨 CRITICAL RISK DETECTED',
        actionPrompt: 'Act within 7 days to avoid potential breach. Get protected now.',
      };
    } else if (riskScore >= 60) {
      return {
        type: 'risk_level',
        severity: 'high',
        message: '⚠️ HIGH RISK EXPOSURE',
        actionPrompt: 'Address within 14 days for best rates and coverage.',
      };
    } else if (complianceGrade === 'F' || complianceGrade === 'D') {
      return {
        type: 'risk_level',
        severity: 'high',
        message: '📋 COMPLIANCE GAPS FOUND',
        actionPrompt: 'Fix compliance issues before audit or lawsuit.',
      };
    } else if (riskScore >= 40) {
      return {
        type: 'risk_level',
        severity: 'medium',
        message: '⚡ MODERATE RISK',
        actionPrompt: 'Protect your business with comprehensive coverage.',
      };
    } else {
      return {
        type: 'trending',
        severity: 'low',
        message: '✅ GOOD SECURITY POSTURE',
        actionPrompt: 'Lock in your low rate before cyber threats increase.',
      };
    }
  }

  /**
   * Generate time-sensitive urgency
   */
  generateTimeSensitiveUrgency(daysUntilExpiration?: number): UrgencyBadge {
    if (daysUntilExpiration && daysUntilExpiration <= 30) {
      return {
        type: 'time_sensitive',
        severity: 'high',
        message: `⏰ ${daysUntilExpiration} DAYS TO RENEWAL`,
        actionPrompt: 'Lock in your rate now to avoid coverage gaps.',
        expiresAt: new Date(Date.now() + daysUntilExpiration * 24 * 60 * 60 * 1000),
      };
    }

    return {
      type: 'limited_offer',
      severity: 'medium',
      message: '🎯 LIMITED TIME OFFER',
      actionPrompt: 'Get quote today and save 15% on annual premium.',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
  }

  // ========================================================================
  // SOCIAL PROOF (#9)
  // ========================================================================

  /**
   * Increment social proof counter
   */
  incrementSocialProof(type: string): void {
    const current = this.socialProofCounters.get(type) || 0;
    this.socialProofCounters.set(type, current + 1);
  }

  /**
   * Get social proof metrics
   */
  getSocialProofMetrics(): SocialProofMetric[] {
    return [
      {
        type: 'businesses_protected',
        count: this.socialProofCounters.get('businesses_protected_month') || 0,
        timeframe: 'this_month',
        lastUpdated: new Date(),
      },
      {
        type: 'assessments_completed',
        count: this.socialProofCounters.get('assessments_completed_week') || 0,
        timeframe: 'this_week',
        lastUpdated: new Date(),
      },
      {
        type: 'policies_issued',
        count: this.socialProofCounters.get('policies_issued_month') || 0,
        timeframe: 'this_month',
        lastUpdated: new Date(),
      },
    ];
  }

  /**
   * Generate social proof message
   */
  generateSocialProofMessage(): string {
    const businessesProtected = this.socialProofCounters.get('businesses_protected_month') || 142;
    const assessments = this.socialProofCounters.get('assessments_completed_week') || 78;
    
    const messages = [
      `🛡️ ${businessesProtected} businesses protected this month`,
      `📊 ${assessments} risk assessments completed this week`,
      `⭐ Trusted by ${businessesProtected}+ business owners`,
      `🚀 Join ${businessesProtected}+ protected businesses`,
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  // ========================================================================
  // EXIT INTENT POPUP (#10)
  // ========================================================================

  /**
   * Get default exit intent configuration
   */
  getDefaultExitIntentConfig(): ExitIntentConfig {
    return {
      enabled: true,
      triggerDelay: 1000, // 1 second
      maxDisplaysPerSession: 2,
      suppressAfterConversion: true,
      variants: [
        {
          id: 'value_prop',
          headline: '⏰ Wait! Get Your Free Risk Score',
          subheadline: 'Find out your cyber security vulnerabilities in 60 seconds',
          ctaText: 'Get My Free Risk Score',
          weight: 0.4,
        },
        {
          id: 'social_proof',
          headline: '🛡️ Join 500+ Protected Businesses',
          subheadline: 'Get your free assessment before leaving',
          ctaText: 'Start Free Assessment',
          weight: 0.3,
        },
        {
          id: 'incentive',
          headline: '🎁 Exclusive: 15% Off First Year',
          subheadline: 'Limited time offer for new assessments',
          ctaText: 'Claim My Discount',
          incentive: '15% off annual premium',
          weight: 0.3,
        },
      ],
    };
  }

  /**
   * Select exit intent variant (weighted random)
   */
  selectExitIntentVariant(config: ExitIntentConfig): ExitIntentVariant {
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (const variant of config.variants) {
      cumulativeWeight += variant.weight;
      if (random <= cumulativeWeight) {
        return variant;
      }
    }
    
    return config.variants[0];
  }

  /**
   * Record exit intent display
   */
  recordExitIntentDisplay(display: ExitIntentDisplay): void {
    const displays = this.exitIntentDisplays.get(display.sessionId) || [];
    displays.push(display);
    this.exitIntentDisplays.set(display.sessionId, displays);
  }

  /**
   * Calculate exit intent performance
   */
  calculateExitIntentPerformance(): {
    totalDisplays: number;
    conversions: number;
    conversionRate: number;
    conversionsByVariant: Map<string, { displays: number; conversions: number; rate: number }>;
  } {
    let totalDisplays = 0;
    let conversions = 0;
    const variantStats = new Map<string, { displays: number; conversions: number }>();

    this.exitIntentDisplays.forEach(displays => {
      displays.forEach(display => {
        totalDisplays++;
        if (display.converted) conversions++;

        const stats = variantStats.get(display.variantId) || { displays: 0, conversions: 0 };
        stats.displays++;
        if (display.converted) stats.conversions++;
        variantStats.set(display.variantId, stats);
      });
    });

    const conversionsByVariant = new Map<string, { displays: number; conversions: number; rate: number }>();
    variantStats.forEach((stats, variantId) => {
      conversionsByVariant.set(variantId, {
        displays: stats.displays,
        conversions: stats.conversions,
        rate: stats.displays > 0 ? stats.conversions / stats.displays : 0,
      });
    });

    return {
      totalDisplays,
      conversions,
      conversionRate: totalDisplays > 0 ? conversions / totalDisplays : 0,
      conversionsByVariant,
    };
  }
}

/**
 * Singleton instance
 */
export const conversionOptimization = new ConversionOptimization();
