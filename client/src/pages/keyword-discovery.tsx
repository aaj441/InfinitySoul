import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Prospect } from "@shared/schema";
import { Search, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { DiscoveryLoadingSkeleton, ProspectCardSkeleton } from "@/components/skeleton-loader";
import { ErrorState, EmptyState } from "@/components/error-state";

export default function KeywordDiscovery() {
  const [keywords, setKeywords] = useState("");
  const [industry, setIndustry] = useState("Finance");
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isQueuing, setIsQueuing] = useState(false);
  const [discoveredProspects, setDiscoveredProspects] = useState<Prospect[]>([]);
  const [queuedProspects, setQueuedProspects] = useState<Set<string>>(new Set());
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  const { toast } = useToast();

  const discoverMutation = useMutation({
    mutationFn: async () => {
      const keywordList = keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      if (keywordList.length === 0) throw new Error("Please enter at least one keyword");
      if (keywordList.length > 5) throw new Error("Maximum 5 keywords allowed for optimal results");

      const res = await apiRequest("POST", "/api/discovery/keywords", {
        keywords: keywordList,
        industry: industry || undefined,
        limit: 50,
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          throw new Error("Server error - please try again");
        }
        const errorMsg = errorData.error || "Failed to discover prospects";
        const suggestion = errorData.suggestion;
        throw new Error(suggestion ? `${errorMsg}\n\n${suggestion}` : errorMsg);
      }

      return res.json();
    },
    onSuccess: (data) => {
      setDiscoveredProspects(data.prospects || []);
      setDiscoveryError(null);
      
      if (data.prospects.length === 0) {
        toast({
          title: "No prospects found",
          description: "Try different keywords or industry",
          variant: "destructive",
        });
      } else {
        toast({
          title: `✅ Found ${data.prospects.length} prospects!`,
          description: "Review and queue them for scanning",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/prospects"] });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to discover prospects";
      setDiscoveryError(errorMessage);
      toast({
        title: "Discovery failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const queueProspectsMutation = useMutation({
    mutationFn: async (prospectIds: string[]) => {
      if (prospectIds.length === 0) throw new Error("No prospects to queue");
      
      const res = await apiRequest("POST", "/api/discovery/queue-for-scanning", {
        prospectIds,
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          throw new Error("Server error - please try again");
        }
        const errorMsg = errorData.error || "Failed to queue prospects";
        const suggestion = errorData.suggestion;
        throw new Error(suggestion ? `${errorMsg}\n\n${suggestion}` : errorMsg);
      }

      return res.json();
    },
    onSuccess: () => {
      setQueuedProspects(new Set(discoveredProspects.map((p) => p.id)));
      toast({
        title: `✅ Queued ${discoveredProspects.length} prospects!`,
        description: "Agents will scan them automatically",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/prospects"] });
    },
    onError: (error) => {
      toast({
        title: "Queue failed",
        description: error instanceof Error ? error.message : "Failed to queue prospects",
        variant: "destructive",
      });
    },
  });

  const handleDiscover = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDiscovering(true);
    setDiscoveryError(null);
    try {
      await discoverMutation.mutateAsync();
    } catch (error) {
      // Error already handled in mutation onError
      console.error("Discovery failed:", error);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleQueueForScanning = async () => {
    if (discoveredProspects.length === 0) return;
    
    setIsQueuing(true);
    try {
      const prospectIds = discoveredProspects.map((p) => p.id);
      await queueProspectsMutation.mutateAsync(prospectIds);
    } catch (error) {
      // Error already handled in mutation onError
      console.error("Queue failed:", error);
    } finally {
      setIsQueuing(false);
    }
  };

  const handleRetryDiscovery = async () => {
    setDiscoveryError(null);
    setIsDiscovering(true);
    try {
      await discoverMutation.mutateAsync();
    } catch (error) {
      // Error already handled in mutation onError
      console.error("Retry discovery failed:", error);
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">🔍 Prospect Discovery</h1>
        <p className="text-lg text-muted-foreground">
          Step 1: Enter keywords → Step 2: Discover companies → Step 3: Queue for scanning
        </p>
      </div>

      {/* Progress indicator */}
      {discoveredProspects.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="text-3xl font-bold text-primary">{discoveredProspects.length}</div>
            <div className="text-sm text-muted-foreground">Companies Found</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="text-3xl font-bold text-blue-600">{queuedProspects.size}</div>
            <div className="text-sm text-muted-foreground">Queued for Scan</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="text-3xl font-bold text-green-600">
              {Math.round((queuedProspects.size / discoveredProspects.length) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Ready to Scan</div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Step 1: Search Criteria</CardTitle>
          <CardDescription>Enter keywords to discover prospects in your target market</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDiscover} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords *</Label>
              <Input
                id="keywords"
                data-testid="input-keywords"
                placeholder="e.g., fintech, payment gateway, trading platform"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                disabled={isDiscovering}
              />
              <p className="text-sm text-muted-foreground">Separate multiple keywords with commas (max 3 for optimal results)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                data-testid="input-industry"
                placeholder="e.g., Finance, Healthcare, E-commerce"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                disabled={isDiscovering}
              />
            </div>

            <Button
              type="submit"
              data-testid="button-discover"
              disabled={isDiscovering || keywords.length === 0}
              className="w-full"
              size="lg"
            >
              {isDiscovering ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Discovering Prospects...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Discover Prospects
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isDiscovering && <DiscoveryLoadingSkeleton />}

      {/* Error State */}
      {discoveryError && !isDiscovering && (
        <ErrorState
          title="Discovery Failed"
          message={discoveryError}
          onRetry={handleRetryDiscovery}
          variant="error"
        />
      )}

      {/* Empty State */}
      {!isDiscovering && !discoveryError && discoveredProspects.length === 0 && keywords && (
        <EmptyState
          title="No prospects found"
          message="Try different keywords or industry to discover more companies. We recommend using 2-3 specific keywords for best results."
          action={{ label: "Try Different Keywords", onClick: () => setKeywords("") }}
        />
      )}

      {discoveredProspects.length > 0 && !isDiscovering && (
        <div className="space-y-6">
          {/* Agent Workflow Explanation */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">🤖 Agentic Automation Ready</CardTitle>
              <CardDescription>Queue these prospects for autonomous scanning by our agents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-foreground">
                Click "Queue All for Automated Scanning" to let autonomous agents handle the rest:
              </p>
              <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
                <li><strong>Planner Agent</strong> (hourly) → Prioritizes by ICP score, schedules scans</li>
                <li><strong>Executor Agent</strong> (every 15 min) → Runs WCAG audits, generates PDFs & mockups</li>
                <li><strong>Monitor Agent</strong> (every 30 min) → Tracks progress, retries failures</li>
              </ol>
              <Button
                onClick={handleQueueForScanning}
                disabled={isQueuing || queuedProspects.size > 0}
                className="w-full mt-4"
                size="lg"
                data-testid="button-queue-all-prospects"
              >
                {isQueuing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Queueing {discoveredProspects.length} Prospects...
                  </>
                ) : queuedProspects.size > 0 ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {discoveredProspects.length} Prospects Queued for Scanning
                  </>
                ) : (
                  <>
                    ⚡ Queue All {discoveredProspects.length} for Automated Scanning
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Discovered Prospects */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Discovered {discoveredProspects.length} Prospects
                </div>
              </CardTitle>
              <CardDescription>
                {queuedProspects.size > 0
                  ? "All prospects queued for autonomous agent processing"
                  : "Select how you want to scan these prospects"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {discoveredProspects.map((prospect) => (
                  <Card key={prospect.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{prospect.company}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{prospect.website}</p>
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {prospect.industry && (
                            <Badge variant="outline" data-testid={`badge-industry-${prospect.id}`}>
                              {prospect.industry}
                            </Badge>
                          )}
                          <Badge variant="secondary" data-testid={`badge-score-${prospect.id}`}>
                            ICP Score: {prospect.icpScore}/100
                          </Badge>
                          <Badge
                            variant={queuedProspects.has(prospect.id) ? "default" : "outline"}
                            data-testid={`badge-status-${prospect.id}`}
                          >
                            {queuedProspects.has(prospect.id) ? "⏳ Queued" : "Discovered"}
                          </Badge>
                        </div>
                      </div>
                      {!queuedProspects.has(prospect.id) && (
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid={`button-scan-now-${prospect.id}`}
                          asChild
                        >
                          <a href={`/scanner?url=${encodeURIComponent(prospect.website || "")}`}>
                            Scan Now
                          </a>
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
