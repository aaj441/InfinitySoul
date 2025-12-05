import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Mail, Search, FileText, Clock } from 'lucide-react';

interface DailySummary {
  date: string;
  scansCompleted: number;
  prospectsDiscovered: number;
  emailsSent: number;
  tasksCompleted: number;
  timeActive: string;
  topActions: string[];
  productivity?: number;
}

export function DailySummary() {
  const { data: summary, isLoading } = useQuery<DailySummary>({
    queryKey: ['/api/summary/daily'],
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <Card data-testid="card-daily-summary-loading">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Today's Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  const stats = [
    { icon: FileText, label: 'Scans', value: summary.scansCompleted, color: 'text-blue-600 dark:text-blue-400' },
    { icon: Search, label: 'Prospects', value: summary.prospectsDiscovered, color: 'text-green-600 dark:text-green-400' },
    { icon: Mail, label: 'Emails', value: summary.emailsSent, color: 'text-purple-600 dark:text-purple-400' },
    { icon: Clock, label: 'Time', value: summary.timeActive, color: 'text-orange-600 dark:text-orange-400' },
  ];

  return (
    <Card data-testid="card-daily-summary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Today's Summary
        </CardTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(summary.date).toLocaleDateString()}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-2" data-testid={`stat-${stat.label.toLowerCase()}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="font-semibold" data-testid={`value-${stat.label.toLowerCase()}`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h4 className="text-sm font-medium mb-2">Top Actions</h4>
          <div className="space-y-1">
            {summary.topActions.map((action, idx) => (
              <Badge key={idx} variant="outline" className="mr-1 mb-1" data-testid={`action-${idx}`}>
                {action}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
