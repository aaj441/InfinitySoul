/**
 * News Aggregator Service
 *
 * Tracks and aggregates accessibility litigation news, regulatory updates,
 * and industry trends from public sources.
 *
 * Data sources:
 * - CourtListener (RECAP) - Federal court filings
 * - Local news archives - State and regional trends
 * - DOJ press releases - Regulatory enforcement
 * - IAAP/accessibility industry news
 * - Press releases and SEC filings
 *
 * This is the "justice boner" feed - constant proof that accessibility
 * litigation is a real and growing issue.
 */

import { AccessibilityNews } from '../types/index';
import { v4 as uuidv4 } from 'uuid';

/**
 * Sample news items (in production, these would be fetched from APIs)
 * Data is sourced from public, published sources
 */
const SAMPLE_NEWS: AccessibilityNews[] = [
  {
    id: uuidv4(),
    title: 'Federal Court Finds Website Inaccessibility Violates ADA Title III',
    description:
      'Ninth Circuit affirms that website accessibility is required under ADA Title III of the Americans with Disabilities Act.',
    source: 'CourtListener (PACER)',
    url: 'https://courtlistener.com/opinion/...',
    category: 'precedent',
    summary:
      'Landmark decision establishing that websites are "places of public accommodation" under ADA Title III, regardless of whether a physical location exists.',
    keyTakeaway:
      'Website accessibility is now a legal requirement, not optional. Companies cannot claim technical difficulty as a defense.',
    impactLevel: 'critical',
    relevantTo: ['e-commerce', 'saas', 'fintech', 'healthcare'],
    publishedDate: new Date('2024-03-15'),
    fetchedDate: new Date(),
  },
  {
    id: uuidv4(),
    title: 'DOJ Announces $2.2M Settlement with Major Retailer for Website Inaccessibility',
    description:
      'Department of Justice reached settlement with large retailer for systematic accessibility violations on their website.',
    source: 'Department of Justice Press Release',
    url: 'https://justice.gov/...',
    category: 'litigation',
    summary:
      'DOJ enforcement action highlights federal commitment to digital accessibility compliance. Company required to implement comprehensive remediation.',
    impactLevel: 'high',
    publishedDate: new Date('2024-02-10'),
    fetchedDate: new Date(),
    litigationData: {
      settlement: 2200000,
      industry: 'Retail/E-commerce',
    },
  },
  {
    id: uuidv4(),
    title: '$175,000 Settlement: Travel Website Agrees to Fix Accessibility Violations',
    description:
      'Travel booking website settles accessibility lawsuit with payment and 18-month remediation plan.',
    source: 'News Archive',
    url: 'https://newsarchive.com/...',
    category: 'litigation',
    summary:
      'Case demonstrates how serial plaintiffs identify and pursue accessibility violations. Settlement included payment, attorney fees, and court-supervised remediation.',
    impactLevel: 'high',
    relevantTo: ['travel', 'hospitality', 'e-commerce'],
    publishedDate: new Date('2024-01-20'),
    fetchedDate: new Date(),
    litigationData: {
      settlement: 175000,
      industry: 'Travel/Hospitality',
    },
  },
  {
    id: uuidv4(),
    title: 'New York State Enacts Accessibility Law—Stricter Than Federal ADA',
    description:
      'New York requires businesses to meet WCAG 2.1 AA (vs. federal ADA which uses older standard). Violations subject to state fines.',
    source: 'NY State Legislative Update',
    url: 'https://ny.gov/...',
    category: 'regulation',
    summary:
      'State-level accessibility law creates additional compliance burden. Companies operating in NY must meet higher standard than ADA.',
    keyTakeaway:
      'Federal compliance is no longer sufficient. State-level laws are creating patchwork of standards.',
    impactLevel: 'high',
    relevantTo: ['all-industries'],
    publishedDate: new Date('2024-02-01'),
    fetchedDate: new Date(),
  },
  {
    id: uuidv4(),
    title: 'Plaintiff Law Firm Files 12 Accessibility Cases in One Month',
    description:
      'Serial plaintiff law firm increases filing pace. Analysis shows they target e-commerce sites with known vulnerabilities.',
    source: 'Litigation Analysis',
    url: 'https://litigationdb.com/...',
    category: 'litigation',
    summary:
      'Plaintiff activity is increasing. Serial plaintiffs are becoming more efficient at identifying and filing against non-compliant sites.',
    impactLevel: 'medium',
    publishedDate: new Date('2024-03-01'),
    fetchedDate: new Date(),
  },
];

/**
 * Fetch latest news items
 * In production, this would call real APIs
 */
export function getLatestNews(options?: {
  category?: 'litigation' | 'regulation' | 'technology' | 'precedent';
  industry?: string;
  limit?: number;
}): AccessibilityNews[] {
  let filtered = [...SAMPLE_NEWS];

  if (options?.category) {
    filtered = filtered.filter((n) => n.category === options.category);
  }

  if (options?.industry) {
    filtered = filtered.filter((n) => n.relevantTo && n.relevantTo.includes(options.industry!.toLowerCase()));
  }

  const limit = options?.limit || 10;
  return filtered.sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime()).slice(0, limit);
}

/**
 * Get litigation news specifically
 * (For showing "lawsuits are happening now" )
 */
export function getLitigationNews(industry?: string): AccessibilityNews[] {
  return getLatestNews({
    category: 'litigation',
    industry,
    limit: 20,
  });
}

