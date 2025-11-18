# tSuite Test Executor

Python-based test execution service using FastAPI and Celery.

## Features

- **Multi-framework support**: Jest, pytest, Cypress, JUnit, Mocha, RSpec
- **Async execution**: Celery for background job processing
- **Real-time updates**: WebSocket support for live test feedback
- **Containerized execution**: Isolated test environments
- **Result parsing**: Automatic test result parsing and reporting

## Setup

### Prerequisites

- Python 3.11+
- Redis (for Celery)

### Installation

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration

### Development

Start the development server:
```bash
uvicorn app.main:app --reload --port 8000
```

Start Celery worker:
```bash
celery -A app.celery_app worker --loglevel=info
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## API Endpoints

### Health Check
- `GET /health` - Service health check

### Test Execution
- `POST /api/v1/tests/execute` - Execute tests
- `GET /api/v1/tests/{test_run_id}/status` - Get test execution status
- `GET /api/v1/tests/{test_run_id}/results` - Get test results

## Test Frameworks

### Supported Frameworks

- **JavaScript/TypeScript**: Jest, Mocha, Cypress, Playwright
- **Python**: pytest, unittest
- **Java**: JUnit, TestNG
- **Ruby**: RSpec
- **Go**: go test

## Architecture

```
app/
├── __init__.py
├── main.py              # FastAPI application
├── config.py            # Configuration
├── celery_app.py        # Celery configuration
├── routers/             # API routes
│   ├── health.py
│   └── test_execution.py
├── services/            # Business logic
│   ├── test_runner.py
│   └── result_parser.py
└── models/              # Pydantic models
    └── test_models.py
```

## Environment Variables

See `.env.example` for all available configuration options.
