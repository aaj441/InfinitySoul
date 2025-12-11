# Quick PR Review Template - InfinitySoul

**🤖 Copilot Nitpicking Review**

---

## Quick Checks

### 🔴 CRITICAL (Must Fix Before Merge)
- [ ] No hard-coded secrets or credentials
- [ ] Input validation on all external data
- [ ] No SQL/command injection vulnerabilities
- [ ] No unbounded loops or memory leaks
- [ ] All promises have error handlers

### 🟠 MUST-FIX (Production Quality)
- [ ] No `any` types (or justified with comments)
- [ ] Explicit return types on all functions
- [ ] Custom error classes (not bare `Error`)
- [ ] No silent catches (all errors logged)
- [ ] Input validation with Zod/schemas

### 🟡 SHOULD-FIX (Important)
- [ ] Structured logging on key operations
- [ ] Timeout protection on external calls
- [ ] Unit tests for new functionality
- [ ] Integration tests for workflows
- [ ] Resource cleanup in finally blocks

### 🟢 NICE-TO-HAVE (Polish)
- [ ] JSDoc on public APIs
- [ ] Reduced code duplication
- [ ] Improved naming/organization
- [ ] Performance optimizations
- [ ] Updated documentation

### ⚖️ ETHICS (InfinitySoul Specific)
- [ ] Ethics policy checks on behavioral data
- [ ] No punitive uses of student data
- [ ] Audit trail with correlation IDs
- [ ] Privacy & consent documented

---

## Summary

**Files Changed:** [COUNT]  
**Lines Changed:** +[ADDED] -[REMOVED]  
**Issues Found:** [CRITICAL]/[MUST]/[SHOULD]/[NICE]  
**Tech Debt:** ~[PERCENT]% of changes need fixes (~[DAYS] days)  
**Recommendation:** [APPROVE / REQUEST CHANGES / NEEDS DISCUSSION]

---

## Key Findings

### Critical Issues
1. [Issue description] - File: `path/to/file.ts:123`
2. [Issue description] - File: `path/to/file.ts:456`

### Must-Fix Issues
1. [Issue description] - File: `path/to/file.ts:789`
2. [Issue description] - File: `path/to/file.ts:012`

### Should-Fix Issues
1. [Issue description] - File: `path/to/file.ts:345`
2. [Issue description] - File: `path/to/file.ts:678`

---

## Next Steps

1. Fix all 🔴 CRITICAL issues
2. Address 🟠 MUST-FIX issues (or create tickets)
3. Run: `npx tsc --noEmit && npx eslint backend/**/*.ts && npm test`
4. Re-request review after fixes

---

**Full Review Template:** [PR_REVIEW_TEMPLATE.md](./PR_REVIEW_TEMPLATE.md)  
**Code Standards:** [CODE_AUDIT_CHECKLIST.md](./CODE_AUDIT_CHECKLIST.md)  
**Reviewer:** GitHub Copilot
