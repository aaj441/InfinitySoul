import { db } from "../db";
import { consultants, projects } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface MatchResult {
  consultantId: number;
  name: string;
  score: number;
  reasons: string[];
}

export class AIMatchingService {
  async matchConsultantsToProject(projectId: number, limit = 5): Promise<MatchResult[]> {
    // Get project details
    const projectResults = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    if (projectResults.length === 0) {
      throw new Error(`Project with id ${projectId} not found`);
    }

    const project = projectResults[0];

    // Get all available consultants
    const availableConsultants = await db
      .select()
      .from(consultants)
      .where(eq(consultants.available, true));

    // Calculate match scores
    const scores = availableConsultants.map(c => this.calculateScore(project, c));

    // Sort by score and return top matches
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private calculateScore(project: any, consultant: any): MatchResult {
    let score = 0;
    const reasons: string[] = [];

    // Expertise match (40%)
    if (consultant.expertise && Array.isArray(consultant.expertise)) {
      const categoryExpertise = consultant.expertise.some(
        (exp: string) => exp.toLowerCase().includes(project.category?.toLowerCase() || "")
      );
      if (categoryExpertise || project.category === undefined) {
        score += 40;
        reasons.push(`Expert in ${project.category || "accessibility"}`);
      } else {
        score += 20;
      }
    } else {
      score += 20;
    }

    // Budget fit (25%)
    if (project.budget && consultant.hourlyRate) {
      const estimatedHours = project.budget / consultant.hourlyRate;
      if (estimatedHours >= 40 && estimatedHours <= 200) {
        score += 25;
        reasons.push(`Perfect fit: ${Math.round(estimatedHours)} hours`);
      } else if (estimatedHours > 0) {
        score += 15;
        reasons.push(`${Math.round(estimatedHours)} hours needed`);
      }
    }

    // Performance (20%)
    const rating = parseFloat(consultant.rating || "0");
    if (rating >= 4.5) {
      score += 20;
      reasons.push(`★ ${rating} rating (${consultant.projectsCompleted} projects)`);
    } else if (rating >= 4.0) {
      score += 15;
      reasons.push(`★ ${rating} rating`);
    } else {
      score += 10;
    }

    // Availability (15%)
    if (consultant.responseTimeHours <= 24) {
      score += 15;
      reasons.push("Responds within 24 hours");
    } else if (consultant.responseTimeHours <= 48) {
      score += 10;
      reasons.push("Responds within 48 hours");
    }

    return {
      consultantId: consultant.id,
      name: consultant.name,
      score,
      reasons,
    };
  }
}

export const aiMatcher = new AIMatchingService();
