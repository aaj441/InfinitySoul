import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Mail, CheckCircle, XCircle, Loader2, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type TestResult = {
  testNumber: number;
  status: "pending" | "sending" | "success" | "error";
  messageId?: string;
  error?: string;
  sentAt?: string;
};

export default function EmailTest() {
  const [email, setEmail] = useState("");
  const [testCount, setTestCount] = useState(10);
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const sendTestEmailMutation = useMutation({
    mutationFn: async (data: { email: string; testNumber: number }) => {
      const response = await apiRequest("POST", "/api/email/send-test", data);
      return await response.json();
    },
  });

  const runTestSuite = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setResults([]);

    // Initialize all tests as pending
    const initialResults: TestResult[] = Array.from({ length: testCount }, (_, i) => ({
      testNumber: i + 1,
      status: "pending",
    }));
    setResults(initialResults);

    // Send emails sequentially
    for (let i = 0; i < testCount; i++) {
      const testNumber = i + 1;

      // Update status to sending
      setResults((prev) =>
        prev.map((r) =>
          r.testNumber === testNumber ? { ...r, status: "sending" } : r
        )
      );

      try {
        const result = await sendTestEmailMutation.mutateAsync({
          email,
          testNumber,
        });

        // Update status to success
        setResults((prev) =>
          prev.map((r) =>
            r.testNumber === testNumber
              ? {
                  ...r,
                  status: "success",
                  messageId: result.messageId,
                  sentAt: new Date().toISOString(),
                }
              : r
          )
        );

        toast({
          title: `Email #${testNumber} sent!`,
          description: `Successfully sent to ${email}`,
        });

        // Wait 500ms between sends to avoid rate limiting
        if (i < testCount - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error: any) {
        // Update status to error
        setResults((prev) =>
          prev.map((r) =>
            r.testNumber === testNumber
              ? {
                  ...r,
                  status: "error",
                  error: error.message || "Failed to send",
                }
              : r
          )
        );

        toast({
          title: `Email #${testNumber} failed`,
          description: error.message || "Failed to send email",
          variant: "destructive",
        });
      }
    }

    setIsRunning(false);
  };

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;
  const progress = results.length > 0 ? (successCount + errorCount) / results.length * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-purple-950 dark:via-gray-900 dark:to-pink-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl" data-testid="icon-sparkles">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" data-testid="text-title">
              Email Testing Suite
            </h1>
          </div>
          <p className="text-lg text-muted-foreground" data-testid="text-subtitle">
            Test Gmail integration with vibrant, beautiful emails
          </p>
        </div>

        {/* Configuration Card */}
        <Card className="mb-6 border-2 border-purple-200 dark:border-purple-800 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-600" />
              Test Configuration
            </CardTitle>
            <CardDescription>Configure your email testing parameters</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label htmlFor="email">Your Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isRunning}
                className="mt-2"
                data-testid="input-email"
              />
            </div>

            <div>
              <Label htmlFor="count">Number of Test Emails</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="20"
                value={testCount}
                onChange={(e) => setTestCount(parseInt(e.target.value) || 10)}
                disabled={isRunning}
                className="mt-2"
                data-testid="input-count"
              />
            </div>

            <Button
              onClick={runTestSuite}
              disabled={isRunning || !email}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
              data-testid="button-run-tests"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Emails...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Run {testCount} Email Tests
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Progress Card */}
        {results.length > 0 && (
          <Card className="mb-6 border-2 border-purple-200 dark:border-purple-800 shadow-lg" data-testid="card-progress">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <CardTitle data-testid="text-progress-title">Test Progress</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Progress value={progress} className="h-3" data-testid="progress-bar" />
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2" data-testid="stat-success">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-semibold">{successCount}</span> Sent
                  </span>
                  <span className="flex items-center gap-2" data-testid="stat-errors">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="font-semibold">{errorCount}</span> Failed
                  </span>
                  <span className="font-semibold" data-testid="stat-percent">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Grid */}
        {results.length > 0 && (
          <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <CardTitle>Test Results</CardTitle>
              <CardDescription>Individual email send status</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {results.map((result) => (
                  <div
                    key={result.testNumber}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      result.status === "success"
                        ? "bg-green-50 dark:bg-green-950 border-green-500"
                        : result.status === "error"
                        ? "bg-red-50 dark:bg-red-950 border-red-500"
                        : result.status === "sending"
                        ? "bg-yellow-50 dark:bg-yellow-950 border-yellow-500 animate-pulse"
                        : "bg-gray-50 dark:bg-gray-900 border-gray-300"
                    }`}
                    data-testid={`result-${result.testNumber}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">#{result.testNumber}</span>
                      {result.status === "success" && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {result.status === "error" && (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      {result.status === "sending" && (
                        <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
                      )}
                    </div>
                    <Badge
                      variant={
                        result.status === "success"
                          ? "default"
                          : result.status === "error"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {result.status}
                    </Badge>
                    {result.error && (
                      <p className="text-xs text-red-600 mt-2">{result.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
