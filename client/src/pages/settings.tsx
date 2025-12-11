import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slack, Settings as SettingsIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function Settings() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    senderName: "",
    senderTitle: "",
    senderEmail: "",
    companyName: "",
    maxEmailsPerWeek: 50,
    emailsPerProspect: 1,
    darkMode: false,
    notificationsEnabled: true,
  });

  const [slackData, setSlackData] = useState({
    webhookUrl: "",
    channelName: "",
    alertsEnabled: true,
    statusUpdatesEnabled: true,
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/settings", formData);
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Settings saved", description: "Your preferences have been updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
  });

  const updateSlackMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/settings/slack", slackData);
      if (!res.ok) throw new Error("Failed to update Slack integration");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Slack connected", description: "Webhook URL saved successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/slack"] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">Configure your platform preferences and integrations</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your sender information and company details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Your Name</label>
                  <Input
                    data-testid="input-sender-name"
                    placeholder="e.g., John Smith"
                    value={formData.senderName}
                    onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Your Title</label>
                  <Input
                    data-testid="input-sender-title"
                    placeholder="e.g., Accessibility Consultant"
                    value={formData.senderTitle}
                    onChange={(e) => setFormData({ ...formData, senderTitle: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    data-testid="input-sender-email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.senderEmail}
                    onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Company Name</label>
                  <Input
                    data-testid="input-company-name"
                    placeholder="Your Company"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-4">Email Limits (Masonic Framework)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Max Emails Per Week</label>
                    <Input
                      data-testid="input-max-emails"
                      type="number"
                      value={formData.maxEmailsPerWeek}
                      onChange={(e) => setFormData({ ...formData, maxEmailsPerWeek: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Emails Per Prospect</label>
                    <Input
                      data-testid="input-emails-per-prospect"
                      type="number"
                      value={formData.emailsPerProspect}
                      onChange={(e) => setFormData({ ...formData, emailsPerProspect: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <Button
                data-testid="button-save-general"
                onClick={() => updateSettingsMutation.mutate()}
                disabled={updateSettingsMutation.isPending}
              >
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you receive alerts and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive email alerts for agent status</p>
                </div>
                <Switch
                  data-testid="switch-email-notif"
                  checked={formData.notificationsEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, notificationsEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Use dark theme for the dashboard</p>
                </div>
                <Switch
                  data-testid="switch-dark-mode"
                  checked={formData.darkMode}
                  onCheckedChange={(checked) => setFormData({ ...formData, darkMode: checked })}
                />
              </div>

              <Button
                data-testid="button-save-notif"
                onClick={() => updateSettingsMutation.mutate()}
                disabled={updateSettingsMutation.isPending}
              >
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Slack className="w-5 h-5" />
                Slack Integration
              </CardTitle>
              <CardDescription>Get real-time agent status updates and alerts in Slack</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Webhook URL</label>
                <Input
                  data-testid="input-slack-webhook"
                  type="password"
                  placeholder="https://hooks.slack.com/services/..."
                  value={slackData.webhookUrl}
                  onChange={(e) => setSlackData({ ...slackData, webhookUrl: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Get this from Slack&apos;s Incoming Webhooks
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Channel Name</label>
                <Input
                  data-testid="input-slack-channel"
                  placeholder="#alerts"
                  value={slackData.channelName}
                  onChange={(e) => setSlackData({ ...slackData, channelName: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Agent Alerts</p>
                    <p className="text-xs text-muted-foreground">Errors and critical issues</p>
                  </div>
                  <Switch
                    data-testid="switch-slack-alerts"
                    checked={slackData.alertsEnabled}
                    onCheckedChange={(checked) => setSlackData({ ...slackData, alertsEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Status Updates</p>
                    <p className="text-xs text-muted-foreground">Agent progress and completed tasks</p>
                  </div>
                  <Switch
                    data-testid="switch-slack-status"
                    checked={slackData.statusUpdatesEnabled}
                    onCheckedChange={(checked) => setSlackData({ ...slackData, statusUpdatesEnabled: checked })}
                  />
                </div>
              </div>

              <Button
                data-testid="button-save-slack"
                onClick={() => updateSlackMutation.mutate()}
                disabled={updateSlackMutation.isPending}
              >
                Connect Slack
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
