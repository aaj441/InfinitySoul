# VS Code AI Assistant Prompts for InfinitySoul

**Meta-Prompts for GitHub Copilot, Claude, and Other AI Code Assistants**

Use these prompts in VS Code's Chat panel, inline chat, or paste them as comments for AI-assisted code review and improvement.

---

## Setup

### In VS Code

1. Open Command Palette: `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type: `Chat: Open Chat`
3. Paste one of the prompts below
4. Select your AI provider (Copilot, Claude, etc.)
5. Press Enter to execute

### As Comments

Add prompts as comments in files for inline AI review:

```typescript
// @ai PROMPT_NAME
// [paste prompt text here]
```

---

## Prompt 1: Full-Module Production Hardening

**Use this to audit and refactor entire modules for production.**

```
Act as a senior TypeScript backend engineer. Review this module:
backend/intel/riskDistribution/index.ts

Perform a production-grade code audit:

1) TYPES & CONTRACTS
   - Identify any `any` or `unknown` types and suggest explicit interfaces
   - Verify all functions have explicit return type annotations
   - Check that all parameters are typed

2) ERROR HANDLING
   - Identify silent catches or bare `throw Error`
   - Suggest converting to custom error classes
   - Ensure errors include context and correlation IDs

3) INPUT VALIDATION
   - Find all public methods
   - For each method, suggest Zod/validation schemas
   - Validate at entry points before processing

4) LOGGING & OBSERVABILITY
   - Add structured logging to key operations
   - Include correlation IDs for tracing
   - Log at operation start, success, and failure

5) ASYNC SAFETY
   - Check all async operations
   - Add timeout protection using Promise.race
   - Ensure no hanging promises

6) SECURITY
   - Scan for hard-coded secrets
   - Check env var handling
   - Verify input sanitization

Provide:
- A list of issues found
- For each issue: line number, severity, specific fix
- Example refactored code for 2-3 key functions
- A diff-style patch I can apply

Focus on making this enterprise-grade and production-ready.
```

---

## Prompt 2: Ethics & Authorization Guard-Rails

**Use this to ensure ethical constraints are enforced.**

```
Treat EthicalUsePolicy (backend/intel/ethics/EthicalUsePolicy.ts)
as the source of truth for allowed behavioral data use.

Scan backend/intel/riskDistribution/ and:

1) FIND all functions that consume or process:
   - Music/behavioral risk data
   - Student data
   - Demographic information
   - Financial data

2) For each function, check:
   - Does it call ethicsPolicy.checkUseCase()?
   - If not, add the call with proper purpose
   - Does it fail closed (throw) on policy denial?
   - Is the purpose explicitly documented?

3) ADD COMMENTS explaining:
   - What use case is allowed
   - Why this use case is ethical
   - What restrictions apply
   - References to student data ethics frameworks

4) Ensure these principles are followed:
   - No punitive pricing based on student data
   - No disciplinary decisions based solely on analytics
   - No demographic proxies for discrimination
   - Transparent purpose declaration
   - Auditable access patterns

Provide:
- List of functions needing ethics checks
- Exact code changes for each (copy-paste ready)
- Comment text explaining ethical rationale
- References to higher-ed ethics guidelines

Focus on FAIL-SAFE defaults: deny by default, explicit whitelist.
```

---

## Prompt 3: End-to-End Risk Flow Test Harness

**Use this to create comprehensive test suites.**

```
Design Jest test suites for backend/intel/riskDistribution/:

Create tests that exercise the full pipeline:

1) TEST: Complete Risk Ingestion Flow
   - Input: Mock risk data from various industries
   - Process: Tokenize → Synthesize → Create Pool → Mint Tokens
   - Validate: Correct tokens created, proper structure
   - Edge cases: Invalid inputs, boundary values

2) TEST: Risk Assessment with Oracles
   - Input: Risk token
   - Process: Submit to oracle network, collect assessments, reach consensus
   - Validate: Consensus result correct, timeouts enforced
   - Edge cases: Oracle timeouts, conflicting assessments

3) TEST: Risk Distribution with Genetic Pool
   - Input: Tokens and risk holders
   - Process: Initialize pool, evolve allocation, generate report
   - Validate: Optimal allocation found
   - Edge cases: Single holder, single token, no evolution needed

