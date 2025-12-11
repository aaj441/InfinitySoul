import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';

export function UniversalInput() {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/capture/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to capture input');
      }

      const result = await response.json();
      
      toast({
        title: 'Captured!',
        description: `Saved as ${result.captured.category}: "${input.slice(0, 50)}${input.length > 50 ? '...' : ''}"`,
      });

      setInput('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to capture input. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-4" data-testid="universal-input-box">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Quick Capture
        </span>
        <kbd className="px-1.5 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 rounded">
          Cmd+K
        </kbd>
      </div>
      
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Task, note, or command..."
          className="flex-1"
          disabled={isProcessing}
          data-testid="input-universal-capture"
        />
        <Button 
          onClick={handleSubmit} 
          size="icon"
          disabled={isProcessing || !input.trim()}
          data-testid="button-capture-submit"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="font-medium">Examples:</span> "Email John about audit" | 
        "Note: Check fintech prospects" | "/scan acme.com"
      </div>
    </div>
  );
}
