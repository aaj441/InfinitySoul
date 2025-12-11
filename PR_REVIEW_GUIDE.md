# PR Review Automation Guide - InfinitySoul

**Comprehensive guide for using Copilot to review all remaining PRs efficiently**

---

## Overview

You have **7 remaining open PRs** that need comprehensive nitpicking reviews similar to PR #21. This guide provides templates and automation to review them efficiently.

---

## Quick Start (3 Options)

### Option A: Use Quick Template (⚡ Fastest - 2 min/PR)

1. Open PR in GitHub
2. Copy [PR_REVIEW_TEMPLATE_QUICK.md](./PR_REVIEW_TEMPLATE_QUICK.md)
3. Review "Files changed" tab
4. Check boxes and fill in `[BRACKETS]` with findings
5. Post as comment
6. **Time:** ~2 minutes per PR × 7 = 14 minutes total

### Option B: Use Full Template (📋 Most Thorough - 10 min/PR)

1. Open PR in GitHub
2. Copy [PR_REVIEW_TEMPLATE.md](./PR_REVIEW_TEMPLATE.md)
3. Review code file-by-file
4. Complete all sections with specific findings
5. Post comprehensive review
6. **Time:** ~10 minutes per PR × 7 = 70 minutes total

### Option C: Automated Batch Review (🤖 Most Efficient)

Use the provided script to generate reviews for all PRs:

```bash
# Review all PRs at once
npm run review:all-prs

# Or review specific PRs
npm run review:prs -- --prs=19,25,27
```

See **Automation Script** section below.

---

## Templates Available

### 1. PR_REVIEW_TEMPLATE.md (Full Version)

**Use for:** In-depth reviews of critical PRs (19, 25, 27)

**Includes:**
- 🔴 Critical issues (security, data safety)
- 🟠 Must-fix issues (type safety, error handling)
- 🟡 Should-fix issues (logging, testing)
- 🟢 Nice-to-have improvements
- ⚖️ Ethics & governance checks
- Detailed checklist with examples
- Tech debt estimation

**Time:** 10-15 minutes per PR

### 2. PR_REVIEW_TEMPLATE_QUICK.md (Quick Version)

**Use for:** Fast reviews of all remaining PRs

**Includes:**
- Condensed checklist
- Key findings summary
- Quick recommendations
- Links to full template

**Time:** 2-5 minutes per PR

---

## Recommended Workflow

### For All 7 Remaining PRs

**Recommended Strategy:** Option A (Quick Template) for efficiency

1. **Priority PRs (19, 25, 27):** Use **Full Template** (Option B)
   - These are critical infrastructure PRs
   - Deserve comprehensive review
   - Time: 30 minutes total

2. **Standard PRs (20, 22, 23, 24, 26):** Use **Quick Template** (Option A)
   - Less critical features
   - Fast turnaround needed
   - Time: 10 minutes total

3. **Total Time:** ~40 minutes for all 7 PRs

---

## Step-by-Step: Quick Template Review

### Step 1: Open PR and Copy Template

```bash
# Open PR in browser
open https://github.com/aaj441/InfinitySoul/pull/19

# Copy quick template to clipboard
cat PR_REVIEW_TEMPLATE_QUICK.md | pbcopy  # macOS
cat PR_REVIEW_TEMPLATE_QUICK.md | xclip   # Linux
```

### Step 2: Review Files Changed Tab

Navigate to "Files changed" and look for:

- 🔴 **Security issues:** Hard-coded secrets, injection risks
- 🟠 **Type issues:** `any` types, missing return types
- 🟡 **Quality issues:** No tests, missing logging
- 🟢 **Polish issues:** Poor naming, duplication

### Step 3: Fill in Template

Replace `[BRACKETS]` with actual findings:

```markdown
**Files Changed:** 12
**Lines Changed:** +847 -203
**Issues Found:** 2/5/8/12
**Tech Debt:** ~25% of changes need fixes (~2 days)
**Recommendation:** REQUEST CHANGES

### Critical Issues
1. Hard-coded API key - File: `backend/api/scanner.ts:45`
2. No input validation - File: `backend/routes/audit.ts:89`
```

### Step 4: Post Review

