# Cyber Risk Scan Module

This module implements the STREET_CYBER_SCAN pipeline for automated security reconnaissance and lead generation.

## Overview

The cyber scan pipeline provides free security assessments to small business owners, converting technical findings into actionable insights while capturing qualified leads.

**See:** [`docs/STREET_CYBER_SCAN.md`](../../docs/STREET_CYBER_SCAN.md) for complete architecture and design principles.

## Module Structure

```
backend/cyber/
├── types.ts              # TypeScript interfaces and types
├── scout.ts              # Technical reconnaissance (DNS, HTTP/HTTPS, ports)
├── analyst.ts            # Risk classification and severity scoring
├── scribe.ts             # Human-readable report generation
├── broker.ts             # Lead logging with explicit error handling
├── files.ts              # Evidence and report file management with versioning
├── errors.ts             # Custom error types (NEW)
├── cache.ts              # In-memory LRU cache for DNS/cert results (NEW)
└── evidence-schema.json  # JSON Schema for evidence output (NEW)
```

## Configuration

```
config/
├── cyber.ts              # Configuration constants (timeouts, thresholds, etc.)
└── secrets.example.ts    # Example secrets configuration (API keys, webhooks)
```

## Usage

### CLI Command

```bash
npm run scan:domain -- --domain=example.com
```

### Programmatic Usage

```typescript
import { runScout } from "./backend/cyber/scout";
import { analyzeScoutResult } from "./backend/cyber/analyst";
import { renderMarkdownReport } from "./backend/cyber/scribe";
import { writeEvidence, writeReport } from "./backend/cyber/files";
import { logLead } from "./backend/cyber/broker";

// Run complete pipeline
const scout = await runScout("example.com");
const analysis = analyzeScoutResult(scout);
const markdown = renderMarkdownReport(analysis);

await writeEvidence(scout);
await writeReport(analysis, markdown);
await logLead(analysis);
```

## Anti-Skyscraper Design

Each module has a single, clear responsibility:

- **Scout**: Data collection only (with caching and parallelization)
- **Analyst**: Analysis only (no network calls, no file I/O)
- **Scribe**: Formatting only (no analysis, no file I/O)
- **Broker**: Persistence only (with explicit error states)
- **Files**: I/O only (with schema versioning)
- **Cache**: Caching layer for performance optimization
- **Errors**: Custom error types for explicit error handling

This separation enables:
- Easy unit testing with mocked inputs
- Clear debugging path
- Safe parallel development
- Independent scaling
- Explicit error handling and recovery

## Production Hardening (v2.0)

### 1. Error Handling
All modules now use custom error types:
- `DnsResolutionError`, `HttpCheckError`, `PortScanError`
- `FileWriteError`, `LeadLogError`, `CacheError`
- Check `isRecoverableError()` for retry logic

### 2. Caching Layer
24-hour TTL cache for DNS and certificate data to avoid redundant lookups and rate limiting.

### 3. Configuration Management
All constants moved to `config/cyber.ts` (timeouts, thresholds, ports, etc.)

### 4. Secrets Management
API keys via `config/secrets.example.ts` and environment variables (optional for basic scanning).

### 5. Schema Versioning
Evidence JSON includes `schemaVersion` field for backward compatibility.

### 6. Performance Optimization
- Parallel scanning with `Promise.allSettled()`
- DNS/cert caching (24hr TTL)
- Error tolerance (failed checks don't block scan)

## Outputs

### Evidence JSON
**Location:** `evidence/{timestamp}-{domain}.json`

Contains complete `ScoutResult` with all raw technical findings. Used for:
- Audit trail
- Debugging
- Historical analysis
- ML training data

### Report Markdown
**Location:** `reports/{timestamp}-{domain}.md`

Human-readable security assessment in plain language. Used for:
- Customer deliverable
- Sales conversation starter
- Email attachment

### Lead Log
**Location:** `leads/leads.jsonl`

Append-only JSONL file with one lead per line. Used for:
- CRM integration
- Follow-up tracking
- Analytics and reporting

## Testing

```bash
# Run unit tests
npm test tests/cyber/analyst.test.ts
npm test tests/cyber/scribe.test.ts

# Run integration tests
npm test tests/cyber/integration.test.ts
```

## Security Notes

All scanning is non-intrusive:
- No exploit attempts
- No brute force
- Respects rate limits
- Only checks public endpoints

See `docs/STREET_CYBER_SCAN.md` for compliance details.

## Extension Points

Future enhancements can be added without breaking existing code:

1. **Deeper scanning**: Add vulnerability databases, SSL analysis
2. **ML scoring**: Replace heuristics with trained models
3. **Multi-format reports**: Add PDF/HTML renderers
4. **CRM integration**: Extend broker for external systems
5. **Real-time UI**: Wrap CLI in API endpoints

## Configuration

Configuration constants are defined at the top of relevant modules:

- `scribe.ts`: `COMPANY_NAME` - Company name in reports
- `scout.ts`: Common ports list and timeouts
- `broker.ts`, `files.ts`: Output directory paths

For production deployment, consider moving these to environment variables or a central config file.