4) TEST: Data Collateral Registration
   - Input: Data asset with quality metrics
   - Process: Validate, register, track in collateral engine
   - Validate: Asset stored correctly, queryable
   - Edge cases: Missing fields, invalid metrics, quality=0

5) TEST: Ethics Policy Enforcement
   - For each public method: test that ethics check is called
   - Test both allowed and disallowed use cases
   - Verify EthicsViolationError thrown when denied
   - Test fail-safe behavior (deny by default)

6) TEST: Error Handling
   - For each method: test happy path and error paths
   - Verify custom error types thrown with context
   - Verify correlation IDs generated and logged
   - Test error propagation and recovery

7) TEST: Logging
   - Verify structured logs created
   - Check correlation IDs flow through operations
   - Test all log levels (info, warn, error)
   - Validate log context includes relevant data

Generate:
- Complete test file with all 7 test suites
- Test helper functions for mocking engines
- Mock data generators for test inputs
- Integration test examples

Use Jest best practices:
- Descriptive test names (should...)
- AAA pattern (Arrange, Act, Assert)
- One assertion per test (where possible)
- Proper setup/teardown
- No hardcoded timeouts (use jest.useFakeTimers)

Provide copy-paste ready code.
```

---

## Prompt 4: Security & Dependency Sweep

**Use this for security hardening.**

```
Perform a security and dependency review for InfinitySoul Node/TypeScript project:

1) DEPENDENCY AUDIT
   - Suggest npm scripts to run:
     * npm audit (check vulnerabilities)
     * npm outdated (check for updates)
     * npm list (check for duplicates)
   - Identify any packages with known vulnerabilities
   - Recommend version ranges to lock

2) ENVIRONMENT HANDLING
   - Scan backend/intel for env var usage
   - Suggest: Create ConfigError class for invalid config
   - Verify all env vars validated at startup
   - Ensure NO secrets in logs or error messages

3) TYPESCRIPT SECURITY SETTINGS
   - Recommend tsconfig.json settings:
     * noImplicitAny: true
     * strictNullChecks: true
     * noImplicitThis: true
     * strictBindCallApply: true
   - Explain why each improves security

4) ESLINT SECURITY PLUGINS
   - Recommend security-focused ESLint rules
   - Suggest packages: eslint-plugin-security
   - Provide example ESLint config

5) INPUT VALIDATION
   - Review backend/intel/validation.ts
   - Identify any missing validation schemas
   - Suggest validation for all:
     * API request bodies
     * Environment variables
     * External API responses
     * File uploads

6) COMMON VULNERABILITIES
   - Check for:
     * SQL injection (if using DB)
     * XXS in logs
     * Command injection
     * Path traversal
     * Unhandled promise rejections

7) SECRETS MANAGEMENT
   - Scan code for hardcoded secrets
   - Suggest using: dotenv with strict validation
   - Recommend: pre-commit hooks to prevent secret leaks
   - Provide: .env.example template

Provide:
- Updated package.json with security settings
- Example ESLint config with security rules
- Suggested tsconfig.json entries
- dotenv initialization code
- Pre-commit hook example (using husky)
- List of any discovered issues with severity levels

Format as actionable steps with exact file names and line numbers.
```

---

## Prompt 5: Enterprise Polish & Documentation

**Use this for final polish and documentation.**

```
Refactor InfinitySoul as if deploying to enterprise customers.

Focus on: backend/intel/riskDistribution/ and backend/intel/

1) PUBLIC API REVIEW
   - Review all exported classes and functions
   - Ensure names are clear and self-documenting
   - Check for consistency across similar functions
   - Verify no leaked internal implementation details

2) NAMING CONSISTENCY
   - Methods: all use verb-noun pattern (registerAsset, assessRisk)
   - Parameters: consistent naming across similar methods
   - Error classes: all end with "Error"
   - Interfaces: all start with capital letter

3) JSDoc/TSDoc DOCUMENTATION
   For EVERY public function/class/interface, add JSDoc:

   /**
    * Brief description (one line)
    *
    * Detailed description if needed.
    *
    * @param paramName Description and type constraints
    * @param paramName2 Description
    * @returns Description of return value
    * @throws ErrorType When error occurs
    * @example
    * const result = func(param);
    * // result is...
    */

   Include:
   - Clear purpose
   - Parameter descriptions with type constraints
   - Return value description
   - Error conditions and types thrown
   - Usage examples for complex functions

