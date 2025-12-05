import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "./status-badge";
import { Badge } from "@/components/ui/badge";
import { Mail, ExternalLink, AlertTriangle } from "lucide-react";

interface ProspectCardProps {
  companyName: string;
  industry: string;
  employees: string;
  revenue: string;
  icpScore: number;
  violations: number;
  riskLevel: "high-risk" | "medium-risk" | "low-risk";
  status: "active" | "paused" | "completed";
}

export function ProspectCard({
  companyName,
  industry,
  employees,
  revenue,
  icpScore,
  violations,
  riskLevel,
  status,
}: ProspectCardProps) {
  const initial = companyName.charAt(0).toUpperCase();
  const scoreColor = icpScore >= 80 ? "text-green-600" : icpScore >= 50 ? "text-yellow-600" : "text-red-600";

  return (
    <Card className="hover-elevate" data-testid={`prospect-card-${companyName.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">{initial}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{companyName}</CardTitle>
            <p className="text-sm text-muted-foreground">{industry}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-semibold ${scoreColor}`} data-testid="icp-score">{icpScore}</div>
          <p className="text-xs text-muted-foreground">ICP Score</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Employees</p>
            <p className="font-medium">{employees}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Revenue</p>
            <p className="font-medium">{revenue}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={riskLevel} />
          <StatusBadge status={status} />
          <Badge variant="secondary" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            {violations} violations
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="gap-2 flex-wrap">
        <Button size="sm" className="flex-1" data-testid="button-send-email">
          <Mail className="h-3 w-3 mr-1" />
          Send Email
        </Button>
        <Button size="sm" variant="outline" data-testid="button-view-details">
          <ExternalLink className="h-3 w-3 mr-1" />
          Details
        </Button>
      </CardFooter>
    </Card>
  );
}