1. Go to "Files changed" tab
2. Click "Review changes" button
3. Paste your filled template
4. Select "Request changes" or "Approve"
5. Click "Submit review"

---

## Step-by-Step: Full Template Review

### Step 1: Clone Branch Locally

```bash
# Fetch PR branch
gh pr checkout 19

# Or manually
git fetch origin pull/19/head:pr-19
git checkout pr-19
```

### Step 2: Run Quality Checks

```bash
# Type check
npx tsc --noEmit

# Lint
npx eslint backend/**/*.ts --format compact

# Test
npm test

# Security audit
npm audit --audit-level=moderate
```

### Step 3: Review with AI Assistance

Use VS Code AI prompts for deeper analysis:

```typescript
// In VS Code, open a file and use Copilot Chat:
// @workspace Review this file using the CODE_AUDIT_CHECKLIST.md standards

// Or use the prompts from VS_CODE_AI_PROMPTS.md
```

### Step 4: Fill Template Section-by-Section

Go through each section of PR_REVIEW_TEMPLATE.md:

1. **Critical Issues:** Check for security, data safety
2. **Must-Fix Issues:** Type safety, error handling
3. **Should-Fix Issues:** Logging, testing, validation
4. **Nice-to-Have:** Documentation, organization
5. **Ethics:** If handling behavioral/student data

### Step 5: Calculate Tech Debt

Estimate changes needed:

```bash
# Count total lines in PR
git diff main --stat

# Example output:
# 12 files changed, 847 insertions(+), 203 deletions(-)

# If ~200 lines need fixes:
# 200 / 847 = ~24% tech debt
# Estimate ~2 days to fix
```

### Step 6: Post Comprehensive Review

Submit with detailed findings and recommendations.

---

## Automation Script

### Installation

Create `scripts/review-prs.ts`:

```typescript
#!/usr/bin/env ts-node
/**
 * Automated PR Review Generator
 * 
 * Generates review templates pre-filled with basic code analysis
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface PRReviewData {
  prNumber: number;
  filesChanged: number;
  linesAdded: number;
  linesRemoved: number;
  issues: {
    critical: string[];
    mustFix: string[];
    shouldFix: string[];
    niceToHave: string[];
  };
}

async function analyzePR(prNumber: number): Promise<PRReviewData> {
  // Checkout PR
  execSync(`gh pr checkout ${prNumber}`, { stdio: 'inherit' });
  
  // Get diff stats
  const diffStat = execSync('git diff main --shortstat').toString();
  const [filesChanged, insertions, deletions] = parseDiffStat(diffStat);
  
  // Run type check
  const typeErrors = runTypeCheck();
  
  // Run linter
  const lintErrors = runLinter();
  
  // Run security audit
  const securityIssues = runSecurityAudit();
  
  // Categorize issues
  const issues = categorizeIssues(typeErrors, lintErrors, securityIssues);
  
  return {
    prNumber,
    filesChanged,
    linesAdded: insertions,
    linesRemoved: deletions,
    issues
  };
}

function parseDiffStat(stat: string): [number, number, number] {
  // Parse: "12 files changed, 847 insertions(+), 203 deletions(-)"
  const fileMatch = stat.match(/(\d+) files? changed/);
  const insertMatch = stat.match(/(\d+) insertions?\(\+\)/);
  const deleteMatch = stat.match(/(\d+) deletions?\(-\)/);
  
  return [
    fileMatch ? parseInt(fileMatch[1]) : 0,
    insertMatch ? parseInt(insertMatch[1]) : 0,
    deleteMatch ? parseInt(deleteMatch[1]) : 0
  ];
}

function runTypeCheck(): string[] {
  try {
    execSync('npx tsc --noEmit 2>&1', { encoding: 'utf-8' });
    return [];
  } catch (error: any) {
    return error.stdout.split('\n').filter((line: string) => line.includes('error TS'));
  }
}

function runLinter(): string[] {
  try {
    const output = execSync('npx eslint backend/**/*.ts --format compact 2>&1', { 
      encoding: 'utf-8' 
    });
    return output.split('\n').filter(line => line.includes('error') || line.includes('warning'));
  } catch (error: any) {
    return error.stdout.split('\n').filter((line: string) => 
      line.includes('error') || line.includes('warning')
    );
  }
}

function runSecurityAudit(): string[] {
  try {
    const output = execSync('npm audit --json', { encoding: 'utf-8' });
    const audit = JSON.parse(output);
    return audit.vulnerabilities ? Object.keys(audit.vulnerabilities) : [];
  } catch {
    return [];
  }
}

function categorizeIssues(
  typeErrors: string[], 
  lintErrors: string[], 
  securityIssues: string[]
): PRReviewData['issues'] {
  return {
    critical: securityIssues,
    mustFix: typeErrors,
    shouldFix: lintErrors.filter(e => e.includes('warning')),
    niceToHave: lintErrors.filter(e => !e.includes('error'))
  };
}

function generateReview(data: PRReviewData): string {
  const template = fs.readFileSync(
    path.join(__dirname, '../PR_REVIEW_TEMPLATE_QUICK.md'),
    'utf-8'
  );
  
  const techDebt = Math.round(
    ((data.issues.critical.length + data.issues.mustFix.length) / 
    (data.linesAdded || 1)) * 100
  );
  
  const estimatedDays = Math.ceil(techDebt / 10); // ~10% tech debt = 1 day
  
  return template
    .replace('[COUNT]', data.filesChanged.toString())
    .replace('[ADDED]', data.linesAdded.toString())
    .replace('[REMOVED]', data.linesRemoved.toString())
    .replace('[CRITICAL]', data.issues.critical.length.toString())
    .replace('[MUST]', data.issues.mustFix.length.toString())
    .replace('[SHOULD]', data.issues.shouldFix.length.toString())
    .replace('[NICE]', data.issues.niceToHave.length.toString())
    .replace('[PERCENT]', techDebt.toString())
    .replace('[DAYS]', estimatedDays.toString());
}

async function main() {
  const prNumbers = process.argv.slice(2).map(n => parseInt(n));
  
  if (prNumbers.length === 0) {
    console.log('Usage: npm run review:prs -- 19 25 27');
    console.log('Or: npm run review:all-prs');
    process.exit(1);
  }
  
  for (const prNumber of prNumbers) {
    console.log(`\n📋 Analyzing PR #${prNumber}...`);
    const data = await analyzePR(prNumber);
    const review = generateReview(data);
    
    const outputPath = `/tmp/review-pr-${prNumber}.md`;
    fs.writeFileSync(outputPath, review);
    
    console.log(`✅ Review generated: ${outputPath}`);
    console.log(`\nTo post review:`);
    console.log(`  cat ${outputPath} | gh pr review ${prNumber} --comment -F -`);
  }
}

main().catch(console.error);
```

### Usage

```bash
# Add to package.json scripts:
{
  "scripts": {
    "review:prs": "ts-node scripts/review-prs.ts",
    "review:all-prs": "npm run review:prs -- 19 20 22 23 24 25 26 27"
  }
}

# Run it:
npm run review:all-prs

# Or specific PRs:
npm run review:prs -- 19 25 27
```

### Output

Script generates review files in `/tmp/`:
- `/tmp/review-pr-19.md`
- `/tmp/review-pr-25.md`
- `/tmp/review-pr-27.md`

Then post them:

```bash
# Post review for PR 19
cat /tmp/review-pr-19.md | gh pr review 19 --comment -F -

# Or request changes:
cat /tmp/review-pr-19.md | gh pr review 19 --request-changes -F -
```

---

## Batch Processing All PRs

### Strategy: Split by Priority

```bash
# Priority PRs (full review)
npm run review:prs -- 19 25 27

# Standard PRs (quick review)
for pr in 20 22 23 24 26; do
  cat PR_REVIEW_TEMPLATE_QUICK.md | \
    gh pr review $pr --comment -F -
done
```

### Parallel Processing

Review multiple PRs simultaneously:

```bash
# In separate terminal windows:
# Terminal 1
npm run review:prs -- 19 25

# Terminal 2
npm run review:prs -- 27 20 22

# Terminal 3
npm run review:prs -- 23 24 26
```

---

## Tips for Efficient Reviews

### 1. Use GitHub CLI

```bash
# List all open PRs
gh pr list

# View PR details
gh pr view 19

# Checkout PR
gh pr checkout 19

