# InfinitySoul Cyber Insurance Platform - Complete Guide

## Architecture Overview

This is the **InfinitySoul Cyber Insurance Edition** - a complete solo-operator cockpit that transforms raw leads into qualified prospects with comprehensive cyber risk assessments, coverage maps, and personalized outreach sequences.

Built on the vision from the problem statement, this implementation provides all the core layers needed for a cyber insurance operation.

## Core Components

### 1. Domain Layer (`backend/cyber/`)

The domain layer contains core cyber insurance business logic:

- **`domain_engine.ts`**: CyberDomainEngine - orchestrates risk assessment, carrier matching, and question generation
- **`risk_models.ts`**: Statistical models for loss probability and premium estimation
- **`carrier_matrix.ts`**: Carrier appetite data loader and matcher
- **`question_bank.ts`**: Industry-specific intake questions organized by niche

**Key Classes:**
- `CyberDomainEngine` - Main entry point for all cyber insurance logic
- Functions: `computeLossProbability()`, `suggestPremium()`, `loadCarrierAppetite()`

### 2. Context Layer (`contexts/`)

Industry-specific contexts with tailored risk factors, coverage priorities, and outreach templates:

- **`generic.json`** - General business
- **`healthcare.json`** - Medical, dental, healthcare practices (HIPAA focus)
- **`law_firm.json`** - Legal practices (wire fraud, client data)
- **`nonprofit.json`** - Charitable organizations (donor data)

Each context includes:
- Risk factors specific to the industry
- Key intake questions
- Coverage priorities
- Outreach email templates
- Discovery call script focus areas

### 3. Workflow Layer (`workflows/`)

YAML workflow definitions for orchestrating multi-step processes:

- **`sales_funnel.yaml`** - Complete lead → qualify → assess → outreach pipeline
- **`risk_assessment.yaml`** - Lightweight risk assessment workflow

These workflows define the agent execution order and data flow.

### 4. Agent Layer (`backend/agents/`)

Specialized agents for different tasks:

- **`niche_switcher.ts`**: Manages industry-specific contexts (NicheContextSwitcher class)
- **`qualification_agent.ts`**: Qualifies leads and identifies industry niche
- **`risk_assessment_agent.ts`**: Performs comprehensive cyber risk assessments
- **`discovery_script_agent.ts`**: Generates discovery call scripts (template + LLM)
- **`outreach_agent.ts`**: Creates multi-email outreach sequences

Each agent has a single responsibility and clear input/output contract.

### 5. Orchestrator (`backend/orchestration/`)

- **`core.ts`**: InfinitySoulCore - central orchestrator coordinating all agents

The orchestrator manages:
- Agent initialization and dependency injection
- Workflow execution
- Error handling and recovery
- State management

### 6. Quest System (`backend/services/`)

- **`quest_engine.ts`**: ADHD-friendly daily quest generation and panic mode

Features:
- Daily quest generation based on pipeline state
- Priority-based sorting
- Panic mode (single highest priority task)
- Quest completion tracking
- Category filtering

## API Endpoints

### Cyber Copilot

#### **POST `/api/cyber-copilot`**

Complete pipeline: qualify → assess → generate outreach

**Request:**
```json
{
  "lead_data": {
    "company_name": "Acme Healthcare",
    "industry": "healthcare",
    "revenue": 2000000,
    "employee_count": 25,
    "has_mfa": true,
    "has_edr": false,
    "backup_frequency": "daily",
    "prior_claims": 0
  },
  "niche": "healthcare"  // optional, will auto-detect if not provided
}
```

**Response:**
```json
{
  "status": "ok",
  "niche": "healthcare",
  "lead": {
    "company_name": "Acme Healthcare",
    "normalized_industry": "healthcare",
    ...
  },
  "risk_report": {
    "loss_probability": 0.045,
    "estimated_premium": 8500,
    "recommended_carriers": [
      {
        "carrier_name": "Beazley",
        "min_revenue": 500000,
        "max_revenue": 100000000,
        "weight": 95
      }
    ]
  },
  "coverage_map": {
    "recommended_limits": "2.0M/4.0M",
    "coverages": [
      "HIPAA breach notification and response",
      "Protected Health Information (PHI) exposure",
      ...
    ]
  },
  "discovery_script": "# Discovery Call Script - HEALTHCARE\n\n...",
  "outreach_sequence": {
    "emails": [
      {
        "subject": "Your practice's HIPAA breach risk score",
        "body": "Hi [Name],...",
        "dayOffset": 0,
        "type": "initial"
      },
      ...
    ],
    "cadence": [
      "Day 0: Initial outreach with risk assessment",
      "Day 3: Follow-up on assessment",
      ...
    ]
  }
}
```

#### **POST `/api/cyber-copilot/risk-assessment`**

Quick risk assessment only (no qualification, no outreach):

**Request:**
```json
{
  "client_profile": {
    "revenue": 1000000,
    "employee_count": 15,
    "has_mfa": false,
    "has_edr": false,
    "backup_frequency": "weekly",
    "prior_claims": 1
  },
  "niche": "generic"
}
```

