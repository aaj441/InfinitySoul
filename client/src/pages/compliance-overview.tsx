import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowUp, ArrowDown, AlertCircle, CheckCircle, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { UpsellTriggerBanner } from "@/components/upsell-trigger";

interface ComplianceMetrics {
  complianceScore: number;
  scoreChange: number;
  totalViolations: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  fixedThisWeek: number;
  inProgressCount: number;
  blockedCount: number;
  regulatoryInquiry: boolean;
  estimatedFine: number;
}

export default function ComplianceOverview() {
  const [, navigate] = useLocation();
  const { tier, subscription, tierFeatures } = useSubscription();

  const { data: metrics, isLoading } = useQuery<ComplianceMetrics>({
    queryKey: ["/api/compliance/overview"],
    queryFn: async () => {
      const response = await fetch("/api/compliance/overview");
      if (!response.ok) throw new Error("Failed to fetch metrics");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading compliance dashboard...</p>
      </div>
    );
  }

  const m = metrics || {
    complianceScore: 94,
    scoreChange: 3,
    totalViolations: 38,
    criticalCount: 3,
    highCount: 12,
    mediumCount: 23,
    lowCount: 0,
    fixedThisWeek: 8,
    inProgressCount: 14,
    blockedCount: 2,
    regulatoryInquiry: false,
    estimatedFine: 250000,
  };

  // Determine trend color
  const scoreColor = m.scoreChange > 0 ? "text-emerald-500" : "text-red-500";
  const scoreIcon = m.scoreChange > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;

  return (
    <div className="space-y-6">
      {/* Smart upsell trigger - shows when user hits natural limits */}
      <UpsellTriggerBanner
        tier={tier}
        userData={{
          violationCount: m.totalViolations,
          teamSize: subscription?.teamMembersUsed || 1,
          daysActive: subscription?.daysActive || 0,
        }}
        onUpgradeClick={() => navigate("/pricing")}
      />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compliance Cockpit</h1>
          <p className="text-muted-foreground mt-1">
            Real-time WCAG compliance status
            {tier !== "BASIC" && (
              <span className="ml-2 inline-block px-2 py-1 text-xs font-semibold bg-sky-700 text-white rounded">
                {tier} Plan
              </span>
            )}
          </p>
        </div>
        {tier === "BASIC" && (
          <Button
            size="sm"
            onClick={() => navigate("/pricing")}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Upgrade Plan
          </Button>
        )}
      </div>

      {/* Main Status Card */}
      <Card className="border-0 bg-gradient-to-br from-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.3),transparent)]"></div>
        <CardContent className="pt-6 relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-300">Compliance Score</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-5xl font-bold">{m.complianceScore}%</span>
                <div className="flex items-center gap-1">
                  <span className={`text-lg font-semibold ${scoreColor}`}>
                    {m.scoreChange > 0 ? "+" : ""}{m.scoreChange}%
                  </span>
                  <span className={scoreColor}>{scoreIcon}</span>
                </div>
              </div>
              <div className="mt-3 w-48 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-600 to-sky-400"
                  style={{ width: `${m.complianceScore}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">Target: 100% • Updated 1h ago</p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${m.complianceScore >= 90 ? "text-emerald-400" : "text-amber-400"}`}>
                {m.complianceScore >= 90 ? "✓ Good" : "⚠ At Risk"}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {m.complianceScore >= 90 ? "No critical issues" : "Action required"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Violation Heatmap */}
      <div className="grid grid-cols-4 gap-4">
        <Card
          className="cursor-pointer hover-elevate border-l-4 border-red-500 bg-slate-800 text-white"
          onClick={() => navigate("/violation-triage?filter=critical")}
          data-testid="card-violations-critical"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-300">CRITICAL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{m.criticalCount}</div>
            <p className="text-xs text-red-300 mt-1">Requires immediate action</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover-elevate border-l-4 border-amber-500 bg-slate-800 text-white"
          onClick={() => navigate("/violation-triage?filter=high")}
          data-testid="card-violations-high"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-300">HIGH</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{m.highCount}</div>
            <p className="text-xs text-amber-300 mt-1">User impact</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover-elevate border-l-4 border-yellow-500 bg-slate-800 text-white"
          onClick={() => navigate("/violation-triage?filter=medium")}
          data-testid="card-violations-medium"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-300">MEDIUM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{m.mediumCount}</div>
            <p className="text-xs text-yellow-300 mt-1">General accessibility</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover-elevate border-l-4 border-emerald-500 bg-slate-800 text-white"
          onClick={() => navigate("/violation-triage?filter=low")}
          data-testid="card-violations-low"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-300">LOW</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{m.lowCount}</div>
            <p className="text-xs text-emerald-300 mt-1">Cosmetic issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase">OPEN</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{m.totalViolations}</div>
            <p className="text-xs text-slate-400 mt-1">↙ Needs action</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase">IN PROGRESS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-400">{m.inProgressCount}</div>
            <p className="text-xs text-slate-400 mt-1">↻ Being fixed</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase">FIXED</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-400">{m.fixedThisWeek}</div>
            <p className="text-xs text-slate-400 mt-1">✓ This week</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-400 uppercase">BLOCKED</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{m.blockedCount}</div>
            <p className="text-xs text-slate-400 mt-1">🚫 Stuck</p>
          </CardContent>
        </Card>
      </div>

      {/* Plan Usage Info */}
      <Card className="bg-slate-800 text-white border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Plan Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-slate-400">Scans This Month</p>
              <p className="text-lg font-semibold mt-1">
                {subscription?.scansUsed}/{subscription?.scansRemaining + subscription?.scansUsed}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Team Members</p>
              <p className="text-lg font-semibold mt-1">
                {subscription?.teamMembersUsed}/{subscription?.teamMembersLimit}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Custom Rules</p>
              <p className="text-lg font-semibold mt-1">
                {tierFeatures.features.customRulesEngine
                  ? `${subscription?.customRulesUsed}/${subscription?.customRulesLimit}`
                  : "Not included"}
              </p>
            </div>
          </div>
          {subscription?.scansRemaining && subscription.scansRemaining < 20 && (
            <Button
              size="sm"
              className="mt-3"
              onClick={() => navigate("/pricing")}
            >
              Add Scans
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Risk Alerts (Bottom) */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300">Urgent Alerts</h3>
        
        {m.criticalCount > 0 && (
          <Card className="border-red-500/50 bg-red-950/30 text-red-100">
            <CardContent className="pt-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Payment Flow Critical ({m.criticalCount} violations)</p>
                <p className="text-xs text-red-200 mt-1">Revenue at risk. Fix within 48 hours.</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate("/violation-triage?filter=critical")}>
                View
              </Button>
            </CardContent>
          </Card>
        )}

        {m.regulatoryInquiry && (
          <Card className="border-amber-500/50 bg-amber-950/30 text-amber-100">
            <CardContent className="pt-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Regulatory Inquiry in Progress</p>
                <p className="text-xs text-amber-200 mt-1">Estimated fine: ${(m.estimatedFine / 1000).toFixed(0)}K if not resolved</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate("/evidence-reporting")}>
                Generate Report
              </Button>
            </CardContent>
          </Card>
        )}

        {m.inProgressCount > 0 && (
          <Card className="border-indigo-500/50 bg-indigo-950/30 text-indigo-100">
            <CardContent className="pt-4 flex items-start gap-3">
              <Clock className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">In Progress: {m.inProgressCount} violations</p>
                <p className="text-xs text-indigo-200 mt-1">Monitor PRs and verify fixes before closing</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate("/violation-triage?filter=in-progress")}>
                Track
              </Button>
            </CardContent>
          </Card>
        )}

        {m.fixedThisWeek > 0 && (
          <Card className="border-emerald-500/50 bg-emerald-950/30 text-emerald-100">
            <CardContent className="pt-4 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Great Progress: {m.fixedThisWeek} fixed this week</p>
                <p className="text-xs text-emerald-200 mt-1">Keep up the momentum</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-2 mt-8">
        <Button onClick={() => navigate("/violation-triage")} className="flex-1">
          View Violations →
        </Button>
        <Button onClick={() => navigate("/evidence-reporting")} variant="outline" className="flex-1">
          Generate Report
        </Button>
      </div>
    </div>
  );
}
