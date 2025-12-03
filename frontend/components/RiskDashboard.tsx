/**
 * Phase III — Risk Underwriting Dashboard
 * Executive-level view of compliance risk and insurance metrics
 */

import React, { useState, useEffect } from 'react';

interface RiskMetrics {
  complianceScore: number;
  complianceGrade: string;
  annualLawsuitProbability: string;
  expectedLawsuitCost: number;
  recommendedInsurancePremium: number;
  recommendedRemediationBudget: number;
  recommendations: string[];
}

interface RiskDashboardProps {
  domain: string;
  metrics: RiskMetrics;
}

export default function RiskDashboard({ domain, metrics }: RiskDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const scoreColor = (score: number) => {
    if (score >= 750) return 'text-green-600';
    if (score >= 600) return 'text-yellow-600';
    if (score >= 450) return 'text-orange-600';
    return 'text-red-600';
  };

  const probabilityColor = (prob: string) => {
    const num = parseFloat(prob);
    if (num <= 10) return 'text-green-600';
    if (num <= 20) return 'text-yellow-600';
    if (num <= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="risk-dashboard bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h1 className="text-3xl font-bold mb-2">{domain}</h1>
        <p className="text-blue-100">Risk Assessment & Insurance Underwriting</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 flex">
        {['overview', 'scoring', 'exposure', 'recommendations'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold capitalize transition-colors ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* CCS Score */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-sm font-semibold uppercase mb-3">
                  Compliance Credit Score
                </p>
                <div className={`text-4xl font-bold mb-2 ${scoreColor(metrics.complianceScore)}`}>
                  {metrics.complianceScore}
                </div>
                <p className="text-gray-600 text-sm">Grade: <span className="font-bold">{metrics.complianceGrade}</span></p>
                <p className="text-gray-500 text-xs mt-2">Scale: 0-850 (Like FICO)</p>
              </div>

              {/* Lawsuit Probability */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-sm font-semibold uppercase mb-3">
                  Annual Lawsuit Probability
                </p>
                <div className={`text-4xl font-bold mb-2 ${probabilityColor(metrics.annualLawsuitProbability)}`}>
                  {metrics.annualLawsuitProbability}
                </div>
                <p className="text-gray-600 text-sm">
                  Probability within 12 months
                </p>
              </div>

              {/* Expected Lawsuit Cost */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-sm font-semibold uppercase mb-3">
                  Expected Lawsuit Cost
                </p>
                <div className="text-4xl font-bold text-red-600 mb-2">
                  ${(metrics.expectedLawsuitCost / 1000).toFixed(0)}K
                </div>
                <p className="text-gray-600 text-sm">
                  Settlement + Legal Fees
                </p>
              </div>

              {/* Insurance Premium */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-sm font-semibold uppercase mb-3">
                  Recommended Premium
                </p>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  ${(metrics.recommendedInsurancePremium / 1000).toFixed(0)}K
                </div>
                <p className="text-gray-600 text-sm">/year</p>
              </div>
            </div>

            {/* Risk Factor Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-4">Key Risk Factors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-blue-700 font-semibold">Technical Violations</p>
                  <p className="text-2xl font-bold text-blue-600">42</p>
                </div>
                <div>
                  <p className="text-blue-700 font-semibold">Jurisdiction Risk</p>
                  <p className="text-2xl font-bold text-orange-600">High</p>
                </div>
                <div>
                  <p className="text-blue-700 font-semibold">Serial Plaintiffs</p>
                  <p className="text-2xl font-bold text-red-600">Active</p>
                </div>
                <div>
                  <p className="text-blue-700 font-semibold">Media Exposure</p>
                  <p className="text-2xl font-bold text-yellow-600">Medium</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scoring' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Score Breakdown</h2>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-4">Score Components</h3>
              <div className="space-y-3">
                <ScoreBar label="Technical Debt" value={65} color="bg-red-500" />
                <ScoreBar label="Jurisdiction Risk" value={42} color="bg-orange-500" />
                <ScoreBar label="Serial Plaintiff Risk" value={28} color="bg-yellow-500" />
                <ScoreBar label="Improvement Trend" value={75} color="bg-green-500" />
                <ScoreBar label="Industry Adjustment" value={55} color="bg-blue-500" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Score Improvement Potential</h3>
              <p className="text-blue-700 mb-4">
                By fixing critical violations, you could improve your score by <span className="font-bold text-lg">+125 points</span>
              </p>
              <div className="bg-white rounded p-3 text-sm text-blue-800">
                Estimated new score: <span className="font-bold text-lg text-green-600">675</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'exposure' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Financial Exposure</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ExposureCard
                title="Settlement Range"
                low={25000}
                mid={75000}
                high={150000}
              />
              <ExposureCard
                title="Legal Fees"
                low={20000}
                mid={35000}
                high={50000}
              />
              <ExposureCard
                title="Total Exposure"
                low={45000}
                mid={110000}
                high={200000}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-900 mb-2">Remediation Budget</h3>
              <p className="text-yellow-800 mb-2">
                Estimated cost to fix all violations:
              </p>
              <p className="text-3xl font-bold text-yellow-600">
                ${(metrics.recommendedRemediationBudget / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Action Items</h2>
            {metrics.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4"
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">
                    {idx < 2 ? '🔴' : idx < 4 ? '🟡' : '🟢'}
                  </div>
                  <p className="text-gray-800">{rec}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-8 py-4 text-xs text-gray-600 text-right">
        <p>Generated: {new Date().toLocaleString()}</p>
        <p>Data Source: InfinitySoul Phase III Risk Underwriting Engine</p>
      </div>
    </div>
  );
}

/**
 * Score bar component
 */
function ScoreBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-gray-700 font-semibold">{label}</span>
        <span className="text-gray-600">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/**
 * Exposure card component
 */
function ExposureCard({
  title,
  low,
  mid,
  high,
}: {
  title: string;
  low: number;
  mid: number;
  high: number;
}) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h4 className="font-semibold text-gray-700 mb-4">{title}</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Low:</span>
          <span className="font-semibold text-gray-800">${(low / 1000).toFixed(0)}K</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Mid:</span>
          <span className="font-bold text-lg text-blue-600">${(mid / 1000).toFixed(0)}K</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">High:</span>
          <span className="font-semibold text-gray-800">${(high / 1000).toFixed(0)}K</span>
        </div>
      </div>
    </div>
  );
}
