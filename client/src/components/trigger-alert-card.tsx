import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TriggerAlertCardProps {
  type: "lawsuit" | "redesign" | "funding";
  title: string;
  description: string;
  primaryAction: string;
  emoji: string;
}

export function TriggerAlertCard({ type, title, description, primaryAction, emoji }: TriggerAlertCardProps) {
  const typeColors = {
    lawsuit: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    redesign: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    funding: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  };

  const typeLabels = {
    lawsuit: "LAWSUIT FILED",
    redesign: "REDESIGN DETECTED",
    funding: "NEW FUNDING",
  };

  return (
    <Card className="border-l-4 border-l-primary" data-testid={`trigger-alert-${type}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{emoji}</span>
            <Badge variant="secondary" className={typeColors[type]}>
              {typeLabels[type]}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-base mt-2">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex gap-2">
          <Button size="sm" data-testid={`button-${type}-action`}>
            {primaryAction}
          </Button>
          <Button size="sm" variant="outline" data-testid={`button-${type}-dismiss`}>
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
