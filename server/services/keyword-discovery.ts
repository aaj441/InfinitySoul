import axios from "axios";
import { metaPromptsService } from "./meta-prompts";

export interface KeywordDiscoveryOptions {
  keywords: string[];
  industry?: string;
  region?: string;
  limit?: number;
  useAI?: boolean;
}

export interface DiscoveredProspect {
  company: string;
  website: string;
  industry: string;
  revenue?: string;
  employees?: string;
  icpScore: number;
  salesReadiness?: number;
  legalRisk?: "high" | "medium" | "low";
  recommendedApproach?: string;
}

export class KeywordDiscoveryService {
  private readonly googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
  private readonly googleEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;
  private readonly googleEndpoint = "https://www.googleapis.com/customsearch/v1";

  async discoverProspects(options: KeywordDiscoveryOptions): Promise<DiscoveredProspect[]> {
    if (!this.googleApiKey || !this.googleEngineId) {
      console.warn("Google Search API not configured - using mock data for demo");
      return this.getMockProspects(options);
    }

    const prospects: DiscoveredProspect[] = [];
    const visited = new Set<string>();

    for (const keyword of options.keywords) {
      try {
        const query = `${keyword} ${options.industry || ""} company website`;
        const resultsPerKeyword = Math.ceil((options.limit || 10) / options.keywords.length);
        
        const response = await axios.get(this.googleEndpoint, {
          params: {
            key: this.googleApiKey,
            cx: this.googleEngineId,
            q: query,
            num: Math.min(resultsPerKeyword, 10), // Google CSE returns max 10 per request
          },
        });

        if (response.data.items) {
          for (const item of response.data.items) {
            const url = new URL(item.link);
            const domain = url.hostname;

            if (!visited.has(domain)) {
              visited.add(domain);
              
              prospects.push({
                company: this.extractCompanyName(item.title),
                website: item.link,
                industry: options.industry || "Technology",
                icpScore: this.calculateICPScore(item, keyword),
              });
            }
          }
        }
      } catch (error) {
        console.error(`Keyword discovery failed for "${keyword}":`, error);
      }
    }

    return prospects.slice(0, options.limit || 50);
  }

  private calculateICPScore(item: any, keyword: string): number {
    let score = 50; // Base score

    const title = item.title || "";
    const snippet = item.snippet || "";
    const link = item.link || "";

    // Boost for keyword match
    if (title.toLowerCase().includes(keyword.toLowerCase())) score += 20;
    if (snippet.toLowerCase().includes(keyword.toLowerCase())) score += 10;

    // Boost for official domains
    if (link.includes(".com") || link.includes(".io")) score += 10;
    if (!link.includes("linkedin.com") && !link.includes("crunchbase.com")) score += 5;

    // Boost for financial/healthcare/legal (high compliance risk industries)
    const highRiskIndustries = ["bank", "finance", "insurance", "healthcare", "medical", "legal", "law"];
    if (highRiskIndustries.some((ind) => snippet.toLowerCase().includes(ind))) score += 15;

    // Boost for e-commerce (high user volume = high accessibility risk)
    if (["e-commerce", "ecommerce", "shop", "store", "retail"].some((term) => snippet.toLowerCase().includes(term)))
      score += 10;

    return Math.min(100, score);
  }

  private extractCompanyName(name: string): string {
    // Remove common suffixes
    return name
      .replace(/ - .*$/i, "")
      .replace(/ \| .*$/i, "")
      .replace(/Official Website/i, "")
      .trim();
  }

  private getMockProspects(options: KeywordDiscoveryOptions): DiscoveredProspect[] {
    const mockCompanies = [
      { company: "FinTech Solutions Inc", website: "https://fintechsolutions.com", revenue: "$10M-50M", employees: "50-200" },
      { company: "PaymentGateway Corp", website: "https://paymentgateway.io", revenue: "$50M-100M", employees: "200-500" },
      { company: "Digital Banking Co", website: "https://digitalbanking.com", revenue: "$5M-10M", employees: "25-100" },
      { company: "Crypto Trading Platform", website: "https://cryptotrader.io", revenue: "$1M-5M", employees: "10-50" },
      { company: "Investment Analytics Pro", website: "https://investmentanalytics.com", revenue: "$100M+", employees: "500+" },
    ];

    return mockCompanies.map((company, index) => ({
      ...company,
      industry: options.industry || "Financial Technology",
      icpScore: 85 - index * 5,
    }));
  }
}

export const keywordDiscoveryService = new KeywordDiscoveryService();
