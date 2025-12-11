import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, XCircle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: "error" | "warning" | "info";
}

export function ErrorState({ title, message, onRetry, variant = "error" }: ErrorStateProps) {
  const Icon = variant === "error" ? XCircle : variant === "warning" ? AlertCircle : AlertCircle;
  const iconColor = variant === "error" ? "text-red-600" : variant === "warning" ? "text-amber-600" : "text-blue-600";
  const bgColor = variant === "error" ? "bg-red-50 dark:bg-red-950" : variant === "warning" ? "bg-amber-50 dark:bg-amber-950" : "bg-blue-50 dark:bg-blue-950";
  const borderColor = variant === "error" ? "border-red-200 dark:border-red-800" : variant === "warning" ? "border-amber-200 dark:border-amber-800" : "border-blue-200 dark:border-blue-800";

  return (
    <Card className={`${bgColor} ${borderColor}`} data-testid="error-state">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Icon className={`h-6 w-6 ${iconColor}`} />
          <div>
            <CardTitle className="text-lg">{title || "Something went wrong"}</CardTitle>
            {message && <CardDescription className="mt-1">{message}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      {onRetry && (
        <CardContent>
          <Button onClick={onRetry} variant="outline" size="sm" data-testid="button-retry">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

export function EmptyState({ title, message, action }: { title: string; message: string; action?: { label: string; onClick: () => void } }) {
  return (
    <Card className="border-dashed" data-testid="empty-state">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">{message}</p>
        {action && (
          <Button onClick={action.onClick} variant="outline" data-testid="button-empty-action">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
