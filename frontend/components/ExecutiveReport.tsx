/**
 * Phase III — Executive Risk Report
 * PDF-ready report for board-level review
 */

import React from 'react';

interface ExecutiveReportProps {
  domain: string;
  companyName?: string;
  ccsScore: number;
  ccsGrade: string;
  annualProbability: string;
  expectedCost: number;
  insurancePremium: number;
  remediationBudget: number;
  recommendations: string[];
  generatedDate?: Date;
}

export default function ExecutiveReport({
  domain,
  companyName,
  ccsScore,
  ccsGrade,
  annualProbability,
  expectedCost,
  insurancePremium,
  remediationBudget,
  recommendations,
  generatedDate = new Date(),
}: ExecutiveReportProps) {
  const riskLevel =
    ccsScore >= 750
      ? 'LOW'
      : ccsScore >= 600
      ? 'MEDIUM'
      : ccsScore >= 450
      ? 'HIGH'
      : 'CRITICAL';

  const riskColor =
    riskLevel === 'LOW'
      ? 'text-green-600'
      : riskLevel === 'MEDIUM'
      ? 'text-yellow-600'
      : riskLevel === 'HIGH'
      ? 'text-orange-600'
      : 'text-red-600';

  return (
    <div className="executive-report max-w-4xl mx-auto bg-white">
      {/* PDF Header */}
      <div className="page page-1 min-h-screen flex flex-col border-4 border-gray-800">
        {/* Cover Page */}
        <div className="flex-1 flex flex-col justify-center items-center bg-gradient-to-br from-blue-900 to-purple-900 text-white p-12 print:p-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Accessibility Risk</h1>
            <h2 className="text-3xl font-semibold mb-4">Executive Assessment Report</h2>

            <div className="bg-white bg-opacity-10 rounded-lg p-6 mt-8 mb-8">
              <p className="text-2xl mb-2">{companyName || domain}</p>
              <p className="text-xl text-blue-200">{domain}</p>
            </div>

            <div className={`text-6xl font-bold mb-4 ${riskColor}`}>
              {riskLevel}
            </div>
            <p className="text-lg text-blue-100 mb-8">Risk Level Assessment</p>

            <div className="grid grid-cols-3 gap-6 mt-12">
              <div className="bg-white bg-opacity-10 rounded p-4">
                <p className="text-blue-200 text-sm uppercase tracking-wide">CCS Score</p>
                <p className="text-4xl font-bold mt-2">{ccsScore}</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded p-4">
                <p className="text-blue-200 text-sm uppercase tracking-wide">Annual Probability</p>
                <p className="text-4xl font-bold mt-2">{annualProbability}</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded p-4">
                <p className="text-blue-200 text-sm uppercase tracking-wide">Expected Cost</p>
                <p className="text-4xl font-bold mt-2">${(expectedCost / 1000).toFixed(0)}K</p>
              </div>
            </div>

            <p className="text-blue-200 mt-12 text-sm">
              Generated: {generatedDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-6 text-center text-xs text-gray-600 border-t-4 border-gray-800">
          <p>Confidential - For Internal Review Only</p>
          <p>InfinitySoul Phase III Risk Underwriting Engine</p>
        </div>
      </div>

      {/* Page 2: Executive Summary */}
      <div className="page page-2 min-h-screen flex flex-col border-4 border-gray-800 mt-8">
        <div className="bg-blue-600 text-white p-6 print:p-4">
          <h1 className="text-3xl font-bold">Executive Summary</h1>
        </div>

        <div className="p-8 print:p-6 flex-1">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Financial Risk Assessment</h2>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-red-50 border-l-4 border-red-600 p-4">
                <h3 className="font-bold text-red-900 mb-2">Expected Lawsuit Cost</h3>
                <p className="text-3xl font-bold text-red-600">
                  ${expectedCost.toLocaleString()}
                </p>
                <p className="text-sm text-red-800 mt-2">
                  Settlement + legal fees based on violation severity
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
                <h3 className="font-bold text-blue-900 mb-2">Recommended Insurance Premium</h3>
                <p className="text-3xl font-bold text-blue-600">
                  ${insurancePremium.toLocaleString()}/year
                </p>
                <p className="text-sm text-blue-800 mt-2">
                  Annual coverage for ADA liability
                </p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-3">Key Findings</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>Compliance Credit Score: <span className="font-bold">{ccsScore}</span> ({ccsGrade})</li>
              <li>Annual lawsuit probability: <span className="font-bold">{annualProbability}</span></li>
              <li>Total financial exposure: <span className="font-bold">${expectedCost.toLocaleString()}</span></li>
              <li>Recommended remediation investment: <span className="font-bold">${remediationBudget.toLocaleString()}</span></li>
            </ul>

            <div className="bg-yellow-50 border border-yellow-300 rounded p-4 mb-6">
              <h4 className="font-bold text-yellow-900 mb-2">⚠️ Risk Level: {riskLevel}</h4>
              <p className="text-yellow-900">
                Current accessibility gaps create significant financial and reputational risk.
                Immediate remediation is recommended.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-4 text-center text-xs text-gray-600 border-t-4 border-gray-800">
          <p>Page 2 of 4</p>
        </div>
      </div>

      {/* Page 3: Risk Analysis */}
      <div className="page page-3 min-h-screen flex flex-col border-4 border-gray-800 mt-8">
        <div className="bg-blue-600 text-white p-6 print:p-4">
          <h1 className="text-3xl font-bold">Detailed Risk Analysis</h1>
        </div>

        <div className="p-8 print:p-6 flex-1">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Compliance Credit Score Breakdown</h2>

          <div className="space-y-4 mb-8">
            <RiskFactor label="Technical Debt" value={65} />
            <RiskFactor label="Jurisdiction Risk" value={42} />
            <RiskFactor label="Serial Plaintiff Risk" value={28} />
            <RiskFactor label="Improvement Trend" value={75} />
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-4 mt-8">Financial Exposure Ranges</h2>

          <div className="bg-gray-50 border border-gray-300 rounded p-4 mb-6">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600 font-semibold">Settlement</p>
                <p className="text-lg font-bold">$25K - $150K</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Legal Fees</p>
                <p className="text-lg font-bold">$20K - $50K</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Total Exposure</p>
                <p className="text-lg font-bold">$45K - $200K</p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-3">Risk Mitigation</h2>
          <p className="text-gray-700 mb-4">
            Implementing accessibility fixes can reduce financial exposure and improve
            the CCS score. Recommended remediation budget of ${remediationBudget.toLocaleString()}
            could reduce annual lawsuit probability by up to 40%.
          </p>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-4 text-center text-xs text-gray-600 border-t-4 border-gray-800">
          <p>Page 3 of 4</p>
        </div>
      </div>

      {/* Page 4: Recommendations */}
      <div className="page page-4 min-h-screen flex flex-col border-4 border-gray-800 mt-8">
        <div className="bg-blue-600 text-white p-6 print:p-4">
          <h1 className="text-3xl font-bold">Recommendations & Action Plan</h1>
        </div>

        <div className="p-8 print:p-6 flex-1">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Immediate Actions (30 Days)</h2>

          <div className="space-y-4 mb-8">
            {recommendations.slice(0, 3).map((rec, idx) => (
              <div key={idx} className="flex gap-4 p-4 bg-red-50 border border-red-200 rounded">
                <div className="text-2xl flex-shrink-0">🔴</div>
                <p className="text-gray-800">{rec}</p>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-6">Medium-Term Actions (90 Days)</h2>

          <div className="space-y-4 mb-8">
            {recommendations.slice(3, 5).map((rec, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded"
              >
                <div className="text-2xl flex-shrink-0">🟡</div>
                <p className="text-gray-800">{rec}</p>
              </div>
            ))}
          </div>

          <h2 className="text-lg font-bold text-gray-800 mb-4">Next Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Schedule remediation kickoff meeting</li>
            <li>Obtain ADA liability insurance quote (${insurancePremium.toLocaleString()}/year estimate)</li>
            <li>Allocate ${remediationBudget.toLocaleString()} remediation budget</li>
            <li>Re-scan in 60 days to measure progress</li>
            <li>Brief executive team on compliance roadmap</li>
          </ol>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-4 text-center text-xs text-gray-600 border-t-4 border-gray-800">
          <p>Page 4 of 4 - End of Report</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Risk factor component
 */
function RiskFactor({ label, value }: { label: string; value: number }) {
  const color =
    value >= 70 ? 'bg-green-500' : value >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-gray-700 font-semibold">{label}</span>
        <span className="text-gray-600">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div className={`${color} h-3 rounded-full`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
