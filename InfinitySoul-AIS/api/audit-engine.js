/**
 * Audit Engine - Main Orchestrator
 * 
 * Coordinates all audit modules to perform comprehensive AI risk assessment.
 * Runs modules in parallel for efficiency and aggregates results.
 * 
 * @module api/audit-engine
 */

const analyzeAI = require('../modules/module-a');
const checkAccessibility = require('../modules/module-b');
const checkSecurity = require('../modules/module-c');
const stressTest = require('../modules/module-d');
const mapNIST = require('../modules/module-e');
const scoreInsurance = require('../scoring/engine');
const saveToVault = require('../vault/save');

/**
 * Runs complete AI insurance readiness audit.
 * 
 * Orchestrates execution of all audit modules in parallel, calculates
 * insurance readiness score, and stores results in evidence vault.
 * 
 * Audit Modules:
 * - Module A: AI System Scanner (bias, logging, vulnerabilities)
 * - Module B: WCAG Accessibility Audit
 * - Module C: Security & Data Protection Assessment
 * - Module D: Stress Test (jailbreak, hallucination, uptime)
 * - Module E: NIST AI RMF Compliance Mapping
 * 
 * @param {string} targetUrl - URL or identifier of AI system to audit
 * @returns {Promise<Object>} Complete audit report with scores and evidence ID
 * @property {string} url - Target system URL
 * @property {string} timestamp - ISO 8601 timestamp of audit
 * @property {Object} modules - Results from all audit modules
 * @property {Object} insuranceReadiness - Overall score and risk tier
 * @property {string} vaultId - Evidence vault storage identifier
 * 
 * @example
 * const report = await runFullAudit('https://example.com/ai-system');
 * console.log(`Overall Score: ${report.insuranceReadiness.overall}`);
 * console.log(`Risk Tier: ${report.insuranceReadiness.riskTier}`);
 */
module.exports.runFullAudit = async (targetUrl) => {
  console.log(`Starting comprehensive audit for ${targetUrl}...`);
  
  // Execute all audit modules in parallel for efficiency
  const [aiData, accessibility, security, stress, nist] = await Promise.all([
    analyzeAI(targetUrl),
    checkAccessibility(targetUrl),
    checkSecurity(targetUrl),
    stressTest(targetUrl),
    mapNIST(targetUrl)
  ]);
  
  console.log('All modules completed. Calculating insurance readiness score...');

  // Calculate insurance readiness score based on all module results
  const insuranceScore = await scoreInsurance({
    aiData, 
    accessibility, 
    security, 
    stress, 
    nist
  });
  
  console.log(`Audit complete. Overall score: ${insuranceScore.overall}, Risk: ${insuranceScore.riskTier}`);

  // Construct complete audit report
  const auditReport = {
    url: targetUrl,
    timestamp: new Date().toISOString(),
    modules: { aiData, accessibility, security, stress, nist },
    insuranceReadiness: insuranceScore,
    vaultId: await saveToVault({ 
      url: targetUrl, 
      insuranceScore,
      timestamp: new Date().toISOString()
    })
  };
  
  return auditReport;
};
