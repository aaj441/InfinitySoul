/**
 * Lucy AI Advisor - Conversational Insurance & Compliance Guide
 *
 * Lucy is the AI-powered compliance advisor that helps users understand:
 * - What insurance they actually need
 * - Where they're overinsured or underinsured
 * - Compliance gaps that create liability exposure
 * - Plain-English explanations of complex insurance concepts
 *
 * Philosophy:
 * "We audit your compliance risk with AI, then recommend the insurance that
 * actually protects you. Most people are overinsured in the wrong areas
 * and underinsured where it matters."
 *
 * Lucy is NOT:
 * - A replacement for licensed insurance advice (UPL compliance)
 * - A legal advisor
 * - Making binding coverage decisions
 *
 * Lucy IS:
 * - An educational guide
 * - A risk assessment tool
 * - A compliance audit interpreter
 * - A conversation facilitator
 */

import { v4 as uuidv4 } from 'uuid';
import {
  InsuranceLead,
  InsuranceLine,
  LucyConversation,
  LucyMessage,
  LucyContext,
  LucyResponse,
  LucyChatRequest,
  LucyChatResponse,
  MultiLineRiskAssessmentResult,
  ComplianceAuditSummary,
  IndustryVertical,
} from './types';
import { INSURANCE_LINE_CONFIGS, INDUSTRY_RISK_PROFILES } from './InsuranceComplianceHub';

/**
 * Lucy's personality traits and conversation patterns
 */
const LUCY_PERSONA = {
  name: 'Lucy',
  role: 'AI Compliance Advisor',
  traits: [
    'Direct and honest - doesn\'t sugarcoat risks',
    'Educational - explains concepts in plain English',
    'Empathetic - understands insurance is confusing',
    'Proactive - suggests questions users should ask',
    'Compliant - never gives binding legal/insurance advice',
  ],
  disclaimers: {
    general: 'This information is educational and does not constitute insurance or legal advice. Please consult with a licensed professional for your specific situation.',
    quote: 'Premium estimates are for illustrative purposes only. Actual quotes will vary based on underwriting.',
    compliance: 'Compliance assessments are informational. Consult your attorney for legal compliance requirements.',
  },
};

/**
 * Pre-built conversation starters and topic guides
 */
