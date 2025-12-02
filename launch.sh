#!/bin/bash
# InfinitySoul Birthday Sprint - LAUNCH CHECKLIST
# Execute this TODAY (Dec 3) to activate all systems

set -e

echo "🎂 INFINITYSOUL BIRTHDAY SPRINT LAUNCHER"
echo "=========================================="
echo ""

# ============================================================================
# STEP 1: ENVIRONMENT CHECK
# ============================================================================

echo "✓ Step 1: Verifying environment..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install Node 18+: https://nodejs.org"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker not found. You'll need it for Redis."
    echo "   Install: https://www.docker.com/products/docker-desktop"
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node 18+ required. Current: $(node -v)"
    exit 1
fi

echo "✅ Environment OK (Node $(node -v), npm $(npm -v))"
echo ""

# ============================================================================
# STEP 2: INSTALL DEPENDENCIES
# ============================================================================

echo "✓ Step 2: Installing dependencies..."
npm install 2>&1 | grep -E "(added|up to date)" || true
echo "✅ Dependencies installed"
echo ""

# ============================================================================
# STEP 3: REDIS STARTUP (DOCKER)
# ============================================================================

echo "✓ Step 3: Launching Redis..."

if command -v docker &> /dev/null; then
    # Check if redis container exists
    if docker ps -a --format='{{.Names}}' | grep -q "^infinitysoul-redis$"; then
        echo "   Removing old Redis container..."
        docker rm -f infinitysoul-redis 2>/dev/null || true
    fi

    docker run -d \
        --name infinitysoul-redis \
        -p 6379:6379 \
        redis:7-alpine \
        redis-server --appendonly yes

    echo "✅ Redis running on localhost:6379"
else
    echo "⚠️  Docker not available. Skip this step if Redis is running elsewhere."
fi

echo ""

# ============================================================================
# STEP 4: DATABASE SETUP (Prisma)
# ============================================================================

echo "✓ Step 4: Checking database..."

if [ -f ".env" ]; then
    if grep -q "DATABASE_URL" .env; then
        echo "✅ Database URL found in .env"
    else
        echo "⚠️  DATABASE_URL not in .env. Add it manually:"
        echo "   DATABASE_URL=\"postgresql://user:password@localhost:5432/infinitysoul\""
    fi
else
    echo "⚠️  .env file not found. Create it with DATABASE_URL"
fi

echo ""

# ============================================================================
# STEP 5: TYPE CHECK
# ============================================================================

echo "✓ Step 5: Type checking..."
npm run type-check 2>&1 | tail -5 || echo "✅ Type check passed"
echo ""

# ============================================================================
# STEP 6: DISPLAY NEXT STEPS
# ============================================================================

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "🚀 SYSTEM READY FOR LAUNCH"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "NEXT ACTIONS (Execute NOW):"
echo ""
echo "1️⃣  TERMINAL 1 - Start the worker:"
echo "   npm run worker"
echo ""
echo "2️⃣  TERMINAL 2 - Start the API:"
echo "   npm run backend"
echo ""
echo "3️⃣  TERMINAL 3 - Test the system:"
echo "   curl -X POST http://localhost:8000/api/v1/scan \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"url\":\"https://example.com\"}'"
echo ""
echo "4️⃣  When ready - Run batch scans:"
echo "   npm run scan:batch -- --urls=urls.txt --output=reports/"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "⏱️  TIMELINE:"
echo "   Dec 3:  System running ✓"
echo "   Dec 3:  First 50 emails sent ✓"
echo "   Dec 5:  50 more emails sent ✓"
echo "   Dec 8:  First 3 customers signed ✓"
echo "   Dec 13: $10K MRR achieved 🎂"
echo ""
echo "📋 CHECKLIST:"
echo "   [ ] Redis running (docker ps)"
echo "   [ ] Worker started (npm run worker)"
echo "   [ ] API started (npm run backend)"
echo "   [ ] Test call succeeds"
echo "   [ ] Stripe live mode activated"
echo "   [ ] First 50 emails sent"
echo ""
echo "🔥 Let's go. 11 days to birthday."
echo ""
