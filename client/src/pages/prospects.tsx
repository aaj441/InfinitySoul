import { ProspectTable } from "@/components/prospect-table";
import { CSVImportDialog } from "@/components/csv-import-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Prospect } from "@shared/schema";

export default function Prospects() {
  const { data: prospectsData = [], isLoading, error } = useQuery<Prospect[]>({
    queryKey: ["/api/prospects"],
  });

  const prospects = prospectsData.map(p => ({
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

  // Fallback to mock data if no prospects
  const displayProspects = prospects.length > 0 ? prospects : [
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
    {
      id: "4",
      company: "Acme Corp",
      industry: "E-commerce",
      violations: 23,
      icpScore: 67,
      status: "active" as const,
      riskLevel: "medium-risk" as const,
      lastContact: "1 week ago",
      currentTouch: "Touch 3/8",
      nextTouch: "Email - Next Monday",
    },
    {
      id: "5",
      company: "MedSupply Co",
      industry: "Healthcare",
      violations: 15,
      icpScore: 54,
      status: "paused" as const,
      riskLevel: "medium-risk" as const,
      lastContact: "2 weeks ago",
      nextTouch: "On hold",
    },
    {
      id: "6",
      company: "Legal Services LLC",
      industry: "Legal",
      violations: 6,
      icpScore: 41,
      status: "completed" as const,
      riskLevel: "low-risk" as const,
      lastContact: "1 month ago",
      nextTouch: "Completed",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Prospects</h1>
          <p className="text-muted-foreground">Loading prospects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Prospects</h1>
          <p className="text-red-600">Failed to load prospects. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Prospects</h1>
          <p className="text-muted-foreground">Manage and track your compliance prospects</p>
        </div>
        <div className="flex gap-2">
          <CSVImportDialog />
          <Button data-testid="button-add-prospect">
            <Plus className="h-4 w-4 mr-2" />
            Add Prospect
          </Button>
        </div>
      </div>

      <ProspectTable prospects={displayProspects} />
    </div>
  );
}
