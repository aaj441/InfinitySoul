/**
 * Pricing & Packaging Service
 * 
 * Implements Tier 1 Revenue Optimization Ideas #11-15:
 * 11. Tiered assessment pricing (Free, $49 detailed, $199 + consultation)
 * 12. Industry-specific landing pages
 * 13. P&C cross-sell bundling
 * 14. Quarterly review upsell automation
 * 15. White-label broker licensing
 */

import { v4 as uuidv4 } from 'uuid';
import type { IndustryVertical, InsuranceLine } from '../insuranceComplianceHub/types';

// ============================================================================
// ASSESSMENT PRICING TIERS
// ============================================================================

export type AssessmentTier = 'free' | 'premium' | 'enterprise';

export interface AssessmentPricingTier {
  tier: AssessmentTier;
  name: string;
  price: number; // USD
  description: string;
  features: string[];
  deliverables: string[];
  turnaroundTime: string;
  bestFor: string[];
  cta: string;
  popular?: boolean;
}

export interface AssessmentPurchase {
  id: string;
  leadId: string;
  tier: AssessmentTier;
  price: number;
  purchasedAt: Date;
  deliveredAt?: Date;
  consultationScheduled?: Date;
  status: 'pending' | 'delivered' | 'consultation_scheduled';
  paymentMethod: 'card' | 'invoice' | 'complimentary';
}

// ============================================================================
// INDUSTRY-SPECIFIC LANDING PAGES
// ============================================================================

export interface IndustryLandingPage {
  industry: IndustryVertical;
  slug: string;
  headline: string;
  subheadline: string;
  heroImage?: string;
  keyPainPoints: string[];
  industrySpecificRisks: string[];
  complianceRequirements: string[];
  recommendedCoverage: InsuranceLine[];
  socialProof: IndustrySocialProof;
  cta: CallToAction;
  seoMetadata: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export interface IndustrySocialProof {
  testimonial?: {
    quote: string;
    author: string;
    company: string;
    industry: IndustryVertical;
  };
  stats: {
    businessesProtected: number;
    averageSavings: number;
    averageRiskReduction: number;
  };
  logos?: string[];
}

export interface CallToAction {
  primary: {
    text: string;
    action: 'start_assessment' | 'book_consultation' | 'get_quote';
  };
  secondary?: {
    text: string;
    action: 'download_guide' | 'view_pricing' | 'watch_demo';
  };
}

// ============================================================================
// BUNDLING & CROSS-SELL
// ============================================================================

export interface InsuranceBundle {
  id: string;
  name: string;
  description: string;
  lines: InsuranceLine[];
  discount: number; // percentage off total
  totalPremium: number;
  discountedPremium: number;
  commission: number;
  bestFor: IndustryVertical[];
  savings: number;
}

export interface CrossSellOpportunity {
  leadId: string;
  currentLines: InsuranceLine[];
  recommendedLines: InsuranceLine[];
  reasoning: string;
  potentialRevenue: number;
  priority: 'low' | 'medium' | 'high';
  timing: 'immediate' | 'at_renewal' | 'quarterly_review';
}

// ============================================================================
// QUARTERLY REVIEW UPSELL
// ============================================================================

export interface QuarterlyReviewPackage {
  id: string;
  name: string;
  price: number; // per quarter
  annualPrice: number;
  features: string[];
  deliverables: string[];
  includedReviews: number;
  includedConsultations: number;
  complianceAudits: boolean;
  riskReassessment: boolean;
  policyOptimization: boolean;
}

export interface ReviewSchedule {
  leadId: string;
  packageId: string;
  nextReviewDate: Date;
  reviewHistory: ReviewSession[];
  status: 'active' | 'paused' | 'cancelled';
  autoRenew: boolean;
}

export interface ReviewSession {
  id: string;
  scheduledDate: Date;
  completedDate?: Date;
  findings: string[];
  recommendations: string[];
  actionItems: string[];
  followUpDate?: Date;
}

// ============================================================================
// WHITE-LABEL BROKER LICENSING
// ============================================================================

export interface BrokerLicense {
  id: string;
  brokerName: string;
  brokerEmail: string;
  brokerCompany: string;
  licenseType: 'basic' | 'professional' | 'enterprise';
  monthlyFee: number;
  commissionSplit: number; // percentage broker keeps
  activeDate: Date;
  expirationDate?: Date;
  status: 'active' | 'suspended' | 'expired';
  features: BrokerFeatures;
  usage: BrokerUsage;
}

export interface BrokerFeatures {
  customBranding: boolean;
  customDomain: boolean;
  apiAccess: boolean;
  assessmentsPerMonth: number;
  clientSeats: number;
  whiteLabelReports: boolean;
  dedicatedSupport: boolean;
}

export interface BrokerUsage {
  assessmentsThisMonth: number;
  quotesGenerated: number;
  policiesBound: number;
  totalRevenue: number;
  commissionEarned: number;
}

export interface BrokerClient {
  id: string;
  brokerId: string;
  leadId: string;
  addedDate: Date;
  status: 'prospect' | 'quoted' | 'bound' | 'churned';
}

// ============================================================================
// PRICING & PACKAGING SERVICE
// ============================================================================

export class PricingPackaging {
  private assessmentPurchases: Map<string, AssessmentPurchase> = new Map();
  private bundles: Map<string, InsuranceBundle> = new Map();
  private reviewSchedules: Map<string, ReviewSchedule> = new Map();
  private brokerLicenses: Map<string, BrokerLicense> = new Map();

