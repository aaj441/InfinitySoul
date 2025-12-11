# InfinitySoulAIS Deployment Guide v1.2.0

**Quick Reference: For comprehensive deployment documentation, see [InfinitySoul-AIS/docs/DEPLOYMENT.md](InfinitySoul-AIS/docs/DEPLOYMENT.md) (8,800 words)**

---

## Quick Start (5 Minutes)

### Prerequisites
- Node.js 20+
- npm 10+
- (Optional) Supabase account for evidence vault

### Installation

```bash
# Clone repository
git clone https://github.com/aaj441/InfinitySoulAIS.git
cd InfinitySoulAIS/InfinitySoul-AIS

# Install dependencies
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# Configure environment (optional - works with mock data)
cp .env.example .env

# Start the system
npm run dev
```

### Access
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

---

## Deployment Options

### Option 1: Vercel + Railway (Recommended)

**Frontend (Vercel)**:
```bash
cd InfinitySoul-AIS/frontend
vercel --prod
```

**Backend (Railway)**:
```bash
cd InfinitySoul-AIS/backend
railway up
```

### Option 2: Docker

```bash
cd InfinitySoul-AIS
docker-compose up -d
```

### Option 3: Manual Deployment

See the comprehensive guide: [InfinitySoul-AIS/docs/DEPLOYMENT.md](InfinitySoul-AIS/docs/DEPLOYMENT.md)

Covers:
- Vercel deployment (detailed)
- Railway deployment (detailed)
- Docker deployment (Dockerfile provided)
- AWS ECS deployment
- Database setup (Supabase)
- Environment variables
- Health checks
- Monitoring & logging
- Scaling considerations
- Cost estimation

---

## Configuration

### Required Environment Variables (None for MVP Testing!)

The system works with mock data by default. For production:

```env
# Optional - AI API Keys
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key

# Optional - Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_key

# Backend
PORT=3001

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

See [.env.example](.env.example) for complete configuration options.

---

## Verification

### Health Check
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-10T20:00:00.000Z"
}
```

### Test Audit
```bash
curl -X POST http://localhost:3001/api/audit \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'
```

---

## Troubleshooting

### Frontend won't start
- Check Node.js version: `node --version` (should be 20+)
- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Check port 3000 availability

### Backend won't start
- Check port 3001 availability
- Verify all dependencies installed: `cd backend && npm install`
- Check backend logs for errors

### Can't connect frontend to backend
- Verify `NEXT_PUBLIC_API_URL` in `.env`
- Check CORS settings in backend
- Verify both services are running

For detailed troubleshooting, see [InfinitySoul-AIS/docs/DEPLOYMENT.md](InfinitySoul-AIS/docs/DEPLOYMENT.md)

---

## Production Checklist

- [ ] Environment variables configured
- [ ] Supabase database set up (or mock mode accepted)
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Railway
- [ ] Health check endpoint responding
- [ ] Test audit completing successfully
- [ ] HTTPS enabled
- [ ] Monitoring configured (optional)
- [ ] Backup strategy in place (optional)

---

## Support

- **Documentation**: [InfinitySoul-AIS/docs/](InfinitySoul-AIS/docs/)
- **GitHub Issues**: https://github.com/aaj441/InfinitySoulAIS/issues
- **Email**: hello@infinitysoulais.com

---

**InfinitySoulAIS v1.2.0** | **December 2024**
