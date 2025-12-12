# Project Aaron: The Sovereign Cloud

**"Google-grade architecture for the next generation of InfinitySoul"**

## What Is This?

This is the **reference architecture** for InfinitySoul - a complete rewrite that separates the **Control Plane** (Next.js dashboard) from the **Compute Plane** (Python agents). This architecture prioritizes:

- ✅ **Type Safety**: TypeScript + Pydantic for bulletproof contracts
- ✅ **Observability**: Auto-generated API docs, health checks, structured logging
- ✅ **Scalability**: FastAPI for async processing, Next.js for SSR/SSG
- ✅ **WCAG Accessibility**: Semantic HTML, proper ARIA labels, keyboard navigation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     AARON OS (Control Plane)                 │
│                  Next.js 14 | TypeScript                     │
│              Void Black + Cyber Turquoise Theme              │
│                    http://localhost:3000                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  XAVIER (Compute Plane)                      │
│               FastAPI Orchestrator | Python 3.11             │
│                    http://localhost:8000                     │
│                        /docs (Swagger UI)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                  ┌───────────┴───────────┐
                  │                       │
                  ▼                       ▼
         ┌────────────────┐      ┌────────────────┐
         │  SCOUT AGENT   │      │  WCAG AGENT    │
         │  (Financial)   │      │   (Lucy)       │
         └────────────────┘      └────────────────┘
```

## Quick Start

### Prerequisites

- **Node.js** 18+
- **Python** 3.11+
- **Docker** (optional, for containerized deployment)

### Option 1: Local Development (Recommended for development)

```bash
# Install dependencies and start everything
./startup.sh

# Services will be available at:
# - Aaron OS Dashboard: http://localhost:3000
# - Xavier API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```

### Option 2: Docker Compose (Recommended for production-like testing)

```bash
# Start all services in containers
./startup.sh --docker

# Or manually:
docker-compose -f docker-compose.aaron.yml up --build
```

### Manual Setup (If you want to run services individually)

**Terminal 1 - Orchestrator (Xavier):**
```bash
cd services/orchestrator
pip install -r ../../requirements.txt
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Dashboard (Aaron OS):**
```bash
cd apps/web
npm install
npm run dev
```

## Repository Structure

```
infinity-soul/
├── apps/
│   ├── web/                    # Next.js 14 (Aaron OS Dashboard)
│   │   ├── app/                # App Router pages
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   ├── layout.tsx      # Root layout
│   │   │   └── page.tsx        # Landing page
│   │   ├── components/         # React components
│   │   │   ├── agent-status.tsx
│   │   │   └── metric-card.tsx
│   │   ├── tailwind.config.ts  # Cyber Turquoise theme
│   │   └── package.json
│   └── docs/                   # Architecture Decision Records
│       └── ADR-001-sovereign-cloud-architecture.md
│
├── services/
│   ├── orchestrator/           # FastAPI (The Brain)
│   │   ├── main.py             # FastAPI app with routes
│   │   ├── Dockerfile          # Production container
│   │   └── requirements.txt    # Python dependencies
│   └── agents/                 # Python Modules
│       ├── __init__.py
│       ├── scout_agent.py      # Financial intel
│       └── wcag_agent.py       # Accessibility auditing
│
├── packages/                   # Shared code (future)
│   ├── ui/                     # Shared UI components
│   └── database/               # Prisma/Postgres schemas
│
├── infrastructure/             # Deployment configs (future)
│   ├── terraform/
│   └── kubernetes/
│
├── docker-compose.aaron.yml    # Local dev environment
├── startup.sh                  # Quick setup script
└── requirements.txt            # Python dependencies
```

## Design System

### Aaron OS - The Aesthetic

**Color Palette:**
- **Void Black**: `#09090b` (background)
- **Surface**: `#18181b` (cards, panels)
- **Cyber Turquoise**: `#00f2ea` (primary accent, glows)
- **Distressed Asset Red**: `#ff3366` (alerts, warnings)

**Typography:**
- **Font**: Geist Mono (monospace, engineering-style)
- **Style**: Minimal, high-contrast, terminal-inspired

**Components:**
- All components support WCAG 2.2 AA
- Semantic HTML5 elements
- Proper ARIA labels
- Keyboard navigation support

## API Endpoints

### Xavier Orchestrator

**Health Check**
```
GET /health
Response: { "status": "operational", "system": "Xavier" }
```

**Trigger Scout Agent**
```
POST /protocol/scan
Body: {
  "sector": "Cyber MGA",
  "max_combined_ratio": 100,
  "min_distress_signal": 0.7
}
Response: [{ "id": "...", "name": "...", ... }]
```

**WCAG Audit**
```
POST /protocol/wcag-audit
Body: { "url": "https://example.com" }
Response: {
  "compliance_score": 0.85,
  "url": "https://example.com",
  "issues": [...]
}
```

**Interactive API Docs**: http://localhost:8000/docs

## Development Workflow

1. **Make changes** to frontend (`apps/web/`) or backend (`services/`)
2. **Hot reload** is enabled for both Next.js and FastAPI
3. **Test endpoints** using the Swagger UI at http://localhost:8000/docs
4. **View dashboard** at http://localhost:3000/dashboard

## Deployment

### Frontend (Aaron OS)
**Platform**: Vercel
```bash
cd apps/web
vercel deploy
```

### Backend (Xavier)
**Platform**: Railway / GCP Cloud Run
```bash
# Railway
railway up

# Or GCP Cloud Run
gcloud run deploy xavier --source services/orchestrator
```

## Next Steps

1. **Connect Dashboard to API**: Make real API calls from Next.js to FastAPI
2. **Implement Real Agents**: Replace stubs with actual financial scraping and WCAG auditing
3. **Add Authentication**: Integrate Clerk or Auth0
4. **Database Integration**: Add PostgreSQL with Prisma
5. **Background Jobs**: Integrate Celery with Redis for async tasks
6. **Monitoring**: Add Sentry, DataDog, or similar

## Contributing

See `apps/docs/ADR-001-sovereign-cloud-architecture.md` for architectural decisions and design rationale.

## License

Proprietary - InfinitySoul Project Aaron

---

**Built with precision. Engineered for scale. Designed for accessibility.**
