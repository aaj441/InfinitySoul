const analyzeAI = require('../modules/module-a');
const checkAccessibility = require('../modules/module-b');
const checkSecurity = require('../modules/module-c');
const stressTest = require('../modules/module-d');
const mapNIST = require('../modules/module-e');
const scoreInsurance = require('../scoring/engine');
const saveToVault = require('../vault/save');

module.exports.runFullAudit = async (url) => {
  console.log(`Starting audit for ${url}...`);
  
  const [aiData, accessibility, security, stress, nist] = await Promise.all([
    analyzeAI(url),
    checkAccessibility(url),
    checkSecurity(url),
    stressTest(url),
    mapNIST(url)
  ]);

  const insuranceScore = await scoreInsurance({
    aiData, accessibility, security, stress, nist
  });

  return {
    url,
    timestamp: new Date().toISOString(),
    modules: { aiData, accessibility, security, stress, nist },
    insuranceReadiness: insuranceScore,
    vaultId: await saveToVault({ url, insuranceScore })
  };
};
