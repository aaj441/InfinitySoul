# STREET_CYBER_SCAN – Cyber Risk Scan Pipeline

## Purpose

Free cyber risk scan from Slack DM → CLI scan → JSON evidence → Markdown report → lead log.

This street provides a lightweight, production-grade pipeline for scanning domains and generating actionable cybersecurity reports for small business owners. The goal is to identify common security misconfigurations and risks, then present them in plain language.

## Architecture: Anti-Skyscraper Design

Each role has a single responsibility. No module performs multiple concerns:

### Roles

1. **Scout** (`backend/cyber/scout.ts`)
   - Responsibility: Collect raw technical data
   - Actions:
     - DNS resolution
     - HTTP/HTTPS reachability checks
     - Security header collection
     - Basic port scanning (non-intrusive)
   - Does NOT: analyze, format, or persist data

2. **Analyst** (`backend/cyber/analyst.ts`)
   - Responsibility: Categorize and score findings
   - Actions:
     - Convert raw scout data into risk issues
     - Assign severity levels (low/medium/high)
     - Categorize issues (exposure/configuration/encryption/hygiene/other)
     - Compute overall risk severity
   - Does NOT: collect data, format reports, or persist anything

3. **Scribe** (`backend/cyber/scribe.ts`)
   - Responsibility: Format analysis into human-readable reports
   - Actions:
     - Generate Markdown reports
     - Use plain language for non-technical audiences
     - Structure findings with clear next steps
   - Does NOT: collect data, analyze, or persist files

4. **Broker** (`backend/cyber/broker.ts`)
   - Responsibility: Persist lead information
   - Actions:
     - Append lead entries to JSONL log
     - Ensure leads directory exists
   - Does NOT: collect data, analyze, or format reports

5. **Files** (`backend/cyber/files.ts`)
   - Responsibility: I/O operations for evidence and reports
   - Actions:
     - Write evidence JSON files
     - Write report Markdown files
     - Ensure output directories exist
   - Does NOT: collect, analyze, format, or log leads

## Data Flow

```
Domain Input
    ↓
Scout (collect raw data)
    ↓
Analyst (categorize & score)
    ↓
├─→ Scribe (format report)
├─→ Files (write evidence & report)
└─→ Broker (log lead)
```

## Outputs

1. **Evidence Files**: `evidence/{timestamp}-{domain}.json`
   - Raw scout data in JSON format
   - Timestamped for audit trail
   - Contains all technical findings

2. **Report Files**: `reports/{timestamp}-{domain}.md`
   - Human-readable Markdown report
   - Non-technical language
   - Actionable recommendations

3. **Lead Log**: `leads/leads.jsonl`
   - Append-only JSONL format
   - One line per scan
   - Includes domain, severity, issue count, timestamp

## Usage

```bash
npm run scan:domain -- --domain=example.com
```

### Expected Behavior

1. Scout collects data from the domain
2. Analyst processes findings into categorized risks
3. Scribe generates plain-language report
4. Files writes evidence and report to disk
5. Broker logs the lead for follow-up
6. CLI outputs file paths and completion status

### Output Example

```
Scanning domain: example.com...
Scan complete.
Evidence: evidence/2025-12-10T22-15-30-example.com.json
Report:   reports/2025-12-10T22-15-30-example.com.md
```

## Design Principles

1. **Modularity**: Each module has exactly one responsibility
2. **Testability**: Pure functions with clear inputs/outputs
3. **Extensibility**: Easy to add new checks or output formats
4. **Simplicity**: Minimal dependencies, straightforward logic
5. **Safety**: Non-intrusive scanning, graceful error handling

## Future Extensions

- Slack integration for DM-triggered scans
- Email delivery of reports
- Database storage for lead management
- Scheduled rescans and monitoring
- Additional security checks (DNSSEC, CAA records, etc.)

## Related Documentation

- See implementation files in `backend/cyber/`
- See tests in `tests/cyber/`
- See CLI in `scripts/scan-domain.ts`
