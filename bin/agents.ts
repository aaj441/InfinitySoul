#!/usr/bin/env node
/**
 * InfinitySoul CLI - Agent Commands
 *
 * Command-line interface for running InfinitySoul agents and generating reports.
 *
 * Philosophy: Make peace-of-mind accessible through simple commands.
 * Transparency, accountability, and empowerment for all stakeholders.
 *
 * Usage:
 *   pnpm agents:regulator-scan            # Run NAIC compliance scan
 *   pnpm agents:campus-risk csudh         # Generate campus risk summary
 *   pnpm agents:music-coach <studentId>   # Generate wellness coaching plan
 *   pnpm agents:collective-risk <region>  # Assess collective social unrest risk
 *   pnpm agents:insurer-report csudh      # Generate insurer actuarial report
 *   pnpm agents:regulator-brief csudh     # Generate regulator compliance briefing
 */

import { Command } from 'commander';
import { runRegulatorComplianceScan } from '../backend/services/agents/regulatorGuardAgent';
import { summarizeCampusRisk } from '../backend/services/agents/universityRiskAgent';
import { generateMusicCoachingPlan } from '../backend/services/agents/musicCoachAgent';
import {
  getCampus,
  getCampusRiskEvents,
  getStudentRiskProfile,
  getStudentsByCampus,
  getCampusRiskSummary,
  generateInsurerReport,
  generateRegulatorBriefing,
} from '../backend/services/universityPilotService';
import { computeCollectiveRisk, CollectiveMusicEvent, EnvironmentalContext } from '../backend/intel/collectiveRiskSignals';

const program = new Command();

program
  .name('infinitysoul-agents')
  .description('InfinitySoul Agent CLI - Run agents and generate reports')
  .version('1.0.0');

// ============================================================================
// Regulator Guard Agent
// ============================================================================

program
  .command('regulator-scan')
  .description('Run NAIC compliance scan across all governance artifacts')
  .option('-p, --path <path>', 'Project root path', process.cwd())
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    console.log('🔍 Running NAIC compliance scan...\n');

    try {
      const result = await runRegulatorComplianceScan(options.path);

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      // Formatted output
      console.log(`Scan ID: ${result.scanId}`);
      console.log(`Overall Status: ${formatStatus(result.overallStatus)}`);
      console.log(`Scanned At: ${result.scannedAt.toISOString()}\n`);

      console.log(`Summary:`);
      console.log(`  ✅ Done: ${result.summary.done}`);
      console.log(`  🚧 In Progress: ${result.summary.inProgress}`);
      console.log(`  ⏳ To Do: ${result.summary.todo}`);
      console.log(`  🚨 P0 Violations: ${result.summary.p0Violations}\n`);

      if (result.summary.p0Violations > 0) {
        console.log('🚨 CRITICAL P0 VIOLATIONS (blockers for production):');
        const p0Items = result.items.filter(i => i.priority === 'P0' && i.status !== 'DONE');
        for (const item of p0Items) {
          console.log(`  [${item.nitpickId}] ${item.title}`);
          console.log(`     Status: ${item.status}`);
          console.log(`     Fix: ${item.concreteFix}\n`);
        }
      }

      console.log('\nRecommendations:');
      for (const rec of result.recommendations) {
        console.log(`  • ${rec}`);
      }

      process.exit(result.overallStatus === 'COMPLIANT' ? 0 : 1);
    } catch (error) {
      console.error('❌ Error running compliance scan:', error);
      process.exit(1);
    }
  });

// ============================================================================
// Campus Risk Summary (Campus Risk Officer Dashboard)
// ============================================================================

program
  .command('campus-risk <campusId>')
  .description('Generate campus risk summary for Risk Officer dashboard')
  .option('-w, --window <window>', 'Time window (7d, 30d, 90d, 1y)', '30d')
  .option('--json', 'Output as JSON')
  .action(async (campusId, options) => {
    console.log(`📊 Generating campus risk summary for ${campusId}...\n`);

    try {
      const summary = await getCampusRiskSummary(campusId, options.window);

      if (options.json) {
        console.log(JSON.stringify(summary, null, 2));
        return;
      }

      // Formatted output
      console.log(`Campus: ${campusId}`);
      console.log(`Time Window: ${summary.timeWindow}`);
      console.log(`Generated: ${summary.generatedAt.toISOString()}\n`);

      console.log(`Risk Overview:`);
      console.log(`  Total Events: ${summary.totalEvents}`);
      console.log(`  Trend: ${formatTrend(summary.trend)}\n`);

      console.log(`Events by Severity:`);
      for (const item of summary.eventsBySeverity) {
        console.log(`  ${item.severity}: ${item.count}`);
      }

      console.log(`\nTop Risk Categories:`);
      for (const cat of summary.topCategories.slice(0, 5)) {
        console.log(`  ${cat.category}: ${cat.count} events`);
      }

      console.log(`\nRecommendations:`);
      for (const rec of summary.recommendations) {
        console.log(`  • ${rec}`);
      }
    } catch (error) {
      console.error('❌ Error generating campus risk summary:', error);
      process.exit(1);
    }
  });

