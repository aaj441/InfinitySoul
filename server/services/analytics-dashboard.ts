import { storage } from '../storage';
import { logger } from '../logger';

export interface DashboardMetrics {
  totalProspects: number;
  activeProspects: number;
  totalEmails: number;
  emailsOpened: number;
  emailsClicked: number;
  totalScans: number;
  averageWCAGScore: number;
  avgTimeToContact: number;
  conversionRate: number;
  topRiskProspects: any[];
  cadencePerformance: any[];
  scoreDistribution: any;
  revenueMetrics: any;
}

export class AnalyticsDashboard {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const prospects = await storage.getProspects();
      const scanJobs = await storage.getScanJobs();
      
      const activeProspects = prospects.filter(p => p.status === 'active').length;
      const topRiskProspects = prospects
        .filter(p => p.riskLevel === 'high-risk')
        .sort((a, b) => (b.icpScore || 0) - (a.icpScore || 0))
        .slice(0, 5);

      const completedScans = scanJobs.filter(s => s.status === 'completed');
      const totalViolations = completedScans.reduce((sum, s) => sum + (s.totalViolations || 0), 0);
      const avgWCAGScore = completedScans.length > 0
        ? completedScans.reduce((sum, s) => sum + (s.wcagScore || 0), 0) / completedScans.length
        : 0;

      const scoreDistribution = {
        '0-20': prospects.filter(p => (p.icpScore || 0) < 20).length,
        '20-40': prospects.filter(p => (p.icpScore || 0) >= 20 && (p.icpScore || 0) < 40).length,
        '40-60': prospects.filter(p => (p.icpScore || 0) >= 40 && (p.icpScore || 0) < 60).length,
        '60-80': prospects.filter(p => (p.icpScore || 0) >= 60 && (p.icpScore || 0) < 80).length,
        '80-100': prospects.filter(p => (p.icpScore || 0) >= 80).length,
      };

      return {
        totalProspects: prospects.length,
        activeProspects,
        totalEmails: 0,
        emailsOpened: 0,
        emailsClicked: 0,
        totalScans: completedScans.length,
        averageWCAGScore: Math.round(avgWCAGScore),
        avgTimeToContact: 0,
        conversionRate: 0,
        topRiskProspects,
        cadencePerformance: [],
        scoreDistribution,
        revenueMetrics: {
          potentialValue: activeProspects * 5000,
          pipelineValue: topRiskProspects.length * 15000,
        }
      };
    } catch (error) {
      logger.error('Failed to generate dashboard metrics', error as Error);
      throw error;
    }
  }

  async getTimeSeriesData(days: number = 30): Promise<any[]> {
    const analytics = await storage.getAnalytics(
      new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      new Date()
    );
    return analytics.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async getCadenceMetrics(): Promise<any> {
    const prospects = await storage.getProspects();
    const cadencesByStatus = {
      active: 0,
      paused: 0,
      completed: 0,
    };

    for (const prospect of prospects) {
      const cadences = await storage.getEmailCadencesByProspect(prospect.id);
      cadences.forEach(c => {
        if (c.status === 'active' || c.status === 'pending') {
          cadencesByStatus.active++;
        } else if (c.status === 'paused') {
          cadencesByStatus.paused++;
        } else {
          cadencesByStatus.completed++;
        }
      });
    }

    return cadencesByStatus;
  }

  async getIndustryBreakdown(): Promise<Record<string, number>> {
    const prospects = await storage.getProspects();
    const breakdown: Record<string, number> = {};

    for (const prospect of prospects) {
      const industry = prospect.industry || 'Unknown';
      breakdown[industry] = (breakdown[industry] || 0) + 1;
    }

    return breakdown;
  }
}

export const analyticsDashboard = new AnalyticsDashboard();
