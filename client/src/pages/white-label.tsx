import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Palette, Download, Eye } from "lucide-react";

export default function WhiteLabel() {
  const [branding, setBranding] = useState({
    companyName: "Your Company",
    logoUrl: "",
    primaryColor: "#8b5cf6",
    secondaryColor: "#ec4899",
    footerText: "© Your Company. All rights reserved.",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">White-Label Reports</h1>
        <p className="text-muted-foreground">Customize PDF reports with your branding</p>
      </div>

      <Tabs defaultValue="branding" className="space-y-4">
        <TabsList>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customize Your Reports</CardTitle>
              <CardDescription>Add your branding to all generated PDF reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Company Name</label>
                <Input
                  data-testid="input-company-name"
                  value={branding.companyName}
                  onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Logo URL</label>
                <Input
                  data-testid="input-logo-url"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={branding.logoUrl}
                  onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Primary Color</label>
                  <div className="flex gap-2">
                    <Input
                      data-testid="input-primary-color"
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="w-12 h-10"
                    />
                    <Input
                      type="text"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Secondary Color</label>
                  <div className="flex gap-2">
                    <Input
                      data-testid="input-secondary-color"
                      type="color"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="w-12 h-10"
                    />
                    <Input
                      type="text"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Footer Text</label>
                <Textarea
                  data-testid="textarea-footer"
                  value={branding.footerText}
                  onChange={(e) => setBranding({ ...branding, footerText: e.target.value })}
                  rows={3}
                />
              </div>

              <Button data-testid="button-save-branding" className="w-full">
                Save Branding Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: "Standard Report", description: "Full WCAG audit report with recommendations", badge: "Popular" },
              { name: "Executive Summary", description: "High-level overview for stakeholders", badge: "New" },
              { name: "Remediation Plan", description: "Detailed fix roadmap with costs", badge: null },
              { name: "Compliance Certificate", description: "Proof of accessibility compliance", badge: null },
            ].map((template) => (
              <Card key={template.name} className="hover-elevate cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    {template.badge && <Badge>{template.badge}</Badge>}
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button data-testid={`button-use-${template.name.toLowerCase()}`} size="sm" variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Report Preview
              </CardTitle>
              <CardDescription>See how your reports will look with custom branding</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 rounded-lg p-8 space-y-4"
                style={{ backgroundColor: `${branding.primaryColor}20` }}
              >
                <div
                  className="text-white p-6 rounded text-center space-y-2"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  <h2 className="text-2xl font-bold">{branding.companyName}</h2>
                  <p>Accessibility Audit Report</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Key Metrics</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {["Score: 78%", "Issues: 12", "Passed: 45"].map((metric) => (
                        <div
                          key={metric}
                          className="p-3 rounded text-center text-sm font-medium"
                          style={{ color: branding.primaryColor, borderLeft: `4px solid ${branding.primaryColor}` }}
                        >
                          {metric}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 border rounded text-sm text-muted-foreground">
                    <p className="font-medium mb-2">Recommendations</p>
                    <ul className="space-y-1">
                      <li>• Add alt text to images</li>
                      <li>• Improve color contrast</li>
                      <li>• Fix form labels</li>
                    </ul>
                  </div>

                  <div className="border-t pt-4 text-xs text-muted-foreground text-center">
                    {branding.footerText}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button data-testid="button-download-preview" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download Sample PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