// ============================================================================
// Music Coach Agent (Wellness Coaching)
// ============================================================================

program
  .command('music-coach <studentId>')
  .description('Generate personalized wellness coaching plan')
  .option('--json', 'Output as JSON')
  .action(async (studentId, options) => {
    console.log(`🎵 Generating wellness coaching plan for student ${studentId}...\n`);

    try {
      const profile = await getStudentRiskProfile(studentId);

      if (!profile) {
        console.error(`❌ Student risk profile not found for ${studentId}`);
        process.exit(1);
      }

      if (!profile.consentValid) {
        console.error(`❌ Student has withdrawn consent`);
        process.exit(1);
      }

      const coachingPlan = await generateMusicCoachingPlan(profile);

      if (options.json) {
        console.log(JSON.stringify(coachingPlan, null, 2));
        return;
      }

      // Formatted output
      console.log(`Student: ${coachingPlan.studentId}`);
      console.log(`Campus: ${coachingPlan.campusId}`);
      console.log(`Overall Wellness Score: ${(coachingPlan.overallWellnessScore * 100).toFixed(0)}%\n`);

      console.log(`Strengths:`);
      for (const strength of coachingPlan.strengths) {
        console.log(`  ✨ ${strength}`);
      }

      console.log(`\nAreas for Growth:`);
      for (const area of coachingPlan.areasForGrowth) {
        console.log(`  🌱 ${area}`);
      }

      console.log(`\nActionable Suggestions:`);
      for (const sugg of coachingPlan.suggestions) {
        console.log(`\n  Category: ${sugg.category}`);
        console.log(`  Action: ${sugg.action}`);
        console.log(`  Why: ${sugg.why}`);
        console.log(`  Benefit: ${sugg.expectedBenefit}`);
        console.log(`  Timeline: ${sugg.timeline}`);
        if (sugg.resources) {
          console.log(`  Resources: ${sugg.resources}`);
        }
      }

      console.log(`\nNext Check-In: ${coachingPlan.nextCheckIn.toISOString()}`);
    } catch (error) {
      console.error('❌ Error generating coaching plan:', error);
      process.exit(1);
    }
  });

// ============================================================================
// Collective Risk Assessment (Social Unrest Prediction)
// ============================================================================

