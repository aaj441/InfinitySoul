/**
 * Construction Industry Test Suite for InfinitySoul
 *
 * Purpose: Realistic test scenarios for construction companies
 * Use Case: Demo environment and workflow validation
 */

export interface ConstructionCompany {
  id: string;
  name: string;
  type: 'general_contractor' | 'subcontractor' | 'specialty_trade' | 'commercial_builder';
  employees: number;
  annualRevenue: number;
  locations: string[];
  website: string;
  adaRiskProfile: ConstructionADARiskProfile;
}

export interface ConstructionADARiskProfile {
  primaryRisks: string[];
  websiteIssues: WebsiteIssue[];
  projectDocumentIssues: DocumentIssue[];
  clientPortalIssues: PortalIssue[];
  estimatedLitigationRisk: 'low' | 'medium' | 'high' | 'critical';
  industryBenchmark: number; // 0-100 percentile
}

export interface WebsiteIssue {
  page: string;
  wcagViolation: string;
  severity: 'minor' | 'moderate' | 'serious' | 'critical';
  impactedUsers: string[];
  detectedBy: string[];
  remediation: string;
}

export interface DocumentIssue {
  documentType: string;
  format: 'pdf' | 'word' | 'excel' | 'image';
  wcagViolation: string;
  frequency: number; // how many documents affected
}

export interface PortalIssue {
  feature: string;
  wcagViolation: string;
  userFlow: string;
  businessImpact: string;
}

// ============================================
// Test Company: Metro Construction Group
// ============================================
export const METRO_CONSTRUCTION: ConstructionCompany = {
  id: 'test-metro-construction-001',
  name: 'Metro Construction Group',
  type: 'general_contractor',
  employees: 250,
  annualRevenue: 45_000_000,
  locations: ['New York, NY', 'Newark, NJ', 'Philadelphia, PA'],
  website: 'https://demo.metroconstruction.test',
  adaRiskProfile: {
    primaryRisks: [
      'Website lacks keyboard navigation',
      'Project photo gallery missing alt text (1,200+ images)',
      'Client portal login form not accessible to screen readers',
      'PDF estimates and proposals not machine-readable',
      'Mobile site fails color contrast requirements',
    ],
    websiteIssues: [
      {
        page: '/portfolio',
        wcagViolation: 'WCAG 2.1 Level AA - 1.1.1 Non-text Content',
        severity: 'serious',
        impactedUsers: ['Blind users', 'Low vision users'],
        detectedBy: ['axe-core', 'WAVE', 'Lighthouse'],
        remediation: 'Add descriptive alt text to all 1,200+ project images'
      },
      {
        page: '/contact',
        wcagViolation: 'WCAG 2.1 Level AA - 1.3.1 Info and Relationships',
        severity: 'critical',
        impactedUsers: ['Screen reader users'],
        detectedBy: ['axe-core', 'pa11y'],
        remediation: 'Add proper form labels and ARIA attributes to contact form'
      },
      {
        page: '/services',
        wcagViolation: 'WCAG 2.1 Level AA - 1.4.3 Contrast (Minimum)',
        severity: 'moderate',
        impactedUsers: ['Low vision users', 'Color blind users'],
        detectedBy: ['axe-core', 'WAVE'],
        remediation: 'Increase contrast ratio to 4.5:1 for body text'
      },
      {
        page: '/client-portal',
        wcagViolation: 'WCAG 2.1 Level AA - 2.1.1 Keyboard',
        severity: 'critical',
        impactedUsers: ['Keyboard-only users', 'Motor disability users'],
        detectedBy: ['manual testing', 'axe-core'],
        remediation: 'Enable full keyboard navigation for portal interface'
      },
      {
        page: '/projects/gallery',
        wcagViolation: 'WCAG 2.1 Level AA - 2.4.4 Link Purpose',
        severity: 'serious',
        impactedUsers: ['Screen reader users'],
        detectedBy: ['WAVE', 'Lighthouse'],
        remediation: 'Replace "Click here" links with descriptive text'
      }
    ],
    projectDocumentIssues: [
      {
        documentType: 'Project Estimates',
        format: 'pdf',
        wcagViolation: 'WCAG 2.1 Level AA - 1.3.1 Info and Relationships',
        frequency: 450 // PDF estimates per year
      },
      {
        documentType: 'Construction Proposals',
        format: 'pdf',
        wcagViolation: 'WCAG 2.1 Level AA - 1.4.3 Contrast (Minimum)',
        frequency: 200
      },
      {
        documentType: 'Safety Plans',
        format: 'pdf',
        wcagViolation: 'WCAG 2.1 Level AA - 1.1.1 Non-text Content',
        frequency: 50
      }
    ],
    clientPortalIssues: [
      {
        feature: 'Project Timeline Viewer',
        wcagViolation: 'WCAG 2.1 Level AA - 1.4.1 Use of Color',
        userFlow: 'Client reviews project milestones and deadlines',
        businessImpact: 'Clients with disabilities cannot track project status independently'
      },
      {
        feature: 'Invoice Payment System',
        wcagViolation: 'WCAG 2.1 Level AA - 3.3.2 Labels or Instructions',
        userFlow: 'Client pays invoices online',
        businessImpact: 'Risk of payment delays and ADA lawsuit from client'
      },
      {
        feature: 'Document Upload',
        wcagViolation: 'WCAG 2.1 Level AA - 4.1.2 Name, Role, Value',
        userFlow: 'Client uploads plans, permits, or change orders',
        businessImpact: 'Clients with disabilities cannot participate in project workflow'
      }
    ],
    estimatedLitigationRisk: 'high',
    industryBenchmark: 23 // Bottom 23rd percentile (worse than 77% of construction firms)
  }
};

