import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface CadenceStep {
  step: number;
  title: string;
  status: "completed" | "current" | "pending";
  date?: string;
}

interface EmailCadenceProgressProps {
  steps: CadenceStep[];
}

export function EmailCadenceProgress({ steps }: EmailCadenceProgressProps) {
  const completedSteps = steps.filter(s => s.status === "completed").length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <Card data-testid="email-cadence-progress">
      <CardHeader>
        <CardTitle className="text-base">8-Touch Email Cadence</CardTitle>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Progress:</span>
          <span className="font-medium">{completedSteps} of {steps.length} touches</span>
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.step}
              className="flex items-start gap-3"
              data-testid={`cadence-step-${step.step}`}
            >
              {step.status === "completed" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              ) : step.status === "current" ? (
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${step.status === "pending" ? "text-muted-foreground" : ""}`}>
                  Touch {step.step}: {step.title}
                </p>
                {step.date && (
                  <p className="text-xs text-muted-foreground">{step.date}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