  constructor() {
    this.initializeBundles();
  }

  // ========================================================================
  // TIERED ASSESSMENT PRICING (#11)
  // ========================================================================

  /**
   * Get assessment pricing tiers
   */
  getAssessmentPricingTiers(): AssessmentPricingTier[] {
    return [
      {
        tier: 'free',
        name: 'Basic Assessment',
        price: 0,
        description: 'Perfect for getting started',
        features: [
          'Risk score (0-100)',
          'Basic compliance scan',
          'Top 3 vulnerabilities',
          'Estimated insurance premium',
          'Email results summary',
        ],
        deliverables: [
          'Email summary report',
          'Risk score breakdown',
        ],
        turnaroundTime: 'Instant',
        bestFor: [
          'Small businesses (1-10 employees)',
          'First-time assessment',
          'Budget-conscious',
        ],
        cta: 'Get Free Assessment',
      },
      {
        tier: 'premium',
        name: 'Detailed Assessment',
        price: 49,
        description: 'Comprehensive analysis for serious protection',
        features: [
          'Everything in Basic',
          'Full compliance audit report',
          'Detailed vulnerability analysis',
          'Industry-specific recommendations',
          'Coverage gap analysis',
          'Remediation roadmap',
          'PDF professional report',
          'Email support for 30 days',
        ],
        deliverables: [
          '15-page PDF report',
          'Actionable remediation plan',
          'Compliance checklist',
          'Coverage recommendations',
        ],
        turnaroundTime: '24 hours',
        bestFor: [
          'Businesses seeking insurance',
          'Compliance requirements',
          'Detailed documentation needed',
        ],
        cta: 'Get Detailed Report',
        popular: true,
      },
      {
        tier: 'enterprise',
        name: 'Enterprise Assessment + Consultation',
        price: 199,
        description: 'White-glove service with expert guidance',
        features: [
          'Everything in Premium',
          '45-minute expert consultation',
          'Custom remediation roadmap',
          'Policy comparison (3 carriers)',
          'Compliance certification prep',
          'Executive summary for board',
          'Priority email + phone support',
          '90-day follow-up',
        ],
        deliverables: [
          '25-page comprehensive report',
          'Recorded consultation call',
          'Policy comparison matrix',
          'Executive presentation',
          'Compliance roadmap',
        ],
        turnaroundTime: '48 hours + scheduled call',
        bestFor: [
          'Mid-market businesses (50+ employees)',
          'Regulated industries',
          'Board-level reporting',
        ],
        cta: 'Book Enterprise Assessment',
      },
    ];
  }

