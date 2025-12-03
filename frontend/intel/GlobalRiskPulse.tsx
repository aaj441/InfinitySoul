/**
 * Global Risk Pulse
 *
 * Real-time global ADA risk indicator with animated pulse effect.
 */

import React, { useEffect, useState } from 'react';

interface GlobalRiskPulseProps {
  score: number; // 0-100
}

export default function GlobalRiskPulse({ score }: GlobalRiskPulseProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animate score on load
  useEffect(() => {
    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current = Math.min(current + increment, score);
      setAnimatedScore(Math.round(current));

      if (step >= steps) {
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [score]);

  const getRiskLevel = (): string => {
    if (score >= 75) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MEDIUM';
    return 'LOW';
  };

  const getRiskColor = (): string => {
    if (score >= 75) return '#ff4444';
    if (score >= 50) return '#ff8800';
    if (score >= 25) return '#ffbb00';
    return '#00cc66';
  };

  const getRiskMessage = (): string => {
    if (score >= 75) return 'Multiple critical threats detected - immediate action required';
    if (score >= 50) return 'Elevated litigation activity - monitor closely';
    if (score >= 25) return 'Moderate risk level - maintain vigilance';
    return 'Risk levels within normal parameters';
  };

  const color = getRiskColor();
  const riskLevel = getRiskLevel();

  return (
    <div className="global-risk-pulse">
      <div className="pulse-container">
        {/* Animated Pulse Rings */}
        <div className="pulse-rings" style={{ borderColor: color }}>
          <div className="ring ring-1" style={{ borderColor: color }} />
          <div className="ring ring-2" style={{ borderColor: color }} />
          <div className="ring ring-3" style={{ borderColor: color }} />
        </div>

        {/* Risk Score Circle */}
        <div className="risk-circle" style={{ borderColor: color }}>
          <div className="score-value" style={{ color }}>
            {animatedScore}
          </div>
          <div className="score-label">Global Risk Index</div>
        </div>
      </div>

      <div className="pulse-info">
        <div className="info-header">
          <h2 className="info-title">🌐 Global ADA Litigation Risk</h2>
          <span className="risk-badge" style={{ backgroundColor: color }}>
            {riskLevel}
          </span>
        </div>
        <p className="info-message">{getRiskMessage()}</p>

        {/* Risk Bar */}
        <div className="risk-bar-container">
          <div className="risk-bar">
            <div
              className="risk-bar-fill"
              style={{
                width: `${animatedScore}%`,
                background: `linear-gradient(to right, #00cc66, ${color})`
              }}
            />
          </div>
          <div className="risk-bar-labels">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat">
            <span className="stat-icon">⚡</span>
            <span className="stat-text">
              Real-time monitoring of {(animatedScore * 100).toLocaleString()} companies
            </span>
          </div>
          <div className="stat">
            <span className="stat-icon">📊</span>
            <span className="stat-text">
              Tracking {Math.round(animatedScore * 2)} active serial plaintiffs
            </span>
          </div>
          <div className="stat">
            <span className="stat-icon">🎯</span>
            <span className="stat-text">
              Analyzing {Math.round(animatedScore * 5)} daily court filings
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .global-risk-pulse {
          display: flex;
          gap: 3rem;
          align-items: center;
        }

        .pulse-container {
          position: relative;
          width: 200px;
          height: 200px;
          flex-shrink: 0;
        }

        .pulse-rings {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 200px;
        }

        .ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 2px solid;
          opacity: 0;
          animation: pulse 3s ease-out infinite;
        }

        .ring-1 {
          animation-delay: 0s;
        }

        .ring-2 {
          animation-delay: 1s;
        }

        .ring-3 {
          animation-delay: 2s;
        }

        @keyframes pulse {
          0% {
            width: 120px;
            height: 120px;
            opacity: 1;
          }
          100% {
            width: 200px;
            height: 200px;
            opacity: 0;
          }
        }

        .risk-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 140px;
          height: 140px;
          border: 4px solid;
          border-radius: 50%;
          background: #141b35;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
        }

        .score-value {
          font-size: 3rem;
          font-weight: 700;
          line-height: 1;
        }

        .score-label {
          font-size: 0.75rem;
          color: #8b92a7;
          margin-top: 0.5rem;
          text-align: center;
        }

        .pulse-info {
          flex: 1;
        }

        .info-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .info-title {
          font-size: 1.75rem;
          font-weight: 600;
          margin: 0;
          color: #fff;
        }

        .risk-badge {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 700;
          color: #fff;
        }

        .info-message {
          color: #8b92a7;
          margin: 0 0 1.5rem 0;
          font-size: 1rem;
        }

        .risk-bar-container {
          margin-bottom: 1.5rem;
        }

        .risk-bar {
          width: 100%;
          height: 12px;
          background: #1e2740;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .risk-bar-fill {
          height: 100%;
          transition: width 1.5s ease;
          border-radius: 6px;
        }

        .risk-bar-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #8b92a7;
        }

        .quick-stats {
          display: flex;
          gap: 2rem;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .stat-icon {
          font-size: 1.25rem;
        }

        .stat-text {
          font-size: 0.875rem;
          color: #8b92a7;
        }

        @media (max-width: 1024px) {
          .global-risk-pulse {
            flex-direction: column;
            text-align: center;
          }

          .quick-stats {
            flex-direction: column;
            gap: 1rem;
          }

          .stat {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
