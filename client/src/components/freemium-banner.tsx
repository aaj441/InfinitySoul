import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useLocation } from "wouter";

export function FreemiumBanner() {
  const [, navigate] = useLocation();

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <div className="space-y-4">
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">FREE</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">No credit card required</p>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">1 page scan / month</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Basic report (5 min)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">No login required</span>
              </li>
            </ul>
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => navigate("/scanner")}
              data-testid="button-start-free-scan"
            >
              Start Free Scan
            </Button>
          </div>

          {/* Pro Tier */}
          <div className="space-y-4 border-l border-r border-gray-300 dark:border-gray-700 px-6">
            <div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">$497/mo</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Most popular for SMBs</p>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Continuous monitoring</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Plain English reports</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">AI-powered fixes</span>
              </li>
            </ul>
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700"
              data-testid="button-upgrade-pro"
            >
              Start 14-Day Free Trial
            </Button>
          </div>

          {/* Scale Tier */}
          <div className="space-y-4">
            <div>
              <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">$997/mo</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">For growing teams</p>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Everything in Pro</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Team collaboration</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm">Priority support</span>
              </li>
            </ul>
            <Button 
              className="w-full bg-pink-600 hover:bg-pink-700"
              data-testid="button-scale-tier"
            >
              Start 14-Day Free Trial
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            <strong>Built for Blue-Collar Business Owners:</strong> One free scan to see your liability. Then affordable continuous monitoring instead of expensive one-time audits. No jargon. Just fixes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
