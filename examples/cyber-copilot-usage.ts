/**
 * Example: Using InfinitySoul Cyber Copilot
 * 
 * This example shows how to process a healthcare lead through the
 * complete cyber insurance pipeline.
 */

import { InfinitySoulCore } from '../backend/orchestration/core';
import * as path from 'path';

// Configuration
const config = {
  carrier_matrix_path: path.join(process.cwd(), 'config/carrier_matrix.json'),
  contexts_dir: path.join(process.cwd(), 'contexts'),
  min_revenue_threshold: 100000,
};

// Initialize the core system
const infinitySoul = new InfinitySoulCore(config);

async function processHealthcareLead() {
  console.log('🏥 Processing Healthcare Lead Example\n');
  console.log('='.repeat(60));

  // Sample healthcare lead data
  const leadData = {
    company_name: "Dr. Smith Family Practice",
    industry: "healthcare",
    revenue: 2_000_000,
    employee_count: 15,
    patient_records: 8000,
    hipaa_compliant: true,
    has_mfa: true,
    has_edr: false,  // Vulnerability!
    ehr_system: "Epic",
    backup_frequency: "daily" as const,
    prior_claims: 0,
    prior_breaches: false,
  };

  console.log('\n📋 Lead Information:');
  console.log('Company:', leadData.company_name);
  console.log('Industry:', leadData.industry);
  console.log('Revenue:', `$${leadData.revenue.toLocaleString()}`);
  console.log('Employees:', leadData.employee_count);
  console.log('Patient Records:', leadData.patient_records.toLocaleString());
  console.log('HIPAA Compliant:', leadData.hipaa_compliant ? 'Yes' : 'No');
  console.log('MFA Enabled:', leadData.has_mfa ? 'Yes' : 'No');
  console.log('EDR Software:', leadData.has_edr ? 'Yes' : 'No ⚠️');

  console.log('\n🔄 Running Cyber Copilot Pipeline...\n');

  try {
    // Run the complete pipeline
    const result = await infinitySoul.cyberCopilot({
      lead_data: leadData,
    });

    // Check if qualified
    if (result.status === 'unqualified') {
      console.log('❌ Lead Unqualified');
      console.log('Reason:', result.reason);
      return;
    }

    if (result.status === 'error') {
      console.log('❌ Error:', result.error);
      return;
    }

    // Display results
    console.log('✅ Lead Qualified!\n');

    console.log('🎯 Detected Niche:', result.niche);
    console.log('');

    // Risk Assessment
    console.log('📊 Risk Assessment:');
    console.log('-'.repeat(60));
    const risk = result.risk_report;
    console.log('Loss Probability:', `${(risk.loss_probability * 100).toFixed(1)}%`);
    console.log('Estimated Premium:', `$${risk.estimated_premium.toLocaleString()}/year`);
    console.log('');

    // Coverage Map
    console.log('🛡️ Recommended Coverage:');
    console.log('-'.repeat(60));
    console.log('Limits:', result.coverage_map.recommended_limits);
    console.log('Coverages:');
    result.coverage_map.coverages.forEach((coverage: string, idx: number) => {
      console.log(`  ${idx + 1}. ${coverage}`);
    });
    console.log('');

    // Carriers
    console.log('🏢 Recommended Carriers:');
    console.log('-'.repeat(60));
    result.recommended_carriers.forEach((carrier: any, idx: number) => {
      console.log(`  ${idx + 1}. ${carrier.carrier_name} (Score: ${carrier.weight})`);
      console.log(`     Contact: ${carrier.contact_info}`);
    });
    console.log('');

    // Discovery Script Preview
    console.log('📞 Discovery Script Preview:');
    console.log('-'.repeat(60));
    const scriptLines = result.discovery_script.split('\n').slice(0, 15);
    scriptLines.forEach((line: string) => console.log(line));
    console.log('...');
    console.log('');

    // Outreach Sequence
    console.log('📧 Email Outreach Sequence:');
    console.log('-'.repeat(60));
    result.outreach_sequence.emails.forEach((email: any, idx: number) => {
      console.log(`\nEmail ${idx + 1} (Day ${email.dayOffset}): ${email.type.toUpperCase()}`);
      console.log(`Subject: ${email.subject}`);
      console.log('Preview:', email.body.substring(0, 100) + '...');
    });
    console.log('');

    console.log('📅 Cadence:');
    result.outreach_sequence.cadence.forEach((step: string) => {
      console.log(`  • ${step}`);
    });
    console.log('');

    // Next Steps
    console.log('🎯 Next Steps:');
    console.log('-'.repeat(60));
    console.log('1. Send Email 1 (Initial Outreach) immediately');
    console.log('2. Schedule discovery call using script');
    console.log('3. Prepare quote from top 3 carriers');
    console.log('4. Set up follow-up sequence');
    console.log('');

    console.log('=' . repeat(60));
    console.log('✨ Pipeline Complete!\n');

  } catch (error) {
    console.error('❌ Error processing lead:', error);
  }
}

async function demonstrateNicheSwitching() {
  console.log('\n🔄 Demonstrating Niche Switching\n');
  console.log('='.repeat(60));

  const niches = ['generic', 'healthcare', 'law_firm', 'nonprofit'];

  for (const niche of niches) {
    console.log(`\n📂 Niche: ${niche.toUpperCase()}`);
    
    // Get intake questions
    const questions = infinitySoul.getIntakeQuestions(niche);
    console.log(`Questions: ${questions.length}`);
    console.log('Sample:', questions[0].text);

    // Get context
    const context = infinitySoul.getCurrentContext();
    console.log('Coverage Priorities:');
    context.coverage_priorities.slice(0, 3).forEach((cov: string) => {
      console.log(`  • ${cov}`);
    });
  }

  console.log('');
}

async function demonstrateQuickAssessment() {
  console.log('\n⚡ Quick Risk Assessment Example\n');
  console.log('='.repeat(60));

  const clientProfile = {
    revenue: 500_000,
    employee_count: 8,
    has_mfa: false,
    has_edr: false,
    backup_frequency: 'monthly' as const,
    prior_claims: 2,
  };

  console.log('Client Profile:');
  console.log('Revenue:', `$${clientProfile.revenue.toLocaleString()}`);
  console.log('Employees:', clientProfile.employee_count);
  console.log('MFA:', clientProfile.has_mfa ? 'Yes' : 'No ⚠️');
  console.log('EDR:', clientProfile.has_edr ? 'Yes' : 'No ⚠️');
  console.log('Backup:', clientProfile.backup_frequency);
  console.log('Prior Claims:', clientProfile.prior_claims);

  const result = await infinitySoul.quickRiskAssessment(clientProfile, 'generic');

  console.log('\nRisk Assessment:');
  console.log('Loss Probability:', `${(result.risk_report.loss_probability * 100).toFixed(1)}%`);
  console.log('Estimated Premium:', `$${result.risk_report.estimated_premium.toLocaleString()}`);
  console.log('Recommended Limit:', result.coverage_map.recommended_limits);
  console.log('');
}

// Run all examples
async function main() {
  console.log('InfinitySoul Cyber Copilot - Usage Examples\n');
  
  await processHealthcareLead();
  await demonstrateQuickAssessment();
  await demonstrateNicheSwitching();

  console.log('✨ All examples completed!\n');
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

export { processHealthcareLead, demonstrateQuickAssessment, demonstrateNicheSwitching };
