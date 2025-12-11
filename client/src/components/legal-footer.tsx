import { Link } from "wouter";

export function LegalFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-400 text-sm border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-white mb-4">WCAGAI</h3>
            <p className="text-xs text-gray-500">
              Real WCAG audits. AI-assisted. Consultant-enabled.
            </p>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-white mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms">
                  <a className="hover:text-white transition-colors" data-testid="link-terms">
                    Terms of Service
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/accessibility-statement">
                  <a className="hover:text-white transition-colors" data-testid="link-accessibility">
                    Accessibility Statement
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Disclaimers */}
          <div>
            <h4 className="font-bold text-white mb-3">Important</h4>
            <ul className="space-y-2 text-xs space-y-3">
              <li>
                <span className="font-semibold">AI-Assisted:</span> All recommendations require human validation
              </li>
              <li>
                <span className="font-semibold">Not Legal Advice:</span> Consult attorneys for compliance matters
              </li>
              <li>
                <span className="font-semibold">Ongoing Process:</span> Accessibility requires continuous monitoring
              </li>
            </ul>
          </div>

          {/* Compliance */}
          <div>
            <h4 className="font-bold text-white mb-3">Standards</h4>
            <ul className="space-y-2 text-xs space-y-3">
              <li>WCAG 2.2 AA</li>
              <li>ADA Compliant</li>
              <li>EAA 2025 Ready</li>
              <li>EN 301 549</li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="border-t border-gray-800 pt-6 mt-6">
          <p className="text-xs text-gray-500 mb-4">
            <span className="font-semibold text-yellow-600">DISCLAIMER:</span> WCAGAI provides AI-assisted accessibility auditing and advisory support. 
            We make no representations or warranties that our service will result in full compliance with WCAG or any accessibility standard. 
            The service is provided "as is." Automated testing detects only 20-40% of accessibility issues. 
            Your compliance responsibilities remain unchanged. Consult with legal counsel for legal matters. 
            For complete terms, see our <Link href="/terms"><a className="text-blue-400 hover:text-blue-300">Terms of Service</a></Link>.
          </p>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-6 mt-6 text-center text-xs text-gray-600">
          <p>&copy; {currentYear} WCAGAI Platform. All rights reserved. | Real accessibility. No theater.</p>
        </div>
      </div>
    </footer>
  );
}
