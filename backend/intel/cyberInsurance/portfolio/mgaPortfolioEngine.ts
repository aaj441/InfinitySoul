/**
 * MGA Portfolio Engine
 * 
 * Manages portfolio of acquired MGAs implementing Kluge's "Death Star" model:
 * 1. Centralize risk graph across all MGAs
 * 2. One threat oracle, one pricing engine
 * 3. Monetize the graph (sell threat intel + risk API)
 * 4. Calculate network fees
 */

import { MGATarget, MGAPortfolio, ClaimRecord } from '../mga/mgaTypes';
import { AgenticUnderwriter, RiskAssessmentRequest, RiskAssessmentResponse } from '../underwriting/agenticUnderwriter';

/**
 * Portfolio Performance Metrics
 */
export interface PortfolioPerformance {
  portfolioId: string;
  
  // Financial Metrics
  totalPremium: number;
  totalClaims: number;
  totalExpenses: number;
  totalEbitda: number;
  ebitdaMargin: number;           // EBITDA / premium
  
  // Risk Metrics
  avgCombinedRatio: number;
  avgLossRatio: number;
  portfolioRiskScore: number;     // 0-100
  
  // Network Metrics
  claimsGraphSize: number;        // Total claim records
  threatIntelFeeds: number;       // Number of feeds
  apiCallsPerMonth: number;       // Pricing API usage
  
  // Growth Metrics
  premiumGrowth: number;          // YoY %
  mgaCount: number;
  
  // Valuation
  bookValue: number;
  marketValue: number;            // Projected market value (3-5x book)
  multipleOnBook: number;         // Market value / book value
  
  assessmentDate: Date;
}

/**
 * Network Revenue Streams
 * 
 * Kluge's "monetize the graph" model
 */
export interface NetworkRevenue {
  // 1. MGA Fees (30% of premium)
  mgaFees: number;
  
  // 2. Threat Intel Sales
  threatIntelRevenue: number;     // Sell to carriers
  
  // 3. Risk API Usage
  apiRevenue: number;             // $0.10/quote to brokers
  
  // 4. Network Fees
  networkFees: number;            // 10% of cell revenue
  
  // Total
  totalRevenue: number;
  
  // Margins
  netMargin: number;              // %
  
  period: string;                 // 'monthly' | 'annual'
}

/**
 * Exit Scenario Analysis
 * 
 * Kluge's "sell at 5x book" strategy
 */
export interface ExitScenario {
  scenario: 'conservative' | 'base' | 'optimistic';
  
  // Valuation
  exitMultiple: number;           // On book value
  exitPrice: number;
  
  // Returns
  totalInvested: number;
  totalReturn: number;
  cashOnCashMultiple: number;     // Return / invested
  irr: number;                    // %
  
  // Timing
  exitYear: number;
  holdPeriod: number;             // Years
  
  // Rationale
  rationale: string;
}

/**
 * MGA Portfolio Engine
 */
export class MGAPortfolioEngine {
  private portfolio: MGAPortfolio | null = null;
  private underwriter: AgenticUnderwriter;
  private claimsGraph: Map<string, ClaimRecord> = new Map();
  
  constructor() {
    this.underwriter = new AgenticUnderwriter();
  }
  
