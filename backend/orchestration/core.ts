/**
 * InfinitySoul Core Orchestrator
 * Central orchestration for cyber insurance operations
 */

import { CyberDomainEngine } from "../cyber/domain_engine";
import { ClientProfile } from "../cyber/risk_models";
import { NicheContextSwitcher } from "../agents/niche_switcher";
import { QualificationAgent } from "../agents/qualification_agent";
import { CyberRiskAssessmentAgent } from "../agents/risk_assessment_agent";
import { DiscoveryScriptAgent } from "../agents/discovery_script_agent";
import { OutreachAgent } from "../agents/outreach_agent";

export interface InfinitySoulConfig {
  carrier_matrix_path: string;
  contexts_dir: string;
  min_revenue_threshold?: number;
}

export interface CyberCopilotInput {
  lead_data: ClientProfile & {
    company_name?: string;
    [key: string]: any;
  };
  niche?: string;
}

export interface CyberCopilotOutput {
  status: "ok" | "unqualified" | "error";
  niche?: string;
  lead?: any;
  risk_report?: any;
  coverage_map?: any;
  recommended_carriers?: any[];
  discovery_script?: string;
  outreach_sequence?: any;
  reason?: string;
  error?: string;
}

export class InfinitySoulCore {
  private config: InfinitySoulConfig;
  private nicheSwitcher: NicheContextSwitcher;
  private cyberEngine: CyberDomainEngine;
  private qualificationAgent: QualificationAgent;
  private riskAgent: CyberRiskAssessmentAgent;
  private discoveryAgent: DiscoveryScriptAgent;
  private outreachAgent: OutreachAgent;

  constructor(config: InfinitySoulConfig, llmClient?: any) {
    this.config = config;

    // Initialize niche context switcher
    this.nicheSwitcher = new NicheContextSwitcher(config.contexts_dir);

    // Initialize cyber domain engine
    this.cyberEngine = new CyberDomainEngine(config.carrier_matrix_path);

    // Initialize agents
    this.qualificationAgent = new QualificationAgent(
      config.min_revenue_threshold || 100000
    );
    this.riskAgent = new CyberRiskAssessmentAgent(this.cyberEngine);
    this.discoveryAgent = new DiscoveryScriptAgent(llmClient);
    this.outreachAgent = new OutreachAgent(llmClient);
  }

  /**
   * Set the active niche/industry mode
   */
  setMode(niche: string): { status: string; active_niche: string } {
    const context = this.nicheSwitcher.setMode(niche);
    return {
      status: "ok",
      active_niche: context.id,
    };
  }

  /**
   * Cyber Copilot - Complete lead → qualified → assessed → outreach pipeline
   */
  async cyberCopilot(input: CyberCopilotInput): Promise<CyberCopilotOutput> {
    try {
      const { lead_data, niche } = input;

      // Set niche if provided
      if (niche) {
        this.setMode(niche);
      }

      // Step 1: Qualify the lead
      const qualification = this.qualificationAgent.run(lead_data);

      if (qualification.qualification_status !== "qualified") {
        return {
          status: "unqualified",
          reason:
            qualification.disqualification_reason ||
            "Lead does not meet minimum criteria",
          lead: qualification.enriched_lead_data,
        };
      }

      const detectedNiche = qualification.niche;

      // Step 2: Run risk assessment
      const riskAssessment = this.riskAgent.run(
        qualification.enriched_lead_data,
        detectedNiche
      );

      // Step 3: Generate discovery script
      const discoveryScript = await this.discoveryAgent.generate({
        niche: detectedNiche,
        clientProfile: qualification.enriched_lead_data,
        riskReport: riskAssessment.risk_report,
      });

      // Step 4: Generate outreach sequence
      const outreachSequence = await this.outreachAgent.generate({
        niche: detectedNiche,
        clientProfile: qualification.enriched_lead_data,
        riskReport: riskAssessment.risk_report,
      });

      return {
        status: "ok",
        niche: detectedNiche,
        lead: qualification.enriched_lead_data,
        risk_report: riskAssessment.risk_report,
        coverage_map: riskAssessment.coverage_map,
        recommended_carriers: riskAssessment.recommended_carriers,
        discovery_script: discoveryScript,
        outreach_sequence: outreachSequence,
      };
    } catch (error) {
      console.error("Error in cyberCopilot:", error);
      return {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Quick risk assessment only (no qualification, no outreach)
   */
  async quickRiskAssessment(
    clientProfile: ClientProfile,
    niche: string = "generic"
  ): Promise<any> {
    this.setMode(niche);
    return this.riskAgent.run(clientProfile, niche);
  }

  /**
   * Get intake questions for a specific niche
   */
  getIntakeQuestions(niche: string = "generic"): any[] {
    this.cyberEngine.setNiche(niche);
    return this.cyberEngine.getIntakeQuestions();
  }

  /**
   * Get current niche context
   */
  getCurrentContext(): any {
    return this.nicheSwitcher.getContext();
  }
}
