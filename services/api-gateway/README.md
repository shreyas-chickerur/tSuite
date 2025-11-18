# tSuite API Gateway

The main API server for tSuite platform, built with Node.js, Express, TypeScript, and Prisma.

## Features

- **Authentication**: JWT-based authentication with refresh tokens
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for session management and caching
- **Security**: Helmet, CORS, rate limiting
- **Logging**: Winston for structured logging
- **Validation**: Zod for request validation

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ (or use Docker Compose)
- Redis 7+ (or use Docker Compose)

**Note:** We use PostgreSQL 14 and Prisma 4.16.2 due to compatibility issues between Prisma 5.x and PostgreSQL 15's permission system. This is a known issue in the Prisma ecosystem.

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration

4. Start infrastructure (PostgreSQL, Redis, etc.):
```bash
cd ../..
docker compose up -d postgres redis
```

5. Apply database schema:
```bash
# Generate SQL from Prisma schema
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > migration.sql

# Apply to database
docker exec -i tsuite-postgres psql -U postgres -d tsuite_db < migration.sql

# Generate Prisma client
npm run prisma:generate
```

**Note:** We use `prisma migrate diff` instead of `prisma migrate dev` due to permission issues with Prisma's shadow database feature.

### Development

Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user (requires authentication)

#### Health Check
- `GET /health` - Service health check

## Database Schema

The database includes the following models:
- **User**: User accounts with authentication
- **Organization**: Multi-tenant organizations
- **OrganizationMember**: Organization membership
- **Project**: Projects within organizations
- **ProjectMember**: Project membership
- **TestRun**: Test execution records
- **TestResult**: Individual test results
- **ApiKey**: API keys for programmatic access

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run migrate` - Run database migrations
- `npm run migrate:deploy` - Deploy migrations (production)
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:studio` - Open Prisma Studio

## Environment Variables

See `.env.example` for all available configuration options.

## Architecture

```
src/
├── config/          # Configuration files
│   ├── index.ts     # Main config
│   ├── database.ts  # Prisma setup
│   ├── redis.ts     # Redis setup
│   └── logger.ts    # Winston logger
├── middleware/      # Express middleware
│   ├── auth.ts      # Authentication
│   ├── errorHandler.ts
│   └── validation.ts
├── routes/          # API routes
│   └── auth.routes.ts
├── utils/           # Utility functions
│   ├── jwt.ts
│   └── password.ts
├── app.ts           # Express app setup
└── index.ts         # Server entry point
```
