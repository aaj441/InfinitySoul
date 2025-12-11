/**
 * Insurance Readiness Scoring Engine
 * 
 * Calculates overall insurance readiness based on weighted factors from all audit modules.
 * Provides risk tier classification and insurance eligibility determination.
 * 
 * @module scoring/engine
 */

/**
 * Calculates comprehensive insurance readiness score.
 * 
 * Uses weighted scoring across five dimensions:
 * - AI System Analysis (30%)
 * - Accessibility Compliance (20%)
 * - Security Posture (25%)
 * - Stress Resilience (15%)
 * - NIST Framework Compliance (10%)
 * 
 * @param {Object} auditData - Complete audit results from all modules
 * @param {Object} auditData.aiData - AI system analysis (bias, logging, vulnerabilities)
 * @param {Object} auditData.accessibility - WCAG compliance results
 * @param {Object} auditData.security - Security assessment (SSL, encryption, data protection)
 * @param {Object} auditData.stress - Stress test results (jailbreak, hallucination, uptime)
 * @param {Object} auditData.nist - NIST AI RMF compliance status
 * @returns {Promise<Object>} Insurance readiness score with breakdown and eligibility
 */
module.exports = async (auditData) => {
  console.log('Scoring engine: Calculating insurance readiness');
  
  // Scoring weights for each audit dimension
  const scoringWeights = {
    ai: 0.30,          // AI system quality and safety
    accessibility: 0.20, // WCAG compliance and inclusivity
    security: 0.25,     // Security posture and data protection
    stress: 0.15,       // Operational resilience
    nist: 0.10          // NIST framework alignment
  };
  
  // Calculate AI system score (bias detection, logging, compliance)
  const aiSystemScore = auditData.aiData.biasScore || 0;
  
  // Calculate accessibility score (WCAG compliance)
  const accessibilityComplianceScore = auditData.accessibility.wcagScore || 0;
  
  // Calculate enhanced security score with multiple factors
  const securityPostureScore = calculateSecurityScore(auditData.security);
  
  // Calculate stress resilience score (jailbreak resistance, uptime)
  const stressResilienceScore = auditData.stress.jailbreakResistance || 0;
  
  // Calculate NIST compliance score using configuration mapping
  const nistComplianceScore = calculateNistScore(auditData.nist.govern);
  
  // Calculate weighted overall score
  const overallScore = Math.floor(
    (aiSystemScore * scoringWeights.ai) +
    (accessibilityComplianceScore * scoringWeights.accessibility) +
    (securityPostureScore * scoringWeights.security) +
    (stressResilienceScore * scoringWeights.stress) +
    (nistComplianceScore * scoringWeights.nist)
  );
  
  // Determine risk tier based on overall score
  const riskTier = classifyRiskTier(overallScore);
  
  // Calculate insurance eligibility for different coverage types
  const insuranceEligibility = {
    cyber: overallScore >= 75,      // Cyber insurance threshold
    errorsOmissions: overallScore >= 70,  // E&O insurance threshold
    generalLiability: overallScore >= 65  // GL insurance threshold
  };
  
  // Return complete scoring result with breakdown
  return {
    overall: overallScore,
    riskTier,
    eligibleForCyber: insuranceEligibility.cyber,
    eligibleForEO: insuranceEligibility.errorsOmissions,
    eligibleForGL: insuranceEligibility.generalLiability,
    breakdown: {
      ai: Math.floor(aiSystemScore * scoringWeights.ai),
      accessibility: Math.floor(accessibilityComplianceScore * scoringWeights.accessibility),
      security: Math.floor(securityPostureScore * scoringWeights.security),
      stress: Math.floor(stressResilienceScore * scoringWeights.stress),
      nist: Math.floor(nistComplianceScore * scoringWeights.nist)
    }
  };
};

/**
 * Calculates enhanced security score considering multiple factors.
 * 
 * Factors considered:
 * - SSL/TLS validity (60 points)
 * - Encryption protocol version (20 points for TLS 1.3)
 * - Data protection measures (10 points each for encryption at rest and access controls)
 * 
 * @param {Object} securityData - Security assessment results
 * @param {boolean} securityData.sslValid - Whether SSL/TLS is valid
 * @param {string} securityData.encryption - Encryption protocol (e.g., "TLS 1.3")
 * @param {Object} securityData.dataProtection - Data protection measures
 * @returns {number} Security score (0-100)
 */
function calculateSecurityScore(securityData) {
  let score = 0;
  
  // Base SSL/TLS validation (60% of security score)
  if (securityData.sslValid) {
    score += 60;
  }
  
  // Modern encryption protocol bonus (20%)
  if (securityData.encryption === 'TLS 1.3') {
    score += 20;
  }
  
  // Data protection measures (10% each)
  if (securityData.dataProtection?.hasEncryptionAtRest) {
    score += 10;
  }
  if (securityData.dataProtection?.hasAccessControls) {
    score += 10;
  }
  
  // Ensure score doesn't exceed maximum
  return Math.min(100, score);
}

/**
 * Calculates NIST AI RMF compliance score based on governance status.
 * 
 * @param {string} governStatus - NIST governance status ("Complete", "Partial", or "In Progress")
 * @returns {number} NIST compliance score (0-100)
 */
function calculateNistScore(governStatus) {
  const NIST_SCORE_MAPPING = {
    'Complete': 100,
    'Partial': 50,
    'In Progress': 25
  };
  
  return NIST_SCORE_MAPPING[governStatus] || 25;
}

/**
 * Classifies risk tier based on overall score.
 * 
 * Tiers:
 * - LOW: Score >= 80 (minimal risk, best insurance rates)
 * - MEDIUM: Score 60-79 (moderate risk, standard rates)
 * - HIGH: Score < 60 (significant risk, premium rates or coverage denial)
 * 
 * @param {number} score - Overall insurance readiness score (0-100)
 * @returns {string} Risk tier classification ("LOW", "MEDIUM", or "HIGH")
 */
function classifyRiskTier(score) {
  if (score >= 80) return "LOW";
  if (score >= 60) return "MEDIUM";
  return "HIGH";
}
