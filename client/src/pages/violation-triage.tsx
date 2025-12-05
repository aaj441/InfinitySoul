import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ChevronDown, MoreVertical, CheckCircle2, Zap, AlertTriangle, GripVertical } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Violation {
  id: string;
  title: string;
  wcagCriterion: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  affectedUsers: number;
  businessFlow: string;
  location: string;
  status: "OPEN" | "IN_PROGRESS" | "BLOCKED" | "FIXED";
  owner?: string;
  deadline?: string;
  hoursRemaining?: number;
}

interface TriageData {
  violations: Violation[];
  totalCount: number;
}

export default function ViolationTriage() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const filterParam = searchParams.get("filter") || "all";
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"urgency" | "owner" | "impact" | "date">("urgency");

  const { data: triage, isLoading } = useQuery<TriageData>({
    queryKey: ["/api/compliance/triage", filterParam],
    queryFn: async () => {
      const response = await fetch(`/api/compliance/triage?filter=${filterParam}`);
      if (!response.ok) throw new Error("Failed to fetch violations");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading violations...</p>
      </div>
    );
  }

  const violations = triage?.violations || [];

  // Sort violations
  const sorted = [...violations].sort((a, b) => {
    if (sortBy === "urgency") {
      const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    } else if (sortBy === "impact") {
      return b.affectedUsers - a.affectedUsers;
    } else if (sortBy === "date") {
      return (a.hoursRemaining || 999) - (b.hoursRemaining || 999);
    }
    return 0;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-950 text-red-200 border-red-500/50";
      case "HIGH":
        return "bg-amber-950 text-amber-200 border-amber-500/50";
      case "MEDIUM":
        return "bg-yellow-950 text-yellow-200 border-yellow-500/50";
      default:
        return "bg-emerald-950 text-emerald-200 border-emerald-500/50";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "🔴";
      case "HIGH":
        return "🟠";
      case "MEDIUM":
        return "🟡";
      default:
        return "🟢";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "FIXED":
        return "text-teal-400";
      case "IN_PROGRESS":
        return "text-indigo-400";
      case "BLOCKED":
        return "text-purple-400";
      default:
        return "text-slate-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "FIXED":
        return <CheckCircle2 className="h-4 w-4" />;
      case "IN_PROGRESS":
        return <Zap className="h-4 w-4" />;
      case "BLOCKED":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Violation Triage</h1>
          <p className="text-muted-foreground mt-1">Route violations to owners • {sorted.length} total</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterParam === "critical" ? "default" : "outline"}
            size="sm"
            onClick={() => navigate("/violation-triage?filter=critical")}
          >
            CRITICAL
          </Button>
          <Button
            variant={filterParam === "high" ? "default" : "outline"}
            size="sm"
            onClick={() => navigate("/violation-triage?filter=high")}
          >
            HIGH
          </Button>
          <Button
            variant={filterParam === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => navigate("/violation-triage?filter=all")}
          >
            ALL
          </Button>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Sort by:</span>
        <Button
          variant={sortBy === "urgency" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("urgency")}
        >
          Urgency
        </Button>
        <Button
          variant={sortBy === "impact" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("impact")}
        >
          Impact
        </Button>
        <Button
          variant={sortBy === "date" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("date")}
        >
          Deadline
        </Button>
      </div>

      {/* Violation Cards */}
      <div className="space-y-3">
        {sorted.map((violation) => (
          <Card
            key={violation.id}
            className={`${getSeverityColor(violation.severity)} border cursor-pointer hover-elevate overflow-hidden`}
            data-testid={`card-violation-${violation.id}`}
          >
            <CardContent className="p-0">
              {/* Header Row */}
              <div className="flex items-start gap-3 p-4 pb-0">
                <GripVertical className="h-5 w-5 flex-shrink-0 mt-1 opacity-50" />

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getSeverityIcon(violation.severity)}</span>
                        <h3 className="font-semibold">{violation.title}</h3>
                      </div>
                      <p className="text-xs opacity-75 mt-1">WCAG {violation.wcagCriterion}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {violation.severity}
                      </Badge>
                    </div>
                  </div>

                  {/* Info Row */}
                  <div className="grid grid-cols-3 gap-4 mt-3 text-xs">
                    <div>
                      <p className="opacity-75">Affected</p>
                      <p className="font-semibold">{violation.affectedUsers}% users</p>
                    </div>
                    <div>
                      <p className="opacity-75">Business Flow</p>
                      <p className="font-semibold">{violation.businessFlow}</p>
                    </div>
                    <div>
                      <p className="opacity-75">Location</p>
                      <p className="font-semibold">{violation.location}</p>
                    </div>
                  </div>

                  {/* Status Row */}
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 ${getStatusColor(violation.status)}`}>
                        {getStatusIcon(violation.status)}
                        <span className="font-medium">{violation.status}</span>
                      </div>
                      {violation.owner && (
                        <span className="opacity-75">Owner: {violation.owner}</span>
                      )}
                    </div>
                    {violation.hoursRemaining && (
                      <span className={violation.hoursRemaining < 4 ? "text-red-300 font-semibold" : ""}>
                        {violation.hoursRemaining}h remaining
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setExpandedId(expandedId === violation.id ? null : violation.id)}>
                      {expandedId === violation.id ? "Hide Details" : "Show Details"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log("Mark done")}>
                      Mark Done
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log("Reassign")}>
                      Reassign
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log("Escalate")}>
                      Escalate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Expanded Details */}
              {expandedId === violation.id && (
                <div className="px-4 py-3 border-t opacity-75 space-y-2 text-xs">
                  <div>
                    <p className="font-semibold mb-1">Regulatory Risk</p>
                    <p>Payment flow violation = potential $2.8M settlement precedent</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Remediation</p>
                    <p>Add visible focus indicator + keyboard navigation support (Est. 2 hours)</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="text-xs" onClick={() => navigate("/evidence-reporting")}>
                      View Code
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      Request Help
                    </Button>
                  </div>
                </div>
              )}

              {/* Collapse Control */}
              <button
                onClick={() => setExpandedId(expandedId === violation.id ? null : violation.id)}
                className="w-full px-4 py-2 text-xs opacity-50 hover:opacity-75 transition-opacity flex items-center justify-center gap-1"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${expandedId === violation.id ? "rotate-180" : ""}`}
                />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">No violations found</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-8">
        <Button onClick={() => navigate("/compliance-overview")} variant="outline">
          ← Back to Overview
        </Button>
        <Button onClick={() => navigate("/evidence-reporting")} className="flex-1">
          Generate Compliance Report →
        </Button>
      </div>
    </div>
  );
}
