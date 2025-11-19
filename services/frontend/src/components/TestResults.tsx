import { useState, useEffect } from 'react';
import { api } from '../api/client';
import './TestResults.css';

interface TestResultsProps {
  testRunId: string;
}

interface TestStatus {
  status: string;
  progress?: number;
  [key: string]: unknown;
}

interface TestResults {
  status: string;
  results?: {
    total_tests?: number;
    passed?: number;
    failed?: number;
    skipped?: number;
    duration?: number;
    coverage?: Record<string, unknown>;
  };
  error?: string;
  [key: string]: unknown;
}

export default function TestResults({ testRunId }: TestResultsProps) {
  const [status, setStatus] = useState<TestStatus | null>(null);
  const [results, setResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed' | 'skipped'>('all');

  useEffect(() => {
    console.log('Starting to poll test results for:', testRunId);
    
    // Check for demo results first
    const demoData = sessionStorage.getItem(`test-results-${testRunId}`);
    if (demoData) {
      console.log('Loading DEMO test results');
      const demoResults = JSON.parse(demoData);
      setResults(demoResults);
      setStatus({ status: 'completed' });
      setLoading(false);
      return;
    }
    
    // Poll for demo results every 500ms
    const demoInterval = window.setInterval(() => {
      const data = sessionStorage.getItem(`test-results-${testRunId}`);
      if (data) {
        console.log('Demo results appeared, loading...');
        const demoResults = JSON.parse(data);
        setResults(demoResults);
        setStatus({ status: 'completed' });
        setLoading(false);
        clearInterval(demoInterval);
        clearInterval(interval);
      }
    }, 500);
    
    const interval = window.setInterval(async () => {
      try {
        const statusData = await api.getTestStatus(testRunId);
        console.log('Test status update:', statusData);
        setStatus(statusData);

        if (statusData.status === 'completed' || statusData.status === 'failed') {
          console.log('Test finished, fetching results...');
          const resultsData = await api.getTestResults(testRunId);
          console.log('Test results:', resultsData);
          setResults(resultsData);
          setLoading(false);
          clearInterval(interval);
          clearInterval(demoInterval);
        }
      } catch (error) {
        console.error('Error polling test status:', error);
      }
    }, 2000);

    return () => {
      console.log('Cleaning up polling for:', testRunId);
      clearInterval(interval);
      clearInterval(demoInterval);
    };
  }, [testRunId]);

  if (loading) {
    return (
      <div className="results-loading">
        <div className="spinner"></div>
        <p className="status-text">Status: {status?.status || 'queued'}</p>
        {status?.progress !== undefined && <p className="progress-text">Progress: {status.progress}%</p>}
      </div>
    );
  }

  if (!results) return null;

  console.log('Rendering results:', results);
  console.log('Test data:', results.results);
  
  const { results: testData } = results;
  
  // Extract error from various possible locations
  // The backend stores error in results.results.error
  const errorMessage = (testData as { error?: string })?.error ||
                      results.error || 
                      (results as { message?: string })?.message ||
                      JSON.stringify(results, null, 2);

  // Show error prominently if test failed
  if (results.status === 'failed' || results.error || (testData as { error?: string })?.error) {
    console.log('Showing error state. Error message:', errorMessage);
    
    return (
      <div className="test-results">
        <div className="error-banner">
          <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
          <div className="error-content">
            <h3>Test Execution Failed</h3>
            <p>The test run encountered an error. Please review the details below and fix the issues.</p>
          </div>
        </div>

        <div className="error-details">
          <h4>Error Details:</h4>
          <pre className="error-message">{errorMessage}</pre>
          <div className="error-actions">
            <button className="action-btn" onClick={() => navigator.clipboard.writeText(errorMessage)}>
              Copy Error
            </button>
            <button className="action-btn" onClick={() => console.log('Full results object:', results)}>
              Log Full Response
            </button>
          </div>
        </div>

        {testData && (
          <div className="results-summary">
            <h4>Test Summary:</h4>
            <div className="metrics">
              <div className="metric">
                <span className="metric-label">Total</span>
                <span className="metric-value">{testData?.total_tests || 0}</span>
              </div>
              <div className="metric passed">
                <span className="metric-label">Passed</span>
                <span className="metric-value">{testData?.passed || 0}</span>
              </div>
              <div className="metric failed">
                <span className="metric-label">Failed</span>
                <span className="metric-value">{testData?.failed || 0}</span>
              </div>
              <div className="metric skipped">
                <span className="metric-label">Skipped</span>
                <span className="metric-value">{testData?.skipped || 0}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Get test list and apply filter
  const testList = (testData as { tests?: Array<{ name: string; status: string; duration: number; error?: string }> })?.tests || [];
  const filteredTests = filter === 'all' 
    ? testList 
    : testList.filter(test => test.status === filter);

  // Calculate total from actual data
  const totalTests = (testData as { total?: number })?.total || testList.length || 0;
  const passedTests = (testData as { passed?: number })?.passed || 0;
  const failedTests = (testData as { failed?: number })?.failed || 0;
  const skippedTests = (testData as { skipped?: number })?.skipped || 0;

  // Show successful results
  return (
    <div className="test-results">
      <div className="success-banner">
        <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
        </svg>
        <div className="success-content">
          <h3>Tests Completed Successfully</h3>
          <p>All tests have been executed. Review the results below.</p>
        </div>
      </div>

      <div className="results-summary">
        <div className="metrics">
          <div 
            className={`metric ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
            style={{ cursor: 'pointer' }}
            title="Click to show all tests"
          >
            <span className="metric-label">Total</span>
            <span className="metric-value">{totalTests}</span>
          </div>
          <div 
            className={`metric passed ${filter === 'passed' ? 'active' : ''}`}
            onClick={() => setFilter('passed')}
            style={{ cursor: 'pointer' }}
            title="Click to show only passed tests"
          >
            <span className="metric-label">Passed</span>
            <span className="metric-value">{passedTests}</span>
          </div>
          <div 
            className={`metric failed ${filter === 'failed' ? 'active' : ''}`}
            onClick={() => setFilter('failed')}
            style={{ cursor: 'pointer' }}
            title="Click to show only failed tests"
          >
            <span className="metric-label">Failed</span>
            <span className="metric-value">{failedTests}</span>
          </div>
          <div 
            className={`metric skipped ${filter === 'skipped' ? 'active' : ''}`}
            onClick={() => setFilter('skipped')}
            style={{ cursor: 'pointer' }}
            title="Click to show only skipped tests"
          >
            <span className="metric-label">Skipped</span>
            <span className="metric-value">{skippedTests}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Duration</span>
            <span className="metric-value">{testData?.duration?.toFixed(2) || 0}s</span>
          </div>
        </div>
      </div>

      {/* Test List */}
      {testList.length > 0 && (
        <div className="test-list-section">
          <div className="test-list-header">
            <h4>
              {filter === 'all' ? 'All Tests' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Tests`}
              <span className="test-count">({filteredTests.length})</span>
            </h4>
          </div>
          <div className="test-list">
            {filteredTests.map((test, index) => (
              <div key={index} className={`test-item ${test.status}`}>
                <div className="test-status-icon">
                  {test.status === 'passed' && (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  )}
                  {test.status === 'failed' && (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                  )}
                  {test.status === 'skipped' && (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                    </svg>
                  )}
                </div>
                <div className="test-info">
                  <div className="test-name">{test.name}</div>
                  {test.error && (
                    <div className="test-error">{test.error}</div>
                  )}
                </div>
                <div className="test-duration">{test.duration.toFixed(3)}s</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {testData?.coverage && Object.keys(testData.coverage).length > 0 && (
        <div className="coverage-section">
          <h4>Code Coverage</h4>
          <div className="coverage-info">
            <p>Coverage data available - see detailed report</p>
          </div>
        </div>
      )}
    </div>
  );
}
