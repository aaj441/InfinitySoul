import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EngagementChart } from "@/components/engagement-chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export default function Analytics() {
  //todo: remove mock functionality
  const engagementData = [
    { date: "Week 1", openRate: 35, replyRate: 8, demoRate: 12 },
    { date: "Week 2", openRate: 42, replyRate: 12, demoRate: 18 },
    { date: "Week 3", openRate: 48, replyRate: 15, demoRate: 25 },
    { date: "Week 4", openRate: 52, replyRate: 18, demoRate: 30 },
    { date: "Week 5", openRate: 55, replyRate: 20, demoRate: 35 },
  ];

  const industryData = [
    { industry: "E-commerce", prospects: 45 },
    { industry: "SaaS", prospects: 38 },
    { industry: "Healthcare", prospects: 32 },
    { industry: "Finance", prospects: 27 },
  ];

  const violationData = [
    { name: "Missing Alt Text", value: 145 },
    { name: "Color Contrast", value: 98 },
    { name: "Keyboard Nav", value: 76 },
    { name: "Form Labels", value: 54 },
  ];

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  const benchmarkData = [
    { metric: "Open Rate", yours: 55, industry: 15 },
    { metric: "Reply Rate", yours: 20, industry: 2 },
    { metric: "Demo Rate", yours: 35, industry: 5 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground">Deep dive into your outreach performance</p>
      </div>

      <EngagementChart data={engagementData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance vs Industry</CardTitle>
            <CardDescription>How you compare to industry benchmarks</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={benchmarkData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="metric" 
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
                <Bar dataKey="yours" fill="hsl(var(--chart-1))" name="Your Performance %" />
                <Bar dataKey="industry" fill="hsl(var(--chart-2))" name="Industry Average %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Violation Breakdown</CardTitle>
            <CardDescription>Most common WCAG violations found</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={violationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {violationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prospects by Industry</CardTitle>
            <CardDescription>Distribution of your target prospects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={industryData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="industry" 
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
                <Bar dataKey="prospects" fill="hsl(var(--chart-3))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ROI Metrics</CardTitle>
            <CardDescription>Value generated by the platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Lawsuits Prevented</span>
              <span className="text-2xl font-semibold">24</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Estimated Savings</span>
              <span className="text-2xl font-semibold text-green-600">$2.4M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">New Revenue Unlocked</span>
              <span className="text-2xl font-semibold text-blue-600">$850K</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg Sales Cycle</span>
              <span className="text-2xl font-semibold">45 days</span>
            </div>
            <p className="text-xs text-muted-foreground pt-2 border-t">
              50% faster than industry average of 90 days
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
