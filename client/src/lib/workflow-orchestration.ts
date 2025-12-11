/**
 * ============================================
 * WORKFLOW ORCHESTRATION CONFIGURATION
 * ============================================
 *
 * This file defines the synergistic workflow between
 * the user (pilot) and AI agents (mission control).
 *
 * USER ROLE: You're at the controls. You decide targets,
 * review results, and trigger actions.
 *
 * AI ROLE: Agents handle discovery, scanning, reporting,
 * and follow-ups. They execute your commands.
 *
 * ============================================
 */

// ============================================
// WORKFLOW PHASES
// ============================================

export type WorkflowPhase =
  | "discovery" // Find prospects by keyword/industry
  | "qualification" // Score and prioritize by ICP
  | "scanning" // Run WCAG compliance scans
  | "reporting" // Generate PDF audit reports
  | "outreach" // Send personalized emails
  | "followup"; // Automated follow-up sequences

export interface WorkflowStep {
  id: string;
  phase: WorkflowPhase;
  name: string;
  description: string;
  agentOwner: "planner" | "executor" | "outreach" | "monitor" | "user";
  apiEndpoint?: string;
  isAutomated: boolean;
  estimatedDuration: string;
  userAction?: string;
}

// Full workflow pipeline definition
export const WORKFLOW_PIPELINE: WorkflowStep[] = [
  {
    id: "step-1-keywords",
    phase: "discovery",
    name: "Enter Target Keywords",
    description:
      "Type industry keywords (e.g., 'debt collectors', 'healthcare billing'). You're in the driver's seat.",
    agentOwner: "user",
    isAutomated: false,
    estimatedDuration: "1 min",
    userAction: "Enter keywords in the workflow form",
  },
  {
    id: "step-2-discover",
    phase: "discovery",
    name: "AI Discovers Prospects",
    description:
      "The Planner Agent searches web and databases for matching companies, calculates ICP scores.",
    agentOwner: "planner",
    apiEndpoint: "/api/tasks/discover-prospects",
    isAutomated: true,
    estimatedDuration: "2-5 min",
  },
  {
    id: "step-3-qualify",
    phase: "qualification",
    name: "Score & Prioritize Leads",
    description:
      "Prospects scored by ICP fit, industry risk, website quality. Top scorers queued first.",
    agentOwner: "planner",
    apiEndpoint: "/api/prospects",
    isAutomated: true,
    estimatedDuration: "1 min",
  },
  {
    id: "step-4-queue",
    phase: "scanning",
    name: "Queue for Compliance Scan",
    description:
      "Select prospects and queue them for automated WCAG scanning. You control which ones to scan.",
    agentOwner: "user",
    apiEndpoint: "/api/tasks/queue-prospects",
    isAutomated: false,
    estimatedDuration: "30 sec",
    userAction: "Click 'Queue for Scan' on selected prospects",
  },
  {
    id: "step-5-scan",
    phase: "scanning",
    name: "Run WCAG Accessibility Scan",
    description:
      "Executor Agent runs Puppeteer + Axe-core scans, identifies violations, calculates risk scores.",
    agentOwner: "executor",
    apiEndpoint: "/api/scan/:prospectId",
    isAutomated: true,
    estimatedDuration: "3-10 min per site",
  },
  {
    id: "step-6-report",
    phase: "reporting",
    name: "Generate PDF Audit Report",
    description:
      "Comprehensive PDF with violations, screenshots, legal risk assessment, remediation steps.",
    agentOwner: "executor",
    apiEndpoint: "/api/reports/generate/:scanId",
    isAutomated: true,
    estimatedDuration: "1-2 min",
  },
  {
    id: "step-7-review",
    phase: "reporting",
    name: "Review Results & Reports",
    description:
      "You review scan results, PDF reports, and decide which prospects to contact. Mission control awaits orders.",
    agentOwner: "user",
    isAutomated: false,
    estimatedDuration: "5-15 min",
    userAction: "Review prospect cards and download PDFs",
  },
  {
    id: "step-8-email",
    phase: "outreach",
    name: "Generate Outreach Email",
    description:
      "AI generates personalized cold email using AIDA framework, with scan findings and legal risk hooks.",
    agentOwner: "outreach",
    apiEndpoint: "/api/email/with-pdf/:scanJobId",
    isAutomated: true,
    estimatedDuration: "30 sec",
  },
  {
    id: "step-9-send",
    phase: "outreach",
    name: "Send or Copy Email",
    description:
      "Review generated email, edit if needed, then send directly or copy to your email client/CRM.",
    agentOwner: "user",
    isAutomated: false,
    estimatedDuration: "2 min",
    userAction: "Click 'Send' or 'Copy to Clipboard'",
  },
  {
    id: "step-10-followup",
    phase: "followup",
    name: "Automated Follow-ups",
    description:
      "If enabled, Outreach Agent sends follow-up emails at Day 3 and Day 7 if no response.",
    agentOwner: "outreach",
    apiEndpoint: "/api/outreach/followup/:campaignId",
    isAutomated: true,
    estimatedDuration: "Ongoing",
  },
];

