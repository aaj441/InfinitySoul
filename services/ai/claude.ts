/**
 * Claude AI (Anthropic) Service Integration
 *
 * Provides interface to Claude AI for accessibility analysis,
 * content generation, and compliance recommendations.
 */

import Anthropic from '@anthropic-ai/sdk';
import { createModuleLogger } from '../../utils/logger';
import { ExternalServiceError } from '../../utils/errorTracking';
import { config } from '../../config/environment';

const logger = createModuleLogger('ClaudeAI');

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Claude AI client
 */
class ClaudeClient {
  private client: Anthropic | null = null;
  private apiKey: string;
  private defaultModel = 'claude-3-5-sonnet-20241022';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || config.ANTHROPIC_API_KEY || '';

    if (this.apiKey) {
      this.client = new Anthropic({
        apiKey: this.apiKey,
      });
    } else {
      logger.warn('Claude API key not configured. Service will not be available.');
    }
  }

  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    return !!this.client;
  }

  /**
   * Make a request to Claude API
   */
  async query(
    messages: ClaudeMessage[],
    options?: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      system?: string;
    }
  ): Promise<ClaudeResponse> {
    if (!this.isAvailable() || !this.client) {
      throw new ExternalServiceError('Claude', 'API key not configured');
    }

    const startTime = Date.now();

    try {
      const response = await this.client.messages.create({
        model: options?.model || this.defaultModel,
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature || 0.2,
        system: options?.system,
        messages: messages,
      });

      const duration = Date.now() - startTime;
      logger.info('Claude API request completed', {
        duration: `${duration}ms`,
        model: response.model,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      });

      return response as ClaudeResponse;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      logger.error('Claude API request failed', {
        duration: `${duration}ms`,
        error: error.message,
      });

      throw new ExternalServiceError('Claude', error.message);
    }
  }

  /**
   * Analyze accessibility violations
   */
  async analyzeViolations(violations: any[], domain: string): Promise<string> {
    const violationDetails = violations
      .slice(0, 10) // Limit to top 10 to avoid token limits
      .map(
        (v) =>
          `**${v.id}** (Impact: ${v.impact})\n` +
          `  Description: ${v.description}\n` +
          `  Help: ${v.help}\n` +
          `  Instances: ${v.nodes.length}\n` +
          `  WCAG: ${v.tags.join(', ')}`
      )
      .join('\n\n');

    const response = await this.query(
      [
        {
          role: 'user',
          content: `You are an accessibility expert. Analyze these WCAG violations for ${domain}:\n\n${violationDetails}\n\nProvide:\n1. Overall assessment of compliance\n2. Most critical issues to fix first\n3. Estimated effort to remediate\n4. Legal risk assessment`,
        },
      ],
      {
        system:
          'You are an expert in WCAG 2.2 compliance, web accessibility best practices, and ADA Title III regulations. Provide practical, actionable recommendations.',
        maxTokens: 2000,
        temperature: 0.2,
      }
    );

    return response.content[0].text;
  }

  /**
   * Generate remediation recommendations
   */
  async generateRemediation(violation: any): Promise<string> {
    const response = await this.query(
      [
        {
          role: 'user',
          content: `Violation: ${violation.id}\nDescription: ${violation.description}\nHelp: ${violation.help}\n\nProvide step-by-step code examples to fix this violation. Include both HTML and any necessary JavaScript/CSS.`,
        },
      ],
      {
        system:
          'You are a senior web developer specializing in accessible web design. Provide concrete code examples.',
        maxTokens: 1500,
        temperature: 0.1,
      }
    );

    return response.content[0].text;
  }

  /**
   * Draft compliance email
   */
  async draftComplianceEmail(
    companyName: string,
    violationCount: number,
    riskLevel: string
  ): Promise<string> {
    const response = await this.query(
      [
        {
          role: 'user',
          content: `Draft a professional email to ${companyName} about their website's accessibility compliance. Found ${violationCount} violations with ${riskLevel} risk level. Email should be factual, reference ADA Title III, mention lawsuit trends, and offer InfinitySol's services. Keep it under 200 words.`,
        },
      ],
      {
        system:
          'You are a professional accessibility compliance consultant. Write clear, factual, non-threatening business communications.',
        maxTokens: 500,
        temperature: 0.3,
      }
    );

    return response.content[0].text;
  }

  /**
   * Assess legal risk
   */
  async assessLegalRisk(scanResult: any): Promise<{
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    reasoning: string;
    recommendations: string[];
  }> {
    const response = await this.query(
      [
        {
          role: 'user',
          content: `Assess ADA Title III litigation risk:\n\nViolations: ${scanResult.violations.total}\nCritical: ${scanResult.violations.critical}\nSerious: ${scanResult.violations.serious}\nIndustry: ${scanResult.industry || 'general'}\n\nProvide JSON response with: riskLevel (Low/Medium/High/Critical), reasoning (string), recommendations (array of strings)`,
        },
      ],
      {
        system:
          'You are a legal risk analyst specializing in ADA Title III web accessibility litigation. Provide data-driven risk assessments.',
        maxTokens: 1000,
        temperature: 0.1,
      }
    );

    try {
      // Extract JSON from response (Claude sometimes wraps in markdown)
      const text = response.content[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback if no JSON found
      return {
        riskLevel: 'Medium',
        reasoning: text,
        recommendations: ['Review full analysis above'],
      };
    } catch (error) {
      logger.warn('Failed to parse Claude risk assessment as JSON', { error });
      return {
        riskLevel: 'Medium',
        reasoning: response.content[0].text,
        recommendations: ['Manual review recommended'],
      };
    }
  }

  /**
   * Compare with industry standards
   */
  async compareWithIndustry(
    infinity8Score: number,
    industry: string
  ): Promise<string> {
    const response = await this.query(
      [
        {
          role: 'user',
          content: `Infinity8 Score: ${infinity8Score}/1000 for ${industry} industry. How does this compare to industry standards? What percentile is this score? What improvements would move them to top quartile?`,
        },
      ],
      {
        system:
          'You are an accessibility benchmarking analyst. Provide context about how scores compare to industry peers.',
        maxTokens: 600,
        temperature: 0.2,
      }
    );

    return response.content[0].text;
  }
}

// Export singleton instance
export const claudeClient = new ClaudeClient();

export default claudeClient;
