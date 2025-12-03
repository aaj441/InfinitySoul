/**
 * Risk Air Traffic Control Dashboard
 *
 * Main dashboard component for real-time ADA litigation risk monitoring.
 * The "control tower" for accessibility compliance risk.
 */

import React, { useState, useEffect } from 'react';
import LiveHeatmap from './LiveHeatmap';
import PlaintiffRadar from './PlaintiffRadar';
import LawsuitForecastChart from './LawsuitForecastChart';
import GlobalRiskPulse from './GlobalRiskPulse';

interface RiskATCData {
  globalRiskScore: number;
  industryHeatmap: any;
  plaintiffs: any[];
  forecast: any;
  timestamp: Date;
}

export default function RiskATC() {
  const [data, setData] = useState<RiskATCData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(60000); // 1 minute

  // Fetch risk data
  const fetchRiskData = async () => {
    try {
      const response = await fetch('/api/intel/risk-atc');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch risk data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRiskData();
  }, []);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(fetchRiskData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading) {
    return (
      <div className="risk-atc-loading">
        <div className="loading-spinner" />
        <p>Loading Risk ATC Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="risk-atc-error">
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <button onClick={fetchRiskData}>Retry</button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="risk-atc-empty">
        <p>No risk data available</p>
      </div>
    );
  }

  return (
    <div className="risk-atc-container">
      {/* Header */}
      <header className="risk-atc-header">
        <h1>⚡ Risk Air Traffic Control</h1>
        <p className="subtitle">Real-time ADA Litigation Intelligence</p>
        <div className="header-controls">
          <span className="last-updated">
            Last updated: {new Date(data.timestamp).toLocaleTimeString()}
          </span>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="refresh-select"
          >
            <option value={30000}>Refresh: 30s</option>
            <option value={60000}>Refresh: 1m</option>
            <option value={300000}>Refresh: 5m</option>
            <option value={0}>Manual only</option>
          </select>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className="risk-atc-grid">
        {/* Global Risk Pulse - Top Banner */}
        <div className="atc-section atc-full-width">
          <GlobalRiskPulse score={data.globalRiskScore} />
        </div>

        {/* Industry Heatmap - Left Panel */}
        <div className="atc-section atc-two-thirds">
          <LiveHeatmap heatmap={data.industryHeatmap} />
        </div>

        {/* Plaintiff Radar - Right Panel */}
        <div className="atc-section atc-one-third">
          <PlaintiffRadar plaintiffs={data.plaintiffs} />
        </div>

        {/* Lawsuit Forecast - Bottom Panel */}
        <div className="atc-section atc-full-width">
          <LawsuitForecastChart forecast={data.forecast} />
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .risk-atc-container {
          padding: 2rem;
          background: #0a0e27;
          min-height: 100vh;
          color: #fff;
        }

        .risk-atc-header {
          margin-bottom: 2rem;
          border-bottom: 2px solid #1e2740;
          padding-bottom: 1rem;
        }

        .risk-atc-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0;
          color: #00d4ff;
        }

        .subtitle {
          color: #8b92a7;
          margin-top: 0.5rem;
        }

        .header-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
        }

        .last-updated {
          color: #8b92a7;
          font-size: 0.875rem;
        }

        .refresh-select {
          background: #1e2740;
          color: #fff;
          border: 1px solid #2a3654;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .risk-atc-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .atc-section {
          background: #141b35;
          border-radius: 8px;
          border: 1px solid #1e2740;
          padding: 1.5rem;
        }

        .atc-full-width {
          grid-column: span 3;
        }

        .atc-two-thirds {
          grid-column: span 2;
        }

        .atc-one-third {
          grid-column: span 1;
        }

        .risk-atc-loading,
        .risk-atc-error,
        .risk-atc-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          color: #8b92a7;
        }

        .loading-spinner {
          border: 4px solid #1e2740;
          border-top: 4px solid #00d4ff;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .risk-atc-error button {
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          background: #00d4ff;
          color: #0a0e27;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
        }

        .risk-atc-error button:hover {
          background: #00b8e6;
        }

        @media (max-width: 1024px) {
          .atc-two-thirds,
          .atc-one-third {
            grid-column: span 3;
          }
        }
      `}</style>
    </div>
  );
}
