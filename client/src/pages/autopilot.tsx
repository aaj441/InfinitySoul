import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Cpu, Brain, Code2, DollarSign, BarChart3, Lock, Zap } from "lucide-react";

export default function Autopilot() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-full">
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Multi-LLM Architecture</span>
          </div>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white">
            Accessibility Autopilot
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Six specialized AI agents. One unified accessibility engine.
          </p>
          <p className="text-lg text-blue-600 dark:text-blue-400 font-semibold">
            Avoid $25K+ ADA lawsuits while ranking higher on Google. In 48 hours, not 6 months.
          </p>
        </div>

        {/* The Agents - Multi-LLM Orchestration */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">How The Architecture Works</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No single AI can solve accessibility. Our multi-LLM system routes each accessibility challenge to the specialist agent best equipped to solve it.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                agent: "WCAG Expert (GPT-4)",
                role: "Guideline Interpretation",
                power: "Understands every WCAG 2.2 criterion, applies context to your specific violations, understands precedent from recent lawsuits",
                icon: <Brain className="w-5 h-5" />,
              },
              {
                agent: "UI Analyzer (Claude-3)",
                role: "Design Pattern Recognition",
                power: "Sees your site the way users do. Detects color contrast failures, spacing issues, interaction patterns that hide accessibility problems",
                icon: <Cpu className="w-5 h-5" />,
              },
              {
                agent: "Fix Generator (Grok)",
                role: "Automated Remediation",
                power: "Writes actual HTML, CSS, JavaScript fixes. Not advice. Not recommendations. Real, production-ready code.",
                icon: <Code2 className="w-5 h-5" />,
              },
              {
                agent: "Business Translator (Llama-3)",
                role: "Plain English Impact",
                power: "Converts 'WCAG 1.4.3 color contrast violation' into 'Your red buttons are too dark. Colorblind users can't see them. You're losing customers.'",
                icon: <Zap className="w-5 h-5" />,
              },
              {
                agent: "Legal Analyst (GPT-4)",
                role: "Lawsuit Risk Assessment",
                power: "Cross-references recent ADA settlements, calculates your exposure based on industry and traffic, flags high-risk violations",
                icon: <Lock className="w-5 h-5" />,
              },
              {
                agent: "Orchestrator (Custom)",
                role: "Agent Coordination",
                power: "Routes violations to the right specialist, maintains context across the audit, synthesizes conclusions from all agents into one unified report",
                icon: <BarChart3 className="w-5 h-5" />,
              },
            ].map((item, i) => (
              <Card key={i} className="bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="text-blue-600 dark:text-blue-400">{item.icon}</div>
                    <div>
                      <p className="text-base">{item.agent}</p>
                      <p className="text-xs font-normal text-gray-500 dark:text-gray-400">{item.role}</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.power}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* The Magic Combination */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Why Multi-LLM Beats Single AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <p className="font-bold text-red-700 dark:text-red-400 mb-2">Single AI Problem</p>
                <ul className="text-sm text-red-600 dark:text-red-300 space-y-1">
                  <li>- Misses design patterns</li>
                  <li>- Over-estimates legal risk</li>
                  <li>- Generates unmaintainable code</li>
                  <li>- Creates false positives</li>
                  <li>- No business context</li>
                </ul>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <p className="font-bold text-green-700 dark:text-green-400 mb-2">Autopilot Solution</p>
                <ul className="text-sm text-green-600 dark:text-green-300 space-y-1">
                  <li>✓ 5 specialists seeing different angles</li>
                  <li>✓ Consensus scoring on confidence</li>
                  <li>✓ Production-ready fixes</li>
                  <li>✓ Context-aware prioritization</li>
                  <li>✓ Your actual liability, your way</li>
                </ul>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 pt-4">
              <strong>Result:</strong> 70% of your accessibility work gets automated. The 30% requiring human judgment gets flagged and explained. Your site gets fixed faster and stays fixed.
            </p>
          </CardContent>
        </Card>

        {/* Architecture Innovation */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Competitive Moat</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: BarChart3,
                title: "Data Flywheel",
                desc: "Every scan improves accuracy. 10,000 sites scanned = benchmark data competitors will never have.",
              },
              {
                icon: Lock,
                title: "Integration Lock",
                desc: "Your compliance history, automated workflows, custom rules live with us. Switching costs are astronomical.",
              },
              {
                icon: Zap,
                title: "Network Effects",
                desc: "Larger customer base = industry intelligence nobody else possesses. That intelligence gets fed back into the model.",
              },
            ].map((item, i) => (
              <Card key={i} className="bg-white dark:bg-slate-800">
                <CardContent className="pt-6 text-center space-y-3">
                  <item.icon className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto" />
                  <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Financial Reality */}
        <Card className="bg-slate-900 dark:bg-slate-950 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Economics That Win</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8 text-white">
              <div>
                <p className="text-sm text-slate-400 uppercase tracking-wide font-bold mb-4">Traditional Audit Model</p>
                <ul className="space-y-2 text-sm">
                  <li>CAC: $5,000 per customer</li>
                  <li>LTV: $25,000 per customer</li>
                  <li>LTV:CAC: 5:1 (barely profitable)</li>
                  <li>Margin: 40% (high overhead)</li>
                  <li>Timeline: 6 months to close</li>
                </ul>
              </div>
              <div>
                <p className="text-sm text-green-400 uppercase tracking-wide font-bold mb-4">WCAGAI Autopilot Model</p>
                <ul className="space-y-2 text-sm">
                  <li>CAC: $500 per customer</li>
                  <li>LTV: $10,800 per customer (3yr)</li>
                  <li>LTV:CAC: 22:1 (wildly profitable)</li>
                  <li>Margin: 85% (software flywheel)</li>
                  <li>Timeline: 48 hours to value</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
          <h2 className="text-3xl font-bold">See Multi-Agent Autopilot in Action</h2>
          <p className="text-lg">Watch six AI specialists work together to audit your site and generate fixes in 48 hours.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 font-bold"
              onClick={() => navigate("/scanner")}
              data-testid="button-scan-autopilot"
            >
              Start Free Scan
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/20"
              onClick={() => navigate("/local-business")}
              data-testid="button-learn-smb"
            >
              Built for Local Businesses
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