// ============================================
// AGENT CONFIGURATIONS
// ============================================

export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  schedule: string;
  description: string;
  capabilities: string[];
}

export const AGENT_CONFIGS: AgentConfig[] = [
  {
    id: "planner",
    name: "Planner Agent",
    role: "Discovery & Prioritization",
    schedule: "Every 60 minutes",
    description:
      "Finds prospects, scores by ICP, queues top candidates for scanning.",
    capabilities: [
      "Web search for prospects",
      "ICP scoring algorithm",
      "Industry classification",
      "Risk assessment",
      "Queue management",
    ],
  },
  {
    id: "executor",
    name: "Executor Agent",
    role: "Scanning & Reporting",
    schedule: "Every 15 minutes",
    description:
      "Runs WCAG scans using Puppeteer + Axe-core, generates PDF audit reports.",
    capabilities: [
      "Puppeteer browser automation",
      "Axe-core accessibility testing",
      "Screenshot capture",
      "PDF report generation",
      "Violation categorization",
    ],
  },
  {
    id: "outreach",
    name: "Outreach Agent",
    role: "Email Generation & Follow-ups",
    schedule: "Every 2 hours (when enabled)",
    description:
      "Generates personalized cold emails, manages follow-up sequences.",
    capabilities: [
      "AIDA email framework",
      "Personalization engine",
      "PDF attachment",
      "Follow-up scheduling",
      "Open/click tracking",
    ],
  },
  {
    id: "monitor",
    name: "Monitor Agent",
    role: "Health & Error Handling",
    schedule: "Every 30 minutes",
    description:
      "Tracks system health, retries failed scans, escalates critical errors.",
    capabilities: [
      "Health monitoring",
      "Error retry logic",
      "Alert notifications",
      "Performance metrics",
      "Queue cleanup",
    ],
  },
];

// ============================================
// API ENDPOINTS REFERENCE
// ============================================

export const API_ENDPOINTS = {
  // Prospect Management
  prospects: {
    list: "GET /api/prospects",
    get: "GET /api/prospects/:id",
    create: "POST /api/prospects",
    update: "PATCH /api/prospects/:id",
    delete: "DELETE /api/prospects/:id",
  },

  // Scanning
  scanning: {
    queue: "POST /api/tasks/queue-prospects",
    status: "GET /api/scan/:id/status",
    results: "GET /api/scan/:id/results",
  },

  // Reports
  reports: {
    generate: "POST /api/reports/generate/:scanId",
    download: "GET /api/reports/:id/download",
  },

  // Outreach
  outreach: {
    generateEmail: "POST /api/email/with-pdf/:scanJobId",
    send: "POST /api/outreach/send",
    followup: "POST /api/outreach/followup/:campaignId",
  },

  // Discovery
  discovery: {
    search: "POST /api/tasks/discover-prospects",
    keywords: "GET /api/keywords",
  },

  // System
  system: {
    health: "GET /api/health",
    metrics: "GET /api/metrics",
  },
};

// ============================================
// SYNERGY COMMANDS
// ============================================
// These are natural language triggers the user can use
// to communicate intent to the AI assistant (Comet/Perplexity)

export const SYNERGY_COMMANDS = {
  startWorkflow: [
    "Start the workflow",
    "Let's go",
    "Begin prospecting",
    "Find me leads",
    "Queue up [keyword]",
  ],
  scanProspects: [
    "Run the scans",
    "Scan these companies",
    "Check their accessibility",
    "Analyze compliance",
  ],
  generateOutreach: [
    "Draft the emails",
    "Create outreach",
    "Write the pitch",
    "Prepare campaign",
  ],
  reviewResults: [
    "Show me results",
    "What did we find?",
    "Give me the report",
    "Summarize findings",
  ],
  sendCampaign: ["Send it", "Deploy outreach", "Launch campaign", "Go live"],
};

// ============================================
// COCKPIT STATUS MESSAGES
// ============================================
// Status messages that reinforce the pilot/cockpit metaphor

export const COCKPIT_STATUS = {
  ready: "Systems ready. You're at the controls.",
  discovering: "Scanning the horizon for targets...",
  scanning: "Running compliance analysis. Stand by.",
  reporting: "Compiling your intelligence report.",
  outreachReady: "Outreach armed and ready. Awaiting your command.",
  sent: "Campaign deployed. Tracking engagement.",
  followingUp: "Follow-up sequence active. Monitoring responses.",
  error: "Alert: System encountered an issue. Investigating.",
  complete: "Mission complete. Review your results.",
};

export default {
  WORKFLOW_PIPELINE,
  AGENT_CONFIGS,
  API_ENDPOINTS,
  SYNERGY_COMMANDS,
  COCKPIT_STATUS,
};
