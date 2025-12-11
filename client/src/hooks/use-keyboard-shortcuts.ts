import { useEffect } from 'react';
import { useLocation } from 'wouter';

export type ShortcutAction = () => void;

export interface Shortcut {
  key: string;
  mod?: boolean;      // Cross-platform: Cmd on Mac, Ctrl on Win/Linux
  metaKey?: boolean;  // Mac-only: Cmd (rejects Ctrl)
  ctrlKey?: boolean;  // Windows/Linux-only: Ctrl (rejects Cmd)
  shift?: boolean;
  description: string;
  action: ShortcutAction;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't hijack shortcuts when user is typing in editable fields
      const target = e.target as HTMLElement;
      const isEditable = target.tagName === 'INPUT' || 
                        target.tagName === 'TEXTAREA' || 
                        target.isContentEditable;
      
      // Skip shortcut handling in editable fields to preserve browser defaults
      if (isEditable) return;
      
      for (const shortcut of shortcuts) {
        // Track modifier keys separately for platform-specific handling
        const metaPressed = e.metaKey;
        const ctrlPressed = e.ctrlKey;
        const shiftPressed = e.shiftKey;
        
        // Handle cross-platform mod key (Cmd on Mac, Ctrl on Win/Linux)
        let modifierMatch = true;
        if (shortcut.mod !== undefined) {
          const modPressed = metaPressed || ctrlPressed;
          modifierMatch = shortcut.mod === modPressed;
        } else if (shortcut.metaKey !== undefined) {
          // Mac-only: require Cmd and reject Ctrl
          modifierMatch = shortcut.metaKey === metaPressed && !ctrlPressed;
        } else if (shortcut.ctrlKey !== undefined) {
          // Windows/Linux-only: require Ctrl and reject Cmd
          modifierMatch = shortcut.ctrlKey === ctrlPressed && !metaPressed;
        }
        
        const shiftMatch = shortcut.shift === undefined || shortcut.shift === shiftPressed;
        const keyMatch = shortcut.key.toLowerCase() === e.key.toLowerCase();

        if (modifierMatch && shiftMatch && keyMatch) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Global shortcuts that work everywhere
export function useGlobalShortcuts() {
  const [, setLocation] = useLocation();

  useKeyboardShortcuts([
    {
      key: 'd',
      mod: true, // Cmd on Mac, Ctrl on Win/Linux
      description: 'Go to Discovery',
      action: () => setLocation('/discovery'),
    },
    {
      key: 's',
      mod: true,
      description: 'Go to Scanner',
      action: () => setLocation('/scanner'),
    },
    {
      key: 'r',
      mod: true,
      description: 'Go to Reports',
      action: () => setLocation('/reports'),
    },
    {
      key: 'e',
      mod: true,
      description: 'Go to Email Outreach',
      action: () => setLocation('/outreach'),
    },
    {
      key: 't',
      mod: true,
      description: 'Go to Dashboard',
      action: () => setLocation('/dashboard'),
    },
    {
      key: 'k',
      mod: true,
      description: 'Open Command Palette',
      action: () => {
        const event = new CustomEvent('open-command-palette');
        window.dispatchEvent(event);
      },
    },
    {
      key: 'a',
      mod: true,
      shift: true,
      description: 'Agent Mode',
      action: () => {
        const event = new CustomEvent('trigger-agent-mode');
        window.dispatchEvent(event);
      },
    },
    {
      key: '/',
      description: 'Focus Search',
      action: () => {
        const searchInput = document.querySelector<HTMLInputElement>('#global-search');
        searchInput?.focus();
      },
    },
  ]);
}
