# Phase 2: Enhanced Features - Implementation Plan

## Overview
This document outlines the implementation plan for Phase 2 (Enhanced Features) of the tSuite roadmap.

---

## Step 4: Advanced Test Execution

### 4.1 Additional Test Frameworks ⏳ IN PROGRESS

#### Cypress Runner (E2E Testing)
**Status:** Ready to implement
**Implementation:**
```python
class CypressRunner(TestRunner):
    - Clone repository
    - Install npm dependencies
    - Run: npx cypress run --reporter json
    - Parse Cypress JSON output
    - Support for spec files, browser selection
    - Screenshot/video capture on failure
```

**Configuration:**
- Add to `get_test_runner()` factory
- Update API validation to include "cypress"
- Add Cypress-specific environment variables
- Support for parallel execution

#### Mocha Runner
**Status:** Ready to implement
**Implementation:**
```python
class MochaRunner(TestRunner):
    - Clone repository
    - Install npm dependencies
    - Run: npx mocha --reporter json
    - Parse Mocha JSON output
    - Support for test patterns
```

#### JUnit Runner (Java)
**Status:** Planned
**Implementation:**
```python
class JUnitRunner(TestRunner):
    - Clone repository
    - Detect build tool (Maven/Gradle)
    - Run: mvn test or gradle test
    - Parse JUnit XML reports
    - Support for test suites
```

#### RSpec Runner (Ruby)
**Status:** Planned
**Implementation:**
```python
class RSpecRunner(TestRunner):
    - Clone repository
    - Install bundle dependencies
    - Run: bundle exec rspec --format json
    - Parse RSpec JSON output
```

### 4.2 Parallel Test Execution
**Status:** Planned

**Implementation Approach:**
1. **Worker Pool System**
   - Use Celery worker pools
   - Configure max concurrent tests
   - Queue management

2. **Test Splitting**
   - Split test files across workers
   - Load balancing
   - Result aggregation

3. **Resource Management**
   - CPU/memory limits per worker
   - Cleanup between tests
   - Timeout handling

**Code Structure:**
```python
# services/test-executor/app/services/parallel_executor.py
class ParallelTestExecutor:
    async def execute_parallel(self, test_files: List[str], workers: int):
        # Split tests across workers
        # Execute in parallel
        # Aggregate results
```

### 4.3 Test History & Trends
**Status:** Planned

**Database Schema:**
```sql
CREATE TABLE test_history (
    id UUID PRIMARY KEY,
    test_run_id VARCHAR,
    project_id VARCHAR,
    framework VARCHAR,
    total_tests INT,
    passed INT,
    failed INT,
    skipped INT,
    duration FLOAT,
    coverage JSONB,
    executed_at TIMESTAMP,
    commit_sha VARCHAR,
    branch VARCHAR
);

CREATE INDEX idx_test_history_project ON test_history(project_id);
CREATE INDEX idx_test_history_date ON test_history(executed_at);
```

**API Endpoints:**
- `GET /api/v1/tests/history/{project_id}` - Get test history
- `GET /api/v1/tests/trends/{project_id}` - Get trends over time
- `GET /api/v1/tests/compare/{run_id_1}/{run_id_2}` - Compare runs

**Frontend Components:**
- TestHistoryChart - Line chart showing pass/fail trends
- TestDurationChart - Duration trends over time
- TestComparisonView - Side-by-side comparison

### 4.4 Flaky Test Detection
**Status:** Planned

**Implementation:**
```python
class FlakyTestDetector:
    def analyze_test_history(self, test_name: str, runs: int = 10):
        # Get last N runs for this test
        # Calculate pass rate
        # Identify intermittent failures
        # Return flakiness score
```

**Criteria:**
- Test passes < 90% of the time
- Test has alternating pass/fail pattern
- Test fails with different errors

---

## Step 5: Enhanced Security Features

### 5.1 Secret Scanning
**Status:** Planned

**Implementation:**
```python
class SecretScanner(SecurityScanner):
    def __init__(self):
        self.patterns = {
            'aws_key': r'AKIA[0-9A-Z]{16}',
            'github_token': r'ghp_[a-zA-Z0-9]{36}',
            'private_key': r'-----BEGIN (RSA|DSA|EC) PRIVATE KEY-----',
            'api_key': r'api[_-]?key[_-]?[=:]\s*[\'"]?([a-zA-Z0-9_\-]{32,})',
        }
    
    async def scan(self, repository_url: str):
        # Clone repository
        # Scan all files for secret patterns
        # Check git history for leaked secrets
        # Return findings with file/line numbers
```

**Tools Integration:**
- TruffleHog for git history scanning
- GitLeaks for secret detection
- Custom regex patterns

### 5.2 Container Security Scanning
**Status:** Planned

**Implementation:**
```python
class ContainerScanner(SecurityScanner):
    async def scan_dockerfile(self, repository_url: str):
        # Find Dockerfile
        # Scan with Trivy
        # Check for vulnerabilities
        # Best practice violations
    
    async def scan_image(self, image_name: str):
        # Pull image
        # Scan with Trivy/Grype
        # Report vulnerabilities by severity
```

**Tools:**
- Trivy for comprehensive scanning
- Grype for vulnerability detection
- Dockerfile linting

### 5.3 License Compliance
**Status:** Planned

