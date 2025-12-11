import { MetricCard } from "../metric-card";
import { Mail, Reply, Calendar, Users } from "lucide-react";

export default function MetricCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      <MetricCard title="Open Rate" value="55%" change={267} icon={Mail} trend="up" />
      <MetricCard title="Reply Rate" value="20%" change={900} icon={Reply} trend="up" />
      <MetricCard title="Demo Bookings" value="35%" change={600} icon={Calendar} trend="up" />
      <MetricCard title="Active Prospects" value="142" change={12} icon={Users} trend="up" />
    </div>
  );
}
