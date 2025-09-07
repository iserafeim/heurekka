#!/bin/bash

# ==============================================
# Heurekka Backend - Development Setup Script
# ==============================================
# This script automates the local development environment setup

set -e  # Exit on any error

echo "🚀 Setting up Heurekka Backend Development Environment"
echo "=================================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20 or higher."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version $NODE_VERSION detected. Please upgrade to Node.js 20 or higher."
    exit 1
fi
echo "✅ Node.js $(node --version) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi
echo "✅ npm $(npm --version) detected"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop."
    exit 1
fi
echo "✅ Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1) detected"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed."
    exit 1
fi
echo "✅ Docker Compose $(docker-compose --version | cut -d' ' -f4 | cut -d',' -f1) detected"

echo ""
echo "🔧 Installing dependencies..."
npm install

echo ""
echo "📝 Setting up environment configuration..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo "⚠️  Please update .env with your actual service credentials"
else
    echo "⚠️  .env file already exists, skipping..."
fi

echo ""
echo "🐳 Starting Docker services..."

# Stop any existing containers
echo "Stopping any existing containers..."
docker-compose down --remove-orphans

# Start services
echo "Starting PostgreSQL, Redis, and Elasticsearch..."
docker-compose up -d postgres redis elasticsearch

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."

# Function to wait for service health
wait_for_service() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps --services --filter "status=running" | grep -q "^$service$"; then
            if docker-compose exec -T $service echo "Service check" &> /dev/null; then
                echo "✅ $service is ready"
                return 0
            fi
        fi
        echo "⏳ Waiting for $service... (attempt $attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    echo "❌ $service failed to start after $max_attempts attempts"
    return 1
}

# Wait for each service
wait_for_service postgres
wait_for_service redis
wait_for_service elasticsearch

echo ""
echo "✅ All services are ready!"

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Your development environment is ready. Here's what you can do next:"
echo ""
echo "📝 Configure your environment:"
echo "   Edit .env file with your actual service credentials"
echo ""
echo "🚀 Start development:"
echo "   npm run dev                 # Start backend with hot reload"
echo "   npm run docker:up           # Start everything in Docker"
echo "   npm run local:dev           # Start services + local development"
echo ""
echo "🔗 Service URLs:"
echo "   Backend API:      http://localhost:3001"
echo "   PostgreSQL:       localhost:5432"
echo "   Redis:            localhost:6379"
echo "   Elasticsearch:    http://localhost:9200"
echo ""
echo "🛠️  Admin Tools (optional):"
echo "   npm run docker:tools        # Start Adminer & Redis Commander"
echo "   Adminer:          http://localhost:8080"
echo "   Redis Commander:  http://localhost:8081"
echo ""
echo "📚 More commands:"
echo "   npm run docker:logs         # View backend logs"
echo "   npm run services:down       # Stop services"
echo "   npm run docker:clean        # Clean everything"
echo ""
echo "Happy coding! 🎉"