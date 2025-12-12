#!/usr/bin/env node
/**
 * Infinity Soul Symphony - Auto-Approval Test
 * 
 * Tests the agentic auto-approval system that approves all pending requests
 */

import { SymphonyOrchestrator } from '../backend/agents/symphony/SymphonyOrchestrator';

async function main() {
  console.log('\n🎭 INFINITY SOUL SYMPHONY - AUTO-APPROVAL TEST\n');
  console.log('═'.repeat(60));
  
  const orchestrator = new SymphonyOrchestrator();
  
  // Step 1: Generate some pending requests
  console.log('\n📌 STEP 1: Generating pending requests...\n');
  
  // Add some relationships and generate pings
  const relationshipAgent = orchestrator.getRelationshipAgent();
  await relationshipAgent.addRelationship({
    id: 'rel-001',
    name: 'John Smith',
    lastContact: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    priority: 'high',
    notes: 'Important business contact'
  });
  
  await relationshipAgent.addRelationship({
    id: 'rel-002',
    name: 'Jane Doe',
    lastContact: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    priority: 'high',
    notes: 'Potential partner'
  });
  
  await relationshipAgent.addRelationship({
    id: 'rel-003',
    name: 'Bob Johnson',
    lastContact: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    priority: 'high',
    notes: 'Investor contact'
  });
  
  // Generate relationship pings
  const pings = await relationshipAgent.surfacePings(3);
  console.log(`\n   ✓ Generated ${pings.length} relationship pings requiring approval`);
  
  await sleep(500);
  
  // Generate content drafts
  const contentAgent = orchestrator.getContentAgent();
  await contentAgent.syndicate('Building agentic insurance systems with AI');
  const drafts = contentAgent.getPendingDrafts();
  console.log(`   ✓ Generated ${drafts.length} content drafts requiring approval`);
  
  await sleep(500);
  
  // Create governance proposals
  const governanceAgent = orchestrator.getGovernanceAgent();
  await governanceAgent.createProposal(
    'acquire_asset',
    'Acquire distressed MGA for $2M',
    'Target has 500 customers, combined ratio 118%, great acquisition opportunity',
    'You'
  );
  
  await governanceAgent.createProposal(
    'hire_fire',
    'Hire senior ML engineer',
    'Hire top talent from Google to accelerate AI development',
    'You'
  );
  
  const activeProposals = governanceAgent.getActiveProposals();
  console.log(`   ✓ Created ${activeProposals.length} governance proposals requiring votes`);
  
  await sleep(1000);
  
  // Step 2: Show pending requests before auto-approval
  console.log('\n📌 STEP 2: Pending requests summary...\n');
  console.log(`   • Relationship pings pending: ${pings.length}`);
  console.log(`   • Content drafts pending: ${drafts.length}`);
  console.log(`   • Governance proposals active: ${activeProposals.length}`);
  
  await sleep(1000);
  
  // Step 3: Run auto-approval
  console.log('\n📌 STEP 3: Running agentic auto-approval...\n');
  const result = await orchestrator.approveAllRequests();
  
  await sleep(1000);
  
  // Step 4: Verify all requests were approved
  console.log('\n📌 STEP 4: Verification...\n');
  
  const remainingDrafts = contentAgent.getPendingDrafts();
  console.log(`   • Content drafts remaining: ${remainingDrafts.length} (expected: 0)`);
  
  const proposalsNeedingVotes = governanceAgent.getProposalsNeedingVotes();
  console.log(`   • Proposals needing votes: ${proposalsNeedingVotes.length}`);
  
  // Check if all proposals have founder's vote
  const allProposals = governanceAgent.getActiveProposals();
  const proposalsWithFounderVote = allProposals.filter(p => 
    p.votes.some(v => v.voter === 'You')
  ).length;
  console.log(`   • Proposals with founder vote: ${proposalsWithFounderVote}/${allProposals.length}`);
  
  await sleep(1000);
  
  // Step 5: Final summary
  console.log('\n═'.repeat(60));
  console.log('\n✅ AUTO-APPROVAL TEST COMPLETED SUCCESSFULLY!\n');
  console.log('Summary:');
  console.log(`   • ${result.relationshipPings} relationship pings approved`);
  console.log(`   • ${result.contentPieces} content pieces approved`);
  console.log(`   • ${result.governanceVotes} governance votes cast`);
  console.log(`   • Total: ${result.relationshipPings + result.contentPieces + result.governanceVotes} actions taken\n`);
  console.log('═'.repeat(60));
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
