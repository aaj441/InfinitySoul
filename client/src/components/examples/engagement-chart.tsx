import { EngagementChart } from "../engagement-chart";

export default function EngagementChartExample() {
  const data = [
    { date: "Week 1", openRate: 35, replyRate: 8, demoRate: 12 },
    { date: "Week 2", openRate: 42, replyRate: 12, demoRate: 18 },
    { date: "Week 3", openRate: 48, replyRate: 15, demoRate: 25 },
    { date: "Week 4", openRate: 52, replyRate: 18, demoRate: 30 },
    { date: "Week 5", openRate: 55, replyRate: 20, demoRate: 35 },
  ];

  return (
    <div className="p-4">
      <EngagementChart data={data} />
    </div>
  );
}
