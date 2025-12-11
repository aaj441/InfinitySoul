import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Award, Users, Heart } from "lucide-react";

export function FounderStoryHero() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Story Column */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold mb-4">
                The Weight of Rejection
              </h2>
              <p className="text-lg text-gray-300 italic mb-6">
                "Aaron Johnson sat in his small studio apartment, staring at his laptop. 
                The rejection email was crushing. It was the 247th time he'd been told 'no.'"
              </p>
            </div>

            <div className="space-y-4 text-gray-200">
              <p>
                He wasn't born into privilege. He worked nights at a campus library to afford 
                tuition, survived on instant ramen, juggled coursework with freelance bookkeeping gigs. 
                His body didn't cooperate the way others did—born without full arm and leg extensions—
                but his mind was sharp, his resolve unshakable.
              </p>
              <p>
                Yet every door seemed designed to keep him out.
              </p>
              <p className="font-semibold text-amber-300">
                That night, something snapped. Not in despair, but in clarity.
              </p>
              <p>
                "If the system wouldn't open its doors, he would build new ones."
              </p>
            </div>
          </div>

          {/* Metrics Column */}
          <div className="space-y-4">
            <Card className="bg-slate-800 border-amber-500/30 shadow-lg">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-2xl text-red-400">247</p>
                    <p className="text-sm text-gray-300">Job rejections in 4.5 years</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Award className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-2xl text-amber-400">2011</p>
                    <p className="text-sm text-gray-300">Founded "Our Ability" with maxed-out credit cards</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <AlertCircle className="w-8 h-8 text-orange-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-2xl text-orange-400">12</p>
                    <p className="text-sm text-gray-300">Signups in first 6 months (and he kept going)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Users className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold text-2xl text-green-400">20,000+</p>
                    <p className="text-sm text-gray-300">Annual visitors today • Hundreds placed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TrialsAndPainPoints() {
  return (
    <section className="py-16 px-4 bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">The Darkest Phase</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 text-lg mb-12 max-w-3xl mx-auto">
          After winning a Microsoft AI for Accessibility grant, Aaron thought he'd finally arrived. 
          He was wrong. What followed was his greatest trial—and his greatest breakthrough.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Left: The Trials */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-6 text-red-600 dark:text-red-400">
              The Breaking Point
            </h3>

            <Card className="bg-red-50 dark:bg-slate-800 border-red-200 dark:border-red-900">
              <CardContent className="pt-6">
                <p className="font-bold mb-2 text-red-900 dark:text-red-300">Month 1</p>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Chatbot prototype misunderstood nearly 40% of inputs. User with cerebral palsy 
                  typed "I want remote work"—bot suggested "You want to work in cement?"
                </p>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 dark:bg-slate-800 border-orange-200 dark:border-orange-900">
              <CardContent className="pt-6">
                <p className="font-bold mb-2 text-orange-900 dark:text-orange-300">Month 3</p>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  User testing revealed bot was robotic and cold. One woman with traumatic brain injury 
                  said bluntly: "This feels like another thing that doesn't get me." Aaron didn't sleep for 3 days.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 dark:bg-slate-800 border-amber-200 dark:border-amber-900">
              <CardContent className="pt-6">
                <p className="font-bold mb-2 text-amber-900 dark:text-amber-300">Month 5</p>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Azure credits burning 2x faster than projected. Had to lay off two student developers. 
                  Moved back to single room with shared bathroom. Professors urged him to drop out.
                </p>
              </CardContent>
            </Card>

            <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-lg border border-gray-300 dark:border-slate-700">
              <p className="text-sm italic text-gray-700 dark:text-gray-300">
                "But he refused to quit."
              </p>
            </div>
          </div>

          {/* Right: The Turning Point */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold mb-6 text-green-600 dark:text-green-400">
              The Turning Point
            </h3>

            <Card className="bg-green-50 dark:bg-slate-800 border-green-200 dark:border-green-900 shadow-lg">
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Aaron committed to weekly user feedback. He personally tested the bot using 
                  mouth-stick navigation and eye-tracking software.
                </p>

                <p className="font-bold text-green-900 dark:text-green-300">
                  He changed one question:
                </p>

                <div className="bg-green-100 dark:bg-slate-700 p-3 rounded">
                  <p className="text-sm font-bold text-green-900 dark:text-green-300">
                    FROM: "What are your limitations?"
                  </p>
                  <p className="text-sm font-bold text-green-900 dark:text-green-300 mt-2">
                    TO: "What are you great at?"
                  </p>
                </div>

                <div className="border-l-4 border-green-400 pl-4 py-2">
                  <p className="font-bold text-amber-600 dark:text-amber-400 mb-2">Month 7: Miguel</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    A veteran with ALS used the chatbot to match with a remote data-entry role. 
                    The employer never asked about his disability.
                  </p>
                  <p className="text-sm italic text-green-700 dark:text-green-300">
                    "For the first time in nine years, I wasn't interviewed as a wheelchair user. 
                    I was interviewed as someone who can organize information. Thank you for seeing me."
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                    Aaron broke down crying. This was why he'd endured 247 rejections. 
                    This was why he'd slept on floors and lived on ramen. This was why he hadn't quit.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TheMovement() {
  return (
    <section className="py-16 px-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4">This Isn't Just a Tool</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 text-lg mb-12 max-w-3xl mx-auto">
          Real accessibility isn't automation theater. It's people—consultants, developers, designers—
          working together to build a digital world where everyone belongs.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-center">
                <Award className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Consultants Enabled</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  10x faster audits. White-label reports. Revenue from your expertise.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-center">
                <Users className="w-12 h-12 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Developers Supported</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Real remediation suggestions. Code examples. Continuous learning.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-center">
                <Heart className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Organizations Protected</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Compliance + confidence. No lawsuit risk. Real accessibility.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-blue-600 dark:bg-blue-900 text-white p-8 rounded-lg text-center">
          <p className="text-lg font-semibold mb-2">
            Join 500+ accessibility consultants and AI builders
          </p>
          <p className="text-sm opacity-90">
            Who chose real accessibility over compliance theater
          </p>
        </div>
      </div>
    </section>
  );
}

export function ResilienceMessage() {
  return (
    <section className="py-16 px-4 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-4xl font-bold">
          Excellence Isn't a Destination
        </h2>
        
        <div className="space-y-4 text-lg text-gray-300 font-medium">
          <p>
            It's forged in the decision to show up, again and again,
          </p>
          <p>
            even when the code breaks, the money runs out, and the world says no.
          </p>
        </div>

        <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-1 w-20 mx-auto my-8"></div>

        <div className="space-y-4 text-gray-300">
          <p>
            Every placement is a small win.
          </p>
          <p>
            Every user who says "this helped me" is fuel.
          </p>
          <p>
            Every line of code debugged at 3 a.m. is a brick in a bridge toward dignity.
          </p>
        </div>

        <p className="text-2xl font-bold text-amber-300 pt-4">
          And Aaron is not done yet.
        </p>
      </div>
    </section>
  );
}