**Response:**
```json
{
  "risk_report": { ... },
  "coverage_map": { ... },
  "recommended_carriers": [ ... ]
}
```

#### **GET `/api/cyber-copilot/intake-questions/:niche`**

Get intake questions for a specific niche:

```
GET /api/cyber-copilot/intake-questions/healthcare
```

**Response:**
```json
{
  "niche": "healthcare",
  "questions": [
    {
      "id": "revenue",
      "text": "Annual revenue",
      "type": "number",
      "required": true,
      "category": "basic"
    },
    {
      "id": "patient_records",
      "text": "Number of patient records stored electronically",
      "type": "number",
      "required": true,
      "category": "basic"
    },
    ...
  ]
}
```

#### **GET `/api/cyber-copilot/context/:niche`**

Get full context for a niche (risk factors, templates, etc.):

```
GET /api/cyber-copilot/context/law_firm
```

#### **POST `/api/cyber-copilot/set-mode`**

Set the active niche mode:

**Request:**
```json
{
  "niche": "healthcare"
}
```

### Quest System

#### **GET `/api/cyber-copilot/quests`**

Get today's quests:

**Response:**
```json
{
  "date": "2025-12-12",
  "quests": [
    {
      "id": "q1",
      "title": "Run cyber risk assessment for Acme Healthcare",
      "description": "Use /cyber_copilot with Acme's intake data...",
      "completed": false,
      "priority": "high",
      "estimated_minutes": 15,
      "category": "assessment"
    }
  ],
  "total": 5,
  "completed": 0
}
```

#### **GET `/api/cyber-copilot/quests/panic`**

Panic mode - returns single highest priority quest:

**Response:**
```json
{
  "panic_mode": true,
  "quest": {
    "id": "q1",
    "title": "Run cyber risk assessment for Acme Healthcare",
    "priority": "critical",
    ...
  },
  "message": "Focus on this one thing. Ignore everything else."
}
```

#### **POST `/api/cyber-copilot/quests/:questId/complete`**

Mark quest as completed.

## Configuration

### Main Config (`config/config.yaml`)

```yaml
app:
  name: "InfinitySoul Cyber Insurance Platform"
  version: "1.0.0"

paths:
  carrier_matrix: "config/carrier_matrix.json"
  contexts_dir: "contexts"
  workflows_dir: "workflows"

defaults:
  niche: "generic"
  min_revenue_threshold: 100000
```

### Carrier Matrix (`config/carrier_matrix.json`)

Defines carrier appetite by industry:

```json
{
  "healthcare": [
    {
      "carrier_name": "Beazley",
      "min_revenue": 500000,
      "max_revenue": 100000000,
      "industries": ["healthcare", "medical"],
      "weight": 95,
      "contact_info": "beazley.com"
    }
  ]
}
```

**To add a carrier:**
1. Add to appropriate industry in `carrier_matrix.json`
2. Set min/max revenue requirements
3. Set weight (higher = better match)

## Risk Calculation Model

### Loss Probability Formula

```
Base = 2%

If revenue > $10M: +1%
If employees > 50: +1%
If no MFA: +1.5%
If no EDR: +1.5%
If backup weekly/monthly: +1%
If backup none: +3%
Per prior claim: +1%

Loss Probability = min(Base + adjustments, 25%)
```

### Premium Estimation

```
Coverage Limit = max(250K, min(revenue, 5M))
Rate = 0.5% + (Loss Probability × 20%)
Premium = Coverage Limit × Rate
```

## Usage Examples

### Example 1: Qualify and assess a healthcare lead

```javascript
const response = await fetch('http://localhost:8000/api/cyber-copilot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    lead_data: {
      company_name: "Dr. Smith Family Practice",
      industry: "healthcare",
      revenue: 1500000,
      employee_count: 12,
      patient_records: 5000,
      hipaa_compliant: true,
      has_mfa: true,
      has_edr: true,
      backup_frequency: "daily",
      prior_claims: 0
    }
  })
});

const result = await response.json();

if (result.status === 'ok') {
  console.log('✅ Qualified!');
  console.log('Niche:', result.niche);
  console.log('Loss Probability:', result.risk_report.loss_probability);
  console.log('Estimated Premium:', result.risk_report.estimated_premium);
  console.log('Recommended Carriers:', result.recommended_carriers.map(c => c.carrier_name));
  console.log('\nFirst Email:');
  console.log(result.outreach_sequence.emails[0]);
} else {
  console.log('❌ Unqualified:', result.reason);
}
```

### Example 2: Build a dynamic intake form

```javascript
// Get questions for healthcare niche
const response = await fetch('http://localhost:8000/api/cyber-copilot/intake-questions/healthcare');
const data = await response.json();

// Build form dynamically
data.questions.forEach(q => {
  const input = document.createElement('input');
  input.type = q.type;
  input.name = q.id;
  input.required = q.required;
  
  const label = document.createElement('label');
  label.textContent = q.text;
  
  form.appendChild(label);
  form.appendChild(input);
});
```

### Example 3: Display today's quests

