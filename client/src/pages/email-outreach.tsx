import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Mail, Copy, Download, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { EmailPreviewSkeleton } from "@/components/skeleton-loader";
import { ErrorState } from "@/components/error-state";

export default function EmailOutreach() {
  const [scanJobId, setScanJobId] = useState("");
  const [prospectCompany, setProspectCompany] = useState("");
  const [prospectWebsite, setProspectWebsite] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderTitle, setSenderTitle] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [emailDraft, setEmailDraft] = useState<any>(null);
  const { toast } = useToast();

  const generateEmailMutation = useMutation({
    mutationFn: async () => {
      if (!scanJobId || !prospectCompany || !prospectWebsite || !senderName) {
        throw new Error("Please fill in all required fields (marked with *)");
      }

      // Validate email format for website
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(prospectWebsite)) {
        throw new Error("Website must start with http:// or https://");
      }

      const res = await apiRequest("POST", `/api/email/with-pdf/${scanJobId}`, {
        prospectCompany,
        prospectWebsite,
        senderName,
        senderTitle,
        recipientName,
        personalNote,
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          throw new Error("Server error - please try again");
        }
        const errorMsg = errorData.error || "Failed to generate email";
        const suggestion = errorData.suggestion;
        throw new Error(suggestion ? `${errorMsg}\n\n${suggestion}` : errorMsg);
      }

      return res.json();
    },
    onSuccess: (data) => {
      setEmailDraft(data);
      toast({
        title: "✅ Email Draft Generated!",
        description: "PDF attached - ready to copy and send",
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate email";
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleCopyEmail = async () => {
    if (!emailDraft?.email) return;
    
    const emailText = `Subject: ${emailDraft.email.subject}\n\n${emailDraft.email.body}`;
    
    // Feature detection for clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(emailText);
        toast({
          title: "✅ Copied to Clipboard!",
          description: "Email ready to paste into Gmail/Outlook",
        });
      } catch (error) {
        fallbackCopy(emailText);
      }
    } else {
      fallbackCopy(emailText);
    }
  };

  const fallbackCopy = (text: string) => {
    // Fallback: Select and copy manually
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      toast({
        title: "✅ Copied to Clipboard!",
        description: "Email ready to paste",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please manually select and copy the email text",
        variant: "destructive",
      });
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const handleRetry = () => {
    generateEmailMutation.mutate();
  };

  const getRiskLevel = (criticalIssues: number) => {
    if (criticalIssues > 5) return { label: "High Risk", color: "destructive", icon: "⚠️" };
    if (criticalIssues > 0) return { label: "Medium Risk", color: "secondary", icon: "📊" };
    return { label: "Low Risk", color: "default", icon: "✅" };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">📧 Email Outreach Generator</h1>
        <p className="text-lg text-muted-foreground">
          Generate AIDA-framework cold emails + auto-attach PDF reports
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Email Draft</CardTitle>
            <CardDescription>Fill in the details to generate a personalized email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scanJobId">Scan Job ID *</Label>
              <Input
                id="scanJobId"
                data-testid="input-scan-job-id"
                placeholder="e.g., scan-123"
                value={scanJobId}
                onChange={(e) => setScanJobId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">From completed WCAG scan</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prospectCompany">Company Name *</Label>
              <Input
                id="prospectCompany"
                data-testid="input-prospect-company"
                placeholder="e.g., FinTech Solutions Inc"
                value={prospectCompany}
                onChange={(e) => setProspectCompany(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prospectWebsite">Website *</Label>
              <Input
                id="prospectWebsite"
                data-testid="input-prospect-website"
                placeholder="https://example.com"
                value={prospectWebsite}
                onChange={(e) => setProspectWebsite(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senderName">Your Name *</Label>
              <Input
                id="senderName"
                data-testid="input-sender-name"
                placeholder="e.g., Jane Smith"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senderTitle">Your Title</Label>
              <Input
                id="senderTitle"
                data-testid="input-sender-title"
                placeholder="e.g., Accessibility Consultant"
                value={senderTitle}
                onChange={(e) => setSenderTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipientName">Recipient Name</Label>
              <Input
                id="recipientName"
                data-testid="input-recipient-name"
                placeholder="e.g., John CEO"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="personalNote">Personal Note</Label>
              <Textarea
                id="personalNote"
                data-testid="textarea-personal-note"
                placeholder="Add a personal touch to the email (optional)"
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                className="h-24"
              />
            </div>

            <Button
              onClick={() => generateEmailMutation.mutate()}
              disabled={generateEmailMutation.isPending || !scanJobId || !prospectCompany || !prospectWebsite || !senderName}
              className="w-full"
              size="lg"
              data-testid="button-generate-email"
            >
              {generateEmailMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Email + PDF...
                </>
              ) : (
                "⚡ Generate Email + PDF"
              )}
            </Button>
            {generateEmailMutation.isPending && (
              <p className="text-xs text-muted-foreground text-center">
                Creating personalized email and attaching PDF report...
              </p>
            )}
          </CardContent>
        </Card>

        {/* Preview Loading State */}
        {generateEmailMutation.isPending && (
          <EmailPreviewSkeleton />
        )}

        {/* Preview Error State */}
        {generateEmailMutation.isError && !generateEmailMutation.isPending && (
          <ErrorState
            title="Email Generation Failed"
            message={generateEmailMutation.error instanceof Error ? generateEmailMutation.error.message : "Failed to generate email"}
            onRetry={handleRetry}
            variant="error"
          />
        )}

        {/* Preview Success State */}
        {emailDraft && !generateEmailMutation.isPending && (
          <Card className="lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Preview
              </CardTitle>
              <CardDescription>Ready to copy and send</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Risk Badge */}
              <div>
                <div className="text-sm font-semibold mb-2">Risk Level</div>
                <Badge variant={getRiskLevel(emailDraft.email.criticalIssues || 0).color as any}>
                  {getRiskLevel(emailDraft.email.criticalIssues || 0).icon}{" "}
                  {getRiskLevel(emailDraft.email.criticalIssues || 0).label}
                </Badge>
              </div>

              {/* Subject */}
              <div>
                <div className="text-sm font-semibold text-muted-foreground">Subject</div>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm">{emailDraft.email.subject}</div>
              </div>

              {/* Preheader */}
              <div>
                <div className="text-sm font-semibold text-muted-foreground">Preview Text</div>
                <div className="mt-1 p-3 bg-muted rounded-md text-xs text-muted-foreground italic">
                  {emailDraft.email.preheader}
                </div>
              </div>

              {/* Body */}
              <div>
                <div className="text-sm font-semibold text-muted-foreground">Email Body</div>
                <div className="mt-1 p-3 bg-muted rounded-md text-xs whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
                  {emailDraft.email.body}
                </div>
              </div>

              {/* CTA */}
              <div>
                <div className="text-sm font-semibold text-muted-foreground">Call to Action</div>
                <div className="mt-1 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md text-sm font-semibold">
                  {emailDraft.email.callToAction}
                </div>
              </div>

              {/* Follow-up */}
              <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950 p-2 rounded-md">
                💡 Recommend follow-up in {emailDraft.email.followUpDays} days if no response
              </div>

              {/* PDF Bundle */}
              {emailDraft.pdf && (
                <div className="border-t pt-4">
                  <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    PDF Attached
                  </div>
                  <div className="text-xs p-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                    <div className="font-mono text-green-900 dark:text-green-100">
                      {emailDraft.pdf.filename}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyEmail}
                  className="flex-1"
                  data-testid="button-copy-email"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Email
                </Button>
                {emailDraft.pdf?.url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(emailDraft.pdf.url)}
                    className="flex-1"
                    data-testid="button-download-pdf"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                )}
              </div>

              <div className="text-xs text-muted-foreground p-2 bg-blue-50 dark:bg-blue-950 rounded-md">
                ✨ Status: {emailDraft.status} | Template: {emailDraft.template}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Info Cards */}
      {!emailDraft && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                AIDA Framework
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <p>✓ <strong>Attention:</strong> Specific problem + data</p>
              <p>✓ <strong>Interest:</strong> Evidence + social proof</p>
              <p>✓ <strong>Desire:</strong> Urgency + benefits</p>
              <p>✓ <strong>Action:</strong> Clear next step</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">20+ Years of Sales</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <p>✓ Personalization</p>
              <p>✓ Social proof</p>
              <p>✓ Risk-based tone</p>
              <p>✓ Low-friction CTA</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Auto-Attached PDF</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <p>✓ WCAG audit report</p>
              <p>✓ Compact format</p>
              <p>✓ Pre-filled data</p>
              <p>✓ Ready to send</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
