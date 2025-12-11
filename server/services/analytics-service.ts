import { db } from "../db";
import { analytics, emailCadences, prospects, leadScores, auditReports, emailHistory } from "@shared/schema";
import { sql, eq, and, gte, lte } from "drizzle-orm";

export async function getWeeklyRevenue(): Promise<any> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Estimate revenue from reports (assume $1500 base per enterprise, $750 per mid-market, $250 per SMB)
  const data = await db
    .select({
      date: analytics.date,
      enterpriseCount: sql`COUNT(CASE WHEN tier = 'Enterprise' THEN 1 END)`.as("enterprise_count"),
      midMarketCount: sql`COUNT(CASE WHEN tier = 'Mid-Market' THEN 1 END)`.as("mid_market_count"),
      smbCount: sql`COUNT(CASE WHEN tier = 'SMB' THEN 1 END)`.as("smb_count"),
    })
    .from(analytics)
    .where(gte(analytics.date, sevenDaysAgo))
    .groupBy(analytics.date);

  const estimatedRevenue = data.reduce((total, day) => {
    return (
      total +
      day.enterpriseCount * 1500 +
      day.midMarketCount * 750 +
      day.smbCount * 250
    );
  }, 0);

  return {
    period: "weekly",
    startDate: sevenDaysAgo.toISOString(),
    endDate: new Date().toISOString(),
    estimatedRevenue,
    data,
  };
}

export async function getCadenceEffectiveness(): Promise<any> {
  const data = await db
    .select({
      tier: leadScores.tier,
      totalSent: sql`COUNT(*)`.as("total_sent"),
      totalOpened: sql`COUNT(CASE WHEN "openedAt" IS NOT NULL THEN 1 END)`.as("total_opened"),
      totalClicked: sql`COUNT(CASE WHEN "clickedAt" IS NOT NULL THEN 1 END)`.as("total_clicked"),
      totalReplied: sql`COUNT(CASE WHEN "repliedAt" IS NOT NULL THEN 1 END)`.as("total_replied"),
    })
    .from(emailCadences)
    .innerJoin(leadScores, eq(emailCadences.prospectId, leadScores.prospectId))
    .groupBy(leadScores.tier);

  return data.map((stage: any) => ({
    tier: stage.tier,
    totalSent: stage.totalSent,
    openRate: Math.round((stage.totalOpened / stage.totalSent) * 100),
    clickRate: Math.round((stage.totalClicked / stage.totalSent) * 100),
    replyRate: Math.round((stage.totalReplied / stage.totalSent) * 100),
  }));
}

export async function getPipelineByIcpTier(): Promise<any> {
  const data = await db
    .select({
      tier: leadScores.tier,
      count: sql`COUNT(*)`.as("prospect_count"),
      avgScore: sql`AVG("overallScore")`.as("avg_score"),
    })
    .from(leadScores)
    .groupBy(leadScores.tier)
    .orderBy(leadScores.tier);

  return data.map((tier: any) => ({
    tier: tier.tier,
    prospects: tier.count,
    avgIcpScore: Math.round(tier.avgScore || 0),
  }));
}

export async function getConversionMetrics(): Promise<any> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const totalProspects = await db
    .select({ count: sql`COUNT(*)` })
    .from(prospects)
    .where(gte(prospects.createdAt, thirtyDaysAgo));

  const emailsHistorySent = await db
    .select({ count: sql`COUNT(*)` })
    .from(emailHistory)
    .where(gte(emailHistory.sentAt, thirtyDaysAgo));

  const repliesReceived = await db
    .select({ count: sql`COUNT(*)` })
    .from(emailCadences)
    .where(gte(emailCadences.repliedAt, thirtyDaysAgo));

  const conversionsToClient = await db
    .select({ count: sql`COUNT(DISTINCT "prospectId")` })
    .from(auditReports)
    .where(gte(auditReports.generatedAt, thirtyDaysAgo));

  const total = totalProspects[0]?.count || 0;
  const sent = emailsHistorySent[0]?.count || 0;
  const replied = repliesReceived[0]?.count || 0;
  const converted = conversionsToClient[0]?.count || 0;

  return {
    period: "30_days",
    totalProspectsAdded: total,
    emailsSent: sent,
    repliesReceived: replied,
    conversions: converted,
    emailOpenRate: total > 0 ? Math.round((replied / sent) * 100) : 0,
    conversionRate: total > 0 ? Math.round((converted / total) * 100) : 0,
  };
}

export async function getDashboardMetrics(): Promise<any> {
  const [weekly, cadence, pipeline, conversion] = await Promise.all([
    getWeeklyRevenue(),
    getCadenceEffectiveness(),
    getPipelineByIcpTier(),
    getConversionMetrics(),
  ]);

  return {
    weeklyRevenue: weekly,
    cadenceEffectiveness: cadence,
    pipelineByTier: pipeline,
    conversionMetrics: conversion,
    timestamp: new Date().toISOString(),
  };
}
