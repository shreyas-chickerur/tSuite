from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import logging
import asyncio

from app.services.test_runner import get_test_runner

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory storage for test results (replace with Redis/database in production)
test_results_store: Dict[str, Dict[str, Any]] = {}


class TestExecutionRequest(BaseModel):
    project_id: str
    test_run_id: str
    framework: str  # jest, pytest, cypress, etc.
    repository_url: str
    branch: Optional[str] = "main"
    commit: Optional[str] = None
    test_command: Optional[str] = None
    environment_vars: Optional[Dict[str, str]] = {}


class TestExecutionResponse(BaseModel):
    test_run_id: str
    status: str
    message: str


async def run_tests_background(request: TestExecutionRequest):
    """Background task to run tests"""
    try:
        # Update status to running
        test_results_store[request.test_run_id] = {
            "status": "running",
            "progress": 0,
            "started_at": datetime.utcnow().isoformat()
        }
        
        # Get appropriate test runner
        runner = get_test_runner(request.framework)
        
        # Run tests
        results = await runner.run_tests(
            repository_url=request.repository_url,
            branch=request.branch,
            test_command=request.test_command,
            environment_vars=request.environment_vars
        )
        
        # Store results
        test_results_store[request.test_run_id] = {
            "status": "completed" if results.get("success") else "failed",
            "progress": 100,
            "started_at": test_results_store[request.test_run_id]["started_at"],
            "completed_at": datetime.utcnow().isoformat(),
            "results": results
        }
        
        logger.info(f"Test execution completed for {request.test_run_id}")
        
    except Exception as e:
        logger.error(f"Test execution failed: {str(e)}")
        test_results_store[request.test_run_id] = {
            "status": "failed",
            "error": str(e),
            "completed_at": datetime.utcnow().isoformat()
        }


@router.post("/execute", response_model=TestExecutionResponse)
async def execute_tests(
    request: TestExecutionRequest,
    background_tasks: BackgroundTasks
):
    """
    Execute tests for a project
    """
    logger.info(f"Received test execution request for project {request.project_id}")
    
    # Validate framework
    supported_frameworks = ["jest", "pytest"]
    if request.framework.lower() not in supported_frameworks:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported framework: {request.framework}. Supported: {', '.join(supported_frameworks)}"
        )
    
    # Initialize test run status
    test_results_store[request.test_run_id] = {
        "status": "queued",
        "progress": 0,
        "queued_at": datetime.utcnow().isoformat()
    }
    
    # Queue test execution in background
    background_tasks.add_task(run_tests_background, request)
    
    return TestExecutionResponse(
        test_run_id=request.test_run_id,
        status="queued",
        message="Test execution queued successfully"
    )


@router.get("/{test_run_id}/status")
async def get_test_status(test_run_id: str):
    """
    Get the status of a test execution
    """
    if test_run_id not in test_results_store:
        raise HTTPException(status_code=404, detail="Test run not found")
    
    status_data = test_results_store[test_run_id]
    return {
        "test_run_id": test_run_id,
        **status_data
    }


@router.get("/{test_run_id}/results")
async def get_test_results(test_run_id: str):
    """
    Get the results of a completed test execution
    """
    if test_run_id not in test_results_store:
        raise HTTPException(status_code=404, detail="Test run not found")
    
    test_data = test_results_store[test_run_id]
    
    if test_data.get("status") not in ["completed", "failed"]:
        raise HTTPException(
            status_code=400,
            detail=f"Test run is not completed yet. Current status: {test_data.get('status')}"
        )
    
    return {
        "test_run_id": test_run_id,
        **test_data
    }
