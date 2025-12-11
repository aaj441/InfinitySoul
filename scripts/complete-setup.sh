#!/bin/bash
set -e

echo "🚀 InfinitySoul Complete Setup & Deployment"
echo "==========================================\n"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    echo "Install it: https://cli.github.com/"
    exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "${YELLOW}⚠️  Vercel CLI not installed. Installing...${NC}"
    npm install -g vercel
fi

echo "${GREEN}✓ Prerequisites check passed${NC}\n"

# Step 1: Get Vercel token
echo "${YELLOW}Step 1: Vercel Token${NC}"
echo "Go to: https://vercel.com/account/tokens"
echo "Create token with:"
echo "  - Name: GitHub-InfinitySoul"
echo "  - Scope: Full Account"
echo "  - Expiration: No Expiration"
read -sp "Paste your Vercel token: " VERCEL_TOKEN
echo "\n${GREEN}✓ Token received${NC}\n"

# Step 2: Link Vercel project
echo "${YELLOW}Step 2: Linking Vercel Project${NC}"
cd InfinitySoul-AIS/frontend

if [ ! -d ".vercel" ]; then
    echo "Linking to Vercel..."
    vercel link --token="$VERCEL_TOKEN" --yes
fi

# Get project info
VERCEL_ORG_ID=$(cat .vercel/project.json | grep -o '"orgId":"[^"]*' | cut -d'"' -f4)
VERCEL_PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*' | cut -d'"' -f4)

echo "${GREEN}✓ Vercel project linked${NC}"
echo "  Org ID: $VERCEL_ORG_ID"
echo "  Project ID: $VERCEL_PROJECT_ID\n"

cd ../..

# Step 3: Set GitHub secrets
echo "${YELLOW}Step 3: Setting GitHub Secrets${NC}"

gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN"
gh secret set VERCEL_ORG_ID --body "$VERCEL_ORG_ID"
gh secret set VERCEL_PROJECT_ID --body "$VERCEL_PROJECT_ID"
gh secret set NEXT_PUBLIC_API_URL --body "http://localhost:3001"

echo "${GREEN}✓ All secrets configured${NC}\n"

# Step 4: Merge and deploy PRs
echo "${YELLOW}Step 4: Merging PRs${NC}"
echo "Which PRs do you want to merge?"
echo "  1) Just PR #19 (recommended to start)"
echo "  2) All 9 PRs (19-27)"
read -p "Choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    PRS=(19)
    echo "\n${YELLOW}Merging PR #19...${NC}"
else
    PRS=(27 26 25 24 23 22 21 20 19)
    echo "\n${YELLOW}Merging all 9 PRs...${NC}"
fi

for pr in "${PRS[@]}"; do
    echo "\n🤖 Processing PR #$pr..."
    
    # Run workflow
    gh workflow run auto-merge-deploy.yml \
        -f pr_number=$pr \
        -f strategy=ours
    
    echo "${GREEN}✓ Workflow started for PR #$pr${NC}"
    
    # Wait for workflow to complete
    echo "⏳ Waiting 90 seconds for workflow..."
    sleep 90
    
    # Check if PR was merged
    PR_STATE=$(gh pr view $pr --json state --jq '.state')
    
    if [ "$PR_STATE" = "MERGED" ]; then
        echo "${GREEN}✅ PR #$pr merged successfully!${NC}"
    else
        echo "${YELLOW}⚠️  PR #$pr status: $PR_STATE${NC}"
        echo "Check: https://github.com/aaj441/InfinitySoul/actions"
    fi
done

echo "\n${GREEN}===========================================${NC}"
echo "${GREEN}🎉 Setup Complete!${NC}"
echo "${GREEN}===========================================${NC}\n"

echo "📊 Summary:"
echo "  ✅ Vercel token configured"
echo "  ✅ GitHub secrets set"
echo "  ✅ PRs merged: ${#PRS[@]}"
echo "\n🔗 Next steps:"
echo "  1. Check deployment: https://vercel.com/dashboard"
echo "  2. View Actions: https://github.com/aaj441/InfinitySoul/actions"
echo "  3. See merged PRs: https://github.com/aaj441/InfinitySoul/pulls?q=is%3Apr+is%3Aclosed"
echo "\n${YELLOW}Kluge would approve: 'The automation is the monopoly.'${NC}\n"
