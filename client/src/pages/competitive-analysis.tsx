import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Globe, AlertCircle } from "lucide-react";

export default function CompetitiveAnalysis() {
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);

  const analyzeCompetitor = () => {
    // Mock analysis
    setAnalysis({
      url: competitorUrl,
      score: 42,
      violations: 18,
      strengths: ["Mobile responsive", "Good contrast", "Keyboard navigation"],
      weaknesses: ["Missing alt text", "Poor form labels", "ARIA issues"],
      riskLevel: "High",
      recommendations: [
        "Add alt text to all images",
        "Improve color contrast ratios",
        "Implement proper ARIA labels",
      ],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Competitive Analysis</h1>
        <p className="text-muted-foreground">Analyze competitor accessibility and identify market opportunities</p>
      </div>

      <Tabs defaultValue="analyze" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analyze">Analyze Site</TabsTrigger>
          <TabsTrigger value="report">Reports</TabsTrigger>
          <TabsTrigger value="industry">Industry Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="analyze" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Competitor Accessibility Audit</CardTitle>
              <CardDescription>Scan competitor websites for accessibility gaps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  data-testid="input-competitor-url"
                  type="url"
                  placeholder="https://competitor.com"
                  value={competitorUrl}
                  onChange={(e) => setCompetitorUrl(e.target.value)}
                />
                <Button data-testid="button-analyze" onClick={analyzeCompetitor}>
                  Analyze
                </Button>
              </div>
            </CardContent>
          </Card>

          {analysis && (
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="hover-elevate">
                <CardHeader>
                  <CardTitle className="text-lg">{analysis.url}</CardTitle>
                  <Badge variant={analysis.riskLevel === "High" ? "destructive" : "default"}>
                    {analysis.riskLevel} Risk
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Accessibility Score</p>
                    <p className="text-4xl font-bold">{analysis.score}%</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">{analysis.violations} violations found</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Your Opportunity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">This competitor has significant accessibility gaps.</p>
                  <p className="text-sm font-semibold text-green-600">
                    Perfect pitch opportunity for {analysis.violations} accessibility improvements.
                  </p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 hover-elevate">
                <CardHeader>
                  <CardTitle className="text-base">Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength: string) => (
                      <li key={strength} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 hover-elevate">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Critical Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.weaknesses.map((weakness: string) => (
                      <li key={weakness} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 hover-elevate">
                <CardHeader>
                  <CardTitle className="text-base">Recommendations for Your Pitch</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {analysis.recommendations.map((rec: string, i: number) => (
                      <li key={rec} className="flex gap-3 text-sm">
                        <span className="font-semibold text-primary">{i + 1}.</span>
                        {rec}
                      </li>
                    ))}
                  </ol>
                  <Button data-testid="button-generate-pitch" className="mt-4 w-full">
                    Generate Pitch Email
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Reports</CardTitle>
              <CardDescription>Previously analyzed competitors</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">No reports yet. Analyze a competitor to get started.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="industry" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Industry Benchmarks</CardTitle>
              <CardDescription>Average accessibility scores by industry</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { industry: "Finance", score: 35, competitors: 12 },
                { industry: "Healthcare", score: 42, competitors: 8 },
                { industry: "E-commerce", score: 38, competitors: 15 },
                { industry: "Government", score: 58, competitors: 5 },
              ].map((item) => (
                <div key={item.industry} className="p-4 border rounded-lg hover-elevate">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{item.industry}</span>
                    <Badge>{item.competitors} sites</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Average score: {item.score}%</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