program
  .command('collective-risk <region>')
  .description('Assess collective social unrest risk from aggregate music trends')
  .option('--json', 'Output as JSON')
  .action(async (region, options) => {
    console.log(`🌍 Assessing collective risk for ${region}...\n`);

    try {
      // TODO: In production, fetch music events and environmental context from data sources
      // For now, use stub data

      console.log('⚠️  Note: This is a demo with stub data. Production requires Spotify API integration.');
      console.log('   Use POST /api/music/collective-risk with real data for accurate assessment.\n');

      const stubMusicEvents: CollectiveMusicEvent[] = [
        {
          region,
          timestamp: new Date(),
          topTracks: [],
          themeDistribution: {
            protest: 0.3,
            anger: 0.2,
            solidarity: 0.25,
            grief: 0.1,
            celebration: 0.05,
            escapism: 0.05,
            anxiety: 0.05,
          },
          avgValence: 0.4,
          avgEnergy: 0.7,
          avgTempo: 125,
          avgLoudness: -5,
          socialSharingVelocity: 5,
          playlistCreationRate: 10,
        },
      ];

      const stubEnvironmentalContext: EnvironmentalContext[] = [
        {
          region,
          timestamp: new Date(),
          temperature: 92,
          heatWaveActive: true,
          seasonalAnomaly: 10,
          unemploymentRate: 6.5,
          inflationRate: 3.2,
          gasPrices: 4.5,
          housingAffordability: 0.3,
          crimeRateTrend: 'stable',
        },
      ];

      const assessment = computeCollectiveRisk(stubMusicEvents, stubEnvironmentalContext);

      if (options.json) {
        console.log(JSON.stringify(assessment, null, 2));
        return;
      }

      // Formatted output
      console.log(`Region: ${assessment.region}`);
      console.log(`Assessed At: ${assessment.assessedAt.toISOString()}`);
      console.log(`Time Window: ${assessment.windowDays} days\n`);

      console.log(`Risk Scores:`);
      console.log(`  Social Unrest: ${(assessment.socialUnrestRisk * 100).toFixed(0)}%`);
      console.log(`  Civil Disturbance: ${(assessment.civilDisturbanceRisk * 100).toFixed(0)}%`);
      console.log(`  Protest Activity: ${(assessment.protestActivityRisk * 100).toFixed(0)}%`);
      console.log(`  Economic Stress: ${(assessment.economicStressRisk * 100).toFixed(0)}%`);
      console.log(`  Community Cohesion Risk: ${(assessment.communityCohesionRisk * 100).toFixed(0)}%\n`);

      console.log(`Overall Risk Band: ${formatRiskBand(assessment.overallRiskBand)}\n`);

      console.log(`Leading Indicators:`);
      for (const indicator of assessment.leadingIndicators) {
        console.log(`  ${indicator.indicator}: ${(indicator.value * 100).toFixed(0)}% (${formatTrend(indicator.trend)}) - ${(indicator.contribution * 100).toFixed(0)}% contribution`);
      }

      if (assessment.historicalAnalog) {
        console.log(`\nHistorical Analog:`);
        console.log(`  Event: ${assessment.historicalAnalog.event}`);
        console.log(`  Similarity: ${(assessment.historicalAnalog.similarity * 100).toFixed(0)}%`);
        if (assessment.historicalAnalog.leadTimeToEvent) {
          console.log(`  Lead Time: ${assessment.historicalAnalog.leadTimeToEvent} days before event`);
        }
      }

      console.log(`\nRecommendations:`);
      for (const rec of assessment.recommendations) {
        console.log(`\n  Stakeholder: ${rec.stakeholder}`);
        console.log(`  Action: ${rec.action}`);
        console.log(`  Rationale: ${rec.rationale}`);
      }

      console.log(`\nConfidence: ${(assessment.confidenceLevel * 100).toFixed(0)}%`);
    } catch (error) {
      console.error('❌ Error assessing collective risk:', error);
      process.exit(1);
    }
  });

// ============================================================================
// Insurer Report (Actuarial Metrics)
// ============================================================================

program
  .command('insurer-report <campusId>')
  .description('Generate insurer actuarial report')
  .option('-s, --start <date>', 'Start date (ISO format)')
  .option('-e, --end <date>', 'End date (ISO format)')
  .option('--json', 'Output as JSON')
  .action(async (campusId, options) => {
    console.log(`💼 Generating insurer report for ${campusId}...\n`);

    try {
      const startDate = options.start ? new Date(options.start) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
      const endDate = options.end ? new Date(options.end) : new Date();

      const report = await generateInsurerReport(campusId, { start: startDate, end: endDate });

      if (options.json) {
        console.log(JSON.stringify(report, null, 2));
        return;
      }

      // Formatted output
      console.log(`Campus: ${report.campusName} (${report.campusId})`);
      console.log(`Period: ${report.dateRange.start.toISOString().split('T')[0]} to ${report.dateRange.end.toISOString().split('T')[0]}\n`);

      console.log(`Risk Assessment:`);
      console.log(`  Overall Risk Score: ${(report.overallRiskScore * 100).toFixed(0)}%`);
      console.log(`  Risk Band: ${formatRiskBand(report.riskBand)}`);
      console.log(`  Total Events: ${report.totalEvents}`);
      console.log(`  Estimated Loss: $${report.lossEstimate.toLocaleString()}`);
      console.log(`  Risk Pool Eligibility: ${report.riskPoolEligibility}\n`);

      if (report.studentPilotImpact) {
        console.log(`Student Wellness Pilot Impact:`);
        console.log(`  Total Students: ${report.studentPilotImpact.totalStudents}`);
        console.log(`  Improved: ${report.studentPilotImpact.improved.count} (${report.studentPilotImpact.improved.percentage.toFixed(1)}%)`);
        console.log(`  Stable: ${report.studentPilotImpact.stable.count} (${report.studentPilotImpact.stable.percentage.toFixed(1)}%)`);
        console.log(`  Declined: ${report.studentPilotImpact.declined.count} (${report.studentPilotImpact.declined.percentage.toFixed(1)}%)\n`);
      }

      console.log(`Recommendations:`);
      for (const rec of report.recommendations) {
        console.log(`  • ${rec}`);
      }
    } catch (error) {
      console.error('❌ Error generating insurer report:', error);
      process.exit(1);
    }
  });

// ============================================================================
// Regulator Briefing (NAIC Compliance)
// ============================================================================