  /**
   * Purchase assessment tier
   */
  purchaseAssessment(
    leadId: string,
    tier: AssessmentTier,
    paymentMethod: 'card' | 'invoice' | 'complimentary'
  ): AssessmentPurchase {
    const tiers = this.getAssessmentPricingTiers();
    const tierConfig = tiers.find(t => t.tier === tier);
    
    if (!tierConfig) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    const purchase: AssessmentPurchase = {
      id: uuidv4(),
      leadId,
      tier,
      price: tierConfig.price,
      purchasedAt: new Date(),
      status: 'pending',
      paymentMethod,
    };

    this.assessmentPurchases.set(purchase.id, purchase);
    return purchase;
  }

  /**
   * Get conversion rate by tier
   */
  getAssessmentConversionRates(): Record<AssessmentTier, {
    views: number;
    purchases: number;
    conversionRate: number;
    revenue: number;
  }> {
    // This would be calculated from actual data
    // For now, returning estimated benchmarks
    return {
      free: {
        views: 1000,
        purchases: 1000, // Always "purchased" (it's free)
        conversionRate: 1.0,
        revenue: 0,
      },
      premium: {
        views: 1000,
        purchases: 180, // 18% of free tier users upgrade
        conversionRate: 0.18,
        revenue: 180 * 49,
      },
      enterprise: {
        views: 180,
        purchases: 27, // 15% of premium viewers
        conversionRate: 0.15,
        revenue: 27 * 199,
      },
    };
  }

  // ========================================================================
  // INDUSTRY-SPECIFIC LANDING PAGES (#12)
  // ========================================================================

