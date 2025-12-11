import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, Link } from "wouter";
import { Code2, Zap, Rocket, GitBranch, Target, TrendingUp } from "lucide-react";

export default function Infinity8() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950">
      {/* Header Navigation */}
      <header className="border-b border-purple-900/50 bg-slate-950/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/"><a className="text-xl font-bold text-purple-400 hover:text-purple-300">← WCAGAI</a></Link>
          <div className="text-white font-bold">Infinity8</div>
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => navigate("/")}
            data-testid="button-back-to-wcagai"
          >
            Back
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-block px-4 py-2 bg-purple-900/30 border border-purple-700/50 rounded-full">
            <span className="text-sm text-purple-300">Product-Led AI Consulting</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold">
            We Don't Talk About AI.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              We Build It.
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Every engagement ships a product. Every project becomes a case study. 
            Meet WCAGAI—the $2.5K/mo AI platform we built to prove what we can build for you in 2 weeks.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg"
              className="bg-purple-600 hover:bg-purple-700"
              data-testid="button-schedule-sprint"
            >
              Schedule 2-Week Sprint
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-purple-600 text-purple-400 hover:bg-purple-900/20"
              onClick={() => navigate("/")}
              data-testid="button-see-proof"
            >
              See Proof: WCAGAI
            </Button>
          </div>
        </div>
      </section>

      {/* The Problem: Red Ocean */}
      <section className="py-16 px-4 bg-red-950/10 border-y border-red-900/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Why AI Consulting Fails</h2>
          <div className="grid md:grid-cols-3 gap-6 text-white">
            <Card className="bg-red-900/20 border-red-800">
              <CardHeader>
                <CardTitle className="text-red-400">6-Month Sales Cycle</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">RFP, budget approvals, procurement. By the time you sign, market has moved.</p>
              </CardContent>
            </Card>

            <Card className="bg-red-900/20 border-red-800">
              <CardHeader>
                <CardTitle className="text-red-400">Generic Consultants</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">"We do fintech, healthcare, SaaS..." = expert in nothing specific.</p>
              </CardContent>
            </Card>

            <Card className="bg-red-900/20 border-red-800">
              <CardHeader>
                <CardTitle className="text-red-400">Black Box Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">$120K spend → PowerPoint deck. No code. No asset you can deploy.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* The Blue Ocean: Infinity8 */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Our Model: Product-Led Consulting</h2>
          
          <div className="space-y-6">
            {/* Principle 1 */}
            <Card className="bg-slate-800/50 border-purple-600/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-300">
                  <Code2 className="w-6 h-6" />
                  Build Real Products
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-300">
                <p>
                  <strong>What we don't do:</strong> Strategy decks, recommendations, frameworks.
                </p>
                <p>
                  <strong>What we do:</strong> Ship code you can deploy, sell, or integrate.
                </p>
                <p className="text-sm text-purple-400">
                  Example: WCAGAI started as client project. Now it's $2.5K/mo product solving a market problem.
                </p>
              </CardContent>
            </Card>

            {/* Principle 2 */}
            <Card className="bg-slate-800/50 border-purple-600/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-300">
                  <Zap className="w-6 h-6" />
                  2-Week Sprints, Not 6-Month Engagements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-300">
                <p>
                  <strong>Fixed scope:</strong> $50K, 2 weeks, one vertical, one outcome.
                </p>
                <p>
                  <strong>You own the code:</strong> Full Git history, deployment instructions, your IP.
                </p>
                <p className="text-sm text-purple-400">
                  Result: 12x faster delivery, lower risk, immediate ROI.
                </p>
              </CardContent>
            </Card>

            {/* Principle 3 */}
            <Card className="bg-slate-800/50 border-purple-600/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-300">
                  <Target className="w-6 h-6" />
                  Vertical Mastery, Not Generalism
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-300">
                <p>
                  <strong>Our focus:</strong> Fintech (AI + compliance), then Healthcare, then Education.
                </p>
                <p>
                  <strong>Your benefit:</strong> We understand your industry's exact problems.
                </p>
                <p className="text-sm text-purple-400">
                  See: WCAGAI's fintech compliance profiles, built from real lending + trading platforms.
                </p>
              </CardContent>
            </Card>

            {/* Principle 4 */}
            <Card className="bg-slate-800/50 border-purple-600/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-300">
                  <GitBranch className="w-6 h-6" />
                  Build in Public
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-300">
                <p>
                  <strong>Transparency:</strong> GitHub repos, weekly updates, challenges visible.
                </p>
                <p>
                  <strong>No surprises:</strong> You see exactly what you're paying for as it's built.
                </p>
                <p className="text-sm text-purple-400">
                  Result: You have input, we have accountability, everyone ships faster.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Case Study: WCAGAI */}
      <section className="py-16 px-4 bg-purple-900/20 border-y border-purple-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Case Study: WCAGAI</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4 text-gray-300">
              <h3 className="text-xl font-bold text-purple-300">The Project</h3>
              <p>Accessibility compliance platform for fintech & healthcare. 2-week sprint to MVP.</p>
              
              <h3 className="text-xl font-bold text-purple-300 pt-4">The Outcome</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>$2.5K/mo product (now $10K+/mo revenue)</li>
                <li>50+ consulting customers using WCAGAI</li>
                <li>Infinite8 → WCAGAI licensing agreements ($5K/customer)</li>
                <li>Proof of AI product expertise in market</li>
              </ul>

              <p className="pt-4 text-sm text-purple-400">
                <strong>Translation:</strong> 2-week sprint → $50K engagement → $120K/year recurring revenue.
              </p>
            </div>

            <div className="space-y-4 bg-slate-900/50 p-6 rounded-lg border border-purple-800/30">
              <h3 className="text-xl font-bold text-purple-300">What You Get</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Rocket className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-white">Shipped Product</p>
                    <p className="text-sm text-gray-400">Not a deck. Code you can deploy.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <TrendingUp className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-white">Revenue Potential</p>
                    <p className="text-sm text-gray-400">Product becomes recurring revenue stream.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <GitBranch className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-white">Your IP</p>
                    <p className="text-sm text-gray-400">Full Git history, deployment docs, you own it.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">What We Offer</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 border-purple-600/30">
              <CardHeader>
                <CardTitle className="text-purple-300">2-Week AI Sprint</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-300">
                <p className="text-2xl font-bold text-white">$50K</p>
                <ul className="space-y-2 text-sm">
                  <li>✅ Vertical-specific AI product</li>
                  <li>✅ Deployed & documented</li>
                  <li>✅ Your team trained</li>
                  <li>✅ Full source code included</li>
                </ul>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 mt-4">
                  Schedule Sprint
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-purple-600/30">
              <CardHeader>
                <CardTitle className="text-purple-300">Fractional AI PM</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-300">
                <p className="text-2xl font-bold text-white">$25K/mo</p>
                <ul className="space-y-2 text-sm">
                  <li>✅ Part-time AI strategy</li>
                  <li>✅ Roadmap & prioritization</li>
                  <li>✅ 2 sprint cycles/month</li>
                  <li>✅ No hiring overhead</li>
                </ul>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 mt-4">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-purple-600/30">
              <CardHeader>
                <CardTitle className="text-purple-300">Open-Source Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-300">
                <p className="text-2xl font-bold text-white">Free</p>
                <ul className="space-y-2 text-sm">
                  <li>✅ GitHub starter kits</li>
                  <li>✅ Architecture decisions</li>
                  <li>✅ Deployment guides</li>
                  <li>✅ Community support</li>
                </ul>
                <Button variant="outline" className="w-full border-purple-600 text-purple-400 hover:bg-purple-900/20 mt-4">
                  View GitHub
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center text-white space-y-4">
          <h2 className="text-3xl font-bold">Ready to Build AI Products?</h2>
          <p className="text-lg opacity-90">
            Let's start with a 2-week sprint. You'll have working code, we'll have your next proof.
          </p>
          <Button 
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-100 font-semibold"
            data-testid="button-schedule-call"
          >
            Schedule Conversation
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-900/50 bg-slate-950 py-8 px-4 text-center text-gray-500">
        <div className="max-w-4xl mx-auto">
          <p>Infinity8 • Product-Led AI Consulting • 2-Week Sprints • Real Code</p>
          <p className="text-sm mt-2">Built by the team behind WCAGAI</p>
        </div>
      </footer>
    </div>
  );
}
