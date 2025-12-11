# Infinity Soul AIS - Deployment Guide

## Quick Deploy (5 Minutes)

### Prerequisites
- Node.js 20+ installed
- npm 10+ installed
- Supabase account (optional, mock mode available)
- Git installed

### Step 1: Clone Repository
```bash
git clone https://github.com/aaj441/InfinitySoul.git
cd InfinitySoul/InfinitySoul-AIS
```

### Step 2: Install Dependencies
```bash
# Root level
npm install

# Frontend
cd frontend && npm install && cd ..

# Backend
cd backend && npm install && cd ..
```

### Step 3: Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your keys (optional for testing)
nano .env
```

Minimum configuration for testing:
```env
# Backend will work without these (uses mock data)
OPENAI_API_KEY=optional_key
ANTHROPIC_API_KEY=optional_key
SUPABASE_URL=https://test.supabase.co
SUPABASE_KEY=test_key
```

### Step 4: Run Development Server
```bash
npm run dev
```

This starts:
- Frontend on http://localhost:3000
- Backend on http://localhost:3001

### Step 5: Test
Open http://localhost:3000 and run an audit!

---

## Production Deployment

### Option 1: Vercel + Railway (Recommended)

#### Deploy Frontend to Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy Frontend**
```bash
cd frontend
vercel --prod
```

3. **Configure Environment Variables in Vercel Dashboard**
- Go to your project settings
- Add environment variables:
  - `NEXT_PUBLIC_API_URL` = your Railway backend URL

#### Deploy Backend to Railway

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

2. **Login and Initialize**
```bash
railway login
cd ../backend
railway init
```

3. **Configure Environment Variables**
```bash
railway variables set OPENAI_API_KEY=your_key
railway variables set ANTHROPIC_API_KEY=your_key
railway variables set SUPABASE_URL=your_url
railway variables set SUPABASE_KEY=your_key
railway variables set PORT=3001
```

4. **Deploy**
```bash
railway up
```

5. **Get Backend URL**
```bash
railway domain
```

Update your Vercel frontend environment variable with this URL.

### Option 2: Docker Deployment

#### Create Dockerfiles

**Frontend Dockerfile** (`frontend/Dockerfile`):
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
```

**Backend Dockerfile** (`backend/Dockerfile`):
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

**Docker Compose** (`docker-compose.yml`):
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3001
    depends_on:
      - backend
```

**Deploy**:
```bash
docker-compose up -d
```

### Option 3: AWS ECS

1. **Build and Push Images**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend
cd backend
docker build -t infinity-soul-backend .
docker tag infinity-soul-backend:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/infinity-soul-backend:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/infinity-soul-backend:latest

# Build and push frontend
cd ../frontend
docker build -t infinity-soul-frontend .
docker tag infinity-soul-frontend:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/infinity-soul-frontend:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/infinity-soul-frontend:latest
```

2. **Create ECS Task Definitions** (via AWS Console or CLI)

3. **Configure Load Balancer**

4. **Set up Auto Scaling**

---

## Database Setup (Supabase)

### 1. Create Supabase Project
- Go to https://supabase.com
- Create new project
- Copy URL and anon key

### 2. Create Tables
Run this SQL in Supabase SQL Editor:

```sql
-- Create audits table
CREATE TABLE audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modules JSONB NOT NULL,
  insurance_score JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  vault_id TEXT UNIQUE
);

-- Create index for faster queries
CREATE INDEX idx_audits_url ON audits(url);
CREATE INDEX idx_audits_timestamp ON audits(timestamp DESC);
CREATE INDEX idx_audits_vault_id ON audits(vault_id);

-- Enable Row Level Security
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

-- Create policy for read access
CREATE POLICY "Enable read access for all users" ON audits
  FOR SELECT USING (true);

-- Create policy for insert access
CREATE POLICY "Enable insert access for authenticated users" ON audits
  FOR INSERT WITH CHECK (true);
```

### 3. Update Environment Variables
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

---

## Environment Variables Reference

### Required for Production
```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

### Optional (Enhanced Features)
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
KIMI_API_KEY=your-kimi-key
PA_INSURANCE_LICENSE=your-license-number
```

### Frontend Specific
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

---

## Health Checks

### Backend Health Check
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-10T19:00:00.000Z"
}
```

### Frontend Health Check
Visit http://localhost:3000 - should load the interface

---

## Monitoring & Logging

### Recommended Tools
- **Application Monitoring**: Sentry, DataDog
- **Log Aggregation**: LogRocket, Papertrail
- **Uptime Monitoring**: Pingdom, UptimeRobot
- **Performance**: Vercel Analytics, Railway Metrics

### Set up Sentry (Optional)
```bash
npm install @sentry/node @sentry/react
```

Add to backend:
```javascript
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

---

## Troubleshooting

### Frontend won't connect to backend
- Check NEXT_PUBLIC_API_URL is set correctly
- Verify CORS is enabled in backend
- Check network tab for error details

### Supabase connection fails
- Verify URL and key are correct
- Check Supabase project is not paused
- Confirm RLS policies allow access
- System will fallback to mock mode automatically

### Modules not loading
- Check all npm installs completed successfully
- Verify Node.js version is 20+
- Check console for module path errors

### Performance issues
- Enable caching (Redis integration coming soon)
- Optimize Supabase queries with indexes
- Consider CDN for frontend assets
- Use load balancer for backend

---

## Scaling Considerations

### Horizontal Scaling
- Run multiple backend instances behind load balancer
- Use session-less architecture (stateless API)
- Database connection pooling (Supabase handles this)

### Vertical Scaling
- Upgrade Railway/Vercel plan
- Optimize module execution time
- Implement caching layer

### Database Scaling
- Supabase Pro plan for more connections
- Read replicas for heavy read workloads
- Partition audits table by date

---

## Security Checklist

- [ ] Environment variables not committed to Git
- [ ] CORS configured for specific domains only
- [ ] Rate limiting enabled (TODO)
- [ ] API key rotation schedule established
- [ ] HTTPS enabled on all endpoints
- [ ] Database backups configured
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies regularly updated

---

## Backup & Recovery

### Database Backups (Supabase)
- Automatic daily backups on paid plans
- Manual exports via Supabase dashboard
- Keep local copies of critical audit data

### Code Backups
- Git repository on GitHub
- Tagged releases for stable versions
- Development branch for testing

---

## Cost Estimation

### Free Tier (Testing)
- Vercel: Free
- Railway: $5/month (500 hours)
- Supabase: Free (up to 500MB)
- **Total**: ~$5/month

### Production (Low Traffic)
- Vercel Pro: $20/month
- Railway Pro: $20/month
- Supabase Pro: $25/month
- **Total**: ~$65/month

### Production (High Traffic)
- Vercel Enterprise: Custom
- Railway: Usage-based
- Supabase Team: $599/month
- **Total**: ~$1000+/month

---

**Last Updated**: December 2025  
**Version**: 1.2.0