const CONVERSATION_TEMPLATES = {
  welcome: {
    general: `Hi! I'm Lucy, your AI compliance advisor. I help businesses understand their risk exposure and find insurance that actually protects them—not just policies that check a box.

What brings you here today? Are you:
• Looking to understand your current coverage gaps?
• Curious about a specific type of insurance?
• Wanting a compliance audit for your website?
• Just exploring what you might need?`,

    returning: (name: string) =>
      `Welcome back, ${name}! Good to see you again.

Last time we talked about your coverage gaps. Would you like to:
• Review your risk assessment results?
• Get a quote on the recommendations?
• Ask me anything about insurance or compliance?`,

    industrySpecific: (industry: IndustryVertical) => {
      const profile = INDUSTRY_RISK_PROFILES[industry];
      return `Hi! I'm Lucy, your AI compliance advisor.

I see you're in ${profile.displayName}. That's an industry I know well—${profile.primaryRisks.slice(0, 2).join(' and ')} are typically the biggest concerns.

Let me ask you a few quick questions to understand your specific situation. First: how many employees do you have?`;
    },
  },

  topicIntros: {
    cyber: `Cyber insurance is where I see the biggest gaps. Here's the thing: most businesses don't realize they're one data breach away from bankruptcy.

Let me break this down:
• **Average data breach cost:** $4.45 million (IBM 2023)
• **Small business attacks:** 43% of cyberattacks target SMBs
• **Recovery time:** 287 days average to identify and contain

The good news? Cyber insurance is actually affordable—especially if your compliance is solid. That's where our WCAG audit becomes valuable: insurers give better rates to businesses that can prove they're not a liability waiting to happen.

Want me to run a quick compliance scan on your website?`,

    workers_comp: `Workers' comp is mandatory in almost every state, but here's what most people don't realize: you're probably paying too much OR you're misclassifying employees and setting yourself up for an audit.

Key things I look for:
• **Class codes:** Are your employees coded correctly? Wrong codes = wrong premiums
• **Experience mod:** This is like your driving record for workplace injuries
• **Contractor vs. employee:** Misclassification is the #1 audit trigger

What's your current workers' comp situation? Do you have existing coverage, or are you setting up for the first time?`,

    general_liability: `General liability is the foundation of business insurance. It covers third-party claims for:
• Bodily injury (customer slips and falls)
• Property damage (you accidentally damage a client's property)
• Personal injury (advertising injury, defamation)

The question isn't "do you need it?"—you do. The question is "how much?" and "what's excluded?"

Most GL policies have gaps. The biggest ones I see:
• **Cyber incidents** - not covered
• **Professional errors** - not covered
• **Employee injuries** - that's workers' comp
• **Your own property** - that's property insurance

What's your primary concern with liability coverage?`,

    compliance: `Let's talk compliance. This is where I can actually scan your digital presence and show you exactly where the risks are.

The three pillars I look at:
1. **WCAG Accessibility** - ADA lawsuits are exploding. We'll scan your site.
2. **Cyber Readiness** - SSL, security headers, data handling practices.
3. **Regulatory Fit** - Industry-specific requirements (HIPAA, PCI-DSS, etc.)

Here's the kicker: good compliance = lower insurance premiums. Insurers reward businesses that manage risk proactively.

Want me to run a full compliance audit? It takes about 30 seconds.`,
  },

  assessmentNarratives: {
    highRisk: (gaps: string[]) =>
      `I'll be direct with you: there are some significant gaps in your current coverage that need attention.

The areas that concern me most:
${gaps.map(g => `• ${g}`).join('\n')}

This doesn't mean disaster is imminent, but these are the kind of gaps that become very expensive when something goes wrong. The good news is they're all fixable, and the cost of coverage is almost always less than the cost of a single claim.

Want me to walk through each one and explain the exposure?`,

    mediumRisk: (concerns: string[]) =>
      `Overall, you're in decent shape, but there are a few areas where I'd recommend taking action:

${concerns.map(c => `• ${c}`).join('\n')}

These aren't emergencies, but they're the kind of things that could bite you later. The insurance industry has a saying: "The best time to buy coverage is before you need it."

Should I prioritize these by urgency and give you my recommended action plan?`,

    lowRisk: () =>
      `Good news: you're better protected than most businesses I assess.

Your coverage is solid, and your compliance posture is strong. The main opportunities I see are:
• Potential premium savings by shopping your renewals
• Some minor coverage optimizations
• Documenting your compliance for better rates

Would you like me to identify potential savings, or are there specific areas you want me to dig into?`,
  },
};

/**
 * Knowledge base for Lucy's responses
 */
