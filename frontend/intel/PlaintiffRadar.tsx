/**
 * Plaintiff Radar
 *
 * Real-time tracking of serial ADA plaintiffs and their activity.
 */

import React from 'react';

interface PlaintiffData {
  name: string;
  totalFilings: number;
  recentActivity: {
    last30Days: number;
  };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  targetIndustries: string[];
}

interface PlaintiffRadarProps {
  plaintiffs: PlaintiffData[];
}

export default function PlaintiffRadar({ plaintiffs }: PlaintiffRadarProps) {
  if (!plaintiffs || plaintiffs.length === 0) {
    return (
      <div className="radar-empty">
        <p>No active plaintiffs detected</p>
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

  // Sort by recent activity
  const sortedPlaintiffs = [...plaintiffs].sort(
    (a, b) => b.recentActivity.last30Days - a.recentActivity.last30Days
  );

  return (
    <div className="plaintiff-radar">
      <h2 className="radar-title">🎯 Plaintiff Radar</h2>
      <p className="radar-description">Active serial plaintiffs</p>

      <div className="radar-list">
        {sortedPlaintiffs.slice(0, 10).map((plaintiff, index) => {
          const color = getRiskColor(plaintiff.riskLevel);

          return (
            <div key={index} className="plaintiff-card">
              <div className="plaintiff-header">
                <div className="plaintiff-rank" style={{ backgroundColor: color }}>
                  #{index + 1}
                </div>
                <div className="plaintiff-info">
                  <h3 className="plaintiff-name">{plaintiff.name}</h3>
                  <span className="plaintiff-badge" style={{ color }}>
                    {plaintiff.riskLevel.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="plaintiff-stats">
                <div className="stat-row">
                  <span className="stat-label">Total Filings:</span>
                  <span className="stat-value">{plaintiff.totalFilings}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Last 30 Days:</span>
                  <span className="stat-value highlight">{plaintiff.recentActivity.last30Days}</span>
                </div>
              </div>

              <div className="plaintiff-industries">
                <span className="industries-label">Target Industries:</span>
                <div className="industries-tags">
                  {plaintiff.targetIndustries.slice(0, 2).map((industry, i) => (
                    <span key={i} className="industry-tag">
                      {industry}
                    </span>
                  ))}
                  {plaintiff.targetIndustries.length > 2 && (
                    <span className="industry-tag more">
                      +{plaintiff.targetIndustries.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .plaintiff-radar {
          width: 100%;
        }

        .radar-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          color: #fff;
        }

        .radar-description {
          color: #8b92a7;
          margin: 0 0 1.5rem 0;
          font-size: 0.875rem;
        }

        .radar-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 600px;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .radar-list::-webkit-scrollbar {
          width: 6px;
        }

        .radar-list::-webkit-scrollbar-track {
          background: #1e2740;
          border-radius: 3px;
        }

        .radar-list::-webkit-scrollbar-thumb {
          background: #2a3654;
          border-radius: 3px;
        }

        .plaintiff-card {
          background: #1e2740;
          border-radius: 8px;
          padding: 1rem;
          transition: all 0.3s ease;
        }

        .plaintiff-card:hover {
          background: #252e4a;
          transform: translateX(4px);
        }

        .plaintiff-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .plaintiff-rank {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #fff;
          font-size: 0.875rem;
        }

        .plaintiff-info {
          flex: 1;
        }

        .plaintiff-name {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          color: #fff;
        }

        .plaintiff-badge {
          font-size: 0.75rem;
          font-weight: 600;
        }

        .plaintiff-stats {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: #141b35;
          border-radius: 4px;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #8b92a7;
        }

        .stat-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: #fff;
        }

        .stat-value.highlight {
          color: #00d4ff;
        }

        .plaintiff-industries {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .industries-label {
          font-size: 0.75rem;
          color: #8b92a7;
          font-weight: 600;
        }

        .industries-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .industry-tag {
          padding: 0.25rem 0.5rem;
          background: #141b35;
          border-radius: 4px;
          font-size: 0.75rem;
          color: #8b92a7;
        }

        .industry-tag.more {
          background: #2a3654;
          color: #00d4ff;
          font-weight: 600;
        }

        .radar-empty {
          text-align: center;
          padding: 3rem;
          color: #8b92a7;
        }
      `}</style>
    </div>
  );
}