  /**
   * Initialize Portfolio
   */
  initializePortfolio(name: string): MGAPortfolio {
    this.portfolio = {
      portfolioId: `PORT-${Date.now()}`,
      name,
      mgas: [],
      totalPremium: 0,
      totalEbitda: 0,
      avgCombinedRatio: 0,
      avgLossRatio: 0,
      claimsGraph: {
        totalRecords: 0,
        vectorizationComplete: false,
        lastUpdated: new Date(),
      },
      threatIntelFeeds: [],
      performance: {
        premiumGrowth: 0,
        ebitdaMargin: 0,
        lossRatioTrend: 0,
        marketValue: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return this.portfolio;
  }
  
  /**
   * Add MGA to Portfolio
   */
  addMGA(mga: MGATarget): void {
    if (!this.portfolio) {
      throw new Error('Portfolio not initialized');
    }
    
    this.portfolio.mgas.push(mga.id);
    this.portfolio.totalPremium += mga.annualPremium;
    this.portfolio.updatedAt = new Date();
    
    // Recalculate metrics
    this.updatePortfolioMetrics();
  }
  
  /**
   * Ingest Claims Data (Centralized)
   * 
   * All MGAs feed claims into one central graph
   */
  async ingestClaims(mgaId: string, claims: ClaimRecord[]): Promise<void> {
    // Add to centralized claims graph
    claims.forEach(claim => {
      this.claimsGraph.set(claim.claimId, claim);
    });
    
    // Update portfolio metrics
    if (this.portfolio) {
      this.portfolio.claimsGraph.totalRecords = this.claimsGraph.size;
      this.portfolio.claimsGraph.lastUpdated = new Date();
    }
    
    // Feed to underwriter for loss ratio analysis
    await this.underwriter.ingestClaimsData(claims);
  }
  
  /**
   * Price Risk (Centralized)
   * 
   * One pricing engine for all MGAs
   */
  async priceRisk(mgaId: string, request: RiskAssessmentRequest): Promise<RiskAssessmentResponse> {
    // Use centralized underwriter
    return await this.underwriter.assessRisk(request);
  }
  
  /**
   * Calculate Portfolio Performance
   */
  calculatePerformance(mgas: MGATarget[]): PortfolioPerformance {
    if (!this.portfolio) {
      throw new Error('Portfolio not initialized');
    }
    
    // Financial Metrics
    const totalPremium = mgas.reduce((sum, m) => sum + m.annualPremium, 0);
    const totalClaims = mgas.reduce((sum, m) => sum + m.claimsExpense, 0);
    const totalExpenses = mgas.reduce((sum, m) => sum + m.operatingExpense, 0);
    const totalEbitda = totalPremium - totalClaims - totalExpenses;
    const ebitdaMargin = totalPremium > 0 ? totalEbitda / totalPremium : 0;
    
    // Risk Metrics
    const avgCombinedRatio = mgas.reduce((sum, m) => sum + m.combinedRatio, 0) / mgas.length;
    const avgLossRatio = totalPremium > 0 ? totalClaims / totalPremium : 0;
    
    // Network Metrics
    const claimsGraphSize = this.claimsGraph.size;
    const threatIntelFeeds = this.portfolio.threatIntelFeeds.length;
    const apiCallsPerMonth = this.estimateAPIUsage(totalPremium);
    
    // Valuation (Kluge model: 3-5x book)
    const bookValue = mgas.reduce((sum, m) => sum + m.bookValue, 0);
    const marketValue = this.estimateMarketValue(totalPremium, totalEbitda, bookValue);
    const multipleOnBook = bookValue > 0 ? marketValue / bookValue : 0;
    
    return {
      portfolioId: this.portfolio.portfolioId,
      totalPremium: Math.round(totalPremium),
      totalClaims: Math.round(totalClaims),
      totalExpenses: Math.round(totalExpenses),
      totalEbitda: Math.round(totalEbitda),
      ebitdaMargin: Math.round(ebitdaMargin * 100) / 100,
      avgCombinedRatio: Math.round(avgCombinedRatio),
      avgLossRatio: Math.round(avgLossRatio * 100) / 100,
      portfolioRiskScore: this.calculatePortfolioRiskScore(mgas),
      claimsGraphSize,
      threatIntelFeeds,
      apiCallsPerMonth,
      premiumGrowth: 15, // Assume 15% YoY growth
      mgaCount: mgas.length,
      bookValue: Math.round(bookValue),
      marketValue: Math.round(marketValue),
      multipleOnBook: Math.round(multipleOnBook * 10) / 10,
      assessmentDate: new Date(),
    };
  }
  
  /**
   * Calculate Network Revenue
   * 
   * "Monetize the graph" - Kluge model
   */
  calculateNetworkRevenue(performance: PortfolioPerformance): NetworkRevenue {
    // 1. MGA Fees (30% of premium)
    const mgaFees = performance.totalPremium * 0.30;
    
    // 2. Threat Intel Sales
    // Sell to 10 carriers at $50K/year each
    const threatIntelRevenue = 10 * 50000;
    
    // 3. Risk API Usage
    // $0.10 per quote, estimate 10K quotes/month
    const apiRevenue = performance.apiCallsPerMonth * 0.10 * 12; // Annual
    
    // 4. Network Fees
    // 10% of cell revenue (graduated MGAs)
    const networkFees = performance.totalPremium * 0.10;
    
    // Total
    const totalRevenue = mgaFees + threatIntelRevenue + apiRevenue + networkFees;
    
    // Net Margin (90% - infrastructure costs minimal)
    const netMargin = 0.90;
    
    return {
      mgaFees: Math.round(mgaFees),
      threatIntelRevenue: Math.round(threatIntelRevenue),
      apiRevenue: Math.round(apiRevenue),
      networkFees: Math.round(networkFees),
      totalRevenue: Math.round(totalRevenue),
      netMargin,
      period: 'annual',
    };
  }
  
  /**
   * Project Exit Scenarios
   * 
   * Kluge's "sell at 5x book" strategy
   */
  projectExitScenarios(
    performance: PortfolioPerformance,
    totalInvested: number
  ): ExitScenario[] {
    const scenarios: ExitScenario[] = [];
    
    // Conservative: 3x book in 5 years
    scenarios.push({
      scenario: 'conservative',
      exitMultiple: 3.0,
      exitPrice: performance.bookValue * 3.0,
      totalInvested,
      totalReturn: (performance.bookValue * 3.0) - totalInvested,
      cashOnCashMultiple: (performance.bookValue * 3.0) / totalInvested,
      irr: this.calculateIRR(totalInvested, performance.bookValue * 3.0, 5),
      exitYear: 2030,
      holdPeriod: 5,
      rationale: 'Conservative exit to large carrier (AIG, Chubb) in downturn. ' +
                 '3x book reflects basic operational improvements without full network effects.',
    });
    
    // Base Case: 5x book in 5 years
    scenarios.push({
      scenario: 'base',
      exitMultiple: 5.0,
      exitPrice: performance.bookValue * 5.0,
      totalInvested,
      totalReturn: (performance.bookValue * 5.0) - totalInvested,
      cashOnCashMultiple: (performance.bookValue * 5.0) / totalInvested,
      irr: this.calculateIRR(totalInvested, performance.bookValue * 5.0, 5),
      exitYear: 2030,
      holdPeriod: 5,
      rationale: 'Kluge playbook target. Exit to Berkshire/AIG when carriers panic-buy AI underwriting. ' +
                 '5x book reflects centralized network + threat intel value + proven loss ratio improvement.',
    });
    
    // Optimistic: 7x book in 3 years
    scenarios.push({
      scenario: 'optimistic',
      exitMultiple: 7.0,
      exitPrice: performance.bookValue * 7.0,
      totalInvested,
      totalReturn: (performance.bookValue * 7.0) - totalInvested,
      cashOnCashMultiple: (performance.bookValue * 7.0) / totalInvested,
      irr: this.calculateIRR(totalInvested, performance.bookValue * 7.0, 3),
      exitYear: 2028,
      holdPeriod: 3,
      rationale: 'Aggressive exit in AI insurance boom. Major carrier (Berkshire) acquires to control the ' +
                 'claims graph. 7x book reflects strategic premium for data monopoly.',
    });
    
    return scenarios;
  }
  
  /**
   * Generate "Kluge's Memo" Report
   * 
   * Executive summary in Kluge style
   */
  generateKlugeMemo(
    performance: PortfolioPerformance,
    revenue: NetworkRevenue,
    exitScenarios: ExitScenario[]
  ): string {
    const baseExit = exitScenarios.find(s => s.scenario === 'base')!;
    
    return `
# Infinity Soul Cyber MGA Portfolio - Kluge Analysis

**Portfolio:** ${this.portfolio?.name || 'Unknown'}
**Assessment Date:** ${performance.assessmentDate.toLocaleDateString()}

## The Numbers That Matter

### Operational Performance
- **Premium Volume:** $${(performance.totalPremium / 1e6).toFixed(1)}M across ${performance.mgaCount} MGAs
- **EBITDA:** $${(performance.totalEbitda / 1e6).toFixed(1)}M (${(performance.ebitdaMargin * 100).toFixed(0)}% margin)
- **Loss Ratio:** ${(performance.avgLossRatio * 100).toFixed(0)}% (target: 70%)
- **Combined Ratio:** ${performance.avgCombinedRatio.toFixed(0)}% (from 120%+ at acquisition)

### The Death Star (Centralized Assets)
- **Claims Graph:** ${performance.claimsGraphSize.toLocaleString()} records (the monopoly)
- **Threat Intel Feeds:** ${performance.threatIntelFeeds} sources
- **API Usage:** ${performance.apiCallsPerMonth.toLocaleString()} quotes/month

### Network Revenue (Monetizing the Graph)
- **MGA Fees:** $${(revenue.mgaFees / 1e6).toFixed(1)}M (30% of premium)
- **Threat Intel Sales:** $${(revenue.threatIntelRevenue / 1e3).toFixed(0)}K (carriers pay)
- **API Revenue:** $${(revenue.apiRevenue / 1e3).toFixed(0)}K ($0.10/quote)
- **Network Fees:** $${(revenue.networkFees / 1e6).toFixed(1)}M (graduated cells)
- **Total Revenue:** $${(revenue.totalRevenue / 1e6).toFixed(1)}M at ${(revenue.netMargin * 100).toFixed(0)}% margin

### Valuation & Exit
- **Book Value:** $${(performance.bookValue / 1e6).toFixed(1)}M
- **Market Value:** $${(performance.marketValue / 1e6).toFixed(1)}M (${performance.multipleOnBook.toFixed(1)}x book)
- **Exit Target:** $${(baseExit.exitPrice / 1e6).toFixed(1)}M at 5x book (${baseExit.exitYear})
- **IRR:** ${baseExit.irr.toFixed(0)}% (Kluge target: 82%)
- **Cash-on-Cash:** ${baseExit.cashOnCashMultiple.toFixed(1)}x

## The Kluge Playbook in Action

### What We Bought
- ${performance.mgaCount} distressed MGAs at 0.5x book ($${(baseExit.totalInvested / 1e6).toFixed(1)}M total)
- Combined ratio >120% (losing money)
- Manual underwriting (operational inefficiency)
- Reinsurance treaties (the license)
- ${performance.claimsGraphSize.toLocaleString()} claims records (the data)

### What We Did
1. **Fired underwriters** → deployed agentic pricing (30 sec vs 30 days)
2. **Centralized claims graph** → one oracle for all MGAs
3. **Integrated threat intel** → pricing adjusts in minutes not months
4. **Improved loss ratio** → 120% → ${performance.avgCombinedRatio}% (better risk selection)
5. **Monetized the graph** → selling threat intel + risk API

### What We're Selling
- **To carriers (2030):** The MGA portfolio at 5x book when they panic-buy AI underwriting
- **Keeping forever:** The claims graph + risk oracle (network fees $${(revenue.networkFees / 1e6).toFixed(1)}M/year)

## The Kluge Principle

> "Buy distressed licenses at 0.5x book. Centralize operations. Own the rails forever."

**We're not in the insurance business. We're in the data monopoly business.**

The carriers will pay 5x book for the MGAs.  
The network fees will run forever.  
The claims graph is the moat.

---

*"If you fall in love with a community, you've already lost. Love the cash flow and the fiber." - John Kluge*
`.trim();
  }
  
  /**
   * Update Portfolio Metrics
   */
  private updatePortfolioMetrics(): void {
    if (!this.portfolio) return;
    
    // Recalculate aggregates
    // (In production, would query actual MGA data)
    this.portfolio.updatedAt = new Date();
  }
  
  /**
   * Estimate API Usage
   */
  private estimateAPIUsage(totalPremium: number): number {
    // Estimate: 1 quote per $1K premium per month
    return Math.round(totalPremium / 1000);
  }
  
  /**
   * Estimate Market Value
   * 
   * Kluge model: 3-5x book based on EBITDA and network effects
   */
  private estimateMarketValue(totalPremium: number, ebitda: number, bookValue: number): number {
    // Base multiple: 3x book (operational improvements)
    let multiple = 3.0;
    
    // Add premium for EBITDA margin
    const ebitdaMargin = totalPremium > 0 ? ebitda / totalPremium : 0;
    if (ebitdaMargin > 0.20) {
      multiple += 1.0; // +1x for >20% margin
    }
    
    // Add premium for network effects
    if (this.claimsGraph.size > 10000) {
      multiple += 1.0; // +1x for strong data moat
    }
    
    return bookValue * multiple;
  }
  
  /**
   * Calculate Portfolio Risk Score
   */
  private calculatePortfolioRiskScore(mgas: MGATarget[]): number {
    // Weighted average of MGA distress scores
    const totalPremium = mgas.reduce((sum, m) => sum + m.annualPremium, 0);
    
    const weightedScore = mgas.reduce((sum, m) => {
      const weight = m.annualPremium / totalPremium;
      return sum + (m.distressScore * weight);
    }, 0);
    
    return Math.round(weightedScore);
  }
  
  /**
   * Calculate IRR
   */
  private calculateIRR(invested: number, exitValue: number, years: number): number {
    return ((Math.pow(exitValue / invested, 1 / years) - 1) * 100);
  }
  
  /**
   * Get Claims Graph Stats
   */
  getClaimsGraphStats(): {
    totalClaims: number;
    uniqueMGAs: Set<string>;
    coverageByIndustry: Map<string, number>;
  } {
    const uniqueMGAs = new Set<string>();
    const coverageByIndustry = new Map<string, number>();
    
    this.claimsGraph.forEach(claim => {
      uniqueMGAs.add(claim.mgaId);
      
      const current = coverageByIndustry.get(claim.industryType) || 0;
      coverageByIndustry.set(claim.industryType, current + 1);
    });
    
    return {
      totalClaims: this.claimsGraph.size,
      uniqueMGAs,
      coverageByIndustry,
    };
  }
}

/**
 * Singleton instance
 */
export const portfolioEngine = new MGAPortfolioEngine();
