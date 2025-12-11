import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, CheckCircle, AlertCircle, Clock } from "lucide-react";

export default function WebSocketProgress() {
  const [scans, setScans] = useState([
    {
      id: "scan-1",
      url: "https://example1.com",
      status: "completed",
      progress: 100,
      violations: 12,
      startTime: new Date(Date.now() - 3600000),
      endTime: new Date(Date.now() - 3000000),
    },
    {
      id: "scan-2",
      url: "https://example2.com",
      status: "scanning",
      progress: 65,
      violations: 0,
      startTime: new Date(Date.now() - 900000),
    },
    {
      id: "scan-3",
      url: "https://example3.com",
      status: "queued",
      progress: 0,
      violations: 0,
      startTime: null,
    },
  ]);

  // Simulate WebSocket progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      setScans((prevScans) =>
        prevScans.map((scan) => {
          if (scan.status === "scanning" && scan.progress < 100) {
            const newProgress = scan.progress + Math.random() * 15;
            if (newProgress >= 100) {
              return {
                ...scan,
                progress: 100,
                status: "completed",
                violations: Math.floor(Math.random() * 20),
                endTime: new Date(),
              };
            }
            return { ...scan, progress: newProgress };
          }
          if (scan.status === "queued" && prevScans.find((s) => s.status === "scanning")) {
            return scan; // Keep queued until scanning finishes
          }
          if (scan.status === "queued") {
            return {
              ...scan,
              status: "scanning",
              progress: 5,
              startTime: new Date(),
            };
          }
          return scan;
        })
      );
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "scanning":
        return <Activity className="w-4 h-4 text-blue-600 animate-spin" />;
      case "queued":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "-";
    return date.toLocaleTimeString();
  };

  const formatDuration = (start: Date | null, end?: Date) => {
    if (!start) return "-";
    const endDate = end || new Date();
    const duration = Math.round((endDate.getTime() - start.getTime()) / 1000);
    return `${duration}s`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Scan Progress Monitor</h1>
        <p className="text-muted-foreground">Real-time WebSocket updates for WCAG audits</p>
      </div>

      <Tabs defaultValue="live" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live">Live Scans</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <div className="space-y-4">
            {scans.map((scan) => (
              <Card key={scan.id} className="hover-elevate">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(scan.status)}
                        <CardTitle className="text-base">{scan.url}</CardTitle>
                      </div>
                      <CardDescription className="text-xs">
                        Started: {formatTime(scan.startTime)} · Duration: {formatDuration(scan.startTime, scan.endTime)}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        scan.status === "completed"
                          ? "default"
                          : scan.status === "scanning"
                            ? "secondary"
                            : "outline"
                      }
                      data-testid={`badge-status-${scan.id}`}
                    >
                      {scan.status === "scanning" ? `${Math.round(scan.progress)}%` : scan.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Scan Progress</span>
                      <span className="text-sm font-semibold">{Math.round(scan.progress)}%</span>
                    </div>
                    <Progress
                      value={scan.progress}
                      className="h-2"
                      data-testid={`progress-${scan.id}`}
                    />
                  </div>

                  {scan.status === "completed" && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">
                        <span className="font-semibold">{scan.violations} violations</span> found during audit
                      </p>
                    </div>
                  )}

                  {scan.status === "scanning" && (
                    <div className="text-xs text-muted-foreground">
                      <p>Scanning page elements...</p>
                      <p>Running accessibility checks...</p>
                    </div>
                  )}

                  {scan.status === "queued" && (
                    <div className="text-xs text-muted-foreground">
                      Waiting to start - {scans.filter((s) => s.status === "scanning").length} scan(s) in progress
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="hover-elevate">
              <CardHeader>
                <CardTitle className="text-base">Total Scans</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{scans.length}</p>
                <p className="text-sm text-muted-foreground">
                  {scans.filter((s) => s.status === "completed").length} completed
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate">
              <CardHeader>
                <CardTitle className="text-base">Total Violations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  {scans.reduce((sum, scan) => sum + scan.violations, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Across all completed scans</p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 hover-elevate">
              <CardHeader>
                <CardTitle className="text-base">Average Scan Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  {(
                    scans
                      .filter((s) => s.endTime)
                      .reduce((sum, scan) => {
                        const duration =
                          (scan.endTime?.getTime() || 0) - (scan.startTime?.getTime() || 0);
                        return sum + duration;
                      }, 0) /
                    (scans.filter((s) => s.endTime).length || 1) /
                    1000
                  ).toFixed(1)}
                  s
                </p>
                <p className="text-sm text-muted-foreground">Seconds per scan</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
