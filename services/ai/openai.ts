/**
 * OpenAI Service Integration
 *
 * Provides interface to OpenAI API (GPT-4) for accessibility analysis
 * and content generation.
 */

import OpenAI from 'openai';
import { createModuleLogger } from '../../utils/logger';
import { ExternalServiceError } from '../../utils/errorTracking';
import { config } from '../../config/environment';

const logger = createModuleLogger('OpenAI');

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * OpenAI client
 */
class OpenAIClient {
  private client: OpenAI | null = null;
  private apiKey: string;
  private defaultModel = 'gpt-4-turbo-preview';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || config.OPENAI_API_KEY || '';

    if (this.apiKey) {
      this.client = new OpenAI({
        apiKey: this.apiKey,
      });
    } else {
      logger.warn('OpenAI API key not configured. Service will not be available.');
    }
  }

  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    return !!this.client;
  }

  /**
   * Make a request to OpenAI API
   */
  async query(
    messages: OpenAIMessage[],
    options?: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    if (!this.isAvailable() || !this.client) {
      throw new ExternalServiceError('OpenAI', 'API key not configured');
    }

    const startTime = Date.now();

    try {
      const response = await this.client.chat.completions.create({
        model: options?.model || this.defaultModel,
        messages: messages,
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature || 0.2,
      });

      const duration = Date.now() - startTime;
      logger.info('OpenAI API request completed', {
        duration: `${duration}ms`,
        model: response.model,
        promptTokens: response.usage?.prompt_tokens,
        completionTokens: response.usage?.completion_tokens,
      });

      return response;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      logger.error('OpenAI API request failed', {
        duration: `${duration}ms`,
        error: error.message,
      });

      throw new ExternalServiceError('OpenAI', error.message);
    }
  }

  /**
   * Analyze accessibility violations
   */
  async analyzeViolations(violations: any[], domain: string): Promise<string> {
    const violationSummary = violations
      .slice(0, 10)
      .map(
        (v) =>
          `- ${v.id}: ${v.description} (Impact: ${v.impact}, ${v.nodes.length} instances)`
      )
      .join('\n');

    const response = await this.query(
      [
        {
          role: 'system',
          content:
            'You are an expert in WCAG 2.2 compliance and web accessibility. Provide detailed, actionable analysis.',
        },
        {
          role: 'user',
          content: `Analyze these accessibility violations for ${domain}:\n\n${violationSummary}\n\nProvide:\n1. Severity assessment\n2. Priority ranking for fixes\n3. Potential impact on users with disabilities\n4. Compliance level (A, AA, AAA)`,
        },
      ],
      {
        maxTokens: 2000,
        temperature: 0.2,
      }
    );

    return response.choices[0].message.content || 'No analysis generated';
  }

  /**
   * Generate executive summary
   */
  async generateExecutiveSummary(scanResult: any): Promise<string> {
    const response = await this.query(
      [
        {
          role: 'system',
          content:
            'You are a business consultant specializing in accessibility compliance. Create executive summaries for C-level executives.',
        },
        {
          role: 'user',
          content: `Create an executive summary for this accessibility audit:\n\nDomain: ${scanResult.domain}\nTotal Violations: ${scanResult.violations.total}\nInfinity8 Score: ${scanResult.infinity8Score}/1000\nRisk Level: ${scanResult.riskLevel}\n\nFocus on business impact, legal risk, and ROI of remediation. Keep under 150 words.`,
        },
      ],
      {
        maxTokens: 400,
        temperature: 0.3,
      }
    );

    return response.choices[0].message.content || 'No summary generated';
  }

  /**
   * Suggest alternative text for images
   */
  async suggestAltText(imageContext: string): Promise<string> {
    const response = await this.query(
      [
        {
          role: 'system',
          content:
            'You are an accessibility specialist. Write concise, descriptive alt text for images.',
        },
        {
          role: 'user',
          content: `Suggest alt text for an image with this context: "${imageContext}". Provide 2-3 options, each under 125 characters.`,
        },
      ],
      {
        maxTokens: 200,
        temperature: 0.4,
      }
    );

    return response.choices[0].message.content || 'No suggestions generated';
  }

  /**
   * Generate compliance checklist
   */
  async generateChecklist(violations: any[]): Promise<string[]> {
    const response = await this.query(
      [
        {
          role: 'system',
          content:
            'You are a project manager creating accessibility remediation checklists.',
        },
        {
          role: 'user',
          content: `Create a prioritized checklist to fix these violations:\n\n${violations.map((v) => `- ${v.id}: ${v.description}`).join('\n')}\n\nReturn as a numbered list. Each item should be actionable and specific.`,
        },
      ],
      {
        maxTokens: 1000,
        temperature: 0.2,
      }
    );

    const content = response.choices[0].message.content || '';
    return content
      .split('\n')
      .filter((line) => line.trim().match(/^\d+\./))
      .map((line) => line.replace(/^\d+\.\s*/, '').trim());
  }
}

// Export singleton instance
export const openaiClient = new OpenAIClient();

export default openaiClient;
