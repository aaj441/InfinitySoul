import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface WidgetProps {
  domain: string;
  score?: number;
  updatedAt?: string;
}

export function EmbeddableWidget({ domain, score = 0, updatedAt = new Date().toISOString() }: WidgetProps) {
  const [, navigate] = useLocation();
  const scoreColor = score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-600";

  const formattedDate = new Date(updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="w-full max-w-xs bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            Accessibility Score
          </span>
          <a
            href="https://infinity8.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            by WCAGAI
          </a>
        </div>

        <div className="flex items-baseline gap-2">
          <span className={`text-4xl font-bold ${scoreColor}`}>{score}</span>
          <span className="text-gray-500 dark:text-gray-400 text-sm">/100</span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all ${
              score >= 80
                ? "bg-green-600"
                : score >= 60
                  ? "bg-yellow-600"
                  : "bg-red-600"
            }`}
            style={{ width: `${score}%` }}
          />
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-400">
          Last scanned: <span className="font-semibold">{formattedDate}</span>
        </p>

        <Button
          size="sm"
          className="w-full text-xs"
          onClick={() => navigate(`/scanner?url=${encodeURIComponent(domain)}`)}
          data-testid="button-view-full-report"
        >
          View Full Report
        </Button>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Updated weekly • No personal data shared
        </p>
      </div>
    </Card>
  );
}
