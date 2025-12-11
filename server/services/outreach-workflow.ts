import { storage } from "../db-storage";
import { logger } from "../logger";

export interface OutreachWorkflow {
  id: string;
  status: "pending" | "scanning" | "generating" | "sending" | "complete" | "failed";
  prospectIds: string[];
  scannedCount: number;
  emailsSent: number;
  successRate: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface WorkflowStep {
  name: string;
  timing: string;
  description: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    name: "Planner Agent",
    timing: "Every 60 min",
    description: "Queues top-scorers for scanning (up to 10/day, prioritizes by ICP and industry risk)",
  },
  {
    name: "Executor Agent",
    timing: "Every 15 min",
    description: "Runs WCAG accessibility scans using Puppeteer + Axe-core, generates PDF reports",
  },
  {
    name: "Outreach Agent",
    timing: "Every 2 hours",
    description: "Sends audit reports and follow-ups to prospects",
  },
  {
    name: "Monitor Agent",
    timing: "Every 30 min",
    description: "Tracks health, retries failed scans, escalates errors",
  },
];

export class OutreachWorkflowService {
  private workflows: Map<string, OutreachWorkflow> = new Map();

  async discoverProspects(keywords: string[], industry: string): Promise<string[]> {
    logger.info(`Discovering prospects for industry: ${industry}, keywords: ${keywords.join(", ")}`);

    // Get existing prospects and filter by industry
    const allProspects = await storage.getProspects();
    const filtered = allProspects
      .filter(p => p.industry?.toLowerCase().includes(industry.toLowerCase()))
      .slice(0, 50);

    return filtered.map(p => p.id);
  }

  async createWorkflow(keywords: string[], industry: string): Promise<OutreachWorkflow> {
    const workflowId = `workflow-${Date.now()}`;
    const prospectIds = await this.discoverProspects(keywords, industry);

    const workflow: OutreachWorkflow = {
      id: workflowId,
      status: "pending",
      prospectIds,
      scannedCount: 0,
      emailsSent: 0,
      successRate: 0,
      createdAt: new Date(),
    };

    this.workflows.set(workflowId, workflow);
    logger.info(`Created workflow ${workflowId} with ${prospectIds.length} prospects`);

    return workflow;
  }

  async getWorkflow(id: string): Promise<OutreachWorkflow | undefined> {
    return this.workflows.get(id);
  }

  async getAllWorkflows(): Promise<OutreachWorkflow[]> {
    return Array.from(this.workflows.values());
  }

  getWorkflowSteps(): WorkflowStep[] {
    return WORKFLOW_STEPS;
  }

  async updateWorkflowStatus(
    id: string,
    status: OutreachWorkflow["status"],
    updates?: Partial<OutreachWorkflow>
  ): Promise<OutreachWorkflow | undefined> {
    const workflow = this.workflows.get(id);
    if (!workflow) return undefined;

    const updated = {
      ...workflow,
      status,
      ...updates,
      completedAt: status === "complete" || status === "failed" ? new Date() : workflow.completedAt,
    };

    this.workflows.set(id, updated);
    logger.info(`Updated workflow ${id} status to ${status}`);

    return updated;
  }

  calculateSuccessMetrics(workflow: OutreachWorkflow): void {
    if (workflow.prospectIds.length > 0) {
      workflow.successRate = Math.round((workflow.emailsSent / workflow.prospectIds.length) * 100);
    }
  }
}

export const outreachWorkflow = new OutreachWorkflowService();
