# InfinitySoulAIS - Codebase Cleanup Plan

## Files/Directories to REMOVE (Obsolete)

### Documentation - Legacy System
- [ ] README_OLD.md (old behavioral risk system)
- [ ] INFINITYSOUL_MEGALOPOLIS.md
- [ ] CULTURAL_GEOMETRY_CITIES.md
- [ ] LINKEDIN_POST_CONSTRUCTION.md
- [ ] SALES_WEAPONIZATION_COMPLETE.md
- [ ] WCAG_AI_PLATFORM_PITFALLS.md
- [ ] 30DAY_EXECUTION_PLAYBOOK.md
- [ ] BUILD_STATUS.md  
- [ ] CONSOLIDATION_USAGE.md
- [ ] INTEGRATION_GUIDE.md
- [ ] MOBILE_FIRST_GUIDE.md
- [ ] PHASE_III_RISK_UNDERWRITING.md
- [ ] PHASE_V_DOCUMENTATION.md
- [ ] PHASE_VI_IMPLEMENTATION_GUIDE.md
- [ ] PRELAUNCH_IMPROVEMENTS.md
- [ ] PRE_LAUNCH_AUDIT.md
- [ ] TESTING_GUIDE.md
- [ ] TESTING_REPORT.md
- [ ] TEST_SUMMARY.md
- [ ] VERIFICATION_DEBT_PREVENTION.md

### Code - Legacy System
- [ ] backend/ (old WCAG/behavioral system - replaced by InfinitySoul-AIS/backend/)
- [ ] frontend/ (old system - replaced by InfinitySoul-AIS/frontend/)
- [ ] api/ (old routes - replaced by InfinitySoul-AIS/api/)
- [ ] services/ (old WCAG scanner, etc.)
- [ ] evidence-vault/ (replaced by InfinitySoul-AIS/vault/)
- [ ] WCAGAIPlatform/ (obsolete)
- [ ] monitoring/ (old monitoring setup)
- [ ] automation/ (old automation scripts)
- [ ] test-data/ (old test data)
- [ ] tests/ (old tests)
- [ ] research/ (old research docs)
- [ ] legal/ (if not applicable to AIS)

### Scripts & Config - Legacy
- [ ] INFINITYSOL_CONSOLIDATION.sh
- [ ] cleanup_repo.sh
- [ ] .consolidation_backup_20251202_122835/

## Files/Directories to KEEP

### Essential Configuration
- ✅ .git/
- ✅ .github/
- ✅ .gitignore
- ✅ .gitattributes
- ✅ LICENSE
- ✅ package.json (update to v1.2.0)
- ✅ package-lock.json

### Documentation - Still Relevant
- ✅ ETHICS_CHARTER.md (update for AIS)
- ✅ LEGAL.md (update for insurance)
- ✅ COMPLIANCE_SAFEGUARDS.md (update)
- ✅ DEPLOYMENT.md (if consolidated with AIS docs)
- ✅ DEPLOYMENT_READY.md (update)
- ✅ DEPLOY_CHECKLIST.md (update)
- ✅ DEPLOY_NOW.md (update)
- ✅ EXECUTIVE_SUMMARY.md (update for AIS)
- ✅ GO_TO_MARKET_STRATEGY.md (update for AIS)
- ✅ DAY1_ACTIVATION_GUIDE.md (update)
- ✅ DEPLOYMENT_GUIDE.md (consolidate with AIS/docs/DEPLOYMENT.md)

### Core System
- ✅ InfinitySoul-AIS/ (THE MAIN SYSTEM)
- ✅ README.md (NEW - focused on AIS)

### Configuration Files (Review & Update)
- ✅ .env.example (update)
- ✅ Dockerfile (update for AIS)
- ✅ docker-compose.yml (update for AIS)
- ✅ nixpacks.toml (update)
- ✅ railway.json (update)
- ✅ vercel.json (update)
- ✅ Procfile (update)

### TypeScript/Build Config (if needed)
- ⚠️ tsconfig.json (check if needed for AIS)
- ⚠️ tsconfig.build.json (check if needed)
- ⚠️ jest.config.js (check if needed)

### Database/Infrastructure (if applicable to AIS)
- ⚠️ prisma/ (check if AIS uses Prisma or just Supabase)
- ⚠️ config/ (check what's in here)
- ⚠️ types/ (check if needed)
- ⚠️ utils/ (check if needed)

## Actions Required

1. **Remove** all files/directories marked for removal
2. **Update** all kept documentation to reference InfinitySoulAIS and AI Insurance System
3. **Consolidate** duplicate deployment/config docs into InfinitySoul-AIS/docs/
4. **Review** configuration files and update for AIS only
5. **Test** that InfinitySoul-AIS/ works standalone after cleanup

## Branding Updates Needed

Replace "InfinitySoul" → "InfinitySoulAIS" in:
- [ ] All kept markdown files
- [ ] package.json files
- [ ] Configuration files
- [ ] Code comments
- [ ] Documentation references
