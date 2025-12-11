import { logger } from '../logger';

// Email branding wrapper with Infinity 8 logo
function wrapWithBranding(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: Georgia, 'Times New Roman', serif; 
      line-height: 1.6; 
      color: #2A0A0A; 
      background-color: #F5F5DC;
      margin: 0;
      padding: 0;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white;
      border: 1px solid #8B8B7A;
    }
    .header { 
      background: linear-gradient(to right, #5A1A1A, #8B3A3A, #5A1A1A);
      padding: 20px; 
      text-align: center;
    }
    .header img {
      max-width: 250px;
      height: auto;
      filter: brightness(0) invert(1);
    }
    .content { 
      padding: 30px; 
    }
    .footer { 
      background: #F5F5DC; 
      padding: 20px; 
      text-align: center; 
      font-size: 12px; 
      color: #4A4A4A;
      border-top: 2px solid #8B8B7A;
    }
    a { 
      color: #2C5F8D; 
      text-decoration: none; 
    }
    a:hover { 
      text-decoration: underline; 
    }
    h2, h3 { 
      color: #5A1A1A; 
      font-weight: bold;
    }
    .button {
      display: inline-block;
      background: #2C5F8D;
      color: white !important;
      padding: 12px 30px;
      border-radius: 4px;
      text-decoration: none;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://yourdomain.com/brand/infinity8-logo.svg" alt="Infinity 8 Consulting Services" />
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p><strong>Infinity 8 Consulting Services, LLC</strong></p>
      <p>Premium WCAG Compliance & Accessibility Automation</p>
      <p>
        <a href="https://yourdomain.com">Website</a> | 
        <a href="https://yourdomain.com/privacy">Privacy Policy</a> | 
        <a href="{{unsubscribeUrl}}">Unsubscribe</a>
      </p>
      <p style="font-size: 10px; color: #8B8B7A; margin-top: 10px;">
        © 2025 Infinity 8 Consulting Services, LLC. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  category: string;
}

const BUILT_IN_TEMPLATES: EmailTemplate[] = [
  {
    id: 'initial_report',
    name: 'Initial Report',
    subject: 'Your Website Accessibility Audit is Ready for {{company}}',
    body: `<h2>Hello {{firstName}},</h2>
<p>We've completed a comprehensive WCAG accessibility audit of {{company}}.</p>
<h3>Key Findings:</h3>
<ul>
  <li>Total Issues: {{violationCount}}</li>
  <li>Accessibility Score: {{wcagScore}}/100</li>
  <li>Risk Level: {{riskLevel}}</li>
</ul>
<p><a href="{{reportUrl}}" class="button">View Full Report</a></p>
<p style="margin-top: 20px;">Our team at Infinity 8 is here to help you achieve full compliance and protect your business from accessibility lawsuits.</p>
<p>Best regards,<br><strong>The Infinity 8 Team</strong></p>`,
    variables: ['company', 'firstName', 'violationCount', 'wcagScore', 'riskLevel', 'reportUrl'],
    category: 'initial'
  },
  {
    id: 'quick_wins',
    name: 'Quick Wins',
    subject: 'Quick fixes to improve {{company}}\'s accessibility',
    body: `<h2>Hello {{firstName}},</h2>
<p>We've identified {{quickWinCount}} quick wins that can be implemented immediately:</p>
<ul>
  {{#quickWins}}
  <li>{{this}}</li>
  {{/quickWins}}
</ul>
<p>These improvements typically take 1-2 weeks and don't require major redesigns.</p>
<p><a href="{{quickWinsUrl}}" class="button">View Quick Wins Roadmap</a></p>
<p style="margin-top: 20px;">Infinity 8's proven methodology helps you prioritize high-impact changes for rapid compliance improvement.</p>
<p>Best regards,<br><strong>The Infinity 8 Team</strong></p>`,
    variables: ['firstName', 'company', 'quickWinCount', 'quickWinsUrl'],
    category: 'follow_up'
  },
  {
    id: 'social_proof',
    name: 'Social Proof',
    subject: 'How {{industry}} leaders are addressing accessibility',
    body: `<h2>Hello {{firstName}},</h2>
<p>Leading companies in the {{industry}} space are prioritizing accessibility. Here's what they're doing:</p>
<p>Industry benchmark shows that 87% of enterprise organizations have invested in accessibility improvements.</p>
<p><a href="{{socialProofUrl}}" class="button">See Industry Insights</a></p>
<p style="margin-top: 20px;">Join forward-thinking {{industry}} organizations partnering with Infinity 8 for continuous compliance.</p>
<p>Best regards,<br><strong>The Infinity 8 Team</strong></p>`,
    variables: ['firstName', 'industry', 'socialProofUrl'],
    category: 'social_proof'
  }
];

export class TemplateEngine {
  private templates: Map<string, EmailTemplate> = new Map();

  constructor() {
    BUILT_IN_TEMPLATES.forEach(t => this.templates.set(t.id, t));
  }

  async getTemplate(templateId: string): Promise<EmailTemplate | undefined> {
    return this.templates.get(templateId);
  }

  async listTemplates(category?: string): Promise<EmailTemplate[]> {
    const all = Array.from(this.templates.values());
    if (category) {
      return all.filter(t => t.category === category);
    }
    return all;
  }

  async renderTemplate(templateId: string, variables: Record<string, any>): Promise<string> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    let html = template.body;

    // Simple variable replacement
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, String(value || ''));
      // Wrap content with Infinity 8 branding
      html = wrapWithBranding(html);

    }

    logger.info(`Rendered template ${templateId}`, { variables: Object.keys(variables) });
    return html;
  }

  async createCustomTemplate(name: string, subject: string, body: string): Promise<EmailTemplate> {
    const id = `custom_${Date.now()}`;
    
    // Extract variables from template
    const variableMatches = body.match(/{{(\w+)}}/g) || [];
    const variables = Array.from(new Set(variableMatches.map(m => m.replace(/{{|}}/g, ''))));

    const template: EmailTemplate = {
      id,
      name,
      subject,
      body,
      variables,
      category: 'custom'
    };

    this.templates.set(id, template);
    logger.info(`Created custom template: ${name}`, { id, variableCount: variables.length });
    return template;
  }
}

export const templateEngine = new TemplateEngine();
