import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink, X } from "lucide-react";
import { useState } from "react";

interface LawsuitAlertProps {
  company: string;
  industry: string;
  court: string;
  date: string;
  similarity: number;
}

export function LawsuitAlert({ company, industry, court, date, similarity }: LawsuitAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <Alert className="border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30" data-testid="lawsuit-alert">
      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
      <AlertTitle className="text-red-900 dark:text-red-100 font-semibold">New Lawsuit Alert</AlertTitle>
      <AlertDescription className="text-red-800 dark:text-red-200">
        <div className="mt-2 space-y-1">
          <p><strong>{company}</strong> ({industry}) was sued in {court}</p>
          <p className="text-sm">Filed: {date} • {similarity}% similar to your prospects</p>
        </div>
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="default" className="bg-red-600 hover:bg-red-700" data-testid="button-view-lawsuit">
            <ExternalLink className="h-3 w-3 mr-1" />
            View Case Details
          </Button>
          <Button size="sm" variant="outline" data-testid="button-trigger-outreach">
            Trigger Outreach
          </Button>
        </div>
      </AlertDescription>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2"
        onClick={() => setDismissed(true)}
        data-testid="button-dismiss-alert"
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
}
