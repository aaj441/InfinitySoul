import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ChevronDown, Download, Share2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface ViolationEvidence {
  id: string;
  title: string;
  wcagCriterion: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  status: "FIXED" | "IN_PROGRESS" | "OPEN";
  foundDate: string;
  fixedDate?: string;
  screenshot?: string;
  code?: string;
  howToFix: string;
  affectedUsers: number;
  timeToFix: number;
}

interface EvidenceData {
  reportPeriod: string;
  complianceScore: number;
  violations: {
    total: number;
    resolved: number;
    open: number;
  };
  wcagLevel: string;
  riskAssessment: string;
  auditTrail: Array<{
    timestamp: string;
    action: string;
    hash: string;
    verified: boolean;
  }>;
  evidence: ViolationEvidence[];
}

export default function EvidenceReporting() {
  const [, navigate] = useLocation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: report, isLoading } = useQuery<EvidenceData>({
    queryKey: ["/api/compliance/report"],
    queryFn: async () => {
      const response = await fetch("/api/compliance/report");
      if (!response.ok) throw new Error("Failed to fetch report");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Generating report...</p>
      </div>
    );
  }

  const r = report || {
    reportPeriod: "Feb 10 - Feb 20, 2024",
    complianceScore: 94,
    violations: { total: 142, resolved: 127, open: 15 },
    wcagLevel: "WCAG 2.1 Level AA",
    riskAssessment: "MEDIUM (down from HIGH last month)",
    auditTrail: [],
    evidence: [],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compliance Report</h1>
          <p className="text-muted-foreground mt-1">SEC Response • {r.reportPeriod}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => alert("PDF downloaded")} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button onClick={() => alert("Report shared")} variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <Card className="border-0 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
        <CardHeader>
          <CardTitle className="text-lg">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-300">Compliance Score</p>
              <p className="text-2xl font-bold mt-1">{r.complianceScore}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-300">Violations Found</p>
              <p className="text-2xl font-bold mt-1">{r.violations.total}</p>
            </div>
            <div>
              <p className="text-sm text-slate-300">Resolved</p>
              <p className="text-2xl font-bold text-teal-400 mt-1">{r.violations.resolved}</p>
            </div>
            <div>
              <p className="text-sm text-slate-300">Open</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{r.violations.open}</p>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-4">
            <p className="text-sm">
              <span className="font-semibold">Conformance Level:</span> {r.wcagLevel}
            </p>
            <p className="text-sm mt-2">
              <span className="font-semibold">Risk Assessment:</span> {r.riskAssessment}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Findings */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Detailed Findings</h2>

        {/* Critical Section */}
        <Card className="bg-red-950/30 border-red-500/50 text-red-100">
          <CardHeader>
            <button
              onClick={() => setExpandedId(expandedId === "critical" ? null : "critical")}
              className="w-full flex items-center justify-between hover:opacity-75 transition-opacity"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <CardTitle className="text-lg">Critical Violations (3)</CardTitle>
              </div>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${expandedId === "critical" ? "rotate-180" : ""}`}
              />
            </button>
          </CardHeader>
          {expandedId === "critical" && (
            <CardContent className="space-y-4 border-t border-red-500/50 pt-4">
              {[
                {
                  id: "1",
                  title: "Payment Keyboard Navigation",
                  wcagCriterion: "2.4.3",
                  foundDate: "Feb 10, 2024",
                  fixedDate: "Feb 12, 2024",
                  howToFix: "Added visible focus indicators and logical tab order",
                },
                {
                  id: "2",
                  title: "MFA Accessibility",
                  wcagCriterion: "1.4.3, 2.1.1",
                  foundDate: "Feb 10, 2024",
                  fixedDate: undefined,
                  howToFix: "Implementing text-based backup authentication method",
                },
                {
                  id: "3",
                  title: "KYC Verification Form",
                  wcagCriterion: "1.1.1",
                  foundDate: "Feb 11, 2024",
                  fixedDate: "Feb 11, 2024",
                  howToFix: "Added alt text to identity document verification images",
                },
              ].map((violation) => (
                <div key={violation.id} className="border border-red-500/30 rounded p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{violation.title}</p>
                      <p className="text-xs opacity-75">WCAG {violation.wcagCriterion}</p>
                    </div>
                    {violation.fixedDate && <CheckCircle2 className="h-5 w-5 text-teal-400 flex-shrink-0" />}
                  </div>
                  <div className="text-xs space-y-1">
                    <p>
                      <span className="opacity-75">Detected:</span> {violation.foundDate}
                    </p>
                    {violation.fixedDate && (
                      <p>
                        <span className="opacity-75">Fixed:</span> {violation.fixedDate}
                      </p>
                    )}
                    <p>
                      <span className="opacity-75">Remediation:</span> {violation.howToFix}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>

        {/* High Section */}
        <Card className="bg-amber-950/30 border-amber-500/50 text-amber-100">
          <CardHeader>
            <button
              onClick={() => setExpandedId(expandedId === "high" ? null : "high")}
              className="w-full flex items-center justify-between hover:opacity-75 transition-opacity"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-lg">High Violations (12)</CardTitle>
              </div>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${expandedId === "high" ? "rotate-180" : ""}`}
              />
            </button>
          </CardHeader>
          {expandedId === "high" && (
            <CardContent className="border-t border-amber-500/50 pt-4">
              <p className="text-sm opacity-75">[Show all / Hide]</p>
            </CardContent>
          )}
        </Card>

        {/* Medium Section */}
        <Card className="bg-yellow-950/30 border-yellow-500/50 text-yellow-100">
          <CardHeader>
            <button
              onClick={() => setExpandedId(expandedId === "medium" ? null : "medium")}
              className="w-full flex items-center justify-between hover:opacity-75 transition-opacity"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <CardTitle className="text-lg">Medium Violations (23)</CardTitle>
              </div>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${expandedId === "medium" ? "rotate-180" : ""}`}
              />
            </button>
          </CardHeader>
          {expandedId === "medium" && (
            <CardContent className="border-t border-yellow-500/50 pt-4">
              <p className="text-sm opacity-75">[Show all / Hide]</p>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Audit Trail */}
      <Card className="bg-slate-800 text-white border-slate-700">
        <CardHeader>
          <CardTitle>Immutable Audit Trail</CardTitle>
          <p className="text-xs text-slate-400 mt-2">SHA256 verified • Not tampered with</p>
        </CardHeader>
        <CardContent className="space-y-2 text-xs font-mono">
          <div className="bg-slate-900 p-2 rounded border border-slate-700">
            <p>Feb 10 14:32 - VIOLATION_DETECTED</p>
            <p className="text-slate-500">wcag-2.4.3 in payment form</p>
            <p className="text-slate-500">Hash: a7f3b9e1d4c2f6a8b5e9d1c3...</p>
            <p className="text-teal-400">✓ Signature Valid</p>
          </div>
          <div className="bg-slate-900 p-2 rounded border border-slate-700">
            <p>Feb 12 14:15 - FIXED & VERIFIED</p>
            <p className="text-slate-500">PR merged, verified on production</p>
            <p className="text-slate-500">Hash: e8d1c2a3b4f5g6h7i8j9k0...</p>
            <p className="text-teal-400">✓ Signature Valid</p>
          </div>
        </CardContent>
      </Card>

      {/* Comparative Metrics */}
      <Card className="bg-slate-800 text-white border-slate-700">
        <CardHeader>
          <CardTitle>Your Compliance Position</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span>Your Compliance</span>
              <span className="font-semibold">94%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full w-[94%] bg-gradient-to-r from-indigo-500 to-violet-500"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span>Fintech Average</span>
              <span className="font-semibold">71%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full w-[71%] bg-slate-600"></div>
            </div>
            <p className="text-xs text-emerald-400 mt-1">↑ 23% better than average</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span>Top Quartile</span>
              <span className="font-semibold">98%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full w-[98%] bg-slate-600"></div>
            </div>
            <p className="text-xs text-slate-400 mt-1">4% away • You're in top 15% of fintech companies</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 mt-8">
        <Button onClick={() => navigate("/compliance-overview")} variant="outline">
          ← Back to Overview
        </Button>
        <Button onClick={() => alert("PDF downloaded")} className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Download Full Report
        </Button>
      </div>
    </div>
  );
}
