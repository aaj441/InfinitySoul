# InfinitySol Deployment Guide

**Last Updated:** 2024
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

- **Node.js:** 18.x or higher
- **Python:** 3.10+ (for backend scrapers)
- **PostgreSQL:** 13+ or SQLite for local dev
- **Docker:** (optional, for containerized dev)

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

```bash
# Check health endpoint
curl http://localhost:8000/api/health

# Expected response:
# {"status":"healthy","version":"1.0.0","timestamp":"..."}
```

---

## Part 2: Docker Deployment (Recommended for Self-Hosting)

### Create `docker-compose.yml`

```yaml
version: '3.8'

services:
  # Backend API
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://infinitesol:${DB_PASSWORD}@postgres:5432/infinitesol
      - SQLITE_DB=/data/infinitesol.db
      - USE_MOCK_BLOCKCHAIN=${USE_MOCK_BLOCKCHAIN:-false}
      - POLYGON_RPC_URL=${POLYGON_RPC_URL}
      - WALLET_ADDRESS=${WALLET_ADDRESS}
      - PRIVATE_KEY=${PRIVATE_KEY}
    depends_on:
      - postgres
      - redis
    volumes:
      - ./logs:/app/logs
      - ./data:/data
    networks:
      - infinitesol
    restart: unless-stopped

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: infinitesol
      POSTGRES_USER: infinitesol
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - infinitesol
    restart: unless-stopped

  # Redis (for job queue)
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - infinitesol
    restart: unless-stopped

  # IPFS (for immutable audit storage)
  ipfs:
    image: ipfs/go-ipfs:latest
    ports:
      - "5001:5001"
      - "8080:8080"
    volumes:
      - ipfs_data:/data/ipfs
    environment:
      IPFS_PROFILE: server
    networks:
      - infinitesol
    restart: unless-stopped

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - api
    networks:
      - infinitesol
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  ipfs_data:

networks:
  infinitesol:
    driver: bridge
```

### Create `Dockerfile`

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 make g++ curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

### Deploy with Docker Compose

```bash
# Set environment variables
export DB_PASSWORD=$(openssl rand -base64 32)
export WALLET_ADDRESS=0x...
export PRIVATE_KEY=0x...
export POLYGON_RPC_URL=https://polygon-rpc.com/

# Build and start services
docker-compose up -d --build

# Check logs
docker-compose logs -f api

# Verify deployment
curl http://localhost:8000/api/health
```

---

## Part 3: Production Deployment (AWS EC2/ECS)

### Option A: EC2 with Docker Compose

```bash
# 1. Launch EC2 instance (Ubuntu 22.04 LTS, t3.medium minimum)
# Security group: Allow 80, 443, 22 only

# 2. SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# 3. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo bash get-docker.sh
sudo usermod -aG docker ubuntu

# 4. Clone repository
git clone https://github.com/aaj441/InfinitySol.git
cd InfinitySol

# 5. Create .env from .env.example
# Use AWS Secrets Manager or parameter store for sensitive values

# 6. Deploy with docker-compose
docker-compose -f docker-compose.yml up -d --build

# 7. Configure SSL with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d your-domain.com
```

### Option B: AWS ECS (Fargate)

```bash
# 1. Create ECR repository
aws ecr create-repository --repository-name infinitesol

# 2. Build and push image
docker build -t infinitesol:latest .
docker tag infinitesol:latest ACCOUNT.dkr.ecr.REGION.amazonaws.com/infinitesol:latest
docker push ACCOUNT.dkr.ecr.REGION.amazonaws.com/infinitesol:latest

# 3. Create ECS task definition (ecs-task-definition.json)
# 4. Create ECS service
# 5. Configure Application Load Balancer
# 6. Enable CloudWatch monitoring
```

---

## Part 4: Blockchain Integration

### Deploy Smart Contract to Polygon

```bash
# 1. Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# 2. Create hardhat.config.js
cat > hardhat.config.js << 'EOF'
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.19",
  networks: {
    polygon: {
      url: process.env.POLYGON_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
EOF

# 3. Deploy contract
npx hardhat run scripts/deploy.js --network polygon

# 4. Save contract address to .env
# AUDIT_LOGGER_CONTRACT=0x...
```

### Contract Deployment Script

