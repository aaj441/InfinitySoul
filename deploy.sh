#!/bin/bash

# InfinitySoul Production Deployment Script
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production

set -e  # Exit on error

ENVIRONMENT=${1:-production}
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}InfinitySoul Deployment Script${NC}"
echo -e "${GREEN}Environment: $ENVIRONMENT${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo -e "${YELLOW}Please copy .env.example to .env and fill in your values:${NC}"
    echo "cp .env.example .env"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Error: Docker is not installed${NC}"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Error: Docker Compose is not installed${NC}"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# Use 'docker compose' (v2) if available, otherwise 'docker-compose' (v1)
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo -e "${YELLOW}📋 Pre-deployment checks...${NC}"

# Validate required environment variables
required_vars=(
    "ANTHROPIC_API_KEY"
    "OPENAI_API_KEY"
    "DATABASE_URL"
    "POSTGRES_PASSWORD"
    "REDIS_PASSWORD"
    "JWT_SECRET"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env || grep -q "^${var}=$" .env || grep -q "^${var}=.*your.*" .env; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing or invalid environment variables:${NC}"
    printf '%s\n' "${missing_vars[@]}"
    echo -e "${YELLOW}Please update your .env file${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables validated${NC}\n"

# Pull latest changes (if in git repo)
if [ -d .git ]; then
    echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
    git pull origin $(git branch --show-current) || echo -e "${YELLOW}⚠️  Could not pull latest changes (continuing anyway)${NC}"
    echo ""
fi

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
$DOCKER_COMPOSE down || true
echo ""

# Build images
echo -e "${YELLOW}🔨 Building Docker images...${NC}"
$DOCKER_COMPOSE build --no-cache
echo ""

# Start database first
echo -e "${YELLOW}🗄️  Starting database...${NC}"
$DOCKER_COMPOSE up -d postgres redis
echo "Waiting for database to be ready..."
sleep 10
echo ""

# Run database migrations
echo -e "${YELLOW}🔄 Running database migrations...${NC}"
$DOCKER_COMPOSE run --rm api npx prisma migrate deploy
echo ""

# Generate Prisma client
echo -e "${YELLOW}⚙️  Generating Prisma client...${NC}"
$DOCKER_COMPOSE run --rm api npx prisma generate
echo ""

# Start all services
echo -e "${YELLOW}🚀 Starting all services...${NC}"
$DOCKER_COMPOSE up -d
echo ""

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 15

# Check health
echo -e "${YELLOW}🏥 Health check...${NC}"
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API is healthy${NC}"
else
    echo -e "${RED}❌ API health check failed${NC}"
    echo -e "${YELLOW}Checking logs...${NC}"
    $DOCKER_COMPOSE logs api
    exit 1
fi

# Show running containers
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete! 🎉${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${GREEN}Running containers:${NC}"
$DOCKER_COMPOSE ps

echo ""
echo -e "${GREEN}Service URLs:${NC}"
echo -e "  API:     ${YELLOW}http://localhost:3000${NC}"
echo -e "  Nginx:   ${YELLOW}http://localhost:80${NC}"
echo -e "  Health:  ${YELLOW}http://localhost:3000/health${NC}"

echo ""
echo -e "${GREEN}Useful commands:${NC}"
echo -e "  View logs:           ${YELLOW}$DOCKER_COMPOSE logs -f${NC}"
echo -e "  View API logs:       ${YELLOW}$DOCKER_COMPOSE logs -f api${NC}"
echo -e "  View scanner logs:   ${YELLOW}$DOCKER_COMPOSE logs -f scanner-worker${NC}"
echo -e "  Stop services:       ${YELLOW}$DOCKER_COMPOSE down${NC}"
echo -e "  Restart services:    ${YELLOW}$DOCKER_COMPOSE restart${NC}"
echo -e "  Shell into API:      ${YELLOW}$DOCKER_COMPOSE exec api sh${NC}"

echo ""
echo -e "${GREEN}Next steps:${NC}"
echo -e "  1. Configure your domain DNS to point to this server"
echo -e "  2. Set up SSL certificates (Let's Encrypt recommended)"
echo -e "  3. Update nginx.conf with your domain name"
echo -e "  4. Configure firewall rules (ports 80, 443)"
echo -e "  5. Set up monitoring and alerting"

echo ""
echo -e "${GREEN}========================================${NC}"
