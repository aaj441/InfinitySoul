#!/bin/bash

# Railway Environment Variable Setup Script
# Helps you set all required environment variables for InfinitySoul

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}InfinitySoul Railway Environment Setup${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI is not installed${NC}"
    echo -e "${YELLOW}Install it with: npm i -g @railway/cli${NC}"
    exit 1
fi

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Railway${NC}"
    echo -e "${BLUE}Running: railway login${NC}\n"
    railway login
fi

echo -e "${YELLOW}This script will help you set up all required environment variables.${NC}"
echo -e "${YELLOW}Leave blank to skip optional variables.${NC}\n"

# Function to set variable if not empty
set_var() {
    local key=$1
    local value=$2
    if [ -n "$value" ]; then
        railway variables set "$key=$value"
        echo -e "${GREEN}✓ Set $key${NC}"
    else
        echo -e "${YELLOW}⊘ Skipped $key${NC}"
    fi
}

# Function to prompt for input
prompt() {
    local prompt_text=$1
    local var_name=$2
    local is_secret=$3

    if [ "$is_secret" = "true" ]; then
        read -sp "$(echo -e ${BLUE}$prompt_text: ${NC})" value
        echo ""
    else
        read -p "$(echo -e ${BLUE}$prompt_text: ${NC})" value
    fi

    eval "$var_name='$value'"
}

echo -e "${GREEN}=== Node Environment ===${NC}"
set_var "NODE_ENV" "production"
set_var "PORT" "3000"

echo -e "\n${GREEN}=== AI Services (REQUIRED) ===${NC}"
echo -e "${YELLOW}Sign up at:${NC}"
echo -e "  Anthropic: https://console.anthropic.com"
echo -e "  OpenAI: https://platform.openai.com/api-keys\n"

prompt "Anthropic API Key (sk-ant-...)" ANTHROPIC_API_KEY true
set_var "ANTHROPIC_API_KEY" "$ANTHROPIC_API_KEY"

prompt "OpenAI API Key (sk-...)" OPENAI_API_KEY true
set_var "OPENAI_API_KEY" "$OPENAI_API_KEY"

echo -e "\n${GREEN}=== Legal Data Sources ===${NC}"
echo -e "${YELLOW}Sign up at:${NC}"
echo -e "  CourtListener: https://www.courtlistener.com/api/rest/
"
echo -e "  PACER: https://pacer.uscourts.gov (optional)\n"

prompt "CourtListener API Key" COURTLISTENER_API_KEY true
set_var "COURTLISTENER_API_KEY" "$COURTLISTENER_API_KEY"

read -p "$(echo -e ${BLUE}Do you have a PACER account? (y/n): ${NC})" has_pacer
if [ "$has_pacer" = "y" ]; then
    prompt "PACER Username" PACER_USERNAME false
    set_var "PACER_USERNAME" "$PACER_USERNAME"

    prompt "PACER Password" PACER_PASSWORD true
    set_var "PACER_PASSWORD" "$PACER_PASSWORD"
fi

echo -e "\n${GREEN}=== Database ===${NC}"
echo -e "${YELLOW}If you added Postgres in Railway, use: \${{Postgres.DATABASE_URL}}${NC}"
prompt "Database URL (or leave blank to use Railway Postgres)" DATABASE_URL false
if [ -n "$DATABASE_URL" ]; then
    set_var "DATABASE_URL" "$DATABASE_URL"
else
    set_var "DATABASE_URL" "\${{Postgres.DATABASE_URL}}"
fi

echo -e "\n${GREEN}=== Redis ===${NC}"
echo -e "${YELLOW}If you added Redis in Railway, use: \${{Redis.REDIS_URL}}${NC}"
prompt "Redis URL (or leave blank to use Railway Redis)" REDIS_URL false
if [ -n "$REDIS_URL" ]; then
    set_var "REDIS_URL" "$REDIS_URL"
else
    set_var "REDIS_URL" "\${{Redis.REDIS_URL}}"
fi

echo -e "\n${GREEN}=== Security ===${NC}"
echo -e "${YELLOW}Generating secure secrets...${NC}"

JWT_SECRET=$(openssl rand -base64 32)
set_var "JWT_SECRET" "$JWT_SECRET"

SESSION_SECRET=$(openssl rand -base64 32)
set_var "SESSION_SECRET" "$SESSION_SECRET"

set_var "JWT_EXPIRES_IN" "7d"

echo -e "\n${GREEN}=== Stripe (Payment Processing) ===${NC}"
echo -e "${YELLOW}Sign up at: https://stripe.com${NC}"
echo -e "${YELLOW}Use test keys for now (sk_test_..., pk_test_...)${NC}\n"

prompt "Stripe Secret Key (sk_test_... or sk_live_...)" STRIPE_SECRET_KEY true
set_var "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY"

prompt "Stripe Publishable Key (pk_test_... or pk_live_...)" STRIPE_PUBLISHABLE_KEY false
set_var "STRIPE_PUBLISHABLE_KEY" "$STRIPE_PUBLISHABLE_KEY"

prompt "Stripe Webhook Secret (whsec_...)" STRIPE_WEBHOOK_SECRET true
set_var "STRIPE_WEBHOOK_SECRET" "$STRIPE_WEBHOOK_SECRET"

echo -e "\n${GREEN}=== Frontend Configuration ===${NC}"
prompt "Frontend URL (e.g., https://infinitysoul.vercel.app)" FRONTEND_URL false
set_var "FRONTEND_URL" "$FRONTEND_URL"
set_var "CORS_ORIGINS" "$FRONTEND_URL"

echo -e "\n${GREEN}=== Email (Optional) ===${NC}"
echo -e "${YELLOW}SendGrid free tier: 100 emails/day${NC}"
echo -e "${YELLOW}Sign up at: https://sendgrid.com${NC}\n"

read -p "$(echo -e ${BLUE}Configure email now? (y/n): ${NC})" setup_email
if [ "$setup_email" = "y" ]; then
    prompt "SendGrid API Key (SG...)" SENDGRID_API_KEY true
    set_var "SENDGRID_API_KEY" "$SENDGRID_API_KEY"

    prompt "From Email (e.g., hello@infinitysoul.com)" EMAIL_FROM false
    set_var "EMAIL_FROM" "$EMAIL_FROM"
fi

echo -e "\n${GREEN}=== Scanner Configuration ===${NC}"
set_var "SCANNER_CONCURRENCY" "5"
set_var "SCANNER_PROXY_POOL_SIZE" "20"
set_var "SCANNER_USER_AGENT_ROTATION" "true"
set_var "SCANNER_MAX_PAGES_PER_SITE" "100"
set_var "SCANNER_TIMEOUT_MS" "30000"

echo -e "\n${GREEN}=== Intel Worker Configuration ===${NC}"
set_var "PACER_POLL_INTERVAL_HOURS" "6"
set_var "PLAINTIFF_ANALYSIS_INTERVAL_HOURS" "24"
set_var "LAWSUIT_PREDICTION_BATCH_SIZE" "100"

echo -e "\n${GREEN}=== Feature Flags ===${NC}"
set_var "ENABLE_AUTO_REMEDIATION" "true"
set_var "ENABLE_LAWSUIT_PREDICTION" "true"
set_var "ENABLE_RISK_SCORING" "true"
set_var "ENABLE_PORTFOLIO_INTELLIGENCE" "true"

echo -e "\n${GREEN}=== Analytics (Optional) ===${NC}"
read -p "$(echo -e ${BLUE}Set up PostHog analytics? (y/n): ${NC})" setup_analytics
if [ "$setup_analytics" = "y" ]; then
    prompt "PostHog API Key (phc_...)" POSTHOG_API_KEY true
    set_var "POSTHOG_API_KEY" "$POSTHOG_API_KEY"
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Environment Variables Set!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${YELLOW}View all variables:${NC}"
echo -e "  railway variables\n"

echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Deploy your app: ${BLUE}railway up${NC}"
echo -e "  2. Run migrations: ${BLUE}railway run npx prisma migrate deploy${NC}"
echo -e "  3. View logs: ${BLUE}railway logs -f${NC}"
echo -e "  4. Test health: ${BLUE}curl \$(railway domain)/health${NC}\n"

echo -e "${GREEN}Happy deploying! 🚀${NC}"
