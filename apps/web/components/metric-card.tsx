export function MetricCard({ 
  label, 
  value, 
  status 
}: { 
  label: string; 
  value: string; 
  status: 'optimal' | 'warning' | 'critical' 
}) {
  const statusColors = {
    optimal: 'border-green-500/20 bg-green-500/5',
    warning: 'border-yellow-500/20 bg-yellow-500/5',
    critical: 'border-alert/20 bg-alert/5',
  };

  const statusIndicators = {
    optimal: 'bg-green-500',
    warning: 'bg-yellow-500',
    critical: 'bg-alert',
  };

  return (
    <div className={`bg-surface border ${statusColors[status]} p-4 rounded-lg`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-zinc-500 uppercase tracking-widest">{label}</span>
        <div className={`w-2 h-2 rounded-full ${statusIndicators[status]}`} />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}