program
  .command('regulator-brief <campusId>')
  .description('Generate regulator compliance briefing')
  .option('--json', 'Output as JSON')
  .action(async (campusId, options) => {
    console.log(`🏛️  Generating regulator briefing for ${campusId}...\n`);

    try {
      const briefing = await generateRegulatorBriefing(campusId);

      if (options.json) {
        console.log(JSON.stringify(briefing, null, 2));
        return;
      }

      // Formatted output
      console.log(`Campus: ${briefing.campusName} (${briefing.campusId})`);
      console.log(`Generated: ${briefing.generatedAt.toISOString()}\n`);

      console.log(`NAIC AI Principles Compliance:`);
      console.log(`  Fairness: ${formatCheck(briefing.naicCompliance.fairness)}`);
      console.log(`  Accountability: ${formatCheck(briefing.naicCompliance.accountability)}`);
      console.log(`  Transparency: ${formatCheck(briefing.naicCompliance.transparency)}`);
      console.log(`  Privacy: ${formatCheck(briefing.naicCompliance.privacy)}`);
      console.log(`  Safety: ${formatCheck(briefing.naicCompliance.safety)}`);
      console.log(`  Human-Centric: ${formatCheck(briefing.naicCompliance.humanCentric)}\n`);

      if (briefing.fairnessMetrics) {
        console.log(`Fairness Metrics:`);
        console.log(`  Disparate Impact Ratio:`);
        console.log(`    Race: ${briefing.fairnessMetrics.disparateImpactRatio.race.toFixed(2)} (threshold: 0.80-1.25)`);
        console.log(`    Age: ${briefing.fairnessMetrics.disparateImpactRatio.age.toFixed(2)}`);
        console.log(`    SES Proxy: ${briefing.fairnessMetrics.disparateImpactRatio.sesProxy.toFixed(2)}`);
        console.log(`  Equalized Odds: ${formatCheck(briefing.fairnessMetrics.equalizedOdds)}`);
        console.log(`  Calibration: ${formatCheck(briefing.fairnessMetrics.calibration)}`);
        console.log(`  Performance Parity: ${formatCheck(briefing.fairnessMetrics.performanceParity)}\n`);
      }

      console.log(`Model Governance:`);
      console.log(`  Governance Board Active: ${formatCheck(briefing.modelGovernance.governanceBoardActive)}`);
      console.log(`  Model Owner Designated: ${formatCheck(briefing.modelGovernance.modelOwnerDesignated)}`);
      console.log(`  Quarterly Fairness Audits: ${formatCheck(briefing.modelGovernance.quarterlyFairnessAudits)}`);
      console.log(`  Human-in-the-Loop Required: ${formatCheck(briefing.modelGovernance.humanInTheLoopRequired)}`);
      console.log(`  Actuarial Validation: ${briefing.modelGovernance.actuarialValidation}`);
      console.log(`  Regulator Approval: ${briefing.modelGovernance.regulatorApproval}\n`);

      console.log(`Student Participation:`);
      console.log(`  Total Enrolled: ${briefing.studentParticipation.totalEnrolled}`);
      console.log(`  Opt-In Rate: ${(briefing.studentParticipation.optInRate * 100).toFixed(1)}%`);
      console.log(`  Consent Withdrawals: ${briefing.studentParticipation.consentWithdrawals}`);
      console.log(`  Data Retention Compliance: ${formatCheck(briefing.studentParticipation.dataRetentionCompliance)}\n`);

      console.log(`Recommendations:`);
      for (const rec of briefing.recommendations) {
        console.log(`  [${rec.status}] ${rec.area}: ${rec.action}`);
      }
    } catch (error) {
      console.error('❌ Error generating regulator briefing:', error);
      process.exit(1);
    }
  });

// ============================================================================
// Helper Functions
// ============================================================================

function formatStatus(status: string): string {
  switch (status) {
    case 'COMPLIANT': return '✅ COMPLIANT';
    case 'WARNINGS': return '⚠️  WARNINGS';
    case 'VIOLATIONS': return '🚨 VIOLATIONS';
    default: return status;
  }
}

function formatTrend(trend: string): string {
  switch (trend) {
    case 'increasing': return '📈 Increasing';
    case 'decreasing': return '📉 Decreasing';
    case 'stable': return '➡️  Stable';
    default: return trend;
  }
}

function formatRiskBand(band: string): string {
  switch (band) {
    case 'low': return '🟢 Low';
    case 'moderate': return '🟡 Moderate';
    case 'elevated': return '🟠 Elevated';
    case 'high': return '🔴 High';
    case 'critical': return '🚨 Critical';
    default: return band;
  }
}

function formatCheck(value: boolean): string {
  return value ? '✅ Pass' : '❌ Fail';
}

program.parse();
