# tSuite Complete Setup Guide

This guide will help you set up the entire tSuite platform for development.

## Prerequisites

- **Node.js** 20+
- **Python** 3.11+
- **Docker Desktop** (running)
- **Git**

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/shreyas-chickerur/tSuite.git
cd tSuite

# Install all dependencies
npm run setup
```

### 2. Start Infrastructure

```bash
# Start Docker services (PostgreSQL, Redis, etc.)
npm run docker:up

# Wait a few seconds for services to be ready
sleep 10
```

### 3. Set up Database

```bash
cd services/api-gateway

# Copy environment file
cp .env.example .env

# Generate and apply database schema
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > migration.sql
docker exec -i tsuite-postgres psql -U postgres -d tsuite_db < migration.sql

# Generate Prisma client
npx prisma generate

cd ../..
```

### 4. Start Development Servers

```bash
# Start all services
npm run dev
```

This will start:
- **API Gateway** on `http://localhost:3001`
- **Frontend** on `http://localhost:3000`
- **Test Executor** on `http://localhost:8000`

## Individual Service Setup

### API Gateway (Node.js + Express + TypeScript)

```bash
cd services/api-gateway

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

**Endpoints:**
- Health: `http://localhost:3001/health`
- API Docs: `http://localhost:3001/api/v1`

### Test Executor (Python + FastAPI)

```bash
cd services/test-executor

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env

# Start development server
uvicorn app.main:app --reload --port 8000
```

**Endpoints:**
- Health: `http://localhost:8000/health`
- API Docs: `http://localhost:8000/docs`

### Frontend (React + TypeScript + Vite)

```bash
cd services/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Access:** `http://localhost:3000`

## Docker Services

### Available Services

- **PostgreSQL 14**: Port 5432
- **Redis 7**: Port 6379
- **Elasticsearch 8**: Port 9200
- **MinIO**: Port 9000 (API), 9001 (Console)
- **Prometheus**: Port 9090
- **Grafana**: Port 3002

### Docker Commands

```bash
# Start all services
npm run docker:up

# Stop all services
npm run docker:down

# View logs
npm run docker:logs

# Start specific services
docker compose up -d postgres redis

# Check service status
docker compose ps
```

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run specific service tests
npm run test:api
npm run test:frontend
```

### Linting

```bash
# Lint all services
npm run lint

# Lint specific service
cd services/api-gateway && npm run lint
```

### Building

```bash
# Build all services
npm run build

# Build specific service
npm run build:api
npm run build:frontend
```

## Environment Variables

### API Gateway (.env)

```bash
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tsuite_db
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key-change-in-production
CORS_ORIGIN=http://localhost:3000
```

### Test Executor (.env)

```bash
ENVIRONMENT=development
PORT=8000
REDIS_URL=redis://localhost:6379/0
API_GATEWAY_URL=http://localhost:3001
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker compose ps postgres

# View PostgreSQL logs
docker compose logs postgres

# Restart PostgreSQL
docker compose restart postgres
```

### Redis Connection Issues

```bash
# Check if Redis is running
docker compose ps redis

# Test Redis connection
docker exec -it tsuite-redis redis-cli ping
```

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### Prisma Issues

```bash
# Regenerate Prisma client
cd services/api-gateway
rm -rf node_modules/.prisma
npx prisma generate
```

## IDE Setup

### VS Code

Recommended extensions:
- ESLint
- Prettier
- Prisma
- Python
- Docker

### Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter"
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Next Steps

1. Read the [Infrastructure Setup Guide](./INFRASTRUCTURE_SETUP.md)
2. Check the [Development Roadmap](../tSuite%20Development%20Roadmap-1.pdf)
3. Review the [API Documentation](./api.md) (coming soon)
4. Set up your IDE with recommended extensions

## Getting Help

- Check the [README](../README.md)
- Review [GitHub Issues](https://github.com/shreyas-chickerur/tSuite/issues)
- Read the documentation in `/docs`

## Production Deployment

For production deployment instructions, see:
- [Deployment Guide](./deployment.md) (coming soon)
- [Infrastructure Setup Guide](./INFRASTRUCTURE_SETUP.md)
