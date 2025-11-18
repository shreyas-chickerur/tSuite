import { useState } from 'react';
import TestExecutionForm from './TestExecutionForm';
import TestResults from './TestResults';
import SecurityScanForm from './SecurityScanForm';
import SecurityResults from './SecurityResults';
import './Dashboard.css';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'tests' | 'security'>('tests');
  const [testRunId, setTestRunId] = useState<string | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🧪 tSuite - DevSecOps Testing Platform</h1>
        <p>Unified testing, security scanning, and quality analysis</p>
      </header>

      <nav className="dashboard-nav">
        <button
          className={activeTab === 'tests' ? 'active' : ''}
          onClick={() => setActiveTab('tests')}
        >
          Test Execution
        </button>
        <button
          className={activeTab === 'security' ? 'active' : ''}
          onClick={() => setActiveTab('security')}
        >
          Security Scanning
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'tests' ? (
          <div className="tests-section">
            <div className="section-card">
              <h2>Run Tests</h2>
              <TestExecutionForm onTestStarted={setTestRunId} />
            </div>
            {testRunId && (
              <div className="section-card">
                <h2>Test Results</h2>
                <TestResults testRunId={testRunId} />
              </div>
            )}
          </div>
        ) : (
          <div className="security-section">
            <div className="section-card">
              <h2>Run Security Scan</h2>
              <SecurityScanForm onScanStarted={setScanId} />
            </div>
            {scanId && (
              <div className="section-card">
                <h2>Security Scan Results</h2>
                <SecurityResults scanId={scanId} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
