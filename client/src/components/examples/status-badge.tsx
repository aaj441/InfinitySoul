import { StatusBadge } from "../status-badge";

export default function StatusBadgeExample() {
  return (
    <div className="flex flex-wrap gap-2 p-4">
      <StatusBadge status="high-risk" />
      <StatusBadge status="medium-risk" />
      <StatusBadge status="low-risk" />
      <StatusBadge status="active" />
      <StatusBadge status="paused" />
      <StatusBadge status="completed" />
      <StatusBadge status="lawsuit" />
      <StatusBadge status="funding" />
      <StatusBadge status="redesign" />
    </div>
  );
}
