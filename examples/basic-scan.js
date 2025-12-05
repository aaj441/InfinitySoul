/**
 * Basic WCAG AI Platform - Scan Example
 * 
 * This example shows how to:
 * 1. Create a new accessibility scan
 * 2. Poll for completion
 * 3. Retrieve results
 */

const BASE_URL = 'http://localhost:5000';

async function createScan(url) {
  console.log('Creating scan for:', url);
  
  const response = await fetch(`${BASE_URL}/api/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: url,
      wcagLevel: 'AA'
    })
  });
  
  if (!response.ok) throw new Error(`Scan creation failed: ${response.status}`);
  
  const data = await response.json();
  console.log('Scan created:', data);
  return data.scanId;
}

async function pollScanResults(scanId, maxAttempts = 30) {
  console.log('Polling scan results...');
  
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`${BASE_URL}/api/scans/${scanId}`);
    if (!response.ok) throw new Error(`Poll failed: ${response.status}`);
    
    const data = await response.json();
    console.log(`[${i + 1}/${maxAttempts}] Status:`, data.status);
    
    if (data.status === 'completed') {
      return data;
    }
    
    // Wait 2 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  throw new Error('Scan timed out after ' + (maxAttempts * 2) + ' seconds');
}

async function runScan(url) {
  try {
    // Step 1: Create scan
    const scanId = await createScan(url);
    
    // Step 2: Poll for results
    const results = await pollScanResults(scanId);
    
    // Step 3: Display results
    console.log('✅ Scan Complete!');
    console.log('Compliance Score:', results.complianceScore);
    console.log('Violations:', results.violations);
    
    return results;
  } catch (error) {
    console.error('❌ Scan failed:', error.message);
    throw error;
  }
}

// Run example
runScan('https://example.com').catch(console.error);
