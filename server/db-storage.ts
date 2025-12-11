import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";
import {
  users,
  prospects,
  violations,
  triggers,
  emailCadences,
  analytics,
  scanJobs,
  scanResults,
  auditReports,
  clients,
  feedbackDecisions,
  edgeCaseLogs,
  personalizedWeights,
  modelVersions,
  aiHealthMetrics,
  emailCampaigns,
  emailVariants,
  emailSends,
  emailEvents,
  consultants,
  projects,
  transactions,
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
import type { IStorage } from "./storage";

export class PostgresStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Prospect methods
  async getProspects(): Promise<Prospect[]> {
    return await db.select().from(prospects);
  }

  async getProspect(id: string): Promise<Prospect | undefined> {
    const [prospect] = await db.select().from(prospects).where(eq(prospects.id, id)).limit(1);
    return prospect;
  }

  async createProspect(insertProspect: InsertProspect): Promise<Prospect> {
    const [prospect] = await db.insert(prospects).values(insertProspect).returning();
    return prospect;
  }

  async updateProspect(id: string, updates: Partial<InsertProspect>): Promise<Prospect | undefined> {
    const [prospect] = await db.update(prospects).set(updates).where(eq(prospects.id, id)).returning();
    return prospect;
  }

  async deleteProspect(id: string): Promise<boolean> {
    const result = await db.delete(prospects).where(eq(prospects.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Violation methods
  async getViolationsByProspect(prospectId: string): Promise<Violation[]> {
    return await db.select().from(violations).where(eq(violations.prospectId, prospectId));
  }

  async createViolation(insertViolation: InsertViolation): Promise<Violation> {
    const [violation] = await db.insert(violations).values(insertViolation).returning();
    return violation;
  }

  // Trigger methods
  async getTriggers(isActive?: boolean): Promise<Trigger[]> {
    if (isActive === undefined) {
      return await db.select().from(triggers);
    }
    return await db.select().from(triggers).where(eq(triggers.isActive, isActive));
  }

  async createTrigger(insertTrigger: InsertTrigger): Promise<Trigger> {
    const [trigger] = await db.insert(triggers).values(insertTrigger).returning();
    return trigger;
  }

  async updateTrigger(id: string, updates: Partial<InsertTrigger>): Promise<Trigger | undefined> {
    const [trigger] = await db.update(triggers).set(updates).where(eq(triggers.id, id)).returning();
    return trigger;
  }

  async deleteTrigger(id: string): Promise<boolean> {
    const result = await db.delete(triggers).where(eq(triggers.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Email Cadence methods
  async getEmailCadencesByProspect(prospectId: string): Promise<EmailCadence[]> {
    return await db.select().from(emailCadences).where(eq(emailCadences.prospectId, prospectId));
  }

  async createEmailCadence(insertCadence: InsertEmailCadence): Promise<EmailCadence> {
    const [cadence] = await db.insert(emailCadences).values(insertCadence).returning();
    return cadence;
  }

  async updateEmailCadence(id: string, updates: Partial<InsertEmailCadence>): Promise<EmailCadence | undefined> {
    const [cadence] = await db.update(emailCadences).set(updates).where(eq(emailCadences.id, id)).returning();
    return cadence;
  }

  async deleteEmailCadence(id: string): Promise<boolean> {
    const result = await db.delete(emailCadences).where(eq(emailCadences.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Analytics methods
  async getAnalytics(startDate: Date, endDate: Date): Promise<Analytics[]> {
    return await db.select().from(analytics).where(
      and(
        gte(analytics.date, startDate),
        lte(analytics.date, endDate)
      )
    );
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const [analytic] = await db.insert(analytics).values(insertAnalytics).returning();
    return analytic;
  }

  // Scan Job methods
  async getScanJobs(): Promise<ScanJob[]> {
    return await db.select().from(scanJobs);
  }

  async getScanJob(id: string): Promise<ScanJob | undefined> {
    const [scanJob] = await db.select().from(scanJobs).where(eq(scanJobs.id, id)).limit(1);
    return scanJob;
  }

  async createScanJob(insertScanJob: InsertScanJob): Promise<ScanJob> {
    const [scanJob] = await db.insert(scanJobs).values(insertScanJob).returning();
    return scanJob;
  }

  async updateScanJob(id: string, updates: Partial<ScanJob>): Promise<ScanJob | undefined> {
    const [scanJob] = await db.update(scanJobs).set(updates).where(eq(scanJobs.id, id)).returning();
    return scanJob;
  }

  // Scan Result methods
  async getScanResultsByScanJob(scanJobId: string): Promise<ScanResult[]> {
    return await db.select().from(scanResults).where(eq(scanResults.scanJobId, scanJobId));
  }

  async createScanResult(insertScanResult: InsertScanResult): Promise<ScanResult> {
    const [scanResult] = await db.insert(scanResults).values(insertScanResult).returning();
    return scanResult;
  }

  // Audit Report methods
  async getAuditReports(): Promise<AuditReport[]> {
    return await db.select().from(auditReports);
  }

  async getAuditReport(id: string): Promise<AuditReport | undefined> {
    const [auditReport] = await db.select().from(auditReports).where(eq(auditReports.id, id)).limit(1);
    return auditReport;
  }

  async createAuditReport(insertAuditReport: InsertAuditReport): Promise<AuditReport> {
    const [auditReport] = await db.insert(auditReports).values(insertAuditReport).returning();
    return auditReport;
  }

  // Client methods
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
    return client;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }

  async updateClient(id: string, updates: Partial<InsertClient>): Promise<Client | undefined> {
    const [client] = await db.update(clients).set(updates).where(eq(clients.id, id)).returning();
    return client;
  }

  // AI Feedback & Training methods (PRIVACY: Customer-scoped queries only)
  
  async createFeedbackDecision(insertFeedback: InsertFeedbackDecision): Promise<FeedbackDecision> {
    const [feedback] = await db.insert(feedbackDecisions).values(insertFeedback).returning();
    return feedback;
  }

  async getFeedbackByCustomer(customerId: string): Promise<FeedbackDecision[]> {
    // PRIVACY: Only return feedback for this customer (never cross-customer)
    return await db.select().from(feedbackDecisions).where(eq(feedbackDecisions.customerId, customerId));
  }

  async getFeedbackByViolation(customerId: string, violationId: string): Promise<FeedbackDecision[]> {
    // PRIVACY: Customer-scoped query
    return await db.select().from(feedbackDecisions).where(
      and(
        eq(feedbackDecisions.customerId, customerId),
        eq(feedbackDecisions.violationId, violationId)
      )
    );
  }

  async createEdgeCaseLog(insertEdgeCase: InsertEdgeCaseLog): Promise<EdgeCaseLog> {
    const [edgeCase] = await db.insert(edgeCaseLogs).values(insertEdgeCase).returning();
    return edgeCase;
  }

  async getEdgeCasesByCustomer(customerId: string): Promise<EdgeCaseLog[]> {
    // PRIVACY: Customer-scoped only
    return await db.select().from(edgeCaseLogs).where(eq(edgeCaseLogs.customerId, customerId));
  }

  async getPersonalizedWeights(customerId: string): Promise<PersonalizedWeights | undefined> {
    // PRIVACY: One set of weights per customer
    const [weights] = await db.select().from(personalizedWeights).where(eq(personalizedWeights.customerId, customerId)).limit(1);
    return weights;
  }

  async upsertPersonalizedWeights(insertWeights: InsertPersonalizedWeights): Promise<PersonalizedWeights> {
    // PRIVACY: Upsert customer-specific weights
    const existing = await this.getPersonalizedWeights(insertWeights.customerId);
    if (existing) {
      const [updated] = await db.update(personalizedWeights).set(insertWeights).where(eq(personalizedWeights.customerId, insertWeights.customerId)).returning();
      return updated;
    } else {
      const [created] = await db.insert(personalizedWeights).values(insertWeights).returning();
      return created;
    }
  }

  async getLatestModelVersion(): Promise<ModelVersion | undefined> {
    const [version] = await db.select().from(modelVersions).orderBy(modelVersions.deployedAt).limit(1);
    return version;
  }

  async createModelVersion(insertModelVersion: InsertModelVersion): Promise<ModelVersion> {
    const [version] = await db.insert(modelVersions).values(insertModelVersion).returning();
    return version;
  }

  async getLatestAiHealthMetrics(): Promise<AiHealthMetrics | undefined> {
    const [metrics] = await db.select().from(aiHealthMetrics).orderBy(aiHealthMetrics.date).limit(1);
    return metrics;
  }

  async createAiHealthMetrics(insertMetrics: InsertAiHealthMetrics): Promise<AiHealthMetrics> {
    const [metrics] = await db.insert(aiHealthMetrics).values(insertMetrics).returning();
    return metrics;
  }

  async getViolations(): Promise<Violation[]> {
    return await db.select().from(violations);
  }

  // A/B Testing methods

  async createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign> {
    const [emailCampaign] = await db.insert(emailCampaigns).values(campaign).returning();
    return emailCampaign;
  }

  async getEmailCampaign(id: string): Promise<EmailCampaign | undefined> {
    const [campaign] = await db.select().from(emailCampaigns).where(eq(emailCampaigns.id, id)).limit(1);
    return campaign;
  }

  async getAllEmailCampaigns(): Promise<EmailCampaign[]> {
    return await db.select().from(emailCampaigns);
  }

  async updateEmailCampaign(id: string, updates: Partial<InsertEmailCampaign>): Promise<EmailCampaign | undefined> {
    const [campaign] = await db.update(emailCampaigns).set(updates).where(eq(emailCampaigns.id, id)).returning();
    return campaign;
  }

  async createEmailVariant(variant: InsertEmailVariant): Promise<EmailVariant> {
    const [emailVariant] = await db.insert(emailVariants).values(variant).returning();
    return emailVariant;
  }

  async getVariantsByCampaign(campaignId: string): Promise<EmailVariant[]> {
    return await db.select().from(emailVariants).where(eq(emailVariants.campaignId, campaignId));
  }

  async updateVariantStats(variantId: string, stats: { sends?: number; opens?: number; clicks?: number; replies?: number }): Promise<void> {
    const [currentVariant] = await db.select().from(emailVariants).where(eq(emailVariants.id, variantId)).limit(1);
    if (!currentVariant) {
      return;
    }

    const newSends = stats.sends ?? currentVariant.sends;
    const newOpens = stats.opens ?? currentVariant.opens;
    const newClicks = stats.clicks ?? currentVariant.clicks;
    const newReplies = stats.replies ?? currentVariant.replies;

    const openRate = newSends > 0 ? Math.round((newOpens / newSends) * 100) : 0;
    const clickRate = newSends > 0 ? Math.round((newClicks / newSends) * 100) : 0;
    const replyRate = newSends > 0 ? Math.round((newReplies / newSends) * 100) : 0;

    await db.update(emailVariants).set({
      sends: newSends,
      opens: newOpens,
      clicks: newClicks,
      replies: newReplies,
      openRate,
      clickRate,
      replyRate,
    }).where(eq(emailVariants.id, variantId));
  }

  async createEmailSend(send: InsertEmailSend): Promise<EmailSend> {
    const [emailSend] = await db.insert(emailSends).values(send).returning();
    return emailSend;
  }

  async createEmailEvent(event: InsertEmailEvent): Promise<EmailEvent> {
    const [emailEvent] = await db.insert(emailEvents).values(event).returning();
    return emailEvent;
  }

  async getCampaignAnalytics(campaignId: string): Promise<{ campaign: EmailCampaign; variants: EmailVariant[] }> {
    const [campaign] = await db.select().from(emailCampaigns).where(eq(emailCampaigns.id, campaignId)).limit(1);
    if (!campaign) {
      throw new Error(`Campaign with id ${campaignId} not found`);
    }

    const variants = await db.select().from(emailVariants).where(eq(emailVariants.campaignId, campaignId));

    return { campaign, variants };
  }

  // Marketplace methods - Consultants
  async getConsultants(): Promise<Consultant[]> {
    return await db.select().from(consultants);
  }

  async getConsultant(id: number): Promise<Consultant | undefined> {
    const [consultant] = await db.select().from(consultants).where(eq(consultants.id, id)).limit(1);
    return consultant;
  }

  async createConsultant(insertConsultant: InsertConsultant): Promise<Consultant> {
    const [consultant] = await db.insert(consultants).values(insertConsultant).returning();
    return consultant;
  }

  async updateConsultant(id: number, updates: Partial<InsertConsultant>): Promise<Consultant | undefined> {
    const [consultant] = await db.update(consultants).set(updates).where(eq(consultants.id, id)).returning();
    return consultant;
  }

  // Marketplace methods - Projects
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return project;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db.update(projects).set(updates).where(eq(projects.id, id)).returning();
    return project;
  }

  // Marketplace methods - Transactions
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    return transaction;
  }

  async getTransactionsByProject(projectId: number): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.projectId, projectId));
  }

  async getTransactionsByType(type: string): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.type, type));
  }
    // Missing IStorage methods (stubs)
    async updateCadence(id: string, updates: any): Promise<EmailCadence | undefined> {
      // TODO: Implement actual logic
      return undefined;
    }
    async getPendingCadences(): Promise<EmailCadence[]> {
      // TODO: Implement actual logic
      return [];
    }
    async createEmailTouchLog(data: any): Promise<any> {
      // TODO: Implement actual logic
      return {};
    }
}

export const storage = new PostgresStorage();
