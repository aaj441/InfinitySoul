# Universal PR Review Template - InfinitySoul

**🤖 Comprehensive Nitpicking Review by GitHub Copilot**

---

## Overview

This PR has been reviewed using InfinitySoul's production-grade code standards. The review follows the [CODE_AUDIT_CHECKLIST.md](./CODE_AUDIT_CHECKLIST.md) and enterprise TypeScript best practices.

**Review Categories:**
- 🔴 **CRITICAL** - Must fix before merge (security, data loss, crashes)
- 🟠 **MUST-FIX** - Required for production quality (type safety, error handling)
- 🟡 **SHOULD-FIX** - Important improvements (logging, validation, testing)
- 🟢 **NICE-TO-HAVE** - Polish and optimization (documentation, refactoring)

---

## 🔴 CRITICAL ISSUES

### Security & Data Safety

- [ ] **Hard-coded secrets or credentials**
  - Check for API keys, tokens, passwords in code
  - All sensitive data must use environment variables
  - Example: `const apiKey = process.env.API_KEY` not `const apiKey = "sk-..."`

- [ ] **SQL injection or command injection vulnerabilities**
  - All user inputs must be sanitized/validated
  - Use parameterized queries, never string concatenation
  - Validate all inputs with Zod or similar schema validators

- [ ] **Missing input validation on external data**
  - All API endpoints must validate request bodies
  - All file imports must validate structure
  - All environment variables must be checked at startup

- [ ] **Unbounded loops or memory leaks**
  - No loops that could iterate infinitely
  - Large datasets must use streaming/pagination
  - Database connections must be closed

- [ ] **Race conditions or unhandled promise rejections**
  - All promises must be awaited or have `.catch()`
  - No floating promises without error handlers
  - Async operations must have timeout protection

---

## 🟠 MUST-FIX ISSUES

### Type Safety

- [ ] **Eliminate `any` types**
  - Every `any` must be replaced with specific interface
  - If `any` is truly required, add `// @ts-expect-error` with justification
  - Target: 100% type coverage

- [ ] **Add explicit return types**
  - All functions must have `: ReturnType` annotations
  - Don't rely on type inference for public APIs
  - Example: `function getData(): Promise<User[]>` not `function getData()`

- [ ] **Complete interface definitions**
  - All data models need full type definitions
  - No partial types or optional properties without reason
  - Group related types in dedicated `types.ts` files

- [ ] **Fix strict mode violations**
  - Enable `strictNullChecks`, `noImplicitAny`, `strictBindCallApply`
  - Fix all TypeScript errors before merge
  - Run `npx tsc --noEmit` to verify

### Error Handling

- [ ] **Replace generic errors with custom error classes**
  - No bare `throw new Error()` in production code
  - Create domain-specific error classes (ValidationError, DatabaseError, etc.)
  - Reference: `backend/intel/errors.ts`

- [ ] **No silent error catches**
  - Every `try-catch` must log the error or re-throw
  - Include context: operation, inputs, correlation ID
  - Example:
    ```typescript
    try {
      await riskyOperation();
    } catch (error) {
      logger.error('Operation failed', { error, context, correlationId });
      throw new OperationError('Failed to execute', { cause: error });
    }
    ```

- [ ] **Add error context and correlation IDs**
  - All errors must include enough context to debug
  - Add correlation IDs for tracing requests through system
  - Log at operation start, success, and failure

### Input Validation

- [ ] **Validate all public method inputs**
  - Use Zod schemas at API boundaries
  - Fail fast with clear error messages
  - Example:
    ```typescript
    const InputSchema = z.object({
      domain: z.string().url(),
      options: z.object({ timeout: z.number().positive() })
    });
    
    export async function scanDomain(input: unknown) {
      const validated = InputSchema.parse(input);
      // ... safe to use validated data
    }
    ```

- [ ] **Sanitize all external inputs**
  - Escape HTML, SQL, shell commands
  - Validate file paths to prevent directory traversal
  - Check array bounds and string lengths

---

## 🟡 SHOULD-FIX ISSUES

### Logging & Observability

- [ ] **Add structured logging to key operations**
  - Log operation start, completion, failures
  - Use consistent log format: timestamp, level, message, context
  - Include correlation IDs for tracing
  - Reference: `backend/intel/logger.ts`

- [ ] **Improve log context**
  - Add relevant data to logs (IDs, counts, durations)
  - Include stack traces for errors
  - Use log levels correctly: DEBUG, INFO, WARN, ERROR

- [ ] **Add performance instrumentation**
  - Measure duration of critical operations
  - Log timing at key checkpoints
  - Example:
    ```typescript
    const startTime = Date.now();
    await operation();
    logger.info('Operation completed', { durationMs: Date.now() - startTime });
    ```

### Async Safety

- [ ] **Add timeout protection**
  - All external calls need configurable timeouts
  - Use `Promise.race()` with timeout promise
  - Example:
    ```typescript
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new TimeoutError()), 30000)
    );
    const result = await Promise.race([
      externalCall(),
      timeoutPromise
    ]);
    ```

- [ ] **Handle concurrent operations safely**
  - Use locks/semaphores for shared resources
  - Avoid race conditions in state updates
  - Document thread-safety requirements

- [ ] **Clean up resources**
  - Close database connections in `finally` blocks
  - Unsubscribe from event listeners
  - Release file handles

### Testing

