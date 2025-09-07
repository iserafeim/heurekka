# Heurekka Backend

A modern Node.js/TypeScript backend API with tRPC, WebSocket support, and real-time capabilities for the Heurekka rental marketplace platform.

## 🚀 Quick Start (Local Development)

Get the application running locally in under 5 minutes:

```bash
# 1. Clone and navigate to the backend directory
cd heurekka-backend

# 2. Install dependencies
npm install

# 3. Set up local environment (creates .env and starts services)
npm run local:setup

# 4. Update environment variables in .env file
# Edit .env with your actual Supabase keys and other service credentials

# 5. Start development server with services
npm run local:dev
```

Your backend will be running at `http://localhost:3001` with hot reloading enabled!

## 📋 Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 9.0.0
- **Docker** and **Docker Compose**
- **Git**

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend    │    │   Services      │
│   (React)       │◄──►│   (tRPC)     │◄──►│   PostgreSQL    │
│   Port: 3000    │    │   Port: 3001 │    │   PostGIS       │
└─────────────────┘    │   WebSocket  │    │   Redis         │
                       └──────────────┘    │   Elasticsearch │
                                          └─────────────────┘
```

### Key Technologies

- **Runtime**: Node.js 20 with TypeScript
- **API Framework**: tRPC for type-safe API calls
- **Real-time**: Socket.IO for WebSocket connections
- **Database**: PostgreSQL 16 with PostGIS extension
- **Cache/Queue**: Redis 7 for caching and job queues
- **Search**: Elasticsearch 8 for full-text search
- **Authentication**: Supabase Auth integration

## 🐳 Docker Development Environment

### Full Stack Setup

Start all services together:

```bash
# Start everything (recommended for full development)
npm run docker:up

# Or start just the backend services
npm run services:up
```

### Individual Service Management

```bash
# Database only
npm run db:setup

# All supporting services (no backend)
npm run services:up

# Admin tools (Adminer + Redis Commander)
npm run docker:tools
```

### Available Services

| Service | URL | Purpose |
|---------|-----|---------|
| Backend API | http://localhost:3001 | Main application |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache/Queue |
| Elasticsearch | http://localhost:9200 | Search engine |
| Adminer | http://localhost:8080 | Database admin |
| Redis Commander | http://localhost:8081 | Redis admin |

## ⚙️ Configuration

### Environment Variables

Copy `.env.example` to `.env` and update the following critical values:

```bash
# Supabase (Required)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# WhatsApp Business API (Optional for messaging features)
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token

# External APIs (Optional)
GOOGLE_MAPS_API_KEY=your-google-maps-key
STRIPE_SECRET_KEY=sk_test_your-stripe-key
```

### Database Setup

The PostgreSQL container automatically:
- Creates the `heurekka_dev` database
- Enables PostGIS extensions for geospatial operations
- Sets up audit logging and application logging schemas
- Creates necessary indexes for performance

## 🔧 Development Workflow

### Starting Development

```bash
# Option 1: Full Docker environment
npm run docker:up

# Option 2: Services in Docker, app locally
npm run services:up
npm run dev

# Option 3: Individual setup
npm run local:setup
npm run local:dev
```

### Common Commands

```bash
# Development
npm run dev              # Start with hot reload
npm run build            # Build for production
npm run type-check       # TypeScript validation
npm run lint             # Code linting
npm run test             # Run tests

# Docker Management
npm run docker:logs      # View backend logs
npm run docker:restart   # Restart backend service
npm run docker:clean     # Clean all containers and volumes

# Database Management
npm run db:reset         # Reset database (lose all data)
npm run services:down    # Stop all services
```

### Hot Reloading

The development setup includes:
- **TypeScript compilation** with `tsx watch`
- **Volume mounting** for instant file changes
- **Nodemon-like behavior** for server restarts
- **Source maps** for debugging

## 🗄️ Database Schema

### Extensions Enabled

- **PostGIS**: Geospatial operations for property locations
- **UUID**: Unique identifier generation
- **pg_trgm & unaccent**: Full-text search capabilities

### Schemas

- **public**: Main application tables
- **audit**: Change tracking and audit logs
- **logs**: Application logging

## 🔍 API Documentation

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/trpc/*` | POST | tRPC API routes |
| WebSocket | WS | Real-time connections |

### tRPC Procedures

The API follows tRPC patterns with type-safe procedures:

```typescript
// Example client usage (from frontend)
const properties = await trpc.property.list.query({
  location: { lat: 40.7128, lng: -74.0060 },
  radius: 10
});
```

## 🧪 Testing

### Running Tests

```bash
npm run test             # Run all tests
npm run test:coverage    # Run with coverage report
```

### Test Structure

- **Unit tests**: Service layer testing
- **Integration tests**: Database and API testing
- **E2E tests**: Full application flow testing

## 🔧 Troubleshooting

### Common Issues

#### Services won't start

```bash
# Check if ports are in use
lsof -i :3001  # Backend
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :9200  # Elasticsearch

# Clean and restart
npm run docker:clean
npm run docker:up
```

#### Database connection errors

```bash
# Reset database
npm run db:reset

# Check database logs
docker-compose logs postgres

# Manual database connection test
docker-compose exec postgres psql -U heurekka -d heurekka_dev
```

#### Hot reload not working

```bash
# Ensure proper volume mounting
docker-compose down
npm run docker:up

# Check file permissions (Mac/Linux)
ls -la src/
```

#### Elasticsearch startup issues

```bash
# Increase Docker memory allocation (Mac)
# Docker Desktop > Settings > Resources > Memory: 4GB+

# Check Elasticsearch logs
docker-compose logs elasticsearch
```

### Performance Tips

1. **Memory**: Allocate at least 4GB to Docker Desktop
2. **Disk**: Use Docker volumes for better performance than bind mounts
3. **Network**: Use Docker's internal networking for service communication
4. **Caching**: Redis is configured for development-appropriate memory limits

### Development Tools

#### Database Administration

- **Adminer**: http://localhost:8080
  - Server: `postgres`
  - Username: `heurekka`
  - Password: `heurekka123`
  - Database: `heurekka_dev`

#### Redis Administration

- **Redis Commander**: http://localhost:8081
  - Automatically connected to local Redis instance

## 📝 Logs and Monitoring

### Log Locations

```bash
# Application logs
npm run docker:logs

# Service logs
docker-compose logs postgres
docker-compose logs redis
docker-compose logs elasticsearch
```

### Health Checks

All services include health checks:
- **Backend**: `/health` endpoint
- **PostgreSQL**: `pg_isready` check
- **Redis**: `redis-cli ping`
- **Elasticsearch**: Cluster health API

## 🚀 Production Deployment

This local development setup prepares you for production deployment with:

- **Multi-stage Dockerfiles** for optimized production builds
- **Security configurations** with non-root users
- **Health check endpoints** for load balancer integration
- **Environment-based configurations** for different deployment stages

For production deployment, see the deployment documentation or CI/CD pipeline configurations.

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes with tests
4. **Run** the full test suite: `npm run test && npm run lint`
5. **Submit** a pull request

## 📄 License

UNLICENSED - Private project for Heurekka Team

---

**Need help?** Check the troubleshooting section above or contact the development team.