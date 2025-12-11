import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp } from "lucide-react";

const POSTMORTEMS = [
  {
    date: "2025-11-20",
    title: "Scanner Down for 4 Hours (Database Overload)",
    severity: "critical",
    impact: "150 scans failed",
    rootCause: "Query timeout on audit_results table with 2M rows. Missing index on domain column.",
    whatWeLearned: [
      "Add database query monitoring to catch slow queries before they crash",
      "Implement connection pooling for database to prevent exhaustion",
      "Set up alerts when query time > 2 seconds",
    ],
    whatWeFixed: [
      "Added composite index on (domain, created_at) for faster lookups",
      "Implemented query timeouts (5s) to fail gracefully",
      "Set up DataDog APM to catch future slow queries",
    ],
    preventionNow: [
      "✅ Load testing before major releases (500+ concurrent scans)",
      "✅ Real-time query monitoring in production",
      "✅ Automated alerts on database performance degradation",
    ],
  },
  {
    date: "2025-11-10",
    title: "False Positive: Color Contrast Detection (Blue on Blue)",
    severity: "high",
    impact: "12 customers reported incorrect violation flagging",
    rootCause: "Axe-core detected AAA contrast failure (7:1) but WCAG only requires AA (4.5:1). Algorithm wasn't reading the spec correctly.",
    whatWeLearned: [
      "WCAG thresholds are strict: AA = 4.5:1, AAA = 7:1. We were conflating them.",
      "Edge cases with color spaces (hex vs. RGB) affect calculations",
      "Customers need to know our detection rules, not just the results",
    ],
    whatWeFixed: [
      "Updated contrast detection to clearly distinguish AA vs. AAA",
      "Hardcoded correct thresholds from WCAG 2.2 spec",
      "Added 'Show Me Why' button to explain calculation behind each flag",
    ],
    preventionNow: [
      "✅ Test against WCAG reference implementations",
      "✅ Quarterly audit of algorithm vs. spec",
      "✅ Transparency: show customers our logic, not just results",
    ],
  },
  {
    date: "2025-10-30",
    title: "API Key Leaked in GitHub Commit",
    severity: "critical",
    impact: "Potential unauthorized access to scan API",
    rootCause: "Developer committed .env file with API key. Git pre-commit hook wasn't configured.",
    whatWeLearned: [
      "Environment files should NEVER be in git, even if you think they're private",
      "One leaked key can compromise entire infrastructure",
      "Detection takes hours; impact is immediate",
    ],
    whatWeFixed: [
      "Rotated all API keys immediately",
      "Added git hooks to prevent .env commits",
      "Switched to Replit Secrets for key management",
      "Scanned entire commit history with truffleHog",
    ],
    preventionNow: [
      "✅ All secrets managed via Replit environment variables",
      "✅ Pre-commit hooks prevent secret commits",
      "✅ Weekly secret scanning of all repositories",
    ],
  },
];

export default function FailurePostmortems() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700";
      case "high":
        return "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700";
      default:
        return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700";
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-600 text-white";
      case "high":
        return "bg-amber-600 text-white";
      default:
        return "bg-yellow-600 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Failure Post-Mortems
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            We broke things. Here's what we learned.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            Public accountability: 72-hour post-mortem SLA for all major incidents.
          </p>
        </div>

        {/* Transparency Statement */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              We publish every major failure ({'>'} 10 customers impacted or {'>'} 1 hour downtime). 
              No NDAs. No hidden incidents. This builds trust better than perfection ever could.
            </p>
          </CardContent>
        </Card>

        {/* Postmortems */}
        <div className="space-y-6">
          {POSTMORTEMS.map((postmortem, idx) => (
            <Card key={idx} className={`border-2 ${getSeverityColor(postmortem.severity)}`}>
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex gap-2 items-center mb-2">
                      <Badge className={getSeverityBadgeColor(postmortem.severity)}>
                        {postmortem.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{postmortem.date}</span>
                    </div>
                    <CardTitle className="text-xl">{postmortem.title}</CardTitle>
                  </div>
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                  <strong>Impact:</strong> {postmortem.impact}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Root Cause */}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">Root Cause</h4>
                  <p className="text-gray-600 dark:text-gray-400">{postmortem.rootCause}</p>
                </div>

                {/* What We Learned */}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">What We Learned</h4>
                  <ul className="space-y-2">
                    {postmortem.whatWeLearned.map((lesson, i) => (
                      <li key={i} className="flex gap-2 text-gray-600 dark:text-gray-400">
                        <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                        {lesson}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* What We Fixed */}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">What We Fixed</h4>
                  <ul className="space-y-2">
                    {postmortem.whatWeFixed.map((fix, i) => (
                      <li key={i} className="flex gap-2 text-gray-600 dark:text-gray-400">
                        <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                        {fix}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Prevention */}
                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-bold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    How We Prevent This Now
                  </h4>
                  <ul className="space-y-2">
                    {postmortem.preventionNow.map((prevention, i) => (
                      <li key={i} className="text-sm text-green-800 dark:text-green-200">
                        {prevention}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Why We Do This */}
        <Card>
          <CardHeader>
            <CardTitle>Why We Publish Post-Mortems</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">1. Transparency Breeds Trust</p>
              <p>Every service fails. We're just honest about it.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">2. Accountability Prevents Recurrence</p>
              <p>Public SLAs (72-hour post-mortem, root cause analysis, prevention plan) force discipline.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">3. Learning Multiplies Value</p>
              <p>Your engineers learn from our mistakes. You avoid the same failures.</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">4. Builds Credibility</p>
              <p>Companies that hide failures are hiding problems. We're the opposite.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
