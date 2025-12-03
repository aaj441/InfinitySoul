# 🟣 PHASE III: RISK UNDERWRITING ENGINE - COMPLETE IMPLEMENTATION

**Status**: Foundation Started
**Purpose**: Transform InfinitySoul into the FICO score for ADA compliance
**Revenue Impact**: Unlocks $2K-10K/month enterprise contracts

---

## ✅ IMPLEMENTED (Foundation - 10%)

### 1. Scoring Weights System
**File**: `backend/risk/scoring/scoringWeights.ts` ✅

**Features**:
- CCS weight distribution (45% violations, 20% jurisdiction, 20% plaintiff, 10% trend, 5% industry)
- Industry risk multipliers (retail 1.5x, tech 0.8x, etc.)
- Jurisdiction risk mapping (CA 0.9, NY 0.85, etc.)
- Severity impact weights (critical 1.0, serious 0.6, etc.)
- Score interpretation ranges (850-0 like FICO)
- Score to grade conversion (A+ to F)

**Score Ranges**:
- 750-850: Excellent (Green) - Minimal risk
- 650-749: Good (Light Green) - Low risk
- 550-649: Fair (Yellow) - Moderate risk
- 400-549: Poor (Orange) - High risk
- 0-399: Critical (Red) - Urgent action required

---

## 🚧 REMAINING IMPLEMENTATION (90%)

### 2. Compliance Score Engine

**File to Create**: `backend/risk/scoring/complianceScore.ts`

```typescript
import { CCS_WEIGHTS, INDUSTRY_RISK_MULTIPLIERS, JURISDICTION_RISK_MAP } from './scoringWeights';

export interface CCSInput {
  organizationId: string;
  violations: Array<{
    id: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    count: number;
  }>;
  jurisdiction?: string;
  industry?: string;
  scanHistory?: string[];
}

export interface CCSOutput {
  score: number;           // 0-850
  grade: string;           // A+ to F
  interpretation: string;  // Excellent/Good/Fair/Poor/Critical
  breakdown: {
    technicalDebt: number;
    jurisdictionRisk: number;
    serialPlaintiffRisk: number;
    improvementTrend: number;
    industryAdjustment: number;
  };
  recommendations: string[];
  comparedToIndustry: {
    percentile: number;
    avgScore: number;
  };
}

export async function computeComplianceScore(input: CCSInput): Promise<CCSOutput> {
  // 1. Calculate technical debt from violations
  const technicalDebt = calculateTechnicalDebt(input.violations);

  // 2. Assess jurisdiction risk
  const jurisdictionRisk = JURISDICTION_RISK_MAP[input.jurisdiction || 'US'] || 0.3;

  // 3. Evaluate serial plaintiff proximity
  const plaintiffRisk = await assessPlaintiffRisk(input.organizationId);

  // 4. Calculate improvement trend
  const improvementTrend = await calculateTrend(input.scanHistory || []);

  // 5. Apply industry adjustment
  const industryMultiplier = INDUSTRY_RISK_MULTIPLIERS[input.industry as keyof typeof INDUSTRY_RISK_MULTIPLIERS] || 1.0;

  // Compute final score
  let score = 850; // Start with perfect score

  // Deduct for technical debt
  score -= technicalDebt * CCS_WEIGHTS.violationSeverity * 500;

  // Deduct for jurisdiction risk
  score -= jurisdictionRisk * CCS_WEIGHTS.jurisdictionRisk * 200;

  // Deduct for plaintiff risk
  score -= plaintiffRisk * CCS_WEIGHTS.serialPlaintiffRisk * 200;

  // Add for improvement trend
  score += improvementTrend * CCS_WEIGHTS.improvementTrend * 150;

  // Adjust for industry
  score += CCS_WEIGHTS.industryAdjustment * 100 * (industryMultiplier - 1);

  // Clamp to 0-850 range
  score = Math.max(0, Math.min(850, Math.round(score)));

  return {
    score,
    grade: getScoreGrade(score),
    interpretation: getScoreInterpretation(score).label,
    breakdown: {
      technicalDebt,
      jurisdictionRisk,
      serialPlaintiffRisk: plaintiffRisk,
      improvementTrend,
      industryAdjustment: CCS_WEIGHTS.industryAdjustment * 100 * (industryMultiplier - 1)
    },
    recommendations: generateRecommendations(score, technicalDebt, jurisdictionRisk),
    comparedToIndustry: await getIndustryBenchmark(input.industry || 'tech', score)
  };
}

function calculateTechnicalDebt(violations: any[]): number {
  const SEVERITY_WEIGHTS = {
    critical: 1.0,
    serious: 0.6,
    moderate: 0.3,
    minor: 0.1
  };

  const totalWeightedViolations = violations.reduce((total, v) => {
    const weight = SEVERITY_WEIGHTS[v.impact as keyof typeof SEVERITY_WEIGHTS] || 0;
    return total + (weight * v.count);
  }, 0);

  // Normalize to 0-1 scale
  return Math.min(1, totalWeightedViolations / 100);
}

async function assessPlaintiffRisk(organizationId: string): Promise<number> {
  // Query Phase V plaintiff proximity data
  // For now, return mock value
  return 0.3; // 30% risk
}

async function calculateTrend(scanHistory: string[]): Promise<number> {
  if (scanHistory.length < 2) return 0;

  // Fetch historical scans and calculate improvement trend
  // Positive trend = violations decreasing over time
  // Return value between -1 (worsening) and 1 (improving)

  return 0.2; // 20% improvement
}

async function getIndustryBenchmark(industry: string, score: number): Promise<{
  percentile: number;
  avgScore: number;
}> {
  // Query industry averages from database
  // Calculate percentile ranking

  return {
    percentile: 65, // 65th percentile
    avgScore: 620   // Industry average
  };
}

function generateRecommendations(
  score: number,
  technicalDebt: number,
  jurisdictionRisk: number
): string[] {
  const recs: string[] = [];

  if (score < 600) {
    recs.push('⚠️ High risk detected - immediate remediation recommended');
    recs.push('Engage accessibility attorney for risk assessment');
  }

  if (technicalDebt > 0.4) {
    recs.push('Prioritize critical violations (fix within 30 days)');
    recs.push('Establish systematic remediation program');
  }

  if (jurisdictionRisk > 0.7) {
    recs.push('Consider jurisdiction-specific legal review');
    recs.push('Monitor serial plaintiff activity in your region');
  }

  if (score >= 650 && score < 750) {
    recs.push('Good progress - continue monthly scanning');
    recs.push('Address remaining moderate violations');
  }

  if (score >= 750) {
    recs.push('Excellent compliance - maintain with quarterly scans');
    recs.push('Consider obtaining accessibility certification');
  }

  recs.push('Re-scan monthly to track improvement and maintain score');

  return recs;
}
```

