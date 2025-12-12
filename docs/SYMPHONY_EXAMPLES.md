/**
 * Infinity Soul Symphony - Usage Examples
 * 
 * Shows how to use individual agents programmatically
 */

// Example 1: Using ScoutAgent to find distressed MGAs
console.log('═'.repeat(60));
console.log('EXAMPLE 1: ScoutAgent - Finding Distressed MGAs');
console.log('═'.repeat(60));

const scoutExample = `
import { ScoutAgent } from './backend/agents/symphony/ScoutAgent';

async function findDistressedMGAs() {
  const scout = new ScoutAgent();
  
  // Scan for distressed MGAs
  const targets = await scout.scanTargets();
  console.log(\`Found \${targets.length} distressed MGAs\`);
  
  // Make offers to top 3
  const offers = await scout.makeOffers(3);
  console.log(\`Sent \${offers.length} offers\`);
  
  // Generate report
  const report = await scout.generateReport();
  console.log(report.summary);
}
`;
console.log(scoutExample);

// Example 2: Using UnderwritingAgent for instant quotes
console.log('═'.repeat(60));
console.log('EXAMPLE 2: UnderwritingAgent - 30-Second Quotes');
console.log('═'.repeat(60));

const underwritingExample = `
import { UnderwritingAgent } from './backend/agents/symphony/UnderwritingAgent';

async function quotePolicy() {
  const underwriter = new UnderwritingAgent();
  
  const submission = {
    id: 'sub-001',
    company: 'Acme Corp',
    revenue: 5_000_000,
    employees: 25,
    industry: 'healthcare',
    techStack: ['wordpress', 'php', 'mysql'],
    hasSecurityTeam: false,
    hasCyberInsurance: false
  };
  
  // Get quote in 30 seconds
  const quote = await underwriter.quote(submission);
  console.log(\`Premium: $\${quote.premium.toLocaleString()}/year\`);
  console.log(\`Loss Probability: \${(quote.lossProbability * 100).toFixed(1)}%\`);
  console.log(\`Risk Factors: \${quote.riskFactors.join(', ')}\`);
}
`;
console.log(underwritingExample);

// Example 3: Using BiometricAgent for optimization
console.log('═'.repeat(60));
console.log('EXAMPLE 3: BiometricAgent - HRV/T/Sleep Optimization');
console.log('═'.repeat(60));

const biometricExample = `
import { BiometricAgent } from './backend/agents/symphony/BiometricAgent';

async function optimizeBiometrics() {
  const biometric = new BiometricAgent();
  
  // Log current data
  await biometric.logData({
    hrv: 65,
    testosterone: 750,
    sleepLatency: 12,
    timestamp: new Date()
  });
  
  // Get optimization recommendations
  const optimization = await biometric.optimize();
  
  console.log('Recommendations:');
  optimization.recommendations.forEach(rec => {
    console.log(\`  - \${rec}\`);
  });
  
  if (optimization.adjustments.diet) {
    console.log(\`Diet: \${optimization.adjustments.diet}\`);
  }
  if (optimization.adjustments.supplements) {
    console.log(\`Supplements: \${optimization.adjustments.supplements}\`);
  }
}
`;
console.log(biometricExample);

// Example 4: Using DealAgent to surface opportunities
console.log('═'.repeat(60));
console.log('EXAMPLE 4: DealAgent - High-Value Opportunities');
console.log('═'.repeat(60));

const dealExample = `
import { DealAgent } from './backend/agents/symphony/DealAgent';

async function findDeals() {
  const deals = new DealAgent();
  
  // Scan for opportunities
  await deals.scan();
  
  // Surface top opportunity
  const topDeal = await deals.surfaceTopDeal();
  
  if (topDeal) {
    console.log(\`Top Deal: \${topDeal.description}\`);
    console.log(\`Value: $\${topDeal.value.toLocaleString()}\`);
    console.log(\`Priority: \${topDeal.priority}/10\`);
    
    // Make decision in 1 second
    deals.updateDealStatus(topDeal.id, 'pursued');
  }
}
`;
console.log(dealExample);

// Example 5: Using GovernanceAgent for House Committee
console.log('═'.repeat(60));
console.log('EXAMPLE 5: GovernanceAgent - House Committee Voting');
console.log('═'.repeat(60));

const governanceExample = `
import { GovernanceAgent } from './backend/agents/symphony/GovernanceAgent';

async function runVote() {
  const governance = new GovernanceAgent();
  
  // Create proposal
  const proposal = await governance.createProposal(
    'acquire_asset',
    'Acquire CyberShield MGA for $3M',
    'Distressed MGA with strong customer base. Combined ratio 118%. We can turn it profitable in 90 days.'
  );
  
  // Cast votes from House Committee
  await governance.castVote(proposal.id, 'Partner', 'yes');
  await governance.castVote(proposal.id, 'Mentor (Billionaire)', 'yes');
  await governance.castVote(proposal.id, 'Peer (Founder $50M+)', 'yes');
  await governance.castVote(proposal.id, 'Advisor (Tech)', 'yes');
  await governance.castVote(proposal.id, 'You', 'yes');
  
  // Close voting after 72 hours
  await governance.closeVoting(proposal.id);
  
  // Check if passed
  const result = await governance.tallyVotes(proposal.id);
  if (result.passed) {
    console.log('✅ Proposal PASSED - Execute in 24 hours');
  } else {
    console.log('❌ Proposal REJECTED');
  }
}
`;
console.log(governanceExample);

// Example 6: Using the Orchestrator for daily loop
console.log('═'.repeat(60));
console.log('EXAMPLE 6: SymphonyOrchestrator - Daily Loop');
console.log('═'.repeat(60));

const orchestratorExample = `
import { SymphonyOrchestrator } from './backend/agents/symphony/SymphonyOrchestrator';

async function runDailyLoop() {
  const symphony = new SymphonyOrchestrator();
  
  // Morning routine (4:00-6:00 AM)
  await symphony.startDay();
  
  // Approve MGA offers
  await symphony.approveScoutOffers(5);
  
  // Check and optimize biometrics
  await symphony.checkBiometrics(80);
  
  // Deep work (4 hours, blocked except DealAgent)
  await symphony.deepWork(4, true);
  
  // Syndicate content
  await symphony.syndicateCognition();
  
  // House Committee voting
  await symphony.houseCommitteeVote();
  
  // Rebalance portfolio
  await symphony.rebalancePortfolio(10);
  
  // End of day report
  const report = await symphony.endDay();
  
  console.log(\`Status: \${report.status}\`);
  console.log(\`Net Worth: $\${report.personal.netWorth.toLocaleString()}\`);
}
`;
console.log(orchestratorExample);

console.log('═'.repeat(60));
console.log('\nFor full implementation details, see:');
console.log('  - SYMPHONY_README.md');
console.log('  - docs/INFINITY_SOUL_SYMPHONY.md');
console.log('  - backend/agents/symphony/\n');
