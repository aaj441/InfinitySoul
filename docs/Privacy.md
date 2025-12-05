# Privacy Policy & Data Processing Register (Engineering-Facing)

This document complements the public Privacy Notice with engineering-operational details to meet GDPR/CCPA and similar laws.

## Data Classes
- Account Data: name, email, organization, auth identifiers
- Operational Data: logs, metrics, traces, job queues
- Content: website scan inputs/outputs, reports, email templates
- Consent & Preferences: marketing opt-in/out, region flags

## Lawful Basis Mapping
- Contract: providing platform services to users
- Legitimate Interest: service security, fraud prevention
- Consent: marketing emails, certain analytics, optional features

## Processing Activities
- Scans: ingest public site content; generate findings; store result metadata
- Outreach: use contact lists with region-specific consent; track unsubscribes
- Analytics: aggregate, non-identifying metrics unless consented otherwise

## Retention
- Logs: 90 days default (aggregate longer); configurable per tenant
- Reports/Scan Results: 12 months default; configurable
- DSAR-related artifacts: retained as required by law

## Subprocessors
- List vendors, role, data categories, region, DPA link, security review date
- Review annually; maintain DPAs with SCCs where applicable

## Rights Handling (DSAR)
- Intake: Support channel/web form; verify identity
- Fulfillment: Data export, correction, deletion, objection; SLA 30 days
- Evidence: Track requests in ticketing; log decisions; store artifacts

## Regional Controls
- EU/EEA: strict consent for marketing; data minimization; ePrivacy banner if cookies used
- Canada (CASL): express consent; record consent timestamp and provenance
- US (CAN-SPAM): clear unsubscribe; truthful headers/subjects

## Security Alignment
- Follow `Compliance.md` security controls and OWASP ASVS baseline
- No sensitive personal data stored unless explicitly necessary and consented

## Data Transfers
- Document cross-border flows; use SCCs/UK IDTA where applicable
- Enable regional data residency where feasible

## Changes & Versioning
- Version this document; record changes; notify users for material updates
