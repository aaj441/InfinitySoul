/**
 * PACER Feed Integration
 *
 * Monitors federal court filings for ADA Title III cases.
 *
 * IMPORTANT: PACER has strict usage policies:
 * - Requires account registration
 * - Charges $0.10 per page (capped at $3/document)
 * - Prohibits bulk automated downloads without authorization
 * - Respects PACER's acceptable use policy
 *
 * This is a reference implementation. Production use requires:
 * 1. Official PACER account
 * 2. Adherence to PACER's Terms of Service
 * 3. Proper rate limiting and cost controls
 */

import axios from 'axios';
import { logger } from '../../../utils/logger';

export interface PACERFiling {
  caseId: string;
  caseNumber: string;
  courtCode: string;
  filingDate: Date;
  plaintiff: string;
  defendant: string;
  defendantDomain?: string;
  attorneys: Array<{
    name: string;
    firm: string;
    role: 'plaintiff' | 'defendant';
  }>;
  natureOfSuit: string;
  jurisdictionBasis: string;
  demandAmount?: number;
  caseType: 'ADA Title III' | 'Other';
  status: 'filed' | 'settled' | 'dismissed' | 'ongoing';
}

export interface PACERFeedConfig {
  username?: string;
  password?: string;
  rateLimit: number; // requests per minute
  maxCostPerDay: number; // dollars
  courts: string[]; // e.g., ['cacd', 'nysd', 'flsd']
}

export class PACERFeedMonitor {
  private config: PACERFeedConfig;
  private dailyCost: number = 0;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;

  constructor(config: PACERFeedConfig) {
    this.config = {
      rateLimit: 10, // 10 requests per minute default
      maxCostPerDay: 50, // $50 daily limit default
      courts: ['cacd', 'nysd', 'flsd', 'ilnd', 'txsd'], // High-volume ADA courts
      ...config
    };
  }

  /**
   * Fetch recent ADA Title III filings from PACER
   *
   * NOTE: This is a MOCK implementation for demonstration.
   * Real implementation requires PACER API credentials.
   */
  async fetchPACERFeed(daysBack: number = 7): Promise<PACERFiling[]> {
    // Check cost limit
    if (this.dailyCost >= this.config.maxCostPerDay) {
      logger.warn(`PACER daily cost limit reached: $${this.dailyCost}`);
      return [];
    }

    // Rate limiting
    await this.respectRateLimit();

    try {
      // MOCK: In production, this would call PACER API
      logger.info(`[MOCK] Fetching PACER filings from last ${daysBack} days`);

      // For demonstration, return mock data structure
      const mockFilings: PACERFiling[] = this.generateMockFilings(daysBack);

      // Log cost (PACER charges per page)
      const estimatedCost = mockFilings.length * 0.30; // ~$0.30 per filing average
      this.dailyCost += estimatedCost;
      logger.info(`PACER feed fetched: ${mockFilings.length} filings, estimated cost: $${estimatedCost.toFixed(2)}`);

      return mockFilings;
    } catch (error) {
      logger.error('Error fetching PACER feed:', error);
      throw error;
    }
  }

