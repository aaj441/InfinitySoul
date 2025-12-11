# STREET_CYBER_SCAN

## Purpose

Provide a free cyber risk scanning service that flows from initial contact (Slack DM) through automated technical assessment to human-readable reporting and lead capture.

**Flow:** Slack DM → CLI scan → JSON evidence → Markdown report → lead log

This street creates value by:
- Offering immediate, actionable security insights to small business owners
- Building trust through transparency and education
- Capturing qualified leads for remediation and insurance services

---

## Roles

### Scout
**Responsibility:** Technical reconnaissance  
**Input:** Domain name  
**Output:** `ScoutResult` with raw technical findings  

Performs non-intrusive checks:
- DNS resolution
- HTTP/HTTPS reachability
- Security header inspection
- Shallow port scanning (common ports only)
- Error and timeout handling

**Anti-pattern:** Scout does NOT analyze, score, or write files. Pure data collection.

---

### Analyst
**Responsibility:** Risk classification and scoring  
**Input:** `ScoutResult`  
**Output:** `CyberRiskAnalysis` with categorized issues and severity

Transforms raw findings into structured risk issues:
- Categorizes findings (exposure, configuration, encryption, hygiene, other)
- Assigns severity levels (low, medium, high)
- Computes overall severity from issue set
- Provides explainable heuristics (documented in code)

**Anti-pattern:** Analyst does NOT perform network calls or write files. Pure analysis.

---

### Scribe
**Responsibility:** Human translation  
**Input:** `CyberRiskAnalysis`  
**Output:** Markdown report string

Generates plain-language reports for non-technical audiences:
- Title and scan metadata
- Overall severity in simple terms
- Issue list with clear explanations
- "Next steps" guidance

**Anti-pattern:** Scribe does NOT log leads or write files. Pure formatting.

---

### Broker
**Responsibility:** Lead persistence  
**Input:** `CyberRiskAnalysis`, optional notes  
**Output:** Appended line in `leads/leads.jsonl`

Manages lead logging:
- Creates `leads/` directory if needed
- Appends JSONL entries (one lead per line)
- Handles concurrent writes with best-effort safety
- Does NOT rewrite existing entries

**Anti-pattern:** Broker does NOT analyze or format reports. Pure persistence.

---

## Outputs

### Evidence JSON
**Location:** `evidence/{timestamp}-{domain}.json`  
**Content:** Complete `ScoutResult` object  
**Purpose:** Audit trail, debugging, potential ML training data

### Report Markdown
**Location:** `reports/{timestamp}-{domain}.md`  
**Content:** Human-readable security assessment  
**Purpose:** Deliverable to prospect, starts sales conversation

### Lead Log
**Location:** `leads/leads.jsonl`  
**Content:** One JSON object per line (JSONL format)  
**Purpose:** CRM integration, follow-up tracking, analytics

---

## Data Flow

```
[User provides domain]
        ↓
[Scout: technical checks] → ScoutResult
        ↓
[Analyst: categorize & score] → CyberRiskAnalysis
        ↓
        ├→ [Scribe: format report] → Markdown string
        │           ↓
        │   [Files: write report] → reports/{timestamp}-{domain}.md
        │
        ├→ [Files: write evidence] → evidence/{timestamp}-{domain}.json
        │
        └→ [Broker: log lead] → leads/leads.jsonl (append)
```

---

## Anti-Skyscraper Principles

Each module has a single, clear responsibility:

- **Scout** = Data collection only
- **Analyst** = Analysis only
- **Scribe** = Formatting only
- **Broker** = Persistence only
- **Files** = I/O only
- **CLI** = Orchestration only

No module performs another module's job. This enables:
- Easy testing (mock inputs/outputs)
- Clear debugging (single concern per file)
- Safe refactoring (minimal coupling)
- Team scaling (experts can own modules)

---

## Extension Points

Future enhancements can be added without breaking existing code:

1. **Deeper scanning:** Enhance Scout with vulnerability databases, SSL analysis, etc.
2. **ML scoring:** Replace Analyst heuristics with trained models
3. **Multi-format reports:** Add PDF, HTML renderers alongside Markdown
4. **CRM integration:** Extend Broker to push leads to external systems
5. **Real-time UI:** Wrap CLI in API endpoints for web dashboard

---

## Usage

```bash
npm run scan:domain -- --domain=example.com
```

**Expected output:**
```
Scanning domain: example.com...
Scan complete.
Evidence: evidence/2024-01-15T10-30-45-example.com.json
Report:   reports/2024-01-15T10-30-45-example.com.md
```

New line appended to `leads/leads.jsonl`.

---

## Code References

- Types: `backend/cyber/types.ts`
- Scout: `backend/cyber/scout.ts`
- Analyst: `backend/cyber/analyst.ts`
- Scribe: `backend/cyber/scribe.ts`
- Broker: `backend/cyber/broker.ts`
- Files: `backend/cyber/files.ts`
- CLI: `scripts/scan-domain.ts`

---

## Compliance Notes

All scanning is non-intrusive and ethical:
- No brute force or exploit attempts
- Respects robots.txt and rate limits
- Only checks publicly accessible endpoints
- Logs all activity for audit purposes

This is reconnaissance for business development, not security research. If we discover active threats, we note them in the report but do not exploit them.
