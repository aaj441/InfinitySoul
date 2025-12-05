import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Cpu, MessageSquare, Database } from "lucide-react";

export default function Integrations() {
  const integrations = [
    {
      name: "Meta Prompts Engine",
      description: "AI-powered prompt engineering for all operations",
      status: "active",
      features: [
        "Prospect analysis prompts",
        "Personalized outreach sequences",
        "Violation prioritization",
        "Agent instructions",
      ],
      icon: Cpu,
    },
    {
      name: "OpenAI Integration",
      description: "Advanced AI capabilities for analysis and outreach",
      status: "ready",
      features: [
        "Prospect scoring",
        "Email generation",
        "Risk assessment",
        "Remediation planning",
      ],
      icon: Zap,
    },
    {
      name: "HubSpot CRM",
      description: "Customer relationship management and outreach",
      status: "configured",
      features: [
        "Contact sync",
        "Campaign tracking",
        "Email sequences",
        "Deal management",
      ],
      icon: Database,
    },
    {
      name: "Keyword Discovery",
      description: "Intelligent prospect discovery with AI scoring",
      status: "active",
      features: [
        "Keyword-based search",
        "ICP scoring",
        "Industry analysis",
        "Risk assessment",
      ],
      icon: MessageSquare,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Integrations & AI Enhancements</h1>
        <p className="text-lg text-muted-foreground">
          Powerful meta-prompt system and integrations to enhance your consulting workflow
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <Card key={integration.name} className="hover-elevate">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <Icon className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <CardTitle className="text-xl">{integration.name}</CardTitle>
                      <CardDescription>{integration.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" data-testid={`badge-status-${integration.name}`}>
                    {integration.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Key Features:</p>
                  <ul className="space-y-1">
                    {integration.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button variant="outline" size="sm" className="w-full" data-testid={`button-configure-${integration.name}`}>
                  View Documentation
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle>Meta Prompts API</CardTitle>
          <CardDescription>Use these endpoints to enhance your AI integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-white dark:bg-slate-950 rounded border border-blue-200 dark:border-blue-800">
              <p className="font-mono text-sm mb-1">POST /api/meta-prompts/prospect-analysis</p>
              <p className="text-xs text-muted-foreground">
                Generate AI prompts for analyzing prospect fit and legal risk
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-slate-950 rounded border border-blue-200 dark:border-blue-800">
              <p className="font-mono text-sm mb-1">POST /api/meta-prompts/outreach</p>
              <p className="text-xs text-muted-foreground">
                Generate personalized outreach email templates and sequences
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-slate-950 rounded border border-blue-200 dark:border-blue-800">
              <p className="font-mono text-sm mb-1">POST /api/meta-prompts/violation-analysis</p>
              <p className="text-xs text-muted-foreground">
                Analyze WCAG violations for sales impact and remediation planning
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-slate-950 rounded border border-blue-200 dark:border-blue-800">
              <p className="font-mono text-sm mb-1">GET /api/meta-prompts/agent-instructions/:agentType</p>
              <p className="text-xs text-muted-foreground">
                Get detailed instructions for planner, executor, outreach, and monitor agents
              </p>
            </div>
          </div>

          <Button className="w-full" data-testid="button-api-docs">
            View Full API Documentation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