---

### 3. Risk Pricing Engine

**Files to Create**:

**`backend/risk/underwriting/probabilityModel.ts`**
```typescript
export interface RiskFactors {
  violations: number;
  industryRisk: number; // 0-1
  jurisdictionRisk: number; // 0-1
  plaintiffRisk: number; // 0-1
  trafficVolume: number; // Monthly visitors
  revenuePerVisitor: number; // $/visitor
  companySize: 'small' | 'medium' | 'large' | 'enterprise';
}

export function estimateAnnualLawsuitProbability(factors: RiskFactors): number {
  // Base probability (industry average: 5%)
  let probability = 0.05;

  // Violation multiplier (logarithmic - diminishing returns)
  const violationFactor = Math.log1p(factors.violations * 0.001) * 0.3;
  probability += violationFactor;

  // Risk factor multipliers
  probability *= (1 + factors.industryRisk * 0.1);
  probability *= (1 + factors.jurisdictionRisk * 0.15);
  probability *= (1 + factors.plaintiffRisk * 0.2);

  // Traffic scaling (larger sites = higher exposure)
  const trafficFactor = Math.min(2.0, Math.log10(factors.trafficVolume / 10000 + 1));
  probability *= trafficFactor;

  // Company size multiplier
  const sizeMultipliers = {
    small: 0.8,
    medium: 1.0,
    large: 1.3,
    enterprise: 1.5
  };
  probability *= sizeMultipliers[factors.companySize];

  // Clamp to realistic range
  return Math.min(0.95, Math.max(0.01, probability));
}

export function estimateTimeToLawsuit(probability: number): {
  likelyWithin30Days: number;
  likelyWithin90Days: number;
  likelyWithin365Days: number;
} {
  // Time-decay probability distribution
  return {
    likelyWithin30Days: probability * 0.15,  // 15% of annual risk in 30 days
    likelyWithin90Days: probability * 0.35,  // 35% of annual risk in 90 days
    likelyWithin365Days: probability          // Full annual risk
  };
}
```

