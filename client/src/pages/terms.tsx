import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

export default function Terms() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="outline" 
          className="mb-8"
          onClick={() => navigate("/")}
          data-testid="button-back-to-home"
        >
          ← Back to Home
        </Button>

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

        <div className="space-y-8 text-gray-700 dark:text-gray-300">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">1. Service Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                <strong>THE SERVICE IS PROVIDED 'AS IS' AND 'WITH ALL FAULTS.'</strong>
              </p>
              <p>
                We disclaim all warranties, express or implied, including merchantability and fitness for a particular purpose.
              </p>
              <p className="italic text-sm text-gray-600 dark:text-gray-400">
                While we use AI-powered tools to assist in identifying and remediating accessibility issues, we make no representations or warranties that our service will result in full compliance with WCAG or any accessibility standard. Our service involves expert human review, but accessibility is an ongoing process, and we do not guarantee legal compliance or immunity from litigation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">2. AI Involvement & Transparency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                WCAGI uses artificial intelligence to assist in identifying accessibility barriers and generating remediation suggestions. You acknowledge that:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>AI-generated recommendations may contain errors or false positives</li>
                <li>Automated testing detects only 20-40% of accessibility issues</li>
                <li>Manual human review is required to validate all findings</li>
                <li>Final implementation and ongoing compliance are your responsibility</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">3. Limitations on Testing Scope</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Automated testing is only one component of accessibility evaluation. Our process includes human expert review but may not identify all potential barriers, including:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Complex reading order and cognitive usability</li>
                <li>Context-sensitive interaction patterns</li>
                <li>Real-world user experience with assistive technologies</li>
                <li>Dynamic content and continuous updates</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">4. Liability Limitation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                <strong>IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.</strong>
              </p>
              <p>
                Our liability is limited to the lesser of:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>The amount of fees paid in the preceding 12 months, or</li>
                <li>$100 USD</li>
              </ul>
              <p>
                This limitation applies to all claims arising from the use or inability to use the service, including negligence.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">5. Certification & Badges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our "Accessibility Certified" badge indicates that our platform and experts have reviewed the site for WCAG 2.2 AA conformance as of the audit date.
              </p>
              <p className="italic text-sm text-gray-600 dark:text-gray-400">
                It does not constitute a legal warranty or insurance against lawsuits. Advisory support in case of legal inquiry is informational and does not include legal representation.
              </p>
              <p>
                You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Final implementation of all recommended fixes</li>
                <li>Ongoing maintenance and monitoring</li>
                <li>Ensuring compliance with applicable laws</li>
                <li>Addressing user feedback and emerging barriers</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">6. Documentation & Audit Trail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Allow us to retain audit logs of all AI suggestions and human validation decisions</li>
                <li>Maintain records of implementation decisions</li>
                <li>Provide evidence of ongoing compliance efforts</li>
                <li>Allow us to use this data for legal defense and compliance purposes</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">7. No Legal Representation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                WCAGI provides advisory support and accessibility expertise, not legal advice or representation. We are not a substitute for qualified legal counsel. If you receive a legal notice or regulatory inquiry, please consult with an attorney licensed in your jurisdiction.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">8. Consent to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                By using WCAGI, you acknowledge that you have read, understood, and agree to be bound by these Terms. You also acknowledge:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>The limitations of AI-assisted accessibility auditing</li>
                <li>Your responsibility for final compliance and implementation</li>
                <li>That accessibility is an ongoing process, not a one-time fix</li>
                <li>That you will consult with legal counsel for legal matters</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="text-xl text-amber-900 dark:text-amber-100">Important Notice</CardTitle>
            </CardHeader>
            <CardContent className="text-amber-900 dark:text-amber-100 space-y-3">
              <p>
                <strong>These terms are not a substitute for legal counsel.</strong>
              </p>
              <p>
                For questions about legal compliance, ADA obligations, or EAA requirements, please consult with an attorney familiar with accessibility law in your jurisdiction.
              </p>
              <p className="text-sm">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
