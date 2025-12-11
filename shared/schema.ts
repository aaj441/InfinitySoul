import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, serial, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const prospects = pgTable("prospects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company: text("company").notNull(),
  website: text("website"),
  industry: text("industry").notNull(),
  employees: text("employees"),
  revenue: text("revenue"),
  icpScore: integer("icp_score").notNull().default(0),
  violations: integer("violations").notNull().default(0),
  violationSeverity: text("violation_severity"),
  status: text("status").notNull().default("active"),
  riskLevel: text("risk_level").notNull().default("low-risk"),
  currentTouch: text("current_touch"),
  nextTouch: text("next_touch"),
  nextTouchDate: timestamp("next_touch_date"),
  lastContact: timestamp("last_contact"),
  hubspotContactId: text("hubspot_contact_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const violations = pgTable("violations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  prospectId: varchar("prospect_id").notNull().references(() => prospects.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  severity: text("severity").notNull(),
  wcagLevel: text("wcag_level"),
  element: text("element"),
  description: text("description"),
  scanDate: timestamp("scan_date").notNull().defaultNow(),
});

export const triggers = pgTable("triggers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  prospectId: varchar("prospect_id").references(() => prospects.id, { onDelete: "set null" }),
  companyName: text("company_name"),
  industry: text("industry"),
  metadata: jsonb("metadata"),
  similarity: integer("similarity"),
  isActive: boolean("is_active").notNull().default(true),
  triggeredCadenceId: varchar("triggered_cadence_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const emailCadences = pgTable("email_cadences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  prospectId: varchar("prospect_id").notNull().references(() => prospects.id, { onDelete: "cascade" }),
  touchNumber: integer("touch_number").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("pending"),
  scheduledDate: timestamp("scheduled_date"),
  sentDate: timestamp("sent_date"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  repliedAt: timestamp("replied_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const doNotContact = pgTable("do_not_contact", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email"),
  domain: text("domain"),
  prospectId: varchar("prospect_id"),
  reason: text("reason").notNull(),
  permanent: boolean("permanent").notNull().default(true),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});

export const emailHistory = pgTable("email_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  prospectId: varchar("prospect_id").notNull().references(() => prospects.id, { onDelete: "cascade" }),
  emailType: text("email_type").notNull(), // 'cold', 'follow-up', 'audit-report'
  subject: text("subject").notNull(),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  wasPermissionGranted: boolean("was_permission_granted").notNull().default(false),
});

export const ethicalMetrics = pgTable("ethical_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull().defaultNow(),
  freeAuditsDelivered: integer("free_audits_delivered").notNull().default(0),
  paidAuditsDelivered: integer("paid_audits_delivered").notNull().default(0),
  emailsSentThisWeek: integer("emails_sent_this_week").notNull().default(0),
  doNotContactListSize: integer("do_not_contact_list_size").notNull().default(0),
  unsubscribeRate: integer("unsubscribe_rate").notNull().default(0),
});

export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  activeProspects: integer("active_prospects").notNull().default(0),
  emailsSent: integer("emails_sent").notNull().default(0),
  emailsOpened: integer("emails_opened").notNull().default(0),
  emailsClicked: integer("emails_clicked").notNull().default(0),
  emailsReplied: integer("emails_replied").notNull().default(0),
  demoBookings: integer("demo_bookings").notNull().default(0),
  avgIcpScore: integer("avg_icp_score").notNull().default(0),
  openRate: integer("open_rate").notNull().default(0),
  replyRate: integer("reply_rate").notNull().default(0),
  clickRate: integer("click_rate").notNull().default(0),
});

