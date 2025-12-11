import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function Beachhead() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white">
            For Local Business Owners
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300">
            Plumbers. Electricians. Contractors. HVAC specialists.
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            You didn't build a website to worry about lawsuits.
          </p>
        </div>

        {/* The Problem */}
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="w-6 h-6" />
              Your Real Problem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              You have a website so customers can find you. It gets the job done. But it's probably got accessibility issues you don't even know about.
            </p>
            <p className="text-lg font-bold text-red-700 dark:text-red-400">
              And that's costing you money in three ways:
            </p>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span className="font-bold text-red-600">1.</span>
                <span className="text-gray-700 dark:text-gray-300">Lost customers - Blind and low-vision users can't use your site. Period.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-red-600">2.</span>
                <span className="text-gray-700 dark:text-gray-300">Lower Google rankings - Google penalizes sites that aren't accessible.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-red-600">3.</span>
                <span className="text-gray-700 dark:text-gray-300">ADA lawsuit risk - $25K+ settlements happening right now to businesses like yours.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* The Numbers */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6 text-center space-y-2">
              <p className="text-3xl font-bold text-amber-700 dark:text-amber-400">15%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Of your potential customers have disabilities.</p>
              <p className="text-xs text-amber-600 dark:text-amber-300">You're literally losing 1 in 6 customers.</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6 text-center space-y-2">
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">60%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Of local business websites have accessibility failures.</p>
              <p className="text-xs text-blue-600 dark:text-blue-300">You're probably in this group.</p>
            </CardContent>
          </Card>

          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="pt-6 text-center space-y-2">
              <p className="text-3xl font-bold text-red-700 dark:text-red-400">$25K+</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average ADA lawsuit settlement in 2024.</p>
              <p className="text-xs text-red-600 dark:text-red-300">Plus legal fees, time spent, stress.</p>
            </CardContent>
          </Card>
        </div>

        {/* The Solution */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="w-6 h-6" />
              WCAGAI Fixes All Three
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-bold text-slate-900 dark:text-white mb-2">Stop losing customers.</p>
              <p className="text-gray-700 dark:text-gray-300">We identify accessibility issues your site has right now. Then fix them automatically. In 48 hours, not 6 months.</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white mb-2">Rank higher on Google.</p>
              <p className="text-gray-700 dark:text-gray-300">Google rewards accessible sites. Fixed accessibility = better rankings = more customers finding you.</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white mb-2">Sleep at night.</p>
              <p className="text-gray-700 dark:text-gray-300">We monitor your site continuously. If accessibility issues pop up, we catch them and fix them. No lawsuits. No surprises.</p>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center">
            This Doesn't Cost a Fortune
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle>Try Free</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  One free scan. See exactly what's broken on your site. No credit card required.
                </p>
                <Button variant="outline" className="w-full" onClick={() => navigate("/scanner")}>
                  Scan My Site Free
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-blue-300 dark:border-blue-700">
              <CardHeader>
                <CardTitle>$497 / Month</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">After free trial</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Initial scan and fixes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Continuous monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Auto-fixes for new issues
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Plain English reports
                  </li>
                </ul>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Start 14-Day Free Trial
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-900 dark:bg-slate-950">
            <CardContent className="pt-6 text-center text-white space-y-3">
              <TrendingUp className="w-10 h-10 mx-auto text-green-400" />
              <p className="font-bold text-lg">$497/month to avoid $25K+ lawsuits</p>
              <p className="text-sm text-slate-300">
                That's $5,964/year to protect yourself. Your first lawsuit would cost 4x that.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Why Local Businesses Choose WCAGAI */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Why Local Businesses Choose Us</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Not Technical Jargon",
                desc: "We don't tell you to fix WCAG 1.4.3 violations. We say: Make your buttons bigger so people can tap them.",
              },
              {
                title: "Actual Fixes, Not Reports",
                desc: "We don't send you a 40-page PDF. We show you broken things and fix them automatically.",
              },
              {
                title: "Affordable for Your Budget",
                desc: "No $25K one-time audits. $497/month keeps your site compliant as you grow.",
              },
              {
                title: "Peace of Mind",
                desc: "We monitor continuously. You focus on running your business. Accessibility stays handled.",
              },
            ].map((item, i) => (
              <Card key={i} className="bg-white dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center space-y-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
          <h2 className="text-3xl font-bold">See What's Broken on Your Site</h2>
          <p className="text-lg">One free scan. No credit card. No commitment.</p>
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 font-bold"
            onClick={() => navigate("/scanner")}
            data-testid="button-free-scan-local"
          >
            Scan My Site Now
          </Button>
        </div>
      </div>
    </div>
  );
}
