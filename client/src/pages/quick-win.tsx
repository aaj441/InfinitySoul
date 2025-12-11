import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { ScanJob, ScanResult, AuditReport } from "@shared/schema";
import { AlertCircle, CheckCircle2, Download, Calendar, Zap } from "lucide-react";
import { KeyboardShortcut } from "@/components/keyboard-shortcut";

interface RegeneratedWebsite {
  scanJobId: string;
  improvements: string[];
  wcagImprovements: {
    before: number;
    after: number;
    fixed: string[];
  };
  mockup: {
    htmlPath: string;
    cssPath: string;
    previewUrl: string;
  };
  downloadUrls: {
    html: string;
    css: string;
    zip: string;
  };
}

export default function QuickWin() {
  const [url, setUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [scanJobId, setScanJobId] = useState<string | null>(null);
  const [regeneratedWebsite, setRegeneratedWebsite] = useState<RegeneratedWebsite | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  // Note: Keyboard shortcuts are handled globally by useGlobalShortcuts in App.tsx
  // No need for duplicate listeners here

  // Start scan mutation
  const startScanMutation = useMutation({
    mutationFn: async (data: { url: string; companyName?: string }) => {
      const res = await apiRequest("POST", "/api/scan/quick-win", data);
      return res.json();
    },
    onSuccess: (scanJob: ScanJob) => {
      setScanJobId(scanJob.id);
      toast({
        title: "Scan started",
        description: "Analyzing your website for accessibility violations...",
      });
    },
    onError: (error) => {
      toast({
        title: "Scan failed",
        description: error instanceof Error ? error.message : "Failed to start scan",
        variant: "destructive",
      });
    },
  });

  // Poll for scan job status
  const { data: scanJob, isLoading: scanLoading } = useQuery<ScanJob>({
    queryKey: ["/api/scan", scanJobId],
    enabled: !!scanJobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "completed" || data?.status === "failed") {
        return false;
      }
      return 2000; // Poll every 2 seconds while running
    },
  });

  // Get scan results
  const { data: scanResults = [] } = useQuery<ScanResult[]>({
    queryKey: ["/api/scan", scanJobId, "results"],
    enabled: !!scanJobId && scanJob?.status === "completed",
  });

  // Get audit report
  const { data: auditReport } = useQuery<AuditReport>({
    queryKey: ["/api/scan", scanJobId, "report"],
    enabled: !!scanJobId && scanJob?.status === "completed",
  });

  // Generate improved website mutation
  const generateWebsiteMutation = useMutation({
    mutationFn: async (scanId: string) => {
      const res = await apiRequest("POST", `/api/scan/${scanId}/regenerate`, {});
      return res.json();
    },
    onSuccess: (data: RegeneratedWebsite) => {
      setRegeneratedWebsite(data);
      toast({
        title: "Improved website generated!",
        description: "View the accessible version and download the code below.",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate improved website",
        variant: "destructive",
      });
    },
  });

  const handleStartScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    startScanMutation.mutate({ url, companyName });
  };

  const handleReset = () => {
    setUrl("");
    setCompanyName("");
    setScanJobId(null);
    setRegeneratedWebsite(null);
  };

  const handleGenerateImprovedVersion = () => {
    if (scanJobId) {
      generateWebsiteMutation.mutate(scanJobId);
    }
  };

  const getRiskLevel = (criticalCount: number) => {
    if (criticalCount > 5) return { label: "HIGH", color: "destructive" as const };
    if (criticalCount > 0) return { label: "MEDIUM", color: "secondary" as const };
    return { label: "LOW", color: "secondary" as const };
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      Critical: "destructive",
      High: "warning",
      Medium: "secondary",
      Low: "outline",
    };
    return colors[severity as keyof typeof colors] || "secondary";
  };

  // Initial form
  if (!scanJobId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
        {/* HERO SECTION - Origin Story */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
            <div className="text-center space-y-4 sm:space-y-6">
              <div>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-2 sm:mb-4">
                  Audits at 10x Speed
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400">
                  Built for accessibility consultants to scale their practice with AI-powered audits
                </p>
              </div>

              {/* Origin Story */}
              <div className="max-w-3xl mx-auto bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20 dark:border-slate-700/20">
                <p className="text-sm sm:text-base lg:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  I built this platform as an AI consultant who recognized a critical gap: accessibility experts were drowning in manual audits, spending 40+ hours per engagement on repetitive scans and documentation. The opportunity was clear—use AI to eliminate the busywork, so consultants could focus on strategy and client relationships. Today, this platform helps consultants deliver what used to take a week in 24 hours, opening room for 10x more engagements. You're not replacing yourself; you're amplifying your value.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="max-w-4xl mx-auto space-y-xl sm:space-y-2xl lg:space-y-3xl px-4 sm:px-6 pb-xl sm:pb-2xl lg:pb-3xl">
          {/* PRIMARY SECTION: Keyword Discovery (Like Google) */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-lg sm:p-xl lg:p-2xl shadow-xl border border-white/20 dark:border-slate-700/20">
            <div className="space-y-lg sm:space-y-xl">
              <div className="space-y-md">
                <h2 className="text-2xl sm:text-3xl lg:text-3xl font-semibold text-slate-800 dark:text-slate-100">Discover Companies</h2>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 line-height-relaxed">Enter keywords to find prospects matching your target market</p>
              </div>
              
              <a href="/discovery" className="block w-full">
                <Button
                  size="lg"
                  className="w-full font-semibold min-h-12 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2"
                  data-testid="button-go-to-keyword-discovery"
                >
                  <span className="text-sm sm:text-base whitespace-normal">Search by Keywords (Primary Workflow)</span>
                  <KeyboardShortcut keys={['cmd', 'd']} />
                </Button>
              </a>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="flex items-center gap-md sm:gap-lg">
            <div className="flex-1 h-px bg-slate-400 dark:bg-slate-500" />
            <span className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-slate-400 dark:bg-slate-500" />
          </div>

          {/* SECONDARY SECTION: Quick URL Audit */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-lg sm:p-xl lg:p-2xl shadow-xl border border-white/20 dark:border-slate-700/20">
            <div className="space-y-lg sm:space-y-xl">
              <div className="space-y-md">
                <h2 className="text-xl sm:text-2xl lg:text-2xl font-semibold text-slate-800 dark:text-slate-100">Scan Specific Website</h2>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 line-height-relaxed">Audit a single URL directly</p>
              </div>
              
              <form onSubmit={handleStartScan} className="space-y-md sm:space-y-lg">
                <div className="space-y-md">
                  <Label htmlFor="url" className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">Website URL</Label>
                  <Input
                    id="url"
                    data-testid="input-website-url"
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    className="rounded-xl bg-white/80 dark:bg-slate-950/80 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base h-11 sm:h-12 px-md sm:px-lg"
                  />
                </div>

                <div className="space-y-md">
                  <Label htmlFor="company" className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300">Company Name (Optional)</Label>
                  <Input
                    id="company"
                    data-testid="input-company-name"
                    placeholder="Acme Inc"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="rounded-xl bg-white/80 dark:bg-slate-950/80 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base h-11 sm:h-12 px-md sm:px-lg"
                  />
                </div>

                <Button
                  type="submit"
                  data-testid="button-start-scan"
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg min-h-12"
                  disabled={startScanMutation.isPending}
                >
                  {startScanMutation.isPending ? "Scanning..." : "Start Audit"}
                </Button>
              </form>
            </div>
          </div>

        <Card style={{ backgroundColor: "hsl(var(--primary) / 0.05)" }}>
          <CardContent className="pt-lg sm:pt-xl lg:pt-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg sm:gap-xl lg:gap-2xl text-center">
              <div className="space-y-md">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">5 min</div>
                <div className="text-sm sm:text-base text-muted-foreground font-medium">Scan Duration</div>
              </div>
              <div className="space-y-md">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">Top 5</div>
                <div className="text-sm sm:text-base text-muted-foreground font-medium">Critical Issues</div>
              </div>
              <div className="space-y-md">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">PDF</div>
                <div className="text-sm sm:text-base text-muted-foreground font-medium">Report Download</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Mode Card */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 dark:from-yellow-500/5 dark:to-orange-500/5 backdrop-blur-sm rounded-2xl p-lg sm:p-xl lg:p-2xl border border-yellow-500/20 dark:border-yellow-500/10">
          <div className="flex flex-col sm:flex-row items-start gap-lg sm:gap-xl">
            <Zap className="h-6 sm:h-8 w-6 sm:w-8 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-md" />
            <div className="flex-1 space-y-lg">
              <div className="space-y-md">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100">Agent Mode - Full Automation</h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 line-height-relaxed">
                  Run the entire workflow automatically: Discover → Scan → Report → Email
                </p>
              </div>
              <Button
                onClick={() => {
                  const event = new CustomEvent('trigger-agent-mode');
                  window.dispatchEvent(event);
                }}
                variant="default"
                className="bg-yellow-600 hover:bg-yellow-700 text-white gap-2 min-h-12"
                data-testid="button-trigger-agent-mode"
              >
                <Zap className="h-4 w-4" />
                Launch Agent Mode
                <KeyboardShortcut keys={['cmd', 'shift', 'a']} />
              </Button>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Help */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">⌨️ Keyboard Shortcuts</CardTitle>
            <CardDescription className="text-sm sm:text-base">Speed up your workflow with these shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md sm:gap-lg">
              <div className="flex items-center justify-between p-md sm:p-lg rounded-lg bg-muted/50 flex-col sm:flex-row gap-md">
                <span className="text-sm sm:text-base font-medium">Open Command Palette</span>
                <KeyboardShortcut keys={['cmd', 'k']} />
              </div>
              <div className="flex items-center justify-between p-md sm:p-lg rounded-lg bg-muted/50 flex-col sm:flex-row gap-md">
                <span className="text-sm sm:text-base font-medium">Keyword Discovery</span>
                <KeyboardShortcut keys={['cmd', 'd']} />
              </div>
              <div className="flex items-center justify-between p-md sm:p-lg rounded-lg bg-muted/50 flex-col sm:flex-row gap-md">
                <span className="text-sm sm:text-base font-medium">WCAG Scanner</span>
                <KeyboardShortcut keys={['cmd', 's']} />
              </div>
              <div className="flex items-center justify-between p-md sm:p-lg rounded-lg bg-muted/50 flex-col sm:flex-row gap-md">
                <span className="text-sm sm:text-base font-medium">Audit Reports</span>
                <KeyboardShortcut keys={['cmd', 'r']} />
              </div>
              <div className="flex items-center justify-between p-md sm:p-lg rounded-lg bg-muted/50 flex-col sm:flex-row gap-md">
                <span className="text-sm sm:text-base font-medium">Email Outreach</span>
                <KeyboardShortcut keys={['cmd', 'e']} />
              </div>
              <div className="flex items-center justify-between p-md sm:p-lg rounded-lg bg-muted/50 flex-col sm:flex-row gap-md">
                <span className="text-sm sm:text-base font-medium">Dashboard</span>
                <KeyboardShortcut keys={['cmd', 't']} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    );
  }

  // Scanning in progress
  if (!scanJob || scanJob.status === "pending" || scanJob.status === "running") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
              Scanning Website...
            </CardTitle>
            <CardDescription>
              Analyzing {url} for WCAG accessibility violations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={33} />
            <div className="text-sm text-muted-foreground text-center">
              This typically takes 2-5 minutes. Please don't close this page.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Scan failed
  if (scanJob.status === "failed") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Scan Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {scanJob.errorMessage || "An error occurred while scanning the website"}
            </p>
            <Button onClick={handleReset} data-testid="button-try-again">
              Try Another Website
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Scan completed - show results
  const riskLevel = getRiskLevel(scanJob.criticalCount);
  const topViolations = scanResults.slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accessibility Audit Report</h1>
          {companyName && <p className="text-muted-foreground mt-1">{companyName}</p>}
          <p className="text-sm text-muted-foreground">{url}</p>
        </div>
        <Button onClick={handleReset} variant="outline" data-testid="button-new-scan">
          New Scan
        </Button>
      </div>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold">{scanJob.wcagScore}</div>
              <div className="text-sm text-muted-foreground">WCAG Score</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-destructive">{scanJob.criticalCount}</div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600">{scanJob.seriousCount}</div>
              <div className="text-sm text-muted-foreground">Serious</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600">{scanJob.moderateCount}</div>
              <div className="text-sm text-muted-foreground">Moderate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-600">{scanJob.minorCount}</div>
              <div className="text-sm text-muted-foreground">Minor</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Risk */}
      <Card>
        <CardHeader>
          <CardTitle>Legal Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Risk Level:</span>
            <Badge variant={riskLevel.color} data-testid="badge-risk-level">
              {riskLevel.label}
            </Badge>
          </div>
          <p className="text-sm">
            {riskLevel.label === "HIGH" &&
              "Your website has critical accessibility violations that could result in legal action under the ADA. Recent settlements in similar cases have ranged from $50,000 to $450,000."}
            {riskLevel.label === "MEDIUM" &&
              "Your website has accessibility issues that increase legal liability. Proactive remediation is recommended to avoid potential lawsuits."}
            {riskLevel.label === "LOW" &&
              "Your website shows good accessibility practices, but some improvements would enhance compliance and user experience."}
          </p>
        </CardContent>
      </Card>

      {/* Top 5 Violations */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Critical Violations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topViolations.map((violation, index) => (
            <Card key={violation.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-destructive text-white flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold">{violation.violationType}</h4>
                      <Badge variant={getSeverityColor(violation.severity) as any}>
                        {violation.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      WCAG {violation.wcagCriterion} • Level {violation.wcagLevel}
                    </p>
                    <p className="text-sm">{violation.description}</p>
                    {violation.element && (
                      <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                        {violation.element}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Estimated Remediation */}
      {auditReport && (
        <Card>
          <CardHeader>
            <CardTitle>Estimated Remediation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Timeline</div>
                <div className="text-xl font-bold">{auditReport.estimatedTimeline}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Investment</div>
                <div className="text-xl font-bold">{auditReport.estimatedCost}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Improved Website Generator */}
      <Card style={{ backgroundColor: "hsl(var(--primary) / 0.05)" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            See Your Website - Fully Accessible
          </CardTitle>
          <CardDescription>
            Generate an AI-powered mockup showing what your website would look like with all accessibility issues fixed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!regeneratedWebsite && !generateWebsiteMutation.isPending && (
            <Button
              onClick={handleGenerateImprovedVersion}
              data-testid="button-generate-improved"
              className="w-full"
              size="lg"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Generate Accessible Version
            </Button>
          )}

          {generateWebsiteMutation.isPending && (
            <div className="text-center space-y-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-sm text-muted-foreground">
                Generating your improved website with AI...
              </p>
              <p className="text-xs text-muted-foreground">
                This may take 30-60 seconds
              </p>
            </div>
          )}

          {regeneratedWebsite && (
            <div className="space-y-6">
              {/* Before/After Comparison */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-background rounded-lg">
                <div className="text-center">
                  <div className="text-4xl font-bold text-destructive">
                    {regeneratedWebsite.wcagImprovements.before}
                  </div>
                  <div className="text-sm text-muted-foreground">Before Score</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">
                    {regeneratedWebsite.wcagImprovements.after}
                  </div>
                  <div className="text-sm text-muted-foreground">Projected Score</div>
                </div>
              </div>

              {/* Improvements List */}
              <div>
                <h4 className="font-semibold mb-3">Key Improvements:</h4>
                <ul className="space-y-2">
                  {regeneratedWebsite.improvements.slice(0, 5).map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Fixed Violations */}
              {regeneratedWebsite.wcagImprovements.fixed.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Fixed Violations:</h4>
                  <div className="flex flex-wrap gap-2">
                    {regeneratedWebsite.wcagImprovements.fixed.slice(0, 6).map((violation, index) => (
                      <Badge key={index} variant="secondary">
                        {violation}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Download Options */}
              <div className="flex gap-2 flex-wrap">
                <Button variant="default" asChild data-testid="button-download-zip">
                  <a href={`/api/scan/${scanJobId}/mockup/download`} download>
                    <Download className="h-4 w-4 mr-2" />
                    Download Complete Package (ZIP)
                  </a>
                </Button>
                <Button variant="outline" asChild data-testid="button-download-html">
                  <a href={regeneratedWebsite.downloadUrls.html} download>
                    Download HTML Only
                  </a>
                </Button>
                <Button variant="outline" asChild data-testid="button-preview-mockup">
                  <a href={`/mockups/${scanJobId}`} target="_blank" rel="noopener noreferrer">
                    Preview Improved Website
                  </a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CTA */}
      <Card style={{ backgroundColor: "hsl(var(--primary) / 0.1)" }}>
        <CardContent className="pt-6 pb-6 text-center space-y-4">
          <h3 className="text-2xl font-bold">Ready to Fix These Issues?</h3>
          <p className="text-muted-foreground">
            Schedule a free 30-minute consultation to discuss a customized remediation plan
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {auditReport?.pdfUrl && (
              <Button variant="outline" asChild data-testid="button-download-pdf">
                <a href={auditReport.pdfUrl} download>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF Report
                </a>
              </Button>
            )}
            <Button data-testid="button-schedule-call">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Free Consultation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
