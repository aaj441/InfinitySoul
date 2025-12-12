#!/usr/bin/env node
/**
 * Infinity Soul Symphony - CLI
 * 
 * Command-line interface for the complete billionaire system.
 * 
 * Usage:
 *   ./infinity_soul start_day
 *   ./infinity_soul approve_scout_offers --count 5
 *   ./infinity_soul check_biometrics --threshold 80
 *   ./infinity_soul deep_work --duration 4 --block_all
 *   ./infinity_soul syndicate_cognition
 *   ./infinity_soul house_committee_vote
 *   ./infinity_soul rebalance_portfolio --cut_threshold 10
 *   ./infinity_soul end_day
 */

import { Command } from 'commander';
import { SymphonyOrchestrator } from '../backend/agents/symphony/SymphonyOrchestrator';

const program = new Command();
const orchestrator = new SymphonyOrchestrator();

program
  .name('infinity_soul')
  .description('Infinity Soul Symphony - Complete Billionaire System')
  .version('1.0.0');

// ============================================================================
// START DAY
// ============================================================================

program
  .command('start_day')
  .description('Execute morning routine: biometric check, scout scan, learning summary')
  .action(async () => {
    try {
      await orchestrator.startDay();
      process.exit(0);
    } catch (error) {
      console.error('❌ Error starting day:', error);
      process.exit(1);
    }
  });

// ============================================================================
// APPROVE SCOUT OFFERS
// ============================================================================

program
  .command('approve_scout_offers')
  .description('Approve MGA acquisition offers')
  .option('-c, --count <number>', 'Number of offers to send', '5')
  .action(async (options) => {
    try {
      const count = parseInt(options.count);
      await orchestrator.approveScoutOffers(count);
      process.exit(0);
    } catch (error) {
      console.error('❌ Error approving offers:', error);
      process.exit(1);
    }
  });

// ============================================================================
// CHECK BIOMETRICS
// ============================================================================

program
  .command('check_biometrics')
  .description('Check biometrics and generate optimization plan')
  .option('-t, --threshold <number>', 'HRV threshold', '80')
  .action(async (options) => {
    try {
      const threshold = parseInt(options.threshold);
      await orchestrator.checkBiometrics(threshold);
      process.exit(0);
    } catch (error) {
      console.error('❌ Error checking biometrics:', error);
      process.exit(1);
    }
  });

// ============================================================================
// DEEP WORK
// ============================================================================

program
  .command('deep_work')
  .description('Enter deep work mode')
  .option('-d, --duration <number>', 'Duration in hours', '4')
  .option('--block_all', 'Block all notifications except DealAgent', false)
  .action(async (options) => {
    try {
      const duration = parseFloat(options.duration);
      await orchestrator.deepWork(duration, options.block_all);
      process.exit(0);
    } catch (error) {
      console.error('❌ Error entering deep work:', error);
      process.exit(1);
    }
  });

// ============================================================================
// SYNDICATE COGNITION
// ============================================================================

program
  .command('syndicate_cognition')
  .description('Syndicate content across platforms')
  .option('-c, --content <text>', 'Content to syndicate')
  .action(async (options) => {
    try {
      await orchestrator.syndicateCognition(options.content);
      process.exit(0);
    } catch (error) {
      console.error('❌ Error syndicating content:', error);
      process.exit(1);
    }
  });

// ============================================================================
// HOUSE COMMITTEE VOTE
// ============================================================================

program
  .command('house_committee_vote')
  .description('Check House Committee proposals and voting status')
  .action(async () => {
    try {
      await orchestrator.houseCommitteeVote();
      process.exit(0);
    } catch (error) {
      console.error('❌ Error checking votes:', error);
      process.exit(1);
    }
  });

// ============================================================================
// REBALANCE PORTFOLIO
// ============================================================================

program
  .command('rebalance_portfolio')
  .description('Rebalance portfolio, cut underperforming assets')
  .option('-t, --cut_threshold <number>', '10x threshold for keeping assets', '10')
  .action(async (options) => {
    try {
      const threshold = parseFloat(options.cut_threshold);
      await orchestrator.rebalancePortfolio(threshold);
      process.exit(0);
    } catch (error) {
      console.error('❌ Error rebalancing portfolio:', error);
      process.exit(1);
    }
  });

// ============================================================================
// END DAY
// ============================================================================

program
  .command('end_day')
  .description('Generate end-of-day report with all metrics')
  .action(async () => {
    try {
      await orchestrator.endDay();
      process.exit(0);
    } catch (error) {
      console.error('❌ Error ending day:', error);
      process.exit(1);
    }
  });

// ============================================================================
// AGENT COMMANDS (Individual access)
// ============================================================================

program
  .command('agent:scout')
  .description('Run ScoutAgent to find distressed MGAs')
  .action(async () => {
    try {
      const agent = orchestrator.getScoutAgent();
      await agent.scanTargets();
      const report = await agent.generateReport();
      console.log(JSON.stringify(report, null, 2));
      process.exit(0);
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  });

program
  .command('agent:deals')
  .description('Run DealAgent to surface top opportunity')
  .action(async () => {
    try {
      const agent = orchestrator.getDealAgent();
      await agent.surfaceTopDeal();
      process.exit(0);
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  });

program
  .command('agent:learning')
  .description('Run LearningAgent to ingest papers')
  .option('-c, --count <number>', 'Number of papers to ingest', '10')
  .action(async (options) => {
    try {
      const count = parseInt(options.count);
      const agent = orchestrator.getLearningAgent();
      await agent.ingest(count);
      process.exit(0);
    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  });

// ============================================================================
// DEMO COMMAND
// ============================================================================

program
  .command('demo')
  .description('Run full daily demo sequence')
  .action(async () => {
    try {
      console.log('\n🎭 INFINITY SOUL SYMPHONY - FULL DAILY DEMO\n');
      
      await orchestrator.startDay();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await orchestrator.approveScoutOffers(3);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await orchestrator.checkBiometrics(80);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await orchestrator.syndicateCognition();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await orchestrator.endDay();
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Error running demo:', error);
      process.exit(1);
    }
  });

// Parse commands
program.parse(process.argv);

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
