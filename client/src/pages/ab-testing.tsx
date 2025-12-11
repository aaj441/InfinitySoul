import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Mail, TrendingUp, MousePointerClick, MessageSquare, Trophy, PlayCircle, PauseCircle, CheckCircle2 } from "lucide-react";
import type { EmailCampaign } from "@shared/schema";

interface CampaignAnalytics {
  campaign: EmailCampaign;
  variants: Array<{
    variant: {
      id: string;
      variantName: string;
      subjectLine: string;
      sends: number;
      opens: number;
      clicks: number;
      replies: number;
    };
    openRate: number;
    clickRate: number;
    replyRate: number;
    conversionRate: number;
  }>;
  winningVariant: {
    id: string;
    variantName: string;
  } | null;
  statisticalSignificance: boolean;
}

export default function ABTesting() {
  const { data: campaigns, isLoading } = useQuery<EmailCampaign[]>({
    queryKey: ['/api/campaigns'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-ab-testing-title">A/B Testing Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track email campaign performance and optimize conversion rates
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {campaigns && campaigns.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground text-sm text-center mb-4">
                Create your first A/B test campaign to start optimizing email performance
              </p>
            </CardContent>
          </Card>
        ) : (
          campaigns?.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))
        )}
      </div>
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: EmailCampaign }) {
  const { data: analytics, isError } = useQuery<CampaignAnalytics>({
    queryKey: ['/api', 'campaigns', campaign.id],
    retry: 1,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'draft': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      case 'paused': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <PlayCircle className="h-3 w-3" data-testid="icon-campaign-active" />;
      case 'paused': return <PauseCircle className="h-3 w-3" data-testid="icon-campaign-paused" />;
      case 'completed': return <CheckCircle2 className="h-3 w-3" data-testid="icon-campaign-completed" />;
      default: return null;
    }
  };

  const totalSends = campaign.totalSends || 0;
  const overallOpenRate = totalSends > 0 ? Math.round((campaign.totalOpens / totalSends) * 100) : 0;
  const overallClickRate = totalSends > 0 ? Math.round((campaign.totalClicks / totalSends) * 100) : 0;
  const overallReplyRate = totalSends > 0 ? Math.round((campaign.totalReplies / totalSends) * 100) : 0;

  return (
    <Card data-testid={`card-campaign-${campaign.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <CardTitle className="text-xl" data-testid={`text-campaign-name-${campaign.id}`}>
                {campaign.name}
              </CardTitle>
              <Badge className={getStatusColor(campaign.status)} data-testid={`badge-campaign-status-${campaign.id}`}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(campaign.status)}
                  {campaign.status}
                </span>
              </Badge>
              {analytics?.statisticalSignificance && (
                <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20" data-testid={`badge-significance-${campaign.id}`}>
                  <Trophy className="h-3 w-3 mr-1" />
                  Statistically Significant
                </Badge>
              )}
            </div>
            <CardDescription className="flex items-center gap-4 flex-wrap">
              {campaign.industry && (
                <span data-testid={`text-campaign-industry-${campaign.id}`}>Industry: {campaign.industry}</span>
              )}
              {campaign.touchNumber !== null && (
                <span data-testid={`text-campaign-touch-${campaign.id}`}>Touch #{campaign.touchNumber}</span>
              )}
              <span data-testid={`text-campaign-goal-${campaign.id}`}>Goal: {campaign.goal}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            icon={<Mail className="h-4 w-4" />}
            label="Total Sends"
            value={totalSends}
            testId={`metric-sends-${campaign.id}`}
          />
          <MetricCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="Open Rate"
            value={`${overallOpenRate}%`}
            subValue={`${campaign.totalOpens} opens`}
            testId={`metric-opens-${campaign.id}`}
          />
          <MetricCard
            icon={<MousePointerClick className="h-4 w-4" />}
            label="Click Rate"
            value={`${overallClickRate}%`}
            subValue={`${campaign.totalClicks} clicks`}
            testId={`metric-clicks-${campaign.id}`}
          />
          <MetricCard
            icon={<MessageSquare className="h-4 w-4" />}
            label="Reply Rate"
            value={`${overallReplyRate}%`}
            subValue={`${campaign.totalReplies} replies`}
            testId={`metric-replies-${campaign.id}`}
          />
        </div>

        {isError && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              Failed to load campaign analytics. Please try again later.
            </p>
          </div>
        )}

        {!isError && analytics && analytics.variants && analytics.variants.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Variant Performance</h3>
              {analytics.winningVariant && (
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20" data-testid={`badge-winner-${campaign.id}`}>
                  <Trophy className="h-3 w-3 mr-1" />
                  Winner: {analytics.winningVariant.variantName}
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              {analytics.variants.map((variantData) => (
                <VariantRow
                  key={variantData.variant.id}
                  variant={variantData.variant}
                  openRate={variantData.openRate}
                  clickRate={variantData.clickRate}
                  replyRate={variantData.replyRate}
                  isWinner={analytics.winningVariant?.id === variantData.variant.id}
                />
              ))}
            </div>
          </div>
        )}

        {!isError && analytics && (!analytics.variants || analytics.variants.length === 0) && (
          <div className="p-4 bg-muted/50 border rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              No variants added yet. Create variants to start testing.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MetricCard({ 
  icon, 
  label, 
  value, 
  subValue,
  testId
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  subValue?: string;
  testId?: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card" data-testid={testId}>
      <div className="p-2 rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-lg font-bold mt-0.5">{value}</p>
        {subValue && (
          <p className="text-xs text-muted-foreground mt-0.5">{subValue}</p>
        )}
      </div>
    </div>
  );
}

function VariantRow({ 
  variant, 
  openRate, 
  clickRate, 
  replyRate, 
  isWinner 
}: { 
  variant: {
    id: string;
    variantName: string;
    subjectLine: string;
    sends: number;
  };
  openRate: number;
  clickRate: number;
  replyRate: number;
  isWinner: boolean;
}) {
  return (
    <div 
      className={`p-4 rounded-lg border ${isWinner ? 'bg-amber-500/5 border-amber-500/20' : 'bg-card'}`}
      data-testid={`variant-row-${variant.id}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm" data-testid={`text-variant-name-${variant.id}`}>
              {variant.variantName}
            </h4>
            {isWinner && (
              <Trophy className="h-4 w-4 text-amber-600" data-testid={`icon-winner-${variant.id}`} />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5" data-testid={`text-variant-subject-${variant.id}`}>
            Subject: {variant.subjectLine}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5" data-testid={`text-variant-sends-${variant.id}`}>
            {variant.sends} sends
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Open</span>
            <span className="font-semibold" data-testid={`text-variant-open-rate-${variant.id}`}>
              {Math.round(openRate)}%
            </span>
          </div>
          <Progress value={openRate} className="h-1.5" data-testid={`progress-open-${variant.id}`} />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Click</span>
            <span className="font-semibold" data-testid={`text-variant-click-rate-${variant.id}`}>
              {Math.round(clickRate)}%
            </span>
          </div>
          <Progress value={clickRate} className="h-1.5" data-testid={`progress-click-${variant.id}`} />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Reply</span>
            <span className="font-semibold" data-testid={`text-variant-reply-rate-${variant.id}`}>
              {Math.round(replyRate)}%
            </span>
          </div>
          <Progress value={replyRate} className="h-1.5" data-testid={`progress-reply-${variant.id}`} />
        </div>
      </div>
    </div>
  );
}
