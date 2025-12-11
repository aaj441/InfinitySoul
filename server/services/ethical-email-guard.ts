import { eq, and, gte, sql, or } from "drizzle-orm";
import { db } from "../db";
import { doNotContact, emailHistory, ethicalMetrics } from "@shared/schema";
import { canSendEmailEthically, isSubjectLineDeceptive } from "../../shared/ethical-guidelines";
import { logger } from "../logger";

export class EthicalEmailGuard {
  /**
   * Check if prospect is on Do Not Contact list
   */
  async isInDoNotContact(prospectId: string, email?: string, domain?: string): Promise<boolean> {
    const conditions = [];
    
    if (prospectId) {
      conditions.push(eq(doNotContact.prospectId, prospectId));
    }
    if (email) {
      conditions.push(eq(doNotContact.email, email));
    }
    if (domain) {
      conditions.push(eq(doNotContact.domain, domain));
    }

    if (conditions.length === 0) return false;

    const entries = await db
      .select()
      .from(doNotContact)
      .where(or(...conditions));

    return entries.length > 0;
  }

  /**
   * Add email/domain/prospect to Do Not Contact list
   */
  async addToDoNotContact(params: {
    email?: string;
    domain?: string;
    prospectId?: string;
    reason: string;
    permanent?: boolean;
  }): Promise<void> {
    await db.insert(doNotContact).values({
      email: params.email,
      domain: params.domain,
      prospectId: params.prospectId,
      reason: params.reason,
      permanent: params.permanent ?? true,
    });

    logger.info(`Added to Do Not Contact: ${params.email || params.domain || params.prospectId} - Reason: ${params.reason}`);
  }

  /**
   * Get email count for prospect this week
   */
  async getEmailsThisWeek(prospectId: string): Promise<number> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const emails = await db
      .select()
      .from(emailHistory)
      .where(
        and(
          eq(emailHistory.prospectId, prospectId),
          gte(emailHistory.sentAt, oneWeekAgo)
        )
      );