# Post review
gh pr review 19 --comment -F review.md
```

### 2. Use VS Code Extensions

- **GitHub Pull Requests** - Review PRs in VS Code
- **GitLens** - View file history and blame
- **ESLint** - Real-time linting

### 3. Focus on High-Impact Issues

Don't nitpick everything. Focus on:
- 🔴 Security vulnerabilities (always)
- 🟠 Type safety (if PR is large)
- 🟡 Missing tests (if PR adds features)
- 🟢 Documentation (if API changed)

### 4. Provide Examples

Instead of:
> "Add error handling"

Say:
> "Add error handling around line 45:
> ```typescript
> try {
>   await riskyOperation();
> } catch (error) {
>   logger.error('Operation failed', { error });
>   throw new OperationError('Failed', { cause: error });
> }
> ```"

### 5. Use Checklist Format

Helps authors track fixes:

```markdown
### Must Fix
- [ ] Add input validation (line 45)
- [ ] Remove `any` type (line 78)
- [ ] Add error handling (line 123)
```

---

## Common Issues to Look For

### Security (🔴 Critical)

```typescript
// ❌ Bad
const apiKey = 'sk-abc123';
await fetch(url, { headers: { 'Authorization': apiKey }});

// ✅ Good
const apiKey = process.env.API_KEY;
if (!apiKey) throw new Error('API_KEY not set');
await fetch(url, { headers: { 'Authorization': apiKey }});
```

### Type Safety (🟠 Must-Fix)

```typescript
// ❌ Bad
function getData(): any {
  return fetch('/api/data');
}

// ✅ Good
interface ApiResponse {
  data: User[];
  total: number;
}

async function getData(): Promise<ApiResponse> {
  const response = await fetch('/api/data');
  return response.json();
}
```

### Error Handling (🟠 Must-Fix)

```typescript
// ❌ Bad
try {
  await operation();
} catch (e) {
  // Silent failure
}

// ✅ Good
try {
  await operation();
} catch (error) {
  logger.error('Operation failed', { error, context });
  throw new OperationError('Failed to execute', { cause: error });
}
```

### Input Validation (🟡 Should-Fix)

```typescript
// ❌ Bad
export async function scanDomain(domain: string) {
  // No validation
  return await scanner.scan(domain);
}

// ✅ Good
import { z } from 'zod';

const DomainSchema = z.string().url();

export async function scanDomain(domain: unknown) {
  const validated = DomainSchema.parse(domain);
  return await scanner.scan(validated);
}
```

---

## Estimated Timeline

### Option A: Quick Template (Recommended)

- **Priority PRs (19, 25, 27):** 3 × 5 min = 15 min
- **Standard PRs (20, 22, 23, 24, 26):** 5 × 2 min = 10 min
- **Total:** ~25 minutes

### Option B: Full Template

- **All 7 PRs:** 7 × 10 min = 70 min

### Option C: Automated

- **Setup script:** 15 min (one-time)
- **Run reviews:** 5 min (per batch)
- **Total:** ~20 minutes (after setup)

---

## Success Metrics

Track these for each PR:

- ✅ Review posted within 24 hours
- ✅ All critical issues identified
- ✅ Clear action items provided
- ✅ Examples and context included
- ✅ Follow-up timeline set

---

## Next Steps

1. **Choose your approach** (A, B, or C)
2. **Start with priority PRs** (19, 25, 27)
3. **Batch remaining PRs** (20, 22, 23, 24, 26)
4. **Track completion** in a checklist
5. **Follow up** on requested changes

---

## References

- [PR_REVIEW_TEMPLATE.md](./PR_REVIEW_TEMPLATE.md) - Full template
- [PR_REVIEW_TEMPLATE_QUICK.md](./PR_REVIEW_TEMPLATE_QUICK.md) - Quick template
- [CODE_AUDIT_CHECKLIST.md](./CODE_AUDIT_CHECKLIST.md) - Standards reference
- [VS_CODE_AI_PROMPTS.md](./VS_CODE_AI_PROMPTS.md) - AI assistance prompts

---

**Created:** December 2024  
**For:** InfinitySoul PR review automation  
**Estimated Time Saved:** 1-2 hours vs manual reviews
