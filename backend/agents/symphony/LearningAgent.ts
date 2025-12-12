/**
 * Agent #7: LearningAgent (Personal)
 * 
 * Ingests 10 papers/day (arXiv, PubMed, niche forums)
 * Builds your knowledge graph
 * Sends 3-sentence summary + action items
 */

import { v4 as uuid } from 'uuid';
import { Paper, AgentReport } from './types';

export class LearningAgent {
  private papers: Paper[] = [];
  private knowledgeGraph: Map<string, string[]> = new Map(); // topic -> related concepts

  /**
   * Ingest papers from various sources
   * In production: Integrate with arXiv API, PubMed API, RSS feeds
   */
  async ingest(count: number = 10): Promise<Paper[]> {
    // Simulated ingestion - in production:
    // - Query arXiv for recent ML/AI papers
    // - Query PubMed for behavioral science papers
    // - Scrape niche forums (HN, Reddit, specialized communities)
    // - Vectorize and link to existing knowledge graph

    const mockPapers: Paper[] = [
      {
        id: uuid(),
        title: 'Adversarial Machine Learning in Insurance Underwriting',
        source: 'arxiv',
        summary: 'Study shows ML models vulnerable to adversarial examples. Attackers can manipulate inputs to get lower premiums. Recommends ensemble methods + human oversight for high-value policies.',
        actionItems: [
          'Implement adversarial training for underwriting models',
          'Add human review for policies >$100K premium',
          'Monitor for input anomalies in real-time'
        ],
        ingestedAt: new Date()
      },
      {
        id: uuid(),
        title: 'Music Preference and Risk-Taking Behavior: A Meta-Analysis',
        source: 'pubmed',
        summary: 'Meta-analysis of 50 studies shows moderate correlation between musical complexity preference and risk tolerance. Classical/jazz listeners show lower actuarial risk. Heavy metal shows mixed results - aggression vs. stress relief.',
        actionItems: [
          'Incorporate musical complexity into behavioral risk models',
          'Validate findings against InfinitySoul dataset',
          'Test genre-agnostic features (tempo variability, harmonic complexity)'
        ],
        ingestedAt: new Date()
      },
      {
        id: uuid(),
        title: 'Behavioral Economics of Cyber Insurance Adoption',
        source: 'arxiv',
        summary: 'SMBs underestimate cyber risk by 10-100x. Framing effects matter - "peace of mind" messaging increases adoption 3x vs. "risk mitigation". Price anchoring at $100/month optimal.',
        actionItems: [
          'Reframe marketing copy around peace of mind',
          'Test $99/month anchor pricing for cyber policies',
          'Create calculator showing "cost of NOT having insurance"'
        ],
        ingestedAt: new Date()
      }
    ];

    this.papers.push(...mockPapers);

    console.log(`\n📚 Ingested ${mockPapers.length} papers:\n`);
    mockPapers.forEach((paper, i) => {
      console.log(`   [${i + 1}] ${paper.title} (${paper.source})`);
      console.log(`       Summary: ${paper.summary}`);
      console.log(`       Action items: ${paper.actionItems.length}\n`);
    });

    // Update knowledge graph
    this.updateKnowledgeGraph(mockPapers);

    return mockPapers;
  }

  /**
   * Update knowledge graph with new papers
   */
  private updateKnowledgeGraph(papers: Paper[]): void {
    for (const paper of papers) {
      // Extract topics from title and summary
      const topics = this.extractTopics(paper.title + ' ' + paper.summary);
      
      for (const topic of topics) {
        if (!this.knowledgeGraph.has(topic)) {
          this.knowledgeGraph.set(topic, []);
        }
        this.knowledgeGraph.get(topic)!.push(paper.id);
      }
    }
  }

  /**
   * Extract topics from text (simple keyword extraction)
   */
  private extractTopics(text: string): string[] {
    const keywords = [
      'insurance', 'underwriting', 'risk', 'cyber', 'behavioral',
      'music', 'AI', 'ML', 'actuarial', 'pricing', 'claims',
      'adversarial', 'fraud', 'wellness', 'biometric'
    ];

    const lowerText = text.toLowerCase();
    return keywords.filter(keyword => lowerText.includes(keyword));
  }

  /**
   * Get papers by topic
   */
  getPapersByTopic(topic: string): Paper[] {
    const paperIds = this.knowledgeGraph.get(topic.toLowerCase()) || [];
    return this.papers.filter(p => paperIds.includes(p.id));
  }

  /**
   * Get contradictions in knowledge base
   */
  getContradictions(): string[] {
    // Simplified contradiction detection
    // In production: Use LLM to analyze semantic conflicts
    const contradictions: string[] = [];

    const riskPapers = this.getPapersByTopic('risk');
    if (riskPapers.length >= 2) {
      contradictions.push('Multiple papers on risk assessment show differing methodologies - review needed');
    }

    return contradictions;
  }

  /**
   * Get 3-sentence daily summary
   */
  getDailySummary(): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayPapers = this.papers.filter(p => p.ingestedAt >= today);
    
    if (todayPapers.length === 0) {
      return 'No papers ingested today.';
    }

    const topPaper = todayPapers[0]; // Most relevant
    const keyTopics = [...this.knowledgeGraph.keys()].slice(0, 3).join(', ');
    const actionableCount = todayPapers.reduce((sum, p) => sum + p.actionItems.length, 0);

    return `Ingested ${todayPapers.length} papers today covering ${keyTopics}. Key insight: ${topPaper.summary.split('.')[0]}. ${actionableCount} action items surfaced.`;
  }

  /**
   * Get all action items from recent papers
   */
  getRecentActionItems(days: number = 1): string[] {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentPapers = this.papers.filter(p => p.ingestedAt >= cutoffDate);
    
    return recentPapers.flatMap(p => p.actionItems);
  }

  /**
   * Generate daily report
   */
  async generateReport(): Promise<AgentReport> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayPapers = this.papers.filter(p => p.ingestedAt >= today);
    const actionItems = this.getRecentActionItems(1);

    return {
      agentName: 'LearningAgent',
      timestamp: new Date(),
      status: todayPapers.length >= 10 ? 'success' : 'warning',
      summary: this.getDailySummary(),
      metrics: {
        papersIngestedToday: todayPapers.length,
        totalPapers: this.papers.length,
        actionItemsGenerated: actionItems.length,
        knowledgeGraphSize: this.knowledgeGraph.size,
        arxivPapers: todayPapers.filter(p => p.source === 'arxiv').length,
        pubmedPapers: todayPapers.filter(p => p.source === 'pubmed').length,
        forumPapers: todayPapers.filter(p => p.source === 'forum').length
      }
    };
  }
}
