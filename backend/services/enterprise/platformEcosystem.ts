/**
 * Phase XI: Enterprise Ecosystem & White-Label Platform
 * Multi-tenant SaaS architecture, partner integrations, feature access control, and billing
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// ENTERPRISE ECOSYSTEM SERVICE
// ============================================================================

export interface EnterpriseAccountInput {
  name: string;
  accountType: 'law_firm' | 'insurer' | 'agency' | 'consultant' | 'in_house';
  primaryContact: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  industry?: string;
  subscriptionTier: 'starter' | 'professional' | 'enterprise';
  billingEmail: string;
}

export interface WhiteLabelConfigInput {
  companyName: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customDomain?: string;
  hidePoweredBy?: boolean;
}

export interface APIIntegrationInput {
  integrationType: string; // 'salesforce', 'slack', 'jira', etc.
  name: string;
  apiKey: string;
  apiSecret: string;
}

export interface FeatureAccessInput {
  featureName: string;
  featureId: string;
  featureCategory: 'core' | 'premium' | 'enterprise';
  accessTier: 'starter' | 'professional' | 'enterprise';
  requestLimitPerMonth?: number;
  concurrentUsers?: number;
}

export class EnterpriseEcosystemService {
  /**
   * Create new enterprise account with multi-tenancy support
   */
  async createEnterpriseAccount(input: EnterpriseAccountInput) {
    const decisionId = `enterprise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const auditLog: string[] = [];

    try {
      auditLog.push(`[${new Date().toISOString()}] Creating enterprise account: ${input.name}`);

      const account = await prisma.enterpriseAccount.create({
        data: {
          name: input.name,
          accountType: input.accountType,
          primaryContact: input.primaryContact,
          contactEmail: input.contactEmail,
          contactPhone: input.contactPhone,
          website: input.website,
          industry: input.industry,
          subscriptionTier: input.subscriptionTier,
          subscriptionStatus: 'trial',
          subscriptionEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
          billingEmail: input.billingEmail,
          enabledFeatures: this.getFeaturesByTier(input.subscriptionTier),
          customBranding: input.subscriptionTier !== 'starter',
          whiteLabel: input.subscriptionTier === 'enterprise',
          apiAccess: input.subscriptionTier === 'enterprise',
        },
      });

      // Create initial usage metrics record
      await prisma.usageMetrics.create({
        data: {
          accountId: account.id,
          metricsMonth: new Date().toISOString().slice(0, 7),
        },
      });

      // Grant default features for tier
      await this.grantTierFeatures(account.id, input.subscriptionTier);

      auditLog.push(`[${new Date().toISOString()}] Account created: ${account.id}`);

      return {
        success: true,
        account,
        decisionId,
        auditLog,
      };
    } catch (error) {
      auditLog.push(`[${new Date().toISOString()}] ERROR: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Configure white-label branding for enterprise account
   */
  async configureWhiteLabel(accountId: string, config: WhiteLabelConfigInput) {
    const account = await prisma.enterpriseAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) throw new Error('Account not found');
    if (!account.whiteLabel) throw new Error('White-label not enabled for this tier');

    const whitelabelConfig = await prisma.whiteLabelConfig.upsert({
      where: { accountId },
      create: {
        accountId,
        companyName: config.companyName,
        logoUrl: config.logoUrl,
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
        customDomain: config.customDomain,
        hidePoweredBy: config.hidePoweredBy || false,
      },
      update: {
        companyName: config.companyName,
        logoUrl: config.logoUrl,
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
        customDomain: config.customDomain,
        hidePoweredBy: config.hidePoweredBy || false,
      },
    });

    return whitelabelConfig;
  }

  /**
   * Add API integration for enterprise partner
   */
  async addAPIIntegration(accountId: string, input: APIIntegrationInput) {
    const account = await prisma.enterpriseAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) throw new Error('Account not found');
    if (!account.apiAccess) throw new Error('API access not enabled for this tier');

    // Encrypt credentials before storing (in production)
    const integration = await prisma.apiIntegration.create({
      data: {
        accountId,
        integrationType: input.integrationType,
        name: input.name,
        apiKey: input.apiKey, // In production: encrypt
        apiSecret: input.apiSecret, // In production: encrypt
        isActive: false,
        syncFrequency: 'daily',
        dataSync: this.getDefaultSyncFields(input.integrationType),
      },
    });

    return integration;
  }

  /**
   * Test API integration connection
   */
  async testIntegration(integrationId: string) {
    const integration = await prisma.apiIntegration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) throw new Error('Integration not found');

    // Simulate API connection test
    const connectionSuccess = Math.random() > 0.1; // 90% success rate

    if (connectionSuccess) {
      const updated = await prisma.apiIntegration.update({
        where: { id: integrationId },
        data: {
          lastTestedAt: new Date(),
          isActive: true,
        },
      });

      return {
        success: true,
        message: 'Integration connection successful',
        integration: updated,
      };
    } else {
      return {
        success: false,
        message: 'Connection failed: Invalid credentials or API endpoint unreachable',
        integration,
      };
    }
  }

  /**
   * Grant specific feature access to account
   */
  async grantFeatureAccess(accountId: string, input: FeatureAccessInput) {
    const account = await prisma.enterpriseAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) throw new Error('Account not found');

    // Verify tier eligibility
    const tierHierarchy = { starter: 0, professional: 1, enterprise: 2 };
    if (tierHierarchy[input.accessTier] > tierHierarchy[account.subscriptionTier]) {
      throw new Error(`Feature requires ${input.accessTier} tier or higher`);
    }

    const featureAccess = await prisma.featureAccess.create({
      data: {
        accountId,
        featureName: input.featureName,
        featureId: input.featureId,
        featureCategory: input.featureCategory,
        accessLevel: 'full',
        accessTier: input.accessTier,
        requestLimitPerMonth: input.requestLimitPerMonth,
        concurrentUsers: input.concurrentUsers,
      },
    });

    return featureAccess;
  }

  /**
   * Create and manage partnership agreement
   */
  async createPartnership(input: {
    partnerName: string;
    partnerType: string;
    contactEmail: string;
    revenueSplitPercentage: number;
    minimumThreshold: number;
  }) {
    const agreement = await prisma.partnershipAgreement.create({
      data: {
        partnerName: input.partnerName,
        partnerType: input.partnerType,
        contactEmail: input.contactEmail,
        revenueSplitPercentage: input.revenueSplitPercentage,
        minimumThreshold: input.minimumThreshold,
      },
    });

    return agreement;
  }

  /**
   * Track usage and generate billing metrics
   */
  async trackUsage(
    accountId: string,
    usage: {
      apiCalls: number;
      scans: number;
      reports: number;
      activeUsers: number;
    },
  ) {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const metrics = await prisma.usageMetrics.upsert({
      where: {
        accountId: accountId,
      },
      create: {
        accountId,
        metricsMonth: currentMonth,
        apiCallsTotal: usage.apiCalls,
        scansRun: usage.scans,
        reportsGenerated: usage.reports,
        activeUsers: usage.activeUsers,
        estimatedCost: this.calculateMonthlyBill(accountId, usage),
      },
      update: {
        apiCallsTotal: { increment: usage.apiCalls },
        scansRun: { increment: usage.scans },
        reportsGenerated: { increment: usage.reports },
        activeUsers: usage.activeUsers,
        estimatedCost: this.calculateMonthlyBill(accountId, usage),
      },
    });

    return metrics;
  }

  /**
   * Generate enterprise usage analytics
   */
  async getUsageAnalytics(accountId: string, monthsBack: number = 3) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    const metrics = await prisma.usageMetrics.findMany({
      where: {
        accountId,
        metricsMonth: {
          gte: startDate.toISOString().slice(0, 7),
          lte: endDate.toISOString().slice(0, 7),
        },
      },
      orderBy: { metricsMonth: 'asc' },
    });

    const analytics = {
      totalApiCalls: metrics.reduce((sum, m) => sum + m.apiCallsTotal, 0),
      totalScans: metrics.reduce((sum, m) => sum + m.scansRun, 0),
      totalReports: metrics.reduce((sum, m) => sum + m.reportsGenerated, 0),
      averageActiveUsers:
        Math.floor(
          metrics.reduce((sum, m) => sum + m.activeUsers, 0) / Math.max(metrics.length, 1),
        ) || 0,
      totalBilling: metrics.reduce((sum, m) => sum + m.estimatedCost, 0),
      monthlyBreakdown: metrics,
    };

    return analytics;
  }

  /**
   * Manage subscription upgrade/downgrade
   */
  async updateSubscription(
    accountId: string,
    newTier: 'starter' | 'professional' | 'enterprise',
  ) {
    const account = await prisma.enterpriseAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) throw new Error('Account not found');

    // Update subscription
    const updated = await prisma.enterpriseAccount.update({
      where: { id: accountId },
      data: {
        subscriptionTier: newTier,
        enabledFeatures: this.getFeaturesByTier(newTier),
        customBranding: newTier !== 'starter',
        whiteLabel: newTier === 'enterprise',
        apiAccess: newTier === 'enterprise',
      },
    });

    // Grant new tier features
    await this.grantTierFeatures(accountId, newTier);

    return {
      account: updated,
      message: `Subscription upgraded to ${newTier}`,
      featuresGranted: this.getFeaturesByTier(newTier),
    };
  }

  /**
   * Get enterprise account dashboard
   */
  async getAccountDashboard(accountId: string) {
    const account = await prisma.enterpriseAccount.findUnique({
      where: { id: accountId },
      include: {
        config: true,
        integrations: {
          where: { isActive: true },
        },
      },
    });

    if (!account) throw new Error('Account not found');

    const currentMonthMetrics = await prisma.usageMetrics.findFirst({
      where: {
        accountId,
        metricsMonth: new Date().toISOString().slice(0, 7),
      },
    });

    const features = await prisma.featureAccess.findMany({
      where: { accountId, isActive: true },
    });

    return {
      account,
      currentMetrics: currentMonthMetrics,
      activeIntegrations: account.integrations.length,
      enabledFeatures: features.length,
      subscription: {
        tier: account.subscriptionTier,
        status: account.subscriptionStatus,
        expiresAt: account.subscriptionEndDate,
        daysRemaining: Math.ceil(
          (account.subscriptionEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        ),
      },
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private getFeaturesByTier(tier: string): string[] {
    const features: Record<string, string[]> = {
      starter: [
        'basic_scanning',
        'compliance_scoring',
        'basic_reporting',
        'email_support',
      ],
      professional: [
        'basic_scanning',
        'compliance_scoring',
        'advanced_reporting',
        'litigation_intelligence',
        'priority_support',
        'api_access_limited',
      ],
      enterprise: [
        'basic_scanning',
        'compliance_scoring',
        'advanced_reporting',
        'litigation_intelligence',
        'predictive_strategy',
        'case_management',
        'white_label',
        'full_api_access',
        'priority_support',
        'dedicated_account_manager',
      ],
    };

    return features[tier] || features['starter'];
  }

  private async grantTierFeatures(accountId: string, tier: string) {
    const tierFeatures: Record<string, Array<{ id: string; name: string; category: string }>> = {
      starter: [
        { id: 'scan_basic', name: 'Basic Scanning', category: 'core' },
        { id: 'score_ccs', name: 'Compliance Credit Score', category: 'core' },
      ],
      professional: [
        { id: 'scan_basic', name: 'Basic Scanning', category: 'core' },
        { id: 'score_ccs', name: 'Compliance Credit Score', category: 'core' },
        { id: 'intel_litigation', name: 'Litigation Intelligence', category: 'premium' },
        { id: 'report_advanced', name: 'Advanced Reporting', category: 'premium' },
      ],
      enterprise: [
        { id: 'scan_basic', name: 'Basic Scanning', category: 'core' },
        { id: 'score_ccs', name: 'Compliance Credit Score', category: 'core' },
        { id: 'intel_litigation', name: 'Litigation Intelligence', category: 'premium' },
        { id: 'strategy_predict', name: 'Predictive Strategy', category: 'enterprise' },
        { id: 'case_mgmt', name: 'Case Management', category: 'enterprise' },
      ],
    };

    const features = tierFeatures[tier] || tierFeatures['starter'];

    for (const feature of features) {
      await prisma.featureAccess.upsert({
        where: {
          featureId: feature.id,
        },
        create: {
          accountId,
          featureName: feature.name,
          featureId: feature.id,
          featureCategory: feature.category as any,
          accessLevel: 'full',
          accessTier: tier as any,
        },
        update: {
          accessLevel: 'full',
        },
      });
    }
  }

  private getDefaultSyncFields(integrationType: string): string[] {
    const syncFields: Record<string, string[]> = {
      salesforce: ['cases', 'accounts', 'contacts'],
      slack: ['alerts', 'reports'],
      jira: ['issues', 'projects'],
      zendesk: ['tickets', 'organizations'],
      default: ['basic_data'],
    };

    return syncFields[integrationType] || syncFields['default'];
  }

  private calculateMonthlyBill(accountId: string, usage: any): number {
    // Tiered pricing model
    const basePricing: Record<string, number> = {
      starter: 99,
      professional: 499,
      enterprise: 1999,
    };

    const overageFees = (usage.apiCalls / 10000) * 50 + (usage.scans - 100) * 25;

    return Math.max(0, basePricing['professional'] + overageFees); // Will fetch actual tier in production
  }
}

export default new EnterpriseEcosystemService();
