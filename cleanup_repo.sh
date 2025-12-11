#!/bin/bash

# InfinitySoul Repository Cleanup Script
# This script removes redundant and outdated files to improve repository organization
# Created: December 3, 2025
# Contact: aaroninfinity8@gmail.com

set -e  # Exit on error

echo "🧹 Starting InfinitySoul Repository Cleanup..."
echo "================================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to safely delete files/folders
safe_delete() {
    if [ -e "$1" ]; then
        echo -e "${YELLOW}Deleting: $1${NC}"
        rm -rf "$1"
        echo -e "${GREEN}✓ Deleted successfully${NC}"
    else
        echo -e "${RED}⚠ Not found: $1 (skipping)${NC}"
    fi
}

echo ""
echo "Phase 1: Removing backup directories..."
echo "----------------------------------------"
safe_delete ".consolidation_backup_20251202_122835"

echo ""
echo "Phase 2: Removing empty/placeholder files..."
echo "--------------------------------------------"
safe_delete "WCAGAIPlatform"

echo ""
echo "Phase 3: Removing duplicate documentation..."
echo "-------------------------------------------"
# Keep QUICKSTART.md, delete QUICK_START.md
safe_delete "QUICK_START.md"

# Keep DEPLOYMENT.md, delete DEPLOYMENT_READY.md
safe_delete "DEPLOYMENT_READY.md"

# Keep TESTING_REPORT.md, delete TEST_SUMMARY.md
safe_delete "TEST_SUMMARY.md"

echo ""
echo "Phase 4: Removing outdated documentation..."
echo "------------------------------------------"
safe_delete "CONSOLIDATION_USAGE.md"
safe_delete "BUILD_STATUS.md"

echo ""
echo "Phase 5: Removing platform-specific deployment docs (Railway)..."
echo "---------------------------------------------------------------"
safe_delete "RAILWAY_DEPLOYMENT.md"

echo ""
echo "Phase 6: Creating organized docs structure..."
echo "--------------------------------------------"
mkdir -p docs/strategy
mkdir -p docs/phases
echo -e "${GREEN}✓ Created docs/strategy and docs/phases directories${NC}"

echo ""
echo "================================================"
echo -e "${GREEN}✅ Cleanup completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Move strategy docs to docs/strategy/:"
echo "   - 30DAY_EXECUTION_PLAYBOOK.md"
echo "   - DAY1_ACTIVATION_GUIDE.md"
echo "   - GO_TO_MARKET_STRATEGY.md"
echo ""
echo "2. Move phase docs to docs/phases/:"
echo "   - PHASE_III_RISK_UNDERWRITING.md"
echo "   - PHASE_V_DOCUMENTATION.md"
echo "   - PHASE_VI_IMPLEMENTATION_GUIDE.md"
echo ""
echo "3. Review and commit changes"
echo ""
echo "For questions or support, contact: aaroninfinity8@gmail.com"