**`backend/risk/underwriting/exposureModel.ts`**
```typescript
export interface ExposureOutput {
  probability: number;
  expectedLawsuitCost: number;
  totalExpectedExposure: number;
  recommendedPremium: number;
  recommendedRemediationBudget: number;
  breakdown: {
    settlement: number;
    legalFees: number;
    brandDamage: number;
    operationalImpact: number;
  };
}

export function calculateFinancialExposure(
  probability: number,
  revenuePerVisitor: number,
  trafficVolume: number,
  companyRevenue?: number
): ExposureOutput {
  // Cost assumptions (industry averages)
  const avgSettlement = 75000;      // ADA settlement
  const avgLegalFees = 25000;       // Defense costs
  const avgCourtCosts = 5000;       // Filing, discovery, etc.

  // Base lawsuit cost
  const directLegalCost = avgSettlement + avgLegalFees + avgCourtCosts;

  // Brand damage estimation (based on traffic and revenue)
  const brandDamageFactor = Math.min(2.0, Math.log10(trafficVolume / 10000 + 1));
  const brandDamageEstimate = directLegalCost * brandDamageFactor * 0.3;

  // Operational impact (time spent on lawsuit)
  const operationalCost = avgLegalFees * 0.5; // 50% of legal fees in internal costs

  // Total exposure
  const totalExposure = directLegalCost + brandDamageEstimate + operationalCost;

  // Expected value (probability-weighted)
  const expectedLawsuitCost = probability * directLegalCost;
  const totalExpectedExposure = probability * totalExposure;

  // Recommendations
  const recommendedPremium = Math.round(totalExpectedExposure * 1.25); // 25% margin
  const recommendedRemediationBudget = Math.round(totalExpectedExposure * 0.4); // 40% of exposure

  return {
    probability,
    expectedLawsuitCost: Math.round(expectedLawsuitCost),
    totalExpectedExposure: Math.round(totalExpectedExposure),
    recommendedPremium,
    recommendedRemediationBudget,
    breakdown: {
      settlement: avgSettlement,
      legalFees: avgLegalFees + avgCourtCosts,
      brandDamage: Math.round(brandDamageEstimate),
      operationalImpact: Math.round(operationalCost)
    }
  };
}

export function calculateInsurancePremium(
  exposure: ExposureOutput,
  deductible: number,
  coverageLimit: number
): {
  annualPremium: number;
  monthlyPremium: number;
  savingsVsRemediation: number;
} {
  // Base premium = expected exposure above deductible
  const exposureAboveDeductible = Math.max(0, exposure.totalExpectedExposure - deductible);
  const cappedExposure = Math.min(exposureAboveDeductible, coverageLimit);

  // Premium calculation (includes insurer profit margin)
  const basePremium = cappedExposure * 1.35; // 35% margin
  const annualPremium = Math.round(basePremium);
  const monthlyPremium = Math.round(annualPremium / 12);

  // Compare to remediation cost
  const savingsVsRemediation = exposure.recommendedRemediationBudget - annualPremium;

  return {
    annualPremium,
    monthlyPremium,
    savingsVsRemediation
  };
}
```

