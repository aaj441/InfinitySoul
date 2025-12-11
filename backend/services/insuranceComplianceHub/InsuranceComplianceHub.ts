/**
 * Insurance Compliance Hub - Main Service
 *
 * Central orchestration for the "Peace of Mind" insurance platform.
 * Coordinates Lucy AI, risk assessment, compliance audits, and lead funnel.
 *
 * Value Proposition:
 * "We audit your compliance risk with AI, then recommend the insurance that actually
 * protects you. Most people are overinsured in the wrong areas and underinsured where it matters."
 */

import { v4 as uuidv4 } from 'uuid';
import {
  InsuranceLead,
  InsuranceLine,
  InsuranceLineConfig,
  IndustryVertical,
  IndustryRiskProfile,
  LeadSource,
  StartAssessmentRequest,
  StartAssessmentResponse,
  SubmitAssessmentRequest,
  SubmitAssessmentResponse,
  GetAssessmentResultsResponse,
  RequestQuoteRequest,
  RequestQuoteResponse,
  CommissionSummary,
  LeadMagnet,
} from './types';
import { LucyAdvisor } from './LucyAdvisor';
import { MultiLineRiskAssessment } from './MultiLineRiskAssessment';
import { ComplianceAuditDisplay } from './ComplianceAuditDisplay';
import { LeadFunnel } from './LeadFunnel';

/**
 * Insurance line configurations with commission structures
 */
