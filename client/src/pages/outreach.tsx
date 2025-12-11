import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ArrowRight, Mail, Zap, TrendingUp, Clock } from "lucide-react";

const INDUSTRIES = [
  "Financial Services",
  "Healthcare",
  "Legal Services",
  "E-commerce",
  "Technology",
  "Manufacturing",
  "Real Estate",
];

export default function OutreachPage() {
  const { toast } = useToast();
  const [keywords, setKeywords] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("Financial Services");
  const [workflowId, setWorkflowId] = useState<string | null>(null);

  // Fetch workflows
  const { data: workflowsData } = useQuery({
    queryKey: ["/api/outreach/workflows"],
    queryFn: () => apiRequest("/api/outreach/workflows"),
  });

  // Fetch workflow steps
  const { data: stepsData } = useQuery({
    queryKey: ["/api/outreach/workflow-steps"],
    queryFn: () => apiRequest("/api/outreach/workflow-steps"),
  });

  // Fetch current workflow status
  const { data: currentWorkflow, refetch: refetchWorkflow } = useQuery({
    queryKey: ["/api/outreach/workflow", workflowId],
    queryFn: () => (workflowId ? apiRequest(`/api/outreach/workflow/${workflowId}`) : null),
    enabled: !!workflowId,
    refetchInterval: 3000,
  });

  // Fetch metrics
  const { data: metricsData } = useQuery({
    queryKey: ["/api/outreach/metrics"],
    queryFn: () => apiRequest("/api/outreach/metrics"),
    refetchInterval: 5000,
  });

  // Create workflow mutation
  const createWorkflowMutation = useMutation({
    mutationFn: async () => {
      if (!keywords.trim()) {
        throw new Error("Please enter keywords");
      }

      const keywordArray = keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k);

      return apiRequest("/api/outreach/workflow", {
        method: "POST",
        body: JSON.stringify({
          keywords: keywordArray,
          industry: selectedIndustry,
        }),
      });
    },
    onSuccess: (data) => {
      setWorkflowId(data.workflowId);
      toast({
        title: "Workflow created!",
        description: `Found ${data.prospectCount} prospects for outreach`,
      });
      setKeywords("");
      queryClient.invalidateQueries({ queryKey: ["/api/outreach/workflows"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create workflow",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Outreach Automation</h1>
        <p className="text-muted-foreground">
          AI-powered workflow for discovering, scanning, and reaching out to prospects
        </p>
      </div>

      {/* Create Workflow Section */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Outreach Campaign</CardTitle>
          <CardDescription>
            Enter keywords and select an industry to discover prospects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Keywords (comma-separated)</label>
              <Input
                data-testid="input-keywords"
                placeholder="e.g., debt collector, accounts receivable"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Industry</label>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger data-testid="select-industry">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            data-testid="button-create-workflow"
            onClick={() => createWorkflowMutation.mutate()}
            disabled={createWorkflowMutation.isPending}
            className="w-full sm:w-auto"
          >
            {createWorkflowMutation.isPending ? "Creating..." : "Queue for Scanning"}
            <Zap className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      {stepsData?.steps && (
        <Card>
          <CardHeader>
            <CardTitle>Automation Pipeline</CardTitle>
            <CardDescription>How your campaign moves through our system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stepsData.steps.map((step: any, idx: number) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{step.name}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">⏱ {step.timing}</p>
                  </div>
                  {idx < stepsData.steps.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-muted-foreground mt-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Workflow Status */}
      {currentWorkflow && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Workflow: {currentWorkflow.workflowId}</CardTitle>
                <CardDescription>Status: {currentWorkflow.status}</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => setWorkflowId(null)}>
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Prospects</p>
                <p className="text-2xl font-bold">{currentWorkflow.prospectCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Scanned</p>
                <p className="text-2xl font-bold">{currentWorkflow.scannedCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Emails Sent</p>
                <p className="text-2xl font-bold">{currentWorkflow.emailsSent}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{currentWorkflow.successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Dashboard */}
      {metricsData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Outreach</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricsData.total}</div>
              <p className="text-xs text-muted-foreground">
                {metricsData.pending} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricsData.sent}</div>
              <p className="text-xs text-muted-foreground">
                {metricsData.opened} opened
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricsData.openRate}%</div>
              <p className="text-xs text-muted-foreground">
                {metricsData.opened} opened
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metricsData.clickRate}%</div>
              <p className="text-xs text-muted-foreground">
                {metricsData.clicked} clicked
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Workflows */}
      {workflowsData?.workflows && workflowsData.workflows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign History</CardTitle>
            <CardDescription>Your recent outreach campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workflowsData.workflows.slice(0, 5).map((w: any) => (
                <div
                  key={w.workflowId}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{w.workflowId}</p>
                    <p className="text-sm text-muted-foreground">
                      {w.prospectCount} prospects • {w.emailsSent} emails sent
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(w.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    data-testid="button-view-workflow"
                    size="sm"
                    variant="outline"
                    onClick={() => setWorkflowId(w.workflowId)}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
