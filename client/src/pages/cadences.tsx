import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Mail, Trash2, Edit, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function EmailCadences() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subject: "",
    body: "",
    category: "cold",
    touchNumber: 1,
  });

  const { data: cadences, isLoading } = useQuery({
    queryKey: ["/api/cadences"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/cadences", formData);
      if (!res.ok) throw new Error("Failed to create cadence");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Cadence created", description: "Email template saved successfully" });
      setFormData({ name: "", description: "", subject: "", body: "", category: "cold", touchNumber: 1 });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/cadences"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/cadences/${id}`, {});
      if (!res.ok) throw new Error("Failed to delete cadence");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Cadence deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/cadences"] });
    },
  });

  const copyCadence = (cadence: any) => {
    setFormData({
      name: `${cadence.name} (Copy)`,
      description: cadence.description || "",
      subject: cadence.subject,
      body: cadence.body,
      category: cadence.category,
      touchNumber: cadence.touchNumber || 1,
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Email Cadences</h1>
        <p className="text-muted-foreground">Create and manage automated email sequences</p>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="active">Active Sequences</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Email Templates</h2>
              <p className="text-sm text-muted-foreground">Manage reusable email templates for your cadences</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Email Template</DialogTitle>
                  <DialogDescription>Build a reusable email template for your campaigns</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Template Name</label>
                    <Input
                      data-testid="input-template-name"
                      placeholder="e.g., Initial Audit Offer"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      data-testid="input-template-desc"
                      placeholder="What is this template for?"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Subject Line</label>
                    <Input
                      data-testid="input-template-subject"
                      placeholder="Email subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email Body</label>
                    <Textarea
                      data-testid="textarea-template-body"
                      placeholder="Email content..."
                      rows={8}
                      value={formData.body}
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    />
                  </div>
                  <Button
                    data-testid="button-save-template"
                    onClick={() => createMutation.mutate()}
                    disabled={createMutation.isPending}
                  >
                    Save Template
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading templates...</div>
          ) : (
            <div className="grid gap-4">
              {cadences?.map((cadence: any) => (
                <Card key={cadence.id} className="hover-elevate">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{cadence.name}</CardTitle>
                        <CardDescription>{cadence.description}</CardDescription>
                      </div>
                      <Badge variant="outline" data-testid={`badge-category-${cadence.id}`}>
                        {cadence.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Subject:</p>
                        <p className="text-sm">{cadence.subject}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          data-testid={`button-copy-${cadence.id}`}
                          size="sm"
                          variant="outline"
                          onClick={() => copyCadence(cadence)}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Duplicate
                        </Button>
                        <Button
                          data-testid={`button-delete-${cadence.id}`}
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(cadence.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Email Sequences</CardTitle>
              <CardDescription>Sequences currently running for your prospects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No active sequences yet. Create a template and assign it to prospects to get started.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cadence Performance</CardTitle>
              <CardDescription>Metrics for your email sequences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Sent</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">0%</p>
                  <p className="text-xs text-muted-foreground mt-1">Open Rate</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">0%</p>
                  <p className="text-xs text-muted-foreground mt-1">Click Rate</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">0%</p>
                  <p className="text-xs text-muted-foreground mt-1">Reply Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