export const INSURANCE_LINE_CONFIGS: Record<InsuranceLine, InsuranceLineConfig> = {
  life: {
    line: 'life',
    displayName: 'Life Insurance',
    description: 'Protect your family and business partners with comprehensive life coverage.',
    commissionRange: { min: 0.05, max: 0.15 },
    typicalPremiumRange: { min: 500, max: 5000 },
    keyRiskFactors: ['age', 'health', 'occupation', 'lifestyle', 'coverage_amount'],
    complianceRequirements: ['NAIC Model Regulation', 'State Insurance Laws'],
    leadMagnets: [
      {
        id: 'life-planning-checklist',
        title: '5-Year Financial Planning Checklist',
        description: 'Comprehensive guide to protecting your family\'s financial future.',
        type: 'checklist',
      },
    ],
  },
  health: {
    line: 'health',
    displayName: 'Health Insurance',
    description: 'Group and individual health plans for businesses of all sizes.',
    commissionRange: { min: 0.05, max: 0.10 },
    typicalPremiumRange: { min: 3000, max: 25000 },
    keyRiskFactors: ['employee_count', 'demographics', 'claims_history', 'industry'],
    complianceRequirements: ['ACA', 'HIPAA', 'ERISA', 'State Mandates'],
    leadMagnets: [
      {
        id: 'group-health-guide',
        title: 'Small Business Health Insurance Guide',
        description: 'Everything you need to know about offering health benefits.',
        type: 'guide',
      },
    ],
  },
  disability: {
    line: 'disability',
    displayName: 'Disability Insurance',
    description: 'Income protection when you can\'t work.',
    commissionRange: { min: 0.10, max: 0.15 },
    typicalPremiumRange: { min: 1000, max: 5000 },
    keyRiskFactors: ['occupation', 'income', 'age', 'health_history'],
    complianceRequirements: ['State Insurance Laws', 'ADA Compliance'],
    leadMagnets: [
      {
        id: 'income-protection-calculator',
        title: 'Income Protection Calculator',
        description: 'See how much coverage you actually need.',
        type: 'calculator',
      },
    ],
  },
  property: {
    line: 'property',
    displayName: 'Property Insurance',
    description: 'Protect your buildings, equipment, and inventory.',
    commissionRange: { min: 0.15, max: 0.20 },
    typicalPremiumRange: { min: 1000, max: 15000 },
    keyRiskFactors: ['location', 'construction', 'occupancy', 'protection_class', 'value'],
    complianceRequirements: ['ISO Standards', 'State Insurance Laws'],
    leadMagnets: [
      {
        id: 'property-inspection-checklist',
        title: 'Property Inspection Checklist',
        description: 'Identify risks before your insurer does.',
        type: 'checklist',
      },
    ],
  },
  casualty: {
    line: 'casualty',
    displayName: 'Casualty Insurance',
    description: 'Liability coverage for accidents and injuries.',
    commissionRange: { min: 0.15, max: 0.20 },
    typicalPremiumRange: { min: 1000, max: 10000 },
    keyRiskFactors: ['industry', 'revenue', 'claims_history', 'operations'],
    complianceRequirements: ['State Insurance Laws', 'ISO Forms'],
    leadMagnets: [
      {
        id: 'liability-risk-assessment',
        title: 'Liability Risk Self-Assessment',
        description: 'Understand your exposure in 10 minutes.',
        type: 'assessment',
      },
    ],
  },
  cyber: {
    line: 'cyber',
    displayName: 'Cyber Insurance',
    description: 'Protection against data breaches, ransomware, and digital threats.',
    commissionRange: { min: 0.20, max: 0.25 },
    typicalPremiumRange: { min: 1500, max: 15000 },
    keyRiskFactors: ['data_volume', 'security_posture', 'industry', 'revenue', 'compliance_status'],
    complianceRequirements: ['WCAG', 'PCI-DSS', 'GDPR', 'CCPA', 'SOC2'],
    leadMagnets: [
      {
        id: 'free-wcag-audit',
        title: 'Free WCAG Compliance Audit',
        description: 'AI-powered accessibility and security assessment.',
        type: 'audit',
        interactiveComponent: 'WCAGAuditTool',
      },
      {
        id: 'cyber-risk-scorecard',
        title: 'Cyber Risk Scorecard',
        description: 'See your digital risk score in 5 minutes.',
        type: 'assessment',
        interactiveComponent: 'CyberRiskAssessment',
      },
    ],
  },
  workers_comp: {
    line: 'workers_comp',
    displayName: 'Workers Compensation',
    description: 'Protect your employees and meet state requirements.',
    commissionRange: { min: 0.15, max: 0.18 },
    typicalPremiumRange: { min: 2000, max: 25000 },
    keyRiskFactors: ['payroll', 'class_codes', 'experience_mod', 'safety_program'],
    complianceRequirements: ['State Workers Comp Laws', 'OSHA'],
    leadMagnets: [
      {
        id: 'payroll-compliance-calculator',
        title: 'Payroll Compliance Calculator',
        description: 'Estimate your workers comp costs accurately.',
        type: 'calculator',
        interactiveComponent: 'PayrollCalculator',
      },
      {
        id: 'contractor-employee-guide',
        title: 'Contractor vs. Employee Classification Guide',
        description: 'Avoid costly misclassification penalties.',
        type: 'guide',
      },
    ],
  },
  umbrella: {
    line: 'umbrella',
    displayName: 'Umbrella Insurance',
    description: 'Extra liability protection that kicks in when primary policies max out.',
    commissionRange: { min: 0.15, max: 0.20 },
    typicalPremiumRange: { min: 500, max: 5000 },
    keyRiskFactors: ['underlying_coverage', 'assets', 'exposure_points', 'industry'],
    complianceRequirements: ['State Insurance Laws'],
    leadMagnets: [
      {
        id: 'umbrella-need-assessment',
        title: 'Do You Actually Need Umbrella Insurance?',
        description: 'Quick assessment to determine if umbrella coverage is right for you.',
        type: 'assessment',
      },
    ],
  },
  errors_omissions: {
    line: 'errors_omissions',
    displayName: 'Errors & Omissions (E&O)',
    description: 'Professional liability for service providers.',
    commissionRange: { min: 0.15, max: 0.20 },
    typicalPremiumRange: { min: 1000, max: 10000 },
    keyRiskFactors: ['profession', 'revenue', 'client_contracts', 'claims_history'],
    complianceRequirements: ['Professional Licensing Requirements', 'State Insurance Laws'],
    leadMagnets: [
      {
        id: 'service-business-risk-assessment',
        title: 'Risk Assessment for Service Businesses',
        description: 'Identify your professional liability exposure.',
        type: 'assessment',
      },
    ],
  },
  bonds: {
    line: 'bonds',
    displayName: 'Surety Bonds',
    description: 'License bonds, contract bonds, and court bonds.',
    commissionRange: { min: 0.10, max: 0.15 },
    typicalPremiumRange: { min: 500, max: 10000 },
    keyRiskFactors: ['bond_type', 'financial_strength', 'industry', 'project_size'],
    complianceRequirements: ['State Licensing Requirements', 'Miller Act (Federal)'],
    leadMagnets: [
      {
        id: 'bond-requirements-guide',
        title: 'Construction Bond Requirements Guide',
        description: 'Everything contractors need to know about bonding.',
        type: 'guide',
      },
    ],
  },
  general_liability: {
    line: 'general_liability',
    displayName: 'General Liability',
    description: 'Core business protection against third-party claims.',
    commissionRange: { min: 0.15, max: 0.18 },
    typicalPremiumRange: { min: 500, max: 5000 },
    keyRiskFactors: ['industry', 'revenue', 'operations', 'location', 'claims_history'],
    complianceRequirements: ['State Insurance Laws', 'Contract Requirements'],
    leadMagnets: [
      {
        id: 'gl-coverage-checklist',
        title: 'General Liability Coverage Checklist',
        description: 'Make sure your GL policy actually covers what you need.',
        type: 'checklist',
      },
    ],
  },
};

