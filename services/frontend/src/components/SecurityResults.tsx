import { useState, useEffect } from 'react';
import { api } from '../api/client';

interface SecurityResultsProps {
  scanId: string;
}

export default function SecurityResults({ scanId }: SecurityResultsProps) {
  const [status, setStatus] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: number;

    const pollStatus = async () => {
      try {
        const statusData = await api.getScanStatus(scanId);
        setStatus(statusData);

        if (statusData.status === 'completed' || statusData.status === 'failed') {
          const resultsData = await api.getScanResults(scanId);
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
  }, [scanId]);

  if (loading) {
    return (
      <div className="results-loading">
        <div className="spinner"></div>
        <p>Status: {status?.status || 'queued'}</p>
        <p>Scanner: {status?.scanner_type}</p>
      </div>
    );
  }

  if (!results) return null;

  const { results: scanData } = results;

  return (
    <div className="security-results">
      <div className="results-summary">
        <div className={`status-badge ${results.status}`}>
          {results.status === 'completed' ? '✓' : '✗'} {results.status}
        </div>
        
        <div className="metrics">
          <div className="metric">
            <span className="metric-label">Total Issues</span>
            <span className="metric-value">
              {scanData?.total_vulnerabilities || scanData?.total_findings || 0}
            </span>
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
          {scanData.vulnerabilities.slice(0, 10).map((vuln: any, index: number) => (
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
          {scanData.findings.slice(0, 10).map((finding: any, index: number) => (
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
