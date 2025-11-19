# tSuite - Quick Start Guide

Get tSuite running locally in under 10 minutes!

---

## Prerequisites

Before you begin, make sure you have:

- ✅ **Node.js 20+** - [Download](https://nodejs.org/)
- ✅ **Python 3.11+** - [Download](https://www.python.org/)
- ✅ **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- ✅ **Git** - [Download](https://git-scm.com/)

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/shreyas-chickerur/tSuite.git
cd tSuite
```

---

## Step 2: Start Infrastructure Services

Make sure Docker Desktop is running, then:

```bash
# Start PostgreSQL, Redis, and other services
docker compose up -d

# Wait for services to be ready (about 10-15 seconds)
sleep 15

# Verify services are running
docker compose ps
```

You should see all services with status "Up" or "healthy".

---

## Step 3: Set Up API Gateway

```bash
# Navigate to API Gateway
cd services/api-gateway

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Apply database schema
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > migration.sql
docker exec -i tsuite-postgres psql -U postgres -d tsuite_db < migration.sql

# Start the API Gateway (in a new terminal)
npm run dev
```

The API Gateway will start on **http://localhost:3001**

---

## Step 4: Set Up Test Executor

Open a new terminal:

```bash
cd services/test-executor

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Copy environment file
cp .env.example .env

# Install dependencies
pip install -r requirements.txt

# Start the Test Executor
uvicorn app.main:app --reload --port 8000
```

The Test Executor will start on **http://localhost:8000**

---

## Step 5: Set Up Frontend

Open another new terminal:

```bash
cd services/frontend

# Install dependencies
npm install

# Start the frontend
npm run dev
```

The Frontend will start on **http://localhost:3000**

---

## Step 6: Access the Application

Open your browser and go to:

🌐 **http://localhost:3000**

You should see the tSuite dashboard!

---

## Quick Test

### Test the API Gateway Health Check

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-17T...",
  "uptime": 123.45
}
```

### Test the Test Executor Health Check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-17T...",
  "service": "test-executor",
  "python_version": "3.11.x"
}
```

### Run a Test Execution (Example)

```bash
curl -X POST http://localhost:8000/api/v1/tests/execute \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "demo-project",
    "test_run_id": "test-123",
    "framework": "jest",
    "repository_url": "https://github.com/facebook/jest.git",
    "branch": "main"
  }'
```

---

## All-in-One Setup Script

For convenience, here's a script that does everything:

```bash
#!/bin/bash

# Start infrastructure
docker compose up -d
sleep 15

# Setup API Gateway
cd services/api-gateway
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > migration.sql
docker exec -i tsuite-postgres psql -U postgres -d tsuite_db < migration.sql
cd ../..

# Setup Test Executor
cd services/test-executor
python -m venv venv
source venv/bin/activate
cp .env.example .env
pip install -r requirements.txt
cd ../..

# Setup Frontend
cd services/frontend
npm install
cd ../..

echo "✅ Setup complete!"
echo ""
echo "To start the services:"
echo "1. Terminal 1: cd services/api-gateway && npm run dev"
echo "2. Terminal 2: cd services/test-executor && source venv/bin/activate && uvicorn app.main:app --reload --port 8000"
echo "3. Terminal 3: cd services/frontend && npm run dev"
echo ""
echo "Then open http://localhost:3000"
```

Save this as `setup.sh`, make it executable with `chmod +x setup.sh`, and run it with `./setup.sh`.

---

## Using the Dashboard

### 1. Run Tests

1. Click on the **"Test Execution"** tab
2. Enter a repository URL (e.g., `https://github.com/facebook/jest.git`)
3. Select framework (Jest or pytest)
4. Enter branch name (default: main)
5. Click **"Run Tests"**
6. Watch real-time status updates!

### 2. Run Security Scans

1. Click on the **"Security Scanning"** tab
2. Enter a repository URL
3. Select scanner type:
   - **Dependency** - Scans for vulnerable dependencies
   - **SAST** - Static application security testing
4. Click **"Run Security Scan"**
5. View vulnerabilities and findings!

---

## Troubleshooting

### Port Already in Use

If you see "port already in use" errors:

```bash
# Check what's using the port
lsof -i :3001  # API Gateway
lsof -i :8000  # Test Executor
lsof -i :3000  # Frontend

# Kill the process
kill -9 <PID>
```

### Docker Services Not Starting

```bash
# Stop all services
docker compose down

# Remove volumes (WARNING: deletes data)
docker compose down -v

# Start fresh
docker compose up -d
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker compose ps postgres

# View PostgreSQL logs
docker compose logs postgres

# Restart PostgreSQL
docker compose restart postgres
```

### Python Virtual Environment Issues

```bash
# Remove old venv
rm -rf venv

# Create new venv
python -m venv venv

# Activate and reinstall
source venv/bin/activate
pip install -r requirements.txt
```

---

## Stopping the Application

### Stop Services

Press `Ctrl+C` in each terminal running the services.

### Stop Docker Infrastructure

```bash
docker compose down
```

### Stop Everything and Clean Up

```bash
# Stop all services and remove volumes
docker compose down -v

# Deactivate Python virtual environment
deactivate
```

---

## Development Workflow

### Making Changes

1. **API Gateway** - Changes auto-reload (tsx watch)
2. **Test Executor** - Changes auto-reload (uvicorn --reload)
3. **Frontend** - Changes auto-reload (Vite HMR)

### Running Tests

```bash
# API Gateway tests
cd services/api-gateway
npm test

# Test Executor tests
cd services/test-executor
pytest

# Frontend build
cd services/frontend
npm run build
```

### Viewing Logs

```bash
# Docker services logs
docker compose logs -f

# Specific service logs
docker compose logs -f postgres
docker compose logs -f redis
```

---

## Accessing Additional Services

- **PostgreSQL:** localhost:5432
  - Username: `postgres`
  - Password: `postgres`
  - Database: `tsuite_db`

- **Redis:** localhost:6379

- **Elasticsearch:** http://localhost:9200

- **MinIO Console:** http://localhost:9001
  - Username: `minioadmin`
  - Password: `minioadmin`

- **Prometheus:** http://localhost:9090

- **Grafana:** http://localhost:3002
  - Username: `admin`
  - Password: `admin`

---

## Next Steps

Once you have tSuite running:

1. ✅ Explore the dashboard
2. ✅ Run test executions on your own repositories
3. ✅ Try security scanning
4. ✅ Check out the API documentation at http://localhost:8000/docs
5. ✅ Read the full documentation in `/docs`

---

## Need Help?

- 📖 **Full Setup Guide:** `docs/SETUP_GUIDE.md`
- 🔧 **Infrastructure Guide:** `docs/INFRASTRUCTURE_SETUP.md`
- 📋 **Project Status:** `docs/PROJECT_STATUS_FINAL.md`
- 🐛 **Issues:** Check `docs/CI_CD_FIXES.md` for common problems

---

## Quick Reference

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| API Gateway | http://localhost:3001 | 3001 |
| Test Executor | http://localhost:8000 | 8000 |
| Test Executor Docs | http://localhost:8000/docs | 8000 |
| PostgreSQL | localhost:5432 | 5432 |
| Redis | localhost:6379 | 6379 |
| Elasticsearch | http://localhost:9200 | 9200 |
| MinIO | http://localhost:9001 | 9001 |
| Prometheus | http://localhost:9090 | 9090 |
| Grafana | http://localhost:3002 | 3002 |

---

**You're all set! Enjoy using tSuite! 🚀**