// ============================================
// Test Company: Summit Roofing & Siding
// ============================================
export const SUMMIT_ROOFING: ConstructionCompany = {
  id: 'test-summit-roofing-002',
  name: 'Summit Roofing & Siding',
  type: 'specialty_trade',
  employees: 45,
  annualRevenue: 3_500_000,
  locations: ['Austin, TX', 'San Antonio, TX'],
  website: 'https://demo.summitroofing.test',
  adaRiskProfile: {
    primaryRisks: [
      'Quote request form has no keyboard access',
      'Before/after photo gallery missing alt text (500+ images)',
      'Mobile hamburger menu not accessible to screen readers',
      'Video testimonials lack captions',
      'Online financing calculator not keyboard accessible',
    ],
    websiteIssues: [
      {
        page: '/get-quote',
        wcagViolation: 'WCAG 2.1 Level AA - 2.1.1 Keyboard',
        severity: 'critical',
        impactedUsers: ['Keyboard-only users', 'Screen reader users'],
        detectedBy: ['axe-core', 'manual testing'],
        remediation: 'Fix JavaScript form validation to support keyboard input'
      },
      {
        page: '/gallery',
        wcagViolation: 'WCAG 2.1 Level AA - 1.1.1 Non-text Content',
        severity: 'serious',
        impactedUsers: ['Blind users'],
        detectedBy: ['axe-core', 'WAVE'],
        remediation: 'Add alt text to 500+ before/after project photos'
      },
      {
        page: '/financing',
        wcagViolation: 'WCAG 2.1 Level AA - 2.1.1 Keyboard',
        severity: 'critical',
        impactedUsers: ['Keyboard-only users'],
        detectedBy: ['manual testing'],
        remediation: 'Make financing calculator fully keyboard navigable'
      },
      {
        page: '/testimonials',
        wcagViolation: 'WCAG 2.1 Level AA - 1.2.2 Captions (Prerecorded)',
        severity: 'serious',
        impactedUsers: ['Deaf/hard of hearing users'],
        detectedBy: ['manual review'],
        remediation: 'Add closed captions to 25 customer testimonial videos'
      }
    ],
    projectDocumentIssues: [
      {
        documentType: 'Roofing Estimates',
        format: 'pdf',
        wcagViolation: 'WCAG 2.1 Level AA - 1.3.1 Info and Relationships',
        frequency: 800 // estimates per year
      },
      {
        documentType: 'Warranty Documents',
        format: 'pdf',
        wcagViolation: 'WCAG 2.1 Level AA - 1.4.3 Contrast (Minimum)',
        frequency: 350
      }
    ],
    clientPortalIssues: [
      {
        feature: 'Schedule Installation Appointment',
        wcagViolation: 'WCAG 2.1 Level AA - 2.4.7 Focus Visible',
        userFlow: 'Customer books installation date',
        businessImpact: 'Keyboard users cannot schedule appointments, leading to phone calls and delays'
      }
    ],
    estimatedLitigationRisk: 'high',
    industryBenchmark: 31 // Bottom 31st percentile
  }
};

