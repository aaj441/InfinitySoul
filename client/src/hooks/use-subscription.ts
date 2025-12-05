import { useQuery } from "@tanstack/react-query";
import { PricingTier, getUserTier, PRICING_TIERS } from "@shared/pricing";

export interface SubscriptionData {
  tier: PricingTier;
  monthlyPrice: number;
  scansRemaining: number;
  scansUsed: number;
  teamMembersUsed: number;
  teamMembersLimit: number;
  customRulesUsed: number;
  customRulesLimit: number;
  daysActive: number;
  violationCount: number;
}

/**
 * Hook to get user's subscription/tier info
 * Use this throughout dashboard to make tier-aware decisions
 */
export function useSubscription() {
  const { data: subscription, isLoading, error } = useQuery<SubscriptionData>({
    queryKey: ["/api/subscription"],
    queryFn: async () => {
      const response = await fetch("/api/subscription");
      if (!response.ok) {
        throw new Error("Failed to fetch subscription");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Default to BASIC if no subscription found
  const tier = subscription?.tier || "BASIC";
  const tierFeatures = PRICING_TIERS[tier];

  return {
    tier,
    subscription: subscription || {
      tier: "BASIC",
      monthlyPrice: 2500,
      scansRemaining: 100,
      scansUsed: 0,
      teamMembersUsed: 1,
      teamMembersLimit: 1,
      customRulesUsed: 0,
      customRulesLimit: 0,
      daysActive: 0,
      violationCount: 0,
    },
    isLoading,
    error,
    tierFeatures,
    isBasic: tier === "BASIC",
    isPro: tier === "PRO",
    isEnterprise: tier === "ENTERPRISE",
  };
}
