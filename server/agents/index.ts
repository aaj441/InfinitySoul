import { plannerAgent } from "./planner-agent";
import { executorAgent } from "./executor-agent";
import { outreachAgent } from "./outreach-agent";
import { monitorAgent } from "./monitor-agent";

export interface AgentControlConfig {
  enablePlanner?: boolean;
  enableExecutor?: boolean;
  enableOutreach?: boolean;
  enableMonitor?: boolean;
  plannerIntervalMinutes?: number;
  executorIntervalMinutes?: number;
  outreachIntervalMinutes?: number;
  monitorIntervalMinutes?: number;
}

export class AgentControl {
  private config: Required<AgentControlConfig>;

  constructor(config?: AgentControlConfig) {
    this.config = {
      enablePlanner: true,
      enableExecutor: true,
      enableOutreach: false, // Disabled by default to avoid spam
      enableMonitor: true,
      plannerIntervalMinutes: 60, // Every hour
      executorIntervalMinutes: 15, // Every 15 minutes
      outreachIntervalMinutes: 120, // Every 2 hours
      monitorIntervalMinutes: 30, // Every 30 minutes
      ...config,
    };
  }

  start() {
    console.log("=".repeat(60));
    console.log("🤖 AGENTIC AUTOMATION SYSTEM STARTING");
    console.log("=".repeat(60));

    if (this.config.enablePlanner) {
      plannerAgent.start(this.config.plannerIntervalMinutes);
      console.log(
        `✅ Planner Agent: Active (${this.config.plannerIntervalMinutes} min interval)`
      );
    }

    if (this.config.enableExecutor) {
      executorAgent.start(this.config.executorIntervalMinutes);
      console.log(
        `✅ Executor Agent: Active (${this.config.executorIntervalMinutes} min interval)`
      );
    }

    if (this.config.enableOutreach) {
      outreachAgent.start(this.config.outreachIntervalMinutes);
      console.log(
        `✅ Outreach Agent: Active (${this.config.outreachIntervalMinutes} min interval)`
      );
    } else {
      console.log("⚠️  Outreach Agent: Disabled (enable in config to activate)");
    }

    if (this.config.enableMonitor) {
      monitorAgent.start(this.config.monitorIntervalMinutes);
      console.log(
        `✅ Monitor Agent: Active (${this.config.monitorIntervalMinutes} min interval)`
      );
    }

    console.log("=".repeat(60));
    console.log("🚀 All agents initialized and running autonomously");
    console.log("=".repeat(60));
  }

  stop() {
    console.log("Stopping all agents...");
    // In a real implementation, we'd clear intervals here
  }
}

// Export singleton
export const agentControl = new AgentControl();

// Export individual agents for direct access
export { plannerAgent, executorAgent, outreachAgent, monitorAgent };
