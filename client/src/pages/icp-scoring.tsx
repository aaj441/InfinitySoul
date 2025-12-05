import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, TrendingUp, Target } from "lucide-react";

export default function ICPScoring() {
  const [prospectUrl, setProspectUrl] = useState("");
  const [scores, setScores] = useState<any>(null);

  const scoreProspect = () => {
    // Mock ICP scoring with ML-like algorithm
    const mockScore = Math.floor(Math.random() * 40) + 60; // 60-100
    setScores({
      url: prospectUrl,
      overallScore: mockScore,
      accessibilityRisk: 85,
      companySize: 72,
      industry: "Finance",
      location: "US",
      budget: 78,
      timeline: 65,
      decision: mockScore >= 80 ? "high" : "medium",
      recommendation: mockScore >= 80 ? "Prioritize for outreach" : "Add to nurture list",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">ICP Scoring Engine</h1>
        <p className="text-muted-foreground">ML-powered ideal customer profile matching</p>
      </div>

      <Tabs defaultValue="score" className="space-y-4">
        <TabsList>
          <TabsTrigger value="score">Score Prospects</TabsTrigger>
          <TabsTrigger value="settings">Model Settings</TabsTrigger>
          <TabsTrigger value="history">Scoring History</TabsTrigger>
        </TabsList>

        <TabsContent value="score" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prospect Scoring</CardTitle>
              <CardDescription>AI-powered ICP matching using accessibility risk, company profile, and market factors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  data-testid="input-prospect-url"
                  type="url"
                  placeholder="https://company.com"
                  value={prospectUrl}
                  onChange={(e) => setProspectUrl(e.target.value)}
                />
                <Button data-testid="button-score" onClick={scoreProspect}>
                  Score
                </Button>
              </div>
            </CardContent>
          </Card>

          {scores && (
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="md:col-span-1 hover-elevate">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    ICP Match
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-4xl font-bold">{scores.overallScore}%</p>
                      <p className="text-sm text-muted-foreground">Overall match score</p>
                    </div>
                    <Badge
                      className={scores.decision === "high" ? "bg-green-600" : "bg-yellow-600"}
                      data-testid={`badge-priority-${scores.decision}`}
                    >
                      {scores.recommendation}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 hover-elevate">
                <CardHeader>
                  <CardTitle className="text-base">Scoring Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Accessibility Risk", value: scores.accessibilityRisk },
                    { label: "Company Size Match", value: scores.companySize },
                    { label: "Budget Capacity", value: scores.budget },
                    { label: "Decision Timeline", value: scores.timeline },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-sm font-semibold">{item.value}%</span>
                      </div>
                      <Progress value={item.value} className="h-2" data-testid={`progress-${item.label.toLowerCase()}`} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="md:col-span-3 hover-elevate">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-sm">High accessibility risk identified - strong compliance need</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-sm">Company size suggests adequate budget for solutions</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-yellow-600">⚠</span>
                      <span className="text-sm">Decision timeline may require 2-3 quarter engagement</span>
                    </li>
                  </ul>

                  <Button data-testid="button-generate-pitch" className="w-full mt-4">
                    Generate Outreach Email
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ML Model Configuration</CardTitle>
              <CardDescription>Adjust weights for ICP scoring algorithm</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { name: "Accessibility Risk Weight", value: 35 },
                { name: "Company Size Weight", value: 25 },
                { name: "Industry Match Weight", value: 20 },
                { name: "Budget Capacity Weight", value: 15 },
                { name: "Timeline Weight", value: 5 },
              ].map((param) => (
                <div key={param.name}>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium">{param.name}</label>
                    <span className="text-sm font-semibold">{param.value}%</span>
                  </div>
                  <Progress value={param.value} className="h-2" />
                </div>
              ))}

              <Button data-testid="button-save-model" className="w-full">
                Save Model Settings
              </Button>
              <p className="text-xs text-muted-foreground">
                Weights total 100%. Adjust to match your ideal customer profile.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scoring History</CardTitle>
              <CardDescription>Recently scored prospects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { company: "TechCorp Inc", score: 92, decision: "High Priority" },
                  { company: "FinanceFirst", score: 87, decision: "High Priority" },
                  { company: "RetailChain Co", score: 65, decision: "Medium Priority" },
                  { company: "HealthServices Ltd", score: 78, decision: "High Priority" },
                ].map((record) => (
                  <div key={record.company} className="flex items-center justify-between p-3 border rounded hover-elevate">
                    <div>
                      <p className="font-medium">{record.company}</p>
                      <p className="text-xs text-muted-foreground">{record.decision}</p>
                    </div>
                    <Badge variant={record.score >= 80 ? "default" : "secondary"}>
                      {record.score}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
