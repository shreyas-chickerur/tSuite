from fastapi import APIRouter
from datetime import datetime
import sys

router = APIRouter()

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "test-executor",
        "python_version": sys.version
    }
