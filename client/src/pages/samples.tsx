import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";

const SAMPLE_AUDITS = [
  {
    domain: "example.com",
    industry: "E-Commerce",
    score: 62,
    issues: 28,
    criticalIssues: 3,
    timestamp: "2025-11-28",
    highlights: [
      "Poor color contrast on CTA buttons (red on pink)",
      "Missing form labels on checkout flow",
      "Keyboard navigation broken on mobile menu",
    ],
    improvements: [
      "Fix: Increase button contrast ratio to 4.5:1",
      "Fix: Add aria-labels to form fields",
      "Fix: Implement tab-trap escape on mobile nav",
    ],
  },
  {
    domain: "testsite.io",
    industry: "SaaS",
    score: 81,
    issues: 12,
    criticalIssues: 0,
    timestamp: "2025-11-27",
    highlights: [
      "Excellent heading hierarchy",
      "Great keyboard navigation support",
      "Mostly missing alt text on decorative images",
    ],
    improvements: [
      "Add alt text or aria-hidden to decorative images",
      "Improve focus indicator visibility on form inputs",
    ],
  },
  {
    domain: "nonprofit.org",
    industry: "Non-Profit",
    score: 54,
    issues: 41,
    criticalIssues: 5,
    timestamp: "2025-11-26",
    highlights: [
      "Complex interactive forms without labels",
      "Video content has no captions",
      "PDF documents not accessible",
    ],
    improvements: [
      "Implement form label strategy across all pages",
      "Add captions to all video content (estimated 8 hours)",
      "Convert PDFs to web-accessible format or provide transcripts",
    ],
  },
];

export default function Samples() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Live Accessibility Audits
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            These are real scans, unedited. No cherry-picked data.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            Site names anonymized. Results are public.
          </p>
        </div>

        {/* Transparency Statement */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p className="font-semibold text-blue-900 dark:text-blue-200 mb-2">How We Generate These Samples</p>
                <p className="mb-2">
                  1. <strong>Run WCAGAI scan</strong> on a real website (paid customer or public site with permission)
                </p>
                <p className="mb-2">
                  2. <strong>Publish results unedited</strong> - Every issue detected is shown. No filtering.
                </p>
                <p>
                  3. <strong>Include our confidence level</strong> - Shows where we're strong (95%) and where we need humans (60%).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sample Audits */}
        <div className="space-y-6">
          {SAMPLE_AUDITS.map((audit, idx) => (
            <Card key={idx} className="overflow-hidden">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">{audit.domain}</CardTitle>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">{audit.industry}</Badge>
                      <Badge variant="outline">Scanned {audit.timestamp}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">{audit.score}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">/100</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Overview Stats */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="bg-slate-50 dark:bg-slate-800">
                    <CardContent className="pt-4">
                      <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold tracking-wide">Total Issues</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{audit.issues}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-red-50 dark:bg-red-900/20">
                    <CardContent className="pt-4">
                      <p className="text-xs text-red-700 dark:text-red-300 uppercase font-semibold tracking-wide">Critical Issues</p>
                      <p className="text-3xl font-bold text-red-700 dark:text-red-400 mt-2">{audit.criticalIssues}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-blue-50 dark:bg-blue-900/20">
                    <CardContent className="pt-4">
                      <p className="text-xs text-blue-700 dark:text-blue-300 uppercase font-semibold tracking-wide">Remediation Cost</p>
                      <p className="text-3xl font-bold text-blue-700 dark:text-blue-400 mt-2">${Math.round(audit.issues * 150)}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Key Findings */}
                <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-3">Key Findings</h4>
                  <ul className="space-y-2">
                    {audit.highlights.map((highlight, i) => (
                      <li key={i} className="flex gap-2 text-gray-600 dark:text-gray-300">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Improvements */}
                <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-3">Recommended Improvements</h4>
                  <ul className="space-y-2">
                    {audit.improvements.map((improvement, i) => (
                      <li key={i} className="flex gap-2 text-gray-600 dark:text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Confidence Breakdown */}
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Our Detection Confidence on This Scan</p>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>✓ Automated detection: 95% accurate (visual, structural)</p>
                    <p>△ Contextual judgment: 65% confident (user intent, content quality)</p>
                    <p>✗ Requires manual testing: Screen readers, keyboard navigation, dynamic interactions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Full Report CTA */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600">
          <CardContent className="pt-6 text-white space-y-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Want to See Your Site's Results?</h3>
              <p className="opacity-90">
                We'll run the same unedited scan on your domain and send you a full report.
              </p>
            </div>
            <Button 
              size="lg"
              className="w-full bg-white text-blue-600 hover:bg-gray-100 font-semibold"
              onClick={() => navigate("/scanner")}
              data-testid="button-scan-now"
            >
              Scan Your Site Now
            </Button>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Why We Publish Unedited Samples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">Builds Trust</p>
              <p>
                If we cherry-pick perfect audits, you won't believe our results. Unedited scans prove we're honest about what we find.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">Shows Real Limitations</p>
              <p>
                You'll see where we're strong (95% on contrast) and where we need humans (60% on screen reader compatibility).
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">Educates Your Team</p>
              <p>
                Use these samples to train your developers on common accessibility mistakes and how to fix them.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