/**
 * Industry risk profiles for targeted recommendations
 */
export const INDUSTRY_RISK_PROFILES: Record<IndustryVertical, IndustryRiskProfile> = {
  construction: {
    industry: 'construction',
    displayName: 'Construction',
    primaryRisks: ['Worker injuries', 'Property damage', 'Contract disputes', 'Equipment theft'],
    recommendedCoverage: ['workers_comp', 'general_liability', 'cyber', 'umbrella', 'bonds'],
    averagePremiums: {
      life: 2000,
      health: 15000,
      disability: 2000,
      property: 5000,
      casualty: 3000,
      cyber: 3000,
      workers_comp: 8000,
      umbrella: 1500,
      errors_omissions: 2000,
      bonds: 3000,
      general_liability: 3000,
    },
    complianceRequirements: ['OSHA', 'State Licensing', 'ADA/WCAG', 'EPA'],
    litigationFrequency: 'high',
    cyberRiskLevel: 'medium',
  },
  technology: {
    industry: 'technology',
    displayName: 'Technology',
    primaryRisks: ['Data breaches', 'IP disputes', 'Service interruptions', 'Professional liability'],
    recommendedCoverage: ['cyber', 'errors_omissions', 'general_liability', 'umbrella'],
    averagePremiums: {
      life: 1500,
      health: 12000,
      disability: 2500,
      property: 2000,
      casualty: 2000,
      cyber: 8000,
      workers_comp: 3000,
      umbrella: 2000,
      errors_omissions: 5000,
      bonds: 1000,
      general_liability: 2000,
    },
    complianceRequirements: ['SOC2', 'GDPR', 'CCPA', 'WCAG', 'PCI-DSS'],
    litigationFrequency: 'high',
    cyberRiskLevel: 'critical',
  },
  healthcare: {
    industry: 'healthcare',
    displayName: 'Healthcare',
    primaryRisks: ['Malpractice', 'Data breaches', 'Regulatory violations', 'Worker injuries'],
    recommendedCoverage: ['errors_omissions', 'cyber', 'workers_comp', 'general_liability', 'umbrella'],
    averagePremiums: {
      life: 2000,
      health: 20000,
      disability: 3000,
      property: 4000,
      casualty: 5000,
      cyber: 10000,
      workers_comp: 6000,
      umbrella: 3000,
      errors_omissions: 15000,
      bonds: 1500,
      general_liability: 4000,
    },
    complianceRequirements: ['HIPAA', 'WCAG', 'State Medical Board', 'OSHA'],
    litigationFrequency: 'very_high',
    cyberRiskLevel: 'critical',
  },
  retail: {
    industry: 'retail',
    displayName: 'Retail',
    primaryRisks: ['Slip and fall', 'Product liability', 'Theft', 'Cyber attacks'],
    recommendedCoverage: ['general_liability', 'property', 'cyber', 'workers_comp'],
    averagePremiums: {
      life: 1000,
      health: 8000,
      disability: 1500,
      property: 4000,
      casualty: 2500,
      cyber: 4000,
      workers_comp: 4000,
      umbrella: 1000,
      errors_omissions: 1500,
      bonds: 500,
      general_liability: 2500,
    },
    complianceRequirements: ['PCI-DSS', 'WCAG', 'ADA', 'OSHA'],
    litigationFrequency: 'medium',
    cyberRiskLevel: 'high',
  },
  manufacturing: {
    industry: 'manufacturing',
    displayName: 'Manufacturing',
    primaryRisks: ['Worker injuries', 'Product liability', 'Equipment breakdown', 'Supply chain'],
    recommendedCoverage: ['workers_comp', 'general_liability', 'property', 'umbrella'],
    averagePremiums: {
      life: 1500,
      health: 12000,
      disability: 2000,
      property: 8000,
      casualty: 4000,
      cyber: 5000,
      workers_comp: 12000,
      umbrella: 2500,
      errors_omissions: 2000,
      bonds: 2000,
      general_liability: 4000,
    },
    complianceRequirements: ['OSHA', 'EPA', 'CPSC', 'WCAG'],
    litigationFrequency: 'medium',
    cyberRiskLevel: 'medium',
  },
  professional_services: {
    industry: 'professional_services',
    displayName: 'Professional Services',
    primaryRisks: ['Professional negligence', 'Client disputes', 'Data breaches', 'Contract issues'],
    recommendedCoverage: ['errors_omissions', 'cyber', 'general_liability', 'umbrella'],
    averagePremiums: {
      life: 2000,
      health: 10000,
      disability: 3000,
      property: 2000,
      casualty: 1500,
      cyber: 5000,
      workers_comp: 2000,
      umbrella: 1500,
      errors_omissions: 4000,
      bonds: 1000,
      general_liability: 1500,
    },
    complianceRequirements: ['Professional Licensing', 'WCAG', 'Industry-specific regulations'],
    litigationFrequency: 'high',
    cyberRiskLevel: 'high',
  },
  hospitality: {
    industry: 'hospitality',
    displayName: 'Hospitality',
    primaryRisks: ['Guest injuries', 'Food-borne illness', 'Property damage', 'Liquor liability'],
    recommendedCoverage: ['general_liability', 'property', 'workers_comp', 'umbrella'],
    averagePremiums: {
      life: 1000,
      health: 8000,
      disability: 1500,
      property: 6000,
      casualty: 3000,
      cyber: 3000,
      workers_comp: 5000,
      umbrella: 2000,
      errors_omissions: 1500,
      bonds: 500,
      general_liability: 4000,
    },
    complianceRequirements: ['Health Department', 'Liquor License', 'ADA/WCAG', 'OSHA'],
    litigationFrequency: 'high',
    cyberRiskLevel: 'medium',
  },
  transportation: {
    industry: 'transportation',
    displayName: 'Transportation',
    primaryRisks: ['Vehicle accidents', 'Cargo damage', 'Worker injuries', 'Regulatory violations'],
    recommendedCoverage: ['general_liability', 'workers_comp', 'property', 'umbrella'],
    averagePremiums: {
      life: 2000,
      health: 10000,
      disability: 2500,
      property: 5000,
      casualty: 8000,
      cyber: 3000,
      workers_comp: 10000,
      umbrella: 3000,
      errors_omissions: 2000,
      bonds: 3000,
      general_liability: 6000,
    },
    complianceRequirements: ['DOT', 'FMCSA', 'State DMV', 'WCAG'],
    litigationFrequency: 'high',
    cyberRiskLevel: 'low',
  },
  education: {
    industry: 'education',
    displayName: 'Education',
    primaryRisks: ['Student injuries', 'Professional liability', 'Data breaches', 'Discrimination'],
    recommendedCoverage: ['general_liability', 'errors_omissions', 'cyber', 'workers_comp'],
    averagePremiums: {
      life: 1000,
      health: 15000,
      disability: 2000,
      property: 3000,
      casualty: 2000,
      cyber: 6000,
      workers_comp: 3000,
      umbrella: 1500,
      errors_omissions: 3000,
      bonds: 500,
      general_liability: 2000,
    },
    complianceRequirements: ['FERPA', 'Title IX', 'ADA/WCAG', 'State Education Laws'],
    litigationFrequency: 'medium',
    cyberRiskLevel: 'high',
  },
  financial_services: {
    industry: 'financial_services',
    displayName: 'Financial Services',
    primaryRisks: ['Professional liability', 'Regulatory violations', 'Cyber attacks', 'Fraud'],
    recommendedCoverage: ['errors_omissions', 'cyber', 'bonds', 'umbrella'],
    averagePremiums: {
      life: 3000,
      health: 15000,
      disability: 4000,
      property: 3000,
      casualty: 3000,
      cyber: 12000,
      workers_comp: 2000,
      umbrella: 4000,
      errors_omissions: 10000,
      bonds: 5000,
      general_liability: 2500,
    },
    complianceRequirements: ['SEC', 'FINRA', 'SOX', 'PCI-DSS', 'WCAG', 'State Regulations'],
    litigationFrequency: 'very_high',
    cyberRiskLevel: 'critical',
  },
  real_estate: {
    industry: 'real_estate',
    displayName: 'Real Estate',
    primaryRisks: ['Property damage', 'Professional liability', 'Premises liability', 'Contract disputes'],
    recommendedCoverage: ['property', 'errors_omissions', 'general_liability', 'umbrella'],
    averagePremiums: {
      life: 2000,
      health: 8000,
      disability: 2500,
      property: 8000,
      casualty: 3000,
      cyber: 3000,
      workers_comp: 2000,
      umbrella: 2000,
      errors_omissions: 4000,
      bonds: 1500,
      general_liability: 2500,
    },
    complianceRequirements: ['State Real Estate Commission', 'Fair Housing', 'ADA/WCAG'],
    litigationFrequency: 'high',
    cyberRiskLevel: 'medium',
  },
  nonprofit: {
    industry: 'nonprofit',
    displayName: 'Nonprofit',
    primaryRisks: ['D&O liability', 'Volunteer injuries', 'Donor disputes', 'Employment practices'],
    recommendedCoverage: ['general_liability', 'errors_omissions', 'workers_comp', 'cyber'],
    averagePremiums: {
      life: 1000,
      health: 6000,
      disability: 1500,
      property: 2000,
      casualty: 1500,
      cyber: 3000,
      workers_comp: 2000,
      umbrella: 1000,
      errors_omissions: 3000,
      bonds: 500,
      general_liability: 1500,
    },
    complianceRequirements: ['IRS 501(c)(3)', 'State Nonprofit Laws', 'ADA/WCAG'],
    litigationFrequency: 'low',
    cyberRiskLevel: 'medium',
  },
  other: {
    industry: 'other',
    displayName: 'Other',
    primaryRisks: ['General liability', 'Property damage', 'Professional liability', 'Cyber threats'],
    recommendedCoverage: ['general_liability', 'property', 'cyber', 'workers_comp'],
    averagePremiums: {
      life: 1500,
      health: 10000,
      disability: 2000,
      property: 3000,
      casualty: 2000,
      cyber: 4000,
      workers_comp: 4000,
      umbrella: 1500,
      errors_omissions: 2500,
      bonds: 1000,
      general_liability: 2000,
    },
    complianceRequirements: ['State Insurance Laws', 'ADA/WCAG', 'Industry-specific'],
    litigationFrequency: 'medium',
    cyberRiskLevel: 'medium',
  },
};

