import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, TrendingDown } from "lucide-react";

const INDUSTRY_FINES = {
  fintech: { avgFine: 250000, lawsuitRisk: 0.45 },
  healthcare: { avgFine: 500000, lawsuitRisk: 0.62 },
  ecommerce: { avgFine: 150000, lawsuitRisk: 0.38 },
  education: { avgFine: 100000, lawsuitRisk: 0.25 },
  saas: { avgFine: 200000, lawsuitRisk: 0.35 },
};

interface ROIResults {
  lawsuitRisk: number;
  estimatedLiability: number;
  wcagaiMonthly: number;
  wcagaiAnnual: number;
  savings5Year: number;
  issuesPerMonthFixed: number;
}

export default function ROICalculator() {
  const [traffic, setTraffic] = useState("50000");
  const [currentScore, setCurrentScore] = useState("55");
  const [industry, setIndustry] = useState("saas");
  const [email, setEmail] = useState("");
  const [results, setResults] = useState<ROIResults | null>(null);
  const [showEmail, setShowEmail] = useState(false);

  const calculateROI = () => {
    const monthlyTraffic = parseInt(traffic) || 50000;
    const score = parseInt(currentScore) || 55;
    const industryData = INDUSTRY_FINES[industry as keyof typeof INDUSTRY_FINES] || INDUSTRY_FINES.saas;

    // Lawsuit risk = industry risk * (1 - compliance score/100)
    const baseRisk = industryData.lawsuitRisk;
    const complianceGap = 1 - score / 100;
    const lawsuitRisk = Math.min(baseRisk * complianceGap, 0.95);

    // Estimated liability = average fine * lawsuit probability
    const estimatedLiability = industryData.avgFine * lawsuitRisk;

    // WCAGAI pricing: $497/month Pro tier (affordable SMB monitoring)
    const wcagaiMonthly = 497;
    const wcagaiAnnual = wcagaiMonthly * 12;

    // 5-year savings: liability avoided - WCAGAI costs
    const savings5Year = estimatedLiability * 5 - wcagaiAnnual * 5;

    // Issues fixed per month: ~80% of issues caught automatically
    const issuesPerMonthFixed = Math.round((monthlyTraffic / 1000) * (100 - score) * 0.8);

    setResults({
      lawsuitRisk: Math.round(lawsuitRisk * 100),
      estimatedLiability: Math.round(estimatedLiability),
      wcagaiMonthly,
      wcagaiAnnual,
      savings5Year: Math.round(Math.max(savings5Year, 0)),
      issuesPerMonthFixed: Math.max(issuesPerMonthFixed, 5),
    });

    setShowEmail(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Accessibility Lawsuit ROI Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            See exactly how much accessibility compliance could save you
          </p>
        </div>

        {/* Calculator Form */}
        <Card className="bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle>Your Business Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Monthly Traffic */}
              <div className="space-y-2">
                <Label htmlFor="traffic">Monthly Visitors</Label>
                <Input
                  id="traffic"
                  type="number"
                  value={traffic}
                  onChange={(e) => setTraffic(e.target.value)}
                  placeholder="50000"
                  data-testid="input-monthly-traffic"
                />
              </div>

              {/* Current Score */}
              <div className="space-y-2">
                <Label htmlFor="score">Current WCAG Score (%)</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max="100"
                  value={currentScore}
                  onChange={(e) => setCurrentScore(e.target.value)}
                  placeholder="55"
                  data-testid="input-wcag-score"
                />
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger id="industry" data-testid="select-industry">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fintech">Fintech</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="ecommerce">E-Commerce</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="saas">SaaS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={calculateROI}
              data-testid="button-calculate-roi"
            >
              Calculate Your Risk & Savings
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <div className="space-y-4">
            {/* Risk Warning */}
            <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  Lawsuit Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-700 dark:text-red-400">
                  {results.lawsuitRisk}%
                </p>
                <p className="text-sm text-red-600 dark:text-red-300 mt-2">
                  Estimated annual liability: <strong>${(results.estimatedLiability / 1000).toFixed(0)}K</strong>
                </p>
              </CardContent>
            </Card>

            {/* ROI Metrics Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-green-700 dark:text-green-400">5-Year Savings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                    ${(results.savings5Year / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-300 mt-2">
                    By fixing accessibility now vs. lawsuit risk
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-700 dark:text-blue-400 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Issues Fixed Monthly
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                    {results.issuesPerMonthFixed}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-300 mt-2">
                    With WCAGAI AI-powered scanning
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-purple-700 dark:text-purple-400">WCAGAI Cost</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                    ${results.wcagaiMonthly / 1000}K/mo
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-300 mt-2">
                    ${results.wcagaiAnnual / 1000}K annually
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-amber-700 dark:text-amber-400">ROI Ratio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-amber-700 dark:text-amber-400">
                    {Math.round(results.savings5Year / (results.wcagaiAnnual * 5))}:1
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-300 mt-2">
                    For every $1 spent on WCAGAI, save $X in risk
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* CTA */}
            {showEmail && (
              <Card className="bg-gradient-to-r from-blue-600 to-purple-600">
                <CardContent className="pt-6 text-white space-y-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Get Your Detailed Report</h3>
                    <p className="text-sm opacity-90">
                      Email us and we'll send a 5-page scan of your site + this analysis as a PDF
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-capture" className="text-white">Email Address</Label>
                    <Input
                      id="email-capture"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@company.com"
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                      data-testid="input-email-capture"
                    />
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-white text-blue-600 hover:bg-gray-100 font-semibold"
                    data-testid="button-get-report"
                  >
                    Get Your Free 5-Page Scan + Report
                  </Button>

                  <p className="text-xs opacity-75 text-center">
                    We'll email you results within 2 minutes. No signup required.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Education Section */}
        <Card>
          <CardHeader>
            <CardTitle>Why This Matters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">1,023 lawsuits in 2024</p>
              <p>Against accessibility overlay companies. Real compliance is now a legal necessity.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">$250K - $500K average fines</p>
              <p>Per industry. Add legal fees, remediation costs, reputation damage.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">80% of issues caught automatically</p>
              <p>WCAGAI catches accessibility problems in minutes, not weeks.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
