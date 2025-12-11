import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function Scanner() {
  const [url, setUrl] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">WCAG Scanner</h1>
        <p className="text-muted-foreground mt-2">
          Advanced scanning tools for comprehensive accessibility audits
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Full Page Scan</CardTitle>
            <CardDescription>
              Comprehensive WCAG 2.1 AA & AAA audit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url-full">Website URL</Label>
              <Input
                id="url-full"
                data-testid="input-url-full-scan"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <Button data-testid="button-start-full-scan" className="w-full">
              Start Full Scan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Element Audit</CardTitle>
            <CardDescription>
              Scan specific page elements or components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="selector">CSS Selector</Label>
              <Input
                id="selector"
                data-testid="input-css-selector"
                placeholder=".button, #main, [role=navigation]"
              />
            </div>
            <Button variant="outline" data-testid="button-scan-element" className="w-full">
              Scan Element
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scanning Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "WCAG 2.1 Level A", badge: "basic" },
              { label: "WCAG 2.1 Level AA", badge: "standard" },
              { label: "WCAG 2.1 Level AAA", badge: "advanced" },
              { label: "Best Practices", badge: "pro" },
              { label: "Contrast Ratios", badge: "basic" },
              { label: "Form Labels", badge: "standard" },
              { label: "Heading Structure", badge: "standard" },
              { label: "Alt Text", badge: "basic" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <p className="text-sm font-medium">{item.label}</p>
                <Badge variant="outline" className="mt-2">
                  {item.badge}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