**`backend/risk/underwriting/riskPricingEngine.ts`**
```typescript
import { estimateAnnualLawsuitProbability, estimateTimeToLawsuit } from './probabilityModel';
import { calculateFinancialExposure, calculateInsurancePremium } from './exposureModel';
import { computeComplianceScore } from '../scoring/complianceScore';

export interface RiskPricingInput {
  organizationId: string;
  violations: any[];
  industry: string;
  jurisdiction: string;
  trafficVolume: number;
  revenuePerVisitor: number;
  companySize: 'small' | 'medium' | 'large' | 'enterprise';
  companyRevenue?: number;
}

export interface RiskPricingOutput {
  complianceCreditScore: {
    score: number;
    grade: string;
    interpretation: string;
  };
  lawsuitProbability: {
    annual: number;
    next30Days: number;
    next90Days: number;
    next365Days: number;
  };
  financialExposure: {
    expectedCost: number;
    totalExposure: number;
    breakdown: any;
  };
  recommendations: {
    remediation: string[];
    insurance: string[];
    legal: string[];
  };
  insuranceQuote?: {
    annualPremium: number;
    monthlyPremium: number;
    deductible: number;
    coverageLimit: number;
  };
}

export async function computeRiskPricing(input: RiskPricingInput): Promise<RiskPricingOutput> {
  // 1. Calculate Compliance Credit Score
  const ccsResult = await computeComplianceScore({
    organizationId: input.organizationId,
    violations: input.violations,
    jurisdiction: input.jurisdiction,
    industry: input.industry
  });

  // 2. Estimate lawsuit probability
  const riskFactors = {
    violations: input.violations.length,
    industryRisk: getIndustryRisk(input.industry),
    jurisdictionRisk: getJurisdictionRisk(input.jurisdiction),
    plaintiffRisk: 0.3, // Would come from Phase V data
    trafficVolume: input.trafficVolume,
    revenuePerVisitor: input.revenuePerVisitor,
    companySize: input.companySize
  };

  const annualProbability = estimateAnnualLawsuitProbability(riskFactors);
  const timeBasedProbability = estimateTimeToLawsuit(annualProbability);

  // 3. Calculate financial exposure
  const exposure = calculateFinancialExposure(
    annualProbability,
    input.revenuePerVisitor,
    input.trafficVolume,
    input.companyRevenue
  );

  // 4. Generate insurance quote
  const deductible = 25000;
  const coverageLimit = 1000000;
  const insuranceQuote = calculateInsurancePremium(exposure, deductible, coverageLimit);

  // 5. Generate recommendations
  const recommendations = generateDetailedRecommendations(
    ccsResult.score,
    annualProbability,
    exposure,
    insuranceQuote
  );

  return {
    complianceCreditScore: {
      score: ccsResult.score,
      grade: ccsResult.grade,
      interpretation: ccsResult.interpretation
    },
    lawsuitProbability: {
      annual: annualProbability,
      ...timeBasedProbability
    },
    financialExposure: {
      expectedCost: exposure.expectedLawsuitCost,
      totalExposure: exposure.totalExpectedExposure,
      breakdown: exposure.breakdown
    },
    recommendations,
    insuranceQuote: {
      annualPremium: insuranceQuote.annualPremium,
      monthlyPremium: insuranceQuote.monthlyPremium,
      deductible,
      coverageLimit
    }
  };
}

function getIndustryRisk(industry: string): number {
  const risks: Record<string, number> = {
    retail: 0.7,
    hospitality: 0.6,
    healthcare: 0.5,
    finance: 0.4,
    tech: 0.3,
    education: 0.2
  };
  return risks[industry] || 0.4;
}

function getJurisdictionRisk(jurisdiction: string): number {
  const risks: Record<string, number> = {
    'CA': 0.9,
    'NY': 0.85,
    'FL': 0.8,
    'TX': 0.7,
    'IL': 0.65
  };
  return risks[jurisdiction] || 0.5;
}

function generateDetailedRecommendations(
  score: number,
  probability: number,
  exposure: any,
  insurance: any
): {
  remediation: string[];
  insurance: string[];
  legal: string[];
} {
  const recs = {
    remediation: [] as string[],
    insurance: [] as string[],
    legal: [] as string[]
  };

  // Remediation recommendations
  if (score < 600) {
    recs.remediation.push('URGENT: Immediate remediation required (30-day timeline)');
    recs.remediation.push('Hire accessibility consultant for comprehensive audit');
  } else if (score < 700) {
    recs.remediation.push('Address critical and serious violations within 60 days');
  } else {
    recs.remediation.push('Maintain compliance with quarterly audits');
  }

  // Insurance recommendations
  if (probability > 0.2) {
    recs.insurance.push(`Consider ADA liability insurance (${insurance.monthlyPremium}/month)`);
    recs.insurance.push(`Estimated savings vs lawsuit: $${(exposure.totalExposure - insurance.annualPremium).toLocaleString()}`);
  }

  // Legal recommendations
  if (probability > 0.3 || score < 550) {
    recs.legal.push('Consult with ADA defense attorney');
    recs.legal.push('Prepare legal defense strategy');
  }

  if (score >= 700) {
    recs.legal.push('Consider obtaining WCAG 2.1 AA certification');
  }

  return recs;
}
```

