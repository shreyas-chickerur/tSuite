import { useState } from 'react';
import { api } from '../api/client';
import './SecurityScanForm.css';

interface SecurityScanFormProps {
  onScanStarted: (scanId: string) => void;
}

export default function SecurityScanForm({ onScanStarted }: SecurityScanFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    projectId: 'demo-project',
    repositoryUrl: '',
    scannerType: 'dependency',
    branch: 'main',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const scanId = `scan-${Date.now()}`;
      
      // Check if this is a demo request
      if (formData.repositoryUrl.toLowerCase().includes('demo') || 
          formData.repositoryUrl.toLowerCase().includes('example')) {
        // Simulate demo scan with vulnerabilities
        console.log('Running DEMO security scan with sample vulnerabilities');
        
        // Create mock results immediately
        setTimeout(() => {
          onScanStarted(scanId);
        }, 1000);
        
        // Store demo results in sessionStorage for the results component to pick up
        const demoResults = {
          status: 'completed',
          results: {
            success: true,
            total_vulnerabilities: 12,
            critical: 2,
            high: 4,
            medium: 5,
            low: 1,
            vulnerabilities: [
              {
                package: 'lodash',
                severity: 'critical',
                title: 'Prototype Pollution in lodash',
                cve: 'CVE-2019-10744',
                description: 'Versions of lodash before 4.17.12 are vulnerable to Prototype Pollution'
              },
              {
                package: 'axios',
                severity: 'critical',
                title: 'Server-Side Request Forgery in axios',
                cve: 'CVE-2023-45857',
                description: 'Axios 1.5.1 allows SSRF via the proxy configuration'
              },
              {
                package: 'express',
                severity: 'high',
                title: 'Open Redirect in express',
                cve: 'CVE-2024-29041',
                description: 'Express.js is vulnerable to open redirect attacks'
              },
              {
                package: 'jsonwebtoken',
                severity: 'high',
                title: 'JWT Algorithm Confusion',
                cve: 'CVE-2022-23529',
                description: 'jsonwebtoken is vulnerable to algorithm confusion attacks'
              },
              {
                package: 'minimist',
                severity: 'high',
                title: 'Prototype Pollution in minimist',
                cve: 'CVE-2021-44906',
                description: 'Prototype pollution vulnerability in minimist'
              },
              {
                package: 'node-fetch',
                severity: 'high',
                title: 'Information Exposure in node-fetch',
                cve: 'CVE-2022-0235',
                description: 'node-fetch forwards secure headers to untrusted sites'
              },
              {
                package: 'qs',
                severity: 'medium',
                title: 'Prototype Pollution in qs',
                cve: 'CVE-2022-24999',
                description: 'qs before 6.10.3 allows prototype pollution'
              },
              {
                package: 'semver',
                severity: 'medium',
                title: 'Regular Expression Denial of Service in semver',
                cve: 'CVE-2022-25883',
                description: 'semver is vulnerable to ReDoS attacks'
              },
              {
                package: 'ws',
                severity: 'medium',
                title: 'ReDoS vulnerability in ws',
                cve: 'CVE-2024-37890',
                description: 'ws is vulnerable to Regular Expression Denial of Service'
              },
              {
                package: 'path-to-regexp',
                severity: 'medium',
                title: 'ReDoS in path-to-regexp',
                cve: 'CVE-2024-45296',
                description: 'path-to-regexp is vulnerable to ReDoS'
              },
              {
                package: 'cookie',
                severity: 'medium',
                title: 'Cookie parsing vulnerability',
                cve: 'CVE-2024-47764',
                description: 'cookie package has parsing issues'
              },
              {
                package: 'debug',
                severity: 'low',
                title: 'Regular Expression Denial of Service',
                cve: 'CVE-2017-16137',
                description: 'debug is vulnerable to ReDoS'
              }
            ]
          }
        };
        
        sessionStorage.setItem(`scan-results-${scanId}`, JSON.stringify(demoResults));
        setLoading(false);
        return;
      }
      
      const response = await api.runSecurityScan({
        project_id: formData.projectId,
        scan_id: scanId,
        scanner_type: formData.scannerType,
        repository_url: formData.repositoryUrl,
        branch: formData.branch,
      });

      if (response.status === 'queued') {
        onScanStarted(scanId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start security scan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="security-form">
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
        <label htmlFor="scannerType">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M8 1a3.5 3.5 0 00-3.5 3.5V7A1.5 1.5 0 003 8.5v5A1.5 1.5 0 004.5 15h7a1.5 1.5 0 001.5-1.5v-5A1.5 1.5 0 0011.5 7V4.5A3.5 3.5 0 008 1zm2 6V4.5a2 2 0 10-4 0V7h4z"/>
          </svg>
          Scanner Type
        </label>
        <select
          id="scannerType"
          value={formData.scannerType}
          onChange={(e) => setFormData({ ...formData, scannerType: e.target.value })}
        >
          <option value="dependency">Dependency Vulnerabilities</option>
          <option value="sast">SAST (Static Analysis)</option>
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
        {loading ? 'Starting Security Scan...' : 'Run Security Scan'}
      </button>
    </form>
  );
}
