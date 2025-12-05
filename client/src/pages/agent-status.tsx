import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Play, Activity } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface AgentStatus {
  scansToday: number;
  scansCompleted: number;
  scansFailed: number;
  emailsSent: number;
  lastActivity: string;
  queuedJobs: number;
  runningJobs: number;
  failedJobs: number;
}

export default function AgentStatus() {
  const { data: status, isLoading } = useQuery<AgentStatus>({
    queryKey: ["/api/agents/status"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const runPlanner = async () => {
    try {
      await fetch("/api/agents/planner/run", { method: "POST" });
      queryClient.invalidateQueries({ queryKey: ["/api/agents/status"] });
    } catch (error) {
      console.error("Failed to run planner:", error);
    }
  };

  const runExecutor = async () => {
    try {
      await fetch("/api/agents/executor/run", { method: "POST" });
      queryClient.invalidateQueries({ queryKey: ["/api/agents/status"] });
    } catch (error) {
      console.error("Failed to run executor:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Control Center</h1>
          <p className="text-muted-foreground mt-2">
            Autonomous automation system status and controls
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/agents/status"] })}
          data-testid="button-refresh-status"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Scans Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-scans-today">
              {status?.scansToday || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600" data-testid="text-scans-completed">
              {status?.scansCompleted || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive" data-testid="text-scans-failed">
              {status?.scansFailed || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary" data-testid="text-emails-sent">
              {status?.emailsSent || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Queue Status */}
      <Card>
        <CardHeader>
          <CardTitle>Job Queue</CardTitle>
          <CardDescription>Current processing pipeline status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-md">
              <div className="text-2xl font-bold text-yellow-600" data-testid="text-queued-jobs">
                {status?.queuedJobs || 0}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Queued</div>
            </div>
            <div className="text-center p-4 border rounded-md">
              <div className="text-2xl font-bold text-blue-600" data-testid="text-running-jobs">
                {status?.runningJobs || 0}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Running</div>
            </div>
            <div className="text-center p-4 border rounded-md">
              <div className="text-2xl font-bold text-red-600" data-testid="text-failed-jobs">
                {status?.failedJobs || 0}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Failed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Planner Agent
            </CardTitle>
            <CardDescription>
              Schedules and prioritizes prospect scans
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="default">Active</Badge>
              <span className="text-sm text-muted-foreground">Runs every 60 min</span>
            </div>
            <Button
              onClick={runPlanner}
              variant="outline"
              className="w-full"
              data-testid="button-run-planner"
            >
              <Play className="h-4 w-4 mr-2" />
              Run Now
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Executor Agent
            </CardTitle>
            <CardDescription>
              Processes scans and generates reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="default">Active</Badge>
              <span className="text-sm text-muted-foreground">Runs every 15 min</span>
            </div>
            <Button
              onClick={runExecutor}
              variant="outline"
              className="w-full"
              data-testid="button-run-executor"
            >
              <Play className="h-4 w-4 mr-2" />
              Run Now
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Outreach Agent
            </CardTitle>
            <CardDescription>
              Sends emails and tracks engagement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">Disabled</Badge>
              <span className="text-sm text-muted-foreground">Manual only</span>
            </div>
            <Button variant="outline" className="w-full" disabled data-testid="button-run-outreach">
              <Play className="h-4 w-4 mr-2" />
              Run Now (Disabled)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Monitor Agent
            </CardTitle>
            <CardDescription>
              Monitors system health and retries failures
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="default">Active</Badge>
              <span className="text-sm text-muted-foreground">Runs every 30 min</span>
            </div>
            <div className="text-sm">
              Last Activity:{" "}
              {status?.lastActivity
                ? new Date(status.lastActivity).toLocaleString()
                : "Never"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform:</span>
              <span className="font-medium">Replit + PostgreSQL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Scanner:</span>
              <span className="font-medium">Puppeteer + Axe-core</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Automation:</span>
              <span className="font-medium">Agentic (Autonomous)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="default">Operational</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
