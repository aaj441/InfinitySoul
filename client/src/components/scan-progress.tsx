import { useWebSocket } from "@/hooks/useWebSocket";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Loader } from "lucide-react";

interface ScanProgressProps {
  scanJobId: string | null;
}

export function ScanProgressDisplay({ scanJobId }: ScanProgressProps) {
  const { progress, status, message, isConnected, error } = useWebSocket(scanJobId);

  if (!scanJobId) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-sm font-medium">Connected</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Connecting...</span>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-300">
            {error}
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">{status}</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
      </div>
    </Card>
  );
}
