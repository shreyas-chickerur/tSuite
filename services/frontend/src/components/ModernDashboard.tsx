import { useState } from 'react';
import TestExecutionForm from './TestExecutionForm';
import TestResults from './TestResults';
import SecurityScanForm from './SecurityScanForm';
import SecurityResults from './SecurityResults';
import './ModernDashboard.css';

interface ModernDashboardProps {
  userEmail: string;
  onLogout: () => void;
}

const ModernDashboard = ({ userEmail, onLogout }: ModernDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'tests' | 'security' | 'history'>('tests');
  const [testRunId, setTestRunId] = useState<string | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleTestStarted = (runId: string) => {
    setTestRunId(runId);
  };

  const handleScanStarted = (id: string) => {
    setScanId(id);
  };

  return (
    <div className="modern-dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            {!sidebarCollapsed && <span className="logo-text">tSuite</span>}
          </div>
          <button 
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'tests' ? 'active' : ''}`}
            onClick={() => setActiveTab('tests')}
          >
            <span className="nav-icon">🧪</span>
            {!sidebarCollapsed && <span>Test Execution</span>}
          </button>
          <button
            className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <span className="nav-icon">🔒</span>
            {!sidebarCollapsed && <span>Security Scans</span>}
          </button>
          <button
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <span className="nav-icon">📊</span>
            {!sidebarCollapsed && <span>History</span>}
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{userEmail[0].toUpperCase()}</div>
            {!sidebarCollapsed && (
              <div className="user-details">
                <div className="user-email">{userEmail}</div>
                <button className="logout-btn" onClick={onLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header">
          <div className="header-title">
            <h1>
              {activeTab === 'tests' && '🧪 Test Execution'}
              {activeTab === 'security' && '🔒 Security Scanning'}
              {activeTab === 'history' && '📊 Execution History'}
            </h1>
            <p className="header-subtitle">
              {activeTab === 'tests' && 'Run automated tests on your repositories'}
              {activeTab === 'security' && 'Scan for vulnerabilities and security issues'}
              {activeTab === 'history' && 'View past test runs and security scans'}
            </p>
          </div>
          <div className="header-actions">
            <button className="icon-btn" title="Notifications">
              🔔
            </button>
            <button className="icon-btn" title="Settings">
              ⚙️
            </button>
          </div>
        </header>

        <div className="content-body">
          {activeTab === 'tests' && (
            <div className="content-grid">
              <div className="form-section">
                <div className="section-card">
                  <h2 className="section-title">Configure Test Run</h2>
                  <TestExecutionForm onTestStarted={handleTestStarted} />
                </div>
              </div>
              <div className="results-section">
                <div className="section-card">
                  <h2 className="section-title">Test Results</h2>
                  {testRunId ? (
                    <TestResults testRunId={testRunId} />
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">🧪</div>
                      <h3>No test run yet</h3>
                      <p>Submit a test execution to see results here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="content-grid">
              <div className="form-section">
                <div className="section-card">
                  <h2 className="section-title">Configure Security Scan</h2>
                  <SecurityScanForm onScanStarted={handleScanStarted} />
                </div>
              </div>
              <div className="results-section">
                <div className="section-card">
                  <h2 className="section-title">Scan Results</h2>
                  {scanId ? (
                    <SecurityResults scanId={scanId} />
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">🔒</div>
                      <h3>No scan run yet</h3>
                      <p>Submit a security scan to see results here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="section-card">
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>History Coming Soon</h3>
                <p>Test execution and security scan history will be available in the next release</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ModernDashboard;
