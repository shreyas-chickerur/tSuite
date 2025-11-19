import { useState } from 'react';
import { api } from '../api/client';
import './TestExecutionForm.css';

interface TestExecutionFormProps {
  onTestStarted: (testRunId: string) => void;
}

interface DiscoveredTest {
  name: string;
  path: string;
  type: 'unit' | 'integration' | 'functional' | 'e2e';
  category: string;
}

interface TestCategory {
  name: string;
  tests: DiscoveredTest[];
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
  const [discoveredTests, setDiscoveredTests] = useState<TestCategory[]>([]);
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
  const [showTestSelection, setShowTestSelection] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [runAllTests, setRunAllTests] = useState(true);

  const discoverTests = async () => {
    setDiscovering(true);
    setError(null);

    // Simulate test discovery (in real implementation, this would call backend)
    setTimeout(() => {
      const demoTests: TestCategory[] = [
        {
          name: 'Authentication',
          tests: [
            { name: 'User Login', path: 'tests/auth/login.test.js', type: 'functional', category: 'Authentication' },
            { name: 'User Registration', path: 'tests/auth/register.test.js', type: 'functional', category: 'Authentication' },
            { name: 'Password Reset', path: 'tests/auth/reset.test.js', type: 'functional', category: 'Authentication' },
            { name: 'JWT Token Validation', path: 'tests/auth/jwt.test.js', type: 'unit', category: 'Authentication' },
          ]
        },
        {
          name: 'API Endpoints',
          tests: [
            { name: 'GET /users', path: 'tests/api/users.test.js', type: 'integration', category: 'API Endpoints' },
            { name: 'POST /users', path: 'tests/api/users-create.test.js', type: 'integration', category: 'API Endpoints' },
            { name: 'PUT /users/:id', path: 'tests/api/users-update.test.js', type: 'integration', category: 'API Endpoints' },
            { name: 'DELETE /users/:id', path: 'tests/api/users-delete.test.js', type: 'integration', category: 'API Endpoints' },
          ]
        },
        {
          name: 'Database',
          tests: [
            { name: 'Connection Pool', path: 'tests/db/connection.test.js', type: 'integration', category: 'Database' },
            { name: 'User Model', path: 'tests/db/user-model.test.js', type: 'unit', category: 'Database' },
            { name: 'Migrations', path: 'tests/db/migrations.test.js', type: 'integration', category: 'Database' },
          ]
        },
        {
          name: 'Utilities',
          tests: [
            { name: 'Email Validator', path: 'tests/utils/email.test.js', type: 'unit', category: 'Utilities' },
            { name: 'Password Hasher', path: 'tests/utils/password.test.js', type: 'unit', category: 'Utilities' },
            { name: 'Date Formatter', path: 'tests/utils/date.test.js', type: 'unit', category: 'Utilities' },
          ]
        },
        {
          name: 'E2E Flows',
          tests: [
            { name: 'Complete User Journey', path: 'tests/e2e/user-journey.test.js', type: 'e2e', category: 'E2E Flows' },
            { name: 'Checkout Process', path: 'tests/e2e/checkout.test.js', type: 'e2e', category: 'E2E Flows' },
          ]
        }
      ];

      setDiscoveredTests(demoTests);
      setShowTestSelection(true);
      setDiscovering(false);

      // Select all tests by default
      const allTestPaths = demoTests.flatMap(cat => cat.tests.map(t => t.path));
      setSelectedTests(new Set(allTestPaths));
    }, 1500);
  };

  const toggleTest = (testPath: string) => {
    const newSelected = new Set(selectedTests);
    if (newSelected.has(testPath)) {
      newSelected.delete(testPath);
    } else {
      newSelected.add(testPath);
    }
    setSelectedTests(newSelected);
  };

  const toggleCategory = (category: TestCategory) => {
    const categoryPaths = category.tests.map(t => t.path);
    const allSelected = categoryPaths.every(path => selectedTests.has(path));
    
    const newSelected = new Set(selectedTests);
    if (allSelected) {
      categoryPaths.forEach(path => newSelected.delete(path));
    } else {
      categoryPaths.forEach(path => newSelected.add(path));
    }
    setSelectedTests(newSelected);
  };

  const selectAllTests = () => {
    const allTestPaths = discoveredTests.flatMap(cat => cat.tests.map(t => t.path));
    setSelectedTests(new Set(allTestPaths));
  };

  const deselectAllTests = () => {
    setSelectedTests(new Set());
  };

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
          <optgroup label="JavaScript/TypeScript">
            <option value="jest">Jest</option>
            <option value="vitest">Vitest</option>
            <option value="mocha">Mocha</option>
            <option value="jasmine">Jasmine</option>
            <option value="ava">Ava</option>
            <option value="karma">Karma</option>
          </optgroup>
          
