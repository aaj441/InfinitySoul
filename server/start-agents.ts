// Start the agentic automation system
import { agentControl } from "./agents";

// Start all agents with custom configuration
export function startAgents() {
  // Only start agents in production or when explicitly enabled
  const enableAgents = process.env.ENABLE_AGENTS === "true" || process.env.NODE_ENV === "production";
  
  if (!enableAgents) {
    console.log("⚠️  Agents disabled (set ENABLE_AGENTS=true to activate)");
    return;
  }

  agentControl.start();
}
