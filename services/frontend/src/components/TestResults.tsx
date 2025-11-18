import { useState, useEffect } from 'react';
import { api } from '../api/client';

interface TestResultsProps {
  testRunId: string;
}

export default function TestResults({ testRunId }: TestResultsProps) {
  const [status, setStatus] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: number;

    const pollStatus = async () => {
      try {
        const statusData = await api.getTestStatus(testRunId);
        setStatus(statusData);

        if (statusData.status === 'completed' || statusData.status === 'failed') {
          const resultsData = await api.getTestResults(testRunId);
          setResults(resultsData);
          setLoading(false);
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    };

    pollStatus();
    interval = window.setInterval(pollStatus, 2000);

    return () => clearInterval(interval);
  }, [testRunId]);

  if (loading) {
    return (
      <div className="results-loading">
        <div className="spinner"></div>
        <p>Status: {status?.status || 'queued'}</p>
        {status?.progress !== undefined && <p>Progress: {status.progress}%</p>}
      </div>
    );
  }

  if (!results) return null;

  const { results: testData } = results;

  return (
    <div className="test-results">
      <div className="results-summary">
        <div className={`status-badge ${results.status}`}>
          {results.status === 'completed' ? '✓' : '✗'} {results.status}
        </div>
        
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
          <div className="metric">
            <span className="metric-label">Duration</span>
            <span className="metric-value">{testData?.duration?.toFixed(2) || 0}s</span>
          </div>
        </div>
      </div>

      {testData?.coverage && Object.keys(testData.coverage).length > 0 && (
        <div className="coverage-section">
          <h3>Code Coverage</h3>
          <div className="coverage-info">
            <p>Coverage data available - see detailed report</p>
          </div>
        </div>
      )}

      {results.error && (
        <div className="error-section">
          <h3>Error</h3>
          <pre>{results.error}</pre>
        </div>
      )}
    </div>
  );
}
