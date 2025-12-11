import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Check, X, ArrowRight, Zap, Users, Sparkles } from "lucide-react";

/**
 * REVENUE STRATEGY:
 * 
 * Tier 1 (Basic/$2.5K/mo): Show VALUE immediately
 * - Scanning works, basic reporting works, violations are visible
 * - After 30 days + 50+ violations found → naturally want predictive AI
 * 
 * Tier 2 (Pro/$7.5K/mo): Natural expansion driver
 * - 5x scans, AI predictions, team workflows
 * - When they add team members → collaboration limits kick in
 * - When violation count > 200 → need custom rules → Enterprise
 * 
 * Tier 3 (Enterprise/$25K+/mo): For large operations
 * - Unlimited scans, custom domain rules, compliance consulting
 * - Dedicated account manager, 24/7 support
 * 
 * KEY: Never gate compliance DATA. Only gate enhancement features (AI, teams, custom rules).
 * Ops managers must see critical violations regardless of tier.
 */

export default function Pricing() {
  const [, navigate] = useLocation();

  const tiers = [
    {
      name: "BASIC",
      price: "$2.5K",
      period: "/month",
      tagline: "Get Started with Scanning",
      description: "Compliance scanning + basic reporting",
      icon: <Zap className="h-6 w-6 text-blue-600" />,
      cta: "Start Free Trial",
      ctaVariant: "outline",
      highlighted: false,
      stats: [
        "100 scans/month",
        "1 team member",
        "WCAG AA audits",
        "Basic reporting",
        "Email alerts",
      ],
      naturalLimit: "After 30 days → See value of predictive AI",
    },
    {
      name: "PRO",
      price: "$7.5K",
      period: "/month",
      tagline: "Accelerate with AI & Automation",
      description: "Everything in Basic +",
      description2: "Predictive intelligence + Team workflows",
      icon: <Users className="h-6 w-6 text-sky-600" />,
      cta: "Upgrade to Pro",
      ctaVariant: "default",
      highlighted: true,
      stats: [
        "500 scans/month",
        "5 team members",
        "AI violation predictions",
        "Automated remediations",
        "Team collaboration",
        "Custom benchmarks",
        "API access",
      ],
      naturalLimit: "When team grows > 5 → Enterprise collaboration needed",
    },
    {
      name: "ENTERPRISE",
      price: "Custom",
      period: "pricing",
      tagline: "Scale with Compliance Experts",
      description: "Everything in Pro +",
      description2: "Custom rules + Regulatory consulting + 24/7 support",
      icon: <Sparkles className="h-6 w-6 text-slate-500" />,
      cta: "Contact Sales",
      ctaVariant: "default",
      highlighted: false,
      stats: [
        "5000+ scans/month",
        "50+ team members",
        "Custom domain rules",
        "Compliance officer consulting",
        "Dedicated account manager",
        "Priority support (24/7)",
        "Custom SLAs",
      ],
      naturalLimit: "For regulated industries & large organizations",
    },
  ];

  return (
    <div className="space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold">Pricing Built for Your Growth</h1>
        <p className="text-lg text-slate-300">
          Start with scanning. Upgrade to AI when you need it. Enterprise features when you scale.
        </p>
        <p className="text-sm text-slate-400 italic">
          💡 Tier 1 customers see full compliance data—ops managers never see "upgrade" for critical violations.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {tiers.map((tier, idx) => (
          <Card
            key={tier.name}
            className={`relative flex flex-col ${
              tier.highlighted
                ? "border-sky-600 shadow-2xl scale-105 bg-gradient-to-br from-sky-900/15 via-slate-800 to-slate-900"
                : "border-slate-600 bg-slate-800/50 hover:bg-slate-800/60"
            } transition-all duration-200`}
            data-testid={`card-pricing-${tier.name}`}
          >
            {tier.highlighted && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-sky-700 px-3 py-1 text-white">
                Most Popular
              </Badge>
            )}

            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{tier.icon}</div>
              </div>
              <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
              <p className="text-sm text-slate-400 mt-1">{tier.tagline}</p>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col gap-6">
              {/* Price */}
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-slate-400 text-sm">{tier.period}</span>
                </div>
                <p className="text-sm text-slate-400 mt-2">{tier.description}</p>
                {tier.description2 && (
                  <p className="text-sm text-slate-300 font-medium mt-1">
                    {tier.description2}
                  </p>
                )}
              </div>

              {/* Stats */}
              <ul className="space-y-2.5">
                {tier.stats.map((stat) => (
                  <li key={stat} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-200">{stat}</span>
                  </li>
                ))}
              </ul>

              {/* Natural Limit */}
              <div className="bg-slate-700/30 rounded p-3 text-xs text-slate-300 border border-slate-700/50">
                <span className="font-semibold text-slate-200">Natural Upgrade Path:</span>
                <br />
                <span className="text-slate-400">{tier.naturalLimit}</span>
              </div>

              {/* CTA */}
              <Button
                className={`w-full mt-auto ${
                  tier.highlighted
                    ? "bg-sky-700 hover:bg-sky-800 text-white"
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
                onClick={() => {
                  if (tier.name === "ENTERPRISE") {
                    console.log("Open enterprise sales form");
                  } else {
                    navigate("/compliance-overview");
                  }
                }}
              >
                {tier.cta}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Why These Tiers */}
      <div className="bg-slate-800/50 rounded-lg p-8 max-w-4xl mx-auto border border-slate-600">
        <h2 className="text-2xl font-bold mb-6">Why This Pricing Structure?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-sky-400 mb-2">Basic: Quick Wins</h3>
            <p className="text-sm text-slate-300">
              Get scanning working in a day. Show clients compliance gaps. Basic reports close deals—then upgrade to AI for more wins.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sky-400 mb-2">Pro: AI Acceleration</h3>
            <p className="text-sm text-slate-300">
              After 50+ violations found, predictive AI becomes essential. Team workflows enable you to handle more clients with fewer hours.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sky-400 mb-2">Enterprise: Scale</h3>
            <p className="text-sm text-slate-300">
              Custom rules for fintech/healthcare. Compliance consulting. For orgs managing thousands of violations across dozens of sites.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="space-y-8 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center">Complete Feature Comparison</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-600 bg-slate-800/30">
                <th className="text-left py-4 px-4 font-semibold text-slate-100">Feature</th>
                <th className="text-center py-4 px-4 font-semibold text-slate-100">BASIC</th>
                <th className="text-center py-4 px-4 font-semibold text-slate-100">PRO</th>
                <th className="text-center py-4 px-4 font-semibold text-slate-100">ENTERPRISE</th>
              </tr>
            </thead>
            <tbody>
              {/* Core Scanning - ALWAYS VISIBLE */}
              <tr className="bg-slate-800/40">
                <td className="py-3 px-4 font-semibold text-sky-200" colSpan={4}>
                  Core Compliance Scanning (Always Visible to All Tiers)
                </td>
              </tr>
              {[
                { feature: "WCAG AA Audits", basic: true, pro: true, enterprise: true },
                { feature: "Violation Detection", basic: true, pro: true, enterprise: true },
                { feature: "Basic Reporting", basic: true, pro: true, enterprise: true },
                { feature: "Email Alerts", basic: true, pro: true, enterprise: true },
                { feature: "Compliance Dashboard", basic: true, pro: true, enterprise: true },
              ].map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "" : "bg-slate-800/20"}>
                  <td className="py-3 px-4">{row.feature}</td>
                  {[row.basic, row.pro, row.enterprise].map((has, i) => (
                    <td key={i} className="text-center py-3 px-4">
                      {has ? (
                        <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-slate-600 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Tier 2+ Features - EXPANSION REVENUE */}
              <tr className="bg-slate-800/40">
                <td className="py-3 px-4 font-semibold text-sky-300" colSpan={4}>
                  Expansion Features (Drive Revenue Growth)
                </td>
              </tr>
              {[
                { feature: "AI Violation Predictions", basic: false, pro: true, enterprise: true },
                { feature: "Automated Remediations (Claude)", basic: false, pro: true, enterprise: true },
                { feature: "Team Workflows (5+ users)", basic: false, pro: true, enterprise: true },
                { feature: "Custom Industry Benchmarks", basic: false, pro: true, enterprise: true },
                { feature: "API Access", basic: false, pro: true, enterprise: true },
                { feature: "SSO Integration", basic: false, pro: true, enterprise: true },
              ].map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "" : "bg-slate-800/20"}>
                  <td className="py-3 px-4">{row.feature}</td>
                  {[row.basic, row.pro, row.enterprise].map((has, i) => (
                    <td key={i} className="text-center py-3 px-4">
                      {has ? (
                        <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-slate-600 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Enterprise Features */}
              <tr className="bg-slate-800/40">
                <td className="py-3 px-4 font-semibold text-slate-300" colSpan={4}>
                  Enterprise Features (Scale & Compliance)
                </td>
              </tr>
              {[
                { feature: "Custom Domain Rules", basic: false, pro: false, enterprise: true },
                { feature: "Regulatory Consulting", basic: false, pro: false, enterprise: true },
                { feature: "Dedicated Account Manager", basic: false, pro: false, enterprise: true },
                { feature: "Priority Support (24/7)", basic: false, pro: false, enterprise: true },
                { feature: "Custom SLAs", basic: false, pro: false, enterprise: true },
                { feature: "Unlimited Team Members", basic: false, pro: false, enterprise: true },
              ].map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "" : "bg-slate-800/20"}>
                  <td className="py-3 px-4">{row.feature}</td>
                  {[row.basic, row.pro, row.enterprise].map((has, i) => (
                    <td key={i} className="text-center py-3 px-4">
                      {has ? (
                        <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-slate-600 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-6 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center">Common Questions</h2>

        <div className="space-y-4">
          {[
            {
              q: "Why do Tier 1 customers see all violations but not predictive AI?",
              a: "Because ops managers NEED to see what's broken—that's critical data. AI predictions are an enhancement that saves time (5x faster violation detection). We gate velocity, not visibility.",
            },
            {
              q: "When should we upgrade to Pro?",
              a: "After ~30 days with 50+ violations found. You'll want predictive AI to find issues before users do. Natural upgrade trigger, not forced.",
            },
            {
              q: "What's the typical upgrade path?",
              a: "Basic for 1-2 months → Pro when you add team members or violations > 50 → Enterprise when managing 5000+ scans/month or need custom rules.",
            },
            {
              q: "Can we try Pro before committing?",
              a: "Yes, 14-day free trial. No credit card. We'll show you the value of AI predictions with real data from your scans.",
            },
            {
              q: "Do you offer discounts?",
              a: "15% off annual billing on all plans. For Enterprise, custom pricing based on volume and commitment.",
            },
          ].map((faq, idx) => (
            <Card key={idx} className="bg-slate-800/30 border-slate-600">
              <CardHeader>
                <CardTitle className="text-base text-slate-200">{faq.q}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Ready to accelerate your audit practice?</h2>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate("/compliance-overview")}>
            Start with Basic
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/compliance-overview")}
          >
            See Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
