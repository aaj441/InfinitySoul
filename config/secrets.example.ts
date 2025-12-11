/**
 * Secrets Configuration Example
 * Copy this file to secrets.ts and fill in your actual API keys
 * 
 * WARNING: Never commit secrets.ts to version control!
 * Add it to .gitignore to prevent accidental exposure.
 */

export interface SecretsConfig {
  // Threat Intelligence API Keys (optional for enhanced scanning)
  threatIntel?: {
    // VirusTotal API key for domain reputation checks
    virusTotalApiKey?: string;
    // Shodan API key for detailed port/service information
    shodanApiKey?: string;
    // Have I Been Pwned API key for breach detection
    hibpApiKey?: string;
  };

  // External services (optional)
  external?: {
    // Slack webhook for scan notifications
    slackWebhook?: string;
    // Discord webhook for scan notifications
    discordWebhook?: string;
  };

  // Database credentials (if using external DB instead of JSONL)
  database?: {
    connectionString?: string;
  };
}

/**
 * Load secrets from environment variables
 * Falls back to empty config if vars not set (graceful degradation)
 */
export function loadSecrets(): SecretsConfig {
  return {
    threatIntel: {
      virusTotalApiKey: process.env.VIRUSTOTAL_API_KEY,
      shodanApiKey: process.env.SHODAN_API_KEY,
      hibpApiKey: process.env.HIBP_API_KEY,
    },
    external: {
      slackWebhook: process.env.SLACK_WEBHOOK_URL,
      discordWebhook: process.env.DISCORD_WEBHOOK_URL,
    },
    database: {
      connectionString: process.env.CYBER_SCAN_DB_URL,
    },
  };
}

// Export example for documentation
export const SECRETS_EXAMPLE: SecretsConfig = {
  threatIntel: {
    virusTotalApiKey: "your_virustotal_api_key_here",
    shodanApiKey: "your_shodan_api_key_here",
    hibpApiKey: "your_hibp_api_key_here",
  },
  external: {
    slackWebhook: "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
    discordWebhook: "https://discord.com/api/webhooks/YOUR/WEBHOOK/URL",
  },
  database: {
    connectionString: "postgresql://user:password@localhost:5432/cyberscans",
  },
};
