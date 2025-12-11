import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { KeyboardShortcut } from "@/components/keyboard-shortcut";
import { OnboardingTips } from "@/components/onboarding-tips";
import { 
  Zap, LayoutDashboard, BarChart3, Users,
  Search, Mail, Sparkles, Code, FileText, Bot, Globe, TrendingUp,
  BookOpen, FileEdit, Settings, Layers, BarChart, CreditCard,
  Compass, Palette, Brain, Activity, Shield, AlertCircle, CheckCircle, Lightbulb,
  Store
} from "lucide-react";

function Infinity8LogoCompact() {
  return (
    <img 
      src="/brand/infinity8-logo.svg" 
      alt="Infinity 8" 
      className="h-8 w-auto"
    />
  );
}

const consultingItems = [
  { title: "Quick Win Audit", url: "/", icon: Zap, shortcut: null },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, shortcut: ["mod", "t"] },
  { title: "Consultant Dashboard", url: "/consultant-dashboard", icon: BarChart3, shortcut: null },
  { title: "Clients", url: "/prospects", icon: Users, shortcut: null },
];

const complianceItems = [
  { title: "Compliance Overview", url: "/compliance-overview", icon: Shield, shortcut: null },
  { title: "Violation Triage", url: "/violation-triage", icon: AlertCircle, shortcut: null },
  { title: "Evidence & Reports", url: "/evidence-reporting", icon: CheckCircle, shortcut: null },
];

const toolsItems = [
  { title: "WCAG Scanner", url: "/scanner", icon: Search, shortcut: ["mod", "s"] },
  { title: "Industry Intelligence", url: "/industry-intelligence", icon: Lightbulb, shortcut: null },
  { title: "Email Outreach", url: "/outreach", icon: Mail, shortcut: ["mod", "e"] },
  { title: "Marketplace", url: "/marketplace", icon: Store, shortcut: null },
  { title: "Email Testing", url: "/email-test", icon: Sparkles, shortcut: null },
  { title: "Email Cadences", url: "/cadences", icon: Layers, shortcut: null },
  { title: "A/B Testing", url: "/ab-testing", icon: BarChart, shortcut: null },
  { title: "Competitive Analysis", url: "/competitive-analysis", icon: Compass, shortcut: null },
  { title: "White-Label Reports", url: "/white-label", icon: Palette, shortcut: null },
  { title: "ICP Scoring", url: "/icp-scoring", icon: Brain, shortcut: null },
  { title: "Scan Progress", url: "/progress", icon: Activity, shortcut: null },
  { title: "Code Generator", url: "/code-generator", icon: Code, shortcut: null },
  { title: "Report Builder", url: "/reports", icon: FileText, shortcut: ["mod", "r"] },
  { title: "Agent Control", url: "/agents", icon: Bot, shortcut: ["mod", "shift", "a"] },
  { title: "Browser Backends", url: "/backends", icon: Globe, shortcut: null },
  { title: "Analytics", url: "/analytics", icon: TrendingUp, shortcut: null },
];

const resourceItems = [
  { title: "Knowledge Base", url: "/knowledge", icon: BookOpen },
  { title: "Pricing Plans", url: "/pricing", icon: CreditCard },
  { title: "Templates", url: "/templates", icon: FileEdit },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex flex-col gap-2">
          <Infinity8LogoCompact />
          <p className="text-xs text-muted-foreground">WCAG AI Platform</p>
        </div>
      </SidebarHeader>
      <SidebarContent className="space-y-4">
        {/* Onboarding Tips */}
        <div className="px-2">
          <OnboardingTips variant="sidebar" />
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>CONSULTING</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {consultingItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location === item.url} data-testid={`nav-${item.title.toLowerCase()}`} className="justify-between">
                      <Link href={item.url} className="flex justify-between w-full">
                        <span className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </span>
                        {item.shortcut && <KeyboardShortcut keys={item.shortcut} className="ml-auto opacity-50" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>COMPLIANCE</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {complianceItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location === item.url} data-testid={`nav-${item.title.toLowerCase()}`} className="justify-between">
                      <Link href={item.url} className="flex justify-between w-full">
                        <span className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </span>
                        {item.shortcut && <KeyboardShortcut keys={item.shortcut} className="ml-auto opacity-50" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>TOOLS & AUTOMATION</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location === item.url} data-testid={`nav-${item.title.toLowerCase()}`} className="justify-between">
                      <Link href={item.url} className="flex justify-between w-full">
                        <span className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </span>
                        {item.shortcut && <KeyboardShortcut keys={item.shortcut} className="ml-auto opacity-50" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>RESOURCES</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourceItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location === item.url} data-testid={`nav-${item.title.toLowerCase()}`}>
                      <Link href={item.url}>
                        <Icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 rounded-md p-2 hover-elevate">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">Admin</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