**Implementation:**
```python
class LicenseScanner(SecurityScanner):
    async def scan_dependencies(self, repository_url: str):
        # Detect package managers
        # Extract dependencies
        # Check licenses (npm: license-checker, Python: pip-licenses)
        # Flag incompatible licenses
        # Generate compliance report
```

**License Categories:**
- Permissive (MIT, Apache, BSD)
- Copyleft (GPL, LGPL)
- Proprietary
- Unknown

---

## Step 6: Code Quality & Coverage

### 6.1 Advanced Coverage Visualization
**Status:** Planned

**Database Schema:**
```sql
CREATE TABLE coverage_data (
    id UUID PRIMARY KEY,
    test_run_id VARCHAR,
    file_path VARCHAR,
    line_coverage JSONB,  -- {line_number: hit_count}
    branch_coverage JSONB,
    function_coverage JSONB,
    total_lines INT,
    covered_lines INT,
    coverage_percent FLOAT,
    created_at TIMESTAMP
);
```

**Frontend Components:**
```typescript
// CoverageHeatmap.tsx - Visual file coverage
// CoverageTrends.tsx - Coverage over time
// FileCoverageDetail.tsx - Line-by-line coverage
// BranchCoverageView.tsx - Branch coverage details
```

**Features:**
- Interactive file tree with coverage %
- Line-by-line coverage highlighting
- Uncovered lines identification
- Coverage diff between commits

### 6.2 Quality Metrics Dashboard
**Status:** Planned

**Metrics to Track:**
- Code coverage %
- Test pass rate
- Build success rate
- Security vulnerability count
- Code complexity
- Technical debt
- Duplication

**Implementation:**
```python
class QualityMetricsCollector:
    async def collect_metrics(self, project_id: str):
        return {
            'coverage': await self.get_coverage(),
            'test_pass_rate': await self.get_pass_rate(),
            'vulnerabilities': await self.get_vuln_count(),
            'complexity': await self.analyze_complexity(),
        }
```

---

## Step 7: Quality Gates

### 7.1 Configurable Quality Gates
**Status:** Planned

**Database Schema:**
```sql
CREATE TABLE quality_gates (
    id UUID PRIMARY KEY,
    project_id VARCHAR,
    name VARCHAR,
    enabled BOOLEAN,
    rules JSONB,  -- Array of rule configurations
    created_at TIMESTAMP
);

CREATE TABLE quality_gate_results (
    id UUID PRIMARY KEY,
    test_run_id VARCHAR,
    quality_gate_id UUID,
    passed BOOLEAN,
    failed_rules JSONB,
    executed_at TIMESTAMP
);
```

**Rule Types:**
```json
{
  "coverage_threshold": {
    "type": "coverage",
    "operator": ">=",
    "value": 80,
    "scope": "overall"
  },
  "test_pass_rate": {
    "type": "test_pass_rate",
    "operator": ">=",
    "value": 95
  },
  "max_vulnerabilities": {
    "type": "security",
    "severity": "high",
    "operator": "<=",
    "value": 0
  },
  "max_duration": {
    "type": "performance",
    "operator": "<=",
    "value": 300
  }
}
```

### 7.2 Gate Enforcement
**Status:** Planned

**Implementation:**
```python
class QualityGateEnforcer:
    async def evaluate(self, test_run_id: str, project_id: str):
        gates = await self.get_project_gates(project_id)
        results = await self.get_test_results(test_run_id)
        
        for gate in gates:
            if not gate.enabled:
                continue
            
            passed = await self.evaluate_rules(gate.rules, results)
            await self.record_result(test_run_id, gate.id, passed)
            
            if not passed and gate.blocking:
                raise QualityGateFailure(gate.name)
```

**API Endpoints:**
- `POST /api/v1/quality-gates` - Create gate
- `GET /api/v1/quality-gates/{project_id}` - List gates
- `PUT /api/v1/quality-gates/{gate_id}` - Update gate
- `POST /api/v1/quality-gates/{gate_id}/evaluate` - Evaluate gate

---

## Implementation Priority

### High Priority (Implement First)
1. ✅ Cypress Runner - Most requested E2E framework
2. ✅ Mocha Runner - Common JavaScript framework
3. ⏳ Test History Tracking - Essential for trends
4. ⏳ Secret Scanning - Critical security feature

### Medium Priority
5. ⏳ Advanced Coverage Visualization
6. ⏳ Quality Gates System
7. ⏳ Container Security Scanning

### Lower Priority
8. ⏳ Parallel Test Execution (optimization)
9. ⏳ License Compliance
10. ⏳ Flaky Test Detection

---

## Technical Dependencies

### New Python Packages
```txt
# requirements.txt additions
truffleHog==3.63.0  # Secret scanning
trivy-python==0.1.0  # Container scanning
pip-licenses==4.3.0  # License checking
```

### New Database Tables
- test_history
- coverage_data
- quality_gates
- quality_gate_results
- security_findings

### New API Endpoints
- 12+ new endpoints across test history, quality gates, and enhanced security

---

## Estimated Implementation Time

- **Step 4 (Advanced Test Execution):** 2-3 weeks
- **Step 5 (Enhanced Security):** 2-3 weeks
- **Step 6 (Quality & Coverage):** 2 weeks
- **Step 7 (Quality Gates):** 1-2 weeks

**Total Phase 2:** 7-10 weeks

---

*This plan provides a roadmap for implementing all Phase 2 features systematically.*
