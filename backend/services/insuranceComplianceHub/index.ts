/**
 * Insurance Compliance Hub - Core Service
 *
 * "Insurance That Doesn't Suck" - Compliance-first insurance for people who actually understand risk.
 *
 * This module provides the foundation for the AI-Powered Compliance + Insurance Advisor platform,
 * integrating Lucy (AI advisor), multi-line risk assessment, and customer-facing compliance audits.
 *
 * Architecture:
 * - Lucy AI: Conversational compliance advisor powered by multi-LLM consensus
 * - Risk Assessment: Multi-line insurance coverage analysis
 * - Compliance Audit: WCAG + Cyber + Regulatory compliance scoring
 * - Lead Funnel: Assessment → Nurture → Quote → Close → Renewal
 *
 * Commission Stack (per customer):
 * - Life/Health: 5-15% (recurring monthly)
 * - P&C: 15-20%
 * - Cyber: 20-25%
 * - Workers Comp: 15-18%
 * - Umbrella/E&O: 15-20%
 * - Bonds: 10-15%
 * - Infinity Soul Licensing: $2K/year
 *
 * Target: $100K+ commissions + $60K licensing Year 1 (30 customers)
 */

export { InsuranceComplianceHub, insuranceHub, INSURANCE_LINE_CONFIGS, INDUSTRY_RISK_PROFILES } from './InsuranceComplianceHub';
export { LucyAdvisor } from './LucyAdvisor';
export { MultiLineRiskAssessment } from './MultiLineRiskAssessment';
export { ComplianceAuditDisplay } from './ComplianceAuditDisplay';
export { LeadFunnel } from './LeadFunnel';
export * from './types';
