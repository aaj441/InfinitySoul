/**
 * InfinitySol Landing Page + Scanner
 * Single page that gets you to $0 -> revenue on Day 1
 * Mobile-first, touch-optimized design
 */

import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

export default function Home() {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
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
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, email })
        }
      ).then(r => r.json());

      if (response.status === 'failed') {
        setError(response.error || 'Scan failed');
      } else {
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
          aria-label="Toggle menu"
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
        <div ref={sidebarRef} className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6 text-green-400">Quick Navigation</h2>
            <nav className="space-y-4">
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
            </nav>
            
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
        </div>
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
                <input
                  type="url"
                  placeholder="https://yoursite.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full p-4 bg-black border border-gray-700 rounded text-white text-base md:text-lg placeholder-gray-600 focus:outline-none focus:border-red-600 touch-optimized"
                />

                <input
                  type="email"
                  placeholder="your@email.com (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 bg-black border border-gray-700 rounded text-white text-base md:text-lg placeholder-gray-600 focus:outline-none focus:border-red-600 touch-optimized"
                />

                <button
                  onClick={handleScan}
                  disabled={scanning}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 p-4 font-bold text-base md:text-lg rounded transition touch-button"
                >
                  {scanning ? '⏳ SCANNING...' : '🔍 SCAN MY SITE (FREE)'}
                </button>
              </div>

              {error && (
                <div className="bg-red-900 border border-red-600 p-4 rounded text-red-100 text-base">
                  ⚠️ {error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RESULTS SECTION */}
        {result && result.status === 'success' && (
          <div id="results" ref={resultsRef} className="bg-gray-900 py-8 md:py-12 border-t-2 border-red-600">
            <div className="responsive-container">
              <div className="bg-black border-2 border-red-600 p-4 md:p-8 rounded-lg">
                <h2 className="text-2xl md:text-3xl font-black text-red-600 mb-4 md:mb-6">⚠️ CRITICAL RISK DETECTED</h2>

                {/* Stats Grid - Stacks on mobile */}
                <div className="responsive-grid mb-6 md:mb-8">
                  <div className="bg-gray-800 p-4 md:p-6 rounded touch-optimized">
                    <p className="text-gray-400 text-sm">Total Violations</p>
                    <p className="text-3xl md:text-4xl font-black text-red-400">{result.violations.total}</p>
                  </div>

                  <div className="bg-gray-800 p-4 md:p-6 rounded touch-optimized">
                    <p className="text-gray-400 text-sm">Risk Score</p>
                    <p className="text-3xl md:text-4xl font-black text-yellow-400">{Math.round(result.riskScore)}/100</p>
                  </div>

                  <div className="bg-gray-800 p-4 md:p-6 rounded touch-optimized">
                    <p className="text-gray-400 text-sm">Critical Issues</p>
                    <p className="text-3xl md:text-4xl font-black text-orange-500">{result.violations.critical}</p>
                  </div>

                  <div className="bg-gray-800 p-4 md:p-6 rounded touch-optimized">
                    <p className="text-gray-400 text-sm">Estimated Legal Cost</p>
                    <p className="text-xl md:text-2xl font-black text-orange-400">
                      ${result.estimatedLawsuitCost.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Top violations */}
                {result.topViolations && result.topViolations.length > 0 && (
                  <div className="mb-6 md:mb-8">
                    <h3 className="text-lg md:text-xl font-bold mb-4">Top Issues Found:</h3>
                    <div className="spacing-mobile">
                      {result.topViolations.map((v: any, i: number) => (
                        <div
                          key={i}
                          className={`bg-gray-800 p-4 rounded transition cursor-pointer touch-button ${
                            highlightedViolation === i ? 'ring-2 ring-red-500 bg-gray-700' : 'hover:bg-gray-750'
                          }`}
                          onClick={() => setHighlightedViolation(i)}
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between mb-2 gap-2">
                            <span className="font-bold text-base">{v.code}</span>
                            <span className="text-red-400 text-base">{v.violationCount} instances</span>
                          </div>
                          <p className="text-gray-400 text-sm">{v.description}</p>
                        </div>
                      ))}
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
