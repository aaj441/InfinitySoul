import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Search, Radar, FileText, Mail, BarChart3, Settings, Zap } from 'lucide-react';

interface CommandAction {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    const handleCustomEvent = () => setOpen(true);

    document.addEventListener('keydown', down);
    window.addEventListener('open-command-palette', handleCustomEvent);

    return () => {
      document.removeEventListener('keydown', down);
      window.removeEventListener('open-command-palette', handleCustomEvent);
    };
  }, []);

  const navigate = (path: string) => {
    setLocation(path);
    setOpen(false);
  };

  const commands: CommandAction[] = [
    {
      id: 'discovery',
      label: 'Keyword Discovery',
      description: 'Find companies by keywords',
      icon: <Search className="h-4 w-4" />,
      shortcut: '⌘D',
      action: () => navigate('/discovery'),
    },
    {
      id: 'scanner',
      label: 'WCAG Scanner',
      description: 'Scan websites for violations',
      icon: <Radar className="h-4 w-4" />,
      shortcut: '⌘S',
      action: () => navigate('/scanner'),
    },
    {
      id: 'reports',
      label: 'Audit Reports',
      description: 'View and generate reports',
      icon: <FileText className="h-4 w-4" />,
      shortcut: '⌘R',
      action: () => navigate('/reports'),
    },
    {
      id: 'outreach',
      label: 'Email Outreach',
      description: 'Generate and send emails',
      icon: <Mail className="h-4 w-4" />,
      shortcut: '⌘E',
      action: () => navigate('/outreach'),
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      description: 'Track metrics and progress',
      icon: <BarChart3 className="h-4 w-4" />,
      shortcut: '⌘T',
      action: () => navigate('/dashboard'),
    },
    {
      id: 'agent-mode',
      label: 'Agent Mode (Full Automation)',
      description: 'Run entire workflow automatically',
      icon: <Zap className="h-4 w-4" />,
      shortcut: '⌘⇧A',
      action: () => {
        const event = new CustomEvent('trigger-agent-mode');
        window.dispatchEvent(event);
        setOpen(false);
      },
    },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." data-testid="command-palette-input" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {commands.slice(0, 5).map((cmd) => (
            <CommandItem key={cmd.id} onSelect={cmd.action} data-testid={`command-${cmd.id}`}>
              {cmd.icon}
              <div className="flex-1 ml-2">
                <div className="font-medium">{cmd.label}</div>
                {cmd.description && (
                  <div className="text-xs text-muted-foreground">{cmd.description}</div>
                )}
              </div>
              {cmd.shortcut && (
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  {cmd.shortcut}
                </kbd>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Automation">
          {commands.slice(5).map((cmd) => (
            <CommandItem key={cmd.id} onSelect={cmd.action} data-testid={`command-${cmd.id}`}>
              {cmd.icon}
              <div className="flex-1 ml-2">
                <div className="font-medium">{cmd.label}</div>
                {cmd.description && (
                  <div className="text-xs text-muted-foreground">{cmd.description}</div>
                )}
              </div>
              {cmd.shortcut && (
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  {cmd.shortcut}
                </kbd>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