  /**
   * Get landing page configuration for industry
   */
  getIndustryLandingPage(industry: IndustryVertical): IndustryLandingPage {
    const landingPages: Record<IndustryVertical, IndustryLandingPage> = {
      construction: {
        industry: 'construction',
        slug: 'construction-insurance',
        headline: 'Protect Your Construction Business From Cyber Threats',
        subheadline: 'Subcontractor data, payroll systems, and client information at risk? Get covered in 60 seconds.',
        keyPainPoints: [
          'Ransomware attacks on project management systems',
          'Stolen subcontractor SSNs and banking info',
          'Email fraud targeting wire transfers',
          'OSHA reporting system breaches',
        ],
        industrySpecificRisks: [
          'Business email compromise (BEC)',
          'Payroll data theft',
          'Project delay due to system downtime',
          'Client data exposure',
        ],
        complianceRequirements: [
          'CCPA (California contractors)',
          'State-specific data breach laws',
          'Subcontractor agreement requirements',
        ],
        recommendedCoverage: ['cyber', 'general_liability', 'errors_omissions'],
        socialProof: {
          testimonial: {
            quote: 'After a ransomware attack shut down our project management system for 3 days, cyber insurance saved us $45K.',
            author: 'Mike Rodriguez',
            company: 'Rodriguez Construction',
            industry: 'construction',
          },
          stats: {
            businessesProtected: 47,
            averageSavings: 12500,
            averageRiskReduction: 68,
          },
        },
        cta: {
          primary: {
            text: 'Get Free Construction Risk Assessment',
            action: 'start_assessment',
          },
          secondary: {
            text: 'Download: Cyber Security for Contractors',
            action: 'download_guide',
          },
        },
        seoMetadata: {
          title: 'Cyber Insurance for Construction Companies | InfinitySoul',
          description: 'Protect your construction business from ransomware, data breaches, and email fraud. Free risk assessment in 60 seconds.',
          keywords: ['construction cyber insurance', 'contractor data breach', 'construction ransomware', 'subcontractor data protection'],
        },
      },
      healthcare: {
        industry: 'healthcare',
        slug: 'healthcare-insurance',
        headline: 'HIPAA-Compliant Cyber Insurance for Healthcare Practices',
        subheadline: 'Patient records, billing systems, and telehealth platforms protected. OCR audit-ready coverage.',
        keyPainPoints: [
          'HIPAA breach notification costs ($50K-$500K)',
          'OCR fines for non-compliance',
          'Ransomware targeting EHR systems',
          'Patient data theft liability',
        ],
        industrySpecificRisks: [
          'Protected health information (PHI) exposure',
          'HIPAA violation penalties',
          'Business Associate Agreement failures',
          'Telehealth platform vulnerabilities',
        ],
        complianceRequirements: [
          'HIPAA Security Rule',
          'HIPAA Privacy Rule',
          'HITECH Act breach notification',
          'State-specific healthcare data laws',
        ],
        recommendedCoverage: ['cyber', 'errors_omissions', 'general_liability'],
        socialProof: {
          testimonial: {
            quote: 'When our EHR was breached, cyber insurance covered $180K in breach notification, forensics, and OCR defense.',
            author: 'Dr. Sarah Chen',
            company: 'Pacific Wellness Center',
            industry: 'healthcare',
          },
          stats: {
            businessesProtected: 89,
            averageSavings: 45000,
            averageRiskReduction: 82,
          },
        },
        cta: {
          primary: {
            text: 'Get HIPAA Compliance Assessment',
            action: 'start_assessment',
          },
          secondary: {
            text: 'View HIPAA Coverage Guide',
            action: 'download_guide',
          },
        },
        seoMetadata: {
          title: 'HIPAA Cyber Insurance for Healthcare | InfinitySoul',
          description: 'Protect patient data and avoid OCR fines. HIPAA-compliant cyber insurance with breach response coverage.',
          keywords: ['HIPAA cyber insurance', 'healthcare data breach', 'EHR ransomware', 'medical practice insurance'],
        },
      },
      technology: {
        industry: 'technology',
        slug: 'tech-startup-insurance',
        headline: 'Cyber Insurance for SaaS & Tech Startups',
        subheadline: 'Customer data, API security, and cloud infrastructure protected. Investor-approved coverage.',
        keyPainPoints: [
          'Customer data breach liability',
          'API security vulnerabilities',
          'Third-party vendor risks',
          'Investor due diligence requirements',
        ],
        industrySpecificRisks: [
          'Customer database compromise',
          'Supply chain attacks',
          'Open-source dependency vulnerabilities',
          'Cloud misconfiguration',
        ],
        complianceRequirements: [
          'SOC 2 compliance',
          'GDPR (if EU customers)',
          'CCPA (California customers)',
          'PCI-DSS (if payment processing)',
        ],
        recommendedCoverage: ['cyber', 'errors_omissions', 'general_liability'],
        socialProof: {
          testimonial: {
            quote: 'Our Series A investors required cyber insurance. We got covered in one day and it helped close the round.',
            author: 'Alex Thompson',
            company: 'DataFlow Analytics',
            industry: 'technology',
          },
          stats: {
            businessesProtected: 156,
            averageSavings: 8500,
            averageRiskReduction: 71,
          },
        },
        cta: {
          primary: {
            text: 'Get Startup Risk Assessment',
            action: 'start_assessment',
          },
          secondary: {
            text: 'Download: Cyber Security for SaaS',
            action: 'download_guide',
          },
        },
        seoMetadata: {
          title: 'Cyber Insurance for Tech Startups & SaaS | InfinitySoul',
          description: 'Investor-approved cyber insurance for startups. Protect customer data and meet due diligence requirements.',
          keywords: ['startup cyber insurance', 'SaaS security insurance', 'tech company insurance', 'Series A insurance'],
        },
      },
      // Add more industries as needed
      financial_services: this.getGenericLandingPage('financial_services'),
      retail: this.getGenericLandingPage('retail'),
      manufacturing: this.getGenericLandingPage('manufacturing'),
      professional_services: this.getGenericLandingPage('professional_services'),
      hospitality: this.getGenericLandingPage('hospitality'),
      transportation: this.getGenericLandingPage('transportation'),
      education: this.getGenericLandingPage('education'),
      real_estate: this.getGenericLandingPage('real_estate'),
      nonprofit: this.getGenericLandingPage('nonprofit'),
      other: this.getGenericLandingPage('other'),
    };

    return landingPages[industry];
  }

