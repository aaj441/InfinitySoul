import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { CheckCircle } from "lucide-react";

const intakeSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  website: z.string().url("Must be a valid website URL"),
  companySize: z.string().default("unknown"),
  concerns: z.string().optional(),
});

type IntakeFormValues = z.infer<typeof intakeSchema>;

export default function Intake() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [intakeId, setIntakeId] = useState<string>("");

  const form = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      name: "",
      email: "",
      website: "",
      companySize: "unknown",
      concerns: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data: IntakeFormValues) =>
      apiRequest("/api/intake", "POST", data),
    onSuccess: (response: any) => {
      setSubmitted(true);
      setIntakeId(response.intake_id);
      toast({
        title: "Success!",
        description: "Your audit request has been submitted. We'll scan your website and follow up within 24 hours.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit intake form. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-2">
          <CardContent className="pt-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Audit Request Submitted!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We've received your request. Our system is now scanning your website for accessibility issues.
            </p>
            <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your Audit ID:</p>
              <p className="font-mono text-lg font-bold">{intakeId}</p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              You'll receive an email with your detailed compliance report within 24 hours.
            </p>
            <Button onClick={() => window.location.href = "/"} data-testid="button-back-home">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Get Your Free WCAG Audit</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            See exactly how your website compares to EAA 2025 requirements
          </p>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Request Form</CardTitle>
            <CardDescription>
              Fill out the form below and we'll scan your website for accessibility issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => submitMutation.mutate(data))} className="space-y-6">
                
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="john@company.com" type="email" {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Website */}
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} data-testid="input-website" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Company Size */}
                <FormField
                  control={form.control}
                  name="companySize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Size</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-company-size">
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-50">1-50 employees</SelectItem>
                          <SelectItem value="50-500">50-500 employees</SelectItem>
                          <SelectItem value="500+">500+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Concerns */}
                <FormField
                  control={form.control}
                  name="concerns"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accessibility Concerns (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about any specific accessibility challenges or requirements..."
                          rows={4}
                          {...field}
                          data-testid="textarea-concerns"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={submitMutation.isPending}
                  data-testid="button-submit-intake"
                >
                  {submitMutation.isPending ? "Submitting..." : "Get Free Audit"}
                </Button>

              </form>
            </Form>

            {/* Info Section */}
            <div className="mt-8 pt-8 border-t">
              <h3 className="font-semibold mb-4">What happens next?</h3>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start">
                  <span className="font-bold text-blue-600 mr-3">1.</span>
                  <span>We scan your website for WCAG 2.1 Level AA compliance issues</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-blue-600 mr-3">2.</span>
                  <span>Our AI identifies accessibility violations and prioritizes them</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-blue-600 mr-3">3.</span>
                  <span>You receive a detailed report with fixes and ROI analysis</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Trust Section */}
        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>✓ Free scan • No credit card required • GDPR compliant • Results in 24 hours</p>
        </div>
      </div>
    </div>
  );
}
