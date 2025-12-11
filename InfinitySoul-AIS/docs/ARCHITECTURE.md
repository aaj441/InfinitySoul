# Infinity Soul AIS - System Architecture

## Overview

Infinity Soul AIS is a comprehensive AI Insurance System designed to assess, score, and provide insurance readiness metrics for AI systems. The platform consists of 8 modular components that work together to provide complete risk assessment.

## System Components

### Frontend (Next.js 16 + TypeScript)
- **Location**: `frontend/`
- **Technology**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Features**:
  - Gradient-based UI with purple/blue theme
  - Tab-based navigation (Overview, Modules, Compliance, Scoring)
  - Real-time audit results display
  - Responsive design

### Backend (Express + Node.js)
- **Location**: `backend/`
- **Technology**: Express 4.18, Node.js
- **Endpoints**:
  - `GET /health` - Health check
  - `POST /api/audit` - Run full audit
  - `GET /api/partner/scores/:vaultId` - Partner API (coming soon)

### Audit Engine
- **Location**: `api/audit-engine.js`
- **Function**: Orchestrates all 8 modules using Promise.all for parallel execution
- **Process**:
  1. Receives URL from frontend
  2. Runs modules A-E in parallel
  3. Calculates insurance score
  4. Stores in evidence vault
  5. Returns comprehensive report

### 8 Audit Modules

#### Module A: AI System Scanner
- **Purpose**: Analyzes AI system capabilities and vulnerabilities
- **Output**: Bias score, model type, logging status, compliance checks

#### Module B: WCAG Accessibility Audit
- **Purpose**: Tests WCAG 2.2 compliance
- **Output**: Accessibility score, violations list, recommendations

#### Module C: Data & Security Check
- **Purpose**: Evaluates security posture
- **Output**: SSL status, encryption level, data protection measures

#### Module D: Stress Test Engine
- **Purpose**: Tests system resilience
- **Output**: Jailbreak resistance, hallucination rate, uptime, response time

#### Module E: NIST AI RMF Mapping
- **Purpose**: Maps to NIST AI Risk Management Framework
- **Output**: Status for Govern, Map, Measure, Manage functions

#### Module F: Insurance Readiness Scoring
- **Purpose**: Placeholder for detailed insurance calculations
- **Output**: Technical, compliance, operational breakdowns

#### Module G: Compliance Playbooks
- **Purpose**: Generates compliance action plans
- **Output**: Framework-specific playbooks (NAIC, HIPAA, etc.)

#### Module H: Evidence Vault Integration
- **Purpose**: Stores audit results immutably
- **Output**: Vault ID, storage confirmation

### Scoring Engine
- **Location**: `scoring/engine.js`
- **Algorithm**:
  ```
  Overall Score = (AI × 0.30) + (Accessibility × 0.20) + 
                  (Security × 0.25) + (Stress × 0.15) + (NIST × 0.10)
  ```
- **Risk Tiers**:
  - LOW: Score ≥ 80
  - MEDIUM: Score 60-79
  - HIGH: Score < 60
- **Insurance Eligibility**:
  - Cyber Insurance: Score ≥ 75
  - E&O Insurance: Score ≥ 70
  - General Liability: Score ≥ 65

### Evidence Vault
- **Location**: `vault/save.js`
- **Technology**: Supabase (PostgreSQL)
- **Features**:
  - Immutable audit trail
  - Timestamp verification
  - Mock fallback for development

## Data Flow

```
User Input (URL)
    ↓
Frontend (page.tsx)
    ↓
Backend API (/api/audit)
    ↓
Audit Engine (audit-engine.js)
    ↓
[Modules A-E run in parallel]
    ↓
Scoring Engine (calculates weighted score)
    ↓
Evidence Vault (stores results)
    ↓
Response to Frontend
    ↓
Display in Tabbed Interface
```

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Express 4.18, Node.js 20
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (frontend), Railway (backend)
- **Package Management**: npm
- **Process Management**: Concurrently

## Security Considerations

1. **Input Validation**: All URLs are validated before processing
2. **Error Handling**: Try-catch blocks with graceful degradation
3. **Rate Limiting**: (To be implemented)
4. **API Key Management**: Environment variables only
5. **CORS**: Configured for specific origins

## Scalability

- **Horizontal**: Backend can be replicated behind load balancer
- **Vertical**: Modules can be optimized individually
- **Caching**: Redis integration planned for frequent audits
- **Queue System**: BullMQ integration planned for async processing

## Future Enhancements

1. Real-time WebSocket updates during audit
2. Historical trend analysis
3. Comparative benchmarking
4. Partner API with OAuth2
5. White-label deployment options
6. Multi-language support
7. PDF report generation
8. Email notification system
