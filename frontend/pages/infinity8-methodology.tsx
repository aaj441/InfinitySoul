/**
 * Infinity8 Methodology - Public Documentation
 * Transparency page showing exactly how Infinity8 Score is calculated
 * Published publicly so users understand what they're getting
 */

export default function Infinity8Methodology() {
  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* HEADER */}
        <h1 className="text-5xl font-black mb-4">Infinity8 Score Methodology</h1>
        <p className="text-xl text-gray-400 mb-12">
          How we calculate your accessibility compliance score (and what it means)
        </p>

        {/* CRITICAL DISCLAIMER */}
        <div className="bg-red-900 border-l-4 border-red-500 p-6 mb-12 rounded">
          <h2 className="text-2xl font-bold text-red-100 mb-3">⚠️ What This Score IS NOT</h2>
          <ul className="text-red-100 space-y-2 text-lg">
            <li>❌ NOT a credit score (FCRA does not apply)</li>
            <li>❌ NOT a legal opinion or compliance guarantee</li>
            <li>❌ NOT a prediction of whether you will be sued</li>
            <li>❌ NOT a substitute for expert manual review</li>
            <li>❌ NOT a guarantee of ADA compliance</li>
          </ul>
        </div>

        {/* WHAT IT IS */}
        <div className="bg-gray-900 border border-gray-700 p-8 mb-12 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">✅ What This Score IS</h2>
          <p className="text-gray-300 text-lg mb-6">
            A technical assessment (0-1000) that combines automated scanning results with public litigation data
            to estimate your website's accessibility maturity and relative risk profile.
          </p>
          <div className="space-y-4">
            <p className="text-gray-400">
              <strong className="text-white">Think of it like:</strong> A starting point for conversation,
              not a final judgment. Use it to benchmark yourself, track progress, and prioritize remediation.
            </p>
          </div>
        </div>

        {/* SCORE COMPONENTS */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Score Components (Breakdown)</h2>

          <div className="space-y-6">
            {/* Component 1 */}
            <div className="bg-gray-900 p-8 rounded-lg border border-gray-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold">1. WCAG Compliance</h3>
                  <p className="text-gray-400">Automated WCAG 2.2 AA scanning</p>
                </div>
                <span className="text-3xl font-black text-red-400">30%</span>
              </div>

              <div className="bg-black p-4 rounded border border-gray-700 mb-4">
                <p className="font-mono text-sm text-gray-300">
                  Score = (Violations Found / Total Possible) × 100
                </p>
              </div>

              <div className="space-y-2 text-gray-300">
                <p>
                  <strong>How it works:</strong> We run axe-core on your website and detect WCAG violations.
                </p>
                <p>
                  <strong>What we detect:</strong> Missing alt text, keyboard traps, color contrast failures,
                  form labels, button names, heading order, focus management.
                </p>
                <p className="text-yellow-300 bg-yellow-900 bg-opacity-20 p-3 rounded">
                  <strong>⚠️ Limitation:</strong> Automated tools detect ~40% of real accessibility issues.
                  We miss context-dependent violations, semantic issues, and user experience problems that require manual review.
                </p>
              </div>
            </div>

            {/* Component 2 */}
            <div className="bg-gray-900 p-8 rounded-lg border border-gray-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold">2. Litigation Risk</h3>
                  <p className="text-gray-400">Based on comparable public lawsuits</p>
                </div>
                <span className="text-3xl font-black text-orange-400">25%</span>
              </div>

              <div className="bg-black p-4 rounded border border-gray-700 mb-4">
                <p className="font-mono text-sm text-gray-300">
                  Risk = (Violation Frequency in Lawsuits / 100)
                </p>
              </div>

              <div className="space-y-2 text-gray-300">
                <p>
                  <strong>How it works:</strong> We analyze public court filings (PACER, CourtListener)
                  to see which WCAG violations appear most often in accessibility lawsuits.
                </p>
                <p>
                  <strong>Example:</strong> "Image alt text" violations appear in 92% of lawsuits.
                  "Keyboard traps" in 81%. Color contrast failures in 71%.
                </p>
                <p className="text-yellow-300 bg-yellow-900 bg-opacity-20 p-3 rounded">
                  <strong>⚠️ Limitation:</strong> This does NOT predict if YOU will be sued.
                  It shows historical patterns, not individual outcomes.
                </p>
              </div>
            </div>

            {/* Component 3 */}
            <div className="bg-gray-900 p-8 rounded-lg border border-gray-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold">3. Remediation Velocity</h3>
                  <p className="text-gray-400">How fast you're fixing issues</p>
                </div>
                <span className="text-3xl font-black text-blue-400">20%</span>
              </div>

              <div className="bg-black p-4 rounded border border-gray-700 mb-4">
                <p className="font-mono text-sm text-gray-300">
                  Velocity = (Current Score - Previous Score) / Months
                </p>
              </div>

              <div className="space-y-2 text-gray-300">
                <p>
                  <strong>How it works:</strong> We compare your score month-over-month to see if you're
                  improving (fixing issues) or degrading (adding violations).
                </p>
                <p>
                  <strong>What it rewards:</strong> Commitment to accessibility. A trending-up score
                  is more important than a high absolute score.
                </p>
                <p className="text-yellow-300 bg-yellow-900 bg-opacity-20 p-3 rounded">
                  <strong>⚠️ New sites:</strong> Default to neutral (50) since we have no historical data.
                </p>
              </div>
            </div>

            {/* Component 4 */}
            <div className="bg-gray-900 p-8 rounded-lg border border-gray-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold">4. Industry Benchmark</h3>
                  <p className="text-gray-400">How you compare to peers</p>
                </div>
                <span className="text-3xl font-black text-green-400">15%</span>
              </div>

              <div className="bg-black p-4 rounded border border-gray-700 mb-4">
                <p className="font-mono text-sm text-gray-300">
                  Percentile = (Your Violations - Avg) / Std Dev
                </p>
              </div>

              <div className="space-y-2 text-gray-300">
                <p>
                  <strong>How it works:</strong> We anonymously aggregate compliance data across your industry
                  and show where you rank.
                </p>
                <p>
                  <strong>Example:</strong> If e-commerce sites average 35 violations and you have 23,
                  you rank in the top 25%.
                </p>
                <p className="text-yellow-300 bg-yellow-900 bg-opacity-20 p-3 rounded">
                  <strong>⚠️ Anonymized only:</strong> We never publish individual company names.
                  Data is fully aggregated.
                </p>
              </div>
            </div>

            {/* Component 5 */}
            <div className="bg-gray-900 p-8 rounded-lg border border-gray-800">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold">5. Third-Party Validation</h3>
                  <p className="text-gray-400">Expert review boost</p>
                </div>
                <span className="text-3xl font-black text-purple-400">10%</span>
              </div>

              <div className="bg-black p-4 rounded border border-gray-700 mb-4">
                <p className="font-mono text-sm text-gray-300">
                  Validation = Manual review exists? +10 points
                </p>
              </div>

              <div className="space-y-2 text-gray-300">
                <p>
                  <strong>How it works:</strong> If you've had a certified accessibility auditor review your site,
                  we boost your score to reflect higher confidence.
                </p>
                <p>
                  <strong>Why it matters:</strong> Automated scans catch ~40% of issues. Expert validation proves
                  you've gone deeper.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* WHAT WE CAN'T DETECT */}
        <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 p-8 mb-12 rounded-lg">
          <h2 className="text-2xl font-bold mb-6 text-yellow-100">⚠️ What Automated Tools CAN'T Detect (Critical Gaps)</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-yellow-100 mb-3">Context-Dependent Issues</h3>
              <ul className="text-yellow-100 text-sm space-y-1">
                <li>• Is alt text actually descriptive?</li>
                <li>• Are images purely decorative?</li>
                <li>• Does heading hierarchy make sense?</li>
                <li>• Is focus order logical?</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-yellow-100 mb-3">User Experience Issues</h3>
              <ul className="text-yellow-100 text-sm space-y-1">
                <li>• How fast can screen readers navigate?</li>
                <li>• Are animations too fast for people with vestibular disorders?</li>
                <li>• Is the site understandable for people with cognitive disabilities?</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-yellow-100 mb-3">Temporal Issues</h3>
              <ul className="text-yellow-100 text-sm space-y-1">
                <li>• Do modals have sufficient time limits?</li>
                <li>• Can users pause auto-play content?</li>
                <li>• Are timeouts long enough for assistive tech users?</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-yellow-100 mb-3">Semantic Issues</h3>
              <ul className="text-yellow-100 text-sm space-y-1">
                <li>• Is table markup semantically correct?</li>
                <li>• Are form associations correct?</li>
                <li>• Is ARIA used appropriately?</li>
              </ul>
            </div>
          </div>
        </div>

        {/* HOW TO USE THIS SCORE */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8">How to Use Infinity8 Score</h2>

          <div className="space-y-6">
            <div className="bg-green-900 bg-opacity-30 border border-green-600 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-green-100 mb-3">✅ USE FOR (Good Decisions)</h3>
              <ul className="text-green-100 space-y-2">
                <li>• Benchmarking: "Where do we stand vs. competitors?"</li>
                <li>• Tracking Progress: "Are we improving month-over-month?"</li>
                <li>• Prioritization: "Which issues should we fix first?"</li>
                <li>• Communication: "Here's our accessibility maturity."</li>
                <li>• Conversation Starter: "Let's improve this together."</li>
              </ul>
            </div>

            <div className="bg-red-900 bg-opacity-30 border border-red-600 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-red-100 mb-3">❌ DON'T USE FOR (Bad Decisions)</h3>
              <ul className="text-red-100 space-y-2">
                <li>• Legal Decisions: "We're compliant, so we won't get sued"</li>
                <li>• Ignoring Manual Review: "The score says we're fine"</li>
                <li>• Trusting Completely: "This automated score is the final word"</li>
                <li>• Ignoring Expert Input: "The algorithm knows better than humans"</li>
                <li>• Lawsuit Prediction: "This score predicts we WILL be sued"</li>
              </ul>
            </div>
          </div>
        </div>

        {/* NEXT STEPS */}
        <div className="bg-gray-900 border border-gray-700 p-8 mb-12 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">What to Do With Your Infinity8 Score</h2>

          <ol className="space-y-4 text-gray-300">
            <li className="flex gap-4">
              <span className="text-red-500 font-black">1.</span>
              <div>
                <strong>Get the full audit report</strong><br/>
                See exactly which violations we found and why they matter
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-red-500 font-black">2.</span>
              <div>
                <strong>Hire a certified accessibility auditor</strong><br/>
                Have them review our findings and conduct manual testing (find WCAG WAI evaluators at <a href="https://www.w3.org/WAI/test-evaluate/" className="text-blue-400 underline">w3.org</a>)
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-red-500 font-black">3.</span>
              <div>
                <strong>Test with real disabled users</strong><br/>
                Use screen readers, keyboard navigation, voice control, etc. Real users catch issues automated tools miss
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-red-500 font-black">4.</span>
              <div>
                <strong>Consult an attorney</strong><br/>
                Get legal advice about your specific situation and obligations
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-red-500 font-black">5.</span>
              <div>
                <strong>Fix the high-impact violations first</strong><br/>
                Focus on violations that appear most in lawsuits (keyboard, alt text, form labels)
              </div>
            </li>
          </ol>
        </div>

        {/* TRANSPARENCY & UPDATES */}
        <div className="bg-blue-900 bg-opacity-30 border border-blue-600 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-blue-100 mb-4">📊 Transparency & Ongoing Updates</h2>

          <div className="space-y-4 text-blue-100">
            <p>
              <strong>Our Methodology is Open Source:</strong> We publish our scoring algorithm on GitHub so you can
              audit it yourself and suggest improvements.
            </p>
            <p>
              <strong>We Update Regularly:</strong> As WCAG standards evolve, litigation patterns change, and our tools
              improve, we update the methodology and notify all users.
            </p>
            <p>
              <strong>You Can Challenge Your Score:</strong> If you believe your score is inaccurate, contact us with
              evidence and we'll review it.
            </p>
            <p>
              <strong>Questions?</strong> Email us at <a href="mailto:support@infinitesol.com" className="text-blue-300 underline">support@infinitesol.com</a>
            </p>
          </div>
        </div>

        {/* FOOTER LINKS */}
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-500">
          <p className="mb-4">
            Want more details? See our full legal disclaimer at <a href="/legal" className="text-blue-400 underline">/legal</a>
          </p>
          <p className="text-xs">
            Last Updated: November 30, 2025
          </p>
        </div>
      </div>
    </div>
  );
}
