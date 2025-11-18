"""
Test API endpoints
"""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_execute_tests_endpoint():
    """Test test execution endpoint"""
    response = client.post(
        "/api/v1/tests/execute",
        json={
            "project_id": "test-project",
            "test_run_id": "test-run-123",
            "framework": "jest",
            "repository_url": "https://github.com/test/repo.git",
            "branch": "main"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "queued"
    assert data["test_run_id"] == "test-run-123"


def test_execute_tests_invalid_framework():
    """Test test execution with invalid framework"""
    response = client.post(
        "/api/v1/tests/execute",
        json={
            "project_id": "test-project",
            "test_run_id": "test-run-456",
            "framework": "invalid-framework",
            "repository_url": "https://github.com/test/repo.git"
        }
    )
    assert response.status_code == 400


def test_security_scan_endpoint():
    """Test security scan endpoint"""
    response = client.post(
        "/api/v1/security/scan",
        json={
            "project_id": "test-project",
            "scan_id": "scan-123",
            "scanner_type": "dependency",
            "repository_url": "https://github.com/test/repo.git",
            "branch": "main"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "queued"
    assert data["scan_id"] == "scan-123"


def test_security_scan_invalid_scanner():
    """Test security scan with invalid scanner type"""
    response = client.post(
        "/api/v1/security/scan",
        json={
            "project_id": "test-project",
            "scan_id": "scan-456",
            "scanner_type": "invalid-scanner",
            "repository_url": "https://github.com/test/repo.git"
        }
    )
    assert response.status_code == 400
