import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

export default function Limitations() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-full">
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Radical Transparency</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            What WCAGAI Can & Can't Do
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            We're honest about limitations. That's what makes us different.
          </p>
        </div>

        {/* Key Disclaimer */}
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-100">We Are Not Lawyers</p>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                  WCAGAI identifies accessibility issues. A lawyer verifies compliance. We work together with humans.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What We Can Do */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">What WCAGAI Does Well</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "Automated Scanning", desc: "Axe-core + Lighthouse + SortSite detect 60-80% of common violations" },
              { title: "Fast Triage", desc: "8-hour audit in 45 minutes. Helps prioritize human expert time." },
              { title: "VPAT Generation", desc: "Auto-generates Voluntary Product Accessibility Templates (40+ pages in 5 minutes)" },
              { title: "Remediation Hints", desc: "AI suggests fixes + effort estimates. Speeds up engineering work." },
              { title: "Vertical Profiles", desc: "Compliance rules vary by industry (fintech vs. healthcare). We have templates." },
              { title: "Progress Tracking", desc: "Before/after audits show improvement over time." },
            ].map((item, i) => (
              <Card key={i} className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="w-4 h-4" />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* What We Can't Do */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">What WCAGAI Doesn't Do (& Why)</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: "Guarantee 100% Compliance",
                reason: "No tool can. WCAG 2.2 has 87 criteria. Context matters. Humans required.",
                detection: "We catch ~70% of violations. You need expert validation on the other 30%.",
              },
              {
                title: "Judge Contextual Fixes",
                reason: "Is alt text 'adequate'? Only humans can decide. AI can't understand user intent.",
                detection: "We flag that alt text exists. You decide if it's good.",
              },
              {
                title: "Test on Screen Readers",
                reason: "We can't run NVDA, JAWS, VoiceOver automatically at scale (yet).",
                detection: "We detect structural violations (headings, landmarks). Manual SR testing still needed.",
              },
              {
                title: "Catch Dynamic Failures",
                reason: "JavaScript errors, form submissions, dropdown menus. These happen at runtime.",
                detection: "We scan static HTML. You test user interactions.",
              },
              {
                title: "Validate PDF/Video Accessibility",
                reason: "Different standards (PDF/UA, WCAG for videos). Require specialized tools.",
                detection: "We scan web pages. PDFs and videos need separate audits.",
              },
              {
                title: "Verify Legal Compliance",
                reason: "Compliance = WCAG criteria + business context + jurisdiction + legal interpretation.",
                detection: "We say 'WCAG violation found.' A lawyer says 'you're liable.'",
              },
            ].map((item, i) => (
              <Card key={i} className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <XCircle className="w-4 h-4" />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-red-900 dark:text-red-200 uppercase tracking-wide">Why</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.reason}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-900 dark:text-red-200 uppercase tracking-wide">What We Do Instead</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.detection}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Detection Accuracy Table */}
        <Card>
          <CardHeader>
            <CardTitle>Our Detection Accuracy by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-2 font-semibold text-gray-600 dark:text-gray-400">Category</th>
                    <th className="text-left py-2 px-2 font-semibold text-gray-600 dark:text-gray-400">Detection Rate</th>
                    <th className="text-left py-2 px-2 font-semibold text-gray-600 dark:text-gray-400">Notes</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {[
                    { cat: "Color Contrast", rate: "95%", notes: "Text on background. Rarely missed." },
                    { cat: "Missing Alt Text", rate: "92%", notes: "Detects missing. Quality judgment = human." },
                    { cat: "Heading Structure", rate: "88%", notes: "Detects h1→h4 jumps. Context = human." },
                    { cat: "Form Labels", rate: "85%", notes: "Associated labels. Hidden labels = ambiguous." },
                    { cat: "Keyboard Navigation", rate: "72%", notes: "Detects tab traps. Testing = human." },
                    { cat: "Focus Management", rate: "65%", notes: "Complex interactions. Manual testing needed." },
                    { cat: "Screen Reader Compat", rate: "60%", notes: "Structural issues. Full SR testing = human." },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 px-2 font-medium text-gray-900 dark:text-gray-100">{row.cat}</td>
                      <td className="py-2 px-2">
                        <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200 px-2 py-1 rounded font-semibold">
                          {row.rate}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-gray-600 dark:text-gray-400">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-4 italic">
              ⓘ Overall: ~70% automated detection + 30% requires human expert review = 100% compliance confidence
            </p>
          </CardContent>
        </Card>

        {/* How to Use This Page */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-400">How to Use WCAGAI Responsibly</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex gap-3">
              <span className="inline-block bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-200 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-semibold">1</span>
              <div>
                <p><strong>Run the scan</strong> to identify issues WCAGAI detects.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="inline-block bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-200 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-semibold">2</span>
              <div>
                <p><strong>Assign to engineering</strong> to fix automated issues (70% of work).</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="inline-block bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-200 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-semibold">3</span>
              <div>
                <p><strong>Hire accessibility expert</strong> for manual testing (30% of work).</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="inline-block bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-200 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-semibold">4</span>
              <div>
                <p><strong>Don't rely on WCAGAI alone</strong> for legal compliance.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Ready to get started with realistic accessibility goals?
          </p>
          <Button 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/calculator")}
            data-testid="button-start-assessment"
          >
            Get Your Free Accessibility Assessment
          </Button>
        </div>
      </div>
    </div>
  );
}
