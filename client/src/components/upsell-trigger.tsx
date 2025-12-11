import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Zap, Users, Sparkles, TrendingUp } from "lucide-react";
import { PricingTier, checkUpsellTriggers, UpsellTrigger } from "@shared/pricing";

interface UpsellTriggerProps {
  tier: PricingTier;
  userData: {
    violationCount: number;
    teamSize: number;
    daysActive: number;
  };
  onUpgradeClick?: () => void;
}

/**
 * Smart upsell component - shows natural upgrade prompts when users hit natural limits.
 * Key: Not pushy, not obstructive. Shows value first, upgrade second.
 * 
 * Psychology:
 * - Tier 1 users see value immediately (scanning works, basic reporting works)
 * - After 30+ days with 50+ violations, they naturally want predictive AI
 * - After needing 2+ team members, they hit collaboration limits
 * - The upsell CTA appears when they're most receptive (when they need it)
 */
export function UpsellTriggerBanner({ tier, userData, onUpgradeClick }: UpsellTriggerProps) {
  const [dismissed, setDismissed] = useState(false);

  const trigger = checkUpsellTriggers(tier, userData);
  if (!trigger || dismissed) return null;

  const getTriggerIcon = () => {
    switch (trigger.trigger) {
      case "predictive_ai":
        return <Sparkles className="h-4 w-4" />;
      case "team_workflow":
        return <Users className="h-4 w-4" />;
      case "custom_rules":
        return <Zap className="h-4 w-4" />;
      case "volume":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getBackgroundColor = () => {
    switch (trigger.tier) {
      case "PRO":
        return "bg-sky-950/30 border-sky-600/50";
      case "ENTERPRISE":
        return "bg-slate-900/40 border-slate-600/50";
      default:
        return "bg-slate-900/40 border-slate-600/50";
    }
  };

  return (
    <Card className={`border ${getBackgroundColor()} p-4 mb-6`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-sky-400">{getTriggerIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-200">{trigger.message}</p>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={() => {
                onUpgradeClick?.();
                // TODO: Open upgrade modal with tier pre-selected
              }}
              className="bg-sky-700 hover:bg-sky-800"
            >
              See {trigger.tier} Plan
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDismissed(true)}
            >
              Maybe later
            </Button>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 text-slate-400 hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}

/**
 * Feature comparison modal - shown when user clicks "See Pro Plan" / "See Enterprise Plan"
 */
export function FeatureComparisonModal({ tier }: { tier: PricingTier }) {
  const featureTiers = {
    BASIC: ["Compliance Scanning", "WCAG Audits", "Basic Reporting"],
    PRO: [
      ...["Compliance Scanning", "WCAG Audits", "Basic Reporting"],
      "Predictive Intelligence",
      "Team Workflows",
      "Automated Remediations",
    ],
    ENTERPRISE: [
      ...["Compliance Scanning", "WCAG Audits", "Basic Reporting", "Predictive Intelligence", "Team Workflows"],
      "Custom Rules Engine",
      "Regulatory Consulting",
      "Priority Support",
    ],
  };

  return (
    <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-slate-900 rounded-lg">
      {["BASIC", "PRO", "ENTERPRISE"].map((t) => (
        <div key={t} className={`p-3 rounded ${t === tier ? "bg-sky-900/40 border border-sky-700" : "bg-slate-800"}`}>
          <h4 className="font-semibold text-sm mb-2">{t}</h4>
          <ul className="space-y-1 text-xs text-slate-300">
            {(featureTiers[t as PricingTier] || []).map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className={tier === t ? "text-sky-400" : "text-slate-400"}>✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
