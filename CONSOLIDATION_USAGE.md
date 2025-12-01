# INFINITYSOL_CONSOLIDATION.sh - Usage Guide

## Overview

Production-grade bash script for consolidating features from wcag-ai-platform into InfinitySol.

**Script Size:** 1,793 lines
**Version:** 1.0.0
**Author:** InfinitySol Team

---

## Features

✅ **Idempotent** - Safe to run multiple times
✅ **Color-coded output** - Easy to read progress
✅ **Automatic rollback** - Reverts on errors
✅ **Comprehensive verification** - 12+ validation checks
✅ **Detailed logging** - Full trace in `consolidation.log`
✅ **Git backup** - Creates backup branch before changes
✅ **TypeScript conversion** - Auto-converts JS → TS files

---

## Pre-requisites

### Required Software
- **Node.js** v18+
- **npm** v9+
- **git** v2.0+
- **PostgreSQL** (for database migrations)

### Directory Structure
```
/home/user/
├── InfinitySol/              # This repository
│   └── INFINITYSOL_CONSOLIDATION.sh
└── wcag-ai-platform/         # Source repository (optional)
    ├── consultant-site/
    ├── evidence-vault/
    └── automation/
```

### Git Status
- Working directory must be **clean** (no uncommitted changes)
- Minimum **500MB** free disk space

---

## Quick Start

### 1. Make Script Executable
```bash
chmod +x INFINITYSOL_CONSOLIDATION.sh
```

### 2. Run Script
```bash
./INFINITYSOL_CONSOLIDATION.sh
```

### 3. Follow Post-Consolidation Steps
```bash
# Install new dependencies
npm install @prisma/client @aws-sdk/client-s3 nodemailer handlebars
npm install -D prisma @types/nodemailer

# Run database migrations
npx prisma migrate dev --name consolidation_init

# Test TypeScript compilation
npx tsc --noEmit

# Verify new routes
npm run dev
```

---

## What The Script Does

### PHASE 1: Extract from wcag-ai-platform
- Creates directory structure: `consultant-site/`, `evidence-vault/`, `automation/`
- Copies files selectively (pages, components, legal, automation scripts)
- Converts JavaScript files to TypeScript
- Creates `.gitkeep` files for evidence vault structure

### PHASE 2: Update InfinitySol Structure
- Creates 3 new route files: `consultant.ts`, `evidence.ts`, `automation.ts`
- Updates `backend/server.ts` with route imports
- Creates comprehensive Prisma schema with 5 new models
- Updates `.env.example` with new environment variables

### PHASE 3: Comprehensive Verification
Runs 12+ critical checks:
1. ✅ TypeScript compilation
2. ✅ Prisma schema validation
3. ✅ ESLint auto-fix
4. ✅ Import resolution
5. ✅ Git status validation
6. ✅ Route type checking
7. ✅ Package dependencies
8. ✅ Security vulnerabilities
9. ✅ Environment variables
10. ✅ Console.log detection
11. ✅ Documentation completeness

### PHASE 4: Generate Reports
- `CONSOLIDATION_REPORT.md` - Full consolidation details
- `MIGRATION_FROM_WCAG_AI_PLATFORM.md` - Migration guide with rollback instructions
- Updates `README.md` with new features

---

## Output Files

After running, you'll have:

```
InfinitySol/
├── INFINITYSOL_CONSOLIDATION.sh
├── CONSOLIDATION_REPORT.md          ← NEW: Full report
├── MIGRATION_FROM_WCAG_AI_PLATFORM.md ← NEW: Migration guide
├── consolidation.log                 ← NEW: Detailed log
├── .consolidation_backup_YYYYMMDD_HHMMSS/ ← Backup directory
│   ├── .backup_metadata
│   └── [backed up files]
├── consultant-site/                  ← NEW
│   ├── pages/
│   ├── components/
│   └── legal/
├── evidence-vault/                   ← NEW
│   ├── attestations/
│   ├── reports/
│   └── scans/
├── automation/                       ← NEW
│   ├── ai-email-generator.ts
│   ├── vpat-generator.ts
│   └── insurance_lead_import.py
├── backend/routes/                   ← NEW
│   ├── consultant.ts
│   ├── evidence.ts
│   └── automation.ts
└── prisma/                           ← NEW
    └── schema.prisma
```

---

## Rollback Instructions

If something goes wrong:

### Option 1: Automatic Rollback (if script fails)
The script auto-rolls back on errors.

### Option 2: Manual Git Rollback
```bash
# Find backup branch
git branch -a | grep backup/pre-consolidation

# Checkout backup branch
git checkout backup/pre-consolidation-YYYYMMDD-HHMMSS

# Verify you're back to original state
git status
```

### Option 3: Restore from Backup Directory
```bash
# Find backup directory
ls -la | grep consolidation_backup

# Restore files
BACKUP_DIR=.consolidation_backup_YYYYMMDD_HHMMSS
cp $BACKUP_DIR/backend/server.ts backend/server.ts
cp $BACKUP_DIR/.env.example .env.example
cp $BACKUP_DIR/package.json package.json
cp $BACKUP_DIR/README.md README.md

# Remove new directories
rm -rf consultant-site evidence-vault automation/ai-email-generator.ts
rm -rf backend/routes prisma
```

