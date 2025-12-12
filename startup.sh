#!/bin/bash
# startup.sh - Quick setup script for Project Aaron: The Sovereign Cloud

set -e

echo "🚀 Project Aaron: The Sovereign Cloud"
echo "======================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

echo ""
echo "📦 Installing Next.js dependencies..."
cd apps/web
npm install
cd ../..

echo ""
echo "🎨 Building Tailwind CSS..."
cd apps/web
npm run build || true  # Don't fail if build doesn't work yet
cd ../..

echo ""
echo "🔥 Starting services..."
echo ""
echo "  • Aaron OS Dashboard: http://localhost:3000"
echo "  • Xavier Orchestrator API: http://localhost:8000"
echo "  • API Documentation: http://localhost:8000/docs"
echo ""

# Option 1: Run with Docker Compose
if [ "$1" == "--docker" ]; then
    echo "🐳 Starting with Docker Compose..."
    docker-compose -f docker-compose.aaron.yml up --build
else
    # Option 2: Run locally (development mode)
    echo "💻 Starting in local development mode..."
    echo "   (Use --docker flag to run with Docker instead)"
    echo ""
    
    # Start the orchestrator in the background
    echo "Starting Xavier Orchestrator..."
    cd services/orchestrator
    uvicorn main:app --reload --port 8000 &
    ORCHESTRATOR_PID=$!
    cd ../..
    
    # Start Next.js
    echo "Starting Aaron OS Dashboard..."
    cd apps/web
    npm run dev &
    WEB_PID=$!
    cd ../..
    
    # Trap to clean up background processes on exit
    trap "echo ''; echo '🛑 Shutting down...'; kill $ORCHESTRATOR_PID $WEB_PID 2>/dev/null; exit" INT TERM
    
    echo ""
    echo "✅ Services are running!"
    echo "   Press Ctrl+C to stop all services"
    echo ""
    
    # Wait for processes
    wait
fi