  /**
   * Generate generic landing page for industries without custom config
   */
  private getGenericLandingPage(industry: IndustryVertical): IndustryLandingPage {
    const industryNames: Record<IndustryVertical, string> = {
      construction: 'Construction',
      technology: 'Technology',
      healthcare: 'Healthcare',
      retail: 'Retail',
      manufacturing: 'Manufacturing',
      professional_services: 'Professional Services',
      hospitality: 'Hospitality',
      transportation: 'Transportation',
      education: 'Education',
      financial_services: 'Financial Services',
      real_estate: 'Real Estate',
      nonprofit: 'Nonprofit',
      other: 'Business',
    };

    const displayName = industryNames[industry];

    return {
      industry,
      slug: `${industry}-insurance`,
      headline: `Cyber Insurance for ${displayName} Companies`,
      subheadline: 'Protect your business from data breaches, ransomware, and cyber threats. Get covered in 60 seconds.',
      keyPainPoints: [
        'Data breach liability',
        'Ransomware attacks',
        'Business interruption from cyber incidents',
        'Regulatory compliance costs',
      ],
      industrySpecificRisks: [
        'Customer data exposure',
        'Financial fraud',
        'System downtime',
        'Reputation damage',
      ],
      complianceRequirements: [
        'State data breach notification laws',
        'Industry-specific regulations',
      ],
      recommendedCoverage: ['cyber', 'general_liability'],
      socialProof: {
        stats: {
          businessesProtected: 50,
          averageSavings: 10000,
          averageRiskReduction: 65,
        },
      },
      cta: {
        primary: {
          text: 'Get Free Risk Assessment',
          action: 'start_assessment',
        },
      },
      seoMetadata: {
        title: `Cyber Insurance for ${displayName} | InfinitySoul`,
        description: `Protect your ${displayName.toLowerCase()} business from cyber threats. Free risk assessment in 60 seconds.`,
        keywords: [`${industry} cyber insurance`, `${industry} data breach`, `${industry} ransomware protection`],
      },
    };
  }

  // ========================================================================
  // BUNDLING & CROSS-SELL (#13)
  // ========================================================================

  /**
   * Initialize standard insurance bundles
   */
  private initializeBundles(): void {
    const bundles: InsuranceBundle[] = [
      {
        id: 'small_business_essentials',
        name: 'Small Business Essentials',
        description: 'Core coverage for small businesses',
        lines: ['cyber', 'general_liability', 'property'],
        discount: 15,
        totalPremium: 3500,
        discountedPremium: 2975,
        commission: 446,
        bestFor: ['retail', 'professional_services', 'technology'],
        savings: 525,
      },
      {
        id: 'professional_practice',
        name: 'Professional Practice Bundle',
        description: 'Comprehensive coverage for service businesses',
        lines: ['cyber', 'errors_omissions', 'general_liability'],
        discount: 20,
        totalPremium: 5000,
        discountedPremium: 4000,
        commission: 600,
        bestFor: ['professional_services', 'healthcare', 'financial_services'],
        savings: 1000,
      },
      {
        id: 'growth_company',
        name: 'Growth Company Package',
        description: 'Full protection for scaling businesses',
        lines: ['cyber', 'errors_omissions', 'general_liability', 'umbrella', 'workers_comp'],
        discount: 25,
        totalPremium: 12000,
        discountedPremium: 9000,
        commission: 1350,
        bestFor: ['technology', 'manufacturing', 'construction'],
        savings: 3000,
      },
    ];

    bundles.forEach(bundle => this.bundles.set(bundle.id, bundle));
  }

  /**
   * Get all bundles
   */
  getBundles(): InsuranceBundle[] {
    return Array.from(this.bundles.values());
  }

  /**
   * Get recommended bundle for industry
   */
  getRecommendedBundle(industry: IndustryVertical): InsuranceBundle | null {
    const bundles = this.getBundles();
    return bundles.find(b => b.bestFor.includes(industry)) || bundles[0];
  }

