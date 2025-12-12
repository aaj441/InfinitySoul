# Project Aaron: Architecture Visualization

## The Sovereign Cloud - High-Level View

```
┌──────────────────────────────────────────────────────────────────────┐
│                         INFINITY SOUL                                 │
│                    PROJECT AARON v1.0.4                               │
│                    "The Sovereign Cloud"                              │
└──────────────────────────────────────────────────────────────────────┘
                                │
                                │
        ┌───────────────────────┴────────────────────────┐
        │                                                 │
        ▼                                                 ▼
┌────────────────────┐                          ┌──────────────────────┐
│  CONTROL PLANE     │                          │   COMPUTE PLANE      │
│  (Aaron OS)        │                          │   (Xavier)           │
│                    │                          │                      │
│  Next.js 14        │◄────── REST API ────────►│  FastAPI             │
│  TypeScript        │     JSON over HTTP       │  Python 3.11         │
│  Tailwind CSS      │                          │  Pydantic            │
│  Port: 3000        │                          │  Port: 8000          │
└────────────────────┘                          └──────────────────────┘
        │                                                 │
        │                                                 │
        ▼                                                 ▼
┌────────────────────┐                          ┌──────────────────────┐
│   USER INTERFACE   │                          │  AGENT ORCHESTRATION │
│                    │                          │                      │
│  ┌──────────────┐  │                          │  ┌────────────────┐  │
│  │  Dashboard   │  │                          │  │  Scout Agent   │  │
│  │  - Financial │  │                          │  │  (Financial    │  │
│  │  - Biometric │  │                          │  │   Intel)       │  │
│  │  - Deep Work │  │                          │  └────────────────┘  │
│  └──────────────┘  │                          │                      │
│                    │                          │  ┌────────────────┐  │
│  ┌──────────────┐  │                          │  │  WCAG Agent    │  │
│  │  Components  │  │                          │  │  (Lucy)        │  │
│  │  - Cards     │  │                          │  │  Accessibility │  │
│  │  - Badges    │  │                          │  └────────────────┘  │
│  └──────────────┘  │                          │                      │
└────────────────────┘                          └──────────────────────┘
```

## Data Flow

```
┌─────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│  User   │────────►│ Aaron OS │────────►│  Xavier  │────────►│  Agents  │
│ Browser │   UI    │ (Next.js)│   API   │ (FastAPI)│  Calls  │ (Python) │
└─────────┘  Action └──────────┘ Request └──────────┘ Function└──────────┘
                          │                    │                    │
                          │                    │                    │
                          │                    ▼                    │
                          │            ┌──────────────┐             │
                          │            │   Database   │             │
                          │            │  PostgreSQL  │             │
                          │            │   (Future)   │             │
                          │            └──────────────┘             │
                          │                    │                    │
                          │◄───────────────────┴────────────────────┘
                          │              Response
                          ▼
                    ┌──────────┐
                    │  Update  │
                    │ Dashboard│
                    └──────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PRODUCTION                                   │
└─────────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴────────────────┐
                │                                │
                ▼                                ▼
        ┌──────────────┐                 ┌──────────────┐
        │   VERCEL     │                 │   RAILWAY    │
        │              │                 │      or      │
        │  Next.js     │                 │  GCP Cloud   │
        │  Frontend    │                 │     Run      │
        │              │                 │              │
        │  - SSR/SSG   │                 │  FastAPI     │
        │  - CDN       │                 │  Backend     │
        │  - Auto TLS  │                 │              │
        └──────────────┘                 └──────────────┘
                │                                │
                │                                │
                └──────────── HTTPS ─────────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │  PostgreSQL   │
                  │   Database    │
                  │  (Supabase)   │
                  └───────────────┘
```

## Component Hierarchy

```
Aaron OS (apps/web/)
│
├── app/
│   ├── layout.tsx ─────────────────► Root layout (fonts, metadata)
│   ├── page.tsx ───────────────────► Landing page
│   ├── globals.css ────────────────► Global styles
│   │
│   └── dashboard/
│       └── page.tsx ───────────────► Main dashboard
│           │
│           ├── Financial Intel Section
│           │   └── Deal cards
│           │
│           ├── Deep Work Section
│           │   └── Timer display
│           │
│           └── Biometrics Section
│               └── MetricCard components
│
└── components/
    ├── agent-status.tsx ───────────► Agent status badges
    └── metric-card.tsx ────────────► Biometric cards

Xavier (services/)
│
├── orchestrator/
│   └── main.py ────────────────────► FastAPI app
│       │
│       ├── /health ────────────────► Health check
│       ├── /protocol/scan ─────────► Scout trigger
│       └── /protocol/wcag-audit ───► WCAG audit
│
└── agents/
    ├── scout_agent.py ─────────────► Financial intel
    └── wcag_agent.py ──────────────► Accessibility
```

