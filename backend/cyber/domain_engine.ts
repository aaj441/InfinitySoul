/**
 * Cyber Domain Engine
 * Core domain logic for cyber insurance operations
 */

import { ClientProfile, computeLossProbability, suggestPremium } from "./risk_models";
import { loadCarrierAppetite, CarrierAppetite } from "./carrier_matrix";
import { BASE_QUESTIONS_BY_NICHE, Question } from "./question_bank";

export interface RiskAssessmentResult {
  loss_probability: number;
  estimated_premium: number;
  recommended_carriers: CarrierAppetite[];
  niche: string;
  client_profile: ClientProfile;
}

export class CyberDomainEngine {
  private carrierData: Record<string, CarrierAppetite[]>;
  private niche: string;

  constructor(carrierMatrixPath: string, niche: string = "generic") {
    this.carrierData = loadCarrierAppetite(carrierMatrixPath);
    this.niche = niche;
  }

  /**
   * Set the active niche/industry context
   */
  setNiche(niche: string): void {
    this.niche = niche;
  }

  /**
   * Get intake questions for the current niche
   */
  getIntakeQuestions(): Question[] {
    return (
      BASE_QUESTIONS_BY_NICHE[this.niche] ||
      BASE_QUESTIONS_BY_NICHE["generic"]
    );
  }

  /**
   * Assess cyber risk for a client
   */
  assessRisk(clientProfile: ClientProfile): RiskAssessmentResult {
    const lossProbability = computeLossProbability(clientProfile);
    const estimatedPremium = suggestPremium(clientProfile, lossProbability);
    const carriers = this.matchCarriers(clientProfile, lossProbability);

    return {
      loss_probability: lossProbability,
      estimated_premium: estimatedPremium,
      recommended_carriers: carriers,
      niche: this.niche,
      client_profile: clientProfile,
    };
  }

  /**
   * Match carriers based on client profile and risk
   */
  private matchCarriers(
    clientProfile: ClientProfile,
    lossProbability: number
  ): CarrierAppetite[] {
    const industry = clientProfile.industry || "generic";
    const revenue = clientProfile.revenue || 0;

    // Get carriers for this industry or fall back to generic
    let appetite =
      this.carrierData[industry.toLowerCase()] ||
      this.carrierData["generic"] ||
      [];

    // Filter by revenue requirements
    appetite = appetite.filter(
      (carrier) =>
        revenue >= carrier.min_revenue && revenue <= carrier.max_revenue
    );

    // Sort by weight (higher is better)
    return appetite.sort((a, b) => (b.weight || 0) - (a.weight || 0));
  }
}