export const scanJobs = pgTable("scan_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  status: text("status").notNull().default("pending"),
  prospectId: varchar("prospect_id").references(() => prospects.id, { onDelete: "set null" }),
  totalViolations: integer("total_violations").notNull().default(0),
  criticalCount: integer("critical_count").notNull().default(0),
  seriousCount: integer("serious_count").notNull().default(0),
  moderateCount: integer("moderate_count").notNull().default(0),
  minorCount: integer("minor_count").notNull().default(0),
  wcagScore: integer("wcag_score").notNull().default(0),
  scanDuration: integer("scan_duration"),
  errorMessage: text("error_message"),
  originalHtml: text("original_html"),
  originalCss: text("original_css"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const scanResults = pgTable("scan_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scanJobId: varchar("scan_job_id").notNull().references(() => scanJobs.id, { onDelete: "cascade" }),
  violationType: text("violation_type").notNull(),
  wcagCriterion: text("wcag_criterion").notNull(),
  wcagLevel: text("wcag_level").notNull(),
  severity: text("severity").notNull(),
  impact: text("impact").notNull(),
  element: text("element"),
  selector: text("selector"),
  htmlSnippet: text("html_snippet"),
  description: text("description").notNull(),
  helpUrl: text("help_url"),
  howToFix: text("how_to_fix"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const auditReports = pgTable("audit_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scanJobId: varchar("scan_job_id").notNull().references(() => scanJobs.id, { onDelete: "cascade" }),
  prospectId: varchar("prospect_id").references(() => prospects.id, { onDelete: "set null" }),
  reportType: text("report_type").notNull().default("quick-win"),
  title: text("title").notNull(),
  executiveSummary: text("executive_summary"),
  legalRiskAssessment: text("legal_risk_assessment"),
  estimatedCost: text("estimated_cost"),
  estimatedTimeline: text("estimated_timeline"),
  pdfUrl: text("pdf_url"),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
});

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  company: text("company").notNull(),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  website: text("website"),
  industry: text("industry"),
  status: text("status").notNull().default("prospect"),
  consultantNotes: text("consultant_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const emailTemplates = pgTable("email_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  category: text("category").notNull(), // 'cold', 'follow-up', 'closing'
  touchNumber: integer("touch_number"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderName: text("sender_name").notNull(),
  senderTitle: text("sender_title").notNull(),
  senderEmail: text("sender_email").notNull(),
  companyName: text("company_name").notNull(),
  maxEmailsPerWeek: integer("max_emails_per_week").notNull().default(50),
  emailsPerProspect: integer("emails_per_prospect").notNull().default(1),
  darkMode: boolean("dark_mode").notNull().default(false),
  notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const slackIntegrations = pgTable("slack_integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  webhookUrl: text("webhook_url").notNull(),
  channelName: text("channel_name").notNull(),
  alertsEnabled: boolean("alerts_enabled").notNull().default(true),
  statusUpdatesEnabled: boolean("status_updates_enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const paymentPlans = pgTable("payment_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stripeProductId: text("stripe_product_id").notNull(),
  stripePriceId: text("stripe_price_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // in cents
  currency: text("currency").notNull().default("usd"),
  billingInterval: text("billing_interval").notNull(), // 'monthly', 'yearly'
  auditsIncluded: integer("audits_included").notNull(),
  features: jsonb("features").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  paymentPlanId: varchar("payment_plan_id").notNull().references(() => paymentPlans.id),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  status: text("status").notNull(), // 'active', 'inactive', 'cancelled'
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const calendarIntegrations = pgTable("calendar_integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  provider: text("provider").notNull(), // 'google', 'microsoft'
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  calendarId: text("calendar_id").notNull(),
  autoBooking: boolean("auto_booking").notNull().default(false),
  meetingDuration: integer("meeting_duration").notNull().default(30),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const emailTemplateVariants = pgTable("email_template_variants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testId: text("test_id").notNull(),
  templateId: varchar("template_id").references(() => emailTemplates.id),
  variant: text("variant").notNull(), // 'A', 'B', 'C'
  subject: text("subject").notNull(),
  sentCount: integer("sent_count").notNull().default(0),
  openCount: integer("open_count").notNull().default(0),
  clickCount: integer("click_count").notNull().default(0),
  replyCount: integer("reply_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const crmIntegrations = pgTable("crm_integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  provider: text("provider").notNull(), // 'salesforce', 'hubspot', 'pipedrive'
  accessToken: text("access_token").notNull(),
  syncEnabled: boolean("sync_enabled").notNull().default(true),
  lastSyncAt: timestamp("last_sync_at"),
  nextSyncAt: timestamp("next_sync_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const leadScores = pgTable("lead_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  prospectId: varchar("prospect_id").notNull().references(() => prospects.id, { onDelete: "cascade" }),
  companySize: integer("company_size").notNull().default(0), // 0-100
  verticalFit: integer("vertical_fit").notNull().default(0), // 0-100
  engagementVelocity: integer("engagement_velocity").notNull().default(0), // 0-100
  complianceGap: integer("compliance_gap").notNull().default(0), // 0-100
  overallScore: integer("overall_score").notNull().default(0), // 0-100
  tier: text("tier").notNull().default("SMB"), // 'Enterprise', 'Mid-Market', 'SMB'
  nextAction: text("next_action").notNull().default("research"),
  scoredAt: timestamp("scored_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const competitiveReports = pgTable("competitive_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  prospectId: varchar("prospect_id").references(() => prospects.id, { onDelete: "cascade" }),
  competitorUrl: text("competitor_url").notNull(),
  wcagScore: integer("wcag_score").notNull(),
  violationCount: integer("violation_count").notNull(),
  benchmarkGap: integer("benchmark_gap").notNull(), // Score gap vs prospect
  socialProof: text("social_proof").notNull(),
  emailSnippet: text("email_snippet").notNull(),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const remediations = pgTable("remediations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scanJobId: varchar("scan_job_id").notNull().references(() => scanJobs.id, { onDelete: "cascade" }),
  prospectId: varchar("prospect_id").references(() => prospects.id, { onDelete: "cascade" }),
  violationId: varchar("violation_id").notNull(),
  fixSuggestion: text("fix_suggestion").notNull(),
  effortHours: integer("effort_hours").notNull(),
  priority: text("priority").notNull(), // 'critical', 'high', 'medium', 'low'
  estimatedCost: integer("estimated_cost"), // in dollars
  upsellTriggered: boolean("upsell_triggered").notNull().default(false),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const jobQueue = pgTable("job_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobType: text("job_type").notNull(), // 'scan', 'competitive', 'remediation', 'pricing'
  jobData: jsonb("job_data").notNull(),
  status: text("status").notNull().default("queued"), // 'queued', 'processing', 'completed', 'failed'
  retryCount: integer("retry_count").notNull().default(0),
  maxRetries: integer("max_retries").notNull().default(3),
  error: text("error"),
  result: jsonb("result"),
  scheduledFor: timestamp("scheduled_for"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const physicalMail = pgTable("physical_mail", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  prospectId: varchar("prospect_id").notNull().references(() => prospects.id, { onDelete: "cascade" }),
  recipientName: text("recipient_name").notNull(),
  recipientTitle: text("recipient_title"),
  companyName: text("company_name").notNull(),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  mailType: text("mail_type").notNull().default("certified"), // 'certified', 'standard', 'priority'
  contentType: text("content_type").notNull().default("audit-report"), // 'audit-report', 'compliance-notice', 'custom'
  subject: text("subject"),
  body: text("body"),
  attachmentUrl: text("attachment_url"),
  lobLetterId: text("lob_letter_id"),
  lobTrackingCode: text("lob_tracking_code"),
  status: text("status").notNull().default("pending"), // 'pending', 'processed', 'in-transit', 'delivered', 'failed'
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  failureReason: text("failure_reason"),
  cost: integer("cost"), // in cents
  estimatedDelivery: text("estimated_delivery"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const verticalInsights = pgTable("vertical_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  industryName: text("industry_name").notNull().unique(), // Healthcare, Finance, E-commerce, etc.
  complianceFrameworks: jsonb("compliance_frameworks").notNull(), // [HIPAA, ADA, 508, SEC, FDIC, FHA, etc]
  lawsuitTrend: text("lawsuit_trend").notNull(), // 'high', 'medium', 'low'
  lawsuitDataPoint: text("lawsuit_data_point").notNull(), // "93% face lawsuits"
  urgencyTriggers: jsonb("urgency_triggers").notNull(), // [trigger1, trigger2, ...]
  socialProofTemplates: jsonb("social_proof_templates").notNull(), // [{template1}, {template2}]
  emailSubjectTemplates: jsonb("email_subject_templates").notNull(), // [subject1, subject2, ...]
  remediationContextHints: jsonb("remediation_context_hints").notNull(), // Industry-specific hints for Claude
  complianceUrgencyScore: integer("compliance_urgency_score").notNull().default(50), // 0-100
  averageComplianceGap: integer("average_compliance_gap").notNull().default(35), // 0-100
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// AI TRAINING & CONTINUOUS IMPROVEMENT TABLES

export const feedbackDecisions = pgTable("feedback_decisions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull(), // Customer silo (NEVER cross-customer queries)
  violationId: varchar("violation_id").notNull(),
  recommendationText: text("recommendation_text").notNull(),
  actionTaken: text("action_taken").notNull(), // 'fixed', 'rejected', 'already_fixed_differently', 'not_applicable'
  reasonProvided: text("reason_provided"), // Optional: Why they took this action
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  confidenceScore: integer("confidence_score"), // AI's original confidence (for validation)
  actualOutcome: text("actual_outcome"), // 'worked', 'failed', 'unknown'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const edgeCaseLogs = pgTable("edge_case_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull(), // Privacy: stays in customer silo
  violationType: text("violation_type").notNull(),
  whenModelFailed: text("when_model_failed").notNull(), // 'false_positive', 'false_negative', 'low_confidence'
  context: jsonb("context").notNull(), // Technical details (element, page, etc.)
  resolved: boolean("resolved").notNull().default(false),
  resolutionNotes: text("resolution_notes"),
  flaggedAt: timestamp("flagged_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const personalizedWeights = pgTable("personalized_weights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().unique(), // One per customer
  category: text("category").notNull(), // 'color_contrast', 'keyboard_nav', etc.
  weight: integer("weight").notNull().default(100), // 0-200 (100 = neutral, >100 = prioritize, <100 = deprioritize)
  trainingDataCount: integer("training_data_count").notNull().default(0), // How many decisions informed this weight
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const modelVersions = pgTable("model_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  versionNumber: text("version_number").notNull().unique(), // 'v1.0.0', 'v1.1.0', etc.
  modelType: text("model_type").notNull(), // 'global', 'fintech', 'healthcare', etc.
  accuracy: integer("accuracy").notNull(), // 0-100 (% of recommendations followed)
  falsePositiveRate: integer("false_positive_rate").notNull(), // 0-100
  confidenceCalibration: integer("confidence_calibration").notNull(), // 0-100 (how well confidence matches reality)
  trainingDataSize: integer("training_data_size").notNull(), // Number of feedback points used
  deployedAt: timestamp("deployed_at"),
  rollbackedAt: timestamp("rollbacked_at"),
  rollbackReason: text("rollback_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const aiHealthMetrics = pgTable("ai_health_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull().defaultNow(),
  overallAccuracy: integer("overall_accuracy").notNull(), // 0-100
  categoryAccuracy: jsonb("category_accuracy").notNull(), // { 'color_contrast': 92, 'keyboard_nav': 89, ... }
  falsePositiveRate: integer("false_positive_rate").notNull(),
  confidenceCalibration: integer("confidence_calibration").notNull(),
  recommendationsFollowed: integer("recommendations_followed").notNull(),
  recommendationsRejected: integer("recommendations_rejected").notNull(),
  edgeCasesFlagged: integer("edge_cases_flagged").notNull(),
  modelVersion: text("model_version").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProspectSchema = createInsertSchema(prospects).omit({
  id: true,
  createdAt: true,
});

export const insertViolationSchema = createInsertSchema(violations).omit({
  id: true,
  scanDate: true,
});

export const insertTriggerSchema = createInsertSchema(triggers).omit({
  id: true,
  createdAt: true,
});

export const insertEmailCadenceSchema = createInsertSchema(emailCadences).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
});

export const insertScanJobSchema = createInsertSchema(scanJobs).omit({
  id: true,
  createdAt: true,
  startedAt: true,
  completedAt: true,
});

export const insertScanResultSchema = createInsertSchema(scanResults).omit({
  id: true,
  createdAt: true,
});

export const insertAuditReportSchema = createInsertSchema(auditReports).omit({
  id: true,
  generatedAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProspect = z.infer<typeof insertProspectSchema>;
export type Prospect = typeof prospects.$inferSelect;

export type InsertViolation = z.infer<typeof insertViolationSchema>;
export type Violation = typeof violations.$inferSelect;

export type InsertTrigger = z.infer<typeof insertTriggerSchema>;
export type Trigger = typeof triggers.$inferSelect;

export type InsertEmailCadence = z.infer<typeof insertEmailCadenceSchema>;
export type EmailCadence = typeof emailCadences.$inferSelect;

export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;

export type InsertScanJob = z.infer<typeof insertScanJobSchema>;
export type ScanJob = typeof scanJobs.$inferSelect;

export type InsertScanResult = z.infer<typeof insertScanResultSchema>;
export type ScanResult = typeof scanResults.$inferSelect;

export type InsertAuditReport = z.infer<typeof insertAuditReportSchema>;
export type AuditReport = typeof auditReports.$inferSelect;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export const insertDoNotContactSchema = createInsertSchema(doNotContact).omit({ id: true, addedAt: true });
export type InsertDoNotContact = z.infer<typeof insertDoNotContactSchema>;
export type DoNotContact = typeof doNotContact.$inferSelect;

export const insertEmailHistorySchema = createInsertSchema(emailHistory).omit({ id: true, sentAt: true });
export type InsertEmailHistory = z.infer<typeof insertEmailHistorySchema>;
export type EmailHistory = typeof emailHistory.$inferSelect;

export const insertEthicalMetricsSchema = createInsertSchema(ethicalMetrics).omit({ id: true, date: true });
export type InsertEthicalMetrics = z.infer<typeof insertEthicalMetricsSchema>;
export type EthicalMetrics = typeof ethicalMetrics.$inferSelect;

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

export const insertSlackIntegrationSchema = createInsertSchema(slackIntegrations).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSlackIntegration = z.infer<typeof insertSlackIntegrationSchema>;
export type SlackIntegration = typeof slackIntegrations.$inferSelect;

export const insertPaymentPlanSchema = createInsertSchema(paymentPlans).omit({ id: true, createdAt: true });
export type InsertPaymentPlan = z.infer<typeof insertPaymentPlanSchema>;
export type PaymentPlan = typeof paymentPlans.$inferSelect;

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

export const insertCalendarIntegrationSchema = createInsertSchema(calendarIntegrations).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCalendarIntegration = z.infer<typeof insertCalendarIntegrationSchema>;
export type CalendarIntegration = typeof calendarIntegrations.$inferSelect;

export const insertEmailTemplateVariantSchema = createInsertSchema(emailTemplateVariants).omit({ id: true, createdAt: true });
export type InsertEmailTemplateVariant = z.infer<typeof insertEmailTemplateVariantSchema>;
export type EmailTemplateVariant = typeof emailTemplateVariants.$inferSelect;

export const insertCrmIntegrationSchema = createInsertSchema(crmIntegrations).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCrmIntegration = z.infer<typeof insertCrmIntegrationSchema>;
export type CrmIntegration = typeof crmIntegrations.$inferSelect;

export const insertLeadScoreSchema = createInsertSchema(leadScores).omit({ id: true, createdAt: true, scoredAt: true });
export type InsertLeadScore = z.infer<typeof insertLeadScoreSchema>;
export type LeadScore = typeof leadScores.$inferSelect;

export const insertCompetitiveReportSchema = createInsertSchema(competitiveReports).omit({ id: true, createdAt: true, generatedAt: true });
export type InsertCompetitiveReport = z.infer<typeof insertCompetitiveReportSchema>;
export type CompetitiveReport = typeof competitiveReports.$inferSelect;

export const insertRemediationSchema = createInsertSchema(remediations).omit({ id: true, createdAt: true, generatedAt: true });
export type InsertRemediation = z.infer<typeof insertRemediationSchema>;
export type Remediation = typeof remediations.$inferSelect;

export const insertJobQueueSchema = createInsertSchema(jobQueue).omit({ id: true, createdAt: true });
export type InsertJobQueue = z.infer<typeof insertJobQueueSchema>;
export type JobQueue = typeof jobQueue.$inferSelect;

export const insertPhysicalMailSchema = createInsertSchema(physicalMail).omit({ 
  id: true, 
  createdAt: true, 
  lobLetterId: true,
  lobTrackingCode: true,
  status: true,
  sentAt: true,
  deliveredAt: true,
  failureReason: true,
  cost: true,
  estimatedDelivery: true,
});
export type InsertPhysicalMail = z.infer<typeof insertPhysicalMailSchema>;
export type PhysicalMail = typeof physicalMail.$inferSelect;

export const insertVerticalInsightSchema = createInsertSchema(verticalInsights).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertVerticalInsight = z.infer<typeof insertVerticalInsightSchema>;
export type VerticalInsight = typeof verticalInsights.$inferSelect;

// AI Training schemas and types
export const insertFeedbackDecisionSchema = createInsertSchema(feedbackDecisions).omit({ id: true, createdAt: true, timestamp: true });
export type InsertFeedbackDecision = z.infer<typeof insertFeedbackDecisionSchema>;
export type FeedbackDecision = typeof feedbackDecisions.$inferSelect;

export const insertEdgeCaseLogSchema = createInsertSchema(edgeCaseLogs).omit({ id: true, createdAt: true, flaggedAt: true });
export type InsertEdgeCaseLog = z.infer<typeof insertEdgeCaseLogSchema>;
export type EdgeCaseLog = typeof edgeCaseLogs.$inferSelect;

export const insertPersonalizedWeightsSchema = createInsertSchema(personalizedWeights).omit({ id: true, createdAt: true, lastUpdated: true });
export type InsertPersonalizedWeights = z.infer<typeof insertPersonalizedWeightsSchema>;
export type PersonalizedWeights = typeof personalizedWeights.$inferSelect;

export const insertModelVersionSchema = createInsertSchema(modelVersions).omit({ id: true, createdAt: true });
export type InsertModelVersion = z.infer<typeof insertModelVersionSchema>;
export type ModelVersion = typeof modelVersions.$inferSelect;

export const insertAiHealthMetricsSchema = createInsertSchema(aiHealthMetrics).omit({ id: true, createdAt: true, date: true });
export type InsertAiHealthMetrics = z.infer<typeof insertAiHealthMetricsSchema>;
export type AiHealthMetrics = typeof aiHealthMetrics.$inferSelect;

// A/B Testing Tables (Email Campaign Optimization)

export const emailCampaigns = pgTable("email_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  industry: text("industry"),
  touchNumber: integer("touch_number"),
  goal: text("goal").notNull(),
  status: text("status").notNull().default("draft"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  winnerVariantId: varchar("winner_variant_id"),
  totalSends: integer("total_sends").notNull().default(0),
  totalOpens: integer("total_opens").notNull().default(0),
  totalClicks: integer("total_clicks").notNull().default(0),
  totalReplies: integer("total_replies").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const emailVariants = pgTable("email_variants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull().references(() => emailCampaigns.id, { onDelete: "cascade" }),
  variantName: text("variant_name").notNull(),
  subjectLine: text("subject_line").notNull(),
  emailBody: text("email_body").notNull(),
  sends: integer("sends").notNull().default(0),
  opens: integer("opens").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  replies: integer("replies").notNull().default(0),
  openRate: integer("open_rate").notNull().default(0),
  clickRate: integer("click_rate").notNull().default(0),
  replyRate: integer("reply_rate").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const emailSends = pgTable("email_sends", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull().references(() => emailCampaigns.id, { onDelete: "cascade" }),
  variantId: varchar("variant_id").notNull().references(() => emailVariants.id, { onDelete: "cascade" }),
  prospectId: varchar("prospect_id").references(() => prospects.id, { onDelete: "set null" }),
  recipientEmail: text("recipient_email").notNull(),
  recipientName: text("recipient_name"),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
});

export const emailEvents = pgTable("email_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sendId: varchar("send_id").notNull().references(() => emailSends.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  metadata: jsonb("metadata"),
});

export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns).omit({ id: true, createdAt: true });
export type InsertEmailCampaign = z.infer<typeof insertEmailCampaignSchema>;
export type EmailCampaign = typeof emailCampaigns.$inferSelect;

export const insertEmailVariantSchema = createInsertSchema(emailVariants).omit({ id: true, createdAt: true });
export type InsertEmailVariant = z.infer<typeof insertEmailVariantSchema>;
export type EmailVariant = typeof emailVariants.$inferSelect;

export const insertEmailSendSchema = createInsertSchema(emailSends).omit({ id: true, sentAt: true });
export type InsertEmailSend = z.infer<typeof insertEmailSendSchema>;
export type EmailSend = typeof emailSends.$inferSelect;

export const insertEmailEventSchema = createInsertSchema(emailEvents).omit({ id: true, timestamp: true });
export type InsertEmailEvent = z.infer<typeof insertEmailEventSchema>;
export type EmailEvent = typeof emailEvents.$inferSelect;

// ========== MARKETPLACE: CONSULTANTS ==========

export const consultants = pgTable("consultants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  title: text("title").default("AI Accessibility Consultant"),
  bio: text("bio"),
  hourlyRate: integer("hourly_rate").default(150),
  expertise: jsonb("expertise").$type<string[]>().default([]),
  industries: jsonb("industries").$type<string[]>().default([]),
  projectsCompleted: integer("projects_completed").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("5.00"),
  responseTimeHours: integer("response_time_hours").default(24),
  tier: text("tier").default("free"),
  verified: boolean("verified").default(false),
  featured: boolean("featured").default(false),
  available: boolean("available").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertConsultantSchema = createInsertSchema(consultants).omit({
  id: true,
  createdAt: true,
});
export type InsertConsultant = z.infer<typeof insertConsultantSchema>;
export type Consultant = typeof consultants.$inferSelect;

// ========== MARKETPLACE: PROJECTS ==========

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id"),
  consultantId: integer("consultant_id"),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  industry: text("industry"),
  budget: integer("budget"),
  projectValue: integer("project_value"),
  platformCommission: integer("platform_commission"),
  consultantPayout: integer("consultant_payout"),
  status: text("status").default("open"),
  matchScore: integer("match_score"),
  matchReasons: jsonb("match_reasons").$type<string[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// ========== MARKETPLACE: TRANSACTIONS ==========

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id"),
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// ========== BLOG ==========

export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  metaDescription: text("meta_description").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  industry: text("industry"),
  wordCount: integer("word_count"),
  estimatedReadTime: integer("estimated_read_time"),
  keywords: text("keywords").array(),
  published: boolean("published").notNull().default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// ========== ACCESSIBILITY CERTIFICATION BADGES ==========

export const accessibilityBadges = pgTable("accessibility_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scanJobId: varchar("scan_job_id").notNull().references(() => scanJobs.id, { onDelete: "cascade" }),
  websiteUrl: text("website_url").notNull(),
  complianceScore: integer("compliance_score").notNull(),
  wcagLevel: text("wcag_level").notNull(), // 'A', 'AA', 'AAA'
  certificatedBy: text("certificated_by").notNull().default("Accessibility AI"),
  badgeCode: text("badge_code").notNull(), // HTML/JavaScript embed code
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"), // Optional expiration for recertification
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAccessibilityBadgeSchema = createInsertSchema(accessibilityBadges).omit({
  id: true,
  createdAt: true,
  badgeCode: true,
});
export type InsertAccessibilityBadge = z.infer<typeof insertAccessibilityBadgeSchema>;
export type AccessibilityBadge = typeof accessibilityBadges.$inferSelect;

// ========== VPAT DOCUMENTS ==========

export const vpatDocuments = pgTable("vpat_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scanJobId: varchar("scan_job_id").notNull().references(() => scanJobs.id, { onDelete: "cascade" }),
  productName: text("product_name").notNull(),
  productVersion: text("product_version"),
  vendorName: text("vendor_name").notNull(),
  reportDate: timestamp("report_date").notNull(),
  vpatVersion: text("vpatVersion").notNull().default("2.4"), // VPAT version
  wcagLevel: text("wcag_level").notNull(), // 'A', 'AA', 'AAA'
  supportingDocumentUrl: text("supporting_document_url"),
  htmlContent: text("html_content").notNull(), // Generated HTML VPAT
  pdfUrl: text("pdf_url"), // Generated PDF URL
  status: text("status").notNull().default("draft"), // 'draft', 'published', 'archived'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertVpatDocumentSchema = createInsertSchema(vpatDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  htmlContent: true,
});
export type InsertVpatDocument = z.infer<typeof insertVpatDocumentSchema>;
export type VpatDocument = typeof vpatDocuments.$inferSelect;
