/**
 * Live Industry Heatmap
 *
 * Real-time visualization of ADA litigation activity by industry.
 */

import React from 'react';

interface HeatmapData {
  industries: Array<{
    name: string;
    totalFilings: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    recentActivity: {
      last30Days: number;
    };
  }>;
}

interface LiveHeatmapProps {
  heatmap: HeatmapData;
}

export default function LiveHeatmap({ heatmap }: LiveHeatmapProps) {
  if (!heatmap || !heatmap.industries) {
    return (
      <div className="heatmap-empty">
        <p>No industry data available</p>
      </div>
    );
  }

  const getRiskColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'critical': return '#ff4444';
      case 'high': return '#ff8800';
      case 'medium': return '#ffbb00';
      case 'low': return '#00cc66';
      default: return '#8b92a7';
    }
  };

  const getActivityIntensity = (filings: number): number => {
    // Normalize to 0-1 scale (max 100 filings = full intensity)
    return Math.min(filings / 100, 1);
  };

  return (
    <div className="live-heatmap">
      <h2 className="heatmap-title">📊 Industry Litigation Heatmap</h2>
      <p className="heatmap-description">Real-time filing activity by industry</p>

      <div className="heatmap-grid">
        {heatmap.industries.map((industry, index) => {
          const color = getRiskColor(industry.riskLevel);
          const intensity = getActivityIntensity(industry.recentActivity.last30Days);

          return (
            <div
              key={index}
              className="heatmap-cell"
              style={{
                borderColor: color,
                backgroundColor: `${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`
              }}
            >
              <div className="cell-header">
                <span className="industry-name">{industry.name}</span>
                <span className="risk-badge" style={{ backgroundColor: color }}>
                  {industry.riskLevel.toUpperCase()}
                </span>
              </div>
              <div className="cell-stats">
                <div className="stat">
                  <span className="stat-label">Total Filings</span>
                  <span className="stat-value">{industry.totalFilings}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Last 30 Days</span>
                  <span className="stat-value highlight">{industry.recentActivity.last30Days}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="heatmap-legend">
        <span className="legend-label">Risk Level:</span>
        <div className="legend-items">
          <span className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#00cc66' }} />
            Low
          </span>
          <span className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#ffbb00' }} />
            Medium
          </span>
          <span className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#ff8800' }} />
            High
          </span>
          <span className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#ff4444' }} />
            Critical
          </span>
        </div>
      </div>

      <style jsx>{`
        .live-heatmap {
          width: 100%;
        }

        .heatmap-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          color: #fff;
        }

        .heatmap-description {
          color: #8b92a7;
          margin: 0 0 1.5rem 0;
          font-size: 0.875rem;
        }

        .heatmap-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .heatmap-cell {
          border: 2px solid;
          border-radius: 8px;
          padding: 1rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .heatmap-cell:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        }

        .cell-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .industry-name {
          font-weight: 600;
          font-size: 1rem;
          color: #fff;
        }

        .risk-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.625rem;
          font-weight: 700;
          color: #fff;
        }

        .cell-stats {
          display: flex;
          gap: 1rem;
        }

        .stat {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #8b92a7;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
        }

        .stat-value.highlight {
          color: #00d4ff;
        }

        .heatmap-legend {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #1e2740;
        }

        .legend-label {
          font-size: 0.875rem;
          color: #8b92a7;
          font-weight: 600;
        }

        .legend-items {
          display: flex;
          gap: 1rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #8b92a7;
        }

        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .heatmap-empty {
          text-align: center;
          padding: 3rem;
          color: #8b92a7;
        }
      `}</style>
    </div>
  );
}
