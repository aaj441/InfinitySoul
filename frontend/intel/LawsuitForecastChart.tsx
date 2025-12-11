/**
 * Lawsuit Forecast Chart
 *
 * Time series visualization of predicted lawsuit filings.
 */

import React from 'react';

interface ForecastData {
  timeSeriesData: Array<{
    date: Date;
    filingCount: number;
  }>;
  prediction: {
    next30Days: number;
    next90Days: number;
    next365Days: number;
  };
}

interface LawsuitForecastChartProps {
  forecast: ForecastData;
}

export default function LawsuitForecastChart({ forecast }: LawsuitForecastChartProps) {
  if (!forecast || !forecast.timeSeriesData || forecast.timeSeriesData.length === 0) {
    return (
      <div className="forecast-empty">
        <p>No forecast data available</p>
      </div>
    );
  }

  // Calculate max value for chart scaling
  const maxFilings = Math.max(...forecast.timeSeriesData.map(d => d.filingCount), 10);

  return (
    <div className="lawsuit-forecast">
      <h2 className="forecast-title">📈 Lawsuit Filing Forecast</h2>
      <p className="forecast-description">Historical trend and predictions</p>

      <div className="forecast-grid">
        {/* Time Series Chart */}
        <div className="chart-container">
          <div className="chart">
            {forecast.timeSeriesData.map((dataPoint, index) => {
              const height = (dataPoint.filingCount / maxFilings) * 100;
              const date = new Date(dataPoint.date);

              return (
                <div
                  key={index}
                  className="chart-bar"
                  style={{ height: `${height}%` }}
                  title={`${date.toLocaleDateString()}: ${dataPoint.filingCount} filings`}
                >
                  <div className="bar-fill" />
                </div>
              );
            })}
          </div>
          <div className="chart-axis">
            <span>Historical Filings</span>
            <span>{maxFilings} max</span>
          </div>
        </div>

        {/* Prediction Cards */}
        <div className="prediction-cards">
          <div className="prediction-card">
            <div className="card-icon">30d</div>
            <div className="card-content">
              <span className="card-label">Next 30 Days</span>
              <span className="card-value">{forecast.prediction.next30Days}</span>
              <span className="card-sublabel">predicted filings</span>
            </div>
          </div>

          <div className="prediction-card">
            <div className="card-icon">90d</div>
            <div className="card-content">
              <span className="card-label">Next 90 Days</span>
              <span className="card-value">{forecast.prediction.next90Days}</span>
              <span className="card-sublabel">predicted filings</span>
            </div>
          </div>

          <div className="prediction-card">
            <div className="card-icon">365d</div>
            <div className="card-content">
              <span className="card-label">Next 12 Months</span>
              <span className="card-value">{forecast.prediction.next365Days}</span>
              <span className="card-sublabel">predicted filings</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .lawsuit-forecast {
          width: 100%;
        }

        .forecast-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          color: #fff;
        }

        .forecast-description {
          color: #8b92a7;
          margin: 0 0 1.5rem 0;
          font-size: 0.875rem;
        }

        .forecast-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        .chart-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .chart {
          display: flex;
          align-items: flex-end;
          gap: 2px;
          height: 200px;
          padding: 1rem;
          background: #1e2740;
          border-radius: 8px;
        }

        .chart-bar {
          flex: 1;
          min-height: 4px;
          display: flex;
          align-items: flex-end;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .chart-bar:hover {
          opacity: 0.8;
        }

        .bar-fill {
          width: 100%;
          height: 100%;
          background: linear-gradient(to top, #00d4ff, #0084ff);
          border-radius: 2px 2px 0 0;
        }

        .chart-axis {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #8b92a7;
          padding: 0 1rem;
        }

        .prediction-cards {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .prediction-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #1e2740;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .prediction-card:hover {
          background: #252e4a;
          transform: translateY(-2px);
        }

        .card-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          background: linear-gradient(135deg, #00d4ff, #0084ff);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #fff;
          font-size: 0.875rem;
        }

        .card-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .card-label {
          font-size: 0.75rem;
          color: #8b92a7;
          margin-bottom: 0.25rem;
        }

        .card-value {
          font-size: 2rem;
          font-weight: 700;
          color: #00d4ff;
          line-height: 1;
        }

        .card-sublabel {
          font-size: 0.75rem;
          color: #8b92a7;
          margin-top: 0.25rem;
        }

        .forecast-empty {
          text-align: center;
          padding: 3rem;
          color: #8b92a7;
        }

        @media (max-width: 768px) {
          .forecast-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
