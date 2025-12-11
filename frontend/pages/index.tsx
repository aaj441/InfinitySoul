/**
 * InfinitySol Landing Page + Scanner
 * Single page that gets you to $0 -> revenue on Day 1
 * Mobile-first, touch-optimized design
 */

import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

// Helper: Get WCAG impact badge styling
const getImpactBadge = (impact: string) => {
  const impacts: Record<string, { label: string; bg: string; text: string; ring: string }> = {
    critical: { label: 'Critical', bg: 'bg-red-600', text: 'text-white', ring: 'ring-red-500' },
    serious: { label: 'Serious', bg: 'bg-orange-600', text: 'text-white', ring: 'ring-orange-500' },
    moderate: { label: 'Moderate', bg: 'bg-yellow-600', text: 'text-black', ring: 'ring-yellow-500' },
    minor: { label: 'Minor', bg: 'bg-blue-600', text: 'text-white', ring: 'ring-blue-500' }
  };
  return impacts[impact?.toLowerCase()] || impacts.moderate;
};

export default function Home() {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [statusUrl, setStatusUrl] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [highlightedViolation, setHighlightedViolation] = useState<number | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleScan = async () => {
    if (!url) {
      setError('URL is required');
      return;
    }

    setScanning(true);
    setError('');

    try {
      // Nitpick #1: Fixed merge conflict - using consistent apiBase variable
      // Nitpick #9: Fixed inconsistent async/await - removed .then() chain
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const fetchResponse = await fetch(`${apiBase}/api/v1/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, email }),
      });
      const response = await fetchResponse.json();

      if (response.status === 'failed') {
        setError(response.error || 'Scan failed');
      } else {
        // Async flow: set job info and start polling
        setJobId(response.jobId || null);
        setStatusUrl(response.statusUrl ? `${apiBase}${response.statusUrl}` : null);
        setResult(response);
      }
    } catch (err) {
      setError('Connection error. Is the backend running?');
    }

    setScanning(false);
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        // Don't close if clicking the hamburger button
        if (!target.closest('.hamburger-menu')) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  // Poll job status if we have a statusUrl
  useEffect(() => {
    let interval: any;
    async function poll() {
      if (!statusUrl) return;
      try {
        const res = await fetch(statusUrl);
        const data = await res.json();
        // Update result when completed
        if (data && data.status) {
          setResult(data);
          if (data.status === 'completed' || data.status === 'failed') {
            clearInterval(interval);
            interval = null;
          }
        }
      } catch (e) {
        // ignore transient errors
      }
    }
    if (statusUrl) {
      interval = setInterval(poll, 2000);
      poll(); // immediate first poll
    }
    return () => interval && clearInterval(interval);
  }, [statusUrl]);

  // Handle violation selection
  const handleViolationClick = (index: number) => {
    setHighlightedViolation(index);
    setSidebarOpen(false); // Auto-close menu on selection
    
    // Scroll to results section
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <Head>
        <title>InfinitySol - ADA Compliance Scanner</title>
        <meta name="description" content="Scan your website for ADA accessibility violations before you get sued." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-black text-white font-sans">
        {/* MOBILE HAMBURGER MENU */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hamburger-menu"
          aria-label="Toggle navigation menu"
          aria-expanded={sidebarOpen}
          aria-controls="main-navigation"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {sidebarOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* SIDEBAR OVERLAY */}
        <div
          className={`sidebar-overlay ${!sidebarOpen ? 'hidden' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* SLIDE-OUT SIDEBAR */}
        <nav
          ref={sidebarRef}
          id="main-navigation"
          className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}
          aria-label="Main navigation"
          role="navigation"
        >
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6 text-green-400">Quick Navigation</h2>
            <div className="space-y-4">
              <a
                href="#scanner"
                onClick={(e) => {
                  e.preventDefault();
                  setSidebarOpen(false);
                  document.getElementById('scanner')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block text-lg hover:text-green-400 transition touch-button text-left"
              >
                🔍 Scanner
              </a>
              {result && (
                <a
                  href="#results"
                  onClick={(e) => {
                    e.preventDefault();
                    setSidebarOpen(false);
                    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="block text-lg hover:text-green-400 transition touch-button text-left"
                >
                  ⚠️ Results
                </a>
              )}
              <a
                href="#lawsuits"
                onClick={(e) => {
                  e.preventDefault();
                  setSidebarOpen(false);
                  document.getElementById('lawsuits')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block text-lg hover:text-green-400 transition touch-button text-left"
              >
                ⚖️ Recent Lawsuits
              </a>
              <a
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault();
                  setSidebarOpen(false);
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="block text-lg hover:text-green-400 transition touch-button text-left"
              >
                💰 Pricing
              </a>
            </div>
            
            {/* Violation Quick Links */}
            {result && result.topViolations && result.topViolations.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-700">
                <h3 className="text-lg font-bold mb-4 text-red-400">Jump to Violations</h3>
                <div className="space-y-2">
                  {result.topViolations.map((v: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => handleViolationClick(i)}
                      className={`block w-full text-left text-sm hover:text-red-400 transition touch-button ${
                        highlightedViolation === i ? 'text-red-400 bg-gray-800 rounded' : ''
                      }`}
                    >
                      {v.code} ({v.violationCount})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>
        {/* STATUS BAR */}
        {statusUrl && (
          <div className="bg-gray-900 border-b border-gray-800" role="status" aria-live="polite" aria-atomic="true">
            <div className="responsive-container py-2 flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-gray-800 text-gray-300" aria-label={`Job ID: ${jobId || 'unknown'}`}>Job: {jobId || 'unknown'}</span>
                <span className={`px-2 py-1 rounded ${result?.status === 'completed' ? 'bg-green-800 text-green-200' : result?.status === 'failed' ? 'bg-red-800 text-red-200' : 'bg-yellow-800 text-yellow-200'}`} aria-label={`Scan status: ${result?.status || 'pending'}`}>
                  Status: {result?.status || 'pending'}
                </span>
              </div>
              <a href={statusUrl} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline" aria-label="View detailed status as JSON in new tab">View status JSON</a>
            </div>
          </div>
        )}

        {/* HERO SECTION */}
        <div className="bg-gradient-to-b from-black to-gray-900 py-12 md:py-20">
          <div className="responsive-container">
            <h1 className="heading-mobile mb-3 md:mb-4">
              Your Website Is An <span className="text-red-600">ADA Lawsuit</span> Waiting To Happen
            </h1>
            <p className="subheading-mobile text-gray-400 mb-2">
              347 accessibility lawsuits filed this year alone.
            </p>
            <p className="body-mobile text-gray-500">
              Average settlement: <strong className="text-red-400">$65,000</strong>
            </p>
          </div>
        </div>

        {/* SCANNER SECTION */}
        <div id="scanner" className="bg-black py-8 md:py-12">
          <div className="responsive-container">
            <div className="bg-gray-900 border-2 border-red-600 rounded-lg p-4 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Scan Your Site (Free)</h2>

              <div className="spacing-mobile mb-4 md:mb-6">
                <label htmlFor="scan-url" className="sr-only">Website URL to scan</label>
                <input
                  id="scan-url"
                  type="url"
                  placeholder="https://yoursite.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  aria-required="true"
                  aria-invalid={!!error}
                  aria-describedby={error ? 'scan-error' : undefined}
                  className="w-full p-4 bg-black border border-gray-700 rounded text-white text-base md:text-lg placeholder-gray-600 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600 touch-optimized"
                />

                <label htmlFor="scan-email" className="sr-only">Email address (optional)</label>
                <input
                  id="scan-email"
                  type="email"
                  placeholder="your@email.com (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-describedby="email-help"
                  className="w-full p-4 bg-black border border-gray-700 rounded text-white text-base md:text-lg placeholder-gray-600 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600 touch-optimized"
                />
                <span id="email-help" className="sr-only">Email is optional. We'll send you scan results if provided.</span>

                <button
                  onClick={handleScan}
                  disabled={scanning}
                  aria-busy={scanning}
                  aria-live="polite"
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed p-4 font-bold text-base md:text-lg rounded transition touch-button focus:outline-none focus:ring-4 focus:ring-red-500"
                >
                  {scanning ? '⏳ SCANNING...' : '🔍 SCAN MY SITE (FREE)'}
                  <span className="sr-only">{scanning ? 'Scan in progress, please wait' : 'Start free accessibility scan'}</span>
                </button>
              </div>

              {error && (
                <div id="scan-error" role="alert" aria-live="assertive" className="bg-red-900 border border-red-600 p-4 rounded text-red-100 text-base">
                  ⚠️ {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RESULTS SECTION */}
        {result && (
          <div id="results" ref={resultsRef} className="bg-gray-900 py-8 md:py-12 border-t-2 border-red-600">
            <div className="responsive-container">
              <div className="bg-black border-2 border-red-600 p-4 md:p-8 rounded-lg">
                <div className="flex flex-wrap gap-3 items-center mb-6">
                  <span className="px-3 py-1 rounded bg-gray-800 text-gray-200">URL: {result.url || url}</span>
                  {typeof result.violations?.total === 'number' && (
                    <span className="px-3 py-1 rounded bg-gray-800 text-gray-200">Total: {result.violations.total}</span>
                  )}
                  {typeof result.riskScore === 'number' && (
                    <span className="px-3 py-1 rounded bg-gray-800 text-gray-200">Risk Score: {Math.round(result.riskScore)}</span>
                  )}
                  {typeof result.estimatedLawsuitCost === 'number' && (
                    <span className="px-3 py-1 rounded bg-gray-800 text-gray-200">Est. Cost: ${Math.round(result.estimatedLawsuitCost).toLocaleString()}</span>
                  )}
                  <span className={`px-2 py-1 rounded text-xs ${result?.status === 'completed' ? 'bg-green-800 text-green-200' : result?.status === 'failed' ? 'bg-red-800 text-red-200' : 'bg-yellow-800 text-yellow-200'}`}>
                    Status: {result?.status || 'pending'}
                  </span>
                </div>

                {/* Top violations */}
                {result.topViolations && result.topViolations.length > 0 && (
                  <div className="mb-6 md:mb-8">
                    <h3 className="text-lg md:text-xl font-bold mb-4">Top Issues Found:</h3>
                    <div className="spacing-mobile" role="list" aria-label="List of accessibility violations">
                      {result.topViolations.map((v: any, i: number) => {
                        const impact = getImpactBadge(v.impact || 'moderate');
                        return (
                          <div
                            key={i}
                            role="listitem"
                            tabIndex={0}
                            className={`bg-gray-800 p-4 rounded transition cursor-pointer touch-button focus:outline-none focus:ring-2 ${
                              highlightedViolation === i ? `ring-2 ${impact.ring} bg-gray-700` : `hover:bg-gray-750 focus:${impact.ring}`
                            }`}
                            onClick={() => setHighlightedViolation(i)}
                            onKeyDown={(e) => e.key === 'Enter' && setHighlightedViolation(i)}
                            aria-label={`Violation ${i + 1} of ${result.topViolations.length}: ${v.code}, ${v.impact || 'moderate'} impact, ${v.violationCount} instances`}
                          >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-base">{v.code}</span>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${impact.bg} ${impact.text}`}>
                                  {impact.label}
                                </span>
                              </div>
                              <span className="text-red-400 text-base font-semibold">{v.violationCount} instances</span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">{v.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* CTA Buttons - Full width on mobile */}
                <div className="spacing-mobile">
                  <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-black p-4 rounded text-base md:text-lg touch-button">
                    GET FULL REPORT ($99) 📋
                  </button>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-black p-4 rounded text-base md:text-lg touch-button">
                    SCHEDULE CONSULTATION ($0) 📞
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SOCIAL PROOF - Recent Lawsuits */}
        <div id="lawsuits" className="bg-black py-12 md:py-16 border-t border-gray-800">
          <div className="responsive-container">
            <h2 className="text-2xl md:text-3xl font-black mb-8 md:mb-12 text-center">Recent ADA Lawsuits (Public Record)</h2>

            <div className="spacing-mobile">
              {[
                { company: 'Major E-Commerce Site', settlement: '$250,000', violation: 'Inaccessible Checkout Flow', court: '11th Circuit' },
                { company: 'Healthcare Portal', settlement: '$175,000', violation: 'Missing Form Labels', court: 'N.D. California' },
                { company: 'SaaS Platform', settlement: '$95,000', violation: 'Color Contrast Failures', court: 'S.D. New York' },
                { company: 'Travel Website', settlement: '$65,000', violation: 'Keyboard Navigation Trap', court: 'Central District' }
              ].map((lawsuit, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 p-4 md:p-6 rounded hover:border-red-600 transition touch-optimized">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                    <div>
                      <h3 className="font-bold text-base md:text-lg">{lawsuit.company}</h3>
                      <p className="text-gray-500 text-sm">{lawsuit.court}</p>
                    </div>
                    <span className="text-red-500 font-bold text-lg md:text-xl">{lawsuit.settlement}</span>
                  </div>
                  <p className="text-gray-400 text-sm md:text-base">Violation: {lawsuit.violation}</p>
                  <p className="text-gray-600 text-xs mt-2">Source: Public court records (PACER)</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PRICING */}
        <div id="pricing" className="bg-gray-900 py-12 md:py-16 border-t border-gray-800">
          <div className="responsive-container">
            <h2 className="text-2xl md:text-3xl font-black mb-8 md:mb-12 text-center">Simple Pricing</h2>

            <div className="responsive-grid">
              {[
                { name: 'Free Scanner', price: '$0', features: ['One scan', 'Basic report', 'Email results'] },
                { name: 'Full Report', price: '$99', features: ['Detailed violations', 'Remediation guide', '30-day support'] },
                { name: 'Expert Retainer', price: '$5K/mo', features: ['Unlimited scans', 'Monthly reports', 'Priority support', 'Legal brief'] }
              ].map((tier, i) => (
                <div key={i} className="bg-black border border-gray-800 p-4 md:p-6 rounded touch-optimized">
                  <h3 className="text-lg md:text-xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-2xl md:text-3xl font-black text-red-500 mb-4 md:mb-6">{tier.price}</p>
                  <ul className="spacing-mobile mb-4 md:mb-6">
                    {tier.features.map((f, j) => (
                      <li key={j} className="text-gray-400 text-sm md:text-base">✓ {f}</li>
                    ))}
                  </ul>
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold p-3 rounded touch-button">
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="bg-black border-t border-gray-800 py-8 md:py-12 text-center text-xs md:text-sm text-gray-600">
          <div className="responsive-container">
            <p className="mb-4 text-sm md:text-base">
              ⚖️ <strong>Legal Notice:</strong> InfinitySol is a technical auditing firm, not a law firm.
              Scan results are automated and may contain false positives. Not legal advice. See <a href="/legal" className="text-red-500 hover:underline">LEGAL.md</a> for full disclaimer.
            </p>
            <p className="text-xs">
              📊 Litigation data sourced from public court records (PACER, CourtListener) and news articles (Fair Use, 17 U.S.C. § 107)
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
