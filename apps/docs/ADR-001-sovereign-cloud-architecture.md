# ADR 001: Project Aaron - The Sovereign Cloud Architecture

## Status
Accepted

## Context
InfinitySoul was growing organically with mixed TypeScript services, Python scripts, and client-side code without clear architectural boundaries. To meet "Google-grade" standards for Type Safety, Observability, Scalability, and WCAG Accessibility, we needed a clean separation between the Control Plane (user interface) and Compute Plane (background agents).

## Decision
We adopt **"The Sovereign Cloud"** architecture, a monorepo structure that separates concerns into:

### Control Plane (Aaron OS)
- **Technology**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Location**: `apps/web/`
- **Purpose**: High-performance dashboard for monitoring agents, visualizing data, and controlling the system
- **Design System**: "Void Black" (#09090b) background with "Cyber Turquoise" (#00f2ea) accents
- **Accessibility**: Full WCAG 2.2 AA compliance with semantic HTML

### Compute Plane (Xavier)
- **Technology**: Python 3.11, FastAPI, Pydantic, Celery (future)
- **Location**: `services/orchestrator/` and `services/agents/`
- **Purpose**: Heavy computational tasks, web scraping, data processing, async workflows
- **Agents**:
  - **Scout**: Financial intelligence and distressed asset discovery
  - **Lucy (WCAG)**: Web accessibility auditing
  - More agents as needed

### Monorepo Structure
```
infinity-soul/
├── apps/
│   ├── web/                 # Next.js 14 (Aaron OS Dashboard)
│   └── docs/                # Architecture Decision Records
├── services/
│   ├── orchestrator/        # FastAPI (Xavier)
│   └── agents/              # Python Modules (Scout, WCAG)
├── packages/
│   ├── ui/                  # Shared UI components
│   └── database/            # Prisma/Postgres schemas
└── infrastructure/          # Terraform/Docker
```

## Consequences

### Positive
1. **Clear Separation of Concerns**: Frontend and backend can be deployed independently
2. **Type Safety**: TypeScript for frontend, Pydantic for backend ensures contract safety
3. **Scalability**: FastAPI handles async operations efficiently; Next.js provides SSR/SSG
4. **Developer Experience**: Auto-generated API docs (Swagger), hot reload, modern tooling
5. **Deployment Flexibility**: 
   - Frontend → Vercel
   - Backend → Railway/GCP Cloud Run
   - Agents → Background workers with Celery
6. **Accessibility First**: Semantic HTML and WCAG compliance baked into the design system

### Negative
1. **Initial Setup Complexity**: Requires Docker, Node.js, and Python environments
2. **Learning Curve**: Team needs familiarity with FastAPI, Next.js App Router, and monorepo patterns
3. **Deployment Coordination**: Multiple services need orchestration (mitigated by Docker Compose)

### Neutral
1. **Code Migration Required**: Existing services need gradual migration to new structure
2. **Shared Code Strategy**: Need to define what goes in `packages/` vs service-specific code

## Implementation Notes

### Phase 1: Foundation (Current)
- [x] Create monorepo structure
- [x] Implement Aaron OS dashboard with Cyber Turquoise theme
- [x] Build FastAPI orchestrator with health checks
- [x] Create agent stubs (Scout, WCAG)
- [x] Docker containerization
- [x] Local development setup with startup.sh

### Phase 2: Integration (Next)
- [ ] Connect dashboard to orchestrator API
- [ ] Implement real Scout agent (financial data scraping)
- [ ] Implement real WCAG agent (axe-core integration)
- [ ] Add Celery for async task queue
- [ ] PostgreSQL integration for data persistence

### Phase 3: Production (Future)
- [ ] Deploy frontend to Vercel
- [ ] Deploy orchestrator to Railway/GCP
- [ ] Set up monitoring (Sentry, DataDog)
- [ ] Implement authentication (Clerk)
- [ ] Add rate limiting and API keys

## References
- Next.js 14 App Router: https://nextjs.org/docs
- FastAPI: https://fastapi.tiangolo.com/
- WCAG 2.2: https://www.w3.org/WAI/WCAG22/quickref/
- Google SRE Book: https://sre.google/books/

## Date
2024-12-12

## Author
Project Aaron Team
