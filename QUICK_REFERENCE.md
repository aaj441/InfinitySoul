# Project Aaron - Quick Reference Guide

## 🚀 Quick Start Commands

### Start Everything (Local Development)
```bash
./startup.sh
```

### Start with Docker
```bash
./startup.sh --docker
```

### Manual Start
```bash
# Terminal 1: FastAPI Orchestrator
cd services/orchestrator
uvicorn main:app --reload --port 8000

# Terminal 2: Next.js Dashboard
cd apps/web
npm install
npm run dev
```

## 📍 Service URLs

- **Aaron OS Dashboard**: http://localhost:3000
- **Dashboard View**: http://localhost:3000/dashboard
- **Xavier API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🏗️ Architecture at a Glance

```
Control Plane          Compute Plane
(Next.js 14)          (FastAPI + Python)
     │                      │
     │  REST API            │
     └──────────────────────┘
            │
     ┌──────┴──────┐
     │             │
  Scout Agent   WCAG Agent
  (Financial)   (Lucy)
```

## 📁 Key Files & Locations

### Frontend (Control Plane)
- **Main Dashboard**: `apps/web/app/dashboard/page.tsx`
- **Landing Page**: `apps/web/app/page.tsx`
- **Layout**: `apps/web/app/layout.tsx`
- **Theme Config**: `apps/web/tailwind.config.ts`
- **Components**: `apps/web/components/`
  - `agent-status.tsx` - Status badges for agents
  - `metric-card.tsx` - Biometric/metric display cards

### Backend (Compute Plane)
- **Main API**: `services/orchestrator/main.py`
- **Agents**: `services/agents/`
  - `scout_agent.py` - Financial intelligence
  - `wcag_agent.py` - Accessibility auditing (Lucy)

### Infrastructure
- **Docker**: `services/orchestrator/Dockerfile`
- **Compose**: `docker-compose.aaron.yml`
- **Startup**: `startup.sh`

### Documentation
- **Architecture**: `apps/docs/ADR-001-sovereign-cloud-architecture.md`
- **Full Guide**: `AARON_OS_README.md`
- **This File**: `QUICK_REFERENCE.md`

## 🎨 Design System

### Colors
```css
--void-black: #09090b      /* Background */
--surface: #18181b          /* Cards/Panels */
--cyber-turquoise: #00f2ea  /* Primary/Accents */
--alert-red: #ff3366        /* Warnings/Errors */
```

### Typography
- **Font**: Geist Mono (monospace)
- **Style**: Terminal-inspired, high contrast

## 🔌 API Endpoints

### Health Check
```bash
GET /health
# Response: {"status": "operational", "system": "Xavier"}
```

### Scan for Acquisition Targets
```bash
POST /protocol/scan
Content-Type: application/json

{
  "sector": "Cyber MGA",
  "max_combined_ratio": 100,
  "min_distress_signal": 0.7
}
```

### WCAG Audit
```bash
POST /protocol/wcag-audit
Content-Type: application/json

{
  "url": "https://example.com"
}

# Response:
# {
#   "compliance_score": 0.85,
#   "url": "https://example.com",
#   "issues": ["Missing alt text...", "..."]
# }
```

### Test with curl
```bash
# Health check
curl http://localhost:8000/health

# WCAG audit
curl -X POST http://localhost:8000/protocol/wcag-audit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## 🐍 Python Dependencies

### Required
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.3
dnspython==2.4.2
```

### Install
```bash
pip install -r requirements.txt
```

## ⚡ Development Tips

1. **Hot Reload**: Both Next.js and FastAPI support hot reload
2. **API Testing**: Use Swagger UI at `/docs` for interactive testing
3. **Type Safety**: TypeScript on frontend, Pydantic on backend
4. **WCAG Compliance**: All components use semantic HTML and ARIA labels

## 🔧 Common Tasks

### Add a New Agent
1. Create `services/agents/new_agent.py`
2. Add to `services/agents/__init__.py`
3. Import in `services/orchestrator/main.py`
4. Add endpoint in main.py

### Add a New Dashboard View
1. Create `apps/web/app/your-view/page.tsx`
2. Use components from `apps/web/components/`
3. Follow Cyber Turquoise theme

### Update Design Tokens
1. Edit `apps/web/tailwind.config.ts`
2. Colors and fonts defined in `extend` section

## 📦 Project Structure

```
infinity-soul/
├── apps/
│   ├── web/                 # Aaron OS Dashboard
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # React components
│   │   └── tailwind.config.ts
│   └── docs/                # ADRs
│
├── services/
│   ├── orchestrator/        # FastAPI brain
│   │   ├── main.py          # API routes
│   │   └── Dockerfile
│   └── agents/              # Python agents
│       ├── scout_agent.py
│       └── wcag_agent.py
│
├── packages/                # Shared (future)
├── infrastructure/          # Deploy (future)
│
├── startup.sh               # Quick start
├── docker-compose.aaron.yml # Container setup
└── requirements.txt         # Python deps
```

## 🚢 Deployment

### Frontend → Vercel
```bash
cd apps/web
vercel deploy
```

### Backend → Railway
```bash
railway up
# Or link the services/orchestrator directory
```

### Backend → GCP Cloud Run
```bash
gcloud run deploy xavier \
  --source services/orchestrator \
  --region us-central1
```

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Dependencies Not Found
```bash
# Python
pip install -r requirements.txt

# Node.js
cd apps/web && npm install
```

### Import Errors in Python
```bash
# Make sure you're running from root
cd /path/to/infinity-soul
python -m uvicorn services.orchestrator.main:app
```

## 📚 Further Reading

- **Full Documentation**: `AARON_OS_README.md`
- **Architecture Decision**: `apps/docs/ADR-001-sovereign-cloud-architecture.md`
- **Next.js Docs**: https://nextjs.org/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com/

---

**Built with precision. Engineered for scale. Designed for accessibility.**
