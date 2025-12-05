import {
  type User,
  type InsertUser,
  type Prospect,
  type InsertProspect,
  type Violation,
  type InsertViolation,
  type Trigger,
  type InsertTrigger,
  type EmailCadence,
  type InsertEmailCadence,
  type Analytics,
  type InsertAnalytics,
  type ScanJob,
  type InsertScanJob,
  type ScanResult,
  type InsertScanResult,
  type AuditReport,
  type InsertAuditReport,
  type Client,
  type InsertClient,
  type FeedbackDecision,
  type InsertFeedbackDecision,
  type EdgeCaseLog,
  type InsertEdgeCaseLog,
  type PersonalizedWeights,
  type InsertPersonalizedWeights,
  type ModelVersion,
  type InsertModelVersion,
  type AiHealthMetrics,
  type InsertAiHealthMetrics,
  type EmailCampaign,
  type InsertEmailCampaign,
  type EmailVariant,
  type InsertEmailVariant,
  type EmailSend,
  type InsertEmailSend,
  type EmailEvent,
  type InsertEmailEvent,
  type Consultant,
  type InsertConsultant,
  type Project,
  type InsertProject,
  type Transaction,
  type InsertTransaction,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Prospect methods
  getProspects(): Promise<Prospect[]>;
  getProspect(id: string): Promise<Prospect | undefined>;
  createProspect(prospect: InsertProspect): Promise<Prospect>;
  updateProspect(id: string, prospect: Partial<InsertProspect>): Promise<Prospect | undefined>;
  deleteProspect(id: string): Promise<boolean>;

  // Violation methods
  getViolationsByProspect(prospectId: string): Promise<Violation[]>;
  createViolation(violation: InsertViolation): Promise<Violation>;
  getViolations(): Promise<Violation[]>;

  // Trigger methods
  getTriggers(isActive?: boolean): Promise<Trigger[]>;
  createTrigger(trigger: InsertTrigger): Promise<Trigger>;
  updateTrigger(id: string, trigger: Partial<InsertTrigger>): Promise<Trigger | undefined>;
  deleteTrigger(id: string): Promise<boolean>;

  // Email Cadence methods
  getEmailCadencesByProspect(prospectId: string): Promise<EmailCadence[]>;
  createEmailCadence(cadence: InsertEmailCadence): Promise<EmailCadence>;
  updateEmailCadence(id: string, cadence: Partial<InsertEmailCadence>): Promise<EmailCadence | undefined>;
  updateCadence(id: string, updates: any): Promise<EmailCadence | undefined>;
  deleteEmailCadence(id: string): Promise<boolean>;
  getPendingCadences(): Promise<EmailCadence[]>;
  createEmailTouchLog(data: any): Promise<any>;

  // Analytics methods
  getAnalytics(startDate: Date, endDate: Date): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;

  // Scan Job methods
  getScanJobs(): Promise<ScanJob[]>;
  getScanJob(id: string): Promise<ScanJob | undefined>;
  createScanJob(scanJob: InsertScanJob): Promise<ScanJob>;
  updateScanJob(id: string, scanJob: Partial<ScanJob>): Promise<ScanJob | undefined>;

  // Scan Result methods
  getScanResultsByScanJob(scanJobId: string): Promise<ScanResult[]>;
  createScanResult(scanResult: InsertScanResult): Promise<ScanResult>;

  // Audit Report methods
  getAuditReports(): Promise<AuditReport[]>;
  getAuditReport(id: string): Promise<AuditReport | undefined>;
  createAuditReport(auditReport: InsertAuditReport): Promise<AuditReport>;

  // Client methods
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;

  // AI Feedback & Training methods
  createFeedbackDecision(feedback: InsertFeedbackDecision): Promise<FeedbackDecision>;
  getFeedbackByCustomer(customerId: string): Promise<FeedbackDecision[]>;
  getFeedbackByViolation(customerId: string, violationId: string): Promise<FeedbackDecision[]>;
  createEdgeCaseLog(edgeCase: InsertEdgeCaseLog): Promise<EdgeCaseLog>;
  getEdgeCasesByCustomer(customerId: string): Promise<EdgeCaseLog[]>;
  getPersonalizedWeights(customerId: string): Promise<PersonalizedWeights | undefined>;
  upsertPersonalizedWeights(weights: InsertPersonalizedWeights): Promise<PersonalizedWeights>;
  getLatestModelVersion(): Promise<ModelVersion | undefined>;
  createModelVersion(version: InsertModelVersion): Promise<ModelVersion>;
  getLatestAiHealthMetrics(): Promise<AiHealthMetrics | undefined>;
  createAiHealthMetrics(metrics: InsertAiHealthMetrics): Promise<AiHealthMetrics>;

  // A/B Testing methods
  createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign>;
  getEmailCampaign(id: string): Promise<EmailCampaign | undefined>;
  getAllEmailCampaigns(): Promise<EmailCampaign[]>;
  updateEmailCampaign(id: string, updates: Partial<InsertEmailCampaign>): Promise<EmailCampaign | undefined>;
  createEmailVariant(variant: InsertEmailVariant): Promise<EmailVariant>;
  getVariantsByCampaign(campaignId: string): Promise<EmailVariant[]>;
  updateVariantStats(variantId: string, stats: { sends?: number; opens?: number; clicks?: number; replies?: number }): Promise<void>;
  createEmailSend(send: InsertEmailSend): Promise<EmailSend>;
  createEmailEvent(event: InsertEmailEvent): Promise<EmailEvent>;
  getCampaignAnalytics(campaignId: string): Promise<{ campaign: EmailCampaign; variants: EmailVariant[] }>;

  // Marketplace methods
  getConsultants(): Promise<Consultant[]>;
  getConsultant(id: number): Promise<Consultant | undefined>;
  createConsultant(consultant: InsertConsultant): Promise<Consultant>;
  updateConsultant(id: number, updates: Partial<InsertConsultant>): Promise<Consultant | undefined>;
  
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined>;
  
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByProject(projectId: number): Promise<Transaction[]>;
  getTransactionsByType(type: string): Promise<Transaction[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private prospects: Map<string, Prospect>;
  private violations: Map<string, Violation>;
  private triggers: Map<string, Trigger>;
  private scanJobs: Map<string, ScanJob>;
  private scanResults: Map<string, ScanResult>;
  private auditReports: Map<string, AuditReport>;
  private clients: Map<string, Client>;
  private emailCadences: Map<string, EmailCadence>;
  private analytics: Map<string, Analytics>;
  private emailTouchLogs: Map<string, any>;
  private feedbackDecisions: Map<string, FeedbackDecision>;
  private edgeCaseLogs: Map<string, EdgeCaseLog>;
  private personalizedWeights: Map<string, PersonalizedWeights>;
  private modelVersions: Map<string, ModelVersion>;
  private aiHealthMetrics: Map<string, AiHealthMetrics>;
  private emailCampaigns: Map<string, EmailCampaign>;
  private emailVariants: Map<string, EmailVariant>;
  private emailSends: Map<string, EmailSend>;
  private emailEvents: Map<string, EmailEvent>;

  constructor() {
    this.users = new Map();
    this.prospects = new Map();
    this.violations = new Map();
    this.triggers = new Map();
    this.emailCadences = new Map();
    this.analytics = new Map();
    this.scanJobs = new Map();
    this.scanResults = new Map();
    this.auditReports = new Map();
    this.clients = new Map();
    this.emailTouchLogs = new Map();
    this.feedbackDecisions = new Map();
    this.edgeCaseLogs = new Map();
    this.personalizedWeights = new Map();
    this.modelVersions = new Map();
    this.aiHealthMetrics = new Map();
    this.emailCampaigns = new Map();
    this.emailVariants = new Map();
    this.emailSends = new Map();
    this.emailEvents = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProspects(): Promise<Prospect[]> {
    return Array.from(this.prospects.values());
  }

  async getProspect(id: string): Promise<Prospect | undefined> {
    return this.prospects.get(id);
  }

  async createProspect(insertProspect: InsertProspect): Promise<Prospect> {
    const id = randomUUID();
    const prospect: Prospect = {
      id,
      company: insertProspect.company,
      website: insertProspect.website ?? null,
      industry: insertProspect.industry,
      employees: insertProspect.employees ?? null,
      revenue: insertProspect.revenue ?? null,
      icpScore: insertProspect.icpScore ?? 0,
      violations: insertProspect.violations ?? 0,
      violationSeverity: insertProspect.violationSeverity ?? null,
      status: insertProspect.status ?? "active",
      riskLevel: insertProspect.riskLevel ?? "low-risk",
      currentTouch: insertProspect.currentTouch ?? null,
      nextTouch: insertProspect.nextTouch ?? null,
      nextTouchDate: insertProspect.nextTouchDate ?? null,
      lastContact: insertProspect.lastContact ?? null,
      hubspotContactId: insertProspect.hubspotContactId ?? null,
      createdAt: new Date(),
    };
    this.prospects.set(id, prospect);
    return prospect;
  }

  async updateProspect(id: string, updates: Partial<InsertProspect>): Promise<Prospect | undefined> {
    const prospect = this.prospects.get(id);
    if (!prospect) return undefined;
    
    const updated = { ...prospect, ...updates };
    this.prospects.set(id, updated);
    return updated;
  }

  async deleteProspect(id: string): Promise<boolean> {
    return this.prospects.delete(id);
  }

  async getViolationsByProspect(prospectId: string): Promise<Violation[]> {
    return Array.from(this.violations.values()).filter(
      (v) => v.prospectId === prospectId,
    );
  }

  async createViolation(insertViolation: InsertViolation): Promise<Violation> {
    const id = randomUUID();
    const violation: Violation = {
      id,
      prospectId: insertViolation.prospectId,
      type: insertViolation.type,
      severity: insertViolation.severity,
      wcagLevel: insertViolation.wcagLevel ?? null,
      element: insertViolation.element ?? null,
      description: insertViolation.description ?? null,
      scanDate: new Date(),
    };
    this.violations.set(id, violation);
    return violation;
  }

  async getTriggers(isActive?: boolean): Promise<Trigger[]> {
    const allTriggers = Array.from(this.triggers.values());
    if (isActive === undefined) return allTriggers;
    return allTriggers.filter((t) => t.isActive === isActive);
  }

  async createTrigger(insertTrigger: InsertTrigger): Promise<Trigger> {
    const id = randomUUID();
    const trigger: Trigger = {
      id,
      type: insertTrigger.type,
      title: insertTrigger.title,
      description: insertTrigger.description,
      prospectId: insertTrigger.prospectId ?? null,
      companyName: insertTrigger.companyName ?? null,
      industry: insertTrigger.industry ?? null,
      metadata: insertTrigger.metadata ?? null,
      similarity: insertTrigger.similarity ?? null,
      isActive: insertTrigger.isActive ?? true,
      createdAt: new Date(),
      triggeredCadenceId: insertTrigger.triggeredCadenceId ?? null,
    };
    this.triggers.set(id, trigger);
    return trigger;
  }

  async updateTrigger(id: string, updates: Partial<InsertTrigger>): Promise<Trigger | undefined> {
    const trigger = this.triggers.get(id);
    if (!trigger) return undefined;
    
    const updated = { ...trigger, ...updates };
    this.triggers.set(id, updated);
    return updated;
  }

  async deleteTrigger(id: string): Promise<boolean> {
    return this.triggers.delete(id);
  }

  async getEmailCadencesByProspect(prospectId: string): Promise<EmailCadence[]> {
    return Array.from(this.emailCadences.values()).filter(
      (c) => c.prospectId === prospectId,
    );
  }

  async createEmailCadence(insertCadence: InsertEmailCadence): Promise<EmailCadence> {
    const id = randomUUID();
    const cadence: EmailCadence = {
      id,
      prospectId: insertCadence.prospectId,
      touchNumber: insertCadence.touchNumber,
      subject: insertCadence.subject,
      body: insertCadence.body,
      status: insertCadence.status ?? "pending",
      scheduledDate: insertCadence.scheduledDate ?? null,
      sentDate: insertCadence.sentDate ?? null,
      openedAt: insertCadence.openedAt ?? null,
      clickedAt: insertCadence.clickedAt ?? null,
      repliedAt: insertCadence.repliedAt ?? null,
      createdAt: new Date(),
    };
    this.emailCadences.set(id, cadence);
    return cadence;
  }

  async updateEmailCadence(id: string, updates: Partial<InsertEmailCadence>): Promise<EmailCadence | undefined> {
    const cadence = this.emailCadences.get(id);
    if (!cadence) return undefined;
    
    const updated = { ...cadence, ...updates };
    this.emailCadences.set(id, updated);
    return updated;
  }

  async deleteEmailCadence(id: string): Promise<boolean> {
    return this.emailCadences.delete(id);
  }

  async updateCadence(id: string, updates: any): Promise<EmailCadence | undefined> {
    return this.updateEmailCadence(id, updates);
  }

  async getPendingCadences(): Promise<EmailCadence[]> {
    return Array.from(this.emailCadences.values()).filter(
      (c) => c.status === 'active' || c.status === 'pending'
    );
  }

  async createEmailTouchLog(data: any): Promise<any> {
    const id = randomUUID();
    const log = { id, ...data, createdAt: new Date() };
    this.emailTouchLogs.set(id, log);
    return log;
  }

  async getAnalytics(startDate: Date, endDate: Date): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(
      (a) => a.date >= startDate && a.date <= endDate,
    );
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = randomUUID();
    const analytics: Analytics = {
      id,
      date: insertAnalytics.date,
      activeProspects: insertAnalytics.activeProspects ?? 0,
      emailsSent: insertAnalytics.emailsSent ?? 0,
      emailsOpened: insertAnalytics.emailsOpened ?? 0,
      emailsClicked: insertAnalytics.emailsClicked ?? 0,
      emailsReplied: insertAnalytics.emailsReplied ?? 0,
      demoBookings: insertAnalytics.demoBookings ?? 0,
      avgIcpScore: insertAnalytics.avgIcpScore ?? 0,
      openRate: insertAnalytics.openRate ?? 0,
      replyRate: insertAnalytics.replyRate ?? 0,
      clickRate: insertAnalytics.clickRate ?? 0,
    };
    this.analytics.set(id, analytics);
    return analytics;
  }

  async getScanJobs(): Promise<ScanJob[]> {
    return Array.from(this.scanJobs.values());
  }

  async getScanJob(id: string): Promise<ScanJob | undefined> {
    return this.scanJobs.get(id);
  }

  async createScanJob(insertScanJob: InsertScanJob): Promise<ScanJob> {
    const id = randomUUID();
    const scanJob: ScanJob = {
      id,
      url: insertScanJob.url,
      status: insertScanJob.status ?? "pending",
      prospectId: insertScanJob.prospectId ?? null,
      totalViolations: insertScanJob.totalViolations ?? 0,
      criticalCount: insertScanJob.criticalCount ?? 0,
      seriousCount: insertScanJob.seriousCount ?? 0,
      moderateCount: insertScanJob.moderateCount ?? 0,
      minorCount: insertScanJob.minorCount ?? 0,
      wcagScore: insertScanJob.wcagScore ?? 0,
      scanDuration: insertScanJob.scanDuration ?? null,
      errorMessage: insertScanJob.errorMessage ?? null,
      startedAt: new Date(),
      completedAt: null,
      createdAt: new Date(),
      originalHtml: insertScanJob.originalHtml ?? null,
      originalCss: insertScanJob.originalCss ?? null,
    };
    this.scanJobs.set(id, scanJob);
    return scanJob;
  }

  async updateScanJob(id: string, updates: Partial<ScanJob>): Promise<ScanJob | undefined> {
    const scanJob = this.scanJobs.get(id);
    if (!scanJob) return undefined;

    const updated = { ...scanJob, ...updates };
    this.scanJobs.set(id, updated);
    return updated;
  }

  async getScanResultsByScanJob(scanJobId: string): Promise<ScanResult[]> {
    return Array.from(this.scanResults.values()).filter(
      (r) => r.scanJobId === scanJobId,
    );
  }

  async createScanResult(insertScanResult: InsertScanResult): Promise<ScanResult> {
    const id = randomUUID();
    const scanResult: ScanResult = {
      id,
      createdAt: new Date(),
      severity: insertScanResult.severity,
      wcagLevel: insertScanResult.wcagLevel ?? null,
      description: insertScanResult.description ?? "",
      scanJobId: insertScanResult.scanJobId,
      violationType: insertScanResult.violationType,
      wcagCriterion: insertScanResult.wcagCriterion,
      impact: insertScanResult.impact,
      element: insertScanResult.element ?? null,
      selector: insertScanResult.selector ?? null,
      htmlSnippet: insertScanResult.htmlSnippet ?? null,
      helpUrl: insertScanResult.helpUrl ?? null,
      howToFix: insertScanResult.howToFix ?? null,
    };
    this.scanResults.set(id, scanResult);
    return scanResult;
  }

  async getAuditReports(): Promise<AuditReport[]> {
    return Array.from(this.auditReports.values());
  }

  async getAuditReport(id: string): Promise<AuditReport | undefined> {
    return this.auditReports.get(id);
  }

  async createAuditReport(insertAuditReport: InsertAuditReport): Promise<AuditReport> {
    const id = randomUUID();
    const auditReport: AuditReport = {
      id,
      title: insertAuditReport.title,
      scanJobId: insertAuditReport.scanJobId,
      prospectId: insertAuditReport.prospectId ?? null,
      reportType: insertAuditReport.reportType ?? "",
      executiveSummary: insertAuditReport.executiveSummary ?? null,
      legalRiskAssessment: insertAuditReport.legalRiskAssessment ?? null,
      estimatedCost: insertAuditReport.estimatedCost ?? null,
      estimatedTimeline: insertAuditReport.estimatedTimeline ?? null,
      pdfUrl: insertAuditReport.pdfUrl ?? null,
      generatedAt: new Date(),
    };
    this.auditReports.set(id, auditReport);
    return auditReport;
  }

  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: string): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = randomUUID();
    const client: Client = {
      id,
      company: insertClient.company,
      website: insertClient.website ?? null,
      industry: insertClient.industry ?? null,
      status: insertClient.status ?? "active",
      createdAt: new Date(),
      contactName: insertClient.contactName ?? null,
      contactEmail: insertClient.contactEmail ?? null,
      contactPhone: insertClient.contactPhone ?? null,
      consultantNotes: insertClient.consultantNotes ?? null,
      updatedAt: new Date(),
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: string, updates: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;

    const updated = { ...client, ...updates, updatedAt: new Date() };
    this.clients.set(id, updated);
    return updated;
  }

  async getViolations(): Promise<Violation[]> {
    return Array.from(this.violations.values());
  }

  // AI Feedback & Training methods
  async createFeedbackDecision(insertFeedback: InsertFeedbackDecision): Promise<FeedbackDecision> {
    const id = randomUUID();
    const feedback: FeedbackDecision = {
      id,
      customerId: insertFeedback.customerId,
      violationId: insertFeedback.violationId,
      recommendationText: insertFeedback.recommendationText,
      actionTaken: insertFeedback.actionTaken,
      reasonProvided: insertFeedback.reasonProvided ?? null,
      confidenceScore: insertFeedback.confidenceScore ?? null,
      actualOutcome: insertFeedback.actualOutcome ?? null,
      createdAt: new Date(),
      timestamp: new Date(),
    };
    this.feedbackDecisions.set(id, feedback);
    return feedback;
  }

  async getFeedbackByCustomer(customerId: string): Promise<FeedbackDecision[]> {
    return Array.from(this.feedbackDecisions.values()).filter(
      (f) => f.customerId === customerId
    );
  }

  async getFeedbackByViolation(customerId: string, violationId: string): Promise<FeedbackDecision[]> {
    return Array.from(this.feedbackDecisions.values()).filter(
      (f) => f.customerId === customerId && f.violationId === violationId
    );
  }

  async createEdgeCaseLog(insertEdgeCase: InsertEdgeCaseLog): Promise<EdgeCaseLog> {
    const id = randomUUID();
    const edgeCase: EdgeCaseLog = {
      id,
      violationType: insertEdgeCase.violationType,
      customerId: insertEdgeCase.customerId,
      whenModelFailed: insertEdgeCase.whenModelFailed,
      context: insertEdgeCase.context ?? null,
      resolved: false,
      resolutionNotes: insertEdgeCase.resolutionNotes ?? null,
      createdAt: new Date(),
      flaggedAt: new Date(),
    };
    this.edgeCaseLogs.set(id, edgeCase);
    return edgeCase;
  }

  async getEdgeCasesByCustomer(customerId: string): Promise<EdgeCaseLog[]> {
    return Array.from(this.edgeCaseLogs.values()).filter(
      (e) => e.customerId === customerId
    );
  }

  async getPersonalizedWeights(customerId: string): Promise<PersonalizedWeights | undefined> {
    return Array.from(this.personalizedWeights.values()).find(
      (w) => w.customerId === customerId
    );
  }

  async upsertPersonalizedWeights(insertWeights: InsertPersonalizedWeights): Promise<PersonalizedWeights> {
    const existing = await this.getPersonalizedWeights(insertWeights.customerId);
    if (existing) {
      const updated: PersonalizedWeights = {
        ...existing,
        ...insertWeights,
        lastUpdated: new Date(),
      };
      this.personalizedWeights.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const weights: PersonalizedWeights = {
        id,
        customerId: insertWeights.customerId,
        category: insertWeights.category,
        weight: insertWeights.weight ?? 0,
        trainingDataCount: insertWeights.trainingDataCount ?? 0,
        createdAt: new Date(),
        lastUpdated: new Date(),
      };
      this.personalizedWeights.set(id, weights);
      return weights;
    }
  }

  async getLatestModelVersion(): Promise<ModelVersion | undefined> {
    const versions = Array.from(this.modelVersions.values());
    if (versions.length === 0) return undefined;
    return versions.sort((a, b) => b.deployedAt.getTime() - a.deployedAt.getTime())[0];
  }

  async createModelVersion(insertModelVersion: InsertModelVersion): Promise<ModelVersion> {
    const id = randomUUID();
    const version: ModelVersion = {
      id,
      versionNumber: insertModelVersion.versionNumber,
      modelType: insertModelVersion.modelType,
      accuracy: insertModelVersion.accuracy ?? 0,
      falsePositiveRate: insertModelVersion.falsePositiveRate ?? 0,
      confidenceCalibration: insertModelVersion.confidenceCalibration ?? 0,
      trainingDataSize: insertModelVersion.trainingDataSize ?? 0,
      deployedAt: new Date(),
      rollbackedAt: insertModelVersion.rollbackedAt ?? null,
      rollbackReason: insertModelVersion.rollbackReason ?? null,
      createdAt: new Date(),
    };
    this.modelVersions.set(id, version);
    return version;
  }

  async getLatestAiHealthMetrics(): Promise<AiHealthMetrics | undefined> {
    const metrics = Array.from(this.aiHealthMetrics.values());
    if (metrics.length === 0) return undefined;
    return metrics.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
  }

  async createAiHealthMetrics(insertMetrics: InsertAiHealthMetrics): Promise<AiHealthMetrics> {
    const id = randomUUID();
    const metrics: AiHealthMetrics = {
      id,
      date: new Date(),
      createdAt: new Date(),
      falsePositiveRate: insertMetrics.falsePositiveRate ?? 0,
      confidenceCalibration: insertMetrics.confidenceCalibration ?? 0,
      overallAccuracy: insertMetrics.overallAccuracy ?? 0,
      categoryAccuracy: insertMetrics.categoryAccuracy ?? null,
      recommendationsFollowed: insertMetrics.recommendationsFollowed ?? 0,
      recommendationsRejected: insertMetrics.recommendationsRejected ?? 0,
      edgeCasesFlagged: insertMetrics.edgeCasesFlagged ?? 0,
      modelVersion: insertMetrics.modelVersion ?? "",
    };
    this.aiHealthMetrics.set(id, metrics);
    return metrics;
  }

  // A/B Testing methods
  async createEmailCampaign(insertCampaign: InsertEmailCampaign): Promise<EmailCampaign> {
    const id = randomUUID();
    const campaign: EmailCampaign = {
      id,
      name: insertCampaign.name,
      industry: insertCampaign.industry ?? null,
      touchNumber: insertCampaign.touchNumber ?? null,
      goal: insertCampaign.goal,
      status: insertCampaign.status ?? "draft",
      startDate: insertCampaign.startDate ?? null,
      endDate: insertCampaign.endDate ?? null,
      winnerVariantId: insertCampaign.winnerVariantId ?? null,
      totalSends: insertCampaign.totalSends ?? 0,
      totalOpens: insertCampaign.totalOpens ?? 0,
      totalClicks: insertCampaign.totalClicks ?? 0,
      totalReplies: insertCampaign.totalReplies ?? 0,
      createdAt: new Date(),
    };
    this.emailCampaigns.set(id, campaign);
    return campaign;
  }

  async getEmailCampaign(id: string): Promise<EmailCampaign | undefined> {
    return this.emailCampaigns.get(id);
  }

  async getAllEmailCampaigns(): Promise<EmailCampaign[]> {
    return Array.from(this.emailCampaigns.values());
  }

  async updateEmailCampaign(id: string, updates: Partial<InsertEmailCampaign>): Promise<EmailCampaign | undefined> {
    const campaign = this.emailCampaigns.get(id);
    if (!campaign) return undefined;
    
    const updated = { ...campaign, ...updates };
    this.emailCampaigns.set(id, updated);
    return updated;
  }

  async createEmailVariant(insertVariant: InsertEmailVariant): Promise<EmailVariant> {
    const id = randomUUID();
    const variant: EmailVariant = {
      id,
      campaignId: insertVariant.campaignId,
      variantName: insertVariant.variantName,
      subjectLine: insertVariant.subjectLine,
      emailBody: insertVariant.emailBody,
      sends: insertVariant.sends ?? 0,
      opens: insertVariant.opens ?? 0,
      clicks: insertVariant.clicks ?? 0,
      replies: insertVariant.replies ?? 0,
      openRate: insertVariant.openRate ?? 0,
      clickRate: insertVariant.clickRate ?? 0,
      replyRate: insertVariant.replyRate ?? 0,
      createdAt: new Date(),
    };
    this.emailVariants.set(id, variant);
    return variant;
  }

  async getVariantsByCampaign(campaignId: string): Promise<EmailVariant[]> {
    return Array.from(this.emailVariants.values()).filter(
      (v) => v.campaignId === campaignId
    );
  }

  async updateVariantStats(variantId: string, stats: { sends?: number; opens?: number; clicks?: number; replies?: number }): Promise<void> {
    const variant = this.emailVariants.get(variantId);
    if (!variant) return;

    if (stats.sends !== undefined) variant.sends = stats.sends;
    if (stats.opens !== undefined) variant.opens = stats.opens;
    if (stats.clicks !== undefined) variant.clicks = stats.clicks;
    if (stats.replies !== undefined) variant.replies = stats.replies;

    // Calculate rates
    if (variant.sends > 0) {
      variant.openRate = Math.round((variant.opens / variant.sends) * 100);
      variant.clickRate = Math.round((variant.clicks / variant.sends) * 100);
      variant.replyRate = Math.round((variant.replies / variant.sends) * 100);
    }

    this.emailVariants.set(variantId, variant);
  }

  async createEmailSend(insertSend: InsertEmailSend): Promise<EmailSend> {
    const id = randomUUID();
    const send: EmailSend = {
      id,
      campaignId: insertSend.campaignId,
      variantId: insertSend.variantId,
      prospectId: insertSend.prospectId ?? null,
      recipientEmail: insertSend.recipientEmail,
      recipientName: insertSend.recipientName ?? null,
      sentAt: new Date(),
    };
    this.emailSends.set(id, send);
    return send;
  }

  async createEmailEvent(insertEvent: InsertEmailEvent): Promise<EmailEvent> {
    const id = randomUUID();
    const event: EmailEvent = {
      id,
      sendId: insertEvent.sendId,
      eventType: insertEvent.eventType,
      timestamp: new Date(),
      metadata: insertEvent.metadata ?? null,
    };
    this.emailEvents.set(id, event);
    return event;
  }

  async getCampaignAnalytics(campaignId: string): Promise<{ campaign: EmailCampaign; variants: EmailVariant[] }> {
    const campaign = this.emailCampaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign with id ${campaignId} not found`);
    }
    
    const variants = await this.getVariantsByCampaign(campaignId);
    return { campaign, variants };
  }
}

export const storage = new MemStorage();
// Marketplace methods
MemStorage.prototype.getConsultants = async function(): Promise<Consultant[]> { return []; };
MemStorage.prototype.getConsultant = async function(id: number): Promise<Consultant | undefined> { return undefined; };
MemStorage.prototype.createConsultant = async function(consultant: InsertConsultant): Promise<Consultant> {
  return {
    id: Math.floor(Math.random() * 100000),
    name: consultant.name,
    createdAt: new Date(),
    title: consultant.title ?? null,
    email: consultant.email,
    bio: consultant.bio ?? null,
    hourlyRate: consultant.hourlyRate ?? null,
    expertise: consultant.expertise ?? null,
    industries: consultant.industries ?? null,
    available: consultant.available ?? null,
    company: consultant.company ?? null,
    website: consultant.website ?? null,
    contactPhone: consultant.contactPhone ?? null,
    contactEmail: consultant.contactEmail ?? null,
    consultantNotes: consultant.consultantNotes ?? null,
    updatedAt: new Date(),
  };
};
MemStorage.prototype.updateConsultant = async function(id: number, updates: Partial<InsertConsultant>): Promise<Consultant | undefined> { return undefined; };
MemStorage.prototype.getProjects = async function(): Promise<Project[]> { return []; };
MemStorage.prototype.getProject = async function(id: number): Promise<Project | undefined> { return undefined; };
MemStorage.prototype.createProject = async function(project: InsertProject): Promise<Project> {
  return {
    id: Math.floor(Math.random() * 100000),
    industry: project.industry ?? null,
    status: project.status ?? null,
    createdAt: new Date(),
    description: project.description ?? null,
    title: project.title,
    category: project.category ?? null,
    clientId: project.clientId ?? null,
    consultantId: project.consultantId ?? null,
    matchReasons: project.matchReasons ?? null,
    updatedAt: new Date(),
  };
};
MemStorage.prototype.updateProject = async function(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> { return undefined; };
MemStorage.prototype.createTransaction = async function(transaction: InsertTransaction): Promise<Transaction> {
  return {
    id: Math.floor(Math.random() * 100000),
    status: transaction.status ?? null,
    createdAt: new Date(),
    type: transaction.type,
    projectId: transaction.projectId ?? null,
    amount: transaction.amount,
  };
};
MemStorage.prototype.getTransactionsByProject = async function(projectId: number): Promise<Transaction[]> { return []; };
MemStorage.prototype.getTransactionsByType = async function(type: string): Promise<Transaction[]> { return []; };