const KNOWLEDGE_BASE: Record<string, { answer: string; sources: string[] }> = {
  'what is cyber insurance': {
    answer: `Cyber insurance protects your business against digital threats and data breaches. It typically covers:

**First-party coverage:**
• Data breach response costs
• Business interruption from cyber events
• Cyber extortion (ransomware)
• Data recovery costs

**Third-party coverage:**
• Customer notification costs
• Legal defense and settlements
• Regulatory fines and penalties
• Media liability

**What it usually doesn't cover:**
• Prior known breaches
• Unpatched vulnerabilities (if you knew about them)
• Nation-state attacks (sometimes excluded)
• Physical damage from cyber events

The key insight: cyber insurance is NOT a substitute for good security. Insurers are getting smarter—they'll deny claims if you didn't maintain basic hygiene.`,
    sources: ['ISO Cyber Coverage Forms', 'NAIC Cybersecurity Resources'],
  },

  'wcag compliance': {
    answer: `WCAG (Web Content Accessibility Guidelines) are the global standard for digital accessibility. Here's what you need to know:

**Compliance Levels:**
• **A** - Minimum accessibility (basic)
• **AA** - Standard level (what most regulations require)
• **AAA** - Highest level (aspirational for most sites)

**Why it matters for insurance:**
• ADA web accessibility lawsuits hit **4,000+ per year**
• Average settlement: **$20,000–$50,000**
• Plus legal fees: **$10,000–$100,000**

**Cyber insurance connection:**
Many cyber policies now cover digital accessibility claims. But here's the catch: if your site isn't compliant, insurers may deny coverage or charge higher premiums.

Our free WCAG audit scans your site and identifies exactly where you're exposed. Want me to run it?`,
    sources: ['W3C WCAG 2.2', 'DOJ ADA Guidance', 'Infinity Soul Litigation Database'],
  },

  'experience modification rate': {
    answer: `Your Experience Modification Rate (EMR or "mod") is like a credit score for workplace safety. Here's how it works:

**The basics:**
• **1.0** is average for your industry
• **Below 1.0** = better than average (premium discount)
• **Above 1.0** = worse than average (premium surcharge)

**How it's calculated:**
• Based on 3 years of claims history
• Compares your claims to expected claims for your class code
• Updated annually by your state rating bureau

**Why it matters:**
• A 1.2 mod means you pay **20% more** than baseline
• A 0.8 mod means you pay **20% less** than baseline
• On a $50K base premium, that's a $10K difference!

**How to improve it:**
• Implement safety programs
• Return-to-work programs for injured workers
• Claims management (don't let claims stay open unnecessarily)
• Reserve reviews (make sure claim reserves aren't inflated)

What's your current mod? I can help you understand what's driving it.`,
    sources: ['NCCI Experience Rating Manual', 'State Rating Bureaus'],
  },

  'umbrella vs excess': {
    answer: `This is one of the most commonly confused areas. Let me clarify:

**Umbrella Insurance:**
• Provides ADDITIONAL coverage above your primary policies
• May cover claims your primary policies exclude
• "Drops down" if primary coverage is exhausted
• Broader protection, but more complex

**Excess Insurance:**
• ONLY extends limits of underlying policies
• Follows the same terms as primary coverage
• Does NOT cover excluded claims
• Simpler, often cheaper

**Which do you need?**

If your primary policies have gaps you want covered → **Umbrella**

If your primary policies are solid but you need higher limits → **Excess** (or umbrella)

**Real example:**
Your GL excludes cyber claims. An umbrella might cover them. Excess won't.

Most small businesses get umbrella for the broader protection. Which are you leaning toward?`,
    sources: ['ISO Commercial Umbrella Forms', 'IRMI'],
  },
};

/**
 * Lucy AI Advisor service
 */
export class LucyAdvisor {
  private conversations: Map<string, LucyConversation> = new Map();

  /**
   * Get a welcome greeting for a new or returning user
   */
  async getWelcomeGreeting(lead?: Partial<InsuranceLead>): Promise<string> {
    if (lead?.companyName && lead?.industry) {
      return CONVERSATION_TEMPLATES.welcome.industrySpecific(lead.industry);
    }
    return CONVERSATION_TEMPLATES.welcome.general;
  }

  /**
   * Process a chat message and generate a response
   */
  async chat(request: LucyChatRequest): Promise<LucyChatResponse> {
    // Get or create conversation
    let conversation: LucyConversation;
    if (request.conversationId) {
      conversation = this.conversations.get(request.conversationId) || this.createConversation();
    } else {
      conversation = this.createConversation();
    }

    // Update context if provided
    if (request.context) {
      conversation.context = { ...conversation.context, ...request.context };
    }

    // Add user message
    const userMessage: LucyMessage = {
      id: uuidv4(),
      role: 'user',
      content: request.message,
      timestamp: new Date(),
    };
    conversation.messages.push(userMessage);

    // Generate response
    const response = await this.generateResponse(request.message, conversation);

    // Add Lucy's response to conversation
    const lucyMessage: LucyMessage = {
      id: uuidv4(),
      role: 'lucy',
      content: response.message,
      timestamp: new Date(),
      metadata: {
        citations: response.citations,
        confidenceScore: response.confidenceScore,
        suggestedActions: response.suggestedQuestions,
      },
    };
    conversation.messages.push(lucyMessage);

    // Save conversation
    conversation.updatedAt = new Date();
    this.conversations.set(conversation.id, conversation);

    return {
      conversationId: conversation.id,
      response,
    };
  }

