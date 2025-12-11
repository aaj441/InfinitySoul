/**
 * Lucy Chat Widget
 *
 * Floating chat interface for Lucy, the AI compliance advisor.
 * Provides conversational assistance for insurance and compliance questions.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LucyMessage {
  id: string;
  role: 'user' | 'lucy';
  content: string;
  timestamp: Date;
  suggestedQuestions?: string[];
  callToAction?: {
    label: string;
    action: string;
  };
}

interface LucyChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
}

const INITIAL_MESSAGES: LucyMessage[] = [
  {
    id: '1',
    role: 'lucy',
    content: `Hi! I'm Lucy, your AI compliance advisor. I help businesses understand their risk exposure and find insurance that actually protects them—not just policies that check a box.

What brings you here today?`,
    timestamp: new Date(),
    suggestedQuestions: [
      'What insurance do I need for my business?',
      'Can you audit my website for compliance?',
      'How do I know if I\'m over-insured?',
      'What does cyber insurance cover?',
    ],
  },
];

export function LucyChatWidget({ isOpen, onToggle }: LucyChatWidgetProps) {
  const [messages, setMessages] = useState<LucyMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (message?: string) => {
    const text = message || input;
    if (!text.trim()) return;

    // Add user message
    const userMessage: LucyMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate Lucy's response (in production, this would call the API)
    setTimeout(() => {
      const lucyResponse = generateLucyResponse(text);
      setMessages((prev) => [...prev, lucyResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat toggle button */}
      <motion.button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-emerald-600 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Close chat' : 'Open chat with Lucy'}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 h-[600px] bg-slate-800 rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-700 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-emerald-600 to-emerald-500 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">Lucy</h3>
                <p className="text-xs text-emerald-100">AI Compliance Advisor</p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-xs text-emerald-100">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-emerald-500 text-white rounded-br-none'
                          : 'bg-slate-700 text-slate-100 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </motion.div>

                  {/* Suggested questions */}
                  {message.role === 'lucy' && message.suggestedQuestions && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestedQuestions.map((question) => (
                        <button
                          key={question}
                          onClick={() => handleSend(question)}
                          className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-full transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Call to action */}
                  {message.role === 'lucy' && message.callToAction && (
                    <div className="mt-3">
                      <button className="text-sm bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors">
                        {message.callToAction.label}
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-sm">🤖</span>
                  </div>
                  <div className="bg-slate-700 rounded-2xl px-4 py-3 rounded-bl-none">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Lucy anything..."
                  className="flex-1 bg-slate-700 text-white placeholder-slate-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  aria-label="Chat message input"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                  aria-label="Send message"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2 text-center">
                Lucy provides educational information, not insurance or legal advice.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Generate Lucy's response based on user input
 * In production, this would call the LucyAdvisor API
 */
function generateLucyResponse(input: string): LucyMessage {
  const lowerInput = input.toLowerCase();

  // Cyber insurance
  if (lowerInput.includes('cyber') || lowerInput.includes('data breach') || lowerInput.includes('ransomware')) {
    return {
      id: Date.now().toString(),
      role: 'lucy',
      content: `Great question about cyber insurance! This is actually one of my favorite topics because it's where I see the biggest coverage gaps.

Here's the thing: most businesses don't realize they're one data breach away from serious trouble.

**Key cyber facts:**
• Average breach cost: $4.45 million
• 43% of attacks target small businesses
• Average recovery time: 287 days

The good news? Cyber insurance is actually affordable—especially if your compliance is solid. That's where our WCAG audit becomes valuable.

Want me to run a quick compliance scan on your website?`,
      timestamp: new Date(),
      suggestedQuestions: [
        'Yes, run a compliance scan',
        'What does cyber insurance cost?',
        'What does cyber insurance cover?',
      ],
      callToAction: {
        label: 'Run Free Compliance Audit',
        action: 'START_AUDIT',
      },
    };
  }

  // Compliance/audit
  if (lowerInput.includes('audit') || lowerInput.includes('compliance') || lowerInput.includes('wcag')) {
    return {
      id: Date.now().toString(),
      role: 'lucy',
      content: `Let's talk compliance! This is where I can actually show you real value—not just talk.

I can scan your website and check three things:

1. **WCAG Accessibility** - ADA lawsuits are at record highs. I'll check if you're exposed.

2. **Cyber Readiness** - SSL, security headers, basic security hygiene.

3. **Regulatory Fit** - Industry-specific requirements like HIPAA, PCI-DSS, etc.

Here's the kicker: good compliance = lower insurance premiums. Insurers reward businesses that manage risk proactively.

The scan takes about 30 seconds. Want me to run it?`,
      timestamp: new Date(),
      suggestedQuestions: [
        'Yes, scan my website',
        'What is WCAG compliance?',
        'How does compliance affect premiums?',
      ],
      callToAction: {
        label: 'Start Compliance Audit',
        action: 'START_AUDIT',
      },
    };
  }

  // Over-insured
  if (lowerInput.includes('over-insur') || lowerInput.includes('overinsur') || lowerInput.includes('paying too much')) {
    return {
      id: Date.now().toString(),
      role: 'lucy',
      content: `This is such a common problem! Here's what I typically see:

**Signs you might be over-insured:**
• Coverage limits way higher than your actual assets
• Overlapping coverage between policies
• Premium increases without corresponding risk increases
• "Just in case" coverage for risks that don't apply to you

**Signs you might be under-insured:**
• No cyber coverage (while handling customer data)
• GL limits that haven't increased with revenue
• No umbrella policy despite significant assets
• Exclusions you didn't know about

The fix isn't buying more or less—it's buying SMARTER.

Want me to run a quick risk assessment? I'll show you exactly where your coverage matches up (or doesn't) with your actual risks.`,
      timestamp: new Date(),
      suggestedQuestions: [
        'Start the risk assessment',
        'What\'s a typical coverage gap?',
        'How do I review my current policies?',
      ],
      callToAction: {
        label: 'Start Risk Assessment',
        action: 'START_ASSESSMENT',
      },
    };
  }

  // What insurance do I need
  if (lowerInput.includes('what insurance') || lowerInput.includes('need') || lowerInput.includes('coverage')) {
    return {
      id: Date.now().toString(),
      role: 'lucy',
      content: `That depends on your specific situation! Let me ask a few quick questions:

First, what industry is your business in? Different industries have very different risk profiles.

For example:
• **Construction** typically needs workers comp, GL, and bonds
• **Tech companies** need cyber and E&O
• **Healthcare** needs malpractice and HIPAA-compliant cyber
• **Retail** needs GL, property, and cyber (if you take cards)

Once I know your industry and a bit about your operations, I can give you specific recommendations based on what actually protects you—not just generic advice.

What industry are you in?`,
      timestamp: new Date(),
      suggestedQuestions: [
        'I\'m in technology',
        'I\'m in construction',
        'I\'m in healthcare',
        'Other industry',
      ],
    };
  }

  // Default response
  return {
    id: Date.now().toString(),
    role: 'lucy',
    content: `That's a great question. Let me help you with that.

To give you the most useful answer, could you tell me a bit more about:
• What industry is your business in?
• Are you looking to understand coverage, get a quote, or something else?

Or, if you want, I can run a quick assessment that covers everything—it takes about 5 minutes and gives you personalized recommendations.`,
    timestamp: new Date(),
    suggestedQuestions: [
      'Start the 5-min assessment',
      'I want to understand cyber insurance',
      'Can you audit my website?',
      'How do I know if I\'m covered?',
    ],
    callToAction: {
      label: 'Start Assessment',
      action: 'START_ASSESSMENT',
    },
  };
}
