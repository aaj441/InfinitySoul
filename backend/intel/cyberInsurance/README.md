# Cyber Insurance MGA Module

**"Buy distressed licenses at 0.5x book. Centralize operations. Own the rails forever."**

## Quick Start

### API Usage

```bash
# 1. Evaluate a single MGA target
curl -X POST http://localhost:3000/api/cyber-insurance/evaluate-mga \
  -H "Content-Type: application/json" \
  -d '{
    "id": "mga-001",
    "name": "CyberShield MGA",
    "annualPremium": 10000000,
    "claimsExpense": 3000000,
    "operatingExpense": 4000000,
    "combinedRatio": 120,
    "bookValue": 10000000,
    "targetAcquisitionPrice": 5000000,
    ...
  }'

# 2. Get real-time underwriting quote (30 seconds)
curl -X POST http://localhost:3000/api/cyber-insurance/underwrite \
  -H "Content-Type: application/json" \
  -d '{
    "applicantName": "Acme Corp",
    "industry": "tech",
    "companySize": "medium",
    "annualRevenue": 50000000,
    "coverageAmount": 1000000,
    "deductible": 25000,
    "securityControls": ["MFA", "EDR", "SOC2"],
    "jurisdiction": "CA"
  }'

# 3. Generate Kluge's Memo for portfolio
curl -X POST http://localhost:3000/api/cyber-insurance/portfolio/kluge-memo \
  -H "Content-Type: application/json" \
  -d '{"mgas": [...], "totalInvested": 25000000}'
```

### TypeScript Usage

```typescript
import {
  calculateMGAAcquisitionScore,
  underwriter,
  portfolioEngine,
} from './backend/intel/cyberInsurance';

// Evaluate MGA
const score = calculateMGAAcquisitionScore(mgaTarget);
console.log(`Score: ${score.overallScore}/100, IRR: ${score.projectedFinancials.irr}%`);

// Price risk
const assessment = await underwriter.assessRisk(request);
console.log(`Premium: $${assessment.monthlyPremium}/month, Decision: ${assessment.decision}`);

// Generate Kluge's Memo
const memo = portfolioEngine.generateKlugeMemo(performance, revenue, exitScenarios);
```

## Module Structure

```
backend/intel/cyberInsurance/
├── mga/
│   ├── mgaTypes.ts              # Core data models
│   └── mgaAcquisitionFilter.ts  # Scoring & filtering logic
├── underwriting/
│   └── agenticUnderwriter.ts    # Real-time pricing engine
├── portfolio/
│   └── mgaPortfolioEngine.ts    # Portfolio management
├── routes.ts                     # API endpoints
├── index.ts                      # Module exports
└── examples/
    └── klugePlaybookExample.ts  # Usage examples
```

## Key Features

### 1. MGA Acquisition Filter
- **Scores targets** on 5 dimensions: financial distress, structural assets, operational leverage, market position, acquisition price
- **Projects financials** over 3 years with IRR calculation
- **Generates recommendations**: acquire / negotiate / pass
- **Kluge target**: 0.5x book, combined ratio >115%, 82% IRR

### 2. Agentic Underwriter
- **Replaces human underwriters** (30 seconds vs 30 days)
- **Builds loss ratio graph** from claims data
- **Integrates threat intel** (CISA, CVE databases)
- **Real-time pricing** via API ($0.10/quote)
- **Improves loss ratio** through better risk selection

### 3. Portfolio Engine
- **Centralizes operations** across all MGAs
- **Calculates network revenue**: MGA fees, threat intel, API, network fees
- **Projects exit scenarios**: 3x, 5x, 7x book value
- **Generates "Kluge's Memo"** executive reports
- **Claims graph** = the monopoly (never sell)

## The Strategy (2025-2035)

| Year | Action | Premium | EBITDA | Valuation | Multiple |
|------|--------|---------|--------|-----------|----------|
| 2025 | Buy 1 MGA | $10M | -$2M | $5M | 0.5x |
| 2027 | Buy 5 MGAs | $50M | $15M | $150M | 3x |
| 2030 | Centralize | $150M | $45M | $750M | 5x |
| 2035 | Keep rails | $100M fees | $90M | $2B | Exit |

**IRR Target:** 82% (Kluge's standard)

## API Endpoints

All routes prefixed with `/api/cyber-insurance`

### MGA Evaluation
- `GET /kluge-criteria` - Get acquisition criteria
- `POST /evaluate-mga` - Score single MGA
- `POST /filter-mgas` - Filter multiple MGAs

### Underwriting
- `POST /underwrite` - Real-time pricing (30 sec)
- `GET /loss-ratio-stats` - Claims graph statistics

### Portfolio
- `POST /portfolio/init` - Initialize portfolio
- `POST /portfolio/add-mga` - Add MGA
- `POST /portfolio/performance` - Calculate metrics
- `POST /portfolio/kluge-memo` - Generate report
- `GET /portfolio/claims-graph` - Graph statistics

## Kluge Principles

1. **Buy Distressed Licenses** - MGAs losing money (combined ratio >115%)
2. **Deploy Agents** - Replace underwriters, price in 30 seconds
3. **Centralize Operations** - One graph, one oracle, one API
4. **Monetize the Graph** - Sell threat intel + risk API
5. **Exit at 5x Book** - Sell to carriers when they panic-buy AI
6. **Keep the Rails** - Never sell claims graph, charge network fees forever

## Documentation

- **Full Playbook:** [docs/CYBER_INSURANCE_MGA_PLAYBOOK.md](../../docs/CYBER_INSURANCE_MGA_PLAYBOOK.md)
- **Module Overview:** [index.ts](./index.ts)
- **Example Usage:** [examples/klugePlaybookExample.ts](./examples/klugePlaybookExample.ts)

## Tests

```bash
npm test -- tests/cyber-insurance.test.ts
```

---

**"If you fall in love with a community, you've already lost. Love the cash flow and the fiber." - John Kluge**