  /**
   * Identify cross-sell opportunities
   */
  identifyCrossSellOpportunities(
    leadId: string,
    industry: IndustryVertical,
    currentLines: InsuranceLine[],
    employeeCount: number,
    annualRevenue: number
  ): CrossSellOpportunity[] {
    const opportunities: CrossSellOpportunity[] = [];

    // Cyber + E&O bundle
    if (currentLines.includes('cyber') && !currentLines.includes('errors_omissions')) {
      if (['professional_services', 'technology', 'healthcare'].includes(industry)) {
        opportunities.push({
          leadId,
          currentLines,
          recommendedLines: ['errors_omissions'],
          reasoning: 'Cyber insurance pairs well with E&O for complete professional liability protection',
          potentialRevenue: 2000,
          priority: 'high',
          timing: 'immediate',
        });
      }
    }

    // Workers comp for growing teams
    if (!currentLines.includes('workers_comp') && employeeCount >= 5) {
      opportunities.push({
        leadId,
        currentLines,
        recommendedLines: ['workers_comp'],
        reasoning: `With ${employeeCount} employees, workers compensation is essential and often legally required`,
        potentialRevenue: employeeCount * 500,
        priority: 'high',
        timing: 'immediate',
      });
    }

    // Umbrella for high revenue businesses
    if (!currentLines.includes('umbrella') && annualRevenue >= 2000000) {
      opportunities.push({
        leadId,
        currentLines,
        recommendedLines: ['umbrella'],
        reasoning: 'Businesses over $2M revenue should have umbrella coverage for catastrophic loss protection',
        potentialRevenue: 1500,
        priority: 'medium',
        timing: 'quarterly_review',
      });
    }

    // Property coverage
    if (!currentLines.includes('property') && 
        ['retail', 'manufacturing', 'hospitality'].includes(industry)) {
      opportunities.push({
        leadId,
        currentLines,
        recommendedLines: ['property'],
        reasoning: 'Physical assets and inventory need protection from damage and theft',
        potentialRevenue: 2500,
        priority: 'medium',
        timing: 'at_renewal',
      });
    }

    return opportunities.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // ========================================================================
  // QUARTERLY REVIEW UPSELL (#14)
  // ========================================================================

  /**
   * Get quarterly review packages
   */
  getQuarterlyReviewPackages(): QuarterlyReviewPackage[] {
    return [
      {
        id: 'quarterly_basic',
        name: 'Quarterly Compliance Check',
        price: 299,
        annualPrice: 1196,
        features: [
          '4 compliance reviews per year',
          'Risk reassessment each quarter',
          'Email support',
          'Compliance checklist updates',
        ],
        deliverables: [
          'Quarterly compliance report',
          'Updated risk score',
          'Regulatory change alerts',
        ],
        includedReviews: 4,
        includedConsultations: 1,
        complianceAudits: true,
        riskReassessment: true,
        policyOptimization: false,
      },
      {
        id: 'quarterly_professional',
        name: 'Professional Review Service',
        price: 599,
        annualPrice: 2396,
        features: [
          'Everything in Basic',
          '4 expert consultation calls',
          'Policy optimization recommendations',
          'Coverage gap analysis',
          'Priority phone support',
        ],
        deliverables: [
          'Comprehensive quarterly report',
          'Policy comparison analysis',
          'Cost savings recommendations',
          'Risk trend analysis',
        ],
        includedReviews: 4,
        includedConsultations: 4,
        complianceAudits: true,
        riskReassessment: true,
        policyOptimization: true,
      },
      {
        id: 'quarterly_enterprise',
        name: 'Enterprise Advisory Service',
        price: 999,
        annualPrice: 3996,
        features: [
          'Everything in Professional',
          'Monthly check-ins',
          'Dedicated account manager',
          'Board presentation materials',
          'Custom compliance roadmap',
          '24/7 priority support',
        ],
        deliverables: [
          'Executive dashboard',
          'Board-ready reports',
          'Custom risk models',
          'Strategic planning sessions',
        ],
        includedReviews: 12,
        includedConsultations: 12,
        complianceAudits: true,
        riskReassessment: true,
        policyOptimization: true,
      },
    ];
  }

  /**
   * Schedule quarterly review
   */
  scheduleQuarterlyReview(
    leadId: string,
    packageId: string,
    autoRenew: boolean = true
  ): ReviewSchedule {
    const schedule: ReviewSchedule = {
      leadId,
      packageId,
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      reviewHistory: [],
      status: 'active',
      autoRenew,
    };

    this.reviewSchedules.set(leadId, schedule);
    return schedule;
  }

  /**
   * Get leads approaching renewal (for upsell campaign)
   */
  getLeadsForQuarterlyReviewUpsell(daysUntilRenewal: number = 90): string[] {
    // This would query actual renewal dates
    // Placeholder implementation
    return [];
  }

  // ========================================================================
  // WHITE-LABEL BROKER LICENSING (#15)
  // ========================================================================

  /**
   * Get broker licensing tiers
   */
  getBrokerLicensingTiers(): Omit<BrokerLicense, 'id' | 'brokerName' | 'brokerEmail' | 'brokerCompany' | 'activeDate' | 'status' | 'usage'>[] {
    return [
      {
        licenseType: 'basic',
        monthlyFee: 499,
        commissionSplit: 70, // Broker keeps 70%
        features: {
          customBranding: true,
          customDomain: false,
          apiAccess: false,
          assessmentsPerMonth: 50,
          clientSeats: 5,
          whiteLabelReports: true,
          dedicatedSupport: false,
        },
      },
      {
        licenseType: 'professional',
        monthlyFee: 999,
        commissionSplit: 75,
        features: {
          customBranding: true,
          customDomain: true,
          apiAccess: true,
          assessmentsPerMonth: 200,
          clientSeats: 20,
          whiteLabelReports: true,
          dedicatedSupport: true,
        },
      },
      {
        licenseType: 'enterprise',
        monthlyFee: 2499,
        commissionSplit: 80,
        features: {
          customBranding: true,
          customDomain: true,
          apiAccess: true,
          assessmentsPerMonth: -1, // Unlimited
          clientSeats: -1, // Unlimited
          whiteLabelReports: true,
          dedicatedSupport: true,
        },
      },
    ];
  }

  /**
   * Create broker license
   */
  createBrokerLicense(
    brokerName: string,
    brokerEmail: string,
    brokerCompany: string,
    licenseType: 'basic' | 'professional' | 'enterprise'
  ): BrokerLicense {
    const tiers = this.getBrokerLicensingTiers();
    const tierConfig = tiers.find(t => t.licenseType === licenseType);
    
    if (!tierConfig) {
      throw new Error(`Invalid license type: ${licenseType}`);
    }

    const license: BrokerLicense = {
      id: uuidv4(),
      brokerName,
      brokerEmail,
      brokerCompany,
      licenseType,
      monthlyFee: tierConfig.monthlyFee,
      commissionSplit: tierConfig.commissionSplit,
      activeDate: new Date(),
      status: 'active',
      features: tierConfig.features,
      usage: {
        assessmentsThisMonth: 0,
        quotesGenerated: 0,
        policiesBound: 0,
        totalRevenue: 0,
        commissionEarned: 0,
      },
    };

    this.brokerLicenses.set(license.id, license);
    return license;
  }

  /**
   * Get broker license
   */
  getBrokerLicense(licenseId: string): BrokerLicense | undefined {
    return this.brokerLicenses.get(licenseId);
  }

  /**
   * Calculate broker ROI
   */
  calculateBrokerROI(licenseId: string): {
    monthlyFee: number;
    commissionEarned: number;
    netProfit: number;
    roi: number;
  } {
    const license = this.brokerLicenses.get(licenseId);
    
    if (!license) {
      throw new Error('License not found');
    }

    const netProfit = license.usage.commissionEarned - license.monthlyFee;
    const roi = license.monthlyFee > 0 
      ? (netProfit / license.monthlyFee) * 100 
      : 0;

    return {
      monthlyFee: license.monthlyFee,
      commissionEarned: license.usage.commissionEarned,
      netProfit,
      roi,
    };
  }
}

/**
 * Singleton instance
 */
export const pricingPackaging = new PricingPackaging();
