/**
 * Revenue Analytics Service Tests
 * 
 * Tests for all 5 analytics modules (Ideas #1-5):
 * - A/B Test Significance Calculator
 * - Multi-Touch Attribution
 * - Churn Prediction
 * - Segmented LTV
 * - Multi-Channel CAC
 */

import {
  ABTestCalculator,
  MultiTouchAttribution,
  ChurnPredictor,
  IndustryLTVAnalyzer,
  ChannelCACTracker,
  RevenueAnalyticsService,
} from '../../backend/services/analytics/RevenueAnalytics';

describe('Revenue Analytics Service', () => {
  
  // ==========================================================================
  // IDEA #1: A/B TEST SIGNIFICANCE CALCULATOR
  // ==========================================================================
  
  describe('ABTestCalculator', () => {
    
    it('should require minimum 385 samples per variant', () => {
      const result = ABTestCalculator.calculateSignificance(
        { conversions: 8, exposures: 32 },
        { conversions: 10, exposures: 32 },
        0.95
      );
      
      expect(result.isSignificant).toBe(false);
      expect(result.recommendation).toContain('Not enough data');
      expect(result.recommendation).toContain('385');
    });
    
    it('should detect significant difference with sufficient samples', () => {
      // Variant A: 2% conversion (8/400)
      // Variant B: 4% conversion (16/400) 
      const result = ABTestCalculator.calculateSignificance(
        { conversions: 8, exposures: 400 },
        { conversions: 16, exposures: 400 },
        0.95
      );
      
      expect(result.isSignificant).toBe(true);
      expect(result.pValue).toBeLessThan(0.05);
      expect(result.recommendation).toContain('wins');
    });
    
    it('should handle edge case with 0% conversion', () => {
      const result = ABTestCalculator.calculateSignificance(
        { conversions: 0, exposures: 400 },
        { conversions: 10, exposures: 400 },
        0.95
      );
      
      expect(result.variantA.conversionRate).toBe(0);
      expect(result.variantB.conversionRate).toBeGreaterThan(0);
    });
  });
  
  // ==========================================================================
  // IDEA #2: MULTI-TOUCH ATTRIBUTION
  // ==========================================================================
  
  describe('MultiTouchAttribution', () => {
    let attribution: MultiTouchAttribution;
    
    beforeEach(() => {
      attribution = new MultiTouchAttribution();
    });
    
    it('should track touchpoints for a user', () => {
      const userId = 'user-123';
      
      attribution.trackTouchPoint(userId, {
        channel: 'email',
        timestamp: new Date('2024-01-01'),
        type: 'email_open',
        metadata: { emailNumber: 1 },
      });
      
      const result = attribution.calculateAttribution(userId, 1000);
      
      expect(result).not.toBeNull();
      expect(result?.touchPoints).toHaveLength(1);
    });
    
    it('should track email sequence performance', () => {
      // Simulate multiple users going through 5-email sequence
      for (let i = 1; i <= 10; i++) {
        const userId = `user-${i}`;
        
        // All users open emails 1-3
        for (let emailNum = 1; emailNum <= 3; emailNum++) {
          attribution.trackTouchPoint(userId, {
            channel: 'email',
            timestamp: new Date(),
            type: 'email_open',
            metadata: { emailNumber: emailNum },
          });
        }
        
        // Only some users open email 4 and 5
        if (i <= 5) {
          attribution.trackTouchPoint(userId, {
            channel: 'email',
            timestamp: new Date(),
            type: 'email_open',
            metadata: { emailNumber: 4 },
          });
          
          attribution.trackTouchPoint(userId, {
            channel: 'email',
            timestamp: new Date(),
            type: 'email_open',
            metadata: { emailNumber: 5 },
          });
          
          // Convert after email 5
          attribution.trackTouchPoint(userId, {
            channel: 'email',
            timestamp: new Date(),
            type: 'conversion',
            metadata: { emailNumber: 5 },
          });
        }
      }
      
      const performance = attribution.getEmailSequencePerformance();
      
      // Email 1-3 should have 10 opens each
      expect(performance[1].opens).toBe(10);
      expect(performance[2].opens).toBe(10);
      expect(performance[3].opens).toBe(10);
      
      // Email 4-5 should have 5 opens each
      expect(performance[4].opens).toBe(5);
      expect(performance[5].opens).toBe(5);
      
      // Email 5 should have all conversions
      expect(performance[5].conversions).toBe(5);
    });
  });
  
  // ==========================================================================
  // IDEA #3: CHURN PREDICTION
  // ==========================================================================
  
  describe('ChurnPredictor', () => {
    let predictor: ChurnPredictor;
    
    beforeEach(() => {
      predictor = new ChurnPredictor();
    });
    
    it('should flag customer with no email opens in 30+ days as CRITICAL', () => {
      const now = new Date();
      const emailHistory = [
        { date: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000), opened: true },
        { date: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000), opened: false },
        { date: new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000), opened: false },
      ];
      
      const prediction = predictor.predictChurn('user-123', emailHistory);
      
      expect(prediction.riskLevel).toBe('CRITICAL');
      expect(prediction.riskScore).toBeGreaterThan(70);
      expect(prediction.indicators.daysSinceLastOpen).toBeGreaterThan(30);
    });
    
    it('should detect engagement drop after day 20', () => {
      const now = new Date();
      
      // Good engagement in days 30-60 (80% open rate)
      const oldEmails = Array.from({ length: 10 }, (_, i) => ({
        date: new Date(now.getTime() - (40 + i) * 24 * 60 * 60 * 1000),
        opened: i < 8, // 8/10 = 80%
      }));
      
      // Poor engagement in last 30 days (20% open rate)
      const recentEmails = Array.from({ length: 10 }, (_, i) => ({
        date: new Date(now.getTime() - (10 + i) * 24 * 60 * 60 * 1000),
        opened: i < 2, // 2/10 = 20%
      }));
      
      const emailHistory = [...oldEmails, ...recentEmails];
      
      const prediction = predictor.predictChurn('user-456', emailHistory);
      
      expect(prediction.indicators.emailEngagementDrop).toBe(true);
      expect(prediction.indicators.openRateDecline).toBeGreaterThan(0.3);
      expect(prediction.riskLevel).not.toBe('LOW');
    });
  });
  
  // ==========================================================================
  // IDEA #4: SEGMENTED LTV BY INDUSTRY
  // ==========================================================================
  
  describe('IndustryLTVAnalyzer', () => {
    let analyzer: IndustryLTVAnalyzer;
    
    beforeEach(() => {
      analyzer = new IndustryLTVAnalyzer();
    });
    
    it('should calculate LTV for an industry', () => {
      const now = new Date();
      const signupDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
      
      // Add 10 construction customers
      for (let i = 1; i <= 10; i++) {
        analyzer.trackCustomer(
          'construction',
          `customer-${i}`,
          signupDate,
          5000, // $5K total revenue
          undefined // Not churned
        );
      }
      
      const ltv = analyzer.calculateIndustryLTV('construction');
      
      expect(ltv).not.toBeNull();
      expect(ltv!.industry).toBe('construction');
      expect(ltv!.avgLifetimeValue).toBe(5000);
      expect(ltv!.customerCount).toBe(10);
      expect(ltv!.churnRate).toBe(0);
    });
    
    it('should identify industries with 2-3x higher LTV', () => {
      const now = new Date();
      const signupDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      
      // Construction: High LTV ($6K)
      for (let i = 1; i <= 5; i++) {
        analyzer.trackCustomer('construction', `const-${i}`, signupDate, 6000);
      }
      
      // SaaS: Low LTV ($2K)
      for (let i = 1; i <= 5; i++) {
        analyzer.trackCustomer('saas', `saas-${i}`, signupDate, 2000);
      }
      
      const ranked = analyzer.getAllIndustriesRankedByLTV();
      
      expect(ranked[0].industry).toBe('construction');
      expect(ranked[1].industry).toBe('saas');
      expect(ranked[0].avgLifetimeValue).toBeGreaterThan(ranked[1].avgLifetimeValue * 2);
    });
  });
  
  // ==========================================================================
  // IDEA #5: MULTI-CHANNEL CAC TRACKER
  // ==========================================================================
  
  describe('ChannelCACTracker', () => {
    let tracker: ChannelCACTracker;
    
    beforeEach(() => {
      tracker = new ChannelCACTracker();
    });
    
    it('should calculate CAC for a channel', () => {
      tracker.trackSpend('google_ads', 2000);
      tracker.trackConversion('google_ads', 'customer-1', 5000);
      tracker.trackConversion('google_ads', 'customer-2', 5000);
      
      const cac = tracker.calculateChannelCAC('google_ads');
      
      expect(cac).not.toBeNull();
      expect(cac!.totalSpend).toBe(2000);
      expect(cac!.conversions).toBe(2);
      expect(cac!.cac).toBe(1000); // $2000 / 2 = $1000 CAC
      expect(cac!.ltv).toBe(5000);
    });
    
    it('should identify zero CAC channels (podcasts)', () => {
      tracker.trackSpend('podcast', 0); // No spend
      tracker.trackConversion('podcast', 'customer-1', 5000);
      tracker.trackConversion('podcast', 'customer-2', 5000);
      tracker.trackConversion('podcast', 'customer-3', 5000);
      
      const cac = tracker.calculateChannelCAC('podcast');
      
      expect(cac).not.toBeNull();
      expect(cac!.cac).toBe(0);
      expect(cac!.conversions).toBe(3);
    });
    
    it('should recommend increasing spend on high-performing channels', () => {
      // Excellent channel (5x LTV:CAC)
      tracker.trackSpend('podcast', 0);
      tracker.trackConversion('podcast', 'c1', 5000);
      
      // Poor channel (1.3x LTV:CAC)
      tracker.trackSpend('linkedin', 3000);
      tracker.trackConversion('linkedin', 'c2', 4000);
      
      const { recommendations } = tracker.getReallocationRecommendations();
      
      const podcastRec = recommendations.find(r => r.channel === 'podcast');
      const linkedinRec = recommendations.find(r => r.channel === 'linkedin');
      
      expect(podcastRec?.action).toBe('INCREASE');
      expect(linkedinRec?.action).toBe('DECREASE');
    });
  });
  
  // ==========================================================================
  // INTEGRATED SERVICE
  // ==========================================================================
  
  describe('RevenueAnalyticsService', () => {
    let service: RevenueAnalyticsService;
    
    beforeEach(() => {
      service = new RevenueAnalyticsService();
    });
    
    it('should provide comprehensive dashboard', () => {
      const dashboard = service.getDashboard();
      
      expect(dashboard).toHaveProperty('abTests');
      expect(dashboard).toHaveProperty('emailSequencePerformance');
      expect(dashboard).toHaveProperty('topIndustries');
      expect(dashboard).toHaveProperty('topChannels');
      expect(dashboard).toHaveProperty('channelRecommendations');
    });
    
    it('should integrate all 5 analytics modules', () => {
      expect(service.abTestCalculator).toBeDefined();
      expect(service.multiTouchAttribution).toBeDefined();
      expect(service.churnPredictor).toBeDefined();
      expect(service.industryLTVAnalyzer).toBeDefined();
      expect(service.channelCACTracker).toBeDefined();
    });
  });
});
