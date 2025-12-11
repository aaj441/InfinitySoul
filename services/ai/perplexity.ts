/**
 * Perplexity AI Service Integration
 *
 * Provides interface to Perplexity AI API for accessibility analysis
 * and legal research.
 */

import axios from 'axios';
import { createModuleLogger } from '../../utils/logger';
import { ExternalServiceError } from '../../utils/errorTracking';
import { config } from '../../config/environment';

const logger = createModuleLogger('PerplexityAI');

export interface PerplexityRequest {
  model?: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  search_domain_filter?: string[];
  return_images?: boolean;
  return_related_questions?: boolean;
  stream?: boolean;
}

export interface PerplexityResponse {
  id: string;
  model: string;
  created: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  citations?: string[];
  object: string;
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta: {
      role: string;
      content: string;
    };
  }>;
}

/**
 * Perplexity AI client
 */
class PerplexityClient {
  private apiKey: string;
  private baseURL = 'https://api.perplexity.ai';
  private defaultModel = 'llama-3.1-sonar-large-128k-online';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || config.PERPLEXITY_API_KEY || '';

    if (!this.apiKey) {
      logger.warn('Perplexity API key not configured. Service will not be available.');
    }
  }

  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Make a request to Perplexity API
   */
  async query(request: PerplexityRequest): Promise<PerplexityResponse> {
    if (!this.isAvailable()) {
      throw new ExternalServiceError('Perplexity', 'API key not configured');
    }

    const startTime = Date.now();

    try {
      const response = await axios.post<PerplexityResponse>(
        `${this.baseURL}/chat/completions`,
        {
          model: request.model || this.defaultModel,
          messages: request.messages,
          max_tokens: request.max_tokens,
          temperature: request.temperature || 0.2,
          top_p: request.top_p || 0.9,
          search_domain_filter: request.search_domain_filter,
          return_images: request.return_images || false,
          return_related_questions: request.return_related_questions || false,
          stream: request.stream || false,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60 second timeout
        }
      );

      const duration = Date.now() - startTime;
      logger.info('Perplexity API request completed', {
        duration: `${duration}ms`,
        model: response.data.model,
        tokens: response.data.usage.total_tokens,
      });

      return response.data;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      if (axios.isAxiosError(error)) {
        logger.error('Perplexity API request failed', {
          duration: `${duration}ms`,
          status: error.response?.status,
          message: error.response?.data?.error || error.message,
        });

        throw new ExternalServiceError(
          'Perplexity',
          error.response?.data?.error?.message || error.message
        );
      }

      logger.error('Perplexity API unexpected error', {
        duration: `${duration}ms`,
        error: error.message,
      });

      throw new ExternalServiceError('Perplexity', 'Unexpected error occurred');
    }
  }

  /**
   * Analyze accessibility violations with legal context
   */
  async analyzeViolations(
    violations: any[],
    domain: string
  ): Promise<string> {
    const violationSummary = violations
      .map((v) => `- ${v.id}: ${v.description} (${v.nodes.length} instances)`)
      .join('\n');

    const response = await this.query({
      messages: [
        {
          role: 'system',
          content:
            'You are an expert in web accessibility law and WCAG compliance. Provide concise, factual analysis of accessibility violations and their legal implications.',
        },
        {
          role: 'user',
          content: `Analyze these WCAG violations for ${domain}:\n\n${violationSummary}\n\nProvide:\n1. Legal risk level (Low/Medium/High)\n2. Most likely basis for litigation\n3. Recent similar cases (if any)\n4. Recommended remediation priority`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.2,
      return_related_questions: true,
    });

    return response.choices[0].message.content;
  }

  /**
   * Research recent accessibility litigation
   */
  async researchLitigation(industry: string): Promise<string> {
    const response = await this.query({
      messages: [
        {
          role: 'system',
          content:
            'You are a legal researcher specializing in ADA Title III and web accessibility litigation.',
        },
        {
          role: 'user',
          content: `Find recent (last 12 months) web accessibility lawsuits in the ${industry} industry. Include: plaintiff law firms, common violation types, settlement amounts if available.`,
        },
      ],
      max_tokens: 1500,
      temperature: 0.1,
      search_domain_filter: ['pacer.gov', 'ada.gov', 'courtlistener.com'],
      return_related_questions: false,
    });

    return response.choices[0].message.content;
  }

  /**
   * Get AI summary of accessibility report
   */
  async summarizeReport(scanResult: any): Promise<string> {
    const response = await this.query({
      messages: [
        {
          role: 'system',
          content:
            'You are an accessibility consultant. Create executive summaries of WCAG audit reports.',
        },
        {
          role: 'user',
          content: `Summarize this accessibility scan in 2-3 sentences:\n\nTotal Violations: ${scanResult.violations.total}\nCritical: ${scanResult.violations.critical}\nSerious: ${scanResult.violations.serious}\nModerate: ${scanResult.violations.moderate}\n\nInfinity8 Score: ${scanResult.infinity8Score}/1000\nRisk Level: ${scanResult.riskLevel}`,
        },
      ],
      max_tokens: 200,
      temperature: 0.3,
    });

    return response.choices[0].message.content;
  }
}

// Export singleton instance
export const perplexityClient = new PerplexityClient();

export default perplexityClient;
