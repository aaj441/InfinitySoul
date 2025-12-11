/**
 * Cyber Audit Example
 * Demonstrates how to use the cyber audit system
 */

import { runCyberAudit, generateFollowUpEmail } from '../backend/services/cyberAudit';

async function example() {
  console.log('='.repeat(70));
  console.log('Cyber Audit System - Example Usage');
  console.log('='.repeat(70));
  console.log();

  // Example 1: Run a basic audit
  console.log('Example 1: Running cyber audit for a domain');
  console.log('-'.repeat(70));
  
  const audit1 = await runCyberAudit({
    domain: 'example.com',
    businessName: 'Example Corporation',
    email: 'owner@example.com'
  });
  
  if (audit1.status === 'success' && audit1.result) {
    console.log(`✓ Audit completed successfully`);
    console.log(`  Audit ID: ${audit1.auditId}`);
    console.log(`  Domain: ${audit1.result.domain}`);
    console.log(`  Score: ${audit1.result.score}/100`);
    console.log(`  Risk Level: ${audit1.result.risk_level}`);
    console.log(`  Issues Found: ${audit1.result.issues.length}`);
    console.log(`  Recommendations: ${audit1.result.recommendations.length}`);
    console.log();
    
    // Example 2: Generate follow-up email
    console.log('Example 2: Generating sales follow-up email');
    console.log('-'.repeat(70));
    
    const followUpEmail = generateFollowUpEmail(
      audit1.result,
      'Example Corporation',
      'John Smith'
    );
    
    console.log('Generated email:');
    console.log(followUpEmail);
    console.log();
  } else {
    console.error(`✗ Audit failed: ${audit1.error}`);
  }

  // Example 3: Batch audits for multiple domains
  console.log('Example 3: Batch audit for multiple domains');
  console.log('-'.repeat(70));
  
  const domains = [
    { domain: 'business1.com', name: 'Business 1' },
    { domain: 'business2.com', name: 'Business 2' },
    { domain: 'business3.com', name: 'Business 3' }
  ];
  
  console.log('Running audits in parallel...');
  
  const batchResults = await Promise.all(
    domains.map(({ domain, name }) => 
      runCyberAudit({ domain, businessName: name })
    )
  );
  
  console.log('\nBatch Results Summary:');
  batchResults.forEach((result, idx) => {
    const domain = domains[idx];
    if (result.status === 'success' && result.result) {
      console.log(`  ${domain.name}: Score ${result.result.score}/100 (${result.result.risk_level})`);
    } else {
      console.log(`  ${domain.name}: Failed - ${result.error}`);
    }
  });
  console.log();

  // Example 4: Risk-based workflow
  console.log('Example 4: Risk-based workflow decisions');
  console.log('-'.repeat(70));
  
  for (const result of batchResults) {
    if (result.status === 'success' && result.result) {
      const { domain, score, risk_level } = result.result;
      
      console.log(`\n${domain}:`);
      
      switch (risk_level) {
        case 'LOW':
          console.log('  → Action: Send insurance quote immediately');
          console.log('  → Estimated annual premium: $500-800');
          break;
        case 'MEDIUM':
          console.log('  → Action: Schedule remediation call');
          console.log('  → Estimated premium after fixes: $800-1200');
          break;
        case 'HIGH':
          console.log('  → Action: Urgent remediation required');
          console.log('  → Cannot quote until fixes applied');
          break;
        case 'CRITICAL':
          console.log('  → Action: Emergency security intervention');
          console.log('  → Major vulnerabilities detected');
          break;
      }
    }
  }
  console.log();

  // Example 5: Extract key metrics
  console.log('Example 5: Analytics from audit results');
  console.log('-'.repeat(70));
  
  const successfulAudits = batchResults.filter(r => r.status === 'success');
  const avgScore = successfulAudits.reduce((sum, r) => 
    sum + (r.result?.score || 0), 0
  ) / successfulAudits.length;
  
  const riskDistribution = successfulAudits.reduce((acc, r) => {
    const level = r.result?.risk_level || 'UNKNOWN';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('Analytics Summary:');
  console.log(`  Total Audits: ${batchResults.length}`);
  console.log(`  Successful: ${successfulAudits.length}`);
  console.log(`  Average Score: ${avgScore.toFixed(1)}/100`);
  console.log('  Risk Distribution:');
  Object.entries(riskDistribution).forEach(([level, count]) => {
    console.log(`    ${level}: ${count}`);
  });
  console.log();

  console.log('='.repeat(70));
  console.log('Example complete!');
  console.log('='.repeat(70));
}

// Run example if executed directly
if (require.main === module) {
  example().catch(console.error);
}

export default example;
