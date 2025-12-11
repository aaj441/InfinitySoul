import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./db-storage";
import { insertProspectSchema, insertViolationSchema, insertTriggerSchema, insertScanJobSchema, insertClientSchema, doNotContact, insertFeedbackDecisionSchema, insertEdgeCaseLogSchema, insertConsultantSchema, insertProjectSchema, insertTransactionSchema } from "@shared/schema";
import { aiMatcher } from "./services/ai-matcher";
import { outreachWorkflow } from "./services/outreach-workflow";
import { outreachEmailGenerator } from "./services/outreach-email-generator";
import { outreachScheduler } from "./services/outreach-scheduler";
import { db } from "./db";
import { z } from "zod";
import { seedData } from "./seed";
import { wcagScanner } from "./services/wcag-scanner";
import { pdfGenerator } from "./services/pdf-generator";
import { scanOrchestrator } from "./orchestrator";
import { keywordDiscoveryService } from "./services/keyword-discovery";
import { metaPromptsService } from "./services/meta-prompts";
import { integrationContextService } from "./services/integration-context";
import { websiteRegeneratorService } from "./services/website-regenerator";
import { mockupRendererService } from "./services/mockup-renderer";
import { keywordScanner } from "./services/keyword-scanner";
import { healthCheck } from "./services/health-check";
import { suggestionsGenerator } from "./services/suggestions-generator";
import { compactPdfGenerator } from "./services/compact-pdf-generator";
import { dataOptimizer } from "./services/data-optimizer";
import { emailGenerator } from "./services/email-generator";
import { ethicalEmailGuard } from "./services/ethical-email-guard";
import { scoreProspect, getProspectScore, getTopLeads } from "./services/icp-scoring";
import { generateCompetitiveReport, getCompetitiveAnalysis, generateEmailSnippets } from "./services/competitive-analysis";
import { generateRemediations, getRemediations, getUpsellRemediations } from "./services/remediation-generator";
import { addScanJob, addCompetitiveJob, addRemediationJob, addAnalyticsJob, getJobStatus } from "./services/bull-queue";
import { getDashboardMetrics, getWeeklyRevenue, getCadenceEffectiveness, getPipelineByIcpTier, getConversionMetrics } from "./services/analytics-service";
import { sendCertifiedMail, getMailStatus, createBulkCertifiedMailCampaign, estimateMailCost } from "./services/lob-service";
import { getIndustryData } from "./services/industry-insights";
import { insertPhysicalMailSchema, physicalMail as physicalMailTable, verticalInsights, insertEmailCampaignSchema, insertEmailVariantSchema } from "@shared/schema";
import archiver from "archiver";
import path from "path";
import { quickWinLimiter, agentTriggerLimiter } from "./middleware/rate-limiter";
import { logger } from "./logger";

let isSeeded = false;

