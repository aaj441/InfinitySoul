module.exports = async (data) => {
  const weights = {
    ai: 0.3,
    accessibility: 0.2,
    security: 0.25,
    stress: 0.15,
    nist: 0.1
  };

  const score = 
    (data.aiData.biasScore * weights.ai) +
    (data.accessibility.wcagScore * weights.accessibility) +
    (data.security.sslValid ? 100 : 0 * weights.security) +
    (data.stress.jailbreakResistance * weights.stress) +
    (data.nist.govern === "Complete" ? 100 : 50 * weights.nist);

  return {
    overall: Math.floor(score),
    riskTier: score > 80 ? "LOW" : score > 60 ? "MEDIUM" : "HIGH",
    eligibleForCyber: score > 75
  };
};
