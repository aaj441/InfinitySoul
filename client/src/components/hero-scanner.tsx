import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import LiabilityCard from "./liability-card";

interface ScanResult {
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
}

export default function HeroScanner() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanStage, setScanStage] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");

  const SCAN_STAGES = [
    "Initializing WCAGAI Protocols...",
    "Cross-referencing 2025 Lawsuit Database...",
    "Detecting Liability Exposure...",
    "Calculating Financial Risk...",
  ];

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError("");
    setResult(null);

    // STAGE 1: THEATER (Build Tension)
    for (let i = 0; i < SCAN_STAGES.length; i++) {
      setScanStage(SCAN_STAGES[i]);
      await new Promise((r) => setTimeout(r, 800));
    }

    // STAGE 2: REAL SCAN
    try {
      const response = await fetch("/api/scan-one-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Scan failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        "Scan failed. The target site may have firewalls blocking our probe."
      );
      console.error(err);
    } finally {
      setLoading(false);
      setScanStage("");
    }
  };

  return (
    <div className="w-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HERO TEXT */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white">
            Is Your Website a{" "}
            <span className="text-red-600 dark:text-red-500">Liability?</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Don't guess. We cross-reference your code against real ADA lawsuit
            data.
          </p>
        </div>

        {/* SCANNER INPUT */}
        <form onSubmit={handleScan} className="flex justify-center">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-800 p-2 rounded-full shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-2">
            <input
              type="url"
              placeholder="https://your-business.com"
              className="flex-grow px-6 py-4 text-lg outline-none rounded-l-full sm:rounded-l-full sm:rounded-r-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              data-testid="input-scan-url"
            />
            <button
              type="submit"
              disabled={loading}
              className={`px-10 py-4 rounded-full font-bold text-lg transition-all whitespace-nowrap ${
                loading
                  ? "bg-slate-400 dark:bg-slate-600 cursor-wait text-white"
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white shadow-lg hover:shadow-xl"
              }`}
              data-testid="button-scan"
            >
              {loading ? "SCANNING..." : "CALCULATE RISK"}
            </button>
          </div>
        </form>

        {/* LOADING THEATER */}
        {loading && (
          <div className="mt-8 text-center space-y-4">
            <div className="inline-block w-full max-w-md bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 dark:bg-blue-500 h-full animate-progress-indeterminate"></div>
            </div>
            <p className="font-mono text-sm text-slate-600 dark:text-slate-400 animate-pulse">
              {scanStage}
            </p>
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                <p className="text-red-700 dark:text-red-300">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* RESULTS AREA */}
        {result && <LiabilityCard data={result} />}
      </div>
    </div>
  );
}
