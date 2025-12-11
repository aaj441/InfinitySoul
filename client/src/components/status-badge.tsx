import { Badge } from "@/components/ui/badge";

type StatusType = 
  | "high-risk" | "medium-risk" | "low-risk"
  | "active" | "paused" | "completed"
  | "lawsuit" | "funding" | "redesign";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  "high-risk": { label: "High Risk", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  "medium-risk": { label: "Medium Risk", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  "low-risk": { label: "Low Risk", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  "active": { label: "Active", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  "paused": { label: "Paused", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
  "completed": { label: "Completed", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  "lawsuit": { label: "Lawsuit Alert", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  "funding": { label: "Funding Event", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  "redesign": { label: "Redesign Detected", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge 
      variant="secondary" 
      className={config.className}
      data-testid={`badge-${status}`}
    >
      {label || config.label}
    </Badge>
  );
}
