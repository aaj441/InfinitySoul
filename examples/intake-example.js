/**
 * WCAG AI Platform - Intake Form Example
 * 
 * This example shows how to:
 * 1. Submit an audit intake form
 * 2. Check submission status
 */

const BASE_URL = 'http://localhost:5000';

async function submitIntake(formData) {
  console.log('Submitting intake form...');
  
  const response = await fetch(`${BASE_URL}/api/intake`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  
  if (!response.ok) throw new Error(`Intake submission failed: ${response.status}`);
  
  const data = await response.json();
  console.log('✅ Intake submitted:', data);
  return data.intake_id;
}

async function checkIntakeStatus(intakeId) {
  console.log('Checking intake status for:', intakeId);
  
  const response = await fetch(`${BASE_URL}/api/intake/status/${intakeId}`);
  
  if (!response.ok) throw new Error(`Status check failed: ${response.status}`);
  
  const data = await response.json();
  console.log('Status:', data);
  return data;
}

async function runIntakeWorkflow() {
  try {
    // Step 1: Submit intake form
    const intakeId = await submitIntake({
      name: 'John Doe',
      email: 'john@example.com',
      website: 'https://example.com',
      companySize: '50-500',
      concerns: 'Color contrast and keyboard navigation issues'
    });
    
    // Step 2: Check status after a delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    await checkIntakeStatus(intakeId);
    
    console.log('✅ Intake workflow complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run example
runIntakeWorkflow().catch(console.error);