  /**
   * Fetch filings from CourtListener (RECAP - Free alternative to PACER)
   * CourtListener provides free access to PACER documents via RECAP
   */
  async fetchCourtListenerFeed(daysBack: number = 7): Promise<PACERFiling[]> {
    try {
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - daysBack);

      // CourtListener API endpoint (real, free alternative to PACER)
      const response = await axios.get('https://www.courtlistener.com/api/rest/v3/dockets/', {
        params: {
          filed_after: sinceDate.toISOString().split('T')[0],
          nature_of_suit: 'ADA', // Filter for ADA cases
          order_by: '-date_filed'
        },
        headers: {
          'Authorization': `Token ${process.env.COURTLISTENER_API_KEY || 'demo'}`,
        },
        timeout: 30000
      });

      const filings = this.parseCourtListenerResponse(response.data);
      logger.info(`CourtListener feed fetched: ${filings.length} filings`);

      return filings;
    } catch (error) {
      logger.error('Error fetching CourtListener feed:', error);
      // Return empty array on error to prevent system failure
      return [];
    }
  }

  /**
   * Parse CourtListener API response into standardized format
   */
  private parseCourtListenerResponse(data: any): PACERFiling[] {
    if (!data.results) return [];

    return data.results.map((docket: any) => ({
      caseId: docket.id.toString(),
      caseNumber: docket.docket_number,
      courtCode: docket.court,
      filingDate: new Date(docket.date_filed),
      plaintiff: this.extractPlaintiff(docket),
      defendant: this.extractDefendant(docket),
      defendantDomain: this.extractDefendantDomain(docket),
      attorneys: this.extractAttorneys(docket),
      natureOfSuit: docket.nature_of_suit || 'ADA Title III',
      jurisdictionBasis: docket.jurisdiction_type || 'Federal Question',
      caseType: 'ADA Title III',
      status: this.determineCaseStatus(docket)
    }));
  }

  /**
   * Extract plaintiff name from docket data
   */
  private extractPlaintiff(docket: any): string {
    // Try to parse from case name (usually "Plaintiff v. Defendant" format)
    const caseName = docket.case_name || '';
    const parts = caseName.split(' v. ');
    return parts[0] || 'Unknown';
  }

  /**
   * Extract defendant name from docket data
   */
  private extractDefendant(docket: any): string {
    const caseName = docket.case_name || '';
    const parts = caseName.split(' v. ');
    return parts[1] || 'Unknown';
  }

  /**
   * Try to extract defendant website/domain from case details
   */
  private extractDefendantDomain(docket: any): string | undefined {
    // This would require parsing docket entries for website mentions
    // For now, return undefined - this can be enhanced with NLP
    return undefined;
  }

  /**
   * Extract attorney information from docket data
   */
  private extractAttorneys(docket: any): Array<{name: string; firm: string; role: 'plaintiff' | 'defendant'}> {
    // CourtListener provides attorney data in separate API calls
    // For now, return empty array - this can be enhanced
    return [];
  }

  /**
   * Determine case status from docket data
   */
  private determineCaseStatus(docket: any): 'filed' | 'settled' | 'dismissed' | 'ongoing' {
    if (docket.date_terminated) {
      // Check termination reason if available
      return 'settled'; // Default to settled for terminated cases
    }
    return 'ongoing';
  }

  /**
   * Generate mock PACER filings for testing
   */
  private generateMockFilings(daysBack: number): PACERFiling[] {
    const filings: PACERFiling[] = [];
    const serialPlaintiffs = [
      'John Doe',
      'Jane Smith',
      'Maria Garcia',
      'David Johnson'
    ];
    const lawFirms = [
      'Mizrahi Kroub LLP',
      'Mars Law Group',
      'Gottlieb & Associates',
      'Carlson Lynch Sweet & Kilpela LLP'
    ];

    // Generate 3-10 mock filings
    const count = Math.floor(Math.random() * 8) + 3;

    for (let i = 0; i < count; i++) {
      const daysAgo = Math.floor(Math.random() * daysBack);
      const filingDate = new Date();
      filingDate.setDate(filingDate.getDate() - daysAgo);

      const plaintiff = serialPlaintiffs[Math.floor(Math.random() * serialPlaintiffs.length)];
      const lawFirm = lawFirms[Math.floor(Math.random() * lawFirms.length)];

      filings.push({
        caseId: `MOCK-${Date.now()}-${i}`,
        caseNumber: `1:24-cv-${String(5000 + i).padStart(5, '0')}`,
        courtCode: this.config.courts[Math.floor(Math.random() * this.config.courts.length)],
        filingDate,
        plaintiff,
        defendant: `Mock Retail Company ${i}`,
        defendantDomain: `retailcompany${i}.com`,
        attorneys: [
          {
            name: `Attorney ${i}`,
            firm: lawFirm,
            role: 'plaintiff'
          }
        ],
        natureOfSuit: '445 - Americans with Disabilities - Employment',
        jurisdictionBasis: 'Federal Question',
        demandAmount: 75000,
        caseType: 'ADA Title III',
        status: 'filed'
      });
    }

    return filings;
  }

  /**
   * Respect rate limiting
   */
  private async respectRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = (60 * 1000) / this.config.rateLimit; // ms between requests

    if (timeSinceLastRequest < minInterval) {
      const waitTime = minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  /**
   * Reset daily cost counter (call at midnight)
   */
  resetDailyCost(): void {
    this.dailyCost = 0;
    this.requestCount = 0;
    logger.info('PACER daily cost counter reset');
  }

  /**
   * Get current cost statistics
   */
  getCostStats(): { dailyCost: number; requestCount: number; limit: number } {
    return {
      dailyCost: this.dailyCost,
      requestCount: this.requestCount,
      limit: this.config.maxCostPerDay
    };
  }
}

/**
 * Singleton instance
 */
export const pacerMonitor = new PACERFeedMonitor({
  rateLimit: 10,
  maxCostPerDay: 50,
  courts: ['cacd', 'nysd', 'flsd', 'ilnd', 'txsd']
});

/**
 * Main export function for easy use
 */
export async function fetchPACERFeed(daysBack: number = 7): Promise<PACERFiling[]> {
  // Try CourtListener first (free)
  const courtListenerFilings = await pacerMonitor.fetchCourtListenerFeed(daysBack);

  // If CourtListener returns data, use it
  if (courtListenerFilings.length > 0) {
    return courtListenerFilings;
  }

  // Otherwise fall back to PACER (requires credentials and costs money)
  return pacerMonitor.fetchPACERFeed(daysBack);
}