          <optgroup label="Python">
            <option value="pytest">Pytest</option>
            <option value="unittest">unittest</option>
            <option value="robot">Robot Framework</option>
          </optgroup>
          
          <optgroup label="Java">
            <option value="junit">JUnit</option>
            <option value="testng">TestNG</option>
          </optgroup>
          
          <optgroup label="C#/.NET">
            <option value="nunit">NUnit</option>
            <option value="xunit">xUnit</option>
            <option value="mstest">MSTest</option>
          </optgroup>
          
          <optgroup label="Ruby">
            <option value="rspec">RSpec</option>
            <option value="minitest">Minitest</option>
          </optgroup>
          
          <optgroup label="PHP">
            <option value="phpunit">PHPUnit</option>
            <option value="codeception">Codeception</option>
          </optgroup>
          
          <optgroup label="Go">
            <option value="gotest">Go Test</option>
            <option value="testify">Testify</option>
          </optgroup>
          
          <optgroup label="E2E Testing">
            <option value="cypress">Cypress</option>
            <option value="playwright">Playwright</option>
            <option value="selenium">Selenium</option>
            <option value="puppeteer">Puppeteer</option>
          </optgroup>
          
          <optgroup label="BDD/Acceptance">
            <option value="cucumber">Cucumber</option>
            <option value="behave">Behave (Python)</option>
            <option value="specflow">SpecFlow (.NET)</option>
          </optgroup>
          
          <optgroup label="Performance Testing">
            <option value="k6">K6</option>
            <option value="jmeter">JMeter</option>
            <option value="gatling">Gatling</option>
            <option value="locust">Locust</option>
          </optgroup>
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

      {!showTestSelection && formData.repositoryUrl && (
        <button 
          type="button" 
          onClick={discoverTests} 
          disabled={discovering}
          className="discover-button"
        >
          {discovering && <span className="loading-spinner"></span>}
          {discovering ? 'Discovering Tests...' : 'Discover Available Tests'}
        </button>
      )}

      {showTestSelection && discoveredTests.length > 0 && (
        <div className="test-selection-section">
          <div className="test-selection-header">
            <div className="run-mode-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={runAllTests}
                  onChange={(e) => setRunAllTests(e.target.checked)}
                />
                <span>Run All Tests</span>
              </label>
              {!runAllTests && (
                <span className="selection-count">({selectedTests.size} selected)</span>
              )}
            </div>
            {!runAllTests && (
              <div className="selection-actions">
                <button type="button" onClick={selectAllTests} className="action-link">
                  Select All
                </button>
                <button type="button" onClick={deselectAllTests} className="action-link">
                  Deselect All
                </button>
              </div>
            )}
          </div>

          <div className="test-categories">
            {discoveredTests.map((category, catIndex) => {
              const categoryPaths = category.tests.map(t => t.path);
              const allSelected = categoryPaths.every(path => selectedTests.has(path));
              const someSelected = categoryPaths.some(path => selectedTests.has(path));
              
              return (
                <div key={catIndex} className="test-category">
                  <div className="category-header" onClick={() => toggleCategory(category)}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={input => {
                        if (input) input.indeterminate = someSelected && !allSelected;
                      }}
                      onChange={() => toggleCategory(category)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="category-name">{category.name}</span>
                    <span className="category-count">
                      ({category.tests.filter(t => selectedTests.has(t.path)).length}/{category.tests.length})
                    </span>
                  </div>
                  
                  <div className="category-tests">
                    {category.tests.map((test, testIndex) => (
                      <div 
                        key={testIndex} 
                        className="test-item-select"
                        onClick={() => toggleTest(test.path)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTests.has(test.path)}
                          onChange={() => toggleTest(test.path)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="test-item-info">
                          <span className="test-item-name">{test.name}</span>
                          <span 
                            className="test-type-badge-small"
                            style={{
                              backgroundColor: test.type === 'unit' ? '#3b82f620' :
                                             test.type === 'integration' ? '#8b5cf620' :
                                             test.type === 'functional' ? '#10b98120' : '#f59e0b20',
                              color: test.type === 'unit' ? '#3b82f6' :
                                    test.type === 'integration' ? '#8b5cf6' :
                                    test.type === 'functional' ? '#10b981' : '#f59e0b'
                            }}
                          >
                            {test.type}
                          </span>
                        </div>
                        <span className="test-item-path">{test.path}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <button 
        type="submit" 
        disabled={loading || (showTestSelection && !runAllTests && selectedTests.size === 0)} 
        className="submit-button"
      >
        {loading && <span className="loading-spinner"></span>}
        {loading ? 'Starting Test Run...' : 
         showTestSelection ? 
           (runAllTests ? `Run All ${discoveredTests.reduce((sum, cat) => sum + cat.tests.length, 0)} Tests` : `Run ${selectedTests.size} Selected Test${selectedTests.size !== 1 ? 's' : ''}`) : 
           'Run Tests'}
      </button>
    </form>
  );
}
