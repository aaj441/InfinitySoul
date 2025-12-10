// Insurance Scoring Engine
module.exports = async (data) => {
  console.log('Scoring engine: Calculating insurance readiness');
  
  const weights = {
    ai: 0.30,
    accessibility: 0.20,
    security: 0.25,
    stress: 0.15,
    nist: 0.10
  };
  
  // Calculate individual scores
  const aiScore = data.aiData.biasScore || 0;
  const accessibilityScore = data.accessibility.wcagScore || 0;
  
  // Enhanced security scoring: considers SSL, encryption type, and data protection
  let securityScore = 0;
  if (data.security.sslValid) securityScore += 60;  // Base SSL score
  if (data.security.encryption === 'TLS 1.3') securityScore += 20;  // Modern encryption
  if (data.security.dataProtection?.hasEncryptionAtRest) securityScore += 10;
  if (data.security.dataProtection?.hasAccessControls) securityScore += 10;
  securityScore = Math.min(100, securityScore);  // Cap at 100
  
  const stressScore = data.stress.jailbreakResistance || 0;
  // NIST scoring configuration
  const NIST_SCORES = { Complete: 100, Partial: 50, 'In Progress': 25 };
  const nistScore = NIST_SCORES[data.nist.govern] || 25;
  
  // Weighted overall score
  const overall = Math.floor(
    (aiScore * weights.ai) +
    (accessibilityScore * weights.accessibility) +
    (securityScore * weights.security) +
    (stressScore * weights.stress) +
    (nistScore * weights.nist)
  );
  
  // Risk tier classification
  let riskTier;
  if (overall >= 80) riskTier = "LOW";
  else if (overall >= 60) riskTier = "MEDIUM";
  else riskTier = "HIGH";
  
  // Insurance eligibility
  const eligibleForCyber = overall >= 75;
  const eligibleForEO = overall >= 70;
  const eligibleForGL = overall >= 65;
  
  return {
    overall,
    riskTier,
    eligibleForCyber,
    eligibleForEO,
    eligibleForGL,
    breakdown: {
      ai: Math.floor(aiScore * weights.ai),
      accessibility: Math.floor(accessibilityScore * weights.accessibility),
      security: Math.floor(securityScore * weights.security),
      stress: Math.floor(stressScore * weights.stress),
      nist: Math.floor(nistScore * weights.nist)
    }
  };
};