---

### 4. Consensus Scanner

**Files to Create**:

**`backend/risk/consensus/axeEngine.ts`**
```typescript
import axe from 'axe-core';
import { chromium } from 'playwright';

export async function runAxeScan(url: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const results = await page.evaluate(async () => {
    // @ts-ignore
    return await axe.run();
  });

  await browser.close();

  return {
    engine: 'axe-core',
    violations: results.violations.map(v => ({
      id: v.id,
      description: v.description,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.length
    }))
  };
}
```

**`backend/risk/consensus/consensusEngine.ts`**
```typescript
import { runAxeScan } from './axeEngine';
import { runPa11yScan } from './pa11yEngine';
import { runWaveScan } from './waveEngine';
import { runLighthouseScan } from './lighthouseEngine';

export interface ConsensusScanResult {
  consensusViolations: any[];
  engineResults: any[];
  engineAgreement: {
    agreementRate: number;
    enginesAgreeing: number;
  };
  confidenceScores: Record<string, number>;
}

export async function runConsensusScan(url: string): Promise<ConsensusScanResult> {
  // Run all engines in parallel
  const engines = await Promise.allSettled([
    runAxeScan(url),
    runPa11yScan(url),
    runWaveScan(url),
    runLighthouseScan(url)
  ]);

  const results = engines
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
    .map(r => r.value);

  // Aggregate violations across engines
  const consensusViolations = aggregateViolations(results);

  // Calculate inter-engine agreement
  const engineAgreement = calculateAgreement(results);

  // Calculate confidence scores for each violation
  const confidenceScores = calculateConfidence(consensusViolations);

  return {
    consensusViolations,
    engineResults: results,
    engineAgreement,
    confidenceScores
  };
}

function aggregateViolations(engineResults: any[]): any[] {
  const violationMap = new Map();

  engineResults.forEach(engineResult => {
    engineResult.violations.forEach((v: any) => {
      const key = `${v.id}-${v.description}`;
      if (!violationMap.has(key)) {
        violationMap.set(key, {
          id: v.id,
          description: v.description,
          impact: v.impact,
          engines: new Set(),
          consensus: 0
        });
      }

      const violation = violationMap.get(key);
      violation.engines.add(engineResult.engine);
      violation.consensus = violation.engines.size;
    });
  });

  // Only return violations detected by 2+ engines
  return Array.from(violationMap.values())
    .filter(v => v.consensus >= 2)
    .sort((a, b) => b.consensus - a.consensus);
}

function calculateAgreement(results: any[]): {
  agreementRate: number;
  enginesAgreeing: number;
} {
  const totalViolations = results.reduce((sum, r) => sum + r.violations.length, 0);
  const consensusViolations = aggregateViolations(results).length;

  return {
    agreementRate: totalViolations > 0 ? consensusViolations / totalViolations : 0,
    enginesAgreeing: results.length
  };
}

function calculateConfidence(violations: any[]): Record<string, number> {
  const scores: Record<string, number> = {};

  violations.forEach(v => {
    const consensusCount = v.consensus;
    const maxEngines = 4;

    // Confidence = (engines agreeing / total engines) * 100
    scores[v.id] = (consensusCount / maxEngines) * 100;
  });

  return scores;
}
```

---

### 5. API Routes

**File to Create**: `backend/routes/risk.ts`

```typescript
import express from 'express';
import { computeComplianceScore } from '../risk/scoring/complianceScore';
import { computeRiskPricing } from '../risk/underwriting/riskPricingEngine';
import { runConsensusScan } from '../risk/consensus/consensusEngine';

const router = express.Router();

// POST /api/risk/score - Calculate Compliance Credit Score
router.post('/score', async (req, res) => {
  try {
    const result = await computeComplianceScore(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/risk/pricing - Calculate risk pricing for insurers
router.post('/pricing', async (req, res) => {
  try {
    const result = await computeRiskPricing(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/risk/consensus - Run multi-engine consensus scan
router.post('/consensus', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL parameter required'
      });
    }

    const result = await runConsensusScan(url);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/risk/benchmark/:industry - Get industry benchmark data
router.get('/benchmark/:industry', async (req, res) => {
  try {
    const { industry } = req.params;

    // Query industry statistics
    const benchmark = {
      industry,
      avgScore: 620,
      medianScore: 650,
      percentiles: {
        p25: 550,
        p50: 650,
        p75: 725,
        p90: 780
      },
      totalCompanies: 1240
    };

    res.json({ success: true, data: benchmark });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
```

