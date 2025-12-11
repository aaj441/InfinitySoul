import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Templates() {
  const { toast } = useToast();
  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/templates"],
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const categories = ["cold", "follow-up", "closing", "nurture"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Email Templates</h1>
        <p className="text-muted-foreground">Pre-built and custom email templates for your outreach campaigns</p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="cold">Cold Emails</TabsTrigger>
          <TabsTrigger value="follow-up">Follow-ups</TabsTrigger>
          <TabsTrigger value="closing">Closing</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading templates...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {templates?.map((template: any) => (
                <Card key={template.id} className="hover-elevate">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">{template.description}</CardDescription>
                      </div>
                      <Badge variant="secondary" data-testid={`badge-cat-${template.id}`}>
                        {template.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-muted p-3 rounded text-sm">
                      <p className="font-medium text-muted-foreground mb-1">Subject:</p>
                      <p className="text-foreground">{template.subject}</p>
                    </div>
                    <Button
                      data-testid={`button-copy-template-${template.id}`}
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(template.body)}
                      className="w-full"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Body
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {categories.map((cat) => (
          <TabsContent key={cat} value={cat} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {templates?.filter((t: any) => t.category === cat).map((template: any) => (
                <Card key={template.id} className="hover-elevate">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      data-testid={`button-use-${template.id}`}
                      size="sm"
                      className="w-full"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
