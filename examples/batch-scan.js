/**
 * WCAG AI Platform - Batch Scanning Example
 * 
 * Submit multiple URLs for scanning in a single batch request.
 * More efficient than individual scans for large website audits.
 */

const BASE_URL = 'http://localhost:5000';

async function submitBatchScan(urls) {
  console.log(`Submitting batch scan for ${urls.length} URLs...`);
  
  const response = await fetch(`${BASE_URL}/api/scan/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      urls: urls,
      wcagLevel: 'AA',
      timeout: 300000,
      industry: 'healthcare'
    })
  });
  
  if (!response.ok) throw new Error(`Batch submission failed: ${response.status}`);
  
  const data = await response.json();
  console.log('✅ Batch submitted:', data);
  return data.batchId;
}

async function getBatchStatus(batchId) {
  const response = await fetch(`${BASE_URL}/api/scan/batch/${batchId}`);
  
  if (!response.ok) throw new Error(`Status check failed: ${response.status}`);
  
  const data = await response.json();
  return data;
}

async function runBatchExample() {
  try {
    // Example: Scan multiple pages of an e-commerce site
    const urls = [
      'https://example.com/home',
      'https://example.com/products',
      'https://example.com/product/123',
      'https://example.com/cart',
      'https://example.com/checkout',
      'https://example.com/about',
      'https://example.com/contact',
    ];
    
    // Step 1: Submit batch
    const batchId = await submitBatchScan(urls);
    
    // Step 2: Poll batch status
    console.log('\nPolling batch status...');
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const status = await getBatchStatus(batchId);
      console.log(`Status: ${status.status} - ${status.scanIds.length} scans queued`);
      
      if (status.status === 'completed') {
        console.log('✅ Batch complete! Scan IDs:', status.scanIds);
        break;
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run example
runBatchExample().catch(console.error);
