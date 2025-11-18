from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import logging

from app.services.security_scanner import get_security_scanner

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory storage for scan results
scan_results_store: Dict[str, Dict[str, Any]] = {}


class SecurityScanRequest(BaseModel):
    project_id: str
    scan_id: str
    scanner_type: str  # dependency, sast, secrets
    repository_url: str
    branch: Optional[str] = "main"


class SecurityScanResponse(BaseModel):
    scan_id: str
    status: str
    message: str


async def run_security_scan_background(request: SecurityScanRequest):
    """Background task to run security scan"""
    try:
        # Update status to running
        scan_results_store[request.scan_id] = {
            "status": "running",
            "scanner_type": request.scanner_type,
            "started_at": datetime.utcnow().isoformat()
        }
        
        # Get appropriate scanner
        scanner = get_security_scanner(request.scanner_type)
        
        # Run scan
        results = await scanner.scan(
            repository_url=request.repository_url,
            branch=request.branch
        )
        
        # Store results
        scan_results_store[request.scan_id] = {
            "status": "completed" if results.get("success") else "failed",
            "scanner_type": request.scanner_type,
            "started_at": scan_results_store[request.scan_id]["started_at"],
            "completed_at": datetime.utcnow().isoformat(),
            "results": results
        }
        
        logger.info(f"Security scan completed for {request.scan_id}")
        
    except Exception as e:
        logger.error(f"Security scan failed: {str(e)}")
        scan_results_store[request.scan_id] = {
            "status": "failed",
            "error": str(e),
            "completed_at": datetime.utcnow().isoformat()
        }


@router.post("/scan", response_model=SecurityScanResponse)
async def run_security_scan(
    request: SecurityScanRequest,
    background_tasks: BackgroundTasks
):
    """
    Run a security scan
    """
    logger.info(f"Received security scan request for project {request.project_id}")
    
    # Validate scanner type
    supported_scanners = ["dependency", "sast"]
    if request.scanner_type.lower() not in supported_scanners:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported scanner: {request.scanner_type}. Supported: {', '.join(supported_scanners)}"
        )
    
    # Initialize scan status
    scan_results_store[request.scan_id] = {
        "status": "queued",
        "scanner_type": request.scanner_type,
        "queued_at": datetime.utcnow().isoformat()
    }
    
    # Queue scan in background
    background_tasks.add_task(run_security_scan_background, request)
    
    return SecurityScanResponse(
        scan_id=request.scan_id,
        status="queued",
        message=f"{request.scanner_type} scan queued successfully"
    )


@router.get("/{scan_id}/status")
async def get_scan_status(scan_id: str):
    """Get the status of a security scan"""
    if scan_id not in scan_results_store:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    scan_data = scan_results_store[scan_id]
    return {
        "scan_id": scan_id,
        **scan_data
    }


@router.get("/{scan_id}/results")
async def get_scan_results(scan_id: str):
    """Get the results of a completed security scan"""
    if scan_id not in scan_results_store:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    scan_data = scan_results_store[scan_id]
    
    if scan_data.get("status") not in ["completed", "failed"]:
        raise HTTPException(
            status_code=400,
            detail=f"Scan is not completed yet. Current status: {scan_data.get('status')}"
        )
    
    return {
        "scan_id": scan_id,
        **scan_data
    }