/**
 * Main Insurance Compliance Hub service
 */
export class InsuranceComplianceHub {
  private lucy: LucyAdvisor;
  private riskAssessment: MultiLineRiskAssessment;
  private complianceDisplay: ComplianceAuditDisplay;
  private leadFunnel: LeadFunnel;

  // In-memory storage (would be database in production)
  private leads: Map<string, InsuranceLead> = new Map();
  private assessments: Map<string, unknown> = new Map();

  constructor() {
    this.lucy = new LucyAdvisor();
    this.riskAssessment = new MultiLineRiskAssessment();
    this.complianceDisplay = new ComplianceAuditDisplay();
    this.leadFunnel = new LeadFunnel();
  }

  /**
   * Get configuration for an insurance line
   */
  getLineConfig(line: InsuranceLine): InsuranceLineConfig {
    return INSURANCE_LINE_CONFIGS[line];
  }

  /**
   * Get all insurance line configurations
   */
  getAllLineConfigs(): InsuranceLineConfig[] {
    return Object.values(INSURANCE_LINE_CONFIGS);
  }

  /**
   * Get industry risk profile
   */
  getIndustryProfile(industry: IndustryVertical): IndustryRiskProfile {
    return INDUSTRY_RISK_PROFILES[industry];
  }

  /**
   * Get recommended coverage for an industry
   */
  getRecommendedCoverage(industry: IndustryVertical): InsuranceLineConfig[] {
    const profile = INDUSTRY_RISK_PROFILES[industry];
    return profile.recommendedCoverage.map(line => INSURANCE_LINE_CONFIGS[line]);
  }