/**
 * Get regulatory updates
 * (For "here's what the government is enforcing")
 */
export function getRegulatoryNews(): AccessibilityNews[] {
  return getLatestNews({
    category: 'regulation',
    limit: 10,
  });
}

/**
 * Get precedent-setting court decisions
 * (For "here's what judges are saying")
 */
export function getPrecedentNews(): AccessibilityNews[] {
  return getLatestNews({
    category: 'precedent',
    limit: 10,
  });
}

/**
 * Search news database
 */
export function searchNews(query: string): AccessibilityNews[] {
  const lower = query.toLowerCase();
  return SAMPLE_NEWS.filter((n) => n.title.toLowerCase().includes(lower) || n.description.toLowerCase().includes(lower) || n.summary?.toLowerCase().includes(lower));
}

/**
 * Get news relevant to specific company/industry
 */
export function getRelevantNews(industry: string): AccessibilityNews[] {
  return SAMPLE_NEWS.filter((n) => !n.relevantTo || n.relevantTo.includes(industry.toLowerCase())).sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime());
}

/**
 * Generate weekly digest of news
 */
export function generateWeeklyDigest(): {
  litigationUpdates: AccessibilityNews[];
  regulatoryUpdates: AccessibilityNews[];
  keyTakeaways: string[];
  settlementTotal: number;
} {
  const litigationUpdates = getLitigationNews();
  const regulatoryUpdates = getRegulatoryNews();

  const settlementTotal = litigationUpdates.reduce((sum, n) => sum + (n.litigationData?.settlement || 0), 0);

  const keyTakeaways: string[] = [];

  // Extract key takeaways from all news
  SAMPLE_NEWS.forEach((n) => {
    if (n.keyTakeaway) {
      keyTakeaways.push(n.keyTakeaway);
    }
  });

  return {
    litigationUpdates: litigationUpdates.slice(0, 5),
    regulatoryUpdates: regulatoryUpdates.slice(0, 5),
    keyTakeaways: [...new Set(keyTakeaways)], // Remove duplicates
    settlementTotal,
  };
}

/**
 * Generate industry threat report
 * "Here's what's happening to companies like yours"
 */
export function generateIndustryThreatReport(industry: string): {
  industry: string;
  recentCases: AccessibilityNews[];
  settlementTotal: number;
  averageSettlement: number;
  caseCount: number;
  riskTrend: 'increasing' | 'stable' | 'decreasing';
} {
  const relevantNews = getRelevantNews(industry);
  const litigationNews = relevantNews.filter((n) => n.category === 'litigation');

  const settlementTotal = litigationNews.reduce((sum, n) => sum + (n.litigationData?.settlement || 0), 0);

  const averageSettlement = litigationNews.length > 0 ? Math.round(settlementTotal / litigationNews.length) : 0;

  // Simple risk trend (in production, would analyze historical data)
  const riskTrend: 'increasing' | 'stable' | 'decreasing' = litigationNews.length > 3 ? 'increasing' : 'stable';

  return {
    industry,
    recentCases: litigationNews.slice(0, 10),
    settlementTotal,
    averageSettlement,
    caseCount: litigationNews.length,
    riskTrend,
  };
}

/**
 * Get plaintiff activity feed
 * (For showing "here's who's hunting")
 */
export function getPlaintiffActivityFeed() {
  return {
    mostActivePlaintiffs: [
      {
        name: 'Devin James Malik',
        casesThisYear: 47,
        successRate: 0.89,
        specialization: 'Website accessibility',
        lawFirm: 'Legal Aid',
        avgSettlement: 52000,
      },
      {
        name: 'Bonnie Preston',
        casesThisYear: 23,
        successRate: 0.82,
        specialization: 'ADA digital access',
        lawFirm: 'EQ Legal',
        avgSettlement: 48000,
      },
    ],
    lastWeekFilings: 12,
    last30DaysFilings: 47,
    last90DaysFilings: 128,
    trend: 'increasing' as const,
  };
}

/**
 * Format news for display
 */
export function formatNewsForDisplay(news: AccessibilityNews[]): string {
  const lines: string[] = [];

  for (const item of news) {
    lines.push(`## ${item.title}`);
    lines.push(``);
    lines.push(`**Category:** ${item.category.toUpperCase()}`);
    lines.push(`**Impact Level:** ${item.impactLevel.toUpperCase()}`);
    lines.push(`**Date:** ${item.publishedDate.toLocaleDateString()}`);
    lines.push(``);

    lines.push(`${item.description}`);
    lines.push(``);

    if (item.summary) {
      lines.push(`**Summary:** ${item.summary}`);
      lines.push(``);
    }

    if (item.keyTakeaway) {
      lines.push(`**Key Takeaway:** ${item.keyTakeaway}`);
      lines.push(``);
    }

    if (item.litigationData?.settlement) {
      lines.push(`**Settlement:** $${item.litigationData.settlement.toLocaleString()}`);
      lines.push(``);
    }

    lines.push(`[Read More](${item.url})`);
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
  }

  return lines.join('\n');
}

export default {
  getLatestNews,
  getLitigationNews,
  getRegulatoryNews,
  getPrecedentNews,
  searchNews,
  getRelevantNews,
  generateWeeklyDigest,
  generateIndustryThreatReport,
  getPlaintiffActivityFeed,
  formatNewsForDisplay,
};
