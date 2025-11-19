import { useState } from 'react';
import TestExecutionForm from './TestExecutionForm';
import TestResults from './TestResults';
import SecurityScanForm from './SecurityScanForm';
import SecurityResults from './SecurityResults';
import Logo from './Logo';
import './ModernDashboard.css';

interface ModernDashboardProps {
  userEmail: string;
  onLogout: () => void;
}

const ModernDashboard = ({ userEmail, onLogout }: ModernDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'tests' | 'security' | 'history' | 'settings' | 'profile'>('tests');
  const [testRunId, setTestRunId] = useState<string | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);

  const handleTestStarted = (runId: string) => {
    setTestRunId(runId);
  };

  const handleScanStarted = (id: string) => {
    setScanId(id);
  };

  return (
    <div className="modern-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Logo size={36} showText={true} />
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'tests' ? 'active' : ''}`}
            onClick={() => setActiveTab('tests')}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
            </svg>
            <span>Test Execution</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span>Security Scans</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
            </svg>
            <span>History</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
            </svg>
            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info" onClick={() => setActiveTab('profile')} style={{cursor: 'pointer'}}>
            <div className="user-avatar">{userEmail[0].toUpperCase()}</div>
            <div className="user-details">
              <div className="user-email">{userEmail}</div>
              <button className="logout-btn" onClick={(e) => { e.stopPropagation(); onLogout(); }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header">
          <div className="header-content">
            <div className="header-title">
              <div className="title-row">
                <svg className="title-icon" width="28" height="28" viewBox="0 0 20 20" fill="currentColor">
                  {activeTab === 'tests' && (
                    <>
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                      <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
                    </>
                  )}
                  {activeTab === 'security' && (
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  )}
                  {activeTab === 'history' && (
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                  )}
                  {activeTab === 'settings' && (
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                  )}
                  {activeTab === 'profile' && (
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  )}
                </svg>
                <h1>
                  {activeTab === 'tests' && 'Test Execution'}
                  {activeTab === 'security' && 'Security Scanning'}
                  {activeTab === 'history' && 'Execution History'}
                  {activeTab === 'settings' && 'Settings'}
                  {activeTab === 'profile' && 'Profile'}
                </h1>
              </div>
            </div>
            <div className="header-actions">
              <button className="icon-btn" title="Notifications">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                </svg>
              </button>
              <button className="icon-btn" title="Settings">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
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
                      <svg className="empty-icon" width="64" height="64" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
                      </svg>
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
                      <svg className="empty-icon" width="64" height="64" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
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
                <svg className="empty-icon" width="64" height="64" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                </svg>
                <h3>History Coming Soon</h3>
                <p>Test execution and security scan history will be available in the next release</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="section-card">
              <div className="settings-content">
                <h2 className="section-title">Application Settings</h2>
                
                <div className="settings-section">
                  <h3>Appearance</h3>
                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Theme</label>
                      <p>Choose between light and dark mode</p>
                    </div>
                    <div className="setting-control">
                      <select className="setting-select">
                        <option value="dark">Dark Mode</option>
                        <option value="light">Light Mode (Coming Soon)</option>
                        <option value="auto">Auto (Coming Soon)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="settings-section">
                  <h3>Notifications</h3>
                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Test Completion Notifications</label>
                      <p>Get notified when tests complete</p>
                    </div>
                    <div className="setting-control">
                      <input type="checkbox" defaultChecked />
                    </div>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Security Scan Notifications</label>
                      <p>Get notified when security scans complete</p>
                    </div>
                    <div className="setting-control">
                      <input type="checkbox" defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="settings-section">
                  <h3>Preferences</h3>
                  <div className="setting-item">
                    <div className="setting-info">
                      <label>Auto-refresh Results</label>
                      <p>Automatically refresh test results</p>
                    </div>
                    <div className="setting-control">
                      <input type="checkbox" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="section-card">
              <div className="profile-content">
                <h2 className="section-title">User Profile</h2>
                
                <div className="profile-header">
                  <div className="profile-avatar-large">{userEmail[0].toUpperCase()}</div>
                  <div className="profile-info">
                    <h3>{userEmail}</h3>
                    <p>Member since {new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="profile-section">
                  <h3>Account Information</h3>
                  <div className="profile-field">
                    <label>Email</label>
                    <input type="email" value={userEmail} readOnly className="profile-input" />
                  </div>
                  <div className="profile-field">
                    <label>Display Name</label>
                    <input type="text" placeholder="Enter your name" className="profile-input" />
                  </div>
                  <div className="profile-field">
                    <label>Organization</label>
                    <input type="text" placeholder="Enter your organization" className="profile-input" />
                  </div>
                  <button className="profile-save-btn">Save Changes</button>
                </div>

                <div className="profile-section">
                  <h3>Statistics</h3>
                  <div className="profile-stats">
                    <div className="stat-card">
                      <div className="stat-value">0</div>
                      <div className="stat-label">Tests Run</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">0</div>
                      <div className="stat-label">Security Scans</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">0</div>
                      <div className="stat-label">Issues Found</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ModernDashboard;
