# tSuite

A unified DevSecOps testing platform that consolidates code quality analysis, security scanning, comprehensive testing orchestration, observability, and AI-powered recommendations.

## Overview

tSuite eliminates tool sprawl by providing an all-in-one platform for:
- 🧪 Test execution across multiple frameworks (Jest, pytest, Cypress, JUnit, etc.)
- 🔒 Security scanning (SAST, SCA, secrets detection, container scanning)
- 📊 Code quality analysis and coverage tracking
- 🔍 Observability (logs, metrics, distributed tracing)
- 🤖 AI-powered insights and recommendations
- 📈 Custom dashboards and reporting

## Features

- **Multi-Framework Testing**: Support for Jest, pytest, Cypress, JUnit, Mocha, RSpec, and more
- **Security First**: SAST, SCA, secrets scanning, container security, IaC scanning
- **AI-Powered**: Claude API integration for test failure explanations, code recommendations, and natural language queries
- **Real-Time Updates**: WebSocket-based live test execution feedback
- **Comprehensive Observability**: Centralized logs, metrics, and distributed tracing
- **Quality Gates**: Configurable quality gates to enforce standards
- **Custom Dashboards**: Build and share custom dashboards
- **Enterprise Ready**: SSO, RBAC, audit logging, compliance reporting

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Test Executor**: Python + FastAPI + Celery
- **Database**: PostgreSQL + Prisma ORM
- **Cache/Queue**: Redis
- **Search**: Elasticsearch
- **Storage**: S3/MinIO
- **AI**: Claude API (Anthropic)
- **Monitoring**: Prometheus + Grafana + Jaeger

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker Desktop
- PostgreSQL 15+
- Redis 7+

### Quick Start
```bash
