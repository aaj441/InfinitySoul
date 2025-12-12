# 🚀 Infinity Soul: GitHub Publishing & Infrastructure Guide

**Complete step-by-step guide to publishing and deploying Infinity Soul**

---

## 📋 Table of Contents

1. [GitHub Repository Setup](#github-repository-setup)
2. [GitHub Actions CI/CD](#github-actions-cicd)
3. [Docker Configuration](#docker-configuration)
4. [Terraform AWS Infrastructure](#terraform-aws-infrastructure)
5. [Environment Variables](#environment-variables)
6. [Publishing Checklist](#publishing-checklist)
7. [Secrets Management](#secrets-management)

---

## 1. GitHub Repository Setup

### Step 1: Create GitHub Organization

```bash
# Go to GitHub and create a new organization
https://github.com/organizations/new

Organization name: InfinitySoulHQ
Email: hello@infinitysoul.io
Plan: Free (upgrade later)
```

### Step 2: Create Repository

```bash
# Create new repository
Repository name: InfinitySoul
Description: Life Operating System - 10 AI agents managing your life
Visibility: Public
Initialize: README, .gitignore (Node), License (MIT)
```

### Step 3: Clone and Push

```bash
# Clone the new repository
git clone https://github.com/InfinitySoulHQ/InfinitySoul.git
cd InfinitySoul

# Copy your local code
cp -r ../InfinitySoul-local/* .

# Initial commit
git add .
git commit -m "feat: initial commit - Life OS with 10 agents"
git push origin main
```

### Step 4: Repository Settings

1. **Enable Discussions**: Settings → Features → Discussions
2. **Enable Projects**: Settings → Features → Projects
3. **Branch Protection**: Settings → Branches → Add rule for `main`
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date

---

## 2. GitHub Actions CI/CD

### Workflow: Test (.github/workflows/test.yml)

```yaml
name: Test

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: pgvector/pgvector:pg16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: infinitysoul_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run tests
        run: npm run test:ci
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/infinitysoul_test
          REDIS_URL: redis://localhost:6379
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

### Workflow: Build (.github/workflows/build.yml)

```yaml
name: Build Docker Images

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    
    permissions:
      contents: read
      packages: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
      
      - name: Build and push Backend
        uses: docker/build-push-action@v5
        with:
          context: ./packages/backend
          push: true
          tags: ${{ steps.meta.outputs.tags }}-backend
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Build and push Frontend
        uses: docker/build-push-action@v5
        with:
          context: ./packages/frontend
          push: true
          tags: ${{ steps.meta.outputs.tags }}-frontend
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Build and push Agents
        uses: docker/build-push-action@v5
        with:
          context: ./packages/agents
          push: true
          tags: ${{ steps.meta.outputs.tags }}-agents
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### Workflow: Deploy (.github/workflows/deploy.yml)

```yaml
name: Deploy to AWS

on:
  workflow_run:
    workflows: ["Build Docker Images"]
    types:
      - completed
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      
      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster infinitysoul-production \
            --service infinitysoul-backend \
            --force-new-deployment
          
          aws ecs update-service \
            --cluster infinitysoul-production \
            --service infinitysoul-frontend \
            --force-new-deployment
          
          aws ecs update-service \
            --cluster infinitysoul-production \
            --service infinitysoul-agents \
            --force-new-deployment
      
      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster infinitysoul-production \
            --services infinitysoul-backend infinitysoul-frontend infinitysoul-agents
```

---

## 3. Docker Configuration

### Complete docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./packages/frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3001
      - NEXT_PUBLIC_WS_URL=ws://backend:3001
    depends_on:
      - backend
    networks:
      - infinitysoul-network

  backend:
    build:
      context: ./packages/backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://infinity:soul@postgres:5432/infinitysoul
      - NEO4J_URI=bolt://neo4j:7687
      - NEO4J_USER=neo4j
      - NEO4J_PASSWORD=password
      - REDIS_URL=redis://redis:6379
      - DYNAMODB_ENDPOINT=http://dynamodb:8000
    depends_on:
      - postgres
      - neo4j
      - redis
      - dynamodb
    networks:
      - infinitysoul-network

  agents:
    build:
      context: ./packages/agents
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://infinity:soul@postgres:5432/infinitysoul
      - AGENT_CRON_ENABLED=true
    depends_on:
      - backend
      - postgres
    networks:
      - infinitysoul-network

  postgres:
    image: pgvector/pgvector:pg16
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=infinity
      - POSTGRES_PASSWORD=soul
      - POSTGRES_DB=infinitysoul
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - infinitysoul-network

  neo4j:
    image: neo4j:5.14
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      - NEO4J_AUTH=neo4j/password
      - NEO4J_dbms_memory_pagecache_size=1G
      - NEO4J_dbms_memory_heap_max__size=2G
    volumes:
      - neo4j-data:/data
    networks:
      - infinitysoul-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - infinitysoul-network

  dynamodb:
    image: amazon/dynamodb-local:latest
    ports:
      - "8000:8000"
    command: "-jar DynamoDBLocal.jar -sharedDb -dbPath ./data"
    volumes:
      - dynamodb-data:/home/dynamodblocal/data
    networks:
      - infinitysoul-network

volumes:
  postgres-data:
  neo4j-data:
  redis-data:
  dynamodb-data:

networks:
  infinitysoul-network:
    driver: bridge
```

---

## 4. Terraform AWS Infrastructure

### main.tf

```hcl
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "infinitysoul-terraform-state"
    key    = "production/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "InfinitySoul"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
```

### Quick Deploy Commands

```bash
# Initialize Terraform
cd infrastructure/terraform
terraform init

# Plan deployment
terraform plan -var-file=production.tfvars

# Apply (deploy)
terraform apply -var-file=production.tfvars

# Verify deployment
terraform show
```

---

## 5. Environment Variables

### .env.example

```bash
# Node Environment
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://infinity:soul@localhost:5432/infinitysoul
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
REDIS_URL=redis://localhost:6379

# AWS (for production)
AWS_REGION=us-east-1
DYNAMODB_ENDPOINT=http://localhost:8000

# External APIs
WHOOP_CLIENT_ID=your_whoop_client_id
WHOOP_CLIENT_SECRET=your_whoop_client_secret
OURA_CLIENT_ID=your_oura_client_id
OURA_CLIENT_SECRET=your_oura_client_secret
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
CLAY_API_KEY=your_clay_api_key
OPENAI_API_KEY=sk-your_openai_key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

---

## 6. Publishing Checklist

### Pre-Launch
- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] Docker Compose working locally
- [ ] All tests passing
- [ ] Code linted and formatted
- [ ] Documentation complete
- [ ] Security audit passed

### GitHub Setup
- [ ] Repository created
- [ ] Branch protection enabled
- [ ] Secrets configured
- [ ] GitHub Actions working
- [ ] Docker images building
- [ ] Releases configured

### Infrastructure
- [ ] AWS account set up
- [ ] Terraform state bucket created
- [ ] Infrastructure deployed
- [ ] DNS configured
- [ ] SSL certificates issued
- [ ] Monitoring enabled

### Launch
- [ ] Production deployment successful
- [ ] Health checks passing
- [ ] Monitoring dashboards active
- [ ] Backup strategy implemented
- [ ] Rollback plan tested

---

## 7. Secrets Management

### GitHub Secrets

Required secrets in Settings → Secrets and variables → Actions:

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
DATABASE_URL
NEO4J_PASSWORD
WHOOP_CLIENT_SECRET
OURA_CLIENT_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
CLAY_API_KEY
OPENAI_API_KEY
```

### AWS Secrets Manager

```bash
# Store secrets in AWS
aws secretsmanager create-secret \
  --name infinitysoul/production/database \
  --secret-string '{"username":"infinity","password":"soul"}'

# Retrieve secrets
aws secretsmanager get-secret-value \
  --secret-id infinitysoul/production/database
```

---

## 🚀 Quick Start Commands

```bash
# Local Development
docker-compose up -d
npm run dev

# Build for Production
npm run build
docker-compose -f docker-compose.prod.yml build

# Deploy to AWS
terraform apply -var-file=production.tfvars
npm run deploy:production

# Monitor Deployment
npm run logs:production
npm run metrics
```

---

**Your infrastructure is ready. Time to deploy. 🚀**

**InfinitySoul v1.0.0** | **December 2024**