```javascript
// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  console.log("Deploying AuditLogger contract...");

  const AuditLogger = await hre.ethers.getContractFactory("AuditLogger");
  const contract = await AuditLogger.deploy();

  await contract.deployed();

  console.log("AuditLogger deployed to:", contract.address);
  console.log("\nSave this to .env:");
  console.log(`AUDIT_LOGGER_CONTRACT=${contract.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

---

## Part 5: Database Setup

### PostgreSQL (Production)

```bash
# Create database and user
createdb infinitesol
createuser infinitesol -P

# Run migrations (when available)
npm run db:migrate

# Verify connection
psql -U infinitesol -d infinitesol -h localhost
```

### Initialize Threat Intelligence Database

```bash
npm run scripts -- initialize-db

# This will populate the litigation database with public data
```

---

## Part 6: Security Hardening

### SSL/TLS (Required for Production)

```bash
# Using certbot
sudo certbot certonly --standalone -d your-domain.com

# Update nginx.conf to use certificate
```

### Environment Variables

```bash
# Use AWS Secrets Manager
aws secretsmanager create-secret \
  --name infinitesol/production \
  --secret-string file://secrets.json

# Reference in Docker
docker run --secret infinitesol_production ...
```

### Database Security

```bash
# PostgreSQL
# 1. Strong password (40+ characters)
# 2. Restrict access by IP
# 3. Enable SSL connections
# 4. Regular backups
# 5. Test restore procedures
```

### API Security

```typescript
// In API middleware:
- Rate limiting (100 requests/min per IP)
- CORS restrictions (whitelist known domains)
- Request validation (validate all inputs)
- HTTPS only (no HTTP)
- Security headers (CSP, X-Frame-Options, etc.)
- Audit logging (log all API calls)
```

### UPL Compliance Enforcement

```typescript
// Before any external communication:
- Strip legal conclusions
- Require legal disclaimer
- Verify public data sources
- Log all outbound communication
- Annual UPL training for team
```

---

## Part 7: Monitoring & Logging

### Health Checks

```bash
# Endpoint: /api/health
curl http://localhost:8000/api/health

# Expected: {"status":"healthy","version":"1.0.0"}
```

### Logging

```bash
# View API logs
docker-compose logs -f api

# View database logs
docker-compose logs -f postgres

# For production: Stream to CloudWatch/Datadog
```

### Metrics to Monitor

```
- API response time (target: <200ms)
- Scan success rate (target: >99%)
- Database connection pool (max: 20)
- Memory usage (alert if >80%)
- Disk usage (alert if >90%)
- Error rate (alert if >0.1%)
```

---

## Part 8: Backup & Disaster Recovery

### Database Backups

```bash
# Daily backup script
#!/bin/bash
BACKUP_DATE=$(date +%Y%m%d)
pg_dump -U infinitesol infinitesol | gzip > /backups/infinitesol-$BACKUP_DATE.sql.gz

# Upload to S3
aws s3 cp /backups/infinitesol-$BACKUP_DATE.sql.gz s3://infinitesol-backups/
```

### Test Restore Procedure

```bash
# Monthly: Test recovery from backup
# 1. Restore to staging environment
# 2. Verify data integrity
# 3. Document procedure
# 4. Update runbooks
```

---

## Part 9: Scaling Considerations

### Horizontal Scaling

```
As traffic grows:
- Add more API instances behind load balancer
- Use RDS for managed PostgreSQL
- Cache results in Redis
- Use CDN for static assets (news aggregator UI)
- Offload scanning jobs to queue (Celery/Bull)
```

### Performance Optimization

```
- Index litigation database queries
- Cache industry benchmarks
- Compress blockchain logs
- Lazy-load news feed
- Monitor slow queries
```

---

## Part 10: Troubleshooting

### Common Issues

**Issue: "Cannot connect to PostgreSQL"**
```bash
# Check if postgres is running
docker-compose ps

# Check logs
docker-compose logs postgres

# Verify credentials in .env
```

**Issue: "Blockchain transaction failed"**
```bash
# Check wallet balance (need MATIC for Polygon)
# Check gas price in .env
# Verify RPC URL is accessible
```

**Issue: "Email not sending"**
```bash
# Check SendGrid API key
# Verify email format
# Check logs for errors
```

---

## Verification Checklist

Before going to production:

- [ ] Environment variables configured
- [ ] SSL/TLS certificate installed
- [ ] Database backups working
- [ ] Health check passing
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Logging enabled
- [ ] Monitoring alerts set up
- [ ] UPL compliance review completed
- [ ] Legal disclaimers present
- [ ] Carson Clause signed by all clients
- [ ] Insurance coverage verified
- [ ] Disaster recovery plan documented
- [ ] Team trained on UPL requirements
- [ ] Security audit completed

---

## Support & Maintenance

### Regular Tasks

- **Daily:** Check health dashboard, review error logs
- **Weekly:** Review audit logs, monitor costs
- **Monthly:** Test backups, update threat intelligence
- **Quarterly:** Security audit, UPL compliance review
- **Yearly:** Full penetration test, capacity planning

### Getting Help

- **Technical Issues:** Check GitHub issues or contact support
- **Legal Questions:** Consult your attorney
- **UPL Compliance:** See `/legal/UPL_COMPLIANCE.md`

---

**You're now ready to deploy InfinitySol to production. Remember: Your infrastructure is yours. You control the data. You control the narrative.**

**Next: Configure your first scan and start building the litigation database.**
