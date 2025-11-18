import { useState, useEffect } from 'react';
import { api } from '../api/client';
import './SecurityResults.css';

interface SecurityResultsProps {
  scanId: string;
}

interface ScanStatus {
  status: string;
  scanner_type?: string;
  [key: string]: unknown;
}

interface Vulnerability {
  package: string;
  severity: string;
  title: string;
  cve?: string;
  [key: string]: unknown;
}

interface Finding {
  severity: string;
  file: string;
  line: number;
  message: string;
  rule_id: string;
  [key: string]: unknown;
}

interface ScanResults {
  status: string;
  results?: {
    total_vulnerabilities?: number;
    total_findings?: number;
    critical?: number;
    high?: number;
    medium?: number;
    low?: number;
    vulnerabilities?: Vulnerability[];
    findings?: Finding[];
    coverage?: Record<string, unknown>;
  };
  error?: string;
  [key: string]: unknown;
}

export default function SecurityResults({ scanId }: SecurityResultsProps) {
  const [status, setStatus] = useState<ScanStatus | null>(null);
  const [results, setResults] = useState<ScanResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Starting to poll security scan results for:', scanId);
    
    // Check for demo results first
    const demoData = sessionStorage.getItem(`scan-results-${scanId}`);
    if (demoData) {
      console.log('Loading DEMO security scan results');
      const demoResults = JSON.parse(demoData);
      setResults(demoResults);
      setStatus({ status: 'completed', scanner_type: 'demo' });
      setLoading(false);
      return;
    }
    
    const interval = window.setInterval(async () => {
      try {
        const statusData = await api.getScanStatus(scanId);
        console.log('Security scan status update:', statusData);
        setStatus(statusData);

        if (statusData.status === 'completed' || statusData.status === 'failed') {
          console.log('Security scan finished, fetching results...');
          const resultsData = await api.getScanResults(scanId);
          console.log('Security scan results:', resultsData);
          setResults(resultsData);
          setLoading(false);
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error polling security scan status:', error);
      }
    }, 2000);

    return () => {
      console.log('Cleaning up polling for:', scanId);
      clearInterval(interval);
    };
  }, [scanId]);

  if (loading) {
    return (
      <div className="results-loading">
        <div className="spinner"></div>
        <p className="status-text">Status: {status?.status || 'queued'}</p>
        {status?.scanner_type && (
          <p className="progress-text">Scanner: {status.scanner_type}</p>
        )}
      </div>
    );
  }

  if (!results) return null;

  console.log('Rendering security results:', results);
  console.log('Scan data:', results.results);

  const { results: scanData } = results;
  
  // Extract error from correct location (same as TestResults)
  const errorMessage = (scanData as { error?: string })?.error ||
                      results.error || 
                      (results as { message?: string })?.message ||
                      JSON.stringify(results, null, 2);

  const totalIssues = scanData?.total_vulnerabilities || scanData?.total_findings || 0;
  const hasVulnerabilities = scanData?.vulnerabilities && scanData.vulnerabilities.length > 0;
  const hasFindings = scanData?.findings && scanData.findings.length > 0;

  // Show error prominently if scan failed
  if (results.status === 'failed' || results.error || (scanData as { error?: string })?.error) {
    console.log('Showing error state. Error message:', errorMessage);
    
    return (
      <div className="security-results">
        <div className="error-banner">
          <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
          <div className="error-content">
            <h3>Security Scan Failed</h3>
            <p>The security scan encountered an error. Please review the details below and fix the issues.</p>
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
      </div>
    );
  }

  // Show success with no issues found
  if (totalIssues === 0 && !hasVulnerabilities && !hasFindings) {
    return (
      <div className="security-results">
        <div className="success-banner">
          <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          <div className="success-content">
            <h3>No Security Issues Found</h3>
            <p>The security scan completed successfully with no vulnerabilities or security issues detected.</p>
          </div>
        </div>

        <div className="results-summary">
          <div className="metrics">
            <div className="metric">
              <span className="metric-label">Total Issues</span>
              <span className="metric-value">0</span>
            </div>
            <div className="metric critical">
              <span className="metric-label">Critical</span>
              <span className="metric-value">0</span>
            </div>
            <div className="metric high">
              <span className="metric-label">High</span>
              <span className="metric-value">0</span>
            </div>
            <div className="metric medium">
              <span className="metric-label">Medium</span>
              <span className="metric-value">0</span>
            </div>
            <div className="metric low">
              <span className="metric-label">Low</span>
              <span className="metric-value">0</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show results with vulnerabilities/findings
  return (
    <div className="security-results">
      <div className="results-summary">
        <h4>Security Scan Summary:</h4>
        <div className="metrics">
          <div className="metric">
            <span className="metric-label">Total Issues</span>
            <span className="metric-value">{totalIssues}</span>
          </div>
          <div className="metric critical">
            <span className="metric-label">Critical</span>
            <span className="metric-value">{scanData?.critical || 0}</span>
          </div>
          <div className="metric high">
            <span className="metric-label">High</span>
            <span className="metric-value">{scanData?.high || 0}</span>
          </div>
          <div className="metric medium">
            <span className="metric-label">Medium</span>
            <span className="metric-value">{scanData?.medium || 0}</span>
          </div>
          <div className="metric low">
            <span className="metric-label">Low</span>
            <span className="metric-value">{scanData?.low || 0}</span>
          </div>
        </div>
      </div>

      {scanData?.vulnerabilities && scanData.vulnerabilities.length > 0 && (
        <div className="vulnerabilities-list">
          <h3>Vulnerabilities</h3>
          {scanData.vulnerabilities.slice(0, 10).map((vuln: Vulnerability, index: number) => (
            <div key={index} className={`vulnerability-item ${vuln.severity}`}>
              <div className="vuln-header">
                <span className="vuln-severity">{vuln.severity}</span>
                <span className="vuln-package">{vuln.package}</span>
              </div>
              <div className="vuln-title">{vuln.title}</div>
              {vuln.cve && <div className="vuln-cve">CVE: {vuln.cve}</div>}
            </div>
          ))}
          {scanData.vulnerabilities.length > 10 && (
            <p className="more-items">
              ... and {scanData.vulnerabilities.length - 10} more
            </p>
          )}
        </div>
      )}

      {scanData?.findings && scanData.findings.length > 0 && (
        <div className="findings-list">
          <h3>Security Findings</h3>
          {scanData.findings.slice(0, 10).map((finding: Finding, index: number) => (
            <div key={index} className={`finding-item ${finding.severity}`}>
              <div className="finding-header">
                <span className="finding-severity">{finding.severity}</span>
                <span className="finding-file">{finding.file}:{finding.line}</span>
              </div>
              <div className="finding-message">{finding.message}</div>
              <div className="finding-rule">{finding.rule_id}</div>
            </div>
          ))}
          {scanData.findings.length > 10 && (
            <p className="more-items">
              ... and {scanData.findings.length - 10} more
            </p>
          )}
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
