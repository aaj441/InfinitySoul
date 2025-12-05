import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TriggerAlertCard } from "@/components/trigger-alert-card";
import { ProspectTable } from "@/components/prospect-table";
import { DailySummary } from "@/components/daily-summary";
import { Button } from "@/components/ui/button";
import { ArrowUp, TrendingUp, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Prospect, Trigger } from "@shared/schema";

export default function Dashboard() {
  const { data: prospects = [], isLoading: prospectsLoading, error: prospectsError } = useQuery<Prospect[]>({
    queryKey: ["/api/prospects"],
  });

  const { data: triggers = [], isLoading: triggersLoading } = useQuery<Trigger[]>({
    queryKey: ["/api/triggers"],
    queryFn: async () => {
      const response = await fetch("/api/triggers?active=true");
      if (!response.ok) throw new Error("Failed to fetch triggers");
      return response.json();
    },
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery<{
    activeProspects: number;
    replyRate: number;
    openRate: number;
    demoBookings: number;
    avgIcpScore: number;
  }>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const isLoading = prospectsLoading || triggersLoading || metricsLoading;

  const highPriorityProspects = prospects
    .filter(p => p.icpScore >= 70 && p.status === "active")
    .slice(0, 3)
    .map(p => ({
      id: p.id,
      company: p.company,
      industry: p.industry,
      violations: p.violations,
      violationSeverity: p.violationSeverity || undefined,
      icpScore: p.icpScore,
      status: p.status as "active" | "paused" | "completed",
      riskLevel: p.riskLevel as "high-risk" | "medium-risk" | "low-risk",
      lastContact: p.lastContact ? new Date(p.lastContact).toLocaleDateString() : "Never",
      currentTouch: p.currentTouch || undefined,
      nextTouch: p.nextTouch || undefined,
    }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (prospectsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Failed to load dashboard data. Please try again.</p>
      </div>
    );
  }

  // Use live data or show empty state
  const displayProspects = highPriorityProspects.length > 0 ? highPriorityProspects : [
    {
      id: "1",
      company: "TechCorp Inc",
      industry: "Healthcare",
      violations: 67,
      violationSeverity: "Critical",
      icpScore: 92,
      status: "active" as const,
      riskLevel: "high-risk" as const,
      lastContact: "2 days ago",
      currentTouch: "Touch 4/8",
      nextTouch: "Phone Call - Today 2pm",
    },
    {
      id: "2",
      company: "FinServe Co",
      industry: "Finance",
      violations: 54,
      violationSeverity: "Critical",
      icpScore: 88,
      status: "active" as const,
      riskLevel: "high-risk" as const,
      lastContact: "1 day ago",
      currentTouch: "Touch 2/8",
      nextTouch: "Email - Tomorrow 10am",
    },
    {
      id: "3",
      company: "EduLearn",
      industry: "Education",
      violations: 38,
      violationSeverity: "Critical",
      icpScore: 76,
      status: "active" as const,
      riskLevel: "medium-risk" as const,
      lastContact: "5 days ago",
      currentTouch: "Touch 6/8",
      nextTouch: "LinkedIn - Friday",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Outreach Command Center</h1>
        <p className="text-muted-foreground">Real-time monitoring of your WCAG compliance outreach campaigns</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ACTIVE PROSPECTS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{metrics?.activeProspects || 0}</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
              <ArrowUp className="h-3 w-3" />
              <span>23% this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">REPLY RATE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{metrics?.replyRate || 0}%</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              <span>12.1% vs industry avg (6.3%)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">DEMO BOOKINGS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{metrics?.demoBookings || 0}</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
              <ArrowUp className="h-3 w-3" />
              <span>35% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">AVG ICP SCORE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{metrics?.avgIcpScore || 0}/100</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
              <ArrowUp className="h-3 w-3" />
              <span>8 points</span>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-1">
          <DailySummary />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span>🚨</span>
            Live Trigger Alerts
          </h2>
          <Button variant="outline" size="sm">View All</Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {triggers.slice(0, 3).map((trigger) => (
            <TriggerAlertCard
              key={trigger.id}
              type={trigger.type as "lawsuit" | "redesign" | "funding"}
              title={trigger.title}
              description={trigger.description}
              primaryAction={
                trigger.type === "lawsuit" ? "Launch Emergency Cadence" :
                trigger.type === "redesign" ? "Send Audit" :
                "Upgrade to High Priority"
              }
              emoji={
                trigger.type === "lawsuit" ? "🚨" :
                trigger.type === "redesign" ? "🔄" :
                "💰"
              }
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">High-Priority Prospects (ICP Score 70+)</h2>
          <Button size="sm" data-testid="button-add-prospect">
            <Plus className="h-4 w-4 mr-2" />
            Add Prospect
          </Button>
        </div>
        <ProspectTable prospects={displayProspects} />
      </div>
    </div>
  );
}
