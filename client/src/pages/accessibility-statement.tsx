import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

export default function AccessibilityStatement() {
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

        <h1 className="text-4xl font-bold mb-2">Accessibility Statement</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
          Commitment to Accessibility & Transparency in AI-Powered Compliance Services
        </p>

        <div className="space-y-8">
          {/* Mission Statement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Our Commitment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                WCAGI is committed to making digital accessibility achievable through real audits, human expertise, and transparent AI assistance—not compliance theater.
              </p>
              <p>
                This platform is built on the belief that accessibility is a human right, not a checkbox. We work with consultants, developers, and organizations to build truly accessible digital experiences.
              </p>
            </CardContent>
          </Card>

          {/* What We Do */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">What We Provide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold">Real WCAG Audits</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Axe-core powered scanning with mandatory human expert review (not JavaScript overlays)</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold">AI-Assisted Remediation</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Claude + GPT-4 generate suggestions, validated by accessibility professionals</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold">VPAT & Documentation</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Complete Voluntary Product Accessibility Templates with scope and limitations</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold">Consultant Enablement</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">White-label reports and tools for accessibility professionals</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What We Don't Do */}
          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                What We Don't Do
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold">We don't claim "100% compliance"</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">No accessibility service can guarantee absolute compliance. We aim for reasonable conformance with continuous improvement.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold">We don't replace legal counsel</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Advisory support is informational. Consult with attorneys for legal matters.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold">We don't use JavaScript overlays</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">We provide real audits and remediation guidance, not fake accessibility fixes.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold">We don't offer lawsuit protection</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">We can't shield clients from regulatory action or litigation. Our role is to reduce risk through better accessibility.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Transparency */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">AI Transparency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We use AI to enhance accessibility expertise, not replace it. You should know:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>20-40% detection rate:</strong> Automated testing finds only a fraction of issues</li>
                <li><strong>AI errors:</strong> Suggestions may be incorrect or irrelevant; human validation is mandatory</li>
                <li><strong>Ongoing process:</strong> Accessibility isn't a one-time fix; it requires continuous monitoring</li>
                <li><strong>User testing:</strong> Real users with disabilities should validate fixes, not just automated checks</li>
                <li><strong>Audit trails:</strong> We maintain logs of all AI recommendations and human decisions for legal defense</li>
              </ul>
            </CardContent>
          </Card>

          {/* Testing Methodology */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Our Testing Methodology</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Every WCAGI assessment includes:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>Automated scanning:</strong> Axe-core engine for baseline detection</li>
                <li><strong>Manual validation:</strong> Certified accessibility specialists (WAS/CPACC certified)</li>
                <li><strong>Keyboard-only testing:</strong> Full navigation without mouse</li>
                <li><strong>Screen reader testing:</strong> JAWS, NVDA, VoiceOver compatibility</li>
                <li><strong>Color contrast analysis:</strong> WCAG AA/AAA conformance</li>
                <li><strong>ARIA validation:</strong> Proper attribute usage and ARIA patterns</li>
                <li><strong>User feedback:</strong> Real-world testing with people who have disabilities (for premium tiers)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Known Limitations */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-900 dark:text-blue-100">Known Limitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-blue-900 dark:text-blue-100">
              <p>To manage expectations, we acknowledge these limitations:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Logical reading order and content flow require human judgment</li>
                <li>Keyboard traps and dynamic content may require custom testing</li>
                <li>Cognitive accessibility is not fully automatable</li>
                <li>PDF and document accessibility requires additional review</li>
                <li>Real-world user experience can only be validated through direct testing</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Your Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                After receiving a WCAGI audit, you are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li>Implementing recommended fixes or documenting reasons for not implementing them</li>
                <li>Conducting your own legal review and compliance assessment</li>
                <li>Monitoring your website for ongoing accessibility issues</li>
                <li>Gathering user feedback and iterating on improvements</li>
                <li>Staying current with accessibility standards and best practices</li>
                <li>Ensuring your team understands accessibility principles</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact & Support */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Questions or Concerns?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you have questions about this statement, our services, or accessibility in general:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>Accessibility issues:</strong> Report them to our support team</li>
                <li><strong>Legal questions:</strong> Consult a qualified attorney</li>
                <li><strong>Technical questions:</strong> Check our knowledge base or contact support</li>
                <li><strong>Feedback:</strong> We welcome suggestions to improve our service</li>
              </ul>
            </CardContent>
          </Card>

          {/* Final Statement */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-purple-800">
            <CardContent className="pt-6 space-y-4">
              <p className="text-lg font-semibold">
                Real accessibility isn't compliance theater. It's the unglamorous, continuous work of building digital experiences where everyone belongs.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We're here to make that work faster, better, and more achievable for accessibility consultants and the organizations they serve.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