4) ERROR DOCUMENTATION
   Document for each error type:
   - When it's thrown
   - What client code should do
   - How to handle it
   - Example error handling

5) ARCHITECTURE DOCUMENTATION
   Create/update ARCHITECTURE.md with:
   - System overview diagram (ASCII)
   - Component descriptions
   - Data flow through risk distribution
   - Ethical guard-rails explanation
   - Integration points with other systems

6) API DOCUMENTATION
   Create API_REFERENCE.md documenting:
   - All public classes
   - All public methods with signatures
   - Configuration options
   - Usage examples
   - Error scenarios

7) CONFIGURATION GUIDE
   Document in CONFIG.md:
   - All environment variables needed
   - Recommended values
   - Performance tuning options
   - Timeout configurations
   - Log level settings

8) DEPLOYMENT GUIDE
   Create DEPLOYMENT.md with:
   - Prerequisites
   - Installation steps
   - Configuration
   - Running in production
   - Monitoring and health checks
   - Troubleshooting common issues

Provide:
- Updated JSDoc for all public APIs
- ARCHITECTURE.md content
- API_REFERENCE.md content
- CONFIG.md content
- DEPLOYMENT.md content
- List of files that need updates

Make it suitable for external developers using this as a library.
```

---

## Usage Examples

### Example 1: Review a Specific Method

```
Review this method for production readiness:

[paste method code]

Check against the production audit checklist:
- Types & contracts: ✓/✗
- Error handling: ✓/✗
- Input validation: ✓/✗
- Logging: ✓/✗
- Ethics checks: ✓/✗
- Security: ✓/✗

For each ✗, provide specific fixes.
```

### Example 2: Generate Tests for a Method

```
Generate Jest tests for this method:

[paste method code]

Create tests for:
1. Happy path (valid inputs, succeeds)
2. Invalid inputs (validation errors)
3. Business logic errors
4. Async behavior (timeouts, retries)
5. Error handling
6. Logging verification

Use AAA pattern and make tests copy-paste ready.
```

### Example 3: Inline Code Review

Add this comment above a function:

```typescript
// @ai PROMPT 1: Full-Module Production Hardening
// Review only this function for production readiness
// Check: types, errors, validation, logging, async safety
function ingestRisk(sourceRisk: any) {
  // ... function code ...
}
```

---

## AI Assistant Tips

### For GitHub Copilot

- Use `Cmd+I` (Mac) or `Ctrl+I` (Windows) for inline chat
- Highlight code first, then open chat for context
- Use `#file` to reference specific files
- Chain multiple prompts for deeper analysis

### For Claude

- Can handle longer, more complex prompts
- Better at architectural discussions
- Excellent for comprehensive refactoring
- Use for generating large test suites

### For Both

- Be specific: mention exact files and line numbers
- Provide context: what the code does, what's wrong
- Ask for format: "provide as code I can paste"
- Request explanations: "why is this better?"

---

## Integration with CI/CD

### Pre-Commit Hook

```bash
#!/bin/bash
# .husky/pre-commit
echo "Running TypeScript check..."
npx tsc --noEmit

echo "Running linter..."
npx eslint backend/intel/**/*.ts

echo "Running tests..."
npm test -- --passWithNoTests

if [ $? -ne 0 ]; then
  echo "Pre-commit checks failed. Use --no-verify to skip."
  exit 1
fi
```

### GitHub Actions

```yaml
name: Code Quality
on: [pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx tsc --noEmit
      - run: npx eslint backend/intel/**/*.ts
      - run: npm test -- --coverage
```

---

## Checklist: Module Ready for Production

Use these prompts, then verify:

- [ ] All types are explicit (no `any`)
- [ ] All public methods have JSDoc
- [ ] All inputs validated with schemas
- [ ] All errors are custom types with context
- [ ] All async operations have timeouts
- [ ] Ethics checks on all data-using functions
- [ ] Structured logging on key operations
- [ ] 70%+ test coverage
- [ ] Zero security vulnerabilities
- [ ] ARCHITECTURE.md and API_REFERENCE.md exist
- [ ] All CI checks pass

**Result**: Module is production-grade and ready to deploy ✅

---

**Last Updated**: December 9, 2025
**Version**: 1.0 - VS Code Integration
**Tested With**: GitHub Copilot, Claude 3, GPT-4
