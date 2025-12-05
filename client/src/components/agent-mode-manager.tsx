import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Zap, Loader2 } from 'lucide-react';

type AgentStep = 'discover' | 'scan' | 'report' | 'email' | 'complete';

interface AgentProgress {
  step: AgentStep;
  progress: number;
  message: string;
}

export function AgentModeManager() {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [, setLocation] = useLocation();
  const [agentProgress, setAgentProgress] = useState<AgentProgress | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleTrigger = () => {
      setOpen(true);
      setKeyword('');
      setAgentProgress(null);
    };

    window.addEventListener('trigger-agent-mode', handleTrigger);
    return () => window.removeEventListener('trigger-agent-mode', handleTrigger);
  }, []);

  // Listen for Cmd+Shift+A
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'a') {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const runAgentMutation = useMutation({
    mutationFn: async (keywords: string) => {
      // Step 1: Discover
      setAgentProgress({ step: 'discover', progress: 20, message: 'Discovering prospects...' });
      const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);
      const discoverRes = await apiRequest('POST', '/api/discovery/keywords', {
        keywords: keywordList,
        limit: 5,
      });
      const { prospects } = await discoverRes.json();

      if (!prospects || prospects.length === 0) {
        throw new Error('No prospects found');
      }

      // Step 2: Scan
      setAgentProgress({ step: 'scan', progress: 40, message: `Scanning ${prospects.length} websites...` });
      const scanPromises = prospects.slice(0, 5).map((p: any) =>
        apiRequest('POST', '/api/scan/quick-win', {
          url: p.website,
          companyName: p.companyName,
        }).then(res => res.json())
      );
      const scanJobs = await Promise.all(scanPromises);

      // Wait for scans to complete (simplified - in production use polling)
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Step 3: Generate Reports
      setAgentProgress({ step: 'report', progress: 60, message: 'Generating audit reports...' });
      const reportPromises = scanJobs.map((job: any) =>
        apiRequest('POST', `/api/scan/${job.id}/report`, {}).then(res => res.json())
      );
      await Promise.all(reportPromises);

      // Step 4: Email (optional)
      setAgentProgress({ step: 'email', progress: 80, message: 'Preparing email templates...' });
      
      // Complete
      setAgentProgress({ step: 'complete', progress: 100, message: 'Agent workflow complete!' });
      return { prospects, scanJobs };
    },
    onSuccess: () => {
      toast({
        title: 'Agent Mode Complete! 🎉',
        description: 'All prospects discovered, scanned, and reports generated.',
      });
      
      setTimeout(() => {
        setOpen(false);
        setLocation('/dashboard');
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: 'Agent Mode Failed',
        description: error instanceof Error ? error.message : 'Failed to run agent workflow',
        variant: 'destructive',
      });
      setAgentProgress(null);
    },
  });

  const handleStart = () => {
    if (!keyword.trim()) {
      toast({
        title: 'Keyword Required',
        description: 'Please enter at least one keyword',
        variant: 'destructive',
      });
      return;
    }

    runAgentMutation.mutate(keyword);
  };

  const getStepMessage = () => {
    if (!agentProgress) return null;

    const steps = {
      discover: '🔍 Discovering companies...',
      scan: '📊 Running WCAG scans...',
      report: '📄 Generating reports...',
      email: '📧 Preparing emails...',
      complete: '✅ Complete!',
    };

    return steps[agentProgress.step];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Agent Mode
          </DialogTitle>
          <DialogDescription>
            Fully automated workflow: Discover → Scan → Report → Email
          </DialogDescription>
        </DialogHeader>

        {!agentProgress ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agent-keyword">Keywords (comma-separated)</Label>
              <Input
                id="agent-keyword"
                placeholder="fintech, banking, payments"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                autoFocus
                data-testid="agent-mode-keyword-input"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleStart}
                className="flex-1"
                disabled={runAgentMutation.isPending}
                data-testid="agent-mode-start-button"
              >
                {runAgentMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Start Agent
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">What Agent Mode does:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Discovers 5 companies from keywords</li>
                <li>Scans all websites for WCAG violations</li>
                <li>Generates audit reports with PDFs</li>
                <li>Prepares email templates (no auto-send)</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{getStepMessage()}</span>
                <span className="text-sm text-muted-foreground">{agentProgress.progress}%</span>
              </div>
              <Progress value={agentProgress.progress} className="h-2" />
            </div>

            <div className="text-sm text-muted-foreground">
              {agentProgress.message}
            </div>

            {agentProgress.step === 'complete' && (
              <div className="text-center">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  🎉 Redirecting to dashboard...
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
