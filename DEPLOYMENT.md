# InfinitySol Deployment Guide
**Last Updated: 2024**
**Status:** Production-Ready Architecture (Simplified Implementation)

---

## Overview
InfinitySol is an accessibility compliance platform designed for **self-hosted deployment on your own infrastructure**. This guide covers:

1. **Local Development Setup**
2. **Docker Deployment**
3. **Production Deployment (AWS/GCP)**
4. **Blockchain Integration** (Polygon)
5. **Database Setup**
6. **Security Hardening**

---

## Part 1: Local Development
### Requirements
**Node.js: 18.x or higher**
**Python: 3.10+ (for backend scrapers)**
**PostgreSQL: 13+ or SQLite for local dev**
**Docker: (optional, for containerized dev)**

### Quick Start (5 minutes)
```bash
# 1. Clone repository
git clone https://github.com/aaj441/InfinitySol.git
cd InfinitySol
# 2. Copy environment file
cp .env.example .env
# 3. Install dependencies
npm install
# 4. For development without blockchain:
# Edit .env:
# USE_MOCK_BLOCKCHAIN=true
# USE_MOCK_EMAIL=true
# 5. Run tests
npm run type-check
# 6. Start dev server
npm run dev
# Server will be available at http://localhost:8000
```

### Verification

---

## Part 2: Vercel Deployment (Recommended for Frontend)

InfinitySoul can be deployed to Vercel for rapid frontend hosting. Backend/API must be deployed separately (see Docker/Production sections).

### Vercel Setup
1. **Clone the repository** (if not already):
   ```bash
   git clone https://github.com/aaj441/InfinitySoul.git
   cd InfinitySoul
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   - Copy `.env.example` to `.env` and set required values for frontend.
4. **Configure Vercel:**
   - Ensure `vercel.json` exists in the repo root with the following:
     ```json
     {
       "buildCommand": "cd frontend && npm install && npm run build",
       "outputDirectory": "frontend/out",
       "devCommand": "cd frontend && npm run dev"
     }
     ```
   - Set up your Vercel project to use these settings.
5. **Deploy:**
   - Push changes to GitHub. Vercel will auto-deploy if connected.

### Build/Dev Commands
- **Install:** `npm install`
- **Build:** `cd frontend && npm run build`
- **Dev:** `cd frontend && npm run dev`
- **Output Directory:** `frontend/out`

### Notes
- Only the frontend is deployed on Vercel. Backend/API must be deployed separately (see Docker/Production sections).
- For full-stack deployment, use Docker or cloud VM as described below.

---

## Part 3: Docker Deployment
... (rest of file unchanged)