// ============================================
// Test Company: Apex Commercial Builders
// ============================================
export const APEX_COMMERCIAL: ConstructionCompany = {
  id: 'test-apex-commercial-003',
  name: 'Apex Commercial Builders',
  type: 'commercial_builder',
  employees: 180,
  annualRevenue: 62_000_000,
  locations: ['Miami, FL', 'Orlando, FL', 'Tampa, FL'],
  website: 'https://demo.apexcommercial.test',
  adaRiskProfile: {
    primaryRisks: [
      'Bid portal requires mouse for all interactions',
      'CAD drawing viewer not compatible with assistive tech',
      'RFP submission system timing out for screen readers',
      'Project status dashboard uses color alone to convey info',
      'Mobile responsiveness broken on client portal',
    ],
    websiteIssues: [
      {
        page: '/bid-portal',
        wcagViolation: 'WCAG 2.1 Level AA - 2.1.1 Keyboard',
        severity: 'critical',
        impactedUsers: ['Keyboard-only users', 'Motor disability users'],
        detectedBy: ['manual testing', 'axe-core'],
        remediation: 'Rebuild bid portal with keyboard navigation support'
      },
      {
        page: '/project-dashboard',
        wcagViolation: 'WCAG 2.1 Level AA - 1.4.1 Use of Color',
        severity: 'serious',
        impactedUsers: ['Color blind users'],
        detectedBy: ['manual testing'],
        remediation: 'Add text labels and patterns to color-coded project statuses'
      },
      {
        page: '/cad-viewer',
        wcagViolation: 'WCAG 2.1 Level AA - 4.1.2 Name, Role, Value',
        severity: 'critical',
        impactedUsers: ['Screen reader users'],
        detectedBy: ['manual testing'],
        remediation: 'Provide alternative text-based drawing summaries'
      }
    ],
    projectDocumentIssues: [
      {
        documentType: 'RFP Documents',
        format: 'pdf',
        wcagViolation: 'WCAG 2.1 Level AA - 1.3.1 Info and Relationships',
        frequency: 120
      },
      {
        documentType: 'Project Proposals',
        format: 'pdf',
        wcagViolation: 'WCAG 2.1 Level AA - 1.4.3 Contrast (Minimum)',
        frequency: 80
      },
      {
        documentType: 'Construction Drawings',
        format: 'pdf',
        wcagViolation: 'WCAG 2.1 Level AA - 1.1.1 Non-text Content',
        frequency: 200
      }
    ],
    clientPortalIssues: [
      {
        feature: 'Submit Change Order',
        wcagViolation: 'WCAG 2.1 Level AA - 3.2.2 On Input',
        userFlow: 'Client requests project changes',
        businessImpact: 'Screen reader users experience unexpected form resets'
      },
      {
        feature: 'View Project Budget',
        wcagViolation: 'WCAG 2.1 Level AA - 1.3.1 Info and Relationships',
        userFlow: 'Client reviews project financials',
        businessImpact: 'Complex budget tables are not accessible to screen readers'
      }
    ],
    estimatedLitigationRisk: 'critical',
    industryBenchmark: 15 // Bottom 15th percentile (worse than 85% of firms)
  }
};

