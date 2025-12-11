import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface KeyboardShortcutProps {
  keys: string[];
  className?: string;
}

export function KeyboardShortcut({ keys, className = "" }: KeyboardShortcutProps) {
  // Detect platform and use appropriate modifier key
  const isMac = typeof window !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  
  // Replace 'mod' with platform-specific key
  const displayKeys = keys.map(key => {
    if (key === 'mod') {
      return isMac ? 'cmd' : 'ctrl';
    }
    return key;
  });
  
  return (
    <kbd 
      className={`pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ${className}`}
      aria-label={`Keyboard shortcut: ${displayKeys.join(' ')}`}
    >
      {displayKeys.map((key, i) => (
        <span key={i}>
          {key === 'cmd' && <span className="text-xs" aria-label="Command">⌘</span>}
          {key === 'ctrl' && <span className="text-xs" aria-label="Control">⌃</span>}
          {key === 'shift' && <span className="text-xs" aria-label="Shift">⇧</span>}
          {key !== 'cmd' && key !== 'ctrl' && key !== 'shift' && key.toUpperCase()}
        </span>
      ))}
    </kbd>
  );
}

// Accessible tooltip wrapper for showing shortcuts
interface ShortcutTooltipProps {
  shortcut: string[];
  description: string;
  children: React.ReactNode;
}

export function ShortcutTooltip({ shortcut, description, children }: ShortcutTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex items-center gap-2">
          <span>{description}</span>
          <KeyboardShortcut keys={shortcut} />
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