    return emails.length;
  }

  /**
   * Validate if email can be sent ethically
   */
  async validateEmailSend(params: {
    prospectId: string;
    email?: string;
    domain?: string;
    subject: string;
    hasExplicitPermission: boolean;
  }): Promise<{ allowed: boolean; reason?: string; violations: string[] }> {
    const violations: string[] = [];

    // Check Do Not Contact list
    const isBlocked = await this.isInDoNotContact(params.prospectId, params.email, params.domain);

    // Check emails sent this week
    const emailsSentThisWeek = await this.getEmailsThisWeek(params.prospectId);

    // Check subject line
    const subjectCheck = isSubjectLineDeceptive(params.subject);
    if (subjectCheck.isDeceptive) {
      violations.push(`Deceptive subject line: ${subjectCheck.reason}`);
    }

    // Run ethical validation
    const ethicalCheck = canSendEmailEthically({
      prospectId: params.prospectId,
      emailsSentThisWeek,
      isInDoNotContactList: isBlocked,
      hasExplicitPermission: params.hasExplicitPermission,
    });

    if (!ethicalCheck.allowed) {
      violations.push(ethicalCheck.reason!);
    }

    return {
      allowed: ethicalCheck.allowed && !subjectCheck.isDeceptive,
      reason: violations[0],
      violations,
    };
  }

  /**
   * Record email send in history
   */
  async recordEmailSend(params: {
    prospectId: string;
    emailType: string;
    subject: string;
    wasPermissionGranted: boolean;
  }): Promise<void> {
    await db.insert(emailHistory).values({
      prospectId: params.prospectId,
      emailType: params.emailType,
      subject: params.subject,
      wasPermissionGranted: params.wasPermissionGranted,
    });

    // Update ethical metrics
    await this.updateMetrics();
  }

  /**
   * Update ethical metrics (upsert single row per day to avoid duplicates)
   */
  async updateMetrics(): Promise<void> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Count emails sent this week
    const emailsThisWeek = await db
      .select()
      .from(emailHistory)
      .where(gte(emailHistory.sentAt, oneWeekAgo));

    // Count Do Not Contact list size
    const dncList = await db.select().from(doNotContact);

    // Use ISO date string for reliable daily grouping (avoids timezone issues)
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0]; // "2025-11-22"
    const todayDate = new Date(todayISO + 'T00:00:00.000Z');

    // Upsert metrics for today (single row per day using ISO date for grouping)
    const existing = await db
      .select()
      .from(ethicalMetrics)
      .where(sql`DATE(${ethicalMetrics.date}) = DATE(${todayDate})`)
      .limit(1);

    if (existing.length > 0) {
      // Update existing row
      await db
        .update(ethicalMetrics)
        .set({
          emailsSentThisWeek: emailsThisWeek.length,
          doNotContactListSize: dncList.length,
        })
        .where(eq(ethicalMetrics.id, existing[0].id));
    } else {
      // Insert new row for today
      await db.insert(ethicalMetrics).values({
        date: todayDate,
        emailsSentThisWeek: emailsThisWeek.length,
        doNotContactListSize: dncList.length,
        freeAuditsDelivered: 0,
        paidAuditsDelivered: 0,
        unsubscribeRate: 0,
      });
    }
  }

  /**
   * Get current ethical metrics
   */
  async getMetrics(): Promise<any> {
    const latest = await db
      .select()
      .from(ethicalMetrics)
      .orderBy(sql`${ethicalMetrics.date} DESC`)
      .limit(1);

    if (latest.length === 0) {
      return {
        freeAuditsDelivered: 0,
        paidAuditsDelivered: 0,
        emailsSentThisWeek: 0,
        doNotContactListSize: 0,
        unsubscribeRate: 0,
        valueGivenVsAskedRatio: 0,
        helpFirstScore: 0,
      };
    }

    const metrics = latest[0];
    const totalAudits = metrics.freeAuditsDelivered + metrics.paidAuditsDelivered;
    const valueRatio = totalAudits > 0 ? metrics.freeAuditsDelivered / totalAudits : 0;

    return {
      ...metrics,
      valueGivenVsAskedRatio: valueRatio,
      helpFirstScore: valueRatio * 100,
    };
  }

  /**
   * Generate unsubscribe link for email
   */
  generateUnsubscribeLink(prospectId: string): string {
    // In production, this would be a signed token
    return `${process.env.BASE_URL || 'http://localhost:5000'}/unsubscribe/${prospectId}`;
  }

  /**
   * Process unsubscribe request
   */
  async processUnsubscribe(prospectId: string, reason?: string): Promise<void> {
    await this.addToDoNotContact({
      prospectId,
      reason: reason || "User requested unsubscribe",
      permanent: true,
    });

    logger.info(`Prospect ${prospectId} unsubscribed`);
  }

  /**
   * Check for compliance breach risk (1-email/week rule violation)
   */
  async checkBreachRisk(prospectId: string): Promise<{ isAtRisk: boolean; emailsSent: number; daysUntilReset: number }> {
    const emailsSent = await this.getEmailsThisWeek(prospectId);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get the oldest email from this week to calculate days until reset
    const emails = await db
      .select()
      .from(emailHistory)
      .where(
        and(
          eq(emailHistory.prospectId, prospectId),
          gte(emailHistory.sentAt, oneWeekAgo)
        )
      )
      .orderBy(emailHistory.sentAt);

    const oldestEmailDate = emails.length > 0 ? new Date(emails[0].sentAt) : new Date();
    const resetDate = new Date(oldestEmailDate);
    resetDate.setDate(resetDate.getDate() + 7);
    const daysUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    // Alert if at risk (already sent 1 email this week)
    if (emailsSent >= 1) {
      logger.warn(`COMPLIANCE RISK: Prospect ${prospectId} already received 1 email this week. Additional emails would violate 1-email/week policy.`);
    }

    return {
      isAtRisk: emailsSent >= 1,
      emailsSent,
      daysUntilReset: Math.max(0, daysUntilReset),
    };
  }

  /**
   * Trigger breach alert if rule violation detected
   */
  async triggerBreachAlert(prospectId: string, attemptedEmail: { subject: string; recipientEmail?: string }): Promise<void> {
    const breach = await this.checkBreachRisk(prospectId);
    if (breach.isAtRisk) {
      logger.error(`BREACH ALERT: Attempted to send email to prospect ${prospectId} who already received email this week!`);
      logger.error(`Subject: ${attemptedEmail.subject}`);
      logger.error(`Recipient: ${attemptedEmail.recipientEmail || 'unknown'}`);
      logger.error(`Days until compliance reset: ${breach.daysUntilReset}`);
      // In production, this would send alert to monitoring system
    }
  }

  /**
   * Get compliance dashboard data
   */
  async getComplianceDashboard(): Promise<{
    totalProspectsReached: number;
    dncListSize: number;
    emailsThisWeek: number;
    avgEmailsPerProspect: number;
    complianceScore: number; // 0-100
    unsubscribeRate: number;
  }> {
    const metrics = await this.getMetrics();
    const prospects = await db.select().from(doNotContact);
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const emailsThisWeek = await db
      .select()
      .from(emailHistory)
      .where(gte(emailHistory.sentAt, oneWeekAgo));

    const totalProspects = emailsThisWeek.length > 0 
      ? new Set(emailsThisWeek.map(e => e.prospectId)).size 
      : 0;

    const avgEmailsPerProspect = totalProspects > 0 ? emailsThisWeek.length / totalProspects : 0;
    
    // Compliance score: perfect if no one gets >1 email/week
    const isCompliant = avgEmailsPerProspect <= 1;
    const complianceScore = isCompliant ? 100 : Math.max(0, 100 - (avgEmailsPerProspect - 1) * 50);

    return {
      totalProspectsReached: totalProspects,
      dncListSize: prospects.length,
      emailsThisWeek: emailsThisWeek.length,
      avgEmailsPerProspect: Math.round(avgEmailsPerProspect * 100) / 100,
      complianceScore: Math.round(complianceScore),
      unsubscribeRate: metrics.unsubscribeRate || 0,
    };
  }
}

export const ethicalEmailGuard = new EthicalEmailGuard();
