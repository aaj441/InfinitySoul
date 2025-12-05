import { db } from "../db";
import { verticalInsights } from "@shared/schema";
import { eq, ilike } from "drizzle-orm";

export const VERTICAL_DATA = {
  Healthcare: {
    complianceFrameworks: ["HIPAA", "ADA", "WCAG 2.1 AA", "21 CFR Part 11"],
    lawsuitTrend: "high",
    lawsuitDataPoint: "87% of healthcare providers face accessibility lawsuits annually",
    urgencyTriggers: [
      "PHI data exposure risk",
      "Patient portal accessibility failures",
      "Telehealth platform compliance gaps",
      "Electronic health record accessibility",
    ],
    socialProofTemplates: [
      "Healthcare organizations that achieved WCAG 2.1 AA compliance saw 43% increase in patient engagement",
      "87% of hospitals now prioritize digital accessibility to reduce liability exposure",
      "HIPAA fines for accessibility violations average $150K-500K per incident",
    ],
    emailSubjectTemplates: [
      "Your Patient Portal Violates HIPAA Accessibility Standards",
      "Healthcare Accessibility Audit: {company} - Critical Compliance Gap Detected",
      "URGENT: Your Telehealth Platform Fails ADA Requirements",
      "Urgent: {company} Healthcare Site Exposes Patients to Legal Risk",
    ],
    remediationContextHints: "Focus on PHI data handling, screen reader compatibility, and patient-facing interfaces. Highlight HIPAA fine risks ($150K-500K per violation). Prioritize urgent: form labels, alt text for medical imagery, keyboard navigation for patient portals.",
    complianceUrgencyScore: 95,
    averageComplianceGap: 72,
  },
  Finance: {
    complianceFrameworks: ["SEC", "FDIC", "ADA Title III", "WCAG 2.1 AA"],
    lawsuitTrend: "high",
    lawsuitDataPoint: "78% of fintech companies face accessibility litigation within 3 years",
    urgencyTriggers: [
      "Transaction accessibility for elderly users",
      "SEC compliance requirements",
      "Banking portal accessibility failures",
      "Loan application form violations",
    ],
    socialProofTemplates: [
      "Financial institutions with accessible digital platforms see 35% higher adoption among older demographics",
      "78% of fintech companies now invest in accessibility to reduce SEC penalties",
      "Average SEC settlement for digital accessibility: $2M-5M",
    ],
    emailSubjectTemplates: [
      "Critical: Your Banking Platform Violates SEC Accessibility Rules",
      "Finance Audit Alert: {company} Accessibility Score = {score}%",
      "Your Trading Platform Exposes Your Firm to $2M+ SEC Fines",
      "Urgent Compliance Issue: {company} Transaction Forms Not WCAG 2.1 AA",
    ],
    remediationContextHints: "Focus on transaction flows, currency conversions, form validation, and elderly user accessibility. Highlight SEC fine risks ($2M-5M per incident). Prioritize: keyboard-only transaction paths, color contrast on financial data, aria labels for complex forms.",
    complianceUrgencyScore: 92,
    averageComplianceGap: 68,
  },
  "E-commerce": {
    complianceFrameworks: ["ADA Title III", "WCAG 2.1 AA", "State accessibility laws"],
    lawsuitTrend: "high",
    lawsuitDataPoint: "93% of e-commerce sites face ADA Title III lawsuits",
    urgencyTriggers: [
      "Checkout flow accessibility",
      "Product image alt text gaps",
      "Payment form violations",
      "ADA Title III lawsuit spike",
    ],
    socialProofTemplates: [
      "E-commerce leaders with WCAG 2.1 AA compliance report 28% cart abandonment reduction",
      "93% of major retailers now prioritize accessibility to avoid ADA litigation",
      "Average ADA settlement: $50K-500K per incident",
    ],
    emailSubjectTemplates: [
      "Your E-Commerce Site Faces ADA Title III Lawsuits",
      "Alert: {company} Checkout Process Violates WCAG 2.1 AA",
      "Your Store Fails 93% of Accessibility Benchmarks",
      "URGENT: {company} Product Pages Missing 89% of Required Alt Text",
    ],
    remediationContextHints: "Focus on checkout flows, product images, color contrast, and keyboard navigation. Highlight ADA litigation risk ($50K-500K per incident, 93% of e-commerce sites targeted). Prioritize: add alt text to product images, fix form error messages, keyboard checkout completion.",
    complianceUrgencyScore: 88,
    averageComplianceGap: 65,
  },
  Education: {
    complianceFrameworks: ["Section 508", "ADA", "WCAG 2.1 AA", "State education laws"],
    lawsuitTrend: "high",
    lawsuitDataPoint: "72% of universities face Section 508 compliance violations",
    urgencyTriggers: [
      "Course material accessibility",
      "Learning management system compliance",
      "Student portal accessibility",
      "Section 508 compliance gap",
    ],
    socialProofTemplates: [
      "Universities with accessible course materials see 31% increase in completion rates",
      "72% of educational institutions are currently in Section 508 remediation",
      "OCR settlements average $1M+ for educational accessibility violations",
    ],
    emailSubjectTemplates: [
      "Your Learning Platform Violates Section 508",
      "Education Alert: {company} LMS Fails 89% of Accessibility Checks",
      "Your Course Materials Exclude 1 in 4 Students",
      "URGENT: {company} Student Portal Non-Compliant with Section 508",
    ],
    remediationContextHints: "Focus on course content accessibility, LMS navigation, and student support tools. Highlight Section 508 compliance risks and OCR settlements ($1M+ typical). Prioritize: PDF accessibility, video captions, accessible PDF documents, LMS keyboard navigation.",
    complianceUrgencyScore: 85,
    averageComplianceGap: 62,
  },
  Government: {
    complianceFrameworks: ["WCAG 2.1 AA", "Section 508", "Federal accessibility requirements"],
    lawsuitTrend: "high",
    lawsuitDataPoint: "100% of federal websites required to be WCAG 2.1 AA compliant",
    urgencyTriggers: [
      "Citizen-facing portal compliance",
      "WCAG 2.1 AA mandate",
      "Federal accessibility requirements",
      "Public services accessibility",
    ],
    socialProofTemplates: [
      "Governments with WCAG 2.1 AA compliant sites see 45% increase in citizen engagement",
      "100% of federal agencies now mandate WCAG 2.1 AA compliance",
      "Federal agency penalties for non-compliance: loss of funding",
    ],
    emailSubjectTemplates: [
      "Your Government Portal Violates Federal WCAG 2.1 AA Requirements",
      "Compliance Alert: {company} Fails Section 508 Standards",
      "Federal Mandate: {company} Must Achieve WCAG 2.1 AA Compliance",
      "Urgent: {company} Citizen Portal Non-Compliant",
    ],
    remediationContextHints: "Focus on public-facing services, citizen accessibility, and federal compliance. Highlight WCAG 2.1 AA mandate and funding loss risk. Prioritize: form accessibility for elderly users, multilingual support, keyboard-only navigation, screen reader optimization.",
    complianceUrgencyScore: 98,
    averageComplianceGap: 58,
  },
  SaaS: {
    complianceFrameworks: ["ADA", "WCAG 2.1 AA", "Product liability"],
    lawsuitTrend: "medium",
    lawsuitDataPoint: "61% of SaaS companies face accessibility claims affecting user retention",
    urgencyTriggers: [
      "Product liability exposure",
      "User retention impact",
      "Enterprise customer accessibility demands",
      "Market differentiation opportunity",
    ],
    socialProofTemplates: [
      "SaaS companies with accessible products report 22% higher user retention",
      "61% of SaaS platforms now prioritize accessibility for enterprise deals",
      "Enterprise procurement: WCAG compliance is top 3 requirement",
    ],
    emailSubjectTemplates: [
      "Your SaaS Platform Faces Accessibility Product Liability",
      "Alert: {company} SaaS Product Loses Enterprise Deals Due to Accessibility",
      "Your Platform Excludes 61% of SaaS Users",
      "Market Opportunity: {company} SaaS Accessibility Gap = Lost Revenue",
    ],
    remediationContextHints: "Focus on product usability, enterprise feature accessibility, and user retention. Highlight market differentiation and enterprise sales impact (WCAG required for 61% of deals). Prioritize: keyboard shortcuts, screen reader support, dashboard accessibility, API documentation clarity.",
    complianceUrgencyScore: 72,
    averageComplianceGap: 48,
  },
  "Real Estate": {
    complianceFrameworks: ["FHA", "ADA Title III", "WCAG 2.1 AA", "State property laws"],
    lawsuitTrend: "medium",
    lawsuitDataPoint: "68% of real estate websites violate FHA accessibility standards",
    urgencyTriggers: [
      "FHA compliance mandate",
      "Virtual tour accessibility",
      "Property listing accessibility",
      "ADA Title III litigation risk",
    ],
    socialProofTemplates: [
      "Real estate platforms with FHA compliant virtual tours see 38% more inquiries",
      "68% of major real estate sites now prioritize FHA accessibility",
      "FHA settlements: $25K-250K per incident",
    ],
    emailSubjectTemplates: [
      "Your Real Estate Platform Violates FHA Accessibility Standards",
      "Alert: {company} Virtual Tours Fail 87% of Accessibility Checks",
      "Your Property Listings Exclude Disabled Homebuyers",
      "URGENT: {company} Website Non-Compliant with FHA Requirements",
    ],
    remediationContextHints: "Focus on virtual tour accessibility, property listing descriptions, and fair housing compliance. Highlight FHA compliance risk ($25K-250K per incident). Prioritize: video captions, virtual tour keyboard navigation, property image descriptions, form accessibility.",
    complianceUrgencyScore: 78,
    averageComplianceGap: 55,
  },
  Manufacturing: {
    complianceFrameworks: ["ADA", "WCAG 2.1 A", "B2B accessibility standards"],
    lawsuitTrend: "low",
    lawsuitDataPoint: "42% of manufacturing B2B sites lack basic accessibility features",
    urgencyTriggers: [
      "B2B supplier accessibility",
      "Equipment documentation accessibility",
      "Supply chain partner requirements",
      "Procurement platform accessibility",
    ],
    socialProofTemplates: [
      "Manufacturing suppliers with accessible B2B platforms win 24% more contracts",
      "42% of manufacturing procurement now requires accessible supplier portals",
      "Fortune 500 suppliers: WCAG compliance is procurement requirement",
    ],
    emailSubjectTemplates: [
      "Your B2B Platform Loses Manufacturing Contracts Due to Accessibility",
      "Supplier Alert: {company} B2B Site Fails 71% of Accessibility Standards",
      "Your Equipment Documentation Excludes Professional Users",
      "Market Opportunity: {company} Accessibility = {company} Lost B2B Revenue",
    ],
    remediationContextHints: "Focus on B2B portal accessibility, technical documentation, and supplier collaboration tools. Highlight procurement requirements and B2B contract wins (24% higher). Prioritize: technical PDF accessibility, supplier portal keyboard navigation, equipment spec sheet clarity.",
    complianceUrgencyScore: 62,
    averageComplianceGap: 42,
  },
};

