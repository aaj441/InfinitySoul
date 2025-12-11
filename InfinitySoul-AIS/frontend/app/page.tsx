'use client'
import { useState } from 'react'

/**
 * Type definitions for audit report structure
 */
interface AuditReport {
  url: string;
  timestamp: string;
  modules: {
    aiData: any;
    accessibility: any;
    security: any;
    stress: any;
    nist: any;
  };
  insuranceReadiness: {
    overall: number;
    riskTier: 'LOW' | 'MEDIUM' | 'HIGH';
    eligibleForCyber: boolean;
    eligibleForEO: boolean;
    eligibleForGL: boolean;
    breakdown: {
      ai: number;
      accessibility: number;
      security: number;
      stress: number;
      nist: number;
    };
  };
  vaultId: string;
}

type TabType = 'overview' | 'modules' | 'compliance' | 'scoring';

/**
 * Main application page - AI Insurance System audit interface.
 * Provides UI for running comprehensive AI risk audits and viewing results.
 */
export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<AuditReport | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [error, setError] = useState<string | null>(null)

  /**
   * Executes comprehensive AI risk audit.
   * Sends URL to backend API and displays results.
   */
  const runAudit = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true)
    setError(null)
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      })
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Audit failed. Please try again.');
      }
      
      const data = await response.json()
      setReport(data)
      setActiveTab('overview')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Audit failed:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handles keyboard shortcuts for better UX.
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && url) {
      runAudit();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-blue-500/20 backdrop-blur-sm" role="banner">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-white">
            Infinity Soul AIS v1.2
          </h1>
          <p className="text-blue-300 mt-1">
            AI Insurance System Risk Assessment Platform
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12" role="main">
        {/* Input Section */}
        <section className="max-w-3xl mx-auto mb-12" aria-labelledby="audit-form-heading">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-blue-500/30">
            <h2 id="audit-form-heading" className="sr-only">
              AI System Audit Form
            </h2>
            <label htmlFor="ai-system-url" className="block text-white text-sm font-medium mb-3">
              AI System URL or Name
            </label>
            <input
              id="ai-system-url"
              type="text"
              className="w-full px-4 py-3 bg-white/5 border border-blue-500/30 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter AI system URL to audit..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
              aria-label="AI system URL or name"
              aria-invalid={!!error}
              aria-describedby={error ? "audit-error" : undefined}
            />
            {error && (
              <p id="audit-error" className="mt-2 text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
            <button
              onClick={runAudit}
              disabled={loading || !url}
              className="mt-4 w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label={loading ? 'Running audit, please wait' : 'Run comprehensive AI risk audit'}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Running Comprehensive Audit...
                </span>
              ) : (
                'Run Risk Audit'
              )}
            </button>
          </div>
        </section>

        {/* Results Section */}
        {report && (
          <section className="max-w-6xl mx-auto" aria-labelledby="audit-results-heading">
            <h2 id="audit-results-heading" className="sr-only">
              Audit Results
            </h2>
            
            {/* Tabs */}
            <nav className="flex gap-2 mb-6" role="tablist" aria-label="Audit report sections">
              {(['overview', 'modules', 'compliance', 'scoring'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  role="tab"
                  aria-selected={activeTab === tab}
                  aria-controls={`${tab}-panel`}
                  id={`${tab}-tab`}
                  className={`px-6 py-3 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-blue-300 hover:bg-white/20'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>

            {/* Tab Content */}
            <article 
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-blue-500/30"
              role="tabpanel"
              id={`${activeTab}-panel`}
              aria-labelledby={`${activeTab}-tab`}
            >
              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">
                    Audit Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 rounded-xl p-6">
                      <div className="text-blue-300 text-sm font-medium mb-2">
                        Overall Score
                      </div>
                      <div className="text-4xl font-bold text-white" aria-label={`Overall score: ${report.insuranceReadiness?.overall || 'Not available'}`}>
                        {report.insuranceReadiness?.overall || 'N/A'}
                      </div>
                      <div className={`mt-2 text-sm font-medium ${
                        report.insuranceReadiness?.riskTier === 'LOW'
                          ? 'text-green-400'
                          : report.insuranceReadiness?.riskTier === 'MEDIUM'
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}>
                        Risk: {report.insuranceReadiness?.riskTier}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-6">
                      <div className="text-blue-300 text-sm font-medium mb-2">
                        Vault ID
                      </div>
                      <div className="text-lg font-mono text-white truncate" title={report.vaultId}>
                        {report.vaultId}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-6">
                      <div className="text-blue-300 text-sm font-medium mb-2">
                        Timestamp
                      </div>
                      <time className="text-sm text-white" dateTime={report.timestamp}>
                        {new Date(report.timestamp).toLocaleString()}
                      </time>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'modules' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">
                    Module Results
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(report.modules).map(([key, value]: [string, any]) => (
                      <details key={key} className="bg-white/5 rounded-xl p-6">
                        <summary className="text-lg font-semibold text-white mb-3 cursor-pointer hover:text-blue-300 transition-colors">
                          Module {key.toUpperCase()}
                        </summary>
                        <pre className="text-blue-300 text-sm overflow-auto mt-3 p-4 bg-black/20 rounded-lg">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      </details>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'compliance' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">
                    NIST Compliance Status
                  </h3>
                  {report.modules?.nist && (
                    <div className="space-y-4" role="list">
                      {Object.entries(report.modules.nist).map(([key, value]) => (
                        <div key={key} className="bg-white/5 rounded-xl p-6" role="listitem">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-medium capitalize">
                              {key}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              value === 'Complete'
                                ? 'bg-green-500/20 text-green-300'
                                : value === 'Partial'
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {String(value)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'scoring' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">
                    Insurance Readiness Scoring
                  </h3>
                  {report.insuranceReadiness && (
                    <div className="space-y-6">
                      <div className="bg-white/5 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-blue-300">Overall Score</span>
                          <span className="text-2xl font-bold text-white">
                            {report.insuranceReadiness.overall}/100
                          </span>
                        </div>
                        <div 
                          className="w-full bg-white/10 rounded-full h-3"
                          role="progressbar"
                          aria-valuenow={report.insuranceReadiness.overall}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Overall score: ${report.insuranceReadiness.overall} out of 100`}
                        >
                          <div
                            className="bg-gradient-to-r from-blue-600 to-cyan-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${report.insuranceReadiness.overall}%` }}
                          />
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-6">
                        <div className="text-blue-300 mb-2">Risk Tier</div>
                        <div className="text-2xl font-bold text-white">
                          {report.insuranceReadiness.riskTier}
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-6">
                        <div className="text-blue-300 mb-2">
                          Insurance Eligibility
                        </div>
                        <ul className="space-y-2">
                          <li className="flex items-center gap-2">
                            <span className="text-xl">{report.insuranceReadiness.eligibleForCyber ? '✅' : '❌'}</span>
                            <span className="text-white">Cyber Insurance</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-xl">{report.insuranceReadiness.eligibleForEO ? '✅' : '❌'}</span>
                            <span className="text-white">Errors & Omissions</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-xl">{report.insuranceReadiness.eligibleForGL ? '✅' : '❌'}</span>
                            <span className="text-white">General Liability</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </article>
          </section>
        )}
      </main>
    </div>
  )
}
