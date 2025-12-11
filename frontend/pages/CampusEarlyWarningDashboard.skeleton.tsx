/**
 * PHASE 7 SKELETON: Campus Early Warning Dashboard
 * ===============================================
 *
 * Visual surface for university administrators to:
 * - Monitor student cohort risk (retention threat)
 * - Identify students needing intervention
 * - Recommend support resources
 * - Track outcomes (for CSUDH / CSULB pilot narrative)
 *
 * Status: SKELETON - Ready for React component implementation
 */

import React, { useState, useEffect } from 'react';

/**
 * Student risk view (from campus early warning endpoint)
 */
interface StudentAtRisk {
  studentId: string;
  name: string;
  overallRisk: number; // 0-1
  emotionalVolatility: number;
  stabilityScore: number;
  mainRiskDrivers: string[];
  interventionRecommendations: string[];
  lastAssessed: Date;
}

/**
 * Cohort summary (aggregated)
 */
interface CohortSummary {
  totalStudents: number;
  flaggedStudents: number;
  averageRisk: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  topRiskDrivers: { driver: string; frequency: number }[];
  recommendations: string[];
}

/**
 * Main Campus Early Warning Dashboard Component
 *
 * TODO: Implement
 * 1. Create layout with header, cohort selector, main content
 * 2. Implement CohortSelector:
 *    - Dropdown for semester/year
 *    - Dropdown for college/major
 *    - Search by student name/ID
 * 3. Implement CohortSummaryPanel:
 *    - Display totalStudents, flaggedStudents, averageRisk
 *    - Show risk distribution as horizontal bar chart
 *    - Display top risk drivers as tag cloud
 * 4. Implement FlaggedStudentsTable:
 *    - Show name, student ID, overall risk (visual bar)
 *    - Show emotional volatility, stability score
 *    - Show main risk drivers (chips)
 *    - Show intervention recommendations (expandable)
 *    - Add action buttons: "Contact Student", "Add to Mentor Program", "View Full Profile"
 * 5. Implement RiskFactorsBreakdown:
 *    - Bar chart showing top drivers (emotional volatility, household instability, etc.)
 * 6. Implement InterventionTracker:
 *    - Log interventions performed
 *    - Track outcomes (improved, stable, deteriorated)
 *    - Show success rate
 */
