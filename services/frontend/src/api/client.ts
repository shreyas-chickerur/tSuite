// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const TEST_EXECUTOR_URL = import.meta.env.VITE_TEST_EXECUTOR_URL || 'http://localhost:8000';

export interface TestExecutionRequest {
  project_id: string;
  test_run_id: string;
  framework: string;
  repository_url: string;
  branch?: string;
  test_command?: string;
  environment_vars?: Record<string, string>;
}

export interface SecurityScanRequest {
  project_id: string;
  scan_id: string;
  scanner_type: string;
  repository_url: string;
  branch?: string;
}

export const api = {
  // Test Execution
  async executeTests(request: TestExecutionRequest) {
    const response = await fetch(`${TEST_EXECUTOR_URL}/api/v1/tests/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return response.json();
  },

  async getTestStatus(testRunId: string) {
    const response = await fetch(`${TEST_EXECUTOR_URL}/api/v1/tests/${testRunId}/status`);
    return response.json();
  },

  async getTestResults(testRunId: string) {
    const response = await fetch(`${TEST_EXECUTOR_URL}/api/v1/tests/${testRunId}/results`);
    return response.json();
  },

  // Security Scanning
  async runSecurityScan(request: SecurityScanRequest) {
    const response = await fetch(`${TEST_EXECUTOR_URL}/api/v1/security/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return response.json();
  },

  async getScanStatus(scanId: string) {
    const response = await fetch(`${TEST_EXECUTOR_URL}/api/v1/security/${scanId}/status`);
    return response.json();
  },

  async getScanResults(scanId: string) {
    const response = await fetch(`${TEST_EXECUTOR_URL}/api/v1/security/${scanId}/results`);
    return response.json();
  },

  // Health Check
  async healthCheck() {
    const response = await fetch(`${TEST_EXECUTOR_URL}/health`);
    return response.json();
  },
};