// ============================================
// Construction Industry Benchmarks
// ============================================
export const CONSTRUCTION_INDUSTRY_BENCHMARKS = {
  industryName: 'Construction & Contracting',
  totalCompanies: 750_000, // US construction companies
  averageADAScore: 52, // Out of 100
  commonViolations: [
    {
      violation: 'Missing alt text on project photos',
      prevalence: 78, // 78% of construction websites
      avgCount: 450,
      avgRemediationTime: '2-3 weeks',
      typicalCost: '$5,000 - $15,000'
    },
    {
      violation: 'Inaccessible quote/estimate request forms',
      prevalence: 65,
      avgCount: 1,
      avgRemediationTime: '1-2 weeks',
      typicalCost: '$3,000 - $8,000'
    },
    {
      violation: 'PDF estimates/proposals not machine-readable',
      prevalence: 89,
      avgCount: 500,
      avgRemediationTime: '3-6 months',
      typicalCost: '$20,000 - $50,000'
    },
    {
      violation: 'Client portal keyboard navigation issues',
      prevalence: 72,
      avgCount: 15,
      avgRemediationTime: '4-8 weeks',
      typicalCost: '$15,000 - $40,000'
    },
    {
      violation: 'Video content without captions',
      prevalence: 82,
      avgCount: 20,
      avgRemediationTime: '1-2 weeks',
      typicalCost: '$2,000 - $5,000'
    }
  ],
  lawsuitStats: {
    total2023Lawsuits: 1247, // ADA lawsuits against construction companies
    averageSettlement: 35_000,
    averageLegalFees: 85_000,
    averageRemediationCost: 45_000,
    totalAverageCost: 165_000,
    commonPlaintiffs: [
      'Juan Carlos Gil (62 cases)',
      'Melissa Doom (48 cases)',
      'Kedric Cheatham (39 cases)'
    ]
  },
  highRiskJurisdictions: [
    { jurisdiction: 'S.D.N.Y. (Southern District of New York)', cases: 387 },
    { jurisdiction: 'E.D.N.Y. (Eastern District of New York)', cases: 156 },
    { jurisdiction: 'C.D. Cal. (Central District of California)', cases: 143 },
    { jurisdiction: 'S.D. Fla. (Southern District of Florida)', cases: 98 }
  ]
};

// ============================================
// Test Lawsuit Scenarios
// ============================================
export const TEST_LAWSUIT_SCENARIOS = [
  {
    plaintiffName: 'Test User - Maria Rodriguez',
    plaintiffType: 'Blind screen reader user',
    targetCompany: 'Metro Construction Group',
    filingDate: '2024-11-15',
    court: 'S.D.N.Y.',
    claims: [
      'Website contact form not accessible via screen reader',
      'Project portfolio images lack alternative text',
      'Client portal login requires mouse interaction',
      'PDF estimates not compatible with assistive technology'
    ],
    potentialDamages: 75_000,
    legalFeesProjection: 95_000,
    remediationCostEstimate: 55_000,
    totalExposure: 225_000,
    preventable: true,
    detectedByInfinitySoul: true
  },
  {
    plaintiffName: 'Test User - James Thompson',
    plaintiffType: 'Keyboard-only user (motor disability)',
    targetCompany: 'Summit Roofing & Siding',
    filingDate: '2024-10-22',
    court: 'W.D. Tex.',
    claims: [
      'Quote request form not keyboard accessible',
      'Financing calculator requires mouse',
      'Mobile menu navigation broken for keyboard users'
    ],
    potentialDamages: 45_000,
    legalFeesProjection: 70_000,
    remediationCostEstimate: 35_000,
    totalExposure: 150_000,
    preventable: true,
    detectedByInfinitySoul: true
  },
  {
    plaintiffName: 'Test User - David Chen',
    plaintiffType: 'Deaf user',
    targetCompany: 'Apex Commercial Builders',
    filingDate: '2024-09-08',
    court: 'S.D. Fla.',
    claims: [
      'Safety training videos lack captions',
      'Client webinar recordings not accessible',
      'Project update videos missing transcripts'
    ],
    potentialDamages: 35_000,
    legalFeesProjection: 65_000,
    remediationCostEstimate: 25_000,
    totalExposure: 125_000,
    preventable: true,
    detectedByInfinitySoul: true
  }
];

