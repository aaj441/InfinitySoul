/**
 * Perplexity Sonar Integration - Intelligence Engine
 * Real-time accessibility insights via streaming to prevent timeouts
 *
 * Uses the Vercel AI SDK pattern for streaming responses
 * Prevents Vercel's 10s execution limit by streaming chunks immediately
 */

import { Request, Response } from 'express';

// In production, install:
// npm install @ai-sdk/perplexity ai

// import { generateText, streamText } from 'ai';
// import { perplexity } from '@ai-sdk/perplexity';

// For now, use mock implementation
const MOCK_INSIGHTS: Record<string, string> = {
  'image-alt': `Image alt text is critical for screen reader users and SEO. Properly describing images with alt text helps blind and low-vision users understand page content.

Guidelines:
- Be concise but descriptive (max 125 characters)
- Don't use "image of" or "picture of"
- For decorative images, use empty alt: alt=""
- Include context: "Navigation menu" not "Menu"
- For complex images, provide detailed descriptions

Impact: 15-20% of accessibility issues are missing alt text. This alone makes sites vulnerable to lawsuits.`,

  'keyboard-trap': `Keyboard traps prevent users with mobility disabilities from navigating your site. If focus gets stuck or you can't escape a component with Tab, users cannot proceed.

Solutions:
- Test: Tab through your entire site, can you exit everything?
- Remove autofocus on popups
- Implement focus management in modals
- Use tabindex carefully (avoid tabindex > 0)
- Implement keyboard shortcuts (Escape to close modals)

Impact: Complete site unusability for keyboard-only users. This is a critical accessibility violation.`,

  'form-labels': `Form labels associate text with input fields, helping screen reader users understand what data to enter.

Implementation:
- Always use <label> tags, not placeholders
- Link labels with htmlFor attribute: <label htmlFor="email">Email</label>
- Don't hide labels with CSS (use sr-only class instead)
- For complex forms, use fieldset and legend

Impact: Users cannot understand form fields without labels. This directly reduces conversions and creates ADA risk.`,

  'color-contrast': `Color contrast ensures text is readable for users with low vision. WCAG 2.2 AA requires 4.5:1 for normal text, 3:1 for large text.

Testing:
- Use WebAIM Contrast Checker
- Check both light/dark modes
- Test with protanopia, deuteranopia color blindness

Common fixes:
- Darken text color
- Lighten background color
- Remove light backgrounds behind dark text

Impact: Low contrast affects 253 million people globally with vision impairment. This is enforceable under ADA.`,

  'aria-attributes': `ARIA (Accessible Rich Internet Applications) helps screen readers understand dynamic content that HTML alone can't express.

Best practices:
- Use semantic HTML first (button, nav, main)
- Only add ARIA when native HTML won't work
- Test with actual screen readers (NVDA, JAWS)
- Keep aria-label text concise

Common mistakes:
- aria-label="" (removes element from screen reader)
- Using ARIA instead of semantic HTML
- Outdated ARIA patterns

Impact: Complex applications become unusable without proper ARIA. Modern frameworks like React have ARIA patterns.`,

  'button-name': `Accessible buttons must have text or aria-label that screen readers can read. "Click here" is not accessible; "Submit form" is.

Solutions:
- Use text inside button: <button>Save</button>
- For icon buttons, add aria-label: <button aria-label="Close menu">✕</button>
- Never use empty <button></button>
- Use <button> instead of <div> or <span>

Impact: Users can't identify buttons or understand actions. This breaks core functionality.`,

  'focus-management': `Focus management helps keyboard users navigate your site. They need visual indicators and logical tab order.

Implementation:
- Add focus-visible styles: .button:focus-visible { outline: 2px solid; }
- Maintain logical tab order (don't use tabindex > 0)
- Manage focus in modals and single-page apps
- Make focus visible with 2+ px outline

Impact: Keyboard-only users cannot use your site without proper focus management.`
};

/**
 * Main Sonar endpoint - streams real-time insights
 * Use this to avoid Vercel timeouts on expensive operations
 */
