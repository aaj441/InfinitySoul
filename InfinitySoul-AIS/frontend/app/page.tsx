'use client'
import { useState } from 'react'

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const runAudit = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:3001/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      const data = await res.json()
      setReport(data)
    } catch (error) {
      console.error('Audit failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-500/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-white">
            Infinity Soul AIS v1.2
          </h1>
          <p className="text-purple-300 mt-1">
            AI Insurance System Risk Assessment Platform
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Input Section */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30">
            <label className="block text-white text-sm font-medium mb-3">
              AI System URL or Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter AI system URL to audit..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && url && runAudit()}
              disabled={loading}
            />
            <button
              onClick={runAudit}
              disabled={loading || !url}
              className="mt-4 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              {loading ? 'Running Comprehensive Audit...' : 'Run Risk Audit'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {report && (
          <div className="max-w-6xl mx-auto">
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {['overview', 'modules', 'compliance', 'scoring'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-purple-300 hover:bg-white/20'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Audit Overview
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 rounded-xl p-6">
                      <div className="text-purple-300 text-sm font-medium mb-2">
                        Overall Score
                      </div>
                      <div className="text-4xl font-bold text-white">
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
                      <div className="text-purple-300 text-sm font-medium mb-2">
                        Vault ID
                      </div>
                      <div className="text-lg font-mono text-white truncate">
                        {report.vaultId}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-6">
                      <div className="text-purple-300 text-sm font-medium mb-2">
                        Timestamp
                      </div>
                      <div className="text-sm text-white">
                        {new Date(report.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'modules' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Module Results
                  </h2>
                  <div className="space-y-4">
                    {Object.entries(report.modules).map(([key, value]: [string, any]) => (
                      <div key={key} className="bg-white/5 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-3">
                          Module {key.toUpperCase()}
                        </h3>
                        <pre className="text-purple-300 text-sm overflow-auto">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'compliance' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    NIST Compliance Status
                  </h2>
                  {report.modules?.nist && (
                    <div className="space-y-4">
                      {Object.entries(report.modules.nist).map(([key, value]) => (
                        <div key={key} className="bg-white/5 rounded-xl p-6">
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
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Insurance Readiness Scoring
                  </h2>
                  {report.insuranceReadiness && (
                    <div className="space-y-6">
                      <div className="bg-white/5 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-purple-300">Overall Score</span>
                          <span className="text-2xl font-bold text-white">
                            {report.insuranceReadiness.overall}/100
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${report.insuranceReadiness.overall}%` }}
                          />
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-6">
                        <div className="text-purple-300 mb-2">Risk Tier</div>
                        <div className="text-2xl font-bold text-white">
                          {report.insuranceReadiness.riskTier}
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-6">
                        <div className="text-purple-300 mb-2">
                          Cyber Insurance Eligibility
                        </div>
                        <div className="text-xl font-semibold text-white">
                          {report.insuranceReadiness.eligibleForCyber ? '✅ Eligible' : '❌ Not Eligible'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
