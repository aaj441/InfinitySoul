import { ReactNode } from "react";
import { PricingTier, hasFeature } from "@shared/pricing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface TierGateProps {
  tier: PricingTier;
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  gateLevel?: "soft" | "hard"; // soft = show with "upgrade" badge, hard = hide entirely
}

/**
 * Strategic gate: NEVER use this for core compliance data.
 * Use only for expansion features (predictive AI, team workflows, custom rules).
 * 
 * Core compliance data MUST be visible to all tiers - ops managers need to see
 * critical violations regardless of tier. "Upgrade" only for enhancement features.
 */
export function TierGate({
  tier,
  feature,
  children,
  fallback,
  gateLevel = "soft",
}: TierGateProps) {
  // Check if feature is available for this tier
  const featureKey = feature
    .toLowerCase()
    .replace(/ /g, "_") as keyof typeof hasFeature;

  const hasAccess = hasFeature(tier, featureKey as any);

  if (hasAccess) {
    return <>{children}</>;
  }

  // Soft gate: Show with upgrade prompt
  if (gateLevel === "soft") {
    return (
      <Card className="border-amber-500/50 bg-amber-950/20 p-4 relative">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-amber-100 text-sm mb-1">
              {feature} - Pro Feature
            </h4>
            <p className="text-xs text-amber-200/80">
              Upgrade to Pro to unlock {feature.toLowerCase()} and get 5x the scans, AI remediation suggestions, and team collaboration.
            </p>
            <Button
              size="sm"
              className="mt-2"
              onClick={() => {
                // TODO: Open upgrade modal with Pro tier pre-selected
                console.log("Upgrade to Pro:", feature);
              }}
            >
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Hard gate: Hide entirely (for enterprise-only features)
  return <>{fallback}</> || null;
}

/**
 * Show a badge next to feature indicating tier
 */
export function TierBadge({ tier, feature }: { tier: PricingTier; feature: string }) {
  const featureKey = feature
    .toLowerCase()
    .replace(/ /g, "_") as keyof typeof hasFeature;
  const hasAccess = hasFeature(tier, featureKey as any);

  if (hasAccess) return null;

  return (
    <span className="inline-block px-2 py-1 text-xs font-semibold bg-amber-600 text-white rounded ml-2">
      Pro+
    </span>
  );
}