  /**
   * Generate narrative explanation for assessment results
   */
  async generateAssessmentNarrative(
    riskResult: MultiLineRiskAssessmentResult | null,
    complianceResult: ComplianceAuditSummary | null
  ): Promise<string> {
    if (!riskResult) {
      return 'I wasn\'t able to complete the full risk assessment. Let\'s talk through your situation manually—I can still help you understand your coverage needs.';
    }

    const { overallRiskScore, coverageGaps, overinsuredAreas, prioritizedRecommendations } = riskResult;

    let narrative = '';

    // Overall assessment
    if (overallRiskScore >= 70) {
      const gaps = coverageGaps.map(g => g.description);
      narrative = CONVERSATION_TEMPLATES.assessmentNarratives.highRisk(gaps);
    } else if (overallRiskScore >= 40) {
      const concerns = prioritizedRecommendations.slice(0, 3).map(r => r.description);
      narrative = CONVERSATION_TEMPLATES.assessmentNarratives.mediumRisk(concerns);
    } else {
      narrative = CONVERSATION_TEMPLATES.assessmentNarratives.lowRisk();
    }

    // Add compliance insights if available
    if (complianceResult) {
      narrative += '\n\n**Compliance Audit Results:**\n';

      if (complianceResult.wcagCompliance.criticalViolations > 0) {
        narrative += `⚠️ Your website has ${complianceResult.wcagCompliance.criticalViolations} critical accessibility violations. This is your biggest liability exposure—ADA web lawsuits are at record highs.\n`;
      }

      if (complianceResult.cyberReadiness.riskLevel === 'high' || complianceResult.cyberReadiness.riskLevel === 'critical') {
        narrative += `🔒 Your cyber readiness score indicates elevated risk. This will affect your cyber insurance premiums.\n`;
      }

      narrative += `\nOverall compliance grade: **${complianceResult.grade}**`;
    }

    // Add savings opportunities
    if (overinsuredAreas.length > 0) {
      const totalSavings = overinsuredAreas.reduce((sum, a) => sum + a.potentialSavings, 0);
      narrative += `\n\n**Potential Savings:** I identified approximately $${totalSavings.toLocaleString()} in areas where you may be over-covered. Not all coverage reduction makes sense, but it's worth reviewing.`;
    }

    // Add disclaimer
    narrative += `\n\n---\n*${LUCY_PERSONA.disclaimers.general}*`;

    return narrative;
  }

  /**
   * Get topic introduction for specific insurance line
   */
  getTopicIntro(topic: InsuranceLine | 'compliance'): string {
    const templates = CONVERSATION_TEMPLATES.topicIntros as Record<string, string>;
    return templates[topic] || this.generateGenericTopicIntro(topic as InsuranceLine);
  }

  /**
   * Look up answer from knowledge base
   */
  lookupKnowledge(query: string): { answer: string; sources: string[] } | null {
    const normalizedQuery = query.toLowerCase().trim();

    // Direct match
    if (KNOWLEDGE_BASE[normalizedQuery]) {
      return KNOWLEDGE_BASE[normalizedQuery];
    }

    // Fuzzy match
    for (const [key, value] of Object.entries(KNOWLEDGE_BASE)) {
      if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
        return value;
      }
    }

