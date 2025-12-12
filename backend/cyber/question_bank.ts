/**
 * Question Bank by Niche
 * Industry-specific intake questions for cyber risk assessment
 */

export interface Question {
  id: string;
  text: string;
  type: "boolean" | "text" | "number" | "select";
  options?: string[];
  required: boolean;
  category: "basic" | "security" | "compliance" | "technical";
}

export const BASE_QUESTIONS_BY_NICHE: Record<string, Question[]> = {
  generic: [
    {
      id: "revenue",
      text: "Annual revenue",
      type: "number",
      required: true,
      category: "basic",
    },
    {
      id: "employee_count",
      text: "Number of employees",
      type: "number",
      required: true,
      category: "basic",
    },
    {
      id: "industry",
      text: "Industry sector",
      type: "text",
      required: true,
      category: "basic",
    },
    {
      id: "has_mfa",
      text: "Do you use multi-factor authentication (MFA)?",
      type: "boolean",
      required: true,
      category: "security",
    },
    {
      id: "has_edr",
      text: "Do you have endpoint detection and response (EDR) software?",
      type: "boolean",
      required: true,
      category: "security",
    },
    {
      id: "backup_frequency",
      text: "How often do you backup critical data?",
      type: "select",
      options: ["daily", "weekly", "monthly", "none"],
      required: true,
      category: "technical",
    },
    {
      id: "prior_claims",
      text: "Number of cyber insurance claims in the past 3 years",
      type: "number",
      required: true,
      category: "basic",
    },
  ],

  healthcare: [
    {
      id: "revenue",
      text: "Annual revenue",
      type: "number",
      required: true,
      category: "basic",
    },
    {
      id: "employee_count",
      text: "Number of employees",
      type: "number",
      required: true,
      category: "basic",
    },
    {
      id: "patient_records",
      text: "Number of patient records stored electronically",
      type: "number",
      required: true,
      category: "basic",
    },
    {
      id: "hipaa_compliant",
      text: "Are you HIPAA compliant?",
      type: "boolean",
      required: true,
      category: "compliance",
    },
    {
      id: "has_mfa",
      text: "Do you use multi-factor authentication (MFA)?",
      type: "boolean",
      required: true,
      category: "security",
    },
    {
      id: "has_edr",
      text: "Do you have endpoint detection and response (EDR) software?",
      type: "boolean",
      required: true,
      category: "security",
    },
    {
      id: "ehr_system",
      text: "What EHR/EMR system do you use?",
      type: "text",
      required: false,
      category: "technical",
    },
    {
      id: "backup_frequency",
      text: "How often do you backup patient data?",
      type: "select",
      options: ["daily", "weekly", "monthly", "none"],
      required: true,
      category: "technical",
    },
    {
      id: "prior_claims",
      text: "Number of cyber insurance claims in the past 3 years",
      type: "number",
      required: true,
      category: "basic",
    },
    {
      id: "prior_breaches",
      text: "Any data breaches in the past 5 years?",
      type: "boolean",
      required: true,
      category: "compliance",
    },
  ],

  law_firm: [
    {
      id: "revenue",
      text: "Annual revenue",
      type: "number",
      required: true,
      category: "basic",
    },
    {
      id: "employee_count",
      text: "Number of attorneys and staff",
      type: "number",
      required: true,
      category: "basic",
    },
    {
      id: "practice_areas",
      text: "Primary practice areas",
      type: "text",
      required: true,
      category: "basic",
    },
    {
      id: "client_data_volume",
      text: "Approximate number of active client matters",
      type: "number",
      required: true,
      category: "basic",
    },
    {
      id: "has_mfa",
      text: "Do you use multi-factor authentication (MFA)?",
      type: "boolean",
      required: true,
      category: "security",
    },
    {
      id: "has_edr",
      text: "Do you have endpoint detection and response (EDR) software?",
      type: "boolean",
      required: true,
      category: "security",
    },
    {
      id: "document_encryption",
      text: "Do you encrypt client documents at rest and in transit?",
      type: "boolean",
      required: true,
      category: "security",
    },
    {
      id: "backup_frequency",
      text: "How often do you backup client data?",
      type: "select",
      options: ["daily", "weekly", "monthly", "none"],
      required: true,
      category: "technical",
    },
    {
      id: "prior_claims",
      text: "Number of cyber insurance claims in the past 3 years",
      type: "number",
      required: true,
      category: "basic",
    },
    {
      id: "bar_association_coverage",
      text: "Do you have bar association-provided cyber coverage?",
      type: "boolean",
      required: false,
      category: "compliance",
    },
  ],

  nonprofit: [
    {
      id: "revenue",
      text: "Annual budget/revenue",
      type: "number",
      required: true,
      category: "basic",
    },
    {
      id: "employee_count",
      text: "Number of staff and volunteers with system access",
      type: "number",
      required: true,
      category: "basic",
    },
    {
      id: "donor_records",
      text: "Number of donor records stored electronically",
      type: "number",
      required: true,
      category: "basic",
    },
    {
      id: "has_mfa",
      text: "Do you use multi-factor authentication (MFA)?",
      type: "boolean",
      required: true,
      category: "security",
    },
    {
      id: "has_edr",
      text: "Do you have endpoint detection and response (EDR) software?",
      type: "boolean",
      required: true,
      category: "security",
    },
    {
      id: "payment_processing",
      text: "Do you process online donations/payments?",
      type: "boolean",
      required: true,
      category: "basic",
    },
    {
      id: "pci_compliant",
      text: "Are you PCI-DSS compliant (if processing payments)?",
      type: "boolean",
      required: false,
      category: "compliance",
    },
    {
      id: "backup_frequency",
      text: "How often do you backup donor and program data?",
      type: "select",
      options: ["daily", "weekly", "monthly", "none"],
      required: true,
      category: "technical",
    },
    {
      id: "prior_claims",
      text: "Number of cyber insurance claims in the past 3 years",
      type: "number",
      required: true,
      category: "basic",
    },
  ],
};
