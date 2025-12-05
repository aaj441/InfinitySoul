import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { ErrorBoundary } from "@/components/error-boundary";
import { CommandPalette } from "@/components/command-palette";
import { UniversalInput } from "@/components/universal-input";
import { useGlobalShortcuts } from "@/hooks/use-keyboard-shortcuts";

function Infinity8HeaderLogo() {
  return (
    <img 
      src="/brand/infinity8-logo.svg" 
      alt="Infinity 8" 
      className="h-8 w-auto ml-4"
    />
  );
}
import Landing from "@/pages/landing";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import Intake from "@/pages/intake";
import Dashboard from "@/pages/dashboard";
import Prospects from "@/pages/prospects";
import Analytics from "@/pages/analytics";
import QuickWin from "@/pages/quick-win";
import KeywordDiscovery from "@/pages/keyword-discovery";
import EmailOutreach from "@/pages/email-outreach";
import Integrations from "@/pages/integrations";
import Scanner from "@/pages/scanner";
import Reports from "@/pages/reports";
import KnowledgeBase from "@/pages/knowledge-base";
import AgentStatus from "@/pages/agent-status";
import BackendStatus from "@/pages/backend-status";
import ConsultantDashboard from "@/pages/consultant-dashboard";
import EmailTest from "@/pages/email-test";
import Cadences from "@/pages/cadences";
import Templates from "@/pages/templates";
import Settings from "@/pages/settings";
import ABTesting from "@/pages/ab-testing";
import Pricing from "@/pages/pricing";
import CompetitiveAnalysis from "@/pages/competitive-analysis";
import WhiteLabel from "@/pages/white-label";
import ICPScoring from "@/pages/icp-scoring";
import WebSocketProgress from "@/pages/websocket-progress";
import ComplianceOverview from "@/pages/compliance-overview";
import ViolationTriage from "@/pages/violation-triage";
import EvidenceReporting from "@/pages/evidence-reporting";
import IndustryIntelligence from "@/pages/industry-intelligence";
import Outreach from "@/pages/outreach";
import ROICalculator from "@/pages/roi-calculator";
import TermsOfService from "@/pages/terms";
import AccessibilityStatement from "@/pages/accessibility-statement";
import Limitations from "@/pages/limitations";
import Samples from "@/pages/samples";
import FailurePostmortems from "@/pages/failure-postmortems";
import Beachhead from "@/pages/beachhead";
import Autopilot from "@/pages/autopilot";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:id" component={BlogPost} />
      <Route path="/intake" component={Intake} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/prospects" component={Prospects} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/quick-win" component={QuickWin} />
      <Route path="/keyword-discovery" component={KeywordDiscovery} />
      <Route path="/email-outreach" component={EmailOutreach} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/scanner" component={Scanner} />
      <Route path="/reports" component={Reports} />
      <Route path="/knowledge-base" component={KnowledgeBase} />
      <Route path="/agent-status" component={AgentStatus} />
      <Route path="/backend-status" component={BackendStatus} />
      <Route path="/consultant-dashboard" component={ConsultantDashboard} />
      <Route path="/email-test" component={EmailTest} />
      <Route path="/cadences" component={Cadences} />
      <Route path="/templates" component={Templates} />
      <Route path="/settings" component={Settings} />
      <Route path="/ab-testing" component={ABTesting} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/competitive-analysis" component={CompetitiveAnalysis} />
      <Route path="/white-label" component={WhiteLabel} />
      <Route path="/icp-scoring" component={ICPScoring} />
      <Route path="/websocket-progress" component={WebSocketProgress} />
      <Route path="/compliance-overview" component={ComplianceOverview} />
      <Route path="/violation-triage" component={ViolationTriage} />
      <Route path="/evidence-reporting" component={EvidenceReporting} />
      <Route path="/industry-intelligence" component={IndustryIntelligence} />
      <Route path="/outreach" component={Outreach} />
      <Route path="/calculator" component={ROICalculator} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/accessibility-statement" component={AccessibilityStatement} />
      <Route path="/limitations" component={Limitations} />
      <Route path="/samples" component={Samples} />
      <Route path="/failure-postmortems" component={FailurePostmortems} />
      <Route path="/local-business" component={Beachhead} />
      <Route path="/autopilot" component={Autopilot} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const shortcuts = useGlobalShortcuts();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "k") {
          e.preventDefault();
          shortcuts.toggleCommandPalette?.();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style}>
          <ErrorBoundary>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1">
                <header className="flex items-center justify-between p-2 border-b dark:border-gray-700 bg-white dark:bg-slate-950">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <Infinity8HeaderLogo />
                  </div>
                  <ThemeToggle />
                </header>
                <main className="flex-1 overflow-hidden">
                  <Router />
                </main>
              </div>
            </div>
          </ErrorBoundary>
          <CommandPalette />
          <UniversalInput />
          <Toaster />
        </SidebarProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
