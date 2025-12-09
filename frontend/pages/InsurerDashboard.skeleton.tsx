/**
 * PHASE 7 SKELETON: Insurer Dashboard
 * ===================================
 *
 * Visual surface for insurance underwriters to:
 * - View portfolio of policies
 * - See risk segmentation
 * - Adjust pricing
 * - Monitor claims likelihood
 *
 * Status: SKELETON - Ready for React component implementation
 */

import React, { useState, useEffect } from 'react';

/**
 * Expected API responses (from backend risk endpoints)
 */
interface PolicyView {
  policyId: string;
  holderName: string;
  riskScore: number;
  claimsLikelihood: number;
  adjustedPremium: number;
  baselinePremium: number;
  segment: 'preferred' | 'standard' | 'nonpreferred';
  mainRiskDrivers: string[];
}

interface PortfolioSummary {
  totalPolicies: number;
  averagePremium: number;
  riskDistribution: {
    preferred: number;
    standard: number;
    nonpreferred: number;
  };
  estimatedMixedLossRatio: number;
  recommendations: string[];
}

/**
 * Main Insurer Dashboard Component
 *
 * TODO: Implement
 * 1. Create layout with header, filters, main content area
 * 2. Implement PolicyTable showing:
 *    - Policy ID, holder name
 *    - Overall risk (0-1 visual bar)
 *    - Claims likelihood (%)
 *    - Adjusted vs baseline premium ($)
 *    - Segment badge (color-coded)
 *    - Main drivers (expandable detail)
 * 3. Implement SegmentationPanel showing:
 *    - Pie chart: Preferred / Standard / Nonpreferred %
 *    - Stats: count per segment, avg premium per segment
 * 4. Implement SummaryCard showing:
 *    - Total policies
 *    - Average premium
 *    - Estimated loss ratio
 *    - Recommendations list
 * 5. Add filters:
 *    - By segment (checkbox)
 *    - By risk range (slider)
 *    - By premium range (slider)
 * 6. Add actions:
 *    - Bulk export (CSV)
 *    - Bulk repricing
 *    - View individual policy details
 */
export const InsurerDashboard: React.FC = () => {
  const [policies, setPolicies] = useState<PolicyView[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    segments: ['preferred', 'standard', 'nonpreferred'],
    minRisk: 0,
    maxRisk: 1,
  });

  // TODO: Implement useEffect to fetch /api/risk/portfolio
  useEffect(() => {
    const fetchPortfolio = async () => {
      // 1. Call backend: POST /api/risk/portfolio with mock policies
      // 2. Extract analyses and portfolioSummary
      // 3. Format into PolicyView[]
      // 4. setPolicies() and setSummary()
      // 5. setLoading(false)
    };

    fetchPortfolio();
  }, []);

  if (loading) {
    return <div>Loading portfolio...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Insurer Portfolio Dashboard</h1>

      {/* Summary Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <SummaryCard label="Total Policies" value={summary.totalPolicies} />
          <SummaryCard label="Avg Premium" value={`$${summary.averagePremium.toFixed(2)}`} />
          <SummaryCard label="Loss Ratio" value={`${(summary.estimatedMixedLossRatio * 100).toFixed(1)}%`} />
        </div>
      )}

      {/* Segmentation Pie Chart */}
      {summary && (
        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h2>Risk Segmentation</h2>
          {/* TODO: Render pie chart
            - Preferred: {summary.riskDistribution.preferred}
            - Standard: {summary.riskDistribution.standard}
            - Nonpreferred: {summary.riskDistribution.nonpreferred}
            Use recharts or similar library
          */}
        </div>
      )}

      {/* Filters */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Filters</h3>
        {/* TODO: Implement checkboxes for segments */}
        {/* TODO: Implement sliders for risk and premium range */}
        <button onClick={() => setFilters({ segments: ['preferred', 'standard', 'nonpreferred'], minRisk: 0, maxRisk: 1 })}>
          Reset Filters
        </button>
      </div>

      {/* Policies Table */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Portfolio Policies</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Policy ID</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Holder</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Risk</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Claims %</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Premium</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Segment</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* TODO: Map policies to table rows
              For each policy:
              - Show policyId, holderName
              - Show riskScore as visual bar (0-1)
              - Show claimsLikelihood as percentage
              - Show adjustedPremium vs baselinePremium
              - Show segment badge (color: preferred=green, standard=yellow, nonpreferred=red)
              - Add expand button to show mainRiskDrivers
              - Add "View Details" button
            */}
            {policies.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                  No policies to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Recommendations */}
      {summary && summary.recommendations.length > 0 && (
        <div style={{ padding: '20px', backgroundColor: '#e8f4f8', borderRadius: '8px' }}>
          <h3>Recommendations</h3>
          <ul>
            {/* TODO: Map summary.recommendations to <li> */}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * Reusable SummaryCard component
 */
const SummaryCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => {
  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
      <div style={{ fontSize: '14px', color: '#666' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '10px' }}>{value}</div>
    </div>
  );
};

export default InsurerDashboard;
