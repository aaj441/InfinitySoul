#!/usr/bin/env node
/**
 * Test script for Cyber Copilot API endpoints
 * Run with: node test-cyber-copilot.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:8000';

async function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Cyber Copilot API Endpoints\n');
  console.log('=' . repeat(50));

  try {
    // Test 1: Health check
    console.log('\n📡 Test 1: Health Check');
    console.log('GET /api/cyber-copilot/health');
    const health = await makeRequest('GET', '/api/cyber-copilot/health');
    console.log('Status:', health.status);
    console.log('Response:', JSON.stringify(health.data, null, 2));
    console.log(health.status === 200 ? '✅ PASS' : '❌ FAIL');

    // Test 2: Get intake questions
    console.log('\n📝 Test 2: Get Intake Questions (Healthcare)');
    console.log('GET /api/cyber-copilot/intake-questions/healthcare');
    const questions = await makeRequest('GET', '/api/cyber-copilot/intake-questions/healthcare');
    console.log('Status:', questions.status);
    console.log('Questions count:', questions.data.questions?.length || 0);
    console.log('Sample question:', questions.data.questions?.[0]?.text || 'N/A');
    console.log(questions.status === 200 && questions.data.questions?.length > 0 ? '✅ PASS' : '❌ FAIL');

    // Test 3: Get context
    console.log('\n🎯 Test 3: Get Context (Law Firm)');
    console.log('GET /api/cyber-copilot/context/law_firm');
    const context = await makeRequest('GET', '/api/cyber-copilot/context/law_firm');
    console.log('Status:', context.status);
    console.log('Niche:', context.data.name);
    console.log('Coverage priorities:', context.data.coverage_priorities?.slice(0, 3).join(', ') || 'N/A');
    console.log(context.status === 200 && context.data.id === 'law_firm' ? '✅ PASS' : '❌ FAIL');

    // Test 4: Risk assessment
    console.log('\n⚠️ Test 4: Quick Risk Assessment');
    console.log('POST /api/cyber-copilot/risk-assessment');
    const riskAssessment = await makeRequest('POST', '/api/cyber-copilot/risk-assessment', {
      client_profile: {
        revenue: 1000000,
        employee_count: 15,
        has_mfa: false,
        has_edr: false,
        backup_frequency: 'weekly',
        prior_claims: 1,
      },
      niche: 'generic',
    });
    console.log('Status:', riskAssessment.status);
    console.log('Loss probability:', riskAssessment.data.risk_report?.loss_probability);
    console.log('Estimated premium:', riskAssessment.data.risk_report?.estimated_premium);
    console.log('Carriers:', riskAssessment.data.recommended_carriers?.length || 0);
    console.log(riskAssessment.status === 200 && riskAssessment.data.risk_report ? '✅ PASS' : '❌ FAIL');

    // Test 5: Full cyber copilot
    console.log('\n🚀 Test 5: Full Cyber Copilot (Healthcare Lead)');
    console.log('POST /api/cyber-copilot');
    const copilot = await makeRequest('POST', '/api/cyber-copilot', {
      lead_data: {
        company_name: 'Test Dental Practice',
        industry: 'dental',
        revenue: 1500000,
        employee_count: 12,
        has_mfa: true,
        has_edr: true,
        backup_frequency: 'daily',
        prior_claims: 0,
      },
    });
    console.log('Status:', copilot.status);
    console.log('Qualification status:', copilot.data.status);
    console.log('Detected niche:', copilot.data.niche);
    console.log('Risk report:', copilot.data.risk_report ? '✓' : '✗');
    console.log('Discovery script:', copilot.data.discovery_script ? '✓ Generated' : '✗');
    console.log('Outreach emails:', copilot.data.outreach_sequence?.emails?.length || 0);
    console.log(copilot.status === 200 && copilot.data.status === 'ok' ? '✅ PASS' : '❌ FAIL');

    // Test 6: Unqualified lead
    console.log('\n❌ Test 6: Unqualified Lead (Low Revenue)');
    console.log('POST /api/cyber-copilot');
    const unqualified = await makeRequest('POST', '/api/cyber-copilot', {
      lead_data: {
        company_name: 'Tiny Business',
        industry: 'retail',
        revenue: 50000,
        employee_count: 2,
      },
    });
    console.log('Status:', unqualified.status);
    console.log('Qualification status:', unqualified.data.status);
    console.log('Reason:', unqualified.data.reason);
    console.log(unqualified.status === 200 && unqualified.data.status === 'unqualified' ? '✅ PASS' : '❌ FAIL');

    // Test 7: Get quests
    console.log('\n📋 Test 7: Get Today\'s Quests');
    console.log('GET /api/cyber-copilot/quests');
    const quests = await makeRequest('GET', '/api/cyber-copilot/quests');
    console.log('Status:', quests.status);
    console.log('Total quests:', quests.data.total);
    console.log('Completed:', quests.data.completed);
    console.log('First quest:', quests.data.quests?.[0]?.title || 'N/A');
    console.log(quests.status === 200 && quests.data.quests?.length > 0 ? '✅ PASS' : '❌ FAIL');

    // Test 8: Panic mode
    console.log('\n🚨 Test 8: Panic Mode');
    console.log('GET /api/cyber-copilot/quests/panic');
    const panic = await makeRequest('GET', '/api/cyber-copilot/quests/panic');
    console.log('Status:', panic.status);
    console.log('Panic mode:', panic.data.panic_mode);
    console.log('Quest:', panic.data.quest?.title || 'N/A');
    console.log('Message:', panic.data.message);
    console.log(panic.status === 200 && panic.data.panic_mode === true ? '✅ PASS' : '❌ FAIL');

    console.log('\n' + '='.repeat(50));
    console.log('✨ All tests completed!\n');
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    console.log('\n⚠️ Make sure the server is running on port 8000');
    console.log('Run: npm run backend\n');
    process.exit(1);
  }
}

console.log('⚠️ Note: This test requires the backend server to be running');
console.log('Start it with: npm run backend\n');

setTimeout(runTests, 1000);