// ============================================
// Demo Workflow Script
// ============================================
export const CONSTRUCTION_DEMO_WORKFLOW = {
  title: 'Construction Industry ADA Compliance Demo',
  duration: '15 minutes',
  steps: [
    {
      step: 1,
      title: 'Upload Construction Company Website',
      action: 'Paste URL: demo.metroconstruction.test',
      duration: '30 seconds',
      talking_points: [
        'Metro Construction Group is a $45M general contractor in NYC',
        'They have 250 employees and work on commercial projects',
        'Like 78% of construction companies, they have project photos without alt text'
      ]
    },
    {
      step: 2,
      title: 'Autonomous Scan Detects Issues',
      action: 'Watch real-time scanning dashboard',
      duration: '2 minutes',
      talking_points: [
        '1,200+ images missing alt text detected instantly',
        'Critical keyboard navigation issues on quote form',
        'Client portal fails WCAG 2.1 Level AA standards',
        'Risk ATC dashboard shows "HIGH" litigation risk'
      ]
    },
    {
      step: 3,
      title: 'Lawsuit Prediction',
      action: 'Show Risk Air Traffic Control dashboard',
      duration: '2 minutes',
      talking_points: [
        'Metro Construction is in bottom 23rd percentile for construction industry',
        'Juan Carlos Gil (serial plaintiff) filed 12 cases against similar contractors this year',
        'S.D.N.Y. jurisdiction has 387 construction ADA cases this year',
        '87% probability of lawsuit within 18 months if not remediated'
      ]
    },
    {
      step: 4,
      title: 'Show Plaintiff Intelligence',
      action: 'Display Plaintiff Radar',
      duration: '2 minutes',
      talking_points: [
        'Juan Carlos Gil: 62 construction cases, average $35K settlement',
        'Typical pattern: Targets companies with inaccessible quote forms',
        'Works with law firm Morrison & Cohen (95% success rate)',
        'Filing velocity: 8 new cases per month in construction sector'
      ]
    },
    {
      step: 5,
      title: 'Calculate Financial Exposure',
      action: 'Show cost breakdown',
      duration: '2 minutes',
      talking_points: [
        'Settlement: $75,000',
        'Legal fees: $95,000',
        'Remediation (emergency): $55,000',
        'Total exposure: $225,000',
        'vs. Proactive remediation with InfinitySoul: $12,000'
      ]
    },
    {
      step: 6,
      title: 'Auto-Remediation',
      action: 'Show AI code generation',
      duration: '3 minutes',
      talking_points: [
        'AI analyzes website architecture',
        'Generates accessible HTML/CSS/JavaScript fixes',
        'Creates alt text for 1,200 images using GPT-4 Vision',
        'Refactors quote form with ARIA labels and keyboard support',
        '85% of issues fixed automatically, 15% require developer review'
      ]
    },
    {
      step: 7,
      title: 'Continuous Monitoring',
      action: 'Show ADA Guardian dashboard',
      duration: '2 minutes',
      talking_points: [
        'Daily automated scans detect new issues',
        'Real-time lawsuit alerts via Slack/email',
        'Quarterly compliance reports for insurance carriers',
        'API integration with CI/CD pipeline prevents regression'
      ]
    },
    {
      step: 8,
      title: 'Pricing & ROI',
      action: 'Show pricing calculator',
      duration: '1.5 minutes',
      talking_points: [
        'Professional tier: $499/month (small contractors)',
        'Business tier: $999/month (mid-size firms like Metro)',
        'ROI: One prevented lawsuit = 19 years of subscription',
        'Insurance discount: 10-15% reduction in GL premiums'
      ]
    }
  ]
};

// Export all test companies
export const ALL_TEST_COMPANIES = [
  METRO_CONSTRUCTION,
  SUMMIT_ROOFING,
  APEX_COMMERCIAL
];
