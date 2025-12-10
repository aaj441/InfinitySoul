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
  const securityScore = data.security.sslValid ? 100 : 0;
  const stressScore = data.stress.jailbreakResistance || 0;
  const nistScore = (data.nist.govern === "Complete" ? 100 : 
                     data.nist.govern === "Partial" ? 50 : 25);
  
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