- [ ] **Add unit tests for new functionality**
  - Test happy paths and error cases
  - Mock external dependencies
  - Target: 70% code coverage minimum

- [ ] **Add integration tests for workflows**
  - Test end-to-end scenarios
  - Verify error propagation
  - Test with realistic data

- [ ] **Test edge cases**
  - Empty inputs, null/undefined handling
  - Boundary conditions (max/min values)
  - Concurrent access scenarios

---

## 🟢 NICE-TO-HAVE IMPROVEMENTS

### Code Organization

- [ ] **Improve separation of concerns**
  - Extract large functions into smaller, focused ones
  - Separate business logic from infrastructure
  - Move reusable code to utility modules

- [ ] **Reduce code duplication**
  - Extract common patterns into shared functions
  - Create base classes for repeated logic
  - Use composition over inheritance

- [ ] **Improve naming**
  - Use descriptive, searchable names
  - Follow project conventions (camelCase, PascalCase)
  - Avoid abbreviations unless domain-standard

### Documentation

- [ ] **Add JSDoc comments to public APIs**
  - Document purpose, parameters, return values
  - Include usage examples
  - Describe error conditions
  - Example:
    ```typescript
    /**
     * Scans a domain for cyber security vulnerabilities
     * 
     * @param domain - The domain to scan (must be valid URL)
     * @param options - Scan configuration options
     * @returns Scan results with risk score and findings
     * @throws {ValidationError} If domain is invalid
     * @throws {TimeoutError} If scan exceeds timeout
     * 
     * @example
     * const results = await scanDomain('example.com', { timeout: 30000 });
     */
    ```

- [ ] **Update README if needed**
  - Document new features or API changes
  - Update setup/installation instructions
  - Add usage examples

- [ ] **Add inline comments for complex logic**
  - Explain "why" not "what" (code shows what)
  - Document non-obvious algorithms
  - Reference specifications or tickets

### Performance

- [ ] **Optimize database queries**
  - Add indexes for frequently queried fields
  - Use select statements to limit columns
  - Batch operations when possible

- [ ] **Reduce memory usage**
  - Stream large files instead of loading into memory
  - Use pagination for large result sets
  - Clear caches periodically

- [ ] **Improve response times**
  - Cache expensive computations
  - Use async/parallel operations
  - Lazy-load non-critical data

---

## Ethics & Governance (InfinitySoul Specific)

- [ ] **Ethics policy checks in place**
  - All functions using behavioral/student data call `EthicalUsePolicy.checkUseCase()`
  - Disallowed uses throw `EthicsViolationError`
  - Policy fails safe (deny by default)
  - Reference: `backend/intel/ethics/EthicalUsePolicy.ts`

- [ ] **No punitive uses of behavioral data**
  - No premium increases based solely on music/behavior
  - No disciplinary decisions without human review
  - No demographic discrimination proxies

- [ ] **Audit trail complete**
  - All data access logged with purpose
  - Correlation IDs enable full tracing
  - Access denied events logged

- [ ] **Privacy & consent documented**
  - Data origin tracked
  - Consent basis clear
  - Retention policies defined

---

## Checklist Summary

**Before approving this PR, ensure:**

- [ ] All 🔴 **CRITICAL** issues are fixed
- [ ] At least 80% of 🟠 **MUST-FIX** issues are addressed
- [ ] 🟡 **SHOULD-FIX** issues have tracking tickets if not fixed
- [ ] TypeScript compiles with no errors: `npx tsc --noEmit`
- [ ] Linter passes: `npx eslint backend/**/*.ts`
- [ ] Tests pass: `npm run test`
- [ ] No new security vulnerabilities: `npm audit`
- [ ] Ethics policy checks added (if handling sensitive data)
- [ ] Documentation updated (if API changed)

---

## Estimated Tech Debt

Based on issues found:

- **Lines requiring changes:** [COUNT] / [TOTAL] (~[PERCENT]%)
- **Estimated time to fix:** [DAYS] days
- **Priority:** [HIGH/MEDIUM/LOW]

---

## Next Steps

1. **Address all 🔴 CRITICAL issues immediately**
2. **Fix 🟠 MUST-FIX issues** or create detailed follow-up tickets
3. **Create tickets for 🟡 SHOULD-FIX issues** to track tech debt
4. **Consider 🟢 NICE-TO-HAVE improvements** for future refactoring

---

## References

- [CODE_AUDIT_CHECKLIST.md](./CODE_AUDIT_CHECKLIST.md) - Full production standards
- [VS_CODE_AI_PROMPTS.md](./VS_CODE_AI_PROMPTS.md) - AI-assisted code review prompts
- [ETHICS_CHARTER.md](./ETHICS_CHARTER.md) - Ethics and governance framework
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict) - Type safety guide

---

**Reviewer:** GitHub Copilot (Agentic)  
**Review Date:** [DATE]  
**Review Depth:** Comprehensive Nitpicking  
**Follow-up Required:** [YES/NO]

---

## How to Use This Template

1. **Copy this entire template** to a PR comment
2. **Fill in the brackets** with specific findings for this PR
3. **Check boxes** as you find issues (or leave unchecked if not found)
4. **Add specific examples** with file names and line numbers
5. **Update the summary** with counts and estimates
6. **Post the review** and request changes if needed

**Pro tip:** Use the "Files changed" tab in GitHub to review code line-by-line while filling out this template.
