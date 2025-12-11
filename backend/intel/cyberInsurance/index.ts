/**
 * Cyber Insurance MGA Module
 * 
 * Implements the Kluge Playbook for cyber insurance:
 * "Buy distressed MGAs at 0.5x book, deploy agents, sell at 5x book"
 * 
 * ## Core Components
 * 
 * ### 1. MGA Acquisition Filter (`mga/mgaAcquisitionFilter.ts`)
 * - Identifies distressed cyber MGAs (combined ratio >115%)
 * - Scores targets on: financial distress, structural assets, operational leverage
 * - Projects 3-year financials and IRR
 * - Recommendation: acquire / negotiate / pass
 * 
 * ### 2. Agentic Underwriter (`underwriting/agenticUnderwriter.ts`)
 * - Replaces human underwriters with AI agents
 * - Ingests claims data → builds loss ratio graph
 * - Analyzes threat intel (CISA, CVE, dark web)
 * - Prices risk in 30 seconds (vs 30 days manual)
 * - API: $0.10/quote
 * 
 * ### 3. Portfolio Engine (`portfolio/mgaPortfolioEngine.ts`)
 * - Manages portfolio of acquired MGAs
 * - Centralizes claims graph ("the Death Star")
 * - Calculates network revenue (MGA fees, threat intel, API, network fees)
 * - Projects exit scenarios (3x, 5x, 7x book)
 * - Generates "Kluge's Memo" executive reports
 * 
 * ## API Routes
 * 
 * All routes prefixed with `/api/cyber-insurance`
 * 
 * ### MGA Evaluation
 * - `GET /kluge-criteria` - Get acquisition criteria
 * - `POST /evaluate-mga` - Score single MGA target
 * - `POST /filter-mgas` - Filter multiple targets
 * 
 * ### Underwriting
 * - `POST /underwrite` - Real-time risk pricing
 * - `GET /loss-ratio-stats` - Claims graph statistics
 * 
 * ### Portfolio Management
 * - `POST /portfolio/init` - Initialize portfolio
 * - `POST /portfolio/add-mga` - Add MGA to portfolio
 * - `POST /portfolio/performance` - Calculate performance
 * - `POST /portfolio/kluge-memo` - Generate executive memo
 * - `GET /portfolio/claims-graph` - Claims graph stats
 * 
 * ## The Kluge Playbook (1956-1985 → 2025-2035)
 * 
 * ### Phase 1: Accumulation (2025-2027)
 * - Buy 3-5 distressed cyber MGAs at 0.5x book ($5M each)
 * - Each MGA: $10M premium, losing $2M/year, has reinsurance treaty + claims data
 * - Deploy agentic underwriter: fire underwriters, price via API in 30 sec
 * - Result: $50M premium → $15M EBITDA by 2027 (vs -$10M at acquisition)
 * - Valuation: 3x book ($150M) on $25M invested
 * 
 * ### Phase 2: The Death Star (2027-2030)
 * - Centralize: one claims graph, one threat oracle, one pricing engine
 * - Ingest security community data (bug bounty, OSS tools, CVE databases)
 * - Monetize the graph:
 *   - Sell threat intel to carriers ($500K/year)
 *   - Sell risk API to brokers ($0.10/quote = $1M/year)
 *   - Keep 30% of premium as MGA fee ($15M/year)
 * - Result: $150M premium → $45M EBITDA
 * - Valuation: 5x book ($750M)
 * 
 * ### Phase 3: The Exit (2030-2033)
 * - Sell MGA portfolio to Berkshire/AIG for $750M (5x book)
 * - Reinvest $200M in MCP marketplace + agent attestation protocol
 * - Keep claims graph forever (network fees $100M/year at 90% margin)
 * - Final exit: Sell network access rights for $2B in 2035
 * 
 * ## Capital Structure
 * 
 * - **Debt/Equity:** 3:1 (cloud credits = tax-free debt)
 * - **Funding:**
 *   - 70% cloud credits (AWS Activate, Azure for Startups)
 *   - 20% venture debt at 12%
 *   - 10% founder equity (keep 40% of HoldCo)
 * - **Tax Shield:**
 *   - $SOUL tokens = cost basis expense
 *   - Compute depreciation = paper loss
 *   - ESOP structure = tax-free compensation
 * - **Result:** Build $2B exit on $10M actual cash
 * 
 * ## Daily Cadence (2025)
 * 
 * ### Morning (8:00 AM)
 * - Scan PitchBook for MGAs: combined ratio >115%, premium <$20M, owner age >55
 * - Question: "Can I fire the underwriters and replace with agents?"
 * - Action: Send 3 stewardship offers: "$50K cash + 15% revshare + governance tokens"
 * 
 * ### Afternoon (2:00 PM)
 * - Check IS Network: agent quoted 500 policies, loss ratio 68% (vs industry 120%)
 * - Action: Deploy analyst agent to ingest CISA advisory, update pricing globally
 * - Community check: Discord vote on risk appetite, honor the vote
 * 
 * ### Evening (6:00 PM)
 * - Sponsor pipe: $12K in API fees today, $4K to community, $8K to HoldCo
 * - Question: "Which security tool to acquire? The one with 10K stars + 2 maintainers quitting"
 * - Action: Offer $0 + 20% of cell profits
 * 
 * ## Key Metrics (2025 → 2035)
 * 
 * | Year | Action | Premium | EBITDA | Valuation |
 * |------|--------|---------|--------|-----------|
 * | 2025 | Buy 1 MGA | $10M | -$2M | $5M (0.5x) |
 * | 2027 | Buy 5 MGAs | $50M | $15M | $150M (3x) |
 * | 2030 | Centralize | $150M | $45M | $750M (5x) |
 * | 2033 | Sell MGAs, buy protocols | $50M (protocol) | $40M | $500M (10x) |
 * | 2035 | Keep rails, sell network | $100M (fees) | $90M | **$2B (exit)** |
 * 
 * **Total Invested:** $10M cash + $40M cloud credits
 * **Total Returned:** $2B+
 * **IRR:** 82% (Kluge target)
 * 
 * ## Usage Examples
 * 
 * ```typescript
 * import { calculateMGAAcquisitionScore } from './mga/mgaAcquisitionFilter';
 * import { underwriter } from './underwriting/agenticUnderwriter';
 * import { portfolioEngine } from './portfolio/mgaPortfolioEngine';
 * 
 * // 1. Evaluate MGA target
 * const score = calculateMGAAcquisitionScore(mgaTarget);
 * console.log(`Score: ${score.overallScore}/100, IRR: ${score.projectedFinancials.irr}%`);
 * console.log(`Recommendation: ${score.recommendation}`);
 * 
 * // 2. Price risk with agent
 * const assessment = await underwriter.assessRisk({
 *   applicantName: 'Acme Corp',
 *   industry: 'tech',
 *   companySize: 'medium',
 *   annualRevenue: 50_000_000,
 *   coverageAmount: 1_000_000,
 *   deductible: 25_000,
 *   coveragePeriod: 12,
 *   securityControls: ['MFA', 'EDR', 'SOC2'],
 *   jurisdiction: 'CA',
 *   requestedAt: new Date(),
 * });
 * console.log(`Premium: $${assessment.monthlyPremium}/month`);
 * console.log(`Decision: ${assessment.decision}`);
 * 
 * // 3. Calculate portfolio performance
 * const portfolio = portfolioEngine.initializePortfolio('IS Cyber Network');
 * portfolioEngine.addMGA(mga1);
 * portfolioEngine.addMGA(mga2);
 * const performance = portfolioEngine.calculatePerformance([mga1, mga2]);
 * const revenue = portfolioEngine.calculateNetworkRevenue(performance);
 * console.log(`EBITDA: $${performance.totalEbitda}`);
 * console.log(`Network Revenue: $${revenue.totalRevenue}`);
 * 
 * // 4. Generate Kluge's Memo
 * const exitScenarios = portfolioEngine.projectExitScenarios(performance, 25_000_000);
 * const memo = portfolioEngine.generateKlugeMemo(performance, revenue, exitScenarios);
 * console.log(memo);
 * ```
 * 
 * ## Telluridian Overlay (Community Governance)
 * 
 * Kluge didn't care about community; he cared about cash flow.
 * But **Infinity Soul** adds the Telluride twist:
 * 
 * - **Governance:** Each MGA cell elects House Committee (votes on risk appetite, profit distribution)
 * - **Liberation:** Goal is to graduate cell to self-governance, not flip for max profit
 * - **Commons Tithing:** 10% of revenue funds free security training programs
 * - **Data Sovereignty:** Communities can fork their claims graph and leave
 * 
 * **Kluge would approve:** Community governance = operational efficiency.
 * It reduces management overhead and makes the cell sellable to mission-driven buyers at a premium.
 * The mission is real, but the math is still Kluge.
 * 
 * ---
 * 
 * *"If you fall in love with a community, you've already lost. Love the cash flow and the fiber." - John Kluge*
 */

// Export main components
export { MGATarget, MGAAcquisitionScore, MGAPortfolio, ClaimRecord } from './mga/mgaTypes';
export { calculateMGAAcquisitionScore, filterMGATargets, KLUGE_FILTER_CRITERIA } from './mga/mgaAcquisitionFilter';
export { AgenticUnderwriter, underwriter, RiskAssessmentRequest, RiskAssessmentResponse } from './underwriting/agenticUnderwriter';
export { MGAPortfolioEngine, portfolioEngine, PortfolioPerformance, NetworkRevenue, ExitScenario } from './portfolio/mgaPortfolioEngine';

// Export routes
export { default as cyberInsuranceRoutes } from './routes';
