'use client'

import { useState } from 'react'

export default function Home() {
  const [url, setUrl] = useState('')
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runAudit = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:3001/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      })
      setReport(await res.json())
    } catch (error) {
      console.error('Audit failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#202222] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-[#20B8CD] to-[#2DD4BF] bg-clip-text text-transparent">
            Infinity Soul AIS
          </h1>
          <p className="text-[#9BA3AF] text-lg">
            AI Insurance System v1.1 - Comprehensive Risk Audit Platform
          </p>
        </div>

        {/* Input Section */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-[#9BA3AF] mb-3">
            AI System URL
          </label>
          <div className="flex gap-3">
            <input 
              type="text"
              className="flex-1 bg-[#2C2D2D] border border-[#3A3B3B] rounded-lg px-4 py-3 text-white placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#20B8CD] focus:border-transparent transition-all" 
              placeholder="https://example.com/ai-system" 
              value={url} 
              onChange={e => setUrl(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && !loading && runAudit()}
            />
            <button 
              className="bg-gradient-to-r from-[#20B8CD] to-[#2DD4BF] text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              onClick={runAudit}
              disabled={loading || !url}
            >
              {loading ? 'Analyzing...' : 'Run Audit'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {report && (
          <div className="bg-[#2C2D2D] border border-[#3A3B3B] rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-[#20B8CD]">
              Audit Report
            </h2>
            <div className="space-y-4">
              {/* Insurance Readiness Score */}
              <div className="bg-[#202222] rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2 text-[#2DD4BF]">
                  Insurance Readiness
                </h3>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-white">
                    {report.insuranceReadiness?.overall || 0}
                  </div>
                  <div>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      report.insuranceReadiness?.riskTier === 'LOW' ? 'bg-green-500/20 text-green-400' :
                      report.insuranceReadiness?.riskTier === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {report.insuranceReadiness?.riskTier || 'N/A'}
                    </div>
                    <p className="text-[#9BA3AF] text-sm mt-1">
                      {report.insuranceReadiness?.eligibleForCyber ? '✓ Eligible for Cyber Insurance' : '✗ Not eligible yet'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Full JSON Report */}
              <details className="bg-[#202222] rounded-lg p-4">
                <summary className="cursor-pointer text-[#9BA3AF] hover:text-white transition-colors">
                  View Full Report (JSON)
                </summary>
                <pre className="mt-4 text-xs text-[#9BA3AF] overflow-x-auto">
                  {JSON.stringify(report, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#2C2D2D] border border-[#3A3B3B] rounded-lg p-4">
            <div className="text-[#20B8CD] font-semibold mb-2">Module A-E</div>
            <div className="text-[#9BA3AF] text-sm">Complete AI risk assessment across 5 dimensions</div>
          </div>
          <div className="bg-[#2C2D2D] border border-[#3A3B3B] rounded-lg p-4">
            <div className="text-[#2DD4BF] font-semibold mb-2">Evidence Vault</div>
            <div className="text-[#9BA3AF] text-sm">Immutable audit trail with Supabase</div>
          </div>
          <div className="bg-[#2C2D2D] border border-[#3A3B3B] rounded-lg p-4">
            <div className="text-[#20B8CD] font-semibold mb-2">NIST Compliant</div>
            <div className="text-[#9BA3AF] text-sm">Aligned with AI Risk Management Framework</div>
          </div>
        </div>
      </div>
    </div>
  )
}
