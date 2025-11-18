from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import settings
from app.routers import test_execution, health

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="tSuite Test Executor",
    description="Test execution service for tSuite platform",
    version=settings.api_version
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["health"])
app.include_router(
    test_execution.router,
    prefix=f"/api/{settings.api_version}/tests",
    tags=["tests"]
)

@app.on_event("startup")
async def startup_event():
    logger.info(f"Test Executor starting on port {settings.port}")
    logger.info(f"Environment: {settings.environment}")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Test Executor shutting down")
