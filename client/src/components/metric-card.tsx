import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  trend?: "up" | "down";
}

export function MetricCard({ title, value, change, icon: Icon, trend = "up" }: MetricCardProps) {
  const isPositive = trend === "up" ? change > 0 : change < 0;
  const TrendIcon = change > 0 ? ArrowUp : ArrowDown;

  return (
    <Card data-testid={`metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold" data-testid={`metric-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>{value}</div>
        <div className="flex items-center gap-1 mt-2 text-xs">
          <TrendIcon className={`h-3 w-3 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
          <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
            {Math.abs(change)}%
          </span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}
