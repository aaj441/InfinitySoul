/**
 * Quest Engine
 * Generates daily quests for ADHD-friendly workflow management
 */

export interface Quest {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: "low" | "medium" | "high" | "critical";
  estimated_minutes?: number;
  category?: "lead_gen" | "outreach" | "assessment" | "renewal" | "admin";
}

export class QuestEngine {
  /**
   * Get today's quests for a user
   */
  getTodayQuests(userId: string): Quest[] {
    // Later: derive from pipeline state, CRM data, calendar
    // For now: return sensible defaults

    return [
      {
        id: "q1",
        title: "Run cyber risk assessment for Acme Healthcare",
        description:
          "Use /cyber_copilot with Acme's intake data to generate risk report and coverage recommendations.",
        completed: false,
        priority: "high",
        estimated_minutes: 15,
        category: "assessment",
      },
      {
        id: "q2",
        title: "Send pre-quote email to 3 warm leads",
        description:
          "Use healthcare outreach sequence for Dr. Smith, Wilson Dental, and Metro Clinic.",
        completed: false,
        priority: "high",
        estimated_minutes: 20,
        category: "outreach",
      },
      {
        id: "q3",
        title: "Review renewal list for upcoming 30 days",
        description:
          "Identify upsell opportunities and cross-sell P&C coverage to existing cyber clients.",
        completed: false,
        priority: "medium",
        estimated_minutes: 30,
        category: "renewal",
      },
      {
        id: "q4",
        title: "Follow up on discovery calls from last week",
        description: "Send personalized follow-ups to 5 prospects from last week's calls.",
        completed: false,
        priority: "medium",
        estimated_minutes: 25,
        category: "outreach",
      },
      {
        id: "q5",
        title: "Update carrier matrix with new appetite changes",
        description: "Coalition and Corvus updated their underwriting guidelines.",
        completed: false,
        priority: "low",
        estimated_minutes: 10,
        category: "admin",
      },
    ];
  }

  /**
   * Panic mode - return only the highest priority quest
   */
  panicMode(userId: string): Quest {
    const quests = this.getTodayQuests(userId);
    const critical = quests.find((q) => q.priority === "critical");
    const high = quests.find((q) => q.priority === "high");

    if (critical) return critical;
    if (high) return high;

    return {
      id: "q1",
      title: "Take a breath and start with lead qualification",
      description:
        "When overwhelmed, start simple: run one cyber risk assessment. Ignore everything else.",
      completed: false,
      priority: "critical",
      estimated_minutes: 15,
      category: "assessment",
    };
  }

  /**
   * Mark a quest as completed
   */
  completeQuest(userId: string, questId: string): boolean {
    // In production: update database
    // For now: return success
    return true;
  }

  /**
   * Get quests by category
   */
  getQuestsByCategory(userId: string, category: Quest["category"]): Quest[] {
    return this.getTodayQuests(userId).filter((q) => q.category === category);
  }

  /**
   * Get high priority quests only
   */
  getHighPriorityQuests(userId: string): Quest[] {
    return this.getTodayQuests(userId).filter(
      (q) => q.priority === "high" || q.priority === "critical"
    );
  }

  /**
   * Generate quest from lead data
   */
  generateLeadQuest(leadData: any): Quest {
    const companyName = leadData.company_name || "New Lead";
    const niche = leadData.niche || "generic";

    return {
      id: `lead_${Date.now()}`,
      title: `Run cyber assessment for ${companyName}`,
      description: `Complete risk assessment for ${companyName} (${niche} industry). Generate quote and outreach sequence.`,
      completed: false,
      priority: "high",
      estimated_minutes: 15,
      category: "assessment",
    };
  }
}
