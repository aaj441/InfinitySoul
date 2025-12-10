# Cyber Risk Scan Pipeline

This directory contains the implementation of the cyber risk scanning system following the "anti-skyscraper" architecture pattern. Each module has a single, well-defined responsibility.

## Architecture

See [docs/STREET_CYBER_SCAN.md](../../docs/STREET_CYBER_SCAN.md) for the complete street definition.

### Module Responsibilities

1. **types.ts** - Type definitions and interfaces
2. **scout.ts** - Data collection (DNS, HTTP/HTTPS, headers, ports)
3. **analyst.ts** - Risk analysis and categorization
4. **scribe.ts** - Markdown report formatting
5. **broker.ts** - Lead logging to JSONL
6. **files.ts** - File I/O operations

### Data Flow

```
Domain Input → Scout → Analyst → ┬→ Scribe → Files
                                 └→ Broker
```

## Usage

### Via CLI

```bash
npm run scan:domain -- --domain=example.com
```

### Programmatically

```typescript
import { runScout } from './backend/cyber/scout';
import { analyzeScoutResult } from './backend/cyber/analyst';
import { renderMarkdownReport } from './backend/cyber/scribe';
import { writeEvidence, writeReport } from './backend/cyber/files';
import { logLead } from './backend/cyber/broker';

const scout = await runScout('example.com');
const analysis = analyzeScoutResult(scout);
const markdown = renderMarkdownReport(analysis);

await writeEvidence(scout);
await writeReport(analysis, markdown);
await logLead(analysis);
```

## Testing

```bash
# Run cyber scan tests
npx jest tests/cyber/

# Run with coverage
npx jest tests/cyber/ --coverage
```

## Output Files

- **evidence/{timestamp}-{domain}.json** - Raw scan data
- **reports/{timestamp}-{domain}.md** - Human-readable report
- **leads/leads.jsonl** - Append-only lead log

All output directories are gitignored.

## Design Principles

1. **Single Responsibility** - Each module does one thing
2. **No Cross-Cutting Concerns** - Scout doesn't analyze, Analyst doesn't persist, etc.
3. **Testability** - Pure functions with clear inputs/outputs
4. **Extensibility** - Easy to add new checks or output formats

## Future Extensions

- Slack integration for DM-triggered scans
- Email delivery of reports
- Database storage for analytics
- Additional security checks (DNSSEC, CAA records, certificate analysis)
- Scheduled rescans and change detection