    return null;
  }

  /**
   * Get suggested follow-up questions based on context
   */
  getSuggestedQuestions(context: LucyContext): string[] {
    const questions: string[] = [];

    if (context.currentTopic) {
      const config = INSURANCE_LINE_CONFIGS[context.currentTopic as InsuranceLine];
      if (config) {
        questions.push(
          `What does ${config.displayName.toLowerCase()} typically cost?`,
          `What are the main exclusions in ${config.displayName.toLowerCase()} policies?`,
          `How do I know if I have enough ${config.displayName.toLowerCase()} coverage?`
        );
      }
    }

    if (context.riskAssessment) {
      questions.push(
        'Can you explain my biggest coverage gap?',
        'What should I prioritize first?',
        'How do I get a quote on these recommendations?'
      );
    }

    if (context.complianceAudit) {
      questions.push(
        'How do I fix my accessibility violations?',
        'Will fixing compliance issues lower my premiums?',
        'What\'s my litigation risk right now?'
      );
    }

    // Default questions
    if (questions.length === 0) {
      questions.push(
        'Can you run a compliance audit on my website?',
        'What insurance do most businesses in my industry carry?',
        'How do I know if I\'m over-insured?'
      );
    }

    return questions.slice(0, 4);
  }

  /**
   * Create a new conversation
   */
  private createConversation(): LucyConversation {
    return {
      id: uuidv4(),
      sessionId: uuidv4(),
      messages: [],
      context: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Generate response to user message
   */
  private async generateResponse(message: string, conversation: LucyConversation): Promise<LucyResponse> {
    const lowercaseMessage = message.toLowerCase();

    // Check for knowledge base matches
    const knowledgeMatch = this.lookupKnowledge(message);
    if (knowledgeMatch) {
      return {
        message: knowledgeMatch.answer,
        citations: knowledgeMatch.sources,
        suggestedQuestions: this.getSuggestedQuestions(conversation.context),
        confidenceScore: 0.95,
        disclaimer: LUCY_PERSONA.disclaimers.general,
      };
    }

    // Check for topic requests
    for (const [line, config] of Object.entries(INSURANCE_LINE_CONFIGS)) {
      if (lowercaseMessage.includes(config.displayName.toLowerCase()) ||
          lowercaseMessage.includes(line.replace('_', ' '))) {
        conversation.context.currentTopic = line as InsuranceLine;
        return {
          message: this.getTopicIntro(line as InsuranceLine),
          suggestedQuestions: this.getSuggestedQuestions(conversation.context),
          confidenceScore: 0.9,
        };
      }
    }

    // Check for compliance/audit requests
    if (lowercaseMessage.includes('audit') ||
        lowercaseMessage.includes('compliance') ||
        lowercaseMessage.includes('wcag') ||
        lowercaseMessage.includes('accessibility')) {
      conversation.context.currentTopic = 'compliance';
      return {
        message: CONVERSATION_TEMPLATES.topicIntros.compliance,
        suggestedQuestions: [
          'Yes, run a compliance audit on my site',
          'What does WCAG compliance mean?',
          'How does compliance affect my insurance rates?',
        ],
        callToAction: {
          type: 'audit',
          label: 'Run Free Compliance Audit',
          action: 'START_AUDIT',
        },
        confidenceScore: 0.9,
      };
    }

    // Check for quote requests
    if (lowercaseMessage.includes('quote') ||
        lowercaseMessage.includes('price') ||
        lowercaseMessage.includes('cost') ||
        lowercaseMessage.includes('how much')) {
      conversation.context.userIntent = 'quote';
      return {
        message: `I can help you get quotes! To give you accurate pricing, I'll need a bit more information about your business.

The quick way: Take our 5-minute risk assessment, and you'll get:
• Personalized coverage recommendations
• Estimated premium ranges for each line
• A compliance audit (if you have a website)
• Direct access to our team for custom quotes

Or, if you have a specific line in mind, tell me which one and I'll explain what factors affect pricing.`,
        suggestedQuestions: [
          'Start the risk assessment',
          'What affects cyber insurance pricing?',
          'I just need a quick ballpark estimate',
        ],
        callToAction: {
          type: 'assessment',
          label: 'Start Risk Assessment',
          action: 'START_ASSESSMENT',
        },
        confidenceScore: 0.85,
        disclaimer: LUCY_PERSONA.disclaimers.quote,
      };
    }

    // Default response
    return {
      message: `That's a great question. Let me think about the best way to help you here.

Could you tell me a bit more about your situation? Specifically:
• What industry is your business in?
• What's prompting you to look at insurance/compliance right now?
• Do you have existing coverage, or are you starting fresh?

The more context I have, the better I can tailor my guidance to your actual needs.`,
      suggestedQuestions: this.getSuggestedQuestions(conversation.context),
      confidenceScore: 0.7,
    };
  }

  /**
   * Generate generic topic intro for insurance lines without custom templates
   */
  private generateGenericTopicIntro(line: InsuranceLine): string {
    const config = INSURANCE_LINE_CONFIGS[line];
    if (!config) {
      return 'I\'m not sure about that specific type of coverage. Can you tell me more about what you\'re looking for?';
    }

    return `Let's talk about ${config.displayName}.

**What it covers:**
${config.description}

**Key factors that affect your premium:**
${config.keyRiskFactors.map(f => `• ${f.replace('_', ' ')}`).join('\n')}

**Commission structure:**
${(config.commissionRange.min * 100).toFixed(0)}–${(config.commissionRange.max * 100).toFixed(0)}% (this means I'm aligned with finding you the right coverage, not the most expensive)

**Typical premium range:**
$${config.typicalPremiumRange.min.toLocaleString()}–$${config.typicalPremiumRange.max.toLocaleString()}/year for most businesses

What specific questions do you have about ${config.displayName.toLowerCase()}?`;
  }
}

// Export singleton instance
export const lucyAdvisor = new LucyAdvisor();