```javascript
const response = await fetch('http://localhost:8000/api/cyber-copilot/quests');
const data = await response.json();

const questList = document.getElementById('quest-list');
data.quests.forEach(quest => {
  const li = document.createElement('li');
  li.className = `quest priority-${quest.priority}`;
  li.innerHTML = `
    <h4>${quest.title}</h4>
    <p>${quest.description}</p>
    <span class="time">${quest.estimated_minutes} min</span>
    <button onclick="completeQuest('${quest.id}')">Complete</button>
  `;
  questList.appendChild(li);
});
```

## Adding a New Industry Niche

### 1. Create Context File

Create `contexts/new_niche.json`:

```json
{
  "id": "new_niche",
  "name": "Display Name",
  "description": "Industry description",
  "risk_factors": [
    "factor1",
    "factor2"
  ],
  "key_questions": [
    "What is your primary business?"
  ],
  "coverage_priorities": [
    "Coverage type 1",
    "Coverage type 2"
  ],
  "typical_limits": {
    "min": 250000,
    "recommended": 1000000,
    "max": 5000000
  },
  "outreach_templates": {
    "subject_line": "Email subject",
    "opening": "Opening line",
    "pain_points": ["Pain 1", "Pain 2"],
    "cta": "Call to action"
  },
  "discovery_script_focus": [
    "Topic 1",
    "Topic 2"
  ]
}
```

### 2. Add Carriers

Add to `config/carrier_matrix.json`:

```json
{
  "new_niche": [
    {
      "carrier_name": "Example Carrier",
      "min_revenue": 100000,
      "max_revenue": 10000000,
      "industries": ["new_niche"],
      "weight": 90,
      "contact_info": "carrier.com"
    }
  ]
}
```

### 3. Add Questions

Add to `backend/cyber/question_bank.ts`:

```typescript
export const BASE_QUESTIONS_BY_NICHE: Record<string, Question[]> = {
  // ... existing niches ...
  
  new_niche: [
    {
      id: "revenue",
      text: "Annual revenue",
      type: "number",
      required: true,
      category: "basic",
    },
    // ... more questions
  ],
};
```

### 4. Update Qualification Logic (Optional)

If you need custom qualification logic, update `backend/agents/qualification_agent.ts`:

```typescript
private determineNiche(industry: string): string {
  // ... existing logic ...
  
  if (industry.includes("keyword")) {
    return "new_niche";
  }
  
  return "generic";
}
```

## Development

### Run the server

```bash
npm run backend
```

Server runs on port 8000 by default.

### Type checking

```bash
npm run type-check
```

### Building

```bash
npm run build:backend
```

### Testing

```bash
npm test
```

## Architecture Principles

1. **Domain-driven design**: Core business logic isolated in `cyber/` domain layer
2. **Agent specialization**: Each agent has one clear responsibility
3. **Context switching**: Easy to adapt to different industries via JSON configs
4. **Template + LLM hybrid**: Works without LLM (templates), enhanced with it
5. **ADHD-friendly**: Quest system, panic mode, clear next actions, no overwhelming lists
6. **Solo-operator focused**: One-person agency can run the entire pipeline

## Integration Points

### CRM Integration (Stub)

The system is designed to integrate with CRMs. Current stub locations:

- Lead data can be pushed to CRM after qualification
- Quest system can pull from CRM pipeline
- Outreach sequences can trigger CRM workflows

### Calendar Integration (Stub)

- Discovery call booking links
- Follow-up scheduling
- Renewal reminders

### Email Automation (Stub)

- Outreach sequence automation
- Email template population
- Tracking and analytics

## Production Deployment

### Environment Variables

```bash
PORT=8000
NODE_ENV=production
# Add LLM API keys when ready:
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-...
```

### Railway/Vercel Deployment

The system is ready to deploy on Railway or Vercel:

1. Push to GitHub
2. Connect Railway/Vercel
3. Set environment variables
4. Deploy

## Roadmap

### Phase 1 (Complete)
- [x] Domain layer with risk models
- [x] Context system for 4 niches
- [x] Agent layer (5 agents)
- [x] Orchestrator core
- [x] Quest system
- [x] API endpoints
- [x] Workflow definitions

### Phase 2 (Future)
- [ ] LLM integration for dynamic content
- [ ] CRM integration (HubSpot, Pipedrive)
- [ ] Calendar integration (Calendly, Cal.com)
- [ ] Email automation (SendGrid, Mailgun)
- [ ] UI dashboard (cockpit view)
- [ ] Renewal workflow
- [ ] Cross-sell P&C workflow

### Phase 3 (Future)
- [ ] Claims data integration
- [ ] Real-time carrier API integration
- [ ] Advanced analytics
- [ ] ML-based risk scoring
- [ ] Mobile app

## Support & Documentation

- **Main README**: `/README.md`
- **Cyber Scan Module**: `/backend/cyber/README.md` (original scanner)
- **API Docs**: Auto-generated from code
- **Workflow Specs**: `/workflows/*.yaml`

## License

See main repository LICENSE file.