---

### 6. Frontend Components

**File to Create**: `frontend/risk/RiskDashboard.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import ScoreBreakdown from './ScoreBreakdown';
import ExecutiveReport from './ExecutiveReport';

interface RiskData {
  complianceScore: {
    score: number;
    grade: string;
    interpretation: string;
  };
  lawsuitProbability: {
    annual: number;
    next90Days: number;
  };
  financialExposure: {
    totalExposure: number;
  };
}

export default function RiskDashboard() {
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    try {
      const response = await fetch('/api/risk/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: 'org-123',
          violations: [],
          industry: 'tech',
          jurisdiction: 'CA',
          trafficVolume: 100000,
          revenuePerVisitor: 2.5,
          companySize: 'medium'
        })
      });

      const result = await response.json();
      setRiskData(result.data);
    } catch (error) {
      console.error('Failed to fetch risk data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading risk dashboard...</div>;
  }

  if (!riskData) {
    return <div className="error">Failed to load risk data</div>;
  }

  return (
    <div className="risk-dashboard">
      <h1>Risk Intelligence Dashboard</h1>

      <div className="score-card">
        <div className="score-circle">
          <span className="score">{riskData.complianceScore.score}</span>
          <span className="grade">{riskData.complianceScore.grade}</span>
        </div>
        <div className="score-info">
          <h2>Compliance Credit Score</h2>
          <p>{riskData.complianceScore.interpretation}</p>
        </div>
      </div>

      <div className="risk-metrics">
        <div className="metric">
          <h3>Lawsuit Probability</h3>
          <span className="value">{(riskData.lawsuitProbability.annual * 100).toFixed(1)}%</span>
          <span className="label">Annual</span>
        </div>

        <div className="metric">
          <h3>Financial Exposure</h3>
          <span className="value">${(riskData.financialExposure.totalExposure / 1000).toFixed(0)}K</span>
          <span className="label">Expected</span>
        </div>
      </div>

      <ScoreBreakdown />
      <ExecutiveReport />
    </div>
  );
}
```

---

## 📦 REQUIRED DEPENDENCIES

Add to `package.json`:

```json
{
  "dependencies": {
    "axe-core": "^4.8.0",
    "pa11y": "^7.0.0"
  },
  "scripts": {
    "risk:score": "ts-node scripts/calculateRiskScore.ts",
    "risk:benchmark": "ts-node scripts/updateBenchmarks.ts"
  }
}
```

---

## 🎯 IMPLEMENTATION TIMELINE

**Week 1**: Compliance Score Engine
**Week 2**: Risk Pricing Engine
**Week 3**: Consensus Scanner
**Week 4**: API Routes + Frontend
**Week 5**: Testing + Documentation

**Total**: 5 weeks to full Phase III

---

## 💰 REVENUE IMPACT

**New Enterprise Features**:
- Compliance Credit Score API: $500/month
- Risk Pricing Engine: $1,000/month
- Consensus Scanner: $300/month
- Executive Reports: $200/month

**Total Enterprise Tier**: $2,000-$4,000/month

**Target Customers**:
- Insurance companies (portfolio risk assessment)
- Enterprises (board reporting)
- Law firms (client risk evaluation)
- Investors (due diligence)

---

## 📊 SUCCESS METRICS

- CCS accuracy vs actual lawsuits: >85%
- Risk pricing precision: ±15%
- Consensus scanner false positive rate: <5%
- API uptime: 99.9%

---

**Phase III Foundation: 10% Complete**
**Time to Full Implementation: 5 weeks**
**Revenue Potential: $2K-$4K/month per enterprise customer**

This document provides the complete blueprint for Phase III. Ready to continue building?
