/**
 * Phase V — Risk ATC (Air Traffic Control) Dashboard
 * Real-time global threat intelligence visualization
 * Shows: lawsuits, plaintiffs, industry heatmaps, forecasts, at-risk clients
 */

import React, { useState, useEffect } from 'react';

interface RiskATCProps {
  threatData: {
    globalRiskIndex: number;
    litigationActivityLevel: string;
    totalLawsuits: number;
    activePlaintiffs: number;
    hotJurisdictions: string[];
    industryHeatmap: Record<string, number>;
    forecasts: {
      forecast30Days: number;
      forecast90Days: number;
    };
    atRiskClients: Array<{
      domain: string;
      industry: string;
      jurisdiction: string;
      riskLevel: string;
      probability: number;
    }>;
  };
}

export default function RiskATC({ threatData }: RiskATCProps) {
  const [activeView, setActiveView] = useState('overview');
  const [alertsExpanded, setAlertsExpanded] = useState(false);

  const riskColor = (index: number) => {
    if (index >= 75) return 'text-red-600 bg-red-50';
    if (index >= 50) return 'text-orange-600 bg-orange-50';
    if (index >= 25) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const activityBadge = (level: string) => {
    switch (level) {
      case 'surging':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'elevated':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'quiet':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="risk-atc bg-gradient-to-br from-slate-900 to-slate-800 text-white min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">🛰️ ADA Risk Air Traffic Control</h1>
          <div className="text-right">
            <p className="text-slate-300 text-sm">Live Threat Intelligence</p>
            <p className="text-slate-500 text-xs">{new Date().toLocaleString()}</p>
          </div>
        </div>

        {/* Global Risk Index - Center Stage */}
        <div className={`rounded-lg p-8 ${riskColor(threatData.globalRiskIndex)} border-2 mb-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold opacity-75">Global ADA Risk Index</p>
              <p className="text-6xl font-bold">{threatData.globalRiskIndex}</p>
              <p className="text-xs opacity-75 mt-1">/100</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-4 py-2 rounded-full border text-lg font-bold ${activityBadge(threatData.litigationActivityLevel)}`}>
                {threatData.litigationActivityLevel.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-slate-700">
        {['overview', 'lawsuits', 'plaintiffs', 'industry', 'forecast'].map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`pb-3 px-4 font-semibold transition-colors capitalize ${
              activeView === view
                ? 'border-b-2 border-blue-400 text-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {view === 'lawsuits' ? '⚖️ Lawsuits' : view === 'plaintiffs' ? '👤 Plaintiffs' : view === 'industry' ? '📊 Industry' : view === 'forecast' ? '🔮 Forecast' : '📡 Overview'}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {activeView === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Lawsuits */}
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <p className="text-slate-400 text-sm font-semibold mb-2">⚖️ Total Lawsuits</p>
              <p className="text-4xl font-bold text-red-400">{threatData.totalLawsuits}</p>
              <p className="text-xs text-slate-500 mt-2">ADA Title III cases</p>
            </div>

            {/* Active Serial Plaintiffs */}
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <p className="text-slate-400 text-sm font-semibold mb-2">👤 Serial Plaintiffs</p>
              <p className="text-4xl font-bold text-orange-400">{threatData.activePlaintiffs}</p>
              <p className="text-xs text-slate-500 mt-2">High-activity actors</p>
            </div>

            {/* Jurisdiction Hotspots */}
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <p className="text-slate-400 text-sm font-semibold mb-2">🌡️ Hotspots</p>
              <p className="text-4xl font-bold text-yellow-400">{threatData.hotJurisdictions.length}</p>
              <p className="text-xs text-slate-500 mt-2">High-risk states</p>
            </div>

            {/* Next 30 Days Forecast */}
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <p className="text-slate-400 text-sm font-semibold mb-2">📈 30-Day Forecast</p>
              <p className="text-4xl font-bold text-blue-400">{threatData.forecasts.forecast30Days}</p>
              <p className="text-xs text-slate-500 mt-2">Predicted lawsuits</p>
            </div>
          </div>
        )}

        {activeView === 'industry' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Industry Litigation Heatmap</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(threatData.industryHeatmap)
                .sort((a, b) => b[1] - a[1])
                .map(([industry, risk]) => (
                  <div
                    key={industry}
                    className="bg-slate-700 rounded-lg p-4 border border-slate-600"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold capitalize">{industry}</p>
                      <span className={`text-sm font-bold px-2 py-1 rounded ${
                        risk >= 70 ? 'bg-red-500' : risk >= 50 ? 'bg-orange-500' : 'bg-green-500'
                      }`}>
                        {risk}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          risk >= 70 ? 'bg-red-500' : risk >= 50 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${risk}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeView === 'forecast' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Litigation Forecast</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 30-Day Forecast */}
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 border border-blue-600">
                <p className="text-blue-300 text-sm font-semibold mb-3">Next 30 Days</p>
                <p className="text-5xl font-bold text-blue-300 mb-2">{threatData.forecasts.forecast30Days}</p>
                <p className="text-blue-400 text-sm">Predicted ADA lawsuits</p>
                <div className="mt-4 p-3 bg-blue-900 bg-opacity-50 rounded text-blue-200 text-xs">
                  📊 Based on current velocity and seasonal patterns
                </div>
              </div>

              {/* 90-Day Forecast */}
              <div className="bg-gradient-to-br from-orange-900 to-orange-800 rounded-lg p-6 border border-orange-600">
                <p className="text-orange-300 text-sm font-semibold mb-3">Next 90 Days</p>
                <p className="text-5xl font-bold text-orange-300 mb-2">{threatData.forecasts.forecast90Days}</p>
                <p className="text-orange-400 text-sm">Predicted ADA lawsuits</p>
                <div className="mt-4 p-3 bg-orange-900 bg-opacity-50 rounded text-orange-200 text-xs">
                  ⚠️ Includes jurisdictional surge projections
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'plaintiffs' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Active Threat Actors</h2>
            <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
              <p className="text-slate-300 mb-4">
                <span className="font-bold text-red-400">{threatData.activePlaintiffs}</span> serial plaintiffs actively targeting ADA violations
              </p>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-slate-800 p-4 rounded border-l-4 border-red-500">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">Plaintiff Group {i}</p>
                        <p className="text-xs text-slate-400 mt-1">Active in CA, NY, IL</p>
                      </div>
                      <span className="px-2 py-1 text-xs font-bold bg-red-500 rounded">CRITICAL</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* At-Risk Clients Alert */}
      {threatData.atRiskClients && threatData.atRiskClients.length > 0 && (
        <div className="mt-8 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-6">
          <button
            onClick={() => setAlertsExpanded(!alertsExpanded)}
            className="flex justify-between items-center w-full"
          >
            <h3 className="text-xl font-bold text-red-300">
              🚨 {threatData.atRiskClients.length} Clients at High Risk
            </h3>
            <span className="text-2xl">{alertsExpanded ? '▼' : '▶'}</span>
          </button>

          {alertsExpanded && (
            <div className="mt-4 space-y-2">
              {threatData.atRiskClients.slice(0, 5).map((client, idx) => (
                <div key={idx} className="bg-slate-800 p-3 rounded text-sm">
                  <p className="font-semibold text-red-300">{client.domain}</p>
                  <p className="text-xs text-slate-400">
                    {client.industry} • {client.jurisdiction} • {Math.round(client.probability * 100)}% lawsuit probability
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-slate-500 text-xs">
        <p>InfinitySoul Phase V — Autonomous Global ADA Threat Intelligence Network</p>
        <p>Real-time monitoring of 50,000+ domains • 7 legal databases • 4 scanning engines</p>
      </div>
    </div>
  );
}
