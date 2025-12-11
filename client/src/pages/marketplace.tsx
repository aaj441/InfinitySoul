import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Star, Users, TrendingUp, DollarSign, Badge } from "lucide-react";

export default function MarketplacePage() {
  const { toast } = useToast();
  const [selectedConsultant, setSelectedConsultant] = useState<number | null>(null);

  // Fetch consultants
  const { data: consultantsData, isLoading: consultantsLoading } = useQuery({
    queryKey: ["/api/consultants"],
    queryFn: () => apiRequest("/api/consultants"),
  });

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: () => apiRequest("/api/projects"),
  });

  // Register as consultant
  const registerMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/consultants", {
        method: "POST",
        body: JSON.stringify({
          name: "AI Accessibility Consultant",
          email: `consultant-${Date.now()}@wcag-ai.com`,
          expertise: ["WCAG 2.1", "ADA Compliance", "PDF Accessibility"],
          industries: ["Financial Services", "Healthcare"],
          hourlyRate: 150,
          responseTimeHours: 24,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Registered as consultant",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/consultants"] });
    },
  });

  // Calculate revenue metrics
  const metrics = {
    activeProjects: projectsData?.filter((p: any) => p.status === "open").length || 0,
    totalValue: projectsData?.reduce((sum: number, p: any) => sum + (p.projectValue || 0), 0) || 0,
    platformRevenue: projectsData?.reduce((sum: number, p: any) => sum + (p.platformCommission || 0), 0) || 0,
    consultantPayouts: projectsData?.reduce((sum: number, p: any) => sum + (p.consultantPayout || 0), 0) || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Consultant Marketplace</h1>
        <p className="text-muted-foreground">
          25% commission model: Connect consultants with accessibility audit projects
        </p>
      </div>

      {/* Revenue Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeProjects}</div>
            <p className="text-xs text-muted-foreground">Available for matching</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(metrics.totalValue / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">Project GMV</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <Badge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(metrics.platformRevenue / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">25% commission (15% + 10%)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultant Payouts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(metrics.consultantPayouts / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">75% to consultants</p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Structure</CardTitle>
          <CardDescription>How revenue is split per project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Client Pay (100%)</p>
                <p className="text-sm text-muted-foreground">Amount paid by client</p>
              </div>
              <p className="text-lg font-semibold">100%</p>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950 p-4">
              <div>
                <p className="font-medium">Platform Commission (25%)</p>
                <p className="text-sm text-muted-foreground">15% client fee + 10% consultant fee</p>
              </div>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">25%</p>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950 p-4">
              <div>
                <p className="font-medium">Consultant Payout (75%)</p>
                <p className="text-sm text-muted-foreground">Direct payment to consultant</p>
              </div>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">75%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Consultants */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Available Consultants</CardTitle>
            <CardDescription>
              {consultantsData?.length || 0} consultants ready for projects
            </CardDescription>
          </div>
          <Button
            data-testid="button-register-consultant"
            onClick={() => registerMutation.mutate()}
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Registering..." : "Register as Consultant"}
          </Button>
        </CardHeader>
        <CardContent>
          {consultantsLoading ? (
            <p className="text-muted-foreground">Loading consultants...</p>
          ) : consultantsData?.length ? (
            <div className="space-y-3">
              {consultantsData.map((consultant: any) => (
                <div
                  key={consultant.id}
                  className={`rounded-lg border p-4 cursor-pointer transition ${
                    selectedConsultant === consultant.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedConsultant(consultant.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{consultant.name}</h4>
                      <p className="text-sm text-muted-foreground">{consultant.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{consultant.rating}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {consultant.expertise?.map((exp: string) => (
                      <Badge key={exp} variant="secondary" className="text-xs">
                        {exp}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <p className="text-muted-foreground">
                      ${consultant.hourlyRate}/hr • {consultant.projectsCompleted} projects completed
                    </p>
                    <p className="text-muted-foreground">
                      Responds in {consultant.responseTimeHours}h
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No consultants registered yet</p>
          )}
        </CardContent>
      </Card>

      {/* Active Projects */}
      {projectsData?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>{metrics.activeProjects} open projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projectsData
                .filter((p: any) => p.status === "open")
                .slice(0, 5)
                .map((project: any) => (
                  <div key={project.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{project.title}</h4>
                        <p className="text-sm text-muted-foreground">{project.category}</p>
                      </div>
                      <Badge>{project.industry}</Badge>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm">
                      <p>
                        Budget: <span className="font-semibold">${project.budget?.toLocaleString()}</span>
                      </p>
                      <div className="flex gap-4 text-muted-foreground">
                        <p>Consultant payout: ${(project.consultantPayout || 0).toLocaleString()}</p>
                        <p>Commission: ${(project.platformCommission || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
