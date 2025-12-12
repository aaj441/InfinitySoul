/**
 * Agent #6: RelationshipAgent (Personal)
 * 
 * Manages 1,000 touchpoints via Clay API
 * Surfaces: 3 high-priority pings/day
 * Auto-drafts: birthday texts, congrats, wine sends
 */

import { v4 as uuid } from 'uuid';
import { Relationship, RelationshipPing, AgentReport } from './types';

export class RelationshipAgent {
  private relationships: Relationship[] = [];
  private pings: RelationshipPing[] = [];

  /**
   * Add relationship to tracking
   */
  async addRelationship(relationship: Relationship): Promise<void> {
    this.relationships.push(relationship);
  }

  /**
   * Scan for high-priority relationship pings
   * In production: Integrate with Clay API, Twitter API, LinkedIn API
   */
  async surfacePings(count: number = 3): Promise<RelationshipPing[]> {
    const today = new Date();
    const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Find relationships that need attention
    const needsAttention = this.relationships.filter(r => 
      r.lastContact < fourteenDaysAgo && r.priority === 'high'
    );

    const pings: RelationshipPing[] = [];

    console.log(`\n👥 Surfacing ${Math.min(count, needsAttention.length)} high-priority relationship pings...\n`);

    for (let i = 0; i < Math.min(count, needsAttention.length); i++) {
      const relationship = needsAttention[i];
      const ping = this.generatePing(relationship);
      pings.push(ping);
      this.pings.push(ping);

      console.log(`   [${i + 1}] ${relationship.name}`);
      console.log(`       Last contact: ${relationship.lastContact.toLocaleDateString()}`);
      console.log(`       Type: ${ping.type}`);
      console.log(`       Draft: "${ping.draftMessage}"`);
      console.log(`       Requires approval: ${ping.requiresApproval ? 'Yes' : 'No'}\n`);
    }

    return pings;
  }

  /**
   * Generate a relationship ping based on context
   */
  private generatePing(relationship: Relationship): RelationshipPing {
    // Simulated context detection - in production:
    // - Check Twitter/LinkedIn for life events
    // - Check calendar for birthdays
    // - Analyze relationship notes for context

    const types: RelationshipPing['type'][] = ['birthday', 'congratulations', 'checkin', 'wine_send'];
    const randomType = types[Math.floor(Math.random() * types.length)];

    const messages: Record<RelationshipPing['type'], string> = {
      birthday: `Happy birthday ${relationship.name}! Hope you have an amazing day. Let's catch up soon over coffee.`,
      congratulations: `Congrats on the recent win ${relationship.name}! Saw the news - really impressive. Would love to hear more about it.`,
      checkin: `Hey ${relationship.name}, been a while! How have things been? Would love to catch up soon.`,
      wine_send: `Thinking of you ${relationship.name}. Sending over a bottle of that Napa Cab you mentioned. Cheers!`
    };

    return {
      relationshipId: relationship.id,
      type: randomType,
      draftMessage: messages[randomType],
      requiresApproval: true
    };
  }

  /**
   * Approve and send ping
   */
  async approvePing(pingId: string): Promise<void> {
    const ping = this.pings.find(p => p.relationshipId === pingId);
    if (ping) {
      // In production: Send via SMS, email, or messaging platform
      console.log(`\n✅ Approved and sent: "${ping.draftMessage}"`);
      
      // Update last contact date
      const relationship = this.relationships.find(r => r.id === ping.relationshipId);
      if (relationship) {
        relationship.lastContact = new Date();
      }
    }
  }

  /**
   * Bulk approve multiple pings
   */
  async approvePings(pingIds: string[]): Promise<void> {
    for (const id of pingIds) {
      await this.approvePing(id);
    }
  }

  /**
   * Auto-draft message for specific event type
   */
  draftMessage(
    relationshipId: string,
    type: RelationshipPing['type'],
    context?: string
  ): string {
    const relationship = this.relationships.find(r => r.id === relationshipId);
    if (!relationship) return '';

    const templates: Record<RelationshipPing['type'], string> = {
      birthday: `Happy birthday ${relationship.name}! ${context || 'Hope you have an amazing day.'}`,
      congratulations: `Congrats ${relationship.name}! ${context || 'Really happy for you.'}`,
      checkin: `Hey ${relationship.name}, ${context || 'Been thinking about you. How are things?'}`,
      wine_send: `${relationship.name}, ${context || 'Thought you might enjoy this.'}`
    };

    return templates[type];
  }

  /**
   * Get relationships needing attention
   */
  getRelationshipsNeedingAttention(days: number = 14): Relationship[] {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.relationships.filter(r => r.lastContact < cutoffDate);
  }

  /**
   * Generate daily report
   */
  async generateReport(): Promise<AgentReport> {
    const totalRelationships = this.relationships.length;
    const activeRelationships = this.relationships.filter(r => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return r.lastContact >= thirtyDaysAgo;
    }).length;

    const needsAttention = this.getRelationshipsNeedingAttention().length;

    return {
      agentName: 'RelationshipAgent',
      timestamp: new Date(),
      status: needsAttention > 10 ? 'warning' : 'success',
      summary: `Managing ${totalRelationships} relationships. ${activeRelationships} active (30 days). ${needsAttention} need attention.`,
      metrics: {
        totalRelationships,
        activeRelationships,
        needsAttention,
        pingsGenerated: this.pings.length,
        highPriority: this.relationships.filter(r => r.priority === 'high').length,
        mediumPriority: this.relationships.filter(r => r.priority === 'medium').length,
        lowPriority: this.relationships.filter(r => r.priority === 'low').length
      }
    };
  }
}
