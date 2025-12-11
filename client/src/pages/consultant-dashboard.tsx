import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, CheckCircle, AlertCircle, Mail, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardMetrics = {
  prospectsCounts: { total: number; pending: number; completed: number };
  scansThisWeek: number;
  avgScanTime: number;
  avgRiskScore: number;
  complianceScore: number;
  topViolations: { code: string; count: number }[];
};

type AgentStatus = {
  planner: { status: string; tasksProcessed: number; uptime: string };
  executor: { status: string; jobsRunning: number; jobsCompleted: number };
  outreach: { status: string; emailsSent: number; bounces: number };
  monitor: { status: string; healthChecks: string; alerts: number };
};

type EthicalMetrics = {
  totalProspectsReached: number;
  dncListSize: number;
  emailsThisWeek: number;
  averageEmailsPerProspect: number;
  complianceScore: number;
  unsubscribeRate: number;
};

const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function ConsultantDashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ["/api/agents/status"],
  });

  const { data: ethical, isLoading: ethicalLoading } = useQuery({
    queryKey: ["/api/ethical/metrics"],
  });

  const dashboardMetrics = metrics as DashboardMetrics | undefined;
  const agentStatus = agents as AgentStatus | undefined;
  const ethicalMetrics = ethical as EthicalMetrics | undefined;

  const isLoading = metricsLoading || agentsLoading || ethicalLoading;

  const prospectTrendData = [
    { week: "Wk 1", pending: 45, completed: 20, failed: 2 },
    { week: "Wk 2", pending: 38, completed: 35, failed: 1 },
    { week: "Wk 3", pending: 30, completed: 50, failed: 2 },
    { week: "Wk 4", pending: 25, completed: 70, failed: 1 },
  ];

  const violationTrendData = dashboardMetrics?.topViolations?.slice(0, 5) || [];

  const revenueData = [
    { month: "Oct", revenue: 12000, clients: 8 },
    { month: "Nov", revenue: 18500, clients: 12 },
    { month: "Dec", revenue: 25000, clients: 15 },
  ];

  const MetricCard = ({ title, value, icon: Icon, change, isLoading: loading }: any) => (
    <Card className="hover-elevate">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-24 mt-2" />
            ) : (
              <p className="text-2xl font-bold mt-2">{value}</p>
            )}
            {change && (
              <p className="text-xs text-green-600 mt-1">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                {change}
              </p>
            )}
          </div>
          <Icon className="w-8 h-8 text-muted-foreground opacity-50" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Consultant Dashboard</h1>
          <p className="text-muted-foreground">Real-time metrics for your accessibility consulting practice</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <MetricCard
            title="Total Prospects"
            value={dashboardMetrics?.prospectsCounts.total || 0}
            icon={Users}
            change="+12 this week"
            isLoading={metricsLoading}
          />
          <MetricCard
            title="Audits Completed"
            value={dashboardMetrics?.prospectsCounts.completed || 0}
            icon={CheckCircle}
            change="+45 this week"
            isLoading={metricsLoading}
          />
          <MetricCard
            title="Emails Sent"
            value={ethicalMetrics?.emailsThisWeek || 0}
            icon={Mail}
            change="Compliant ✓"
            isLoading={ethicalLoading}
          />
          <MetricCard
            title="Compliance Score"
            value={`${ethicalMetrics?.complianceScore || 0}%`}
            icon={CheckCircle}
            change="Masonic compliant"
            isLoading={ethicalLoading}
          />
          <MetricCard
            title="Avg Risk Score"
            value={dashboardMetrics?.avgRiskScore || 0}
            icon={AlertCircle}
            change="Clients targeted"
            isLoading={metricsLoading}
          />
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pipeline">Client Pipeline</TabsTrigger>
            <TabsTrigger value="agents">Agent Status</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Prospect Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Prospect Pipeline Trend</CardTitle>
                  <CardDescription>Weekly progress over the past month</CardDescription>
                </CardHeader>
                <CardContent>
                  {metricsLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={prospectTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="pending" stackId="a" fill="#f59e0b" />
                        <Bar dataKey="completed" stackId="a" fill="#10b981" />
                        <Bar dataKey="failed" stackId="a" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Top Violations */}
              <Card>
                <CardHeader>
                  <CardTitle>Top WCAG Violations</CardTitle>
                  <CardDescription>Most common accessibility issues found</CardDescription>
                </CardHeader>
                <CardContent>
                  {metricsLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={violationTrendData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="code" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Scans & Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Scans This Week</p>
                    <p className="text-2xl font-bold mt-2">{metricsLoading ? <Skeleton className="h-8 w-12" /> : dashboardMetrics?.scansThisWeek || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Scan Time</p>
                    <p className="text-2xl font-bold mt-2">{metricsLoading ? <Skeleton className="h-8 w-12" /> : `${dashboardMetrics?.avgScanTime || 0}s`}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Audits</p>
                    <p className="text-2xl font-bold mt-2">{metricsLoading ? <Skeleton className="h-8 w-12" /> : dashboardMetrics?.prospectsCounts.pending || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Client Pipeline Status</CardTitle>
                <CardDescription>Prospects at each stage of the sales funnel</CardDescription>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Discovery</span>
                        <Badge variant="secondary">{dashboardMetrics?.prospectsCounts.pending || 0}</Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${((dashboardMetrics?.prospectsCounts.pending || 0) / (dashboardMetrics?.prospectsCounts.total || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Audits Completed</span>
                        <Badge variant="secondary">{dashboardMetrics?.prospectsCounts.completed || 0}</Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${((dashboardMetrics?.prospectsCounts.completed || 0) / (dashboardMetrics?.prospectsCounts.total || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agent Status Tab */}
          <TabsContent value="agents" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {agentsLoading ? (
                <>
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                </>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Planner Agent</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm">{agentStatus?.planner.status}</span>
                      </div>
                      <p className="text-2xl font-bold">{agentStatus?.planner.tasksProcessed}</p>
                      <p className="text-xs text-muted-foreground">Tasks Processed</p>
                      <p className="text-xs text-muted-foreground">Uptime: {agentStatus?.planner.uptime}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Executor Agent</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm">{agentStatus?.executor.status}</span>
                      </div>
                      <p className="text-2xl font-bold">{agentStatus?.executor.jobsCompleted}</p>
                      <p className="text-xs text-muted-foreground">Jobs Completed</p>
                      <p className="text-xs text-muted-foreground">{agentStatus?.executor.jobsRunning} running</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Outreach Agent</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm">{agentStatus?.outreach.status}</span>
                      </div>
                      <p className="text-2xl font-bold">{agentStatus?.outreach.emailsSent}</p>
                      <p className="text-xs text-muted-foreground">Emails Sent</p>
                      <p className="text-xs text-muted-foreground">{agentStatus?.outreach.bounces} bounces</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Monitor Agent</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm">{agentStatus?.monitor.status}</span>
                      </div>
                      <p className="text-2xl font-bold">{agentStatus?.monitor.alerts || 0}</p>
                      <p className="text-xs text-muted-foreground">Alerts</p>
                      <p className="text-xs text-muted-foreground">Health: {agentStatus?.monitor.healthChecks}</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Masonic Ethical Compliance</CardTitle>
                <CardDescription>Compliance with 1-email-per-week rule and DNC list</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Compliance Score</span>
                      <Badge variant={ethicalMetrics?.complianceScore! >= 95 ? "default" : "secondary"}>
                        {ethicalMetrics?.complianceScore}%
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${ethicalMetrics?.complianceScore! >= 95 ? "bg-green-500" : "bg-yellow-500"}`}
                        style={{ width: `${ethicalMetrics?.complianceScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Prospects Reached</p>
                      <p className="text-2xl font-bold">{ethicalLoading ? <Skeleton className="h-8 w-12" /> : ethicalMetrics?.totalProspectsReached}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Do-Not-Contact List</p>
                      <p className="text-2xl font-bold">{ethicalLoading ? <Skeleton className="h-8 w-12" /> : ethicalMetrics?.dncListSize}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Emails This Week</p>
                      <p className="text-2xl font-bold">{ethicalLoading ? <Skeleton className="h-8 w-12" /> : ethicalMetrics?.emailsThisWeek}</p>
                      <p className="text-xs text-muted-foreground">Limit: 1 per prospect</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unsubscribe Rate</p>
                      <p className="text-2xl font-bold">{ethicalLoading ? <Skeleton className="h-8 w-12" /> : `${ethicalMetrics?.unsubscribeRate}%`}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Tracking</CardTitle>
                <CardDescription>Monthly revenue and client growth</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" />
                    <Line yAxisId="right" type="monotone" dataKey="clients" stroke="#10b981" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