  /**
   * Get lead magnets for a specific insurance line
   */
  getLeadMagnets(line?: InsuranceLine): LeadMagnet[] {
    if (line) {
      return INSURANCE_LINE_CONFIGS[line].leadMagnets;
    }
    // Return all lead magnets
    return Object.values(INSURANCE_LINE_CONFIGS).flatMap(config => config.leadMagnets);
  }

  /**
   * Start a new risk assessment (entry point for website visitors)
   */
  async startAssessment(request: StartAssessmentRequest): Promise<StartAssessmentResponse> {
    const assessmentId = uuidv4();

    // Create or update lead
    const leadId = uuidv4();
    const lead: InsuranceLead = {
      id: leadId,
      email: request.email,
      companyName: request.companyName,
      industry: request.industry || 'other',
      source: 'risk_assessment' as LeadSource,
      status: 'assessment_started',
      interestedLines: [],
      nurtureTouchpoints: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.leads.set(leadId, lead);

    // Initialize assessment
    this.assessments.set(assessmentId, {
      id: assessmentId,
      leadId,
      status: 'started',
      createdAt: new Date(),
    });

    // Get Lucy's greeting
    const lucyGreeting = await this.lucy.getWelcomeGreeting(lead);

    return {
      assessmentId,
      nextStep: 'business_details',
      estimatedTime: '5 minutes',
      lucyGreeting,
    };
  }

  /**
   * Submit completed assessment data
   */
  async submitAssessment(request: SubmitAssessmentRequest): Promise<SubmitAssessmentResponse> {
    const assessment = this.assessments.get(request.assessmentId);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    // Update assessment with data
    this.assessments.set(request.assessmentId, {
      ...(assessment as object),
      data: request.data,
      status: 'processing',
      submittedAt: new Date(),
    });

    // Queue the analysis (in production, this would use BullMQ)
    this.processAssessmentAsync(request.assessmentId, request.data);

    return {
      assessmentId: request.assessmentId,
      status: 'processing',
      statusUrl: `/api/insurance-hub/assessment/${request.assessmentId}/status`,
      estimatedWait: 30, // seconds
    };
  }

  /**
   * Get assessment results
   */
  async getAssessmentResults(assessmentId: string): Promise<GetAssessmentResultsResponse> {
    const assessment = this.assessments.get(assessmentId) as {
      status: string;
      result?: unknown;
      error?: string;
      progress?: number;
    };
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    if (assessment.status === 'processing') {
      return {
        status: 'processing',
        progress: assessment.progress || 50,
      };
    }

    if (assessment.status === 'error') {
      return {
        status: 'error',
        error: assessment.error,
      };
    }

    return {
      status: 'complete',
      result: assessment.result as GetAssessmentResultsResponse['result'],
    };
  }

  /**
   * Request a quote for specific insurance lines
   */
  async requestQuote(request: RequestQuoteRequest): Promise<RequestQuoteResponse> {
    const lead = this.leads.get(request.leadId);
    if (!lead) {
      throw new Error('Lead not found');
    }

    // Update lead status
    lead.status = 'quote_requested';
    lead.interestedLines = request.lines;
    lead.updatedAt = new Date();
    this.leads.set(request.leadId, lead);

    // Calculate estimated response time based on complexity
    const complexity = request.lines.length > 3 ? 'high' : request.lines.length > 1 ? 'medium' : 'low';
    const responseTime = complexity === 'high' ? '48 hours' : complexity === 'medium' ? '24 hours' : '4 hours';

    return {
      quoteRequestId: uuidv4(),
      estimatedResponseTime: responseTime,
      nextSteps: [
        'Our team will review your risk assessment',
        'We\'ll shop multiple carriers for best rates',
        `Expect a personalized quote within ${responseTime}`,
        'A compliance specialist will call to discuss options',
      ],
    };
  }

  /**
   * Get commission summary (for admin dashboard)
   */
  async getCommissionSummary(): Promise<CommissionSummary> {
    // This would pull from database in production
    return {
      totalYTD: 0,
      totalMTD: 0,
      projectedAnnual: 0,
      byLine: {} as Record<InsuranceLine, number>,
      byCarrier: {},
      renewalsPending: 0,
      averagePerCustomer: 0,
      customerCount: 0,
    };
  }

  /**
   * Calculate potential commission stack for a customer
   */
  calculateCommissionStack(
    industry: IndustryVertical,
    employeeCount: number,
    annualRevenue: number
  ): { line: InsuranceLine; premium: number; commission: number }[] {
    const profile = INDUSTRY_RISK_PROFILES[industry];
    const results: { line: InsuranceLine; premium: number; commission: number }[] = [];

    // Size multiplier based on company size
    const sizeMultiplier = Math.max(1, Math.log10(employeeCount + 10) * Math.log10(annualRevenue / 100000 + 10) / 4);

    for (const line of profile.recommendedCoverage) {
      const config = INSURANCE_LINE_CONFIGS[line];
      const basePremium = profile.averagePremiums[line];
      const adjustedPremium = Math.round(basePremium * sizeMultiplier);
      const avgCommissionRate = (config.commissionRange.min + config.commissionRange.max) / 2;
      const commission = Math.round(adjustedPremium * avgCommissionRate);

      results.push({
        line,
        premium: adjustedPremium,
        commission,
      });
    }

    return results;
  }

  /**
   * Get Lucy AI advisor instance
   */
  getLucy(): LucyAdvisor {
    return this.lucy;
  }

  /**
   * Get risk assessment engine instance
   */
  getRiskAssessment(): MultiLineRiskAssessment {
    return this.riskAssessment;
  }

  /**
   * Get compliance display generator
   */
  getComplianceDisplay(): ComplianceAuditDisplay {
    return this.complianceDisplay;
  }

  /**
   * Get lead funnel manager
   */
  getLeadFunnel(): LeadFunnel {
    return this.leadFunnel;
  }

  /**
   * Internal: Process assessment asynchronously
   */
  private async processAssessmentAsync(assessmentId: string, data: unknown): Promise<void> {
    try {
      const assessment = this.assessments.get(assessmentId) as { leadId?: string };
      if (!assessment) return;

      // Update progress
      this.assessments.set(assessmentId, { ...assessment, progress: 25 });

      // Run risk assessment
      const riskResult = await this.riskAssessment.analyze(data);
      this.assessments.set(assessmentId, { ...assessment, progress: 50 });

      // Run compliance audit if URL provided
      let complianceResult = null;
      const assessmentData = data as { websiteUrl?: string };
      if (assessmentData?.websiteUrl) {
        complianceResult = await this.complianceDisplay.runAudit(assessmentData.websiteUrl);
      }
      this.assessments.set(assessmentId, { ...assessment, progress: 75 });

      // Generate Lucy's narrative
      const narrative = await this.lucy.generateAssessmentNarrative(riskResult, complianceResult);
      this.assessments.set(assessmentId, { ...assessment, progress: 90 });

      // Combine results
      const result = {
        ...riskResult,
        complianceAuditSummary: complianceResult,
        lucyNarrative: narrative,
      };

      // Update lead
      if (assessment.leadId) {
        const lead = this.leads.get(assessment.leadId);
        if (lead) {
          lead.status = 'assessment_completed';
          lead.riskAssessmentId = assessmentId;
          lead.updatedAt = new Date();
          this.leads.set(assessment.leadId, lead);
        }
      }

      // Mark complete
      this.assessments.set(assessmentId, {
        ...assessment,
        status: 'complete',
        result,
        completedAt: new Date(),
        progress: 100,
      });
    } catch (error) {
      this.assessments.set(assessmentId, {
        status: 'error',
        error: (error as Error).message,
      });
    }
  }
}

// Export singleton instance
export const insuranceHub = new InsuranceComplianceHub();
