export function AgentStatusBadge({ 
  name, 
  status 
}: { 
  name: string; 
  status: 'online' | 'offline' | 'processing' 
}) {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-zinc-500',
    processing: 'bg-primary animate-pulse',
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
      <span className="text-zinc-400">{name}</span>
    </div>
  );
}
