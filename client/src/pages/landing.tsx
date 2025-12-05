import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, Link } from "wouter";
import { FounderStoryHero, TrialsAndPainPoints, TheMovement, ResilienceMessage } from "@/components/founder-story";
import { LegalFooter } from "@/components/legal-footer";
import { FreemiumBanner } from "@/components/freemium-banner";
import HeroScanner from "@/components/hero-scanner";

function Infinity8Logo({ className = "" }: { className?: string }) {
  return (
    <img 
      src="/brand/infinity8-logo.svg" 
      alt="Infinity 8 Consulting Services" 
      className={className}
    />
  );
}

export default function Landing() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
            {/* Professional Header with Logo */}
            <header className="bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-gray-800 py-4 px-4">
              <div className="max-w-6xl mx-auto flex items-center justify-between">
                <Infinity8Logo className="h-12 w-auto" />
                <nav className="flex gap-4">
                  <Button variant="ghost" onClick={() => navigate("/scanner")}>Scanner</Button>
                  <Button variant="ghost" onClick={() => navigate("/pricing")}>Pricing</Button>
                  <Button onClick={() => navigate("/intake")}>Get Started</Button>
                </nav>
              </div>
            </header>

      {/* Urgency Banner */}
      <div className="bg-red-600 dark:bg-red-700 text-white py-3 px-4 text-center font-bold">
        <div className="max-w-6xl mx-auto">
          ⚠️ EUROPEAN ACCESSIBILITY ACT 2025 DEADLINE: <span id="countdown" className="bg-white/20 px-3 py-1 rounded-full">186 DAYS</span> REMAINING
        </div>
      </div>

      {/* Founder Story Hero */}
      <FounderStoryHero />

      {/* Unified Integration: Hero Scanner (WCAGAI Engine) */}
      <section className="bg-white dark:bg-slate-950 py-12">
        <HeroScanner />
      </section>

      {/* Trials and Breakthroughs */}
      <TrialsAndPainPoints />

      {/* Hero Section - Reframed */}
      <section className="bg-gradient-to-r from-[#5A1A1A] to-[#8B3A3A] text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
                    <div className="mb-8 flex justify-center">
                      <Infinity8Logo className="h-20 w-auto filter brightness-0 invert" />
                    </div>
          <h1 className="text-5xl font-bold mb-6">Accessibility Autopilot</h1>
          <p className="text-2xl mb-6 opacity-90">The Platform. Built for SMB Business Owners.</p>
          <p className="text-2xl font-bold mb-8">Avoid $25K+ ADA Lawsuits While Ranking Higher on Google</p>
          <p className="text-xl mb-8 opacity-90">In 48 hours, not 6 months.</p>
          <p className="text-xs italic mb-4 opacity-75">
            ⓘ Multi-LLM audit. Continuous monitoring. Real fixes. <Link href="/accessibility-statement"><a className="underline hover:opacity-100">Transparency</a></Link>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold text-lg px-8 py-6"
              onClick={() => navigate("/scanner")}
              data-testid="button-start-free-scan"
            >
              Scan Your Site Free
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white/20 font-semibold text-lg px-8 py-6"
              onClick={() => navigate("/autopilot")}
              data-testid="button-learn-autopilot"
            >
              How It Works
            </Button>
          </div>
          <p className="text-sm mt-4 opacity-80">✅ HIPAA-Compliant ✅ GDPR-Safe ✅ Results in 48 Hours</p>
        </div>
      </section>

      {/* Freemium Pricing Banner */}
      <section className="py-8 px-4 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-6xl mx-auto">
          <FreemiumBanner />
        </div>
      </section>

      {/* Why This Matters */}
      <section className="py-16 px-4 bg-slate-100 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-center mb-12">Why This Matters: Beyond Compliance</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-6">The Human Cost</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p><strong>1 in 4 Americans</strong> have disabilities</p>
                <p><strong>99% of websites</strong> have accessibility failures</p>
                <p><strong>$21% unemployment rate</strong> for people with disabilities (vs. 3.8% general)</p>
                <p className="text-sm italic pt-4 text-gray-600 dark:text-gray-400">
                  Digital exclusion isn't a compliance issue—it's a barrier to work, dignity, and belonging.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6">Our Approach</h3>
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                  <p className="font-bold mb-1">Not Compliance Theater</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">1,023 lawsuits in 2024 against accessibility overlays. We build real audits.</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                  <p className="font-bold mb-1">Consultant-Enabled</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">We're not competition. We make you 10x more powerful.</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                  <p className="font-bold mb-1">Privacy-First</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Customer data never cross-referenced. Trust is everything.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Crisis */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">The Compliance Crisis is Real</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-6">Current Industry Benchmarks</h3>
              
              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg mb-4 shadow">
                <p className="font-bold mb-3">Healthcare Industry</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                  <div className="bg-green-500 h-full w-[26%]"></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Only 26% WCAG Compliant • 202M Monthly Visits at Risk</p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
                <p className="font-bold mb-3">Fintech Industry</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                  <div className="bg-blue-500 h-full w-[69%]"></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Only 69% WCAG Compliant • Regulatory Action Imminent</p>
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-slate-800 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-8 text-center">EAA 2025 Impact</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">80M+</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Websites Affected</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-red-600 dark:text-red-400">€50K</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Per Fine</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">June 28</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">2025 Deadline</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">71:1</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">LTV:CAC Ratio</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">AI-Powered Compliance Solution</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 text-lg mb-12">
            Get EAA 2025 compliant in 2 minutes with our HIPAA-safe AI remediation engine
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-2xl">🔍 Discovery Scan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">Automated WCAG compliance audit with AI-powered issue detection</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">FREE</p>
                <Button 
                  className="w-full"
                  onClick={() => navigate("/scanner")}
                  data-testid="button-start-discovery-scan"
                >
                  Start Free Scan
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-blue-600">
              <CardHeader>
                <CardTitle className="text-2xl">🚀 Professional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">Continuous monitoring + AI remediation credits + priority support</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">$299/mo</p>
                <Button 
                  className="w-full"
                  onClick={() => navigate("/pricing")}
                  data-testid="button-get-started-pro"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-2xl">⚡ Enterprise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">Unlimited sites + custom AI prompts + white-glove support</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">$999/mo</p>
                <Button 
                  variant="outline"
                  className="w-full"
                  data-testid="button-contact-sales"
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section - With Story Hooks */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why WCAGAI Works</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="text-xl font-bold mb-2">✅ Real WCAG Audits</h3>
                <p className="text-gray-600 dark:text-gray-400">Axe-core powered scanning, not JavaScript overlays. 98% accuracy.</p>
                <p className="text-sm italic text-amber-600 dark:text-amber-400 mt-2">"Like my dad's tools, built by people who understand the work."</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="text-xl font-bold mb-2">✅ AI-Powered Fixes</h3>
                <p className="text-gray-600 dark:text-gray-400">Claude + GPT-4 generate remediation suggestions at €0.50 per issue.</p>
                <p className="text-sm italic text-amber-600 dark:text-amber-400 mt-2">"Crafted like a real consultant would. We're augmenting, not automating."</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="text-xl font-bold mb-2">✅ Consultant-Ready</h3>
                <p className="text-gray-600 dark:text-gray-400">White-label reports + expert dashboard. 10x faster audits.</p>
                <p className="text-sm italic text-amber-600 dark:text-amber-400 mt-2">"Built for people who care about accessibility most."</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="text-xl font-bold mb-2">✅ Privacy First</h3>
                <p className="text-gray-600 dark:text-gray-400">HIPAA-compliant. GDPR-safe. Customer data never cross-referenced.</p>
                <p className="text-sm italic text-amber-600 dark:text-amber-400 mt-2">"Trust is the foundation of real accessibility."</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="text-xl font-bold mb-2">✅ Industry Intelligence</h3>
                <p className="text-gray-600 dark:text-gray-400">20 vertical profiles with lawsuit data, compliance frameworks, urgency triggers.</p>
                <p className="text-sm italic text-amber-600 dark:text-amber-400 mt-2">"Built by people who understand YOUR industry."</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                <h3 className="text-xl font-bold mb-2">✅ Lawsuit Risk Free</h3>
                <p className="text-gray-600 dark:text-gray-400">Consultant enablement model. Invisible to plaintiffs. Zero lawsuit risk.</p>
                <p className="text-sm italic text-amber-600 dark:text-amber-400 mt-2">"Real accessibility removes the legal risk entirely."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Movement */}
      <TheMovement />

      {/* Resilience Message */}
      <ResilienceMessage />

      {/* Infinity8 Teaser */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto text-center text-white space-y-6">
          <h2 className="text-3xl font-bold">Meet Infinity8</h2>
          <p className="text-lg text-gray-300">
            The team behind WCAGAI uses it to prove what they can build for you. 2-week sprints. Real products. Your IP.
          </p>
          <Button
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-purple-900"
            onClick={() => navigate("/infinity8")}
            data-testid="button-learn-infinity8"
          >
            Learn About Infinity8 →
          </Button>
        </div>
      </section>

      {/* CTA Footer - Reframed */}
      <section className="py-12 px-4 bg-blue-600 dark:bg-blue-900 text-white text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl font-bold">Ready to Build Real Accessibility?</h2>
          <p className="text-lg opacity-90">
            Start your free WCAG compliance scan today. No credit card required.
          </p>
          <p className="text-sm italic opacity-80">
            Every line of code that passes accessibility checks is one more person who gets to belong online.
          </p>
          <Button 
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
            onClick={() => navigate("/scanner")}
            data-testid="button-cta-start-scan"
          >
            Start Free Scan Now
          </Button>
        </div>
      </section>

      {/* Legal Footer */}
      <LegalFooter />

      <script>
        {`
          const deadline = new Date('2025-06-28');
          function updateCountdown() {
            const now = new Date();
            const diff = deadline - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const elem = document.getElementById('countdown');
            if (elem) elem.textContent = days + ' DAYS';
          }
          updateCountdown();
          setInterval(updateCountdown, 60000);
        `}
      </script>
    </div>
  );
}
