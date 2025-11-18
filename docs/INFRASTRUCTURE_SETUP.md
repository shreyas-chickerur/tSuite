# tSuite Infrastructure Setup Guide

## Overview

This document outlines the infrastructure setup for tSuite, including compatibility notes and workarounds for known issues.

## Technology Stack

### Core Services
- **API Gateway**: Node.js 20+ with Express and TypeScript
- **Database**: PostgreSQL 14 (Alpine)
- **Cache/Queue**: Redis 7 (Alpine)
- **ORM**: Prisma 4.16.2
- **Search**: Elasticsearch 8.11.0
- **Storage**: MinIO (S3-compatible)
- **Monitoring**: Prometheus + Grafana

## Known Compatibility Issues

### Prisma 5.x + PostgreSQL 15 Permission Issue

**Issue**: Prisma 5.x has a known bug with PostgreSQL 15's updated permission system, causing `P1010: User was denied access on the database` errors even when the user has proper permissions.

**Root Cause**: PostgreSQL 15 changed the default schema ownership model. Prisma's shadow database feature and permission checking don't handle this correctly.

**Solution**: We use:
- **PostgreSQL 14** instead of 15
- **Prisma 4.16.2** instead of 5.x
- **postgres superuser** for development (create dedicated user for production)
- Manual schema application using `prisma migrate diff`

### Docker Compose Version Warning

**Issue**: `version` attribute in docker-compose.yml is obsolete in newer Docker Compose versions.

**Solution**: The warning is harmless. The `version: '3.8'` line can be removed in future updates, but keeping it maintains backward compatibility.

## Docker Services Configuration

### PostgreSQL

```yaml
postgres:
  image: postgres:14-alpine  # Using 14 instead of 15
  environment:
    POSTGRES_USER: postgres  # Superuser for development
    POSTGRES_PASSWORD: postgres
    POSTGRES_DB: tsuite_db
  ports:
    - "5432:5432"
```

**Production Recommendations**:
- Create a dedicated database user with limited permissions
- Use strong passwords
- Enable SSL connections
- Configure pg_hba.conf for proper access control

### Redis

```yaml
redis:
  image: redis:7-alpine
  command: redis-server --appendonly yes  # Enable persistence
  ports:
    - "6379:6379"
```

**Production Recommendations**:
- Enable password authentication
- Configure maxmemory and eviction policies
- Enable RDB and AOF persistence
- Use Redis Sentinel or Cluster for high availability

## Database Schema Management

### Development Workflow

1. **Generate Migration SQL**:
```bash
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > migration.sql
```

2. **Apply to Database**:
```bash
docker exec -i tsuite-postgres psql -U postgres -d tsuite_db < migration.sql
```

3. **Generate Prisma Client**:
```bash
npx prisma generate
```

### Why Not Use `prisma migrate dev`?

The standard `prisma migrate dev` command fails due to:
1. Shadow database permission issues
2. Prisma's introspection requiring elevated permissions
3. PostgreSQL 14/15 permission model changes

Our approach bypasses these issues by:
- Generating SQL directly from the schema
- Applying it manually with proper credentials
- Avoiding Prisma's shadow database feature

## Environment Configuration

### Development (.env)

```bash
# Database - using superuser for development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tsuite_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Production Recommendations

1. **Database**:
   - Create dedicated user: `CREATE USER tsuite_app WITH PASSWORD 'strong_password';`
   - Grant specific permissions: `GRANT ALL ON DATABASE tsuite_db TO tsuite_app;`
   - Use connection pooling (PgBouncer)

2. **Secrets**:
   - Use environment-specific secrets
   - Never commit .env files
   - Use secret management tools (AWS Secrets Manager, HashiCorp Vault)

3. **Security**:
   - Enable SSL/TLS for all connections
   - Use strong JWT secrets (32+ characters, random)
   - Configure rate limiting appropriately
   - Enable CORS only for trusted origins

## Starting the Infrastructure

### Full Stack

```bash
# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### Individual Services

```bash
# Start only database and cache
docker compose up -d postgres redis

# Start monitoring stack
docker compose up -d prometheus grafana
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker compose ps postgres

# View PostgreSQL logs
docker compose logs postgres

# Test connection
docker exec -it tsuite-postgres psql -U postgres -d tsuite_db -c "SELECT version();"
```

### Redis Connection Issues

```bash
# Check if Redis is running
docker compose ps redis

# Test connection
docker exec -it tsuite-redis redis-cli ping
```

### Permission Errors

If you encounter permission errors:

1. Verify database user has proper permissions:
```sql
-- Connect as postgres
\c tsuite_db
\du  -- List users and roles
\dn+ -- List schemas with permissions
```

2. Grant necessary permissions:
```sql
GRANT ALL ON SCHEMA public TO your_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO your_user;
```

## Monitoring and Health Checks

### Health Check Endpoints

- **API Gateway**: `http://localhost:3001/health`
- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3002` (admin/admin)

### Docker Health Checks

All services have health checks configured:

```bash
# View health status
docker compose ps

# HEALTHY status indicates service is ready
```

## Backup and Recovery

### Database Backup

```bash
# Backup
docker exec tsuite-postgres pg_dump -U postgres tsuite_db > backup.sql

# Restore
docker exec -i tsuite-postgres psql -U postgres -d tsuite_db < backup.sql
```

### Redis Backup

```bash
# Trigger save
docker exec tsuite-redis redis-cli SAVE

# Copy RDB file
docker cp tsuite-redis:/data/dump.rdb ./redis-backup.rdb
```

## Scaling Considerations

### Horizontal Scaling

- **API Gateway**: Stateless, can scale horizontally behind load balancer
- **Redis**: Use Redis Cluster or Sentinel for HA
- **PostgreSQL**: Use read replicas for read-heavy workloads

### Vertical Scaling

Adjust resource limits in docker-compose.yml:

```yaml
services:
  postgres:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
```

## Migration to Production

### Checklist

- [ ] Replace postgres superuser with dedicated application user
- [ ] Enable SSL/TLS for all connections
- [ ] Configure proper backup strategy
- [ ] Set up monitoring and alerting
- [ ] Configure log aggregation
- [ ] Enable authentication on Redis
- [ ] Use managed database services (optional)
- [ ] Set up CI/CD pipeline
- [ ] Configure secrets management
- [ ] Enable rate limiting and DDoS protection

## References

- [Prisma PostgreSQL 15 Issue](https://github.com/prisma/prisma/issues/16485)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL 14 Documentation](https://www.postgresql.org/docs/14/)
- [Redis Documentation](https://redis.io/documentation)
