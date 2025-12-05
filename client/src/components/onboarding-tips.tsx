import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Rocket,
  Target,
  Zap,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Gauge,
  Bot,
  X,
} from "lucide-react";

// ============================================
// ONBOARDING TIPS & WORKFLOW ORCHESTRATION
// ============================================
// This component guides users through the synergistic
// AI-assisted workflow: You're the pilot, AI is mission control.
// ============================================

export interface OnboardingTip {
  id: string;
  title: string;
  description: string;
  icon: "rocket" | "target" | "zap" | "lightbulb" | "gauge" | "bot";
  category: "control" | "workflow" | "automation" | "insight";
  action?: {
    label: string;
    route?: string;
    onClick?: () => void;
  };
}

// Cockpit/Control metaphor tips for user empowerment
export const ONBOARDING_TIPS: OnboardingTip[] = [
  {
    id: "welcome-cockpit",
    title: "You're at the Controls",
    description:
      "Your dashboard is mission control. Queue keywords, track scans, and activate outreach—all with AI guidance. You decide what happens next.",
    icon: "gauge",
    category: "control",
    action: { label: "View Dashboard", route: "/" },
  },
  {
    id: "keyword-entry",
    title: "Enter Your Target Industry",
    description:
      "Type a keyword like 'debt collectors' or 'healthcare billing'. The AI agent finds matching prospects, scores them by ICP, and queues them for scanning.",
    icon: "target",
    category: "workflow",
    action: { label: "Start Prospecting", route: "/outreach" },
  },
  {
    id: "agent-automation",
    title: "AI Agent Does the Heavy Lifting",
    description:
      "Once you trigger a workflow, the Planner, Executor, and Outreach agents handle scanning, reporting, and follow-ups. You oversee strategy—they execute.",
    icon: "bot",
    category: "automation",
  },
  {
    id: "scan-results",
    title: "Review Scan Results & Reports",
    description:
      "Each prospect gets a WCAG compliance scan with PDF report. See violations, legal risk scores, and personalized outreach drafts—ready to send.",
    icon: "zap",
    category: "insight",
    action: { label: "View Prospects", route: "/prospects" },
  },
  {
    id: "outreach-action",
    title: "Deploy Outreach with One Click",
    description:
      "Generate cold emails using AIDA framework, attach audit PDFs, and send directly or copy to your CRM. Follow-up sequences run automatically if enabled.",
    icon: "rocket",
    category: "workflow",
    action: { label: "Create Campaign", route: "/outreach" },
  },
  {
    id: "pilot-tip",
    title: "You're the Pilot, AI is Co-Pilot",
    description:
      "Delegate repetitive tasks to agents. Focus on high-impact decisions: which industries to target, when to escalate, how to personalize your pitch.",
    icon: "lightbulb",
    category: "control",
  },
];

// Workflow steps for progress tracking
export const WORKFLOW_STEPS = [
  {
    id: 1,
    label: "Enter Keywords",
    description: "Target industry or company type",
  },
  {
    id: 2,
    label: "Queue Prospects",
    description: "AI discovers and scores leads",
  },
  { id: 3, label: "Run Scans", description: "WCAG compliance analysis" },
  {
    id: 4,
    label: "Review Reports",
    description: "PDF audits with risk scores",
  },
  {
    id: 5,
    label: "Send Outreach",
    description: "Personalized emails + follow-ups",
  },
];

interface OnboardingTipsProps {
  currentStep?: number;
  onDismiss?: () => void;
  showProgress?: boolean;
  variant?: "banner" | "card" | "tooltip" | "sidebar" | "compact";
}

const iconMap = {
  rocket: Rocket,
  target: Target,
  zap: Zap,
  lightbulb: Lightbulb,
  gauge: Gauge,
  bot: Bot,
};

const categoryColors = {
  control: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  workflow: "bg-green-500/10 text-green-500 border-green-500/20",
  automation: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  insight: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

export function OnboardingTips({
  currentStep = 1,
  onDismiss,
  showProgress = true,
  variant = "card",
}: OnboardingTipsProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const currentTip = ONBOARDING_TIPS[currentTipIndex];
  const IconComponent = iconMap[currentTip.icon];
  const progress = (currentStep / WORKFLOW_STEPS.length) * 100;

  const handleNext = () => {
    if (currentTipIndex < ONBOARDING_TIPS.length - 1) {
      setCurrentTipIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentTipIndex > 0) {
      setCurrentTipIndex((prev) => prev - 1);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed) return null;

  // Sidebar variant - compact version
  if (variant === "sidebar") {
    return (
      <div className="px-0 py-2 space-y-1">
        <div className="px-2 py-1">
          <p className="text-xs font-semibold text-muted-foreground">Quick Tips</p>
        </div>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {ONBOARDING_TIPS.map((tip, idx) => (
            <div
              key={tip.id}
              onClick={() => setCurrentTipIndex(idx)}
              className={`px-3 py-2 rounded-md cursor-pointer transition text-xs ${
                idx === currentTipIndex
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <div className="flex items-start gap-2">
                <IconComponent className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{tip.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="relative border-primary/20 bg-gradient-to-br from-background to-muted/30">
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${categoryColors[currentTip.category]}`}
          >
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">{currentTip.title}</CardTitle>
            <Badge variant="outline" className="mt-1 text-xs capitalize">
              {currentTip.category}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <CardDescription className="text-sm leading-relaxed">
          {currentTip.description}
        </CardDescription>

        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Workflow Progress</span>
              <span>
                Step {currentStep} of {WORKFLOW_STEPS.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex gap-1">
              {WORKFLOW_STEPS.map((step) => (
                <div
                  key={step.id}
                  className={`flex-1 text-center text-xs py-1 rounded ${
                    step.id <= currentStep
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id <= currentStep && (
                    <CheckCircle2 className="h-3 w-3 inline mr-1" />
                  )}
                  {step.label}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-1">
            {ONBOARDING_TIPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTipIndex(idx)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  idx === currentTipIndex
                    ? "bg-primary"
                    : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={currentTipIndex === 0}
            >
              Previous
            </Button>
            {currentTip.action ? (
              <Button size="sm" asChild>
                <a href={currentTip.action.route}>
                  {currentTip.action.label}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleNext}
                disabled={currentTipIndex === ONBOARDING_TIPS.length - 1}
              >
                Next Tip
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick tip banner for top of page
export function OnboardingBanner({ tip }: { tip: OnboardingTip }) {
  const IconComponent = iconMap[tip.icon];

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
      <IconComponent className="h-5 w-5 text-primary" />
      <div className="flex-1">
        <p className="text-sm font-medium">{tip.title}</p>
        <p className="text-xs text-muted-foreground">{tip.description}</p>
      </div>
      {tip.action && (
        <Button size="sm" variant="outline" asChild>
          <a href={tip.action.route}>{tip.action.label}</a>
        </Button>
      )}
    </div>
  );
}

export default OnboardingTips;
