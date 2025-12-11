import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Download } from "lucide-react";

interface LiabilityCardProps {
  data: {
    financials: {
      total_liability_exposure: number;
      average_settlement: number;
    };
    top_priority: {
      code: string;
      layman_desc: string;
      selector: string;
      precedent: string;
      dollar_value: number;
    };
    score: {
      trust_score: number;
      verified_issues: number;
    };
  };
}

export default function LiabilityCard({ data }: LiabilityCardProps) {
  const { financials, top_priority, score } = data;

  if (!top_priority) {
    return (
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-center">
        <CardContent className="pt-6">
          <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">
            No Critical Risks Found
          </h3>
          <p className="text-green-600 dark:text-green-300 mt-2">
            Your homepage passed our "One Fix" threshold. Contact us for a
            deep-dive audit.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* THE SHOCK VALUE HEADER */}
      <Card className="bg-slate-900 dark:bg-slate-950 border-slate-800">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">
                Total Estimated Liability
              </p>
              <h2 className="text-4xl font-extrabold text-red-500 mt-2">
                ${(financials.total_liability_exposure / 1000).toFixed(0)}K
              </h2>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">
                Verified Issues
              </p>
              <p className="text-3xl font-bold text-blue-400 mt-2">
                {score.verified_issues}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* THE "ONE FIX" BODY */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 border-b border-slate-200 dark:border-slate-600 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <h3 className="font-bold text-slate-900 dark:text-white">
            Priority Threat
          </h3>
        </div>

        <CardContent className="pt-6 space-y-6">
          <div className="space-y-3">
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">
              {top_priority.layman_desc}
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Our engine detected{" "}
              <strong>{score.verified_issues} verified violations</strong>. The
              most critical is a{" "}
              <Badge variant="outline" className="font-mono">
                {top_priority.code}
              </Badge>{" "}
              failure. This specific issue was cited in{" "}
              <em className="text-slate-500 dark:text-slate-400">
                {top_priority.precedent}
              </em>
              , leading to a significant settlement.
            </p>
          </div>

          {/* OFFENDING ELEMENT */}
          <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded border border-slate-200 dark:border-slate-700">
            <p className="font-mono text-xs text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide font-bold">
              Offending Element:
            </p>
            <code className="text-red-600 dark:text-red-400 text-sm break-all block font-mono">
              {top_priority.selector}
            </code>
          </div>

          {/* THE PITCH */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-bold shadow-lg flex-1"
              data-testid="button-fix-now"
            >
              Fix This Now (${top_priority.dollar_value})
            </Button>
            <Button
              variant="outline"
              className="border-slate-300 dark:border-slate-600 flex-1"
              data-testid="button-download-pdf"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Legal Proof PDF
            </Button>
          </div>

          {/* TRUST SCORE */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Our Detection Confidence on This Scan
            </p>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
              <li>✓ Automated detection: {score.trust_score}% confident</li>
              <li>△ Contextual judgment: Manual review recommended</li>
              <li>ℹ Requires expert validation for legal compliance</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