---

## Troubleshooting

### Error: "Git working directory is not clean"
**Solution:**
```bash
git status
git add .
git commit -m "Save work before consolidation"
# OR
git stash
```

### Error: "No write permissions"
**Solution:**
```bash
ls -la INFINITYSOL_CONSOLIDATION.sh
chmod +x INFINITYSOL_CONSOLIDATION.sh
```

### Error: "Node.js version too old"
**Solution:**
```bash
nvm install 18
nvm use 18
node -v  # Should be v18.x or higher
```

### Error: "wcag-ai-platform not found"
**This is OK!** The script will create placeholder files.

To integrate real files later:
```bash
cd /home/user
git clone https://github.com/aaj441/wcag-ai-platform.git
cd InfinitySol
./INFINITYSOL_CONSOLIDATION.sh
```

### Error: "TypeScript compilation failed"
**Solution:**
```bash
npm install --save-dev typescript @types/node @types/express
npx tsc --noEmit
```

### Error: "Prisma validation failed"
**Solution:**
```bash
npx prisma format
npx prisma validate
```

---

## Environment Variables

After consolidation, add these to `.env`:

```bash
# Database (REQUIRED)
DATABASE_URL=postgresql://user:password@localhost:5432/infinitysol

# Consultant Site
CONSULTANT_SITE_ENABLED=true
CONSULTANT_BASE_DOMAIN=infinitysol.com

# Evidence Vault (S3)
S3_BUCKET_NAME=infinitysol-evidence
S3_REGION=us-east-1
S3_ACCESS_KEY=your_access_key_here
S3_SECRET_KEY=your_secret_key_here

# Automation
REDIS_URL=redis://localhost:6379
EMAIL_QUEUE_ENABLED=true
VPAT_GENERATION_ENABLED=true

# Insurance APIs (Optional)
INSURANCE_API_KEY_1=...
INSURANCE_API_KEY_2=...
```

---

## New API Endpoints

After consolidation, these endpoints are available:

### Consultant Site
- `POST /api/consultant/create` - Create consultant site
- `GET /api/consultant/:subdomain` - Get consultant site

### Evidence Vault
- `POST /api/evidence/upload` - Upload evidence file
- `GET /api/evidence/:customerId` - Get customer evidence files

### Automation
- `POST /api/automation/email` - Queue email generation job
- `POST /api/automation/vpat` - Queue VPAT generation job
- `GET /api/automation/job/:jobId` - Check job status

---

## Testing

### Test Consultant Site Creation
```bash
curl -X POST http://localhost:8000/api/consultant/create \
  -H "Content-Type: application/json" \
  -d '{
    "consultantEmail": "test@example.com",
    "brandName": "Test Consulting",
    "subdomain": "testco"
  }'
```

### Test Evidence Upload
```bash
curl -X POST http://localhost:8000/api/evidence/upload \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-123",
    "fileType": "scan_report",
    "fileName": "scan-2024-12-01.pdf"
  }'
```

### Test Automation Job
```bash
curl -X POST http://localhost:8000/api/automation/email \
  -H "Content-Type: application/json" \
  -d '{
    "leadEmail": "lead@example.com",
    "scanResults": {"violations": 10}
  }'
```

---

## Script Internals

### Color Codes
- 🟢 **Green** = Success
- 🔴 **Red** = Error (critical)
- 🟡 **Yellow** = Warning (non-critical)
- 🔵 **Blue** = Info
- 🟣 **Magenta** = Section headers
- 🔷 **Cyan** = Step markers

### Error Handling
- Traps errors with `trap 'error_handler' ERR`
- Automatic rollback on any failure
- Preserves rollback actions in stack
- Cleans up temp files on exit

### Logging
- All output goes to both console and `consolidation.log`
- Timestamps on every log entry
- Structured by phase and step

---

## Backup Metadata

The script creates `.backup_metadata` containing:
```bash
BACKUP_TIMESTAMP=2025-12-01 12:00:00
ORIGINAL_COMMIT=abc123def456
ORIGINAL_BRANCH=claude/create-consolidation-script-01XfM7cv25AubJFDpuRKpdGV
SCRIPT_VERSION=1.0.0
BACKUP_BRANCH=backup/pre-consolidation-20251201-120000
```

Use this to precisely rollback if needed.

---

## Success Criteria

Script succeeds ONLY if ALL these pass:
✅ All files copied successfully
✅ TypeScript compiles without errors
✅ Prisma schema validates
✅ No ESLint critical errors
✅ Git status shows only expected changes
✅ All new routes are properly typed
✅ All imports resolve

If any fail → automatic rollback

---

## Support

- **Issues:** Check `consolidation.log` for detailed errors
- **Documentation:** See `CONSOLIDATION_REPORT.md`
- **Rollback:** See "Rollback Instructions" above
- **Questions:** Review `MIGRATION_FROM_WCAG_AI_PLATFORM.md`

---

**Script Created:** 2025-12-01
**Last Updated:** 2025-12-01
**Maintainer:** InfinitySol Team
