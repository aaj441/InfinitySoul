import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, TrendingUp, Target, Mail, BookOpen } from "lucide-react";
import { useState } from "react";

interface VerticalInsight {
  id: string;
  industryName: string;
  complianceFrameworks: string[];
  lawsuitTrend: "high" | "medium" | "low";
  lawsuitDataPoint: string;
  urgencyTriggers: string[];
  socialProofTemplates: string[];
  emailSubjectTemplates: string[];
  remediationContextHints: string;
  complianceUrgencyScore: number;
  averageComplianceGap: number;
  createdAt: string;
  updatedAt: string;
}

export default function IndustryIntelligence() {
  const [selectedIndustry, setSelectedIndustry] = useState("Finance");

  const { data: allInsightsResponse = { insights: [] }, isLoading: isLoadingAll } = useQuery<{ count: number; insights: VerticalInsight[] }>({
    queryKey: ["/api/vertical-insights"],
  });

  const allInsights = allInsightsResponse.insights || [];

  const { data: selectedData, isLoading: isLoadingSelected } = useQuery<VerticalInsight>({
    queryKey: ["/api/vertical-insights", selectedIndustry],
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "high":
        return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case "medium":
        return <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
      default:
        return <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />;
    }
  };

  const getTrendLabel = (trend: string) => {
    return trend.charAt(0).toUpperCase() + trend.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold">Industry Intelligence</h1>
        <p className="text-muted-foreground">Vertical-specific compliance frameworks, lawsuit trends, and urgency triggers</p>
      </div>

      {/* Industries Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Select Industry</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {isLoadingAll ? (
            <div className="col-span-full text-muted-foreground">Loading industries...</div>
          ) : (
            allInsights.map((industry) => (
              <div
                key={industry.id}
                onClick={() => setSelectedIndustry(industry.industryName)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                  selectedIndustry === industry.industryName
                    ? "border-primary bg-primary/10"
                    : "border-muted hover:border-primary/50"
                }`}
                data-testid={`button-industry-${industry.industryName}`}
              >
                <p className="font-medium text-sm">{industry.industryName}</p>
                <div className="flex items-center gap-1 mt-2">
                  {getTrendIcon(industry.lawsuitTrend)}
                  <span className="text-xs text-muted-foreground">{getTrendLabel(industry.lawsuitTrend)} trend</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Selected Industry Details */}
      {isLoadingSelected ? (
        <div className="text-muted-foreground">Loading industry details...</div>
      ) : selectedData ? (
        <Tabs defaultValue="overview" className="space-y-4" data-testid="tabs-industry-details">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="outreach">Outreach</TabsTrigger>
            <TabsTrigger value="remediation">Remediation</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Lawsuit Trend */}
              <Card data-testid="card-lawsuit-trend">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Lawsuit Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getTrendIcon(selectedData.lawsuitTrend)}
                    <Badge variant={selectedData.lawsuitTrend === "high" ? "destructive" : "secondary"}>
                      {getTrendLabel(selectedData.lawsuitTrend)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedData.lawsuitDataPoint}</p>
                </CardContent>
              </Card>

              {/* Urgency Scores */}
              <Card data-testid="card-urgency-scores">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Urgency & Gap Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Compliance Urgency</span>
                      <span className="text-sm font-semibold">{selectedData.complianceUrgencyScore}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-red-600 dark:bg-red-500 h-2 rounded-full"
                        style={{ width: `${selectedData.complianceUrgencyScore}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Avg Compliance Gap</span>
                      <span className="text-sm font-semibold">{selectedData.averageComplianceGap}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-amber-600 dark:bg-amber-500 h-2 rounded-full"
                        style={{ width: `${selectedData.averageComplianceGap}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Urgency Triggers */}
            <Card data-testid="card-urgency-triggers">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Urgency Triggers
                </CardTitle>
                <CardDescription>What makes {selectedData.industryName} companies vulnerable</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {selectedData.urgencyTriggers.map((trigger, idx) => (
                    <li key={idx} className="flex gap-2 items-start text-sm">
                      <span className="text-primary font-bold">•</span>
                      <span>{trigger}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-4">
            <Card data-testid="card-compliance-frameworks">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Compliance Frameworks
                </CardTitle>
                <CardDescription>{selectedData.industryName} must comply with these standards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedData.complianceFrameworks.map((framework, idx) => (
                    <Badge key={idx} variant="outline">
                      {framework}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Social Proof */}
            <Card data-testid="card-social-proof">
              <CardHeader>
                <CardTitle className="text-lg">Social Proof & Messaging</CardTitle>
                <CardDescription>Use these talking points in outreach</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedData.socialProofTemplates.map((template, idx) => (
                  <div key={idx} className="p-3 bg-muted rounded-lg text-sm border-l-4 border-primary">
                    {template}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outreach Tab */}
          <TabsContent value="outreach" className="space-y-4">
            <Card data-testid="card-email-subjects">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Subject Templates
                </CardTitle>
                <CardDescription>Proven subject lines for {selectedData.industryName} outreach</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedData.emailSubjectTemplates.map((subject, idx) => (
                  <div key={idx} className="p-3 bg-muted rounded-lg text-sm">
                    <p className="font-mono text-xs text-primary mb-1">Subject {idx + 1}:</p>
                    <p>{subject}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Remediation Tab */}
          <TabsContent value="remediation">
            <Card data-testid="card-remediation-hints">
              <CardHeader>
                <CardTitle className="text-lg">Remediation Context</CardTitle>
                <CardDescription>AI hints for generating {selectedData.industryName} fixes</CardDescription>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {selectedData.remediationContextHints}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
}