## Development Environment

```
Developer Machine
│
├── Terminal 1 ─────► uvicorn services.orchestrator.main:app
│                     │
│                     └──► http://localhost:8000
│                           │
│                           ├── /docs (Swagger UI)
│                           ├── /health
│                           └── /protocol/*
│
├── Terminal 2 ─────► npm run dev (Next.js)
│                     │
│                     └──► http://localhost:3000
│                           │
│                           ├── /
│                           └── /dashboard
│
└── Browser ────────► View dashboard, test API
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND STACK                           │
├─────────────────────────────────────────────────────────────┤
│  Framework    │  Next.js 14 (App Router)                     │
│  Language     │  TypeScript                                  │
│  Styling      │  Tailwind CSS                                │
│  Font         │  Geist Mono                                  │
│  Build        │  Turbopack (Next.js internal)                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     BACKEND STACK                            │
├─────────────────────────────────────────────────────────────┤
│  Framework    │  FastAPI                                     │
│  Language     │  Python 3.11                                 │
│  Validation   │  Pydantic                                    │
│  Server       │  Uvicorn (ASGI)                              │
│  Tasks        │  Celery + Redis (Future)                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE                             │
├─────────────────────────────────────────────────────────────┤
│  Containers   │  Docker + Docker Compose                     │
│  Frontend     │  Vercel                                      │
│  Backend      │  Railway / GCP Cloud Run                     │
│  Database     │  PostgreSQL (Future)                         │
│  Cache/Queue  │  Redis (Future)                              │
└─────────────────────────────────────────────────────────────┘
```

## Design System

```
┌───────────────────────────────────────────────────────────┐
│              AARON OS DESIGN TOKENS                        │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  COLORS                                                    │
│  ├─ Void Black      #09090b  ███████  Background          │
│  ├─ Surface         #18181b  ███████  Cards/Panels        │
│  ├─ Cyber Turquoise #00f2ea  ███████  Primary/Accents     │
│  └─ Alert Red       #ff3366  ███████  Warnings/Errors     │
│                                                            │
│  TYPOGRAPHY                                                │
│  ├─ Font Family     Geist Mono                            │
│  ├─ Style           Monospace, Terminal-inspired          │
│  └─ Sizes           xs, sm, base, lg, xl, 2xl, 3xl, 4xl   │
│                                                            │
│  SPACING                                                   │
│  ├─ Scale           4px base (tailwind default)           │
│  └─ Gaps            4, 8, 12, 16, 24, 32, 48, 64px        │
│                                                            │
└───────────────────────────────────────────────────────────┘
```

## Request Flow Example

```
1. User clicks "Run WCAG Audit" button
   │
   └──► Browser sends POST request
        │
        └──► http://localhost:3000/api/audit (Next.js API route)
             │
             └──► Forwards to http://localhost:8000/protocol/wcag-audit
                  │
                  └──► FastAPI validates with Pydantic
                       │
                       └──► Calls wcag_agent.audit(url)
                            │
                            ├──► Agent scrapes site
                            ├──► Runs axe-core checks
                            └──► Returns compliance score
                                 │
                                 └──► FastAPI formats response
                                      │
                                      └──► Next.js receives JSON
                                           │
                                           └──► Dashboard updates UI
                                                │
                                                └──► User sees results ✅
```

## Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                          │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: HTTPS/TLS      │  Encrypted transport              │
│  Layer 2: CORS           │  Origin validation                │
│  Layer 3: Rate Limiting  │  DDoS protection (Future)         │
│  Layer 4: Authentication │  Clerk/Auth0 (Future)             │
│  Layer 5: Authorization  │  RBAC (Future)                    │
│  Layer 6: Input Valid.   │  Pydantic models                  │
│  Layer 7: Container      │  Non-root user in Docker          │
└─────────────────────────────────────────────────────────────┘
```

---

**Legend:**
- `─►` Flow direction
- `┌┐└┘` Boxes/containers
- `│` Vertical connection
- `├┤` T-junction
- `▼▲` Arrow indicators

---

**Built with precision. Engineered for scale. Designed for accessibility.**