export async function getVerticalInsights(industryName: string): Promise<any> {
  return db
    .select()
    .from(verticalInsights)
    .where(ilike(verticalInsights.industryName, `%${industryName}%`))
    .limit(1);
}

export async function getIndustryData(industryName: string): Promise<any> {
  // First try database
  const dbResult = await getVerticalInsights(industryName);
  if (dbResult.length > 0) {
    return dbResult[0];
  }

  // Fallback to predefined data
  const normalizedIndustry = Object.keys(VERTICAL_DATA).find(
    (key) => key.toLowerCase() === industryName.toLowerCase()
  );

  if (normalizedIndustry && VERTICAL_DATA[normalizedIndustry as keyof typeof VERTICAL_DATA]) {
    const data = VERTICAL_DATA[normalizedIndustry as keyof typeof VERTICAL_DATA];
    return {
      industryName: normalizedIndustry,
      ...data,
    };
  }

  // Default fallback
  return {
    industryName: "Generic",
    complianceFrameworks: ["ADA", "WCAG 2.1 AA"],
    lawsuitTrend: "medium",
    lawsuitDataPoint: "Websites with accessibility issues face increased litigation risk",
    urgencyTriggers: ["Accessibility compliance", "Legal exposure"],
    socialProofTemplates: [
      "Organizations with accessible websites see improved user engagement",
      "WCAG compliance is now standard industry practice",
    ],
    emailSubjectTemplates: [
      "Your Website Accessibility Audit Results",
      "Critical Compliance Issues Found on {company}",
    ],
    remediationContextHints: "Focus on WCAG 2.1 AA compliance and user accessibility.",
    complianceUrgencyScore: 65,
    averageComplianceGap: 50,
  };
}

export async function seedVerticalInsights(): Promise<void> {
  for (const [industryName, data] of Object.entries(VERTICAL_DATA)) {
    const existing = await db
      .select()
      .from(verticalInsights)
      .where(eq(verticalInsights.industryName, industryName))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(verticalInsights).values({
        industryName,
        complianceFrameworks: data.complianceFrameworks,
        lawsuitTrend: data.lawsuitTrend,
        lawsuitDataPoint: data.lawsuitDataPoint,
        urgencyTriggers: data.urgencyTriggers,
        socialProofTemplates: data.socialProofTemplates,
        emailSubjectTemplates: data.emailSubjectTemplates,
        remediationContextHints: data.remediationContextHints,
        complianceUrgencyScore: data.complianceUrgencyScore,
        averageComplianceGap: data.averageComplianceGap,
      });
    }
  }
}
