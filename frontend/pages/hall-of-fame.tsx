/**
 * Hall of Fame - Companies Leading in Accessibility
 *
 * Instead of "Hall of Shame" (naming non-compliant companies),
 * we feature companies doing accessibility RIGHT.
 *
 * This builds trust, celebrates progress, and avoids defamation risk.
 */

import Head from 'next/head';

export default function HallOfFame() {
  const leaders = [
    {
      company: 'Microsoft',
      initiative: 'Xbox Adaptive Controller',
      description: 'Designed gaming controllers for players with disabilities, expanding gaming accessibility industry-wide.',
      impact: 'Millions of players with disabilities now have accessible gaming options',
      year: '2018-present'
    },
    {
      company: 'Patagonia',
      initiative: 'Accessibility-First Design',
      description: 'Committed to WCAG 2.2 AAA compliance across their entire e-commerce platform.',
      impact: '100% accessible website, serving 61 million annual visitors',
      year: '2019-present'
    },
    {
      company: 'Slack',
      initiative: 'Keyboard-First Interface',
      description: 'Built entire communication platform with keyboard navigation as first-class feature, not afterthought.',
      impact: 'Employees with mobility disabilities can work productively without mouse dependency',
      year: '2013-present'
    },
    {
      company: 'Apple',
      initiative: 'VoiceOver Screen Reader',
      description: 'Invested in world-class screen reader technology bundled in every device.',
      impact: 'Set industry standard for accessibility technology; inspired competitors',
      year: '1997-present'
    },
    {
      company: 'GOV.UK',
      initiative: 'Digital Accessibility Standards',
      description: 'UK government mandated WCAG 2.2 AA compliance for all public websites and services.',
      impact: 'Over 500 government digital services now accessible to 11+ million citizens with disabilities',
      year: '2016-present'
    },
    {
      company: 'Target',
      initiative: 'Web Accessibility Settlement Compliance',
      description: 'After 2006 lawsuit, invested heavily in accessibility. Now industry leader in retail accessibility.',
      impact: '$6M+ investment demonstrates business case for accessibility',
      year: '2006-present'
    },
    {
      company: 'Netflix',
      initiative: 'Audio Descriptions & Captions',
      description: 'Provide audio descriptions for 90% of content and captions for 99% of content.',
      impact: 'Millions of deaf and blind subscribers can enjoy entertainment',
      year: '2014-present'
    },
    {
      company: 'Salesforce',
      initiative: 'Accessibility Champion Program',
      description: 'Employee-led initiative to audit and fix accessibility issues throughout the platform.',
      impact: 'Industry-leading CRM accessibility for users with disabilities',
      year: '2015-present'
    }
  ];

  const categories = [
    {
      name: 'Government & Public Sector',
      description: 'Setting accessibility standards for all citizens',
      examples: ['GOV.UK', 'US Access Board', 'EU Digital Accessibility Act']
    },
    {
      name: 'Technology Leaders',
      description: 'Building accessibility into core products',
      examples: ['Apple', 'Microsoft', 'Slack', 'Salesforce']
    },
    {
      name: 'Commerce & Retail',
      description: 'Making e-commerce accessible to all shoppers',
      examples: ['Target', 'Patagonia', 'Zappos', 'Best Buy']
    },
    {
      name: 'Media & Entertainment',
      description: 'Creating accessible content for all audiences',
      examples: ['Netflix', 'BBC', 'Disney+', 'Amazon Prime Video']
    }
  ];

  return (
    <>
      <Head>
        <title>Hall of Fame - InfinitySol Accessibility Leaders</title>
        <meta name="description" content="Companies leading in accessibility. Learn from organizations doing digital accessibility right." />
      </Head>

      <div className="min-h-screen bg-black text-white font-sans">
        {/* HEADER */}
        <div className="bg-gradient-to-b from-black to-gray-900 py-20">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-6xl font-black mb-4 leading-tight">
              Accessibility <span className="text-green-500">Hall of Fame</span>
            </h1>
            <p className="text-2xl text-gray-400 mb-4">
              Companies leading the way in digital accessibility
            </p>
            <p className="text-xl text-gray-500">
              These organizations show that accessibility is good business, not just legal compliance.
            </p>
          </div>
        </div>

        {/* PHILOSOPHY SECTION */}
        <div className="bg-gray-900 py-12 border-t border-gray-800">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-green-900 border-l-4 border-green-500 p-6 rounded">
              <p className="text-green-100 text-lg mb-3">
                <strong>🎯 Why We Celebrate Success</strong>
              </p>
              <p className="text-green-100 mb-3">
                Instead of focusing on failures and lawsuits, we highlight the companies and initiatives proving that accessible technology is:
              </p>
              <ul className="text-green-100 space-y-2">
                <li>✅ <strong>Profitable</strong> - Accessibility expands market, reduces support costs, improves retention</li>
                <li>✅ <strong>Innovative</strong> - Accessibility drives innovation (curb cuts, autocomplete, voice commands all came from accessibility)</li>
                <li>✅ <strong>Ethical</strong> - The right thing to do for 1.3 billion people with disabilities globally</li>
                <li>✅ <strong>Defensible</strong> - Companies with strong accessibility records face fewer lawsuits</li>
              </ul>
            </div>
          </div>
        </div>

        {/* LEADERS GRID */}
        <div className="bg-black py-16 border-t border-gray-800">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-black mb-12 text-center">Industry Leaders</h2>

            <div className="space-y-6 mb-12">
              {leaders.map((leader, i) => (
                <div key={i} className="bg-gray-900 border border-green-500/30 p-8 rounded hover:border-green-500 transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-green-400 mb-1">{leader.company}</h3>
                      <p className="text-lg font-semibold text-white mb-2">{leader.initiative}</p>
                      <p className="text-sm text-gray-400">{leader.year}</p>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-3">{leader.description}</p>

                  <div className="bg-black border border-green-500/20 p-4 rounded">
                    <p className="text-green-400 text-sm">
                      <strong>Impact:</strong> {leader.impact}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="bg-gray-900 py-16 border-t border-gray-800">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-black mb-12 text-center">Where to Find Leaders</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((cat, i) => (
                <div key={i} className="bg-black border border-gray-800 p-6 rounded hover:border-green-500 transition">
                  <h3 className="text-xl font-bold mb-2 text-green-400">{cat.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{cat.description}</p>
                  <ul className="space-y-1">
                    {cat.examples.map((ex, j) => (
                      <li key={j} className="text-gray-300 text-sm">✓ {ex}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KEY INSIGHTS */}
        <div className="bg-black py-16 border-t border-gray-800">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-black mb-12 text-center">What Makes a Accessibility Leader</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 p-6 rounded">
                <h3 className="text-lg font-bold mb-3 text-green-400">🎯 Long-Term Commitment</h3>
                <p className="text-gray-400">
                  Leaders don't treat accessibility as a one-time fix. They invest continuously over years and decades.
                </p>
              </div>

              <div className="bg-gray-900 p-6 rounded">
                <h3 className="text-lg font-bold mb-3 text-green-400">🔍 Transparent Methodology</h3>
                <p className="text-gray-400">
                  They publish standards, share approaches, and welcome independent auditing.
                </p>
              </div>

              <div className="bg-gray-900 p-6 rounded">
                <h3 className="text-lg font-bold mb-3 text-green-400">💼 Cross-Functional Teams</h3>
                <p className="text-gray-400">
                  Accessibility isn't just IT. It involves design, product, legal, and customer service.
                </p>
              </div>

              <div className="bg-gray-900 p-6 rounded">
                <h3 className="text-lg font-bold mb-3 text-green-400">🎧 User Involvement</h3>
                <p className="text-gray-400">
                  They hire users with disabilities and listen to their feedback directly.
                </p>
              </div>

              <div className="bg-gray-900 p-6 rounded">
                <h3 className="text-lg font-bold mb-3 text-green-400">📊 Measurement</h3>
                <p className="text-gray-400">
                  They track accessibility metrics, test regularly, and iterate based on data.
                </p>
              </div>

              <div className="bg-gray-900 p-6 rounded">
                <h3 className="text-lg font-bold mb-3 text-green-400">🤝 Industry Leadership</h3>
                <p className="text-gray-400">
                  They share what they've learned, raising accessibility standards for everyone.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-green-900 py-16 border-t border-gray-800">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-black mb-6">Ready to Join These Leaders?</h2>
            <p className="text-lg text-green-100 mb-8">
              Start with a free accessibility scan to see where you stand, then build your accessibility leadership journey.
            </p>
            <a
              href="/"
              className="inline-block bg-white text-green-900 font-black px-8 py-4 rounded hover:bg-gray-100 transition text-lg"
            >
              Scan Your Website →
            </a>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="bg-black border-t border-gray-800 py-12 text-center text-sm text-gray-600">
          <div className="max-w-4xl mx-auto px-6">
            <p className="mb-2">
              Have an accessibility success story? Email us at stories@infinitesol.com
            </p>
            <p className="text-xs">
              All companies and initiatives featured are based on publicly available information. Hall of Fame focuses on celebrating progress, not ranking perfection.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
