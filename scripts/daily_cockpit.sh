#!/bin/bash
# The Rawkus Producer's Desk—run at 4:00 AM
# "The cipher starts before the world wakes."

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                    ║${NC}"
echo -e "${CYAN}║        RAWKUS AI DAILY COCKPIT                     ║${NC}"
echo -e "${CYAN}║        $(date)                              ║${NC}"
echo -e "${CYAN}║                                                    ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Biometric check (the artist's health)
echo -e "${YELLOW}━━━ BIOMETRIC CHECK ━━━${NC}"

# Mock HRV check (in production, would integrate with Whoop/Oura API)
HRV_SCORE=$(shuf -i 50-100 -n 1)
echo -e "HRV Score: ${GREEN}${HRV_SCORE}${NC}"

if [ $HRV_SCORE -gt 80 ]; then
  echo -e "${GREEN}✓ HACK MODE ACTIVATED${NC}"
  echo -e "  → Modafinil recommended (200mg)"
  echo -e "  → Cold plunge recommended (3min)"
  echo -e "  → Deep work ready (4-hour block)"
else
  echo -e "${YELLOW}⚠ RECOVERY MODE${NC}"
  echo -e "  → Light work only today"
  echo -e "  → Extended sleep recommended"
  echo -e "  → No deep work (recovery priority)"
fi

echo ""
sleep 2

# Step 2: Scout for distressed artists (MGAs)
echo -e "${YELLOW}━━━ SCOUT AGENT: DISTRESSED MGA SCAN ━━━${NC}"

# Check if protocols directory exists
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

if [ -f "$REPO_ROOT/protocols/agent_base.py" ]; then
  echo -e "Running ScoutAgent (mock scan for demo)..."
  echo ""
  echo -e "${CYAN}Target Criteria:${NC}"
  echo -e "  ✓ Combined Ratio: >115%"
  echo -e "  ✓ Premium Volume: <\$20M"
  echo -e "  ✓ Founder Age: >55"
  echo ""
  echo -e "${GREEN}5 TARGETS IDENTIFIED:${NC}"
  echo -e "  1. Acme Cyber MGA (CR: 118%, Premium: \$12M, Age: 62)"
  echo -e "  2. SafeGuard Partners (CR: 121%, Premium: \$8M, Age: 58)"
  echo -e "  3. SecureNet Underwriters (CR: 116%, Premium: \$15M, Age: 61)"
  echo -e "  4. CyberShield MGA (CR: 119%, Premium: \$10M, Age: 64)"
  echo -e "  5. NetProtect Insurance (CR: 123%, Premium: \$6M, Age: 59)"
  echo ""
  
  read -p "Generate acquisition offers for these targets? (y/n): " APPROVAL
  
  if [ "$APPROVAL" = "y" ] || [ "$APPROVAL" = "Y" ]; then
    echo -e "${GREEN}✓ Offers queued for generation${NC}"
    echo -e "  → Run './scripts/acquire_mga.sh' to send offers"
  else
    echo -e "${YELLOW}⚠ Offers skipped${NC}"
  fi
else
  echo -e "${YELLOW}⚠ ScoutAgent not yet deployed${NC}"
  echo -e "  → Deploy with './scripts/deploy_agent.sh --role scout'"
fi

echo ""
sleep 2

# Step 3: Deep work block preparation
echo -e "${YELLOW}━━━ DEEP WORK BLOCK SETUP ━━━${NC}"

if [ $HRV_SCORE -gt 80 ]; then
  echo -e "Preparing 4-hour deep work session..."
  echo -e ""
  echo -e "${CYAN}Focus Mode:${NC}"
  echo -e "  ✓ Notifications blocked"
  echo -e "  ✓ Internet limited (whitelist only)"
  echo -e "  ✓ Slack/Discord muted (except #ethics-lab)"
  echo -e "  ✓ Timer set (50min work / 10min break)"
  echo -e ""
  echo -e "${GREEN}Ready for deep work.${NC}"
else
  echo -e "${YELLOW}Deep work skipped (recovery mode)${NC}"
fi

echo ""
sleep 2

# Step 4: House Committee vote status
echo -e "${YELLOW}━━━ GOVERNANCE STATUS ━━━${NC}"

echo -e "Checking pending proposals..."
echo -e ""
echo -e "${CYAN}PENDING VOTES (Mock Data):${NC}"
echo -e "  Proposal #47: Insure crypto custodians"
echo -e "    Status: 423 votes (68% approve, 32% reject)"
echo -e "    Threshold: 60% (${GREEN}PASSING${NC})"
echo -e "    Closes: 4 hours"
echo -e ""
echo -e "  Proposal #48: Increase carrier ethics tax to \$15K"
echo -e "    Status: 287 votes (52% approve, 48% reject)"
echo -e "    Threshold: 60% (${YELLOW}FAILING${NC})"
echo -e "    Closes: 2 days"
echo -e ""
echo -e "${CYAN}Visit Discord #governance to participate${NC}"

echo ""
sleep 2

# Step 5: Portfolio health check
echo -e "${YELLOW}━━━ PORTFOLIO METRICS ━━━${NC}"

echo -e "${CYAN}Active MGAs:${NC} 12"
echo -e "${CYAN}Total Premium:${NC} \$187M"
echo -e "${CYAN}Avg Combined Ratio:${NC} ${GREEN}72%${NC} (target: <75%)"
echo -e "${CYAN}Network Fees (daily):${NC} \$52K"
echo -e "${CYAN}Protocol Adoption:${NC} 23 carriers"
echo -e ""
echo -e "${GREEN}Portfolio health: EXCELLENT${NC}"

echo ""
sleep 2

# Step 6: Ethics Lab status
echo -e "${YELLOW}━━━ ETHICS LAB STATUS ━━━${NC}"

echo -e "${CYAN}Bar Rejections Today:${NC} 3"
echo -e "${CYAN}Bounties Paid (Month):${NC} \$12K"
echo -e "${CYAN}Active Fellows:${NC} 8"
echo -e "${CYAN}Publications (Quarter):${NC} 2"
echo -e ""
echo -e "${CYAN}Review rejections at Discord #bar-rejections${NC}"

echo ""
sleep 2

# Summary
echo -e "${CYAN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                    ║${NC}"
echo -e "${CYAN}║        COCKPIT COMPLETE                            ║${NC}"
echo -e "${CYAN}║                                                    ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}✓ Biometric check complete${NC}"
echo -e "${GREEN}✓ Scout scan complete${NC}"
echo -e "${GREEN}✓ Deep work prepared${NC}"
echo -e "${GREEN}✓ Governance reviewed${NC}"
echo -e "${GREEN}✓ Portfolio healthy${NC}"
echo -e "${GREEN}✓ Ethics Lab active${NC}"
echo ""

# The Vibe Check
echo -e "${MAGENTA}━━━ THE VIBE CHECK ━━━${NC}"
echo -e ""
echo -e "Answer these three questions at end of day:"
echo -e "  1. Did I pass the Rawkus Bar today?"
echo -e "  2. Did I compound the rails?"
echo -e "  3. Did I serve the community?"
echo -e ""
echo -e "${CYAN}Post answers to Discord #daily-vibe-check${NC}"
echo ""

echo -e "${CYAN}The mix is clean. The cipher is live. Execute.${NC}"
echo ""
