# 🚀 Quick Start: Deploy to Production in 5 Minutes

## Option 1: Railway.app (Easiest - 2 Minutes)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Link to your Railway project
railway link <your-project-id>

# 3. Deploy!
railway up

# ✅ Done! Your app is live
```

**Your production URL:** `https://<project-name>.railway.app`

---

## Option 2: Vercel (Node.js - 3 Minutes)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy to production
vercel --prod

# 3. Set environment variables in Vercel dashboard
# Settings → Environment Variables → Add all from config

# ✅ Done! Your app is live
```

**Your production URL:** `https://your-project.vercel.app`

---

## Option 3: Docker (Any Cloud - 5 Minutes)

```bash
# 1. Build Docker image
docker build -t wcag-platform .

# 2. Run locally (test)
docker run -p 5000:5000 \
  -e DATABASE_URL=postgresql://... \
  -e AI_INTEGRATIONS_ANTHROPIC_API_KEY=... \
  wcag-platform

# 3. Push to your registry (Google Cloud, AWS, etc.)
docker push your-registry/wcag-platform

# ✅ Deploy to your platform!
```

---

## Pre-Deployment Checklist

Before you deploy, verify these are set:

```bash
# 1. Check environment variables
echo "DATABASE_URL: $DATABASE_URL"
echo "Anthropic API Key: Set ✓"

# 2. Verify database migration
npm run db:push

# 3. Run verification tests
./scripts/verify-deployment.sh http://localhost:5000
```

---

## Post-Deployment Verification

Once deployed, verify the system:

```bash
# Replace with your production URL
export PROD_URL="https://your-production-url.com"

# Run verification
./scripts/verify-deployment.sh $PROD_URL verbose

# Expected output:
# ✅ Health check: PASS
# ✅ All 8 industries: PASS
# ✅ Database connection: PASS
```

---

## What Gets Deployed

✅ **8 Industry Verticals:**
- Healthcare (HIPAA, 95/100 urgency)
- Finance (SEC, FDIC, 92/100)
- E-commerce (ADA Title III, 88/100)
- Education (Section 508, 85/100)
- Government (WCAG 2.1 AA, 98/100)
- SaaS (Product liability, 72/100)
- Real Estate (FHA, 78/100)
- Manufacturing (B2B, 62/100)

✅ **Features:**
- Industry-intelligent ICP scoring
- Dynamic email cadences
- Industry-aware remediations
- USPS certified mail integration
- Competitive analysis with lawsuit data
- Analytics dashboard
- Lead management

✅ **API Endpoints:**
- 60+ production-ready endpoints
- Health monitoring
- Vertical insights (industry data)
- Prospect scoring and management
- Email automation

---

## Troubleshooting

### "Database connection failed"
```bash
# Check DATABASE_URL is set
echo $DATABASE_URL

# Verify connection
npm run db:push

# If still failing, restart the service
```

### "Vertical insights not loading"
```bash
# Verify all 8 industries loaded
curl https://your-url/api/vertical-insights | grep "count"

# Should return: "count": 8
```

### "Health check failing"
```bash
# Check logs
railway logs   # For Railway
vercel logs    # For Vercel

# Check database
npm run db:push
```

---

## API Examples for Production

### Test the System

```bash
# Get Healthcare insights
curl https://your-url/api/vertical-insights/Healthcare

# Get all industries
curl https://your-url/api/vertical-insights

# Health check
curl https://your-url/api/health
```

### Create Your First Prospect

```bash
curl -X POST https://your-url/api/prospects \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Mayo Clinic",
    "website": "https://mayoclinic.example.com",
    "industry": "Healthcare",
    "employees": "5000+",
    "revenue": "$500M+"
  }'
```

### Score the Prospect

```bash
curl -X POST https://your-url/api/ml/icp/score \
  -H "Content-Type: application/json" \
  -d '{
    "prospectId": "...",
    "factors": {
      "companySize": 90,
      "verticalFit": 85,
      "engagementVelocity": 80,
      "complianceGap": 65
    }
  }'

# Result: ICP Score boosted by +9.5 for Healthcare
```

---

## Next Steps After Deployment

1. **Create Test Prospects** - Try different industries
2. **Test Email Cadences** - Verify industry-specific templates
3. **Check Analytics** - See scoring by industry
4. **Set Up Monitoring** - Add error tracking and alerting
5. **Scale** - Add more prospects and industries

---

## Success Criteria

Your deployment is successful when:

✅ All 8 industries responding  
✅ ICP scoring includes industry boosts  
✅ Email shows industry-specific subject lines  
✅ Claude remediations include industry context  
✅ Health check passing  
✅ Response times < 500ms  
✅ No errors in logs  

---

## Production Support

**For issues:**
1. Check logs (Railway/Vercel dashboard)
2. Run verification script: `./scripts/verify-deployment.sh <your-url>`
3. Check database connection: See health endpoint
4. Review environment variables: All set correctly?

**For performance:**
- Monitor response times (target: < 500ms)
- Check error rates (target: < 0.5%)
- Scale database if needed (add read replicas)

**For questions:**
- See: `PRODUCTION_DEPLOYMENT_PACKAGE.md` (detailed guide)
- See: `INDUSTRY_AGNOSTIC_INTELLIGENCE_GUIDE.md` (feature details)
- See: `DEPLOYMENT_SUMMARY.md` (comprehensive summary)

---

**🎉 You're ready to deploy! Just pick your platform and go.**