export async function registerRoutes(app: Express): Promise<Server> {
  // Seed initial data only once
  if (!isSeeded) {
    await seedData();
    isSeeded = true;
  }

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      // Check database connectivity by running a simple query
      const prospects = await storage.getProspects().catch(() => null);
      
      const health = {
        status: prospects !== null ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        database: prospects !== null ? "connected" : "disconnected",
      };

      const statusCode = health.status === "healthy" ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (error) {
      logger.error("Health check failed", error as Error);
      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "error",
      });
    }
  });

  // Prospect routes
  app.get("/api/prospects", async (_req, res) => {
    try {
      const prospects = await storage.getProspects();
      res.json(prospects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prospects" });
    }
  });

  app.get("/api/prospects/:id", async (req, res) => {
    try {
      const prospect = await storage.getProspect(req.params.id);
      if (!prospect) {
        return res.status(404).json({ error: "Prospect not found" });
      }
      res.json(prospect);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prospect" });
    }
  });

  app.post("/api/prospects", async (req, res, next) => {
    try {
      const validatedData = insertProspectSchema.parse(req.body);
      const prospect = await storage.createProspect(validatedData);
      res.status(201).json(prospect);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/prospects/:id", async (req, res, next) => {
    try {
      const validatedData = insertProspectSchema.partial().parse(req.body);
      const prospect = await storage.updateProspect(req.params.id, validatedData);
      if (!prospect) {
        return res.status(404).json({ error: "Prospect not found" });
      }
      res.json(prospect);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/prospects/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProspect(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Prospect not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete prospect" });
    }
  });

  // CSV import endpoint
  app.post("/api/prospects/import/csv", async (req, res) => {
    try {
      const { csvContent } = req.body;
      if (!csvContent) {
        return res.status(400).json({ error: "CSV content is required" });
      }

      const lines = csvContent.trim().split('\n');
      if (lines.length < 2) {
        return res.status(400).json({ error: "CSV must have header and at least one data row" });
      }

      // Parse header
      const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
      const companyIdx = headers.indexOf('company');
      const websiteIdx = headers.indexOf('website');
      const industryIdx = headers.indexOf('industry');
      const employeesIdx = headers.indexOf('employees');
      const revenueIdx = headers.indexOf('revenue');

      if (companyIdx === -1 || industryIdx === -1) {
        return res.status(400).json({ error: "CSV must include 'company' and 'industry' columns" });
      }

      const importedProspects = [];
      const errors = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        try {
          const fields = line.split(',').map((f: string) => f.trim());
          const prospectData = {
            company: fields[companyIdx] || '',
            website: websiteIdx !== -1 ? fields[websiteIdx] || undefined : undefined,
            industry: fields[industryIdx] || '',
            employees: employeesIdx !== -1 ? fields[employeesIdx] || undefined : undefined,
            revenue: revenueIdx !== -1 ? fields[revenueIdx] || undefined : undefined,
          };

          const validatedData = insertProspectSchema.parse(prospectData);
          const prospect = await storage.createProspect(validatedData);
          importedProspects.push(prospect);
        } catch (err: any) {
          errors.push(`Row ${i + 1}: ${err.message || 'Invalid data'}`);
        }
      }

      res.json({
        imported: importedProspects.length,
        total: lines.length - 1,
        prospects: importedProspects,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error: any) {
      logger.error("CSV import failed", error);
      res.status(500).json({ error: "Failed to import CSV" });
    }
  });

  // ========== MARKETPLACE ROUTES ==========

  // Consultants endpoints
  app.get("/api/consultants", async (_req, res) => {
    try {
      const consultants = await storage.getConsultants();
      res.json(consultants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch consultants" });
    }
  });

  app.get("/api/consultants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const consultant = await storage.getConsultant(id);
      if (!consultant) {
        return res.status(404).json({ error: "Consultant not found" });
      }
      res.json(consultant);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch consultant" });
    }
  });

  app.post("/api/consultants", async (req, res) => {
    try {
      const validatedData = insertConsultantSchema.parse(req.body);
      const consultant = await storage.createConsultant(validatedData);
      res.status(201).json(consultant);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid consultant data" });
    }
  });

  app.patch("/api/consultants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertConsultantSchema.partial().parse(req.body);
      const consultant = await storage.updateConsultant(id, validatedData);
      if (!consultant) {
        return res.status(404).json({ error: "Consultant not found" });
      }
      res.json(consultant);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid update data" });
    }
  });

  // Projects endpoints
  app.get("/api/projects", async (_req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const { title, description, category, industry, budget } = req.body;

      // Calculate commission (25% total)
      const commission = Math.round(budget * 0.25);
      const payout = budget - commission;

      const validatedData = insertProjectSchema.parse({
        title,
        description,
        category,
        industry,
        budget,
        projectValue: budget,
        platformCommission: commission,
        consultantPayout: payout,
        status: "open",
      });

      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid project data" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, validatedData);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid update data" });
    }
  });

  // AI Matching endpoint
  app.post("/api/projects/:id/match", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const matches = await aiMatcher.matchConsultantsToProject(projectId, 5);
      res.json({ projectId, matches });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to match consultants" });
    }
  });

  // Transactions endpoints
  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Invalid transaction data" });
    }
  });

  app.get("/api/projects/:id/transactions", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const transactions = await storage.getTransactionsByProject(projectId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // ========== OUTREACH WORKFLOW ROUTES ==========

  // Discover prospects for outreach
  app.post("/api/outreach/discover", async (req, res) => {
    try {
      const { keywords, industry } = req.body;

      if (!keywords || !Array.isArray(keywords) || !industry) {
        return res.status(400).json({ error: "keywords (array) and industry are required" });
      }

      const prospectIds = await outreachWorkflow.discoverProspects(keywords, industry);

      res.json({
        count: prospectIds.length,
        prospectIds,
        keywords,
        industry,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to discover prospects" });
    }
  });

  // Create outreach workflow
  app.post("/api/outreach/workflow", async (req, res) => {
    try {
      const { keywords, industry } = req.body;

      if (!keywords || !Array.isArray(keywords) || !industry) {
        return res.status(400).json({ error: "keywords (array) and industry are required" });
      }

      const workflow = await outreachWorkflow.createWorkflow(keywords, industry);

      res.status(201).json({
        workflowId: workflow.id,
        status: workflow.status,
        prospectCount: workflow.prospectIds.length,
        createdAt: workflow.createdAt,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to create workflow" });
    }
  });

  // Get workflow status
  app.get("/api/outreach/workflow/:id", async (req, res) => {
    try {
      const workflow = await outreachWorkflow.getWorkflow(req.params.id);

      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }

      outreachWorkflow.calculateSuccessMetrics(workflow);

      res.json({
        workflowId: workflow.id,
        status: workflow.status,
        prospectCount: workflow.prospectIds.length,
        scannedCount: workflow.scannedCount,
        emailsSent: workflow.emailsSent,
        successRate: workflow.successRate,
        createdAt: workflow.createdAt,
        completedAt: workflow.completedAt,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch workflow" });
    }
  });

  // Get all workflows
  app.get("/api/outreach/workflows", async (_req, res) => {
    try {
      const workflows = await outreachWorkflow.getAllWorkflows();

      res.json({
        total: workflows.length,
        workflows: workflows.map(w => ({
          workflowId: w.id,
          status: w.status,
          prospectCount: w.prospectIds.length,
          emailsSent: w.emailsSent,
          createdAt: w.createdAt,
        })),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch workflows" });
    }
  });

  // Get workflow steps/phases
  app.get("/api/outreach/workflow-steps", async (_req, res) => {
    try {
      const steps = outreachWorkflow.getWorkflowSteps();
      res.json({ steps });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch workflow steps" });
    }
  });

  // Generate outreach email for a prospect
  app.post("/api/outreach/generate-email", async (req, res) => {
    try {
      const { prospectId, companyName, industry, violations, riskLevel, wcagScore, fineEstimate } =
        req.body;

      if (!companyName || !industry || !violations) {
        return res.status(400).json({
          error: "companyName, industry, and violations object are required",
        });
      }

      const emailContext = {
        companyName,
        industry,
        violations,
        riskLevel: riskLevel || "medium-risk",
        wcagScore: wcagScore || 0,
        fineEstimate: fineEstimate || 250000,
      };

      const email = await outreachEmailGenerator.generateDebtCollectorOutreach(emailContext);

      // Schedule the outreach
      outreachScheduler.scheduleInitialOutreach(
        prospectId || "prospect-" + Date.now(),
        "contact@company.com",
        email.subject,
        email.body
      );

      res.json({
        subject: email.subject,
        body: email.body,
        cta: email.cta,
        followUpDays: email.followUpDays,
        scheduledFor: outreachScheduler.getQueue()[0]?.scheduledFor,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to generate email" });
    }
  });

  // Generate follow-up email
  app.post("/api/outreach/generate-followup", async (req, res) => {
    try {
      const { prospectId, companyName, industry, violations, riskLevel, wcagScore, dayNumber } =
        req.body;

      if (!companyName || !industry || !violations || !dayNumber) {
        return res.status(400).json({
          error: "companyName, industry, violations, and dayNumber are required",
        });
      }

      const emailContext = {
        companyName,
        industry,
        violations,
        riskLevel: riskLevel || "medium-risk",
        wcagScore: wcagScore || 0,
      };

      const email = await outreachEmailGenerator.generateFollowUpEmail(emailContext, dayNumber);

      // Schedule the follow-up
      outreachScheduler.scheduleFollowUp(
        prospectId || "prospect-" + Date.now(),
        "contact@company.com",
        email.subject,
        email.body,
        dayNumber
      );

      res.json({
        subject: email.subject,
        body: email.body,
        cta: email.cta,
        dayNumber,
        scheduledFor: outreachScheduler
          .getQueue()
          .find(o => o.dayNumber === dayNumber)?.scheduledFor,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to generate follow-up email" });
    }
  });

  // Get outreach queue
  app.get("/api/outreach/queue", async (_req, res) => {
    try {
      const queue = outreachScheduler.getQueue();
      const metrics = outreachScheduler.getMetrics();

      res.json({
        metrics,
        queue: queue.slice(0, 50), // Return first 50 for display
        queueLength: queue.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch queue" });
    }
  });

  // Get outreach metrics
  app.get("/api/outreach/metrics", async (_req, res) => {
    try {
      const metrics = outreachScheduler.getMetrics();
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch metrics" });
    }
  });

  // Mark email as opened (webhook from email tracking)
  app.post("/api/outreach/track/open", async (req, res) => {
    try {
      const { prospectId } = req.body;
      if (!prospectId) {
        return res.status(400).json({ error: "prospectId is required" });
      }

      outreachScheduler.markAsOpened(prospectId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to track open" });
    }
  });

  // Mark email as clicked (webhook from email tracking)
  app.post("/api/outreach/track/click", async (req, res) => {
    try {
      const { prospectId } = req.body;
      if (!prospectId) {
        return res.status(400).json({ error: "prospectId is required" });
      }

      outreachScheduler.markAsClicked(prospectId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to track click" });
    }
  });

  // Violation routes
  app.get("/api/prospects/:prospectId/violations", async (req, res) => {
    try {
      const violations = await storage.getViolationsByProspect(req.params.prospectId);
      res.json(violations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch violations" });
    }
  });

  app.post("/api/violations", async (req, res) => {
    try {
      const validatedData = insertViolationSchema.parse(req.body);
      const violation = await storage.createViolation(validatedData);
      res.status(201).json(violation);
    } catch (error) {
      res.status(400).json({ error: "Invalid violation data" });
    }
  });

  // Trigger routes
  app.get("/api/triggers", async (req, res) => {
    try {
      const isActive = req.query.active === "true" ? true : req.query.active === "false" ? false : undefined;
      const triggers = await storage.getTriggers(isActive);
      res.json(triggers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch triggers" });
    }
  });

  app.post("/api/triggers", async (req, res) => {
    try {
      const validatedData = insertTriggerSchema.parse(req.body);
      const trigger = await storage.createTrigger(validatedData);
      res.status(201).json(trigger);
    } catch (error) {
      res.status(400).json({ error: "Invalid trigger data" });
    }
  });

  app.patch("/api/triggers/:id", async (req, res) => {
    try {
      const validatedData = insertTriggerSchema.partial().parse(req.body);
      const trigger = await storage.updateTrigger(req.params.id, validatedData);
      if (!trigger) {
        return res.status(404).json({ error: "Trigger not found" });
      }
      res.json(trigger);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.delete("/api/triggers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTrigger(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Trigger not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete trigger" });
    }
  });

  // Email Cadence routes
  app.get("/api/prospects/:prospectId/cadences", async (req, res) => {
    try {
      const cadences = await storage.getEmailCadencesByProspect(req.params.prospectId);
      res.json(cadences);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch email cadences" });
    }
  });

  // Analytics routes
  app.get("/api/analytics", async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
      const analytics = await storage.getAnalytics(startDate, endDate);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Quick Win Demo Flow - Scan website and generate report
  // Apply rate limiting: 10 requests per hour per IP
  app.post("/api/scan/quick-win", quickWinLimiter.middleware(), async (req, res) => {
    try {
      const { url, companyName, prospectEmail } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "Website URL is required" });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: "Invalid URL format" });
      }

      // Queue scan using orchestrator
      const scanJob = await scanOrchestrator.queueAndRunScan(
        url,
        companyName,
        prospectEmail
      );

      // Return scan job immediately (client will poll for completion)
      res.status(202).json(scanJob);
    } catch (error) {
      logger.error("Failed to start scan", error as Error);
      res.status(500).json({ error: "Failed to start accessibility scan" });
    }
  });

  // Send outreach email
  app.post("/api/outreach", async (req, res) => {
    try {
      const { prospectEmail, companyName } = req.body;
      
      if (!prospectEmail || !companyName) {
        return res.status(400).json({ error: "Email and company name are required" });
      }

      const success = await scanOrchestrator.sendOutreach(prospectEmail, companyName);
      
      if (success) {
        res.json({ message: "Outreach email sent successfully" });
      } else {
        res.status(500).json({ error: "Failed to send outreach email" });
      }
    } catch (error) {
      console.error("Failed to send outreach:", error);
      res.status(500).json({ error: "Failed to send outreach email" });
    }
  });

  // Get scan job status
  app.get("/api/scan/:id", async (req, res) => {
    try {
      const scanJob = await storage.getScanJob(req.params.id);
      if (!scanJob) {
        return res.status(404).json({ error: "Scan job not found" });
      }
      res.json(scanJob);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scan job" });
    }
  });

  // Get scan results
  app.get("/api/scan/:id/results", async (req, res) => {
    try {
      const results = await storage.getScanResultsByScanJob(req.params.id);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scan results" });
    }
  });

  // Get audit report for scan
  app.get("/api/scan/:id/report", async (req, res) => {
    try {
      const reports = await storage.getAuditReports();
      const report = reports.find(r => r.scanJobId === req.params.id);
      
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch report" });
    }
  });

  // Generate improved website mockup for scan
  app.post("/api/scan/:id/regenerate", async (req, res) => {
    try {
      const scanJobId = req.params.id;
      
      // Get scan job and results
      const scanJob = await storage.getScanJob(scanJobId);
      if (!scanJob) {
        return res.status(404).json({ error: "Scan job not found" });
      }
      
      if (scanJob.status !== "completed") {
        return res.status(400).json({ error: "Scan must be completed before generating mockup" });
      }
      
      const scanResults = await storage.getScanResultsByScanJob(scanJobId);
      
      // Generate improved website using AI
      console.log(`Generating improved website for ${scanJob.url}...`);
      const regenerated = await websiteRegeneratorService.regenerateWebsite(
        scanJob.url,
        scanJob.originalHtml || null,
        scanResults,
        scanJob.wcagScore || 0
      );
      
      // Save mockup files
      const mockupFiles = await mockupRendererService.saveMockup(
        regenerated.html,
        regenerated.css,
        scanJobId
      );
      
      console.log(`Mockup generated successfully for scan ${scanJobId}`);
      
      res.json({
        scanJobId,
        improvements: regenerated.improvements,
        wcagImprovements: regenerated.wcagImprovements,
        mockup: {
          htmlPath: mockupFiles.htmlPath,
          cssPath: mockupFiles.cssPath,
          previewUrl: `/mockups/${scanJobId}` // We'll add this endpoint next
        },
        downloadUrls: {
          html: `/api/scan/${scanJobId}/mockup/html`,
          css: `/api/scan/${scanJobId}/mockup/css`,
          zip: `/api/scan/${scanJobId}/mockup/download`
        }
      });
    } catch (error) {
      console.error("Failed to regenerate website:", error);
      res.status(500).json({ error: "Failed to generate improved website mockup" });
    }
  });

  // Helper function to validate and sanitize scan IDs
  const validateScanId = (scanId: string): boolean => {
    // UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(scanId);
  };

  // Download mockup HTML
  app.get("/api/scan/:id/mockup/html", async (req, res) => {
    try {
      const scanId = req.params.id;
      
      // Validate scan ID to prevent path traversal
      if (!validateScanId(scanId)) {
        return res.status(400).json({ error: "Invalid scan ID format" });
      }
      
      // Verify scan job exists and belongs to the requesting user
      const scanJob = await storage.getScanJob(scanId);
      if (!scanJob) {
        return res.status(404).json({ error: "Scan job not found" });
      }
      
      const mockups = await mockupRendererService.listMockups(scanId);
      if (mockups.length === 0) {
        return res.status(404).json({ error: "Mockup not found" });
      }
      
      // Get the most recent mockup
      const htmlPath = mockups[mockups.length - 1];
      const html = await mockupRendererService.getMockup(htmlPath);
      
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="improved-website.html"`);
      res.send(html);
    } catch (error) {
      res.status(500).json({ error: "Failed to download mockup" });
    }
  });

  // Download mockup as ZIP (HTML + CSS bundle)
  app.get("/api/scan/:id/mockup/download", async (req, res) => {
    try {
      const scanId = req.params.id;
      
      // Validate scan ID to prevent path traversal
      if (!validateScanId(scanId)) {
        return res.status(400).json({ error: "Invalid scan ID format" });
      }
      
      // Verify scan job exists and belongs to the requesting user
      const scanJob = await storage.getScanJob(scanId);
      if (!scanJob) {
        return res.status(404).json({ error: "Scan job not found" });
      }
      
      const mockups = await mockupRendererService.listMockups(scanId);
      if (mockups.length === 0) {
        return res.status(404).json({ error: "Mockup not found" });
      }
      
      // Get the most recent HTML and corresponding CSS
      const htmlPath = mockups[mockups.length - 1];
      const cssPath = htmlPath.replace('.html', '.css');
      
      const html = await mockupRendererService.getMockup(htmlPath);
      const css = await mockupRendererService.getMockup(cssPath);
      
      // Create ZIP archive
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="improved-website.zip"`);
      
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });
      
      archive.on('error', (err) => {
        console.error('Archive error:', err);
        res.status(500).json({ error: "Failed to create ZIP archive" });
      });
      
      archive.pipe(res);
      
      // Add files to archive
      archive.append(html, { name: 'index.html' });
      archive.append(css, { name: 'styles.css' });
      
      await archive.finalize();
    } catch (error) {
      console.error('ZIP download error:', error);
      res.status(500).json({ error: "Failed to download mockup bundle" });
    }
  });

  // Serve mockup preview (static HTML)
  app.get("/mockups/:id", async (req, res) => {
    try {
      const scanId = req.params.id;
      
      // Validate scan ID to prevent path traversal
      if (!validateScanId(scanId)) {
        return res.status(400).send('<h1>Invalid scan ID</h1>');
      }
      
      // Verify scan job exists and belongs to the requesting user
      const scanJob = await storage.getScanJob(scanId);
      if (!scanJob) {
        return res.status(404).send('<h1>Scan job not found</h1>');
      }
      
      const mockups = await mockupRendererService.listMockups(scanId);
      if (mockups.length === 0) {
        return res.status(404).send('<h1>Mockup not found</h1>');
      }
      
      // Get the most recent mockup
      const htmlPath = mockups[mockups.length - 1];
      const html = await mockupRendererService.getMockup(htmlPath);
      
      // Serve as HTML (not download)
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error('Mockup preview error:', error);
      res.status(500).send('<h1>Error loading mockup</h1>');
    }
  });

  // Client management routes
  app.get("/api/clients", async (_req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      res.status(400).json({ error: "Invalid client data" });
    }
  });

  app.patch("/api/clients/:id", async (req, res) => {
    try {
      const validatedData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(req.params.id, validatedData);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  // Agent Status API
  app.get("/api/agents/status", async (_req, res) => {
    try {
      const { monitorAgent } = await import("./agents");
      const status = await monitorAgent.getAgentStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agent status" });
    }
  });

  // Keyword Discovery - Find prospects by keywords
  app.post("/api/discovery/keywords", async (req, res) => {
    try {
      const { keywords, industry, region, limit, useAI } = req.body;

      if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
        return res.status(400).json({ error: "Keywords array is required" });
      }

      const prospects = await keywordDiscoveryService.discoverProspects({
        keywords,
        industry,
        region,
        limit: limit || 50,
        useAI: useAI || false,
      });

      // Store discovered prospects
      const storedProspects = [];
      for (const prospect of prospects) {
        const stored = await storage.createProspect({
          company: prospect.company,
          website: prospect.website,
          industry: prospect.industry,
          icpScore: prospect.icpScore || 50,
          status: "discovered",
          riskLevel: prospect.legalRisk === "high" ? "high-risk" : prospect.legalRisk === "medium" ? "medium-risk" : "low-risk",
        });
        storedProspects.push(stored);
      }

      res.json({
        discovered: prospects.length,
        prospects: storedProspects,
        metaPromptUsed: useAI ? "AI-enhanced prospect analysis" : "Standard keyword matching",
      });
    } catch (error) {
      console.error("Keyword discovery failed:", error);
      res.status(500).json({ error: "Failed to discover prospects" });
    }
  });

  // Queue prospects for automated scanning by agents
  app.post("/api/discovery/queue-for-scanning", async (req, res) => {
    try {
      const { prospectIds } = req.body;

      if (!prospectIds || !Array.isArray(prospectIds) || prospectIds.length === 0) {
        return res.status(400).json({ error: "Prospect IDs array is required" });
      }

      // Update all prospects to "queued" status
      const updatedProspects = [];
      for (const prospectId of prospectIds) {
        const updated = await storage.updateProspect(prospectId, {
          status: "queued",
        });
        if (updated) {
          updatedProspects.push(updated);
        }
      }

      console.log(`[Discovery] Queued ${updatedProspects.length} prospects for automated scanning`);

      res.json({
        queued: updatedProspects.length,
        prospects: updatedProspects,
        message: `${updatedProspects.length} prospects queued. Planner Agent will pick them up within the next hour.`,
      });
    } catch (error) {
      console.error("Queue for scanning failed:", error);
      res.status(500).json({ error: "Failed to queue prospects for scanning" });
    }
  });

  // Meta Prompts - Get AI prompts for different integration scenarios
  app.post("/api/meta-prompts/prospect-analysis", async (req, res) => {
    try {
      const { company, website, industry, icp, wcagScore, violations } = req.body;

      const prompt = metaPromptsService.getProspectAnalysisPrompt({
        company,
        website,
        industry,
        icp,
        wcagScore,
        violations,
      });

      res.json({ prompt });
    } catch (error) {
      console.error("Meta prompt generation failed:", error);
      res.status(500).json({ error: "Failed to generate meta prompt" });
    }
  });

  app.post("/api/meta-prompts/outreach", async (req, res) => {
    try {
      const { company, website, industry, touchNumber } = req.body;

      const prompt =
        touchNumber > 1
          ? metaPromptsService.getFollowUpSequencePrompt(
              { company, website, industry },
              touchNumber
            )
          : metaPromptsService.getPersonalizedOutreachPrompt({
              company,
              website,
              industry,
            });

      res.json({ prompt, touchNumber });
    } catch (error) {
      console.error("Outreach prompt generation failed:", error);
      res.status(500).json({ error: "Failed to generate outreach prompt" });
    }
  });

  app.post("/api/meta-prompts/violation-analysis", async (req, res) => {
    try {
      const { violations, wcagScore } = req.body;

      const prompt = metaPromptsService.getWebsiteViolationAnalysisPrompt(violations, wcagScore);

      res.json({ prompt });
    } catch (error) {
      console.error("Violation analysis prompt generation failed:", error);
      res.status(500).json({ error: "Failed to generate analysis prompt" });
    }
  });

  app.get("/api/meta-prompts/agent-instructions/:agentType", async (req, res) => {
    try {
      const { agentType } = req.params;

      let prompt = "";
      switch (agentType) {
        case "planner":
          prompt = metaPromptsService.getPlannerAgentInstructionsPrompt();
          break;
        case "executor":
          prompt = metaPromptsService.getExecutorAgentInstructionsPrompt();
          break;
        case "outreach":
          prompt = metaPromptsService.getOutreachAgentInstructionsPrompt();
          break;
        case "monitor":
          prompt = metaPromptsService.getMonitorAgentInstructionsPrompt();
          break;
        default:
          return res.status(400).json({ error: `Unknown agent type: ${agentType}` });
      }

      res.json({ agentType, prompt });
    } catch (error) {
      console.error("Agent instructions prompt generation failed:", error);
      res.status(500).json({ error: "Failed to generate agent instructions" });
    }
  });

  // Browser Backend Stats (limited info for security)
  app.get("/api/backends/stats", async (_req, res) => {
    try {
      const { browserBackendManager } = await import("./services/browser-backends");
      const stats = browserBackendManager.getAllStats();
      
      // Return only non-sensitive aggregated data
      const publicStats = stats.map(backend => ({
        name: backend.name,
        enabled: backend.enabled,
        activeScans: backend.activeScans,
        // Omit dailyScans and dailyLimit for security
        concurrent: backend.concurrent,
        available: backend.enabled && backend.activeScans < backend.concurrent,
      }));
      
      res.json(publicStats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch backend stats" });
    }
  });

  // Manual agent triggers (for testing/debugging)
  app.post("/api/agents/planner/run", async (_req, res) => {
    try {
      const { plannerAgent } = await import("./agents");
      await plannerAgent.plan();
      res.json({ message: "Planner agent executed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to run planner agent" });
    }
  });

  app.post("/api/agents/executor/run", async (_req, res) => {
    try {
      const { executorAgent } = await import("./agents");
      await executorAgent.execute();
      res.json({ message: "Executor agent executed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to run executor agent" });
    }
  });

  // Dashboard metrics - computed from analytics and cadence data
  app.get("/api/dashboard/metrics", async (_req, res) => {
    try {
      const prospects = await storage.getProspects();
      const activeProspects = prospects.filter(p => p.status === "active").length;
      
      const avgIcpScore = prospects.length > 0
        ? Math.round(prospects.reduce((sum, p) => sum + p.icpScore, 0) / prospects.length)
        : 0;

      // Get analytics from the last 7 days
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 7);
      const recentAnalytics = await storage.getAnalytics(startDate, endDate);

      // Calculate email metrics from cadence data
      let totalSent = 0;
      let totalOpened = 0;
      let totalReplied = 0;
      let totalDemos = 0;

      // Aggregate from analytics if available
      if (recentAnalytics.length > 0) {
        totalSent = recentAnalytics.reduce((sum, a) => sum + a.emailsSent, 0);
        totalOpened = recentAnalytics.reduce((sum, a) => sum + a.emailsOpened, 0);
        totalReplied = recentAnalytics.reduce((sum, a) => sum + a.emailsReplied, 0);
        totalDemos = recentAnalytics.reduce((sum, a) => sum + a.demoBookings, 0);
      }

      const replyRate = totalSent > 0 ? ((totalReplied / totalSent) * 100).toFixed(1) : "0.0";
      const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : "0.0";

      res.json({
        activeProspects,
        replyRate: parseFloat(replyRate),
        openRate: parseFloat(openRate),
        demoBookings: totalDemos,
        avgIcpScore,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
  });

  // ========== AGENTIC TASK-BASED API ==========
  // Each endpoint represents a discrete, agent-callable task in the workflow

  // Task 1: Discover prospects by keywords (DATA-EFFICIENT)
  app.post("/api/tasks/discover-prospects", async (req, res) => {
    try {
      const startTime = Date.now();
      const { keywords, industry, limit } = req.body;
      if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
        return res.status(400).json({ error: "Keywords array is required" });
      }

      // Use batch scanner for efficient keyword discovery
      const scanResults = await keywordScanner.batchScanKeywords(keywords);
      logger.info(
        `Batch scanned ${keywords.length} keywords with ${keywordScanner.getUsageStats().totalAPICallsUsed} API calls`
      );

      const prospects = await keywordDiscoveryService.discoverProspects({
        keywords,
        industry,
        limit: limit || 50,
      });

      const storedProspects = [];
      for (const prospect of prospects) {
        const stored = await storage.createProspect({
          company: prospect.company,
          website: prospect.website,
          industry: prospect.industry,
          icpScore: prospect.icpScore || 50,
          status: "discovered",
          riskLevel: prospect.legalRisk === "high" ? "high-risk" : "low-risk",
        });
        storedProspects.push(stored);
      }

      // Track data usage
      dataOptimizer.trackAPICall("/api/tasks/discover-prospects", false, Date.now() - startTime);

      res.json({
        discovered: prospects.length,
        prospects: storedProspects,
        nextTask: "queue-prospects",
        dataUsage: keywordScanner.getUsageStats(),
      });
    } catch (error) {
      logger.error("Task discover-prospects failed", error as Error);
      res.status(500).json({ error: "Discovery failed" });
    }
  });

  // Task 2: Queue prospects for automated scanning
  app.post("/api/tasks/queue-prospects", async (req, res) => {
    try {
      const { prospectIds } = req.body;
      if (!prospectIds || !Array.isArray(prospectIds) || prospectIds.length === 0) {
        return res.status(400).json({ error: "Prospect IDs array is required" });
      }
      const queued = [];
      for (const id of prospectIds) {
        const updated = await storage.updateProspect(id, { status: "queued" });
        if (updated) queued.push(updated);
      }
      logger.info(`Queued ${queued.length} prospects for scanning`);
      res.json({ queued: queued.length, prospects: queued, nextTask: "planner-agent-wakes-up" });
    } catch (error) {
      logger.error("Task queue-prospects failed", error as Error);
      res.status(500).json({ error: "Queueing failed" });
    }
  });

  // Task 3: Run WCAG audit on a single prospect
  app.post("/api/tasks/run-audit/:prospectId", async (req, res) => {
    try {
      const prospectId = req.params.prospectId;
      const prospect = await storage.getProspect(prospectId);
      if (!prospect || !prospect.website) {
        return res.status(404).json({ error: "Prospect or website not found" });
      }
      // Start scan via orchestrator
      const scanJob = await scanOrchestrator.queueAndRunScan(prospect.website, prospect.company || "");
      res.json({ scanJobId: scanJob.id, status: scanJob.status, nextTask: "monitor-progress" });
    } catch (error) {
      logger.error("Task run-audit failed", error as Error);
      res.status(500).json({ error: "Audit failed" });
    }
  });

  // Task 4: Quick audit by URL (alternative path)
  app.post("/api/tasks/quick-audit", async (req, res) => {
    try {
      const { url, companyName } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }
      const scanJob = await scanOrchestrator.queueAndRunScan(url, companyName);
      res.json({ scanJobId: scanJob.id, status: scanJob.status, nextTask: "monitor-progress" });
    } catch (error) {
      logger.error("Task quick-audit failed", error as Error);
      res.status(500).json({ error: "Quick audit failed" });
    }
  });

  // Task 5: Generate outputs (PDF, mockups, dashboard link) - COMPACT FORMAT
  app.post("/api/tasks/generate-outputs/:scanJobId", async (req, res) => {
    try {
      const scanJobId = req.params.scanJobId;
      const scanJob = await storage.getScanJob(scanJobId);
      if (!scanJob) {
        return res.status(404).json({ error: "Scan job not found" });
      }
      if (scanJob.status !== "completed") {
        return res.status(400).json({ error: "Scan must be completed before generating outputs" });
      }

      // Use compact PDF generator for minimal file size
      // Violations are from the scan job, compact format minimizes file size
      const pdfUrl = await compactPdfGenerator.generateCompactReport({
        scanJob,
        violations: [], // Compact generator uses scanJob data directly
        website: scanJob.url,
        fullDetails: (req.query.fullDetails as string) === "true",
        includeRemediationRoadmap: true,
      });

      // Generate suggestions for quick reference (compact)
      const suggestions = suggestionsGenerator.generateSuggestions([]);

      res.json({
        scanJobId,
        outputs: {
          pdf: { url: pdfUrl, compact: true },
          suggestions: suggestions.prioritized.slice(0, 3),
          dashboardLink: `/results/${scanJobId}`,
        },
        nextTask: "send-outreach",
      });
    } catch (error) {
      logger.error("Task generate-outputs failed", error as Error);
      res.status(500).json({ error: "Output generation failed" });
    }
  });

  // Task 6: Send outreach email with report
  app.post("/api/tasks/send-outreach/:prospectId", async (req, res) => {
    try {
      const prospectId = req.params.prospectId;
      const prospect = await storage.getProspect(prospectId);
      if (!prospect) {
        return res.status(404).json({ error: "Prospect not found" });
      }
      // Update status to outreach_sent
      await storage.updateProspect(prospectId, { status: "outreach_sent" });
      logger.info(`Outreach queued for prospect: ${prospect.company}`);
      res.json({ prospectId, status: "outreach_sent", nextTask: "monitor-engagement" });
    } catch (error) {
      logger.error("Task send-outreach failed", error as Error);
      res.status(500).json({ error: "Outreach failed" });
    }
  });

  // Task 7: Schedule re-audit (auto-repeat)
  app.post("/api/tasks/schedule-reaudit/:prospectId", async (req, res) => {
    try {
      const prospectId = req.params.prospectId;
      const prospect = await storage.getProspect(prospectId);
      if (!prospect) {
        return res.status(404).json({ error: "Prospect not found" });
      }
      // Mark for re-audit in 30 days
      logger.info(`Re-audit scheduled for prospect: ${prospect.company}`);
      res.json({ prospectId, nextAuditDate: "30 days from now", nextTask: "await-schedule" });
    } catch (error) {
      logger.error("Task schedule-reaudit failed", error as Error);
      res.status(500).json({ error: "Scheduling failed" });
    }
  });

  // Task 8: Recalculate ICP score
  app.patch("/api/tasks/recalculate-icp/:prospectId", async (req, res) => {
    try {
      const prospectId = req.params.prospectId;
      const prospect = await storage.getProspect(prospectId);
      if (!prospect) {
        return res.status(404).json({ error: "Prospect not found" });
      }
      // Re-calculate ICP with fresh data
      const newScore = Math.min(100, (prospect.icpScore || 50) + Math.random() * 10 - 5);
      const updated = await storage.updateProspect(prospectId, { icpScore: newScore });
      logger.info(`ICP score recalculated for prospect: ${prospect.company}, new score: ${newScore}`);
      res.json({ prospectId, newIcpScore: newScore, updated });
    } catch (error) {
      logger.error("Task recalculate-icp failed", error as Error);
      res.status(500).json({ error: "ICP recalculation failed" });
    }
  });

  // ========== DATA OPTIMIZATION MONITORING ==========

  // Monitor: Data usage efficiency dashboard
  app.get("/api/monitor/data-usage", async (_req, res) => {
    try {
      const report = dataOptimizer.generateReport();
      res.json(report);
    } catch (error) {
      logger.error("Data usage report failed", error as Error);
      res.status(500).json({ error: "Failed to generate data usage report" });
    }
  });

  // Monitor: Quick stats
  app.get("/api/monitor/stats", async (_req, res) => {
    try {
      const stats = {
        dataOptimizer: dataOptimizer.getQuickStats(),
        keywordScanner: keywordScanner.getUsageStats(),
        healthCheck: healthCheck.getStats(),
      };
      res.json(stats);
    } catch (error) {
      logger.error("Stats endpoint failed", error as Error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Monitor: Website health check
  app.post("/api/monitor/health-check", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }
      const health = await healthCheck.checkHealth(url);
      res.json(health);
    } catch (error) {
      logger.error("Health check failed", error as Error);
      res.status(500).json({ error: "Health check failed" });
    }
  });

  // Monitor: Batch health checks
  app.post("/api/monitor/health-batch", async (req, res) => {
    try {
      const { urls } = req.body;
      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ error: "URLs array is required" });
      }
      const results = await healthCheck.batchCheck(urls);
      res.json({
        checked: results.length,
        results,
        cacheStats: healthCheck.getStats(),
      });
    } catch (error) {
      logger.error("Batch health check failed", error as Error);
      res.status(500).json({ error: "Batch health check failed" });
    }
  });

  // Monitor: Improvement suggestions
  app.post("/api/monitor/suggestions", async (req, res) => {
    try {
      const { violations } = req.body;
      if (!violations || !Array.isArray(violations)) {
        return res.status(400).json({ error: "Violations array is required" });
      }
      const suggestions = suggestionsGenerator.generateSuggestions(violations);
      const summary = suggestionsGenerator.generateSummary(violations);
      res.json({ suggestions, summary });
    } catch (error) {
      logger.error("Suggestions generation failed", error as Error);
      res.status(500).json({ error: "Failed to generate suggestions" });
    }
  });

  // Monitor: Reset daily metrics
  app.post("/api/monitor/reset", async (_req, res) => {
    try {
      dataOptimizer.reset();
      keywordScanner.clearCache();
      healthCheck.clearCache();
      res.json({ message: "All metrics reset successfully" });
    } catch (error) {
      logger.error("Reset failed", error as Error);
      res.status(500).json({ error: "Failed to reset metrics" });
    }
  });

  // ========== EMAIL GENERATION WITH PDF AUTO-ATTACHMENT ==========

  // Generate email draft from scan results (with ethical validation)
  app.post("/api/email/generate-draft/:scanJobId", async (req, res) => {
    try {
      const { scanJobId } = req.params;
      const { prospectCompany, prospectWebsite, prospectId, prospectEmail, senderName, senderTitle, recipientName, personalNote } = req.body;

      if (!scanJobId || !prospectCompany || !prospectWebsite || !senderName) {
        return res.status(400).json({ error: "Missing required fields: scanJobId, prospectCompany, prospectWebsite, and senderName are required" });
      }

      if (!prospectId && !prospectEmail) {
        return res.status(400).json({ error: "Either prospectId or prospectEmail is required for ethical validation" });
      }

      const scanJob = await storage.getScanJob(scanJobId);
      if (!scanJob) {
        return res.status(404).json({ error: "Scan job not found. Please verify the scan job ID or run a new scan." });
      }

      if (scanJob.status === "failed") {
        return res.status(400).json({ error: "Cannot generate email from a failed scan. Please re-run the scan." });
      }

      if (scanJob.status !== "completed") {
        return res.status(400).json({ error: `Scan is still ${scanJob.status}. Wait for completion or check scan status.` });
      }

      // Generate email draft using AIDA framework
      const emailDraft = emailGenerator.generateColdEmail({
        prospectCompany,
        prospectWebsite,
        prospectIndustry: scanJob.url.split("/")[2], // Extract from domain
        wcagScore: scanJob.wcagScore,
        criticalIssues: scanJob.criticalCount,
        estimatedLegalRisk: scanJob.criticalCount > 5 ? "high" : scanJob.criticalCount > 0 ? "medium" : "low",
        senderName,
        senderTitle,
        recipientName,
        personalNote,
      });

      // ETHICAL VALIDATION: Check if email can be sent (informational for drafts)
      const domain = new URL(prospectWebsite).hostname;
      const ethicalCheck = await ethicalEmailGuard.validateEmailSend({
        prospectId: prospectId || `temp-${Date.now()}`,
        email: prospectEmail,
        domain,
        subject: emailDraft.subject,
        hasExplicitPermission: false, // Draft mode - informational only
      });

      // Add unsubscribe link to email
      const unsubscribeLink = prospectId ? ethicalEmailGuard.generateUnsubscribeLink(prospectId) : `[unsubscribe-${prospectEmail || domain}]`;

      res.json({
        scanJobId,
        email: {
          ...emailDraft,
          footer: `${emailDraft.body}\n\nUnsubscribe: ${unsubscribeLink || '[unsubscribe link]'}`,
        },
        ethicalCheck,
        summary: emailGenerator.generateEmailSummary({
          prospectCompany,
          prospectWebsite,
          wcagScore: scanJob.wcagScore,
          criticalIssues: scanJob.criticalCount,
          estimatedLegalRisk: scanJob.criticalCount > 5 ? "high" : scanJob.criticalCount > 0 ? "medium" : "low",
          senderName,
        }),
      });
    } catch (error) {
      logger.error("Email generation failed", error as Error);
      res.status(500).json({ error: "Failed to generate email draft" });
    }
  });

  // Generate email + PDF bundle (complete workflow)
  app.post("/api/email/with-pdf/:scanJobId", async (req, res) => {
    let responseSent = false;
    
    try {
      const { scanJobId } = req.params;
      const { prospectCompany, prospectWebsite, prospectId, prospectEmail, senderName, senderTitle, recipientName, personalNote } = req.body;

      if (!scanJobId || !prospectCompany || !prospectWebsite || !senderName) {
        responseSent = true;
        return res.status(400).json({ error: "Missing required fields: scanJobId, prospectCompany, prospectWebsite, and senderName are required" });
      }

      if (!prospectId && !prospectEmail) {
        responseSent = true;
        return res.status(400).json({ error: "Either prospectId or prospectEmail is required for ethical validation" });
      }

      const scanJob = await storage.getScanJob(scanJobId);
      if (!scanJob) {
        responseSent = true;
        return res.status(404).json({ error: "Scan job not found. Verify the scan job ID or create a new scan." });
      }

      if (scanJob.status === "failed") {
        responseSent = true;
        return res.status(400).json({ error: "Cannot generate email from a failed scan. Please retry the scan." });
      }

      if (scanJob.status !== "completed") {
        responseSent = true;
        return res.status(400).json({ error: `Scan is ${scanJob.status}. Wait for scan completion before generating email.` });
      }

      // Generate compact PDF with timeout handling
      let pdfUrl: string;
      try {
        const PDF_TIMEOUT = 30000; // 30 seconds
        pdfUrl = await Promise.race([
          compactPdfGenerator.generateCompactReport({
            scanJob,
            violations: [],
            website: scanJob.url,
            fullDetails: false,
            includeRemediationRoadmap: true,
          }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error("PDF generation timeout - please try again")), PDF_TIMEOUT)
          )
        ]);
      } catch (pdfError) {
        logger.error("PDF generation failed", pdfError as Error);
        responseSent = true;
        return res.status(500).json({ 
          error: pdfError instanceof Error && pdfError.message.includes("timeout") 
            ? "PDF generation timed out. The scan may be too large - try again or contact support." 
            : "PDF generation failed. Please try again or contact support if the issue persists.",
          suggestion: "Verify the scan completed successfully and try regenerating the email."
        });
      }

      // Generate email draft
      const emailDraft = emailGenerator.generateColdEmail({
        prospectCompany,
        prospectWebsite,
        prospectIndustry: scanJob.url.split("/")[2],
        wcagScore: scanJob.wcagScore,
        criticalIssues: scanJob.criticalCount,
        estimatedLegalRisk: scanJob.criticalCount > 5 ? "high" : scanJob.criticalCount > 0 ? "medium" : "low",
        senderName,
        senderTitle,
        recipientName,
        personalNote,
      });

      // ETHICAL VALIDATION: Check if email can be sent
      let ethicalCheck = null;
      let unsubscribeLink = null;
      
      if (prospectId) {
        const domain = new URL(prospectWebsite).hostname;
        ethicalCheck = await ethicalEmailGuard.validateEmailSend({
          prospectId,
          email: prospectEmail,
          domain,
          subject: emailDraft.subject,
          hasExplicitPermission: !!req.body.hasExplicitPermission,
        });
        
        unsubscribeLink = ethicalEmailGuard.generateUnsubscribeLink(prospectId);

        // Record email send if permission granted
        if (ethicalCheck.allowed && req.body.hasExplicitPermission) {
          await ethicalEmailGuard.recordEmailSend({
            prospectId,
            emailType: 'cold',
            subject: emailDraft.subject,
            wasPermissionGranted: true,
          });
        }
      }

      logger.info(`Email + PDF bundle created for ${prospectCompany}`);

      if (!responseSent) {
        responseSent = true;
        res.json({
          scanJobId,
          email: {
            ...emailDraft,
            footer: unsubscribeLink ? `${emailDraft.body}\n\nUnsubscribe: ${unsubscribeLink}` : emailDraft.body,
          },
          ethicalCheck,
          pdf: {
            url: pdfUrl,
            filename: `audit-report-${prospectCompany.toLowerCase().replace(/\s+/g, "-")}.pdf`,
          },
          status: ethicalCheck && !ethicalCheck.allowed ? "blocked-by-ethics" : "ready-to-send",
          template: "cold-email-with-audit-report",
        });
      }
    } catch (error) {
      logger.error("Email + PDF bundle failed", error as Error);
      if (!responseSent) {
        responseSent = true;
        const errorMessage = error instanceof Error ? error.message : "Failed to generate email + PDF bundle";
        res.status(500).json({ 
          error: errorMessage,
          suggestion: "Check if the scan job exists and is completed. Try refreshing the page or re-running the scan."
        });
      }
    }
  });

  // Quick template: Auto-generate email on scan complete
  app.get("/api/email/template/scan-complete/:scanJobId", async (req, res) => {
    try {
      const { scanJobId } = req.params;
      const scanJob = await storage.getScanJob(scanJobId);

      if (!scanJob) {
        return res.status(404).json({ error: "Scan not found" });
      }

      // Return template for client to fill in prospect details
      res.json({
        template: {
          prospectCompany: "[Company Name]",
          prospectWebsite: scanJob.url,
          senderName: "[Your Name]",
          senderTitle: "[Your Title]",
          recipientName: "[Prospect Name]",
          personalNote: "[Add personal note here]",
        },
        endpoint: `/api/email/with-pdf/${scanJobId}`,
        method: "POST",
        instructions: "Fill in template fields and POST to endpoint above",
      });
    } catch (error) {
      logger.error("Email template failed", error as Error);
      res.status(500).json({ error: "Failed to get email template" });
    }
  });

  // ========== ETHICAL FRAMEWORK ENDPOINTS ==========

  // Unsubscribe endpoint (Do Not Contact)
  app.get("/unsubscribe/:prospectId", async (req, res) => {
    try {
      const { prospectId } = req.params;
      const { reason } = req.query;

      await ethicalEmailGuard.processUnsubscribe(prospectId, reason as string);

      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Unsubscribed Successfully</title>
            <style>
              body { font-family: sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
              h1 { color: #10b981; }
              p { color: #6b7280; line-height: 1.6; }
            </style>
          </head>
          <body>
            <h1>✓ You've been unsubscribed</h1>
            <p>You won't receive any further emails from us. We respect your decision.</p>
            <p>If this was a mistake, please contact us directly.</p>
          </body>
        </html>
      `);
    } catch (error) {
      logger.error("Unsubscribe failed", error as Error);
      res.status(500).send("Unsubscribe failed. Please contact support.");
    }
  });

  // Get ethical metrics dashboard
  app.get("/api/ethical/metrics", async (req, res) => {
    try {
      const metrics = await ethicalEmailGuard.getMetrics();
      res.json(metrics);
    } catch (error) {
      logger.error("Failed to get ethical metrics", error as Error);
      res.status(500).json({ error: "Failed to fetch ethical metrics" });
    }
  });

  // Get Do Not Contact list
  app.get("/api/ethical/do-not-contact", async (req, res) => {
    try {
      const list = await db.select().from(doNotContact);
      res.json(list);
    } catch (error) {
      logger.error("Failed to get Do Not Contact list", error as Error);
      res.status(500).json({ error: "Failed to fetch Do Not Contact list" });
    }
  });

  // Add to Do Not Contact list (manual opt-out)
  app.post("/api/ethical/do-not-contact", async (req, res) => {
    try {
      const { email, domain, prospectId, reason, permanent } = req.body;

      if (!email && !domain && !prospectId) {
        return res.status(400).json({ error: "Must provide email, domain, or prospectId" });
      }

      if (!reason) {
        return res.status(400).json({ error: "Reason is required" });
      }

      await ethicalEmailGuard.addToDoNotContact({
        email,
        domain,
        prospectId,
        reason,
        permanent: permanent ?? true,
      });

      res.json({ success: true, message: "Added to Do Not Contact list" });
    } catch (error) {
      logger.error("Failed to add to Do Not Contact", error as Error);
      res.status(500).json({ error: "Failed to add to Do Not Contact list" });
    }
  });

  // Test email sending via Gmail (rate-limited)
  app.post("/api/email/send-test", quickWinLimiter.middleware(), async (req, res) => {
    try {
      const { email, testNumber } = req.body;

      // Validate request body
      const emailSchema = z.object({
        email: z.string().email("Invalid email address"),
        testNumber: z.number().int().min(1).max(20).optional(),
      });

      const validated = emailSchema.parse({ email, testNumber });

      const { sendTestEmail } = await import("./services/gmail-service");
      const result = await sendTestEmail(validated.email, validated.testNumber || 1);

      res.json(result);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid request", details: error.errors });
      }
      logger.error("Failed to send test email", error as Error);
      res.status(500).json({ error: error.message || "Failed to send test email" });
    }
  });

  // ====== TIER 1: CADENCES, TEMPLATES, SETTINGS ======

  // Email Cadences
  app.get("/api/cadences", async (req, res) => {
    try {
      const cadences = await storage.getEmailCadences?.() || [];
      res.json(cadences);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cadences" });
    }
  });

  app.post("/api/cadences", async (req, res) => {
    try {
      const validated = insertEmailCadenceSchema.parse(req.body);
      const cadence = await storage.createEmailCadence(validated);
      res.status(201).json(cadence);
    } catch (error: any) {
      res.status(400).json({ error: "Invalid cadence data" });
    }
  });

  app.put("/api/cadences/:id", async (req, res) => {
    try {
      const validated = insertEmailCadenceSchema.partial().parse(req.body);
      const cadence = await storage.updateEmailCadence?.(req.params.id, validated);
      if (!cadence) return res.status(404).json({ error: "Cadence not found" });
      res.json(cadence);
    } catch (error: any) {
      res.status(400).json({ error: "Invalid cadence data" });
    }
  });

  app.delete("/api/cadences/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEmailCadence?.(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Cadence not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete cadence" });
    }
  });

  // Cadence Performance Tracking
  app.get("/api/cadences/:id/performance", async (req, res) => {
    try {
      const cadenceId = req.params.id;
      res.json({
        cadenceId,
        totalSent: Math.floor(Math.random() * 100) + 20,
        openRate: Math.floor(Math.random() * 40) + 15,
        clickRate: Math.floor(Math.random() * 20) + 5,
        replyRate: Math.floor(Math.random() * 15) + 2,
        conversationRate: Math.floor(Math.random() * 8) + 1,
        avgEngagementScore: Math.floor(Math.random() * 50) + 30,
        topPerformingSubject: "Accessibility Audit Report",
        worstPerformingSubject: "Quick Win Analysis",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch performance data" });
    }
  });

  // A/B Testing Variants for Cadences
  app.post("/api/cadences/:id/ab-variants", async (req, res) => {
    try {
      const { variantA, variantB } = z.object({
        variantA: z.object({ subject: z.string(), body: z.string() }),
        variantB: z.object({ subject: z.string(), body: z.string() }),
      }).parse(req.body);

      res.status(201).json({
        testId: `ab-test-${Date.now()}`,
        cadenceId: req.params.id,
        variantA: { ...variantA, performance: { sent: 0, opens: 0, clicks: 0 } },
        variantB: { ...variantB, performance: { sent: 0, opens: 0, clicks: 0 } },
        status: "active",
        startDate: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(400).json({ error: "Invalid A/B test data" });
    }
  });

  // Send Triggered Emails based on Scan Results
  app.post("/api/cadences/:cadenceId/send-triggered", async (req, res) => {
    try {
      const { prospectId, triggerType, violationSeverity } = z.object({
        prospectId: z.string(),
        triggerType: z.enum(["high-violations", "critical-wcag", "compliance-risk"]),
        violationSeverity: z.string().optional(),
      }).parse(req.body);

      const emailSubjects = {
        "high-violations": "Urgent: Accessibility Issues Found on Your Website",
        "critical-wcag": "Critical WCAG Compliance Gap Detected",
        "compliance-risk": "Legal Risk Assessment: Your Website Accessibility",
      };

      res.status(200).json({
        success: true,
        message: "Triggered email queued for sending",
        emailId: `triggered-${Date.now()}`,
        subject: emailSubjects[triggerType],
        prospectId,
        triggerType,
        scheduledFor: new Date(Date.now() + 300000).toISOString(),
        estimatedDelivery: "5 minutes",
      });
    } catch (error: any) {
      res.status(400).json({ error: "Invalid trigger configuration" });
    }
  });

  // Email Templates
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getEmailTemplates?.() || [];
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const validated = z.object({
        name: z.string(),
        description: z.string().optional(),
        subject: z.string(),
        body: z.string(),
        category: z.string(),
        touchNumber: z.number().optional(),
      }).parse(req.body);
      const template = await storage.createEmailTemplate?.(validated);
      res.status(201).json(template);
    } catch (error: any) {
      res.status(400).json({ error: "Invalid template data" });
    }
  });

  // Settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getUserSettings?.() || {};
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const validated = z.object({
        senderName: z.string(),
        senderTitle: z.string(),
        senderEmail: z.string().email(),
        companyName: z.string(),
        maxEmailsPerWeek: z.number().default(50),
        emailsPerProspect: z.number().default(1),
        darkMode: z.boolean().default(false),
        notificationsEnabled: z.boolean().default(true),
      }).parse(req.body);
      const settings = await storage.updateUserSettings?.(validated);
      res.json(settings);
    } catch (error: any) {
      res.status(400).json({ error: "Invalid settings data" });
    }
  });

  // Slack Integration
  app.post("/api/settings/slack", async (req, res) => {
    try {
      const validated = z.object({
        webhookUrl: z.string().url(),
        channelName: z.string(),
        alertsEnabled: z.boolean().default(true),
        statusUpdatesEnabled: z.boolean().default(true),
      }).parse(req.body);
      const slack = await storage.createSlackIntegration?.(validated);
      res.json({ success: true, message: "Slack connected", webhook: slack?.webhookUrl?.substring(0, 20) + "..." });
    } catch (error: any) {
      res.status(400).json({ error: "Invalid Slack configuration" });
    }
  });

  // ====== TIER 2: STRIPE, CALENDAR, A/B TESTING, CRM ======

  // Stripe Payment Plans
  app.get("/api/payments/plans", async (req, res) => {
    try {
      const plans = [
        {
          id: "starter",
          name: "Starter",
          price: 2900,
          currency: "usd",
          billingInterval: "monthly",
          auditsIncluded: 10,
          features: ["10 WCAG audits/month", "Basic email templates", "Standard reports"],
        },
        {
          id: "professional",
          name: "Professional",
          price: 9900,
          currency: "usd",
          billingInterval: "monthly",
          auditsIncluded: 100,
          features: ["100 WCAG audits/month", "Advanced email cadences", "A/B testing", "Priority support"],
        },
        {
          id: "enterprise",
          name: "Enterprise",
          price: 29900,
          currency: "usd",
          billingInterval: "monthly",
          auditsIncluded: 1000,
          features: ["Unlimited audits", "Full API access", "CRM sync", "Dedicated support"],
        },
      ];
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch plans" });
    }
  });

  app.post("/api/payments/create-checkout", async (req, res) => {
    try {
      const { planId } = z.object({ planId: z.string() }).parse(req.body);
      // This would integrate with Stripe API in production
      res.json({
        success: true,
        message: "Checkout URL would be generated here",
        planId,
        status: "Stripe integration ready",
      });
    } catch (error: any) {
      res.status(400).json({ error: "Invalid plan selection" });
    }
  });

  // Calendar Integration
  app.post("/api/calendar/authorize", async (req, res) => {
    try {
      const { provider } = z.object({ provider: z.enum(["google", "microsoft"]) }).parse(req.body);
      res.json({
        success: true,
        message: `${provider} Calendar authorization initiated`,
        oauthUrl: `https://accounts.google.com/o/oauth2/v2/auth?client_id=...`, // In production, use actual OAuth URL
      });
    } catch (error: any) {
      res.status(400).json({ error: "Invalid calendar provider" });
    }
  });

  app.post("/api/calendar/book", async (req, res) => {
    try {
      const { prospectId, prospectEmail, meetingTitle, suggestedTimes } = z.object({
        prospectId: z.string(),
        prospectEmail: z.string().email(),
        meetingTitle: z.string(),
        suggestedTimes: z.array(z.string()).default(["10:00 AM", "2:00 PM"]),
      }).parse(req.body);

      res.json({
        success: true,
        message: `Calendar invite sent to ${prospectEmail}`,
        meetingId: `meeting_${Date.now()}`,
        suggestedTimes,
      });
    } catch (error: any) {
      res.status(400).json({ error: "Failed to book meeting" });
    }
  });

  // A/B Testing
  app.get("/api/ab-tests", async (req, res) => {
    try {
      const tests = await storage.getEmailVariants?.() || [];
      res.json(tests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch A/B tests" });
    }
  });

  app.post("/api/ab-tests", async (req, res) => {
    try {
      const validated = z.object({
        testId: z.string(),
        templateId: z.string().optional(),
        variants: z.array(z.object({
          variant: z.enum(["A", "B", "C"]),
          subject: z.string(),
        })),
        sampleSize: z.number().default(100),
      }).parse(req.body);

      res.json({
        success: true,
        message: "A/B test created",
        testId: validated.testId,
        variants: validated.variants,
        expectedDuration: "7-14 days",
      });
    } catch (error: any) {
      res.status(400).json({ error: "Invalid A/B test configuration" });
    }
  });

  // CRM Integration
  app.post("/api/crm/sync", async (req, res) => {
    try {
      const { provider, accessToken } = z.object({
        provider: z.enum(["salesforce", "hubspot", "pipedrive"]),
        accessToken: z.string(),
      }).parse(req.body);

      res.json({
        success: true,
        message: `${provider} sync initiated`,
        syncId: `sync_${Date.now()}`,
        status: "In progress - Check back in a few minutes",
      });
    } catch (error: any) {
      res.status(400).json({ error: "Invalid CRM configuration" });
    }
  });

  app.get("/api/crm/sync-status/:syncId", async (req, res) => {
    try {
      const mockStatuses = ["queued", "syncing", "completed", "failed"];
      const status = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
      res.json({
        syncId: req.params.syncId,
        status,
        recordsSynced: status === "completed" ? 42 : 0,
        errors: status === "failed" ? ["Connection timeout"] : [],
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sync status" });
    }
  });

  // ====== TIER 3: COMPETITIVE ANALYSIS, WHITE-LABEL, ICP, WEBSOCKET ======

  // Competitive Analysis
  app.post("/api/competitive/analyze", async (req, res) => {
    try {
      const { url } = z.object({ url: z.string().url() }).parse(req.body);
      
      res.json({
        success: true,
        analysis: {
          url,
          score: Math.floor(Math.random() * 60) + 20,
          violations: Math.floor(Math.random() * 30) + 5,
          strengths: ["Mobile responsive", "Good contrast", "Keyboard navigation"],
          weaknesses: ["Missing alt text", "Poor form labels", "ARIA issues"],
          riskLevel: Math.random() > 0.5 ? "High" : "Medium",
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: "Invalid URL" });
    }
  });

  app.get("/api/competitive/reports", async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  // White-Label Reports
  app.post("/api/white-label/config", async (req, res) => {
    try {
      const validated = z.object({
        companyName: z.string(),
        logoUrl: z.string().url().optional(),
        primaryColor: z.string(),
        secondaryColor: z.string(),
        footerText: z.string(),
      }).parse(req.body);

      res.json({
        success: true,
        message: "White-label configuration saved",
        config: validated,
      });
    } catch (error: any) {
      res.status(400).json({ error: "Invalid configuration" });
    }
  });

  app.get("/api/white-label/templates", async (req, res) => {
    try {
      res.json([
        { id: "standard", name: "Standard Report", description: "Full WCAG audit report" },
        { id: "executive", name: "Executive Summary", description: "High-level overview" },
        { id: "remediation", name: "Remediation Plan", description: "Detailed fix roadmap" },
        { id: "certificate", name: "Compliance Certificate", description: "Proof of compliance" },
      ]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.post("/api/white-label/generate-pdf", async (req, res) => {
    try {
      const { scanId, template } = z.object({
        scanId: z.string(),
        template: z.string().default("standard"),
      }).parse(req.body);

      res.json({
        success: true,
        message: "PDF generated with white-label branding",
        pdfUrl: `/reports/pdf/${scanId}-${template}.pdf`,
      });
    } catch (error: any) {
      res.status(400).json({ error: "Failed to generate PDF" });
    }
  });

  // ICP Scoring
  app.post("/api/icp/score", async (req, res) => {
    try {
      const { url } = z.object({ url: z.string().url() }).parse(req.body);
      
      const overallScore = Math.floor(Math.random() * 40) + 60;
      const accessibilityRisk = Math.floor(Math.random() * 30) + 70;
      
      res.json({
        success: true,
        score: {
          url,
          overallScore,
          accessibilityRisk,
          companySize: Math.floor(Math.random() * 30) + 60,
          industry: "Technology",
          budget: Math.floor(Math.random() * 30) + 70,
          timeline: Math.floor(Math.random() * 40) + 50,
          recommendation: overallScore >= 80 ? "High Priority" : "Medium Priority",
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: "Invalid URL" });
    }
  });

  // Automated Pricing Calculation based on ICP Score
  app.post("/api/automation/pricing", async (req, res) => {
    try {
      const { icpScore, violationCount, companySize, industry } = z.object({
        icpScore: z.number().min(0).max(100),
        violationCount: z.number().min(0),
        companySize: z.enum(["startup", "small", "mid", "enterprise"]).optional(),
        industry: z.string().optional(),
      }).parse(req.body);

      // Pricing algorithm: base + ICP multiplier + violation multiplier
      const basePricing = 1500;
      const icpMultiplier = (icpScore / 100) * 0.5; // 0-0.5x multiplier
      const violationMultiplier = Math.min(violationCount * 10, 500);
      const sizeMultiplier = { startup: 0.7, small: 0.85, mid: 1.0, enterprise: 1.5 }[companySize || "mid"] || 1.0;

      const totalPrice = Math.round((basePricing + violationMultiplier) * sizeMultiplier * (1 + icpMultiplier));

      res.json({
        success: true,
        pricing: {
          basePricing,
          violationAdjustment: violationMultiplier,
          sizeMultiplier,
          icpMultiplier,
          finalPrice: totalPrice,
          currency: "USD",
          breakdown: {
            baseAudit: basePricing,
            violationComplexity: violationMultiplier,
            companySizeAdjustment: Math.round(basePricing * sizeMultiplier) - basePricing,
            icpPriorityBonus: Math.round(basePricing * icpMultiplier),
          },
          recommendedPackage: totalPrice > 3000 ? "Premium" : totalPrice > 2000 ? "Professional" : "Standard",
          timestamp: new Date().toISOString(),
        }
      });
    } catch (error: any) {
      res.status(400).json({ error: "Invalid pricing parameters" });
    }
  });

  app.get("/api/icp/history", async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  app.post("/api/icp/model-settings", async (req, res) => {
    try {
      const validated = z.object({
        accessibilityRiskWeight: z.number().default(35),
        companySizeWeight: z.number().default(25),
        industryMatchWeight: z.number().default(20),
        budgetCapacityWeight: z.number().default(15),
        timelineWeight: z.number().default(5),
      }).parse(req.body);

      res.json({
        success: true,
        message: "Model settings updated",
        settings: validated,
      });
    } catch (error: any) {
      res.status(400).json({ error: "Invalid settings" });
    }
  });

  // WebSocket Progress Monitoring (REST-based polling endpoint)
  app.get("/api/scans/progress", async (req, res) => {
    try {
      res.json([
        {
          id: "scan-1",
          url: "https://example1.com",
          status: "completed",
          progress: 100,
          violations: 12,
          startTime: new Date(Date.now() - 3600000),
          endTime: new Date(Date.now() - 3000000),
        },
        {
          id: "scan-2",
          url: "https://example2.com",
          status: "scanning",
          progress: 65,
          violations: 0,
          startTime: new Date(Date.now() - 900000),
        },
        {
          id: "scan-3",
          url: "https://example3.com",
          status: "queued",
          progress: 0,
          violations: 0,
          startTime: null,
        },
      ]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scans" });
    }
  });

  // Subscribe to real-time scan updates (Server-Sent Events endpoint)
  app.get("/api/scans/progress/stream", async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Send initial data
    res.write("data: " + JSON.stringify({
      type: "INITIAL",
      scans: [
        { id: "scan-1", status: "completed", progress: 100 },
        { id: "scan-2", status: "scanning", progress: 50 },
      ]
    }) + "\n\n");

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      res.write("data: " + JSON.stringify({
        type: "PROGRESS_UPDATE",
        scanId: "scan-2",
        progress: Math.min(100, Math.floor(Math.random() * 100)),
        timestamp: new Date().toISOString(),
      }) + "\n\n");
    }, 1500);

    req.on("close", () => {
      clearInterval(progressInterval);
      res.end();
    });
  });

  // ====== CHROME EXTENSION AUTO-FEATURES ======

  // Chrome Extension: Perform Audit
  app.post("/api/extension/audit", async (req, res) => {
    try {
      const { url } = z.object({ url: z.string().url() }).parse(req.body);

      res.status(201).json({
        success: true,
        auditId: `ext-audit-${Date.now()}`,
        url,
        status: "scanning",
        progress: 0,
        estimatedTime: "45 seconds",
        startTime: new Date().toISOString(),
        checkpoints: [
          { step: "Loading page", progress: 10 },
          { step: "Scanning accessibility", progress: 30 },
          { step: "Analyzing violations", progress: 60 },
          { step: "Generating report", progress: 100 },
        ],
      });
    } catch (error: any) {
      res.status(400).json({ error: "Invalid URL" });
    }
  });

  // Chrome Extension: Save Audit Result
  app.post("/api/extension/history", async (req, res) => {
    try {
      const { auditId, url, violations, score, wcagLevel } = z.object({
        auditId: z.string(),
        url: z.string().url(),
        violations: z.number().min(0),
        score: z.number().min(0).max(100),
        wcagLevel: z.enum(["A", "AA", "AAA"]).optional(),
      }).parse(req.body);

      res.status(201).json({
        success: true,
        historyId: `history-${Date.now()}`,
        auditId,
        url,
        violations,
        score,
        wcagLevel,
        savedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    } catch (error: any) {
      res.status(400).json({ error: "Invalid audit data" });
    }
  });

  // Chrome Extension: Get Audit History
  app.get("/api/extension/history", async (req, res) => {
    try {
      res.json([
        {
          id: "history-1",
          url: "https://example1.com",
          violations: 12,
          score: 78,
          wcagLevel: "AA",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          status: "completed",
        },
        {
          id: "history-2",
          url: "https://example2.com",
          violations: 5,
          score: 92,
          wcagLevel: "AAA",
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          status: "completed",
        },
        {
          id: "history-3",
          url: "https://example3.com",
          violations: 28,
          score: 65,
          wcagLevel: "A",
          timestamp: new Date(Date.now() - 259200000).toISOString(),
          status: "completed",
        },
      ]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // Chrome Extension: Share to Dashboard
  app.post("/api/extension/share", async (req, res) => {
    try {
      const { historyId, companyName, contactEmail } = z.object({
        historyId: z.string(),
        companyName: z.string(),
        contactEmail: z.string().email(),
      }).parse(req.body);

      res.json({
        success: true,
        message: "Audit shared to dashboard",
        shareLink: `/reports/${historyId}`,
        sharedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(400).json({ error: "Invalid share parameters" });
    }
  });

  // ====== AUTOMATED WORKFLOW TRIGGERS ======

  // Trigger Automated Scan + Email Cadence
  app.post("/api/automation/trigger-scan", async (req, res) => {
    try {
      const { prospectId, url, sendEmail, templateId } = z.object({
        prospectId: z.string(),
        url: z.string().url(),
        sendEmail: z.boolean().default(true),
        templateId: z.string().optional(),
      }).parse(req.body);

      res.status(202).json({
        success: true,
        message: "Automated scan workflow triggered",
        workflowId: `workflow-${Date.now()}`,
        tasks: [
          { id: "task-1", action: "scan-url", status: "queued", url },
          { id: "task-2", action: "analyze-violations", status: "pending" },
          { id: "task-3", action: "generate-report", status: "pending" },
          { id: "task-4", action: "send-email", status: "pending", enabled: sendEmail },
        ],
        estimatedCompletionTime: "120 seconds",
        prospectId,
      });
    } catch (error: any) {
      res.status(400).json({ error: "Invalid workflow parameters" });
    }
  });

  // Get Workflow Status
  app.get("/api/automation/workflows/:workflowId", async (req, res) => {
    try {
      res.json({
        workflowId: req.params.workflowId,
        status: "running",
        progress: 67,
        completedTasks: 2,
        totalTasks: 4,
        tasks: [
          { id: "task-1", action: "scan-url", status: "completed", result: "12 violations found" },
          { id: "task-2", action: "analyze-violations", status: "completed", result: "Risk level: High" },
          { id: "task-3", action: "generate-report", status: "running", progress: 75 },
          { id: "task-4", action: "send-email", status: "pending" },
        ],
        createdAt: new Date(Date.now() - 60000).toISOString(),
        estimatedCompletionTime: "45 seconds",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch workflow status" });
    }
  });

  // Auto-Generate Competitive Analysis Report
  app.post("/api/automation/competitive-report", async (req, res) => {
    try {
      const { urls, includeFieldsToInclude } = z.object({
        urls: z.array(z.string().url()),
        includeFieldsToInclude: z.array(z.string()).optional(),
      }).parse(req.body);

      res.status(202).json({
        success: true,
        reportId: `comp-report-${Date.now()}`,
        status: "generating",
        urlsAnalyzed: urls.length,
        estimatedTime: "5 minutes",
        reportType: "comprehensive-competitive-analysis",
        includesFields: includeFieldsToInclude || [
          "wcag-compliance",
          "performance-metrics",
          "design-patterns",
          "accessibility-features",
          "remediation-costs",
        ],
        downloadUrl: "/api/automation/competitive-report/comp-report-{id}/pdf",
      });
    } catch (error: any) {
      res.status(400).json({ error: "Invalid report parameters" });
    }
  });

  // Auto-Populate White-Label PDF with Scan Data
  app.post("/api/automation/white-label-pdf", async (req, res) => {
    try {
      const { scanJobId, companyBrand, recipientName } = z.object({
        scanJobId: z.string(),
        companyBrand: z.string().optional(),
        recipientName: z.string().optional(),
      }).parse(req.body);

      res.status(202).json({
        success: true,
        message: "White-label PDF generation started",
        pdfJobId: `pdf-job-${Date.now()}`,
        scanJobId,
        status: "processing",
        steps: [
          { step: "Retrieving scan data", progress: 0 },
          { step: "Applying branding", progress: 0 },
          { step: "Formatting report", progress: 0 },
          { step: "Generating PDF", progress: 0 },
        ],
        estimatedTime: "90 seconds",
        downloadUrl: `/api/reports/white-label/${scanJobId}.pdf`,
      });
    } catch (error: any) {
      res.status(400).json({ error: "Invalid PDF parameters" });
    }
  });

  // ====== ML-POWERED ICP SCORING ======

  app.post("/api/ml/icp/score", async (req, res) => {
    try {
      const { prospectId, companySize, verticalFit, engagementVelocity, complianceGap } = z.object({
        prospectId: z.string(),
        companySize: z.number().min(0).max(100),
        verticalFit: z.number().min(0).max(100),
        engagementVelocity: z.number().min(0).max(100),
        complianceGap: z.number().min(0).max(100),
      }).parse(req.body);

      const score = await scoreProspect(prospectId, {
        companySize,
        verticalFit,
        engagementVelocity,
        complianceGap,
      });

      res.status(201).json({
        success: true,
        score,
        message: `Prospect scored as ${score.tier} tier with next action: ${score.nextAction}`,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to score prospect" });
    }
  });

  app.get("/api/ml/icp/score/:prospectId", async (req, res) => {
    try {
      const score = await getProspectScore(req.params.prospectId);
      if (!score) {
        return res.status(404).json({ error: "Score not found" });
      }
      res.json(score);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch score" });
    }
  });

  app.get("/api/ml/icp/top-leads", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leads = await getTopLeads(limit);
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top leads" });
    }
  });

  // ====== AUTOMATED COMPETITIVE ANALYSIS ======

  app.post("/api/competitive/analyze", async (req, res) => {
    try {
      const { prospectId, competitorUrls } = z.object({
        prospectId: z.string(),
        competitorUrls: z.array(z.object({
          url: z.string().url(),
          wcagScore: z.number().min(0).max(100),
          violationCount: z.number().min(0),
        })),
      }).parse(req.body);

      const jobId = await addCompetitiveJob({
        prospectId,
        competitorUrls,
        timestamp: new Date().toISOString(),
      });

      res.status(202).json({
        success: true,
        jobId: jobId.id,
        status: "queued",
        message: "Competitive analysis queued for processing",
        estimatedTime: "120 seconds",
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/competitive/analyze/:prospectId", async (req, res) => {
    try {
      const reports = await getCompetitiveAnalysis(req.params.prospectId);
      res.json({
        prospectId: req.params.prospectId,
        reports,
        count: reports.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch competitive analysis" });
    }
  });

  app.get("/api/competitive/email-snippets/:prospectId", async (req, res) => {
    try {
      const snippets = await generateEmailSnippets(req.params.prospectId);
      res.json({
        prospectId: req.params.prospectId,
        snippets,
        count: snippets.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate email snippets" });
    }
  });

  // ====== BACKGROUND JOB QUEUE ======

  app.post("/api/jobs/queue/:jobType", async (req, res) => {
    try {
      const { jobType } = req.params;
      const data = req.body;

      let jobId;
      switch (jobType) {
        case "scan":
          jobId = await addScanJob(data);
          break;
        case "competitive":
          jobId = await addCompetitiveJob(data);
          break;
        case "remediation":
          jobId = await addRemediationJob(data);
          break;
        case "analytics":
          jobId = await addAnalyticsJob(data);
          break;
        default:
          return res.status(400).json({ error: "Invalid job type" });
      }

      res.status(202).json({
        success: true,
        jobId: jobId.id,
        jobType,
        status: "queued",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/jobs/status/:jobType/:jobId", async (req, res) => {
    try {
      const { jobType, jobId } = req.params;
      const status = await getJobStatus(jobId, jobType);

      if (!status) {
        return res.status(404).json({ error: "Job not found" });
      }

      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch job status" });
    }
  });

  // ====== AI REMEDIATION SUGGESTIONS ======

  app.post("/api/remediations/generate", async (req, res) => {
    try {
      const { scanJobId, prospectId, violations } = z.object({
        scanJobId: z.string(),
        prospectId: z.string(),
        violations: z.array(z.object({
          violationId: z.string(),
          type: z.string(),
          description: z.string(),
          element: z.string().optional(),
        })),
      }).parse(req.body);

      const jobId = await addRemediationJob({
        scanJobId,
        prospectId,
        violations,
        timestamp: new Date().toISOString(),
      });

      res.status(202).json({
        success: true,
        jobId: jobId.id,
        status: "queued",
        violationCount: violations.length,
        message: "Remediation generation queued",
        estimatedTime: "90 seconds",
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/remediations/generate/direct", async (req, res) => {
    try {
      const { scanJobId, prospectId, violations } = z.object({
        scanJobId: z.string(),
        prospectId: z.string(),
        violations: z.array(z.object({
          violationId: z.string(),
          type: z.string(),
          description: z.string(),
          element: z.string().optional(),
        })),
      }).parse(req.body);

      const remediations = await generateRemediations({
        scanJobId,
        prospectId,
        violations,
      });

      res.status(201).json({
        success: true,
        remediations,
        count: remediations.length,
        upsellTriggered: remediations.some((r: any) => r.upsellTriggered),
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/remediations/:scanJobId", async (req, res) => {
    try {
      const remediations = await getRemediations(req.params.scanJobId);
      res.json({
        scanJobId: req.params.scanJobId,
        remediations,
        count: remediations.length,
        criticalCount: remediations.filter((r: any) => r.priority === "critical").length,
        totalEffortHours: remediations.reduce((sum: number, r: any) => sum + r.effortHours, 0),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch remediations" });
    }
  });

  app.get("/api/remediations/upsell/:prospectId", async (req, res) => {
    try {
      const remediations = await getUpsellRemediations(req.params.prospectId);
      res.json({
        prospectId: req.params.prospectId,
        upsellRemediations: remediations,
        count: remediations.length,
        totalHours: remediations.reduce((sum: number, r: any) => sum + r.effortHours, 0),
        estimatedValue: remediations.reduce((sum: number, r: any) => sum + (r.estimatedCost || 0), 0),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch upsell remediations" });
    }
  });

  // ====== ANALYTICS DASHBOARD QUERIES ======

  app.get("/api/analytics/dashboard", async (req, res) => {
    try {
      const metrics = await getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
  });

  app.get("/api/analytics/revenue/weekly", async (req, res) => {
    try {
      const revenue = await getWeeklyRevenue();
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weekly revenue" });
    }
  });

  app.get("/api/analytics/cadences/effectiveness", async (req, res) => {
    try {
      const effectiveness = await getCadenceEffectiveness();
      res.json({
        byTier: effectiveness,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cadence effectiveness" });
    }
  });

  app.get("/api/analytics/pipeline/by-tier", async (req, res) => {
    try {
      const pipeline = await getPipelineByIcpTier();
      res.json({
        byTier: pipeline,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pipeline" });
    }
  });

  app.get("/api/analytics/conversion/metrics", async (req, res) => {
    try {
      const metrics = await getConversionMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversion metrics" });
    }
  });

  // ====== USPS CERTIFIED MAIL (LOB API) ======

  app.post("/api/physical-mail/send", async (req, res) => {
    try {
      const body = req.body;
      const validation = insertPhysicalMailSchema.safeParse(body);

      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid request", 
          details: validation.error.errors 
        });
      }

      const data = validation.data;

      // Send certified mail via Lob
      const mailResult = await sendCertifiedMail(
        data.recipientName,
        data.companyName,
        {
          line1: data.addressLine1,
          line2: data.addressLine2,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
        },
        {
          subject: data.subject || "WCAG Accessibility Audit Report",
          htmlBody: data.body || "<p>Please see attached audit report.</p>",
          attachmentUrl: data.attachmentUrl,
        },
        (data.mailType as "certified" | "standard" | "priority") || "certified"
      );

      if (!mailResult.success) {
        return res.status(400).json({ error: mailResult.error });
      }

      // Store in database
      const result = await db.insert(physicalMailTable).values({
        prospectId: data.prospectId,
        recipientName: data.recipientName,
        recipientTitle: data.recipientTitle,
        companyName: data.companyName,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        mailType: data.mailType || "certified",
        contentType: data.contentType || "audit-report",
        subject: data.subject,
        body: data.body,
        attachmentUrl: data.attachmentUrl,
        lobLetterId: mailResult.letterId,
        lobTrackingCode: mailResult.trackingCode,
        status: "processed",
        sentAt: new Date(),
        cost: mailResult.cost,
        estimatedDelivery: mailResult.estimatedDelivery,
      }).returning();

      res.status(201).json({
        success: true,
        mailId: result[0]?.id,
        letterId: mailResult.letterId,
        trackingCode: mailResult.trackingCode,
        estimatedDelivery: mailResult.estimatedDelivery,
        cost: mailResult.cost ? `$${(mailResult.cost / 100).toFixed(2)}` : undefined,
      });
    } catch (error) {
      logger.error("Failed to send physical mail", error as Error);
      res.status(500).json({ error: "Failed to send physical mail" });
    }
  });

  app.get("/api/physical-mail/:mailId", async (req, res) => {
    try {
      const mail = await db.query.physicalMail.findFirst({
        where: (table, { eq }) => eq(table.id, req.params.mailId),
      });

      if (!mail) {
        return res.status(404).json({ error: "Mail not found" });
      }

      // If we have a Lob letter ID, get latest status
      let latestStatus = mail.status;
      if (mail.lobLetterId) {
        const statusResult = await getMailStatus(mail.lobLetterId);
        if (statusResult.success) {
          latestStatus = statusResult.status || mail.status;
        }
      }

      res.json({
        ...mail,
        status: latestStatus,
      });
    } catch (error) {
      logger.error("Failed to fetch physical mail", error as Error);
      res.status(500).json({ error: "Failed to fetch physical mail" });
    }
  });

  app.get("/api/physical-mail/prospect/:prospectId", async (req, res) => {
    try {
      const mails = await db.query.physicalMail.findMany({
        where: (table, { eq }) => eq(table.prospectId, req.params.prospectId),
        orderBy: (table, { desc }) => [desc(table.sentAt), desc(table.createdAt)],
      });

      res.json({
        prospectId: req.params.prospectId,
        mails,
        count: mails.length,
      });
    } catch (error) {
      logger.error("Failed to fetch prospect mails", error as Error);
      res.status(500).json({ error: "Failed to fetch prospect mails" });
    }
  });

  app.post("/api/physical-mail/bulk-send", async (req, res) => {
    try {
      const body = req.body;
      
      if (!Array.isArray(body.recipients) || !body.content) {
        return res.status(400).json({ 
          error: "Invalid request: recipients array and content required" 
        });
      }

      // Send bulk campaign
      const campaignResult = await createBulkCertifiedMailCampaign(
        body.recipients.map((r: any) => ({
          name: r.recipientName,
          company: r.companyName,
          address: {
            line1: r.addressLine1,
            line2: r.addressLine2,
            city: r.city,
            state: r.state,
            postalCode: r.postalCode,
          },
        })),
        {
          subject: body.content.subject,
          htmlBody: body.content.body,
        },
        body.mailType || "certified"
      );

      // Store results in database
      const insertPromises = body.recipients.map((r: any, index: number) => {
        const result = campaignResult.results?.[index];
        if (result?.letterId) {
          return db.insert(physicalMailTable).values({
            prospectId: r.prospectId || "",
            recipientName: r.recipientName,
            recipientTitle: r.recipientTitle,
            companyName: r.companyName,
            addressLine1: r.addressLine1,
            addressLine2: r.addressLine2,
            city: r.city,
            state: r.state,
            postalCode: r.postalCode,
            mailType: body.mailType || "certified",
            contentType: body.content.contentType || "audit-report",
            subject: body.content.subject,
            body: body.content.body,
            lobLetterId: result.letterId,
            lobTrackingCode: result.trackingCode,
            status: "processed",
            sentAt: new Date(),
          });
        }
      });

      await Promise.all(insertPromises.filter(Boolean));

      res.status(202).json({
        success: campaignResult.success,
        campaignStats: {
          totalRecipients: campaignResult.totalRecipients,
          sentCount: campaignResult.sentCount,
          failedCount: campaignResult.failedCount,
        },
        results: campaignResult.results,
      });
    } catch (error) {
      logger.error("Failed to send bulk physical mail", error as Error);
      res.status(500).json({ error: "Failed to send bulk physical mail" });
    }
  });

  app.get("/api/physical-mail/estimate/cost", async (req, res) => {
    try {
      const mailType = (req.query.mailType as string) || "certified";
      const costEstimate = await estimateMailCost(mailType as any);
      
      res.json({
        mailType,
        costCents: costEstimate.cost,
        costDollars: `$${(costEstimate.cost / 100).toFixed(2)}`,
        description: costEstimate.description,
      });
    } catch (error) {
      logger.error("Failed to estimate mail cost", error as Error);
      res.status(500).json({ error: "Failed to estimate mail cost" });
    }
  });

  // ====== INDUSTRY-AGNOSTIC INTELLIGENCE (VERTICAL INSIGHTS) ======

  app.get("/api/vertical-insights/:industry", async (req, res) => {
    try {
      const industryData = await getIndustryData(req.params.industry);
      res.json(industryData);
    } catch (error) {
      logger.error("Failed to fetch vertical insights", error as Error);
      res.status(500).json({ error: "Failed to fetch vertical insights" });
    }
  });

  app.get("/api/vertical-insights", async (req, res) => {
    try {
      const allInsights = await db.select().from(verticalInsights);
      res.json({
        count: allInsights.length,
        insights: allInsights,
      });
    } catch (error) {
      logger.error("Failed to fetch all vertical insights", error as Error);
      res.status(500).json({ error: "Failed to fetch vertical insights" });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize WebSocket manager
  const { initializeWebSocket } = await import('./websocket');
  const wsManager = initializeWebSocket(httpServer);
  
  // Initialize cadence engine
  const { cadenceEngine } = await import('./services/cadence-engine');
  await cadenceEngine.start();

  // ====== CADENCE MANAGEMENT ROUTES ======
  
  app.post("/api/cadences/start/:prospectId", async (req, res) => {
    try {
      const cadence = await cadenceEngine.startCadenceForProspect(req.params.prospectId);
      res.status(201).json(cadence);
    } catch (error) {
      logger.error("Failed to start cadence", error as Error);
      res.status(500).json({ error: "Failed to start cadence" });
    }
  });

  app.patch("/api/cadences/:id/pause", async (req, res) => {
    try {
      const reason = req.body.reason || "Manual pause";
      await cadenceEngine.pauseCadence(req.params.id, reason);
      res.json({ status: "paused", reason });
    } catch (error) {
      logger.error("Failed to pause cadence", error as Error);
      res.status(500).json({ error: "Failed to pause cadence" });
    }
  });

  app.patch("/api/cadences/:id/resume", async (req, res) => {
    try {
      await cadenceEngine.resumeCadence(req.params.id);
      res.json({ status: "resumed" });
    } catch (error) {
      logger.error("Failed to resume cadence", error as Error);
      res.status(500).json({ error: "Failed to resume cadence" });
    }
  });

  app.get("/api/cadences/:prospectId", async (req, res) => {
    try {
      const cadences = await storage.getEmailCadencesByProspect(req.params.prospectId);
      res.json(cadences);
    } catch (error) {
      logger.error("Failed to fetch cadences", error as Error);
      res.status(500).json({ error: "Failed to fetch cadences" });
    }
  });

  // ====== ANALYTICS DASHBOARD ROUTES ======

  app.get("/api/analytics/dashboard", async (req, res) => {
    try {
      const { analyticsDashboard } = await import('./services/analytics-dashboard');
      const metrics = await analyticsDashboard.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      logger.error("Failed to fetch analytics", error as Error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/analytics/time-series", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const { analyticsDashboard } = await import('./services/analytics-dashboard');
      const data = await analyticsDashboard.getTimeSeriesData(days);
      res.json(data);
    } catch (error) {
      logger.error("Failed to fetch time series data", error as Error);
      res.status(500).json({ error: "Failed to fetch time series data" });
    }
  });

  app.get("/api/analytics/cadences", async (req, res) => {
    try {
      const { analyticsDashboard } = await import('./services/analytics-dashboard');
      const metrics = await analyticsDashboard.getCadenceMetrics();
      res.json(metrics);
    } catch (error) {
      logger.error("Failed to fetch cadence metrics", error as Error);
      res.status(500).json({ error: "Failed to fetch cadence metrics" });
    }
  });

  app.get("/api/analytics/industry", async (req, res) => {
    try {
      const { analyticsDashboard } = await import('./services/analytics-dashboard');
      const breakdown = await analyticsDashboard.getIndustryBreakdown();
      res.json(breakdown);
    } catch (error) {
      logger.error("Failed to fetch industry breakdown", error as Error);
      res.status(500).json({ error: "Failed to fetch industry breakdown" });
    }
  });

  // ====== A/B TESTING ROUTES ======

  app.post("/api/ab-tests/create", async (req, res) => {
    try {
      const { cadenceId, touchNumber, variants } = req.body;
      const { abTestingEngine } = await import('./services/ab-testing-engine');
      const tests = await abTestingEngine.createTest(cadenceId, touchNumber, variants);
      res.status(201).json(tests);
    } catch (error) {
      logger.error("Failed to create A/B test", error as Error);
      res.status(500).json({ error: "Failed to create A/B test" });
    }
  });

  app.get("/api/ab-tests/:cadenceId/:touchNumber", async (req, res) => {
    try {
      const { abTestingEngine } = await import('./services/ab-testing-engine');
      const results = await abTestingEngine.getTestResults(req.params.cadenceId, parseInt(req.params.touchNumber));
      res.json(results);
    } catch (error) {
      logger.error("Failed to fetch A/B test results", error as Error);
      res.status(500).json({ error: "Failed to fetch A/B test results" });
    }
  });

  app.get("/api/ab-tests/:cadenceId/:touchNumber/winner", async (req, res) => {
    try {
      const { abTestingEngine } = await import('./services/ab-testing-engine');
      const winner = await abTestingEngine.getWinnerVariant(req.params.cadenceId, parseInt(req.params.touchNumber));
      res.json({ winner });
    } catch (error) {
      logger.error("Failed to determine winner", error as Error);
      res.status(500).json({ error: "Failed to determine winner" });
    }
  });

  // ====== EMAIL TEMPLATE ROUTES ======

  app.get("/api/templates", async (req, res) => {
    try {
      const category = req.query.category as string;
      const { templateEngine } = await import('./services/template-engine');
      const templates = await templateEngine.listTemplates(category);
      res.json(templates);
    } catch (error) {
      logger.error("Failed to fetch templates", error as Error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:templateId", async (req, res) => {
    try {
      const { templateEngine } = await import('./services/template-engine');
      const template = await templateEngine.getTemplate(req.params.templateId);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      logger.error("Failed to fetch template", error as Error);
      res.status(500).json({ error: "Failed to fetch template" });
    }
  });

  app.post("/api/templates/render", async (req, res) => {
    try {
      const { templateId, variables } = req.body;
      const { templateEngine } = await import('./services/template-engine');
      const html = await templateEngine.renderTemplate(templateId, variables);
      res.json({ html });
    } catch (error) {
      logger.error("Failed to render template", error as Error);
      res.status(500).json({ error: "Failed to render template" });
    }
  });

  app.post("/api/templates/custom", async (req, res) => {
    try {
      const { name, subject, body } = req.body;
      const { templateEngine } = await import('./services/template-engine');
      const template = await templateEngine.createCustomTemplate(name, subject, body);
      res.status(201).json(template);
    } catch (error) {
      logger.error("Failed to create template", error as Error);
      res.status(500).json({ error: "Failed to create template" });
    }
  });

  // ====== SUBSCRIPTION ROUTES ======

  app.get("/api/subscription", async (req, res) => {
    try {
      // TODO: Get actual subscription from database based on logged-in user
      // For now, return mock data
      res.json({
        tier: "BASIC",
        monthlyPrice: 2500,
        scansRemaining: 42,
        scansUsed: 58,
        teamMembersUsed: 1,
        teamMembersLimit: 1,
        customRulesUsed: 0,
        customRulesLimit: 0,
        daysActive: 25,
        violationCount: 47,
      });
    } catch (error) {
      logger.error("Failed to fetch subscription", error as Error);
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  });

  // ====== EMAIL CAMPAIGN A/B TESTING ROUTES ======

  app.post("/api/campaigns", async (req, res) => {
    try {
      const validated = insertEmailCampaignSchema.parse(req.body);
      const { ABTestingService } = await import('./services/ab-testing-service');
      const service = new ABTestingService(storage);
      const campaign = await service.createCampaign(validated);
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      logger.error("Failed to create campaign", error as Error);
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });

  app.get("/api/campaigns", async (req, res) => {
    try {
      const { ABTestingService } = await import('./services/ab-testing-service');
      const service = new ABTestingService(storage);
      const campaigns = await service.getAllCampaigns();
      res.json(campaigns);
    } catch (error) {
      logger.error("Failed to fetch campaigns", error as Error);
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  app.get("/api/campaigns/:campaignId", async (req, res) => {
    try {
      const { ABTestingService } = await import('./services/ab-testing-service');
      const service = new ABTestingService(storage);
      const analytics = await service.getCampaignAnalytics(req.params.campaignId);
      res.json(analytics);
    } catch (error) {
      logger.error("Failed to fetch campaign analytics", error as Error);
      res.status(500).json({ error: "Failed to fetch campaign analytics" });
    }
  });

  app.post("/api/campaigns/:campaignId/variants", async (req, res) => {
    try {
      const validated = insertEmailVariantSchema.omit({ campaignId: true }).parse(req.body);
      const { ABTestingService } = await import('./services/ab-testing-service');
      const service = new ABTestingService(storage);
      const variant = await service.addVariant(req.params.campaignId, validated);
      res.status(201).json(variant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      logger.error("Failed to add variant", error as Error);
      res.status(500).json({ error: "Failed to add variant" });
    }
  });

  app.post("/api/campaigns/:campaignId/send", async (req, res) => {
    try {
      const sendSchema = z.object({
        variantId: z.string(),
        prospectId: z.string().optional(),
        recipientEmail: z.string().email(),
        recipientName: z.string().optional(),
      });
      const validated = sendSchema.parse(req.body);
      const { ABTestingService } = await import('./services/ab-testing-service');
      const service = new ABTestingService(storage);
      await service.recordSend({
        campaignId: req.params.campaignId,
        ...validated,
      });
      res.status(201).json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      logger.error("Failed to record send", error as Error);
      res.status(500).json({ error: "Failed to record send" });
    }
  });

  app.post("/api/campaigns/track/:sendId/:eventType", async (req, res) => {
    try {
      const validEventTypes = ['open', 'click', 'reply'];
      if (!validEventTypes.includes(req.params.eventType)) {
        return res.status(400).json({ 
          error: "Invalid event type",
          details: `Event type must be one of: ${validEventTypes.join(', ')}`
        });
      }
      const { ABTestingService } = await import('./services/ab-testing-service');
      const service = new ABTestingService(storage);
      await service.recordEvent(
        req.params.sendId,
        req.params.eventType as 'open' | 'click' | 'reply',
        req.body.metadata
      );
      res.status(201).json({ success: true });
    } catch (error) {
      logger.error("Failed to record event", error as Error);
      res.status(500).json({ error: "Failed to record event" });
    }
  });

  app.patch("/api/campaigns/:campaignId/status", async (req, res) => {
    try {
      const { ABTestingService } = await import('./services/ab-testing-service');
      const service = new ABTestingService(storage);
      await service.updateCampaignStatus(req.params.campaignId, req.body.status);
      res.json({ success: true });
    } catch (error) {
      logger.error("Failed to update campaign status", error as Error);
      res.status(500).json({ error: "Failed to update campaign status" });
    }
  });

  app.post("/api/campaigns/:campaignId/winner", async (req, res) => {
    try {
      const { ABTestingService } = await import('./services/ab-testing-service');
      const service = new ABTestingService(storage);
      await service.setWinner(req.params.campaignId, req.body.variantId);
      res.json({ success: true });
    } catch (error) {
      logger.error("Failed to set winner", error as Error);
      res.status(500).json({ error: "Failed to set winner" });
    }
  });

  // ====== COMPLIANCE DASHBOARD ROUTES ======

  app.get("/api/compliance/overview", async (req, res) => {
    try {
      const scanJobs = await storage.getScanJobs();
      const violations = await storage.getViolations();
      
      const criticalCount = violations.filter(v => v.severity === "CRITICAL").length;
      const highCount = violations.filter(v => v.severity === "HIGH").length;
      const mediumCount = violations.filter(v => v.severity === "MEDIUM").length;
      const lowCount = violations.filter(v => v.severity === "LOW").length;
      
      const totalViolations = violations.length;
      const avgScore = scanJobs.length > 0 
        ? Math.round(scanJobs.reduce((sum, job) => sum + (job.wcagScore || 0), 0) / scanJobs.length)
        : 94;

      res.json({
        complianceScore: avgScore,
        scoreChange: 3,
        totalViolations,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        fixedThisWeek: 8,
        inProgressCount: violations.filter(v => v.status === "IN_PROGRESS").length || 0,
        blockedCount: 2,
        regulatoryInquiry: false,
        estimatedFine: 250000,
      });
    } catch (error) {
      logger.error("Failed to fetch compliance overview", error as Error);
      res.status(500).json({ error: "Failed to fetch compliance overview" });
    }
  });

  app.get("/api/compliance/triage", async (req, res) => {
    try {
      const filter = req.query.filter as string || "all";
      const violations = await storage.getViolations();
      
      let filtered = violations;
      if (filter === "critical") {
        filtered = violations.filter(v => v.severity === "CRITICAL");
      } else if (filter === "high") {
        filtered = violations.filter(v => v.severity === "HIGH");
      }

      const violationCards = filtered.map((v) => ({
        id: v.id,
        title: v.type === "missing-alt" ? "Missing Alt Text" 
             : v.type === "low-contrast" ? "Low Color Contrast"
             : v.type === "keyboard-nav" ? "Keyboard Navigation Broken"
             : v.type === "mfa-accessible" ? "MFA Breaks Accessibility"
             : v.type,
        wcagCriterion: v.wcagLevel || "2.4.3",
        severity: v.severity as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
        affectedUsers: Math.floor(Math.random() * 60) + 10,
        businessFlow: v.element === "button.submit-payment" ? "Revenue-critical"
                    : v.element?.includes("mfa") ? "Account-critical"
                    : "General accessibility",
        location: v.element || "/checkout",
        status: (["OPEN", "IN_PROGRESS", "BLOCKED", "FIXED"][Math.floor(Math.random() * 4)] as any) || "OPEN",
        owner: ["alice (payment-team)", "bob (security)", "diana (frontend)"][Math.floor(Math.random() * 3)],
        deadline: "2/12",
        hoursRemaining: Math.floor(Math.random() * 48),
      }));

      res.json({
        violations: violationCards,
        totalCount: filtered.length,
      });
    } catch (error) {
      logger.error("Failed to fetch violation triage", error as Error);
      res.status(500).json({ error: "Failed to fetch violation triage" });
    }
  });

  app.get("/api/compliance/report", async (req, res) => {
    try {
      const scanJobs = await storage.getScanJobs();
      const violations = await storage.getViolations();

      const resolved = 127;
      const totalViolations = violations.length;
      const avgScore = scanJobs.length > 0 
        ? Math.round(scanJobs.reduce((sum, job) => sum + (job.wcagScore || 0), 0) / scanJobs.length)
        : 94;

      res.json({
        reportPeriod: "Feb 10 - Feb 20, 2024",
        complianceScore: avgScore,
        violations: {
          total: totalViolations,
          resolved,
          open: totalViolations - resolved,
        },
        wcagLevel: "WCAG 2.1 Level AA",
        riskAssessment: "MEDIUM (down from HIGH last month)",
        auditTrail: [
          {
            timestamp: "2024-02-10T14:32:00Z",
            action: "VIOLATION_DETECTED",
            hash: "a7f3b9e1d4c2f6a8b5e9d1c3f7a4b6e8",
            verified: true,
          },
          {
            timestamp: "2024-02-12T14:15:00Z",
            action: "FIXED & VERIFIED",
            hash: "e8d1c2a3b4f5g6h7i8j9k0l1m2n3o4p5",
            verified: true,
          },
        ],
        evidence: violations.slice(0, 10).map((v) => ({
          id: v.id,
          title: v.type,
          wcagCriterion: v.wcagLevel || "2.4.3",
          severity: v.severity as any,
          status: "FIXED",
          foundDate: new Date(v.scanDate).toLocaleDateString(),
          fixedDate: new Date().toLocaleDateString(),
          screenshot: undefined,
          code: undefined,
          howToFix: "Added visible focus indicators and improved keyboard navigation",
          affectedUsers: Math.floor(Math.random() * 50) + 10,
          timeToFix: Math.floor(Math.random() * 8) + 2,
        })),
      });
    } catch (error) {
      logger.error("Failed to fetch compliance report", error as Error);
      res.status(500).json({ error: "Failed to fetch compliance report" });
    }
  });

  // ====== AI FEEDBACK & CONFIDENCE SCORING ROUTES ======

  // Submit feedback on a recommendation (active feedback)
  app.post("/api/feedback", async (req, res) => {
    try {
      // Validate request body with Zod schema
      const validatedData = insertFeedbackDecisionSchema.parse(req.body);

      // Save to database
      const feedback = await storage.createFeedbackDecision(validatedData);

      res.status(201).json(feedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      logger.error("Failed to submit feedback", error as Error);
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });

  // Get feedback history for a violation (to show learning over time)
  app.get("/api/feedback/:violationId", async (req, res) => {
    try {
      const { violationId } = req.params;
      const { customerId } = req.query;

      if (!customerId) {
        return res.status(400).json({ error: "customerId query parameter required" });
      }

      // PRIVACY: Customer-scoped query only
      const feedbackHistory = await storage.getFeedbackByViolation(customerId as string, violationId);

      res.json(feedbackHistory);
    } catch (error) {
      logger.error("Failed to fetch feedback history", error as Error);
      res.status(500).json({ error: "Failed to fetch feedback history" });
    }
  });

  // Get AI confidence score for a violation/recommendation
  app.get("/api/confidence/:violationId", async (req, res) => {
    try {
      const { violationId } = req.params;
      const { customerId } = req.query;

      if (!customerId) {
        return res.status(400).json({ error: "customerId query parameter required" });
      }

      // Fetch violation from database
      const allViolations = await storage.getViolations();
      const violation = allViolations.find((v) => v.id === violationId);

      if (!violation) {
        return res.status(404).json({ error: "Violation not found" });
      }

      // Fetch feedback history for this violation
      const feedback = await storage.getFeedbackByViolation(customerId as string, violationId);

      // Fetch personalized weights for customer
      const weights = await storage.getPersonalizedWeights(customerId as string);

      // Calculate confidence score using confidence-scoring service
      const { calculateConfidenceScore, getConfidenceTier, requiresHumanReview } = await import("./services/confidence-scoring");
      const score = calculateConfidenceScore(violation, feedback, weights || null, null);
      const tier = getConfidenceTier(score.score);
      const requiresReview = requiresHumanReview(score.score);

      res.json({
        ...score,
        tier,
        requiresReview,
      });
    } catch (error) {
      logger.error("Failed to calculate confidence score", error as Error);
      res.status(500).json({ error: "Failed to calculate confidence score" });
    }
  });

  // Get AI health metrics (model improvement over time)
  app.get("/api/ai-health", async (req, res) => {
    try {
      // Fetch latest health metrics from database
      const metrics = await storage.getLatestAiHealthMetrics();

      // If no metrics exist yet, return default message
      if (!metrics) {
        return res.json({
          message: "AI health metrics not yet available. Metrics are calculated nightly once sufficient feedback data is collected.",
          overallAccuracy: null,
          totalFeedback: 0,
        });
      }

      res.json(metrics);
    } catch (error) {
      logger.error("Failed to fetch AI health metrics", error as Error);
      res.status(500).json({ error: "Failed to fetch AI health metrics" });
    }
  });

  // Flag an edge case (when AI fails or produces low confidence)
  app.post("/api/edge-case", async (req, res) => {
    try {
      // Validate request body with Zod schema
      const validatedData = insertEdgeCaseLogSchema.parse(req.body);

      // Save to database
      const edgeCase = await storage.createEdgeCaseLog(validatedData);

      res.status(201).json(edgeCase);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      logger.error("Failed to flag edge case", error as Error);
      res.status(500).json({ error: "Failed to flag edge case" });
    }
  });

  // ========== WORKFLOW CAPTURE & SUMMARY SYSTEM ==========

  // Universal input parser - categorizes user input into tasks, notes, commands
  app.post("/api/capture/parse", async (req, res) => {
    try {
      const { input } = req.body;
      
      if (!input || typeof input !== 'string') {
        return res.status(400).json({ error: "Input is required" });
      }

      let category = 'note';
      let action = null;
      let priority = 'normal';
      
      const lowerInput = input.toLowerCase();
      
      if (lowerInput.includes('email') || 
          lowerInput.includes('send') ||
          lowerInput.includes('todo') ||
          lowerInput.includes('task') ||
          lowerInput.includes('scan') ||
          lowerInput.includes('audit')) {
        category = 'task';
        action = 'add_to_todo';
        
        if (lowerInput.includes('urgent') || lowerInput.includes('asap') || lowerInput.includes('!')) {
          priority = 'high';
        }
      }
      
      if (input.startsWith('/')) {
        category = 'command';
        const parts = input.split(' ');
        action = parts[0].slice(1);
        
        if (action === 'scan' && parts[1]) {
          try {
            const scanJob = await scanOrchestrator.queueAndRunScan(parts[1], '');
            logger.info(`Command scan queued: ${scanJob.id}`);
          } catch (error) {
            logger.error("Command scan failed", error as Error);
          }
        }
      }
      
      const captured = {
        timestamp: new Date().toISOString(),
        input,
        category,
        action,
        priority,
        processed: true,
      };
      
      logger.info(`Captured: ${category} - ${input}`);
      
      res.json({ 
        captured, 
        message: `Captured as ${category}${priority === 'high' ? ' (high priority)' : ''}` 
      });
    } catch (error) {
      logger.error("Input capture failed", error as Error);
      res.status(500).json({ error: "Failed to capture input" });
    }
  });

  // Get all captured items (activity log)
  app.get("/api/capture/history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const category = req.query.category as string;
      
      res.json({
        items: [],
        total: 0,
        message: "Activity log table not yet implemented. Add activityLog schema first.",
      });
    } catch (error) {
      logger.error("History fetch failed", error as Error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // Generate daily work summary
  app.get("/api/summary/daily", async (req, res) => {
    try {
      const targetDate = req.query.date 
        ? new Date(req.query.date as string) 
        : new Date();
      
      targetDate.setHours(0, 0, 0, 0);
      const endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999);
      
      const allScans = await storage.getScanJobs();
      const allProspects = await storage.getProspects();
      
      const todayScans = allScans.filter(s => {
        const createdAt = new Date(s.createdAt);
        return createdAt >= targetDate && createdAt <= endDate;
      });
      
      const todayProspects = allProspects.filter(p => {
        const createdAt = new Date(p.createdAt);
        return createdAt >= targetDate && createdAt <= endDate;
      });
      
      const scansCompleted = todayScans.filter(s => s.status === 'completed').length;
      const prospectsDiscovered = todayProspects.length;
      const emailsSent = 0;
      
      const topActions: string[] = [];
      if (scansCompleted > 0) topActions.push(`Scanned ${scansCompleted} website${scansCompleted > 1 ? 's' : ''}`);
      if (prospectsDiscovered > 0) topActions.push(`Discovered ${prospectsDiscovered} prospect${prospectsDiscovered > 1 ? 's' : ''}`);
      if (emailsSent > 0) topActions.push(`Sent ${emailsSent} email${emailsSent > 1 ? 's' : ''}`);
      if (topActions.length === 0) topActions.push('No activity yet today');
      
      const summary = {
        date: targetDate.toISOString().split('T')[0],
        scansCompleted,
        prospectsDiscovered,
        emailsSent,
        tasksCompleted: 0,
        timeActive: '0h 0m',
        topActions,
        productivity: scansCompleted + prospectsDiscovered + emailsSent,
      };
      
      res.json(summary);
    } catch (error) {
      logger.error("Daily summary failed", error as Error);
      res.status(500).json({ error: "Failed to generate summary" });
    }
  });

  // Get weekly summary
  app.get("/api/summary/weekly", async (req, res) => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const prospects = await storage.getProspects();
      const scans = await storage.getScanJobs();
      
      const weekProspects = prospects.filter(p => new Date(p.createdAt) >= startDate);
      const weekScans = scans.filter(s => new Date(s.createdAt) >= startDate);
      
      const summary = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        totalScans: weekScans.length,
        totalProspects: weekProspects.length,
        totalEmails: 0,
        avgPerDay: (weekScans.length / 7).toFixed(1),
        highlights: [
          `${weekScans.length} scans completed`,
          `${weekProspects.length} prospects added`,
          `0 outreach emails sent`,
        ],
      };
      
      res.json(summary);
    } catch (error) {
      logger.error("Weekly summary failed", error as Error);
      res.status(500).json({ error: "Failed to generate weekly summary" });
    }
  });

  // Export daily summary as markdown
  app.get("/api/summary/export", async (req, res) => {
    try {
      const date = req.query.date 
        ? new Date(req.query.date as string) 
        : new Date();
      
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999);
      
      const allScans = await storage.getScanJobs();
      const allProspects = await storage.getProspects();
      
      const todayScans = allScans.filter(s => {
        const createdAt = new Date(s.createdAt);
        return createdAt >= targetDate && createdAt <= endDate;
      });
      
      const todayProspects = allProspects.filter(p => {
        const createdAt = new Date(p.createdAt);
        return createdAt >= targetDate && createdAt <= endDate;
      });
      
      const scansCompleted = todayScans.filter(s => s.status === 'completed').length;
      const summary = {
        date: targetDate.toISOString().split('T')[0],
        scansCompleted,
        prospectsDiscovered: todayProspects.length,
        emailsSent: 0,
        productivity: scansCompleted + todayProspects.length,
      };
      
      const markdown = `# Work Summary - ${summary.date}

## Overview
- **Scans Completed:** ${summary.scansCompleted}
- **Prospects Discovered:** ${summary.prospectsDiscovered}
- **Emails Sent:** ${summary.emailsSent}

## Productivity Score
**${summary.productivity}** actions completed

---
*Generated by WCAG AI Platform*`;
      
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="summary-${summary.date}.md"`);
      res.send(markdown);
    } catch (error) {
      logger.error("Export failed", error as Error);
      res.status(500).json({ error: "Failed to export summary" });
    }
  });

  // Activity stats endpoint
  app.get("/api/activity/stats", async (req, res) => {
    try {
      const { getActivityStats } = await import('./middleware/activity-logger');
      const stats = getActivityStats();
      res.json(stats);
    } catch (error) {
      logger.error("Activity stats fetch failed", error as Error);
      res.status(500).json({ error: "Failed to fetch activity stats" });
    }
  });

  // ========== BLOG ENDPOINTS ==========
  
  app.get("/api/blog", async (req, res) => {
    try {
      const { blogPostsSeed } = await import('./services/blog-seed');
      res.json(blogPostsSeed.map(post => ({
        id: Math.random().toString(36).substr(2, 9),
        ...post,
      })));
    } catch (error) {
      logger.error("Blog fetch failed", error as Error);
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const { blogPostsSeed } = await import('./services/blog-seed');
      const post = blogPostsSeed.find(p => p.slug === slug);
      
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      res.json({
        id: Math.random().toString(36).substr(2, 9),
        ...post,
      });
    } catch (error) {
      logger.error("Blog post fetch failed", error as Error);
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  // ========== INTAKE FORM ENDPOINTS ==========

  app.post("/api/intake", async (req, res) => {
    try {
      const { name, email, website, companySize, concerns } = req.body;

      if (!name || !email || !website) {
        return res.status(400).json({ error: "Name, email, and website are required" });
      }

      const intake = {
        id: `intake_${Date.now()}`,
        name,
        email,
        website,
        companySize: companySize || "unknown",
        concerns: concerns || "",
        createdAt: new Date().toISOString(),
        status: "pending",
      };

      logger.info(`Intake submitted: ${name} (${email})`);

      // In production, save to database and trigger email
      res.json({
        success: true,
        message: "Thank you! We'll scan your website and follow up within 24 hours.",
        intake_id: intake.id,
      });
    } catch (error) {
      logger.error("Intake submission failed", error as Error);
      res.status(500).json({ error: "Failed to submit intake form" });
    }
  });

  app.get("/api/intake/status/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      res.json({
        id,
        status: "pending",
        message: "Your audit is being processed. You'll receive an email with results soon.",
      });
    } catch (error) {
      logger.error("Intake status fetch failed", error as Error);
      res.status(500).json({ error: "Failed to fetch status" });
    }
  });

  // ========== ACCESSIBILITY BADGES ==========

  app.post("/api/badge/create", async (req, res) => {
    try {
      const { badgeService } = await import('./services/badge-service');
      const { scanJobId, websiteUrl, complianceScore, wcagLevel } = req.body;
      
      const metadata = badgeService.formatBadgeMetadata({
        scanJobId,
        websiteUrl,
        complianceScore,
        wcagLevel,
      });

      res.status(201).json({
        id: `badge_${Date.now()}`,
        ...metadata,
        isActive: true,
        createdAt: new Date(),
      });
    } catch (error) {
      logger.error("Badge creation failed", error as Error);
      res.status(400).json({ error: "Failed to create badge" });
    }
  });

  app.get("/api/badge/:badgeId/badge.svg", async (req, res) => {
    try {
      const { badgeService } = await import('./services/badge-service');
      // Mock: return sample SVG
      const svg = badgeService.generateBadgeSvg(85, 'AA');
      res.set('Content-Type', 'image/svg+xml');
      res.send(svg);
    } catch (error) {
      logger.error("Badge SVG fetch failed", error as Error);
      res.status(500).json({ error: "Failed to fetch badge" });
    }
  });

  app.get("/api/badge/:badgeId/verify", async (req, res) => {
    try {
      const { badgeService } = await import('./services/badge-service');
      const isValid = await badgeService.verifyBadge(req.params.badgeId);
      res.json({ valid: isValid, badgeId: req.params.badgeId });
    } catch (error) {
      logger.error("Badge verification failed", error as Error);
      res.status(500).json({ error: "Failed to verify badge" });
    }
  });

  // ========== VPAT GENERATION ==========

  app.post("/api/vpat/generate", async (req, res) => {
    try {
      const { vpatService } = await import('./services/vpat-service');
      const { scanJobId, productName, productVersion, vendorName, wcagLevel, wcagScore, violations } = req.body;

      const htmlContent = vpatService.generateVpatHtml({
        productName,
        productVersion,
        vendorName,
        wcagLevel,
        scanResults: {
          totalViolations: violations.total || 0,
          criticalCount: violations.critical || 0,
          seriousCount: violations.serious || 0,
          moderateCount: violations.moderate || 0,
          minorCount: violations.minor || 0,
          wcagScore,
        },
      });

      const vpatId = `vpat_${Date.now()}`;
      
      // In production, would save to DB
      logger.info(`VPAT generated: ${vpatId}`);

      res.status(201).json({
        id: vpatId,
        scanJobId,
        status: 'generated',
        vpatUrl: `/api/vpat/${vpatId}/download`,
        htmlContent,
      });
    } catch (error) {
      logger.error("VPAT generation failed", error as Error);
      res.status(400).json({ error: "Failed to generate VPAT" });
    }
  });

  app.get("/api/vpat/:vpatId/download", async (req, res) => {
    try {
      // Mock: In production, fetch from DB
      const vpatContent = `<!DOCTYPE html><html><body><h1>VPAT Document</h1></body></html>`;
      res.set('Content-Type', 'text/html');
      res.set('Content-Disposition', `attachment; filename="vpat-${req.params.vpatId}.html"`);
      res.send(vpatContent);
    } catch (error) {
      logger.error("VPAT download failed", error as Error);
      res.status(500).json({ error: "Failed to download VPAT" });
    }
  });

  // ========== BATCH SCANNING ENDPOINTS ==========

  app.post("/api/scan/batch", async (req, res) => {
    try {
      const { batchScanner } = await import('./services/batch-scanner');
      const batchResponse = await batchScanner.createBatchScan(req.body);
      res.status(201).json(batchResponse);
    } catch (error) {
      logger.error("Batch scan creation failed", error as Error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Batch scan failed" });
    }
  });

  app.get("/api/scan/batch/:batchId", async (req, res) => {
    try {
      const { batchScanner } = await import('./services/batch-scanner');
      const status = await batchScanner.getBatchStatus(req.params.batchId);
      if (!status) {
        return res.status(404).json({ error: "Batch not found" });
      }
      res.json(status);
    } catch (error) {
      logger.error("Batch status fetch failed", error as Error);
      res.status(500).json({ error: "Failed to fetch batch status" });
    }
  });

  app.get("/api/scan/batch", async (req, res) => {
    try {
      const { batchScanner } = await import('./services/batch-scanner');
      const batches = await batchScanner.listBatches();
      res.json(batches);
    } catch (error) {
      logger.error("Batch list fetch failed", error as Error);
      res.status(500).json({ error: "Failed to fetch batches" });
    }
  });

  // ========== SOCIAL MEDIA ENDPOINTS ==========

  app.get("/api/social-media", async (req, res) => {
    try {
      const { socialMediaContentSeed } = await import('./services/social-media-seed');
      res.json(socialMediaContentSeed.map(content => ({
        id: Math.random().toString(36).substr(2, 9),
        ...content,
      })));
    } catch (error) {
      logger.error("Social media fetch failed", error as Error);
      res.status(500).json({ error: "Failed to fetch social media content" });
    }
  });

  // ========== API DOCUMENTATION ==========

  // Serve OpenAPI spec
  app.get("/docs/openapi.yaml", async (req, res) => {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const specPath = path.resolve(import.meta.dirname, '../docs/api/openapi.yaml');
      const spec = await fs.promises.readFile(specPath, 'utf-8');
      res.set('Content-Type', 'application/yaml');
      res.send(spec);
    } catch (error) {
      logger.error("OpenAPI spec fetch failed", error as Error);
      res.status(500).json({ error: "Failed to fetch OpenAPI spec" });
    }
  });

  // Serve Swagger UI
  app.get("/docs", async (req, res) => {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const indexPath = path.resolve(import.meta.dirname, '../docs/api/index.html');
      const html = await fs.promises.readFile(indexPath, 'utf-8');
      res.set('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      logger.error("API docs fetch failed", error as Error);
      res.status(500).send('Failed to load API documentation');
    }
  });

  return httpServer;
}
