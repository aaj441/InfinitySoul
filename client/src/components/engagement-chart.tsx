import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface EngagementChartProps {
  data: Array<{
    date: string;
    openRate: number;
    replyRate: number;
    demoRate: number;
  }>;
}

export function EngagementChart({ data }: EngagementChartProps) {
  return (
    <Card data-testid="engagement-chart">
      <CardHeader>
        <CardTitle>Engagement Trends</CardTitle>
        <CardDescription>Email performance over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="openRate" 
              stroke="hsl(var(--chart-1))" 
              name="Open Rate %" 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="replyRate" 
              stroke="hsl(var(--chart-2))" 
              name="Reply Rate %"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="demoRate" 
              stroke="hsl(var(--chart-3))" 
              name="Demo Rate %"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
