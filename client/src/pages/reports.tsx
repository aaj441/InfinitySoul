import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye } from "lucide-react";

const mockReports = [
  {
    id: 1,
    company: "TechCorp Inc",
    date: "2025-01-15",
    wcagScore: 62,
    violations: 18,
    status: "completed",
  },
  {
    id: 2,
    company: "Global Solutions",
    date: "2025-01-12",
    wcagScore: 85,
    violations: 5,
    status: "completed",
  },
  {
    id: 3,
    company: "StartupX",
    date: "2025-01-10",
    wcagScore: 45,
    violations: 32,
    status: "completed",
  },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Reports</h1>
        <p className="text-muted-foreground mt-2">
          Manage and review accessibility audit reports
        </p>
      </div>

      <div className="space-y-4">
        {mockReports.map((report) => (
          <Card key={report.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg" data-testid={`text-company-${report.id}`}>
                    {report.company}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Audited: {new Date(report.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{report.wcagScore}</div>
                    <div className="text-xs text-muted-foreground">WCAG Score</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-destructive">{report.violations}</div>
                    <div className="text-xs text-muted-foreground">Issues</div>
                  </div>

                  <Badge
                    variant={report.wcagScore >= 80 ? "secondary" : report.wcagScore >= 60 ? "outline" : "destructive"}
                    data-testid={`badge-score-${report.id}`}
                  >
                    {report.wcagScore >= 80 ? "Good" : report.wcagScore >= 60 ? "Fair" : "Poor"}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" data-testid={`button-view-${report.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button size="sm" data-testid={`button-download-${report.id}`}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
