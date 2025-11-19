import { useState } from 'react';
import { api } from '../api/client';
import './TestExecutionForm.css';

interface TestExecutionFormProps {
  onTestStarted: (testRunId: string) => void;
}

export default function TestExecutionForm({ onTestStarted }: TestExecutionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    projectId: 'demo-project',
    repositoryUrl: '',
    framework: 'jest',
    branch: 'main',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const testRunId = `test-${Date.now()}`;
      
      // Check if this is a demo request
      if (formData.repositoryUrl.toLowerCase().includes('demo') || 
          formData.repositoryUrl.toLowerCase().includes('example')) {
        console.log('Running DEMO test execution with sample results');
        
        // Start the test to show loading state
        onTestStarted(testRunId);
        
        // Store demo results in sessionStorage with a delay to simulate testing
        setTimeout(() => {
          const demoResults = {
            status: 'completed',
            results: {
              success: true,
              total: 15,
              passed: 12,
              failed: 2,
              skipped: 1,
              duration: 3.45,
              tests: [
                { 
                  name: 'User Authentication', 
                  status: 'passed', 
                  duration: 0.234,
                  type: 'unit',
                  logs: ['Initializing auth service', 'Validating credentials', 'Token generated successfully']
                },
                { 
                  name: 'API Endpoint /users', 
                  status: 'passed', 
                  duration: 0.156,
                  type: 'integration',
                  logs: ['Starting API test', 'Sending GET request', 'Response received: 200 OK']
                },
                { 
                  name: 'Database Connection', 
                  status: 'passed', 
                  duration: 0.089,
                  type: 'integration',
                  logs: ['Connecting to database', 'Connection established', 'Query executed successfully']
                },
                { 
                  name: 'Login Validation', 
                  status: 'failed', 
                  duration: 0.445,
                  type: 'functional',
                  error: 'Expected status 200 but got 401',
                  logs: ['Starting login test', 'Sending credentials', 'ERROR: Authentication failed', 'Stack trace: at login.test.js:45']
                },
                { 
                  name: 'Password Hashing', 
                  status: 'passed', 
                  duration: 0.123,
                  type: 'unit',
                  logs: ['Testing bcrypt hash', 'Hash generated', 'Verification successful']
                },
                { 
                  name: 'JWT Token Generation', 
                  status: 'passed', 
                  duration: 0.098,
                  type: 'unit',
                  logs: ['Creating JWT payload', 'Signing token', 'Token validation passed']
                },
                { 
                  name: 'User Registration', 
                  status: 'passed', 
                  duration: 0.267,
                  type: 'functional',
                  logs: ['Testing registration flow', 'User data validated', 'User created successfully', 'Welcome email queued']
                },
                { 
                  name: 'Email Validation', 
                  status: 'passed', 
                  duration: 0.034,
                  type: 'unit',
                  logs: ['Testing email regex', 'Valid email formats accepted', 'Invalid formats rejected']
                },
                { 
                  name: 'Profile Update', 
                  status: 'failed', 
                  duration: 0.389,
                  type: 'integration',
                  error: 'Null reference exception in updateProfile()',
                  logs: ['Fetching user profile', 'Applying updates', 'ERROR: Cannot read property "avatar" of null', 'Stack trace: at profile.service.js:128']
                },
                { 
                  name: 'Session Management', 
                  status: 'passed', 
                  duration: 0.178,
                  type: 'integration',
                  logs: ['Creating session', 'Session stored in Redis', 'Session retrieved successfully']
                },
                { 
                  name: 'Logout Functionality', 
                  status: 'passed', 
                  duration: 0.067,
                  type: 'functional',
                  logs: ['Initiating logout', 'Session invalidated', 'Tokens cleared']
                },
                { 
                  name: 'Password Reset', 
                  status: 'skipped', 
                  duration: 0,
                  type: 'functional',
                  logs: ['Test skipped: Email service not configured']
                },
                { 
                  name: 'Rate Limiting', 
                  status: 'passed', 
                  duration: 0.234,
                  type: 'integration',
                  logs: ['Testing rate limiter', 'Sending 100 requests', 'Rate limit enforced correctly', '429 status returned after threshold']
                },
                { 
                  name: 'CORS Configuration', 
                  status: 'passed', 
                  duration: 0.045,
                  type: 'integration',
                  logs: ['Testing CORS headers', 'Allowed origins verified', 'Preflight requests handled']
                },
                { 
                  name: 'Error Handling', 
                  status: 'passed', 
                  duration: 0.112,
                  type: 'unit',
                  logs: ['Testing error middleware', 'Errors caught correctly', 'Error responses formatted properly']
                }
              ]
            }
          };
          
          sessionStorage.setItem(`test-results-${testRunId}`, JSON.stringify(demoResults));
          window.dispatchEvent(new Event('storage'));
        }, 4000); // 4 second delay to show loading state
        
        setLoading(false);
        return;
      }
      
      console.log('Submitting test execution:', {
        project_id: formData.projectId,
        test_run_id: testRunId,
        framework: formData.framework,
        repository_url: formData.repositoryUrl,
        branch: formData.branch,
      });
      
      const response = await api.executeTests({
        project_id: formData.projectId,
        test_run_id: testRunId,
        framework: formData.framework,
        repository_url: formData.repositoryUrl,
        branch: formData.branch,
      });

      console.log('Test execution response:', response);

      if (response.status === 'queued') {
        onTestStarted(testRunId);
      } else if (response.error) {
        setError(response.error);
      } else {
        setError('Failed to queue test execution. Please check if the Test Executor service is running.');
      }
    } catch (err) {
      console.error('Test execution error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to Test Executor';
      setError(`${errorMessage}. Make sure the Test Executor is running on http://localhost:8000`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="test-form">
      <div className="form-field">
        <label htmlFor="repositoryUrl">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          Repository URL
        </label>
        <input
          id="repositoryUrl"
          type="text"
          placeholder="https://github.com/username/repository.git"
          value={formData.repositoryUrl}
          onChange={(e) => setFormData({ ...formData, repositoryUrl: e.target.value })}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="framework">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM2.04 4.326c.325 1.329 2.532 2.54 3.717 3.19.48.263.793.434.743.484-.08.08-.162.158-.242.234-.416.396-.787.749-.758 1.266.035.634.618.824 1.214 1.017.577.188 1.168.38 1.286.983.082.417-.075.988-.22 1.52-.215.782-.406 1.48.22 1.48 1.5-.5 3.798-3.186 4-5 .138-1.243-2-2-3.5-2.5-.478-.16-.755.081-.99.284-.172.15-.322.279-.51.216-.445-.148-2.5-2.477-2.96-3.174z"/>
          </svg>
          Test Framework
        </label>
        <select
          id="framework"
          value={formData.framework}
          onChange={(e) => setFormData({ ...formData, framework: e.target.value })}
        >
          <option value="jest">Jest (JavaScript/TypeScript)</option>
          <option value="pytest">Pytest (Python)</option>
          <option value="cypress">Cypress (E2E)</option>
          <option value="mocha">Mocha (JavaScript)</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="branch">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M11.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122V6A2.5 2.5 0 0110 8.5H6a1 1 0 00-1 1v1.128a2.251 2.251 0 11-1.5 0V5.372a2.25 2.25 0 111.5 0v1.836A2.492 2.492 0 016 7h4a1 1 0 001-1v-.628A2.25 2.25 0 019.5 3.25zM4.25 12a.75.75 0 100 1.5.75.75 0 000-1.5zM3.5 3.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0z"/>
          </svg>
          Branch
        </label>
        <input
          id="branch"
          type="text"
          placeholder="main"
          value={formData.branch}
          onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" disabled={loading} className="submit-button">
        {loading && <span className="loading-spinner"></span>}
        {loading ? 'Starting Test Run...' : 'Run Tests'}
      </button>
    </form>
  );
}