export const CampusEarlyWarningDashboard: React.FC = () => {
  const [cohort, setCohort] = useState<StudentAtRisk[]>([]);
  const [cohortSummary, setCohortSummary] = useState<CohortSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('2025-Spring');
  const [selectedCollege, setSelectedCollege] = useState('All');

  // TODO: Implement useEffect to fetch /api/risk/campus-early-warning
  useEffect(() => {
    const fetchCohort = async () => {
      // 1. Call backend: POST /api/risk/campus-early-warning
      //    with mock student signals for selected semester/college
      // 2. Extract flaggedIndividuals and cohortSummary
      // 3. Format into StudentAtRisk[]
      // 4. setCohort() and setCohortSummary()
      // 5. setLoading(false)
    };

    fetchCohort();
  }, [selectedSemester, selectedCollege]);

  if (loading) {
    return <div>Loading student cohort...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>Campus Early Warning System</h1>
      <p style={{ color: '#666' }}>Identify students at risk of non-retention and recommend support</p>

      {/* Cohort Selector */}
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Select Cohort</h3>
        <div style={{ display: 'flex', gap: '20px' }}>
          {/* TODO: Implement semester selector */}
          <select value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)}>
            <option>2025-Spring</option>
            <option>2024-Fall</option>
            <option>2024-Spring</option>
          </select>

          {/* TODO: Implement college selector */}
          <select value={selectedCollege} onChange={e => setSelectedCollege(e.target.value)}>
            <option>All</option>
            <option>College of Arts & Sciences</option>
            <option>Business School</option>
            <option>Engineering</option>
          </select>
        </div>
      </div>

      {/* Cohort Summary Cards */}
      {cohortSummary && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <SummaryCard label="Total Students" value={cohortSummary.totalStudents} />
          <SummaryCard
            label="Flagged for Intervention"
            value={cohortSummary.flaggedStudents}
            warning={cohortSummary.flaggedStudents > 0}
          />
          <SummaryCard label="Avg Risk Level" value={`${(cohortSummary.averageRisk * 100).toFixed(1)}%`} />
          <SummaryCard label="Low Risk" value={cohortSummary.riskDistribution.low} />
        </div>
      )}

      {/* Risk Distribution Chart */}
      {cohortSummary && (
        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Risk Distribution</h3>
          {/* TODO: Render horizontal bar chart
            Low: {cohortSummary.riskDistribution.low} ({(cohortSummary.riskDistribution.low / cohortSummary.totalStudents * 100).toFixed(1)}%)
            Medium: {cohortSummary.riskDistribution.medium}
            High: {cohortSummary.riskDistribution.high}
          */}
        </div>
      )}

      {/* Top Risk Drivers */}
      {cohortSummary && cohortSummary.topRiskDrivers.length > 0 && (
        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Top Risk Drivers in Cohort</h3>
          {/* TODO: Render as tag cloud or list with frequency counts */}
          <ul>
            {/* cohortSummary.topRiskDrivers.map((driver) => <li>{driver.driver} ({driver.frequency})</li>) */}
          </ul>
        </div>
      )}

      {/* Flagged Students Table */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Students Flagged for Intervention ({cohort.length})</h2>
        {cohort.length === 0 ? (
          <p style={{ color: '#666', padding: '20px', textAlign: 'center' }}>
            No students flagged for intervention in this cohort.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Name</th>
                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>ID</th>
                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Risk Level</th>
                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Emotional Vol.</th>
                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Stability</th>
                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Top Drivers</th>
                <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* TODO: Map cohort to table rows
                For each student:
                - Show name, studentId
                - Show overallRisk as visual bar (red if > 0.7)
                - Show emotionalVolatility, stabilityScore as percentages
                - Show mainRiskDrivers as chips/tags
                - Add expand button to show interventionRecommendations
                - Add action buttons:
                  * "Contact Student" (opens email/message interface)
                  * "Add to Mentor Program" (logs intervention)
                  * "View Full Profile" (opens modal with all details)
              */}
            </tbody>
          </table>
        )}
      </div>

      {/* Intervention Recommendations */}
      {cohort.length > 0 && (
        <div style={{ padding: '20px', backgroundColor: '#e8f4f8', borderRadius: '8px' }}>
          <h3>Recommended Interventions</h3>
          {/* TODO: Aggregate recommendations from all flagged students
            Show consolidated list of "Refer to mental health", "Connect with financial aid", etc.
            Show count of students for which each recommendation applies
          */}
        </div>
      )}

      {/* Cohort-Level Recommendations */}
      {cohortSummary && cohortSummary.recommendations.length > 0 && (
        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#fff8e1', borderRadius: '8px' }}>
          <h3>Cohort-Level Recommendations</h3>
          <ul>
            {/* TODO: Map cohortSummary.recommendations to <li> */}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * Reusable SummaryCard component
 */
const SummaryCard: React.FC<{ label: string; value: string | number; warning?: boolean }> = ({
  label,
  value,
  warning = false,
}) => {
  return (
    <div
      style={{
        padding: '20px',
        border: `1px solid ${warning ? '#ff6b6b' : '#ddd'}`,
        borderRadius: '8px',
        textAlign: 'center',
        backgroundColor: warning ? '#ffe0e0' : '#fff',
      }}
    >
      <div style={{ fontSize: '14px', color: '#666' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '10px', color: warning ? '#d32f2f' : '#000' }}>
        {value}
      </div>
    </div>
  );
};

export default CampusEarlyWarningDashboard;