export async function sonarInsights(req: Request, res: Response) {
  const { violationCode, violationDescription, websiteUrl } = req.body;

  if (!violationCode) {
    return res.status(400).json({ error: 'violationCode required' });
  }

  // Set up streaming headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // In production, use Vercel AI SDK:
  // try {
  //   const systemPrompt = `You are an expert WCAG accessibility consultant and legal analyst for InfinitySol.
  // You provide practical accessibility remediation advice and explain litigation risk.
  // Be concise, cite WCAG 2.2 standards, and provide code examples when relevant.
  // Keep responses under 200 words unless detail is essential.
  // Always mention the business impact (user base excluded, litigation risk, brand reputation).`;
  //
  //   const stream = streamText({
  //     model: perplexity('sonar-pro'),
  //     system: systemPrompt,
  //     prompt: `The user's website (${websiteUrl}) has this accessibility violation:
  // Violation Code: ${violationCode}
  // Description: ${violationDescription}
  //
  // Provide:
  // 1. What this violation means for users
  // 2. Quick remediation steps (3-5 bullet points)
  // 3. Business impact (who can't access this, litigation risk)
  // 4. WCAG 2.2 reference`,
  //     temperature: 0.7,
  //     maxTokens: 500
  //   });
  //
  //   for await (const chunk of stream.textStream) {
  //     res.write(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`);
  //   }
  //
  //   res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
  //   res.end();
  // } catch (error) {
  //   console.error('❌ Sonar error:', error);
  //   res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to generate insights' })}\n\n`);
  //   res.end();
  // }

  // MOCK IMPLEMENTATION (for MVP launch)
  try {
    // Get mock insight
    const insight = MOCK_INSIGHTS[violationCode] || MOCK_INSIGHTS['image-alt'];

    // Stream it in chunks to simulate real API
    const chunks = insight.split('\n\n');
    let delay = 0;

    for (const chunk of chunks) {
      setTimeout(() => {
        res.write(`data: ${JSON.stringify({ type: 'text', content: chunk + '\n\n' })}\n\n`);
      }, delay);
      delay += 100;
    }

    // Send completion signal
    setTimeout(() => {
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    }, delay + 200);
  } catch (error) {
    console.error('❌ Sonar error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to generate insights' })}\n\n`);
    res.end();
  }
}

/**
 * Non-streaming endpoint for complete insights
 */
export async function sonarInsightsComplete(req: Request, res: Response) {
  const { violationCode, violationDescription, websiteUrl } = req.body;

  if (!violationCode) {
    return res.status(400).json({ error: 'violationCode required' });
  }

  try {
    // In production:
    // const { text } = await generateText({
    //   model: perplexity('sonar-pro'),
    //   system: 'You are an expert WCAG accessibility consultant...',
    //   prompt: '...'
    // });

    const insight = MOCK_INSIGHTS[violationCode] || MOCK_INSIGHTS['image-alt'];

    return res.json({
      violationCode,
      websiteUrl,
      insight,
      remediation: generateRemediationSteps(violationCode),
      businessImpact: generateBusinessImpact(violationCode),
      wcagReference: generateWCAGReference(violationCode)
    });
  } catch (error) {
    console.error('❌ Sonar error:', error);
    return res.status(500).json({ error: 'Failed to generate insights' });
  }
}

// ============ HELPER FUNCTIONS ============

function generateRemediationSteps(violationCode: string): string[] {
  const steps: Record<string, string[]> = {
    'image-alt': [
      'Add alt attribute to every <img> tag',
      'Write descriptive alt text (max 125 chars)',
      'Use empty alt="" for purely decorative images',
      'Use WebAIM alt text checker to validate'
    ],
    'keyboard-trap': [
      'Test: Tab through entire form, can you exit?',
      'Remove autofocus from popups',
      'Implement focus management in modals',
      'Add Escape key handler to close dialogs'
    ],
    'form-labels': [
      'Add <label> for every form input',
      'Connect with htmlFor attribute',
      'Hide visual labels with sr-only class',
      'Avoid placeholder-only labels'
    ],
    'color-contrast': [
      'Test with WebAIM Contrast Checker',
      'Aim for 4.5:1 ratio for body text',
      'Aim for 3:1 ratio for large text (18pt+)',
      'Test light and dark modes'
    ]
  };

  return steps[violationCode] || steps['image-alt'];
}

function generateBusinessImpact(violationCode: string): string {
  const impacts: Record<string, string> = {
    'image-alt':
      'Blind and low-vision users (253M globally) cannot access image content. 347 ADA lawsuits/year in e-commerce alone.',
    'keyboard-trap':
      'Users with mobility disabilities cannot navigate your site. Complete site unusability for 15% of population.',
    'form-labels':
      'Users with cognitive disabilities and screen reader users cannot complete forms. Directly reduces conversions.',
    'color-contrast':
      'Low contrast affects 253M people with vision impairment. Enforceable under ADA Section 508.',
    'aria-attributes':
      'Screen reader users cannot navigate dynamic content (menus, tabs, modals). Common in React/Angular apps.',
    'button-name':
      'Users cannot identify buttons or understand actions. Breaks core functionality for assistive tech users.',
    'focus-management': 'Keyboard-only users get lost navigating your site. Impossible to use without visible focus.'
  };

  return impacts[violationCode] || impacts['image-alt'];
}

function generateWCAGReference(violationCode: string): string {
  const references: Record<string, string> = {
    'image-alt': 'WCAG 2.2 1.1.1 Non-text Content (Level A)',
    'keyboard-trap': 'WCAG 2.2 2.1.2 No Keyboard Trap (Level A)',
    'form-labels': 'WCAG 2.2 3.3.2 Labels or Instructions (Level A)',
    'color-contrast': 'WCAG 2.2 1.4.3 Contrast (Minimum) (Level AA)',
    'aria-attributes': 'WCAG 2.2 4.1.2 Name, Role, Value (Level A)',
    'button-name': 'WCAG 2.2 4.1.2 Name, Role, Value (Level A)',
    'focus-management': 'WCAG 2.2 2.4.3 Focus Order (Level A)'
  };

  return references[violationCode] || references['image-alt'];
}

// ============ STREAM FORMATTER ============

export function formatStreamResponse(text: string) {
  return {
    type: 'text',
    content: text
  };
}

export function formatStreamDone() {
  return {
    type: 'done'
  };
}

export function formatStreamError(message: string) {
  return {
    type: 'error',
    message
  };
}
