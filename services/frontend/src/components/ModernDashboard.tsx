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

interface Notification {
  id: string;
  type: 'test' | 'security';
  title: string;
  message: string;
  timestamp: Date;
  status: 'success' | 'failed';
  read: boolean;
}

const ModernDashboard = ({ userEmail, onLogout }: ModernDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'tests' | 'security' | 'history' | 'settings' | 'profile'>('tests');
  const [testRunId, setTestRunId] = useState<string | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleTestStarted = (runId: string) => {
    setTestRunId(runId);
    
    // Simulate test completion notification after 5 seconds
    setTimeout(() => {
      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        type: 'test',
        title: 'Test Execution Completed',
        message: `Test run ${runId.substring(0, 8)} has finished`,
        timestamp: new Date(),
        status: Math.random() > 0.3 ? 'success' : 'failed',
        read: false,
      };
      setNotifications(prev => [newNotification, ...prev].slice(0, 10)); // Keep last 10
    }, 5000);
  };

  const handleScanStarted = (id: string) => {
    setScanId(id);
    
    // Simulate scan completion notification after 5 seconds
    setTimeout(() => {
      const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        type: 'security',
        title: 'Security Scan Completed',
        message: `Security scan ${id.substring(0, 8)} has finished`,
        timestamp: new Date(),
        status: Math.random() > 0.5 ? 'success' : 'failed',
        read: false,
      };
      setNotifications(prev => [newNotification, ...prev].slice(0, 10)); // Keep last 10
    }, 5000);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
              <div className="notification-wrapper">
                <button 
                  className="icon-btn" 
                  title="Notifications"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                  </svg>
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <h3>Notifications</h3>
                      {unreadCount > 0 && (
                        <button className="mark-all-read" onClick={markAllAsRead}>
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="notification-list">
                      {notifications.length === 0 ? (
                        <div className="notification-empty">
                          <svg width="48" height="48" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                          </svg>
                          <p>No notifications yet</p>
                          <span>Run a test or security scan to get started</span>
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div
                            key={notif.id}
                            className={`notification-item ${notif.read ? 'read' : 'unread'} ${notif.status}`}
                            onClick={() => markAsRead(notif.id)}
                          >
                            <div className="notification-icon">
                              {notif.type === 'test' ? (
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
                                </svg>
                              ) : (
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                              )}
                            </div>
                            <div className="notification-content">
                              <div className="notification-title">{notif.title}</div>
                              <div className="notification-message">{notif.message}</div>
                              <div className="notification-time">
                                {new Date(notif.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                            <div className={`notification-status-icon ${notif.status}`}>
                              {notif.status === 'success' ? (
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                              ) : (
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                </svg>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
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
            <div className="profile-container">
              {/* Profile Header Card */}
              <div className="profile-header-card">
                <div className="profile-header-content">
                  <div className="profile-avatar-large">{userEmail[0].toUpperCase()}</div>
                  <div className="profile-header-info">
                    <h2>{userEmail.split('@')[0]}</h2>
                    <p className="profile-email">{userEmail}</p>
                    <p className="profile-meta">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                      </svg>
                      Member since {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="profile-grid">
                {/* Left Column - Account Info */}
                <div className="profile-card">
                  <div className="profile-card-header">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                    <h3>Account Information</h3>
                  </div>
                  <div className="profile-card-body">
                    <div className="profile-field">
                      <label>Email Address</label>
                      <div className="input-with-icon">
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                        </svg>
                        <input type="email" value={userEmail} readOnly className="profile-input readonly" />
                      </div>
                    </div>
                    <div className="profile-field">
                      <label>Display Name</label>
                      <div className="input-with-icon">
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                        </svg>
                        <input type="text" placeholder="Enter your display name" className="profile-input" />
                      </div>
                    </div>
                    <div className="profile-field">
                      <label>Organization</label>
                      <div className="input-with-icon">
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/>
                        </svg>
                        <input type="text" placeholder="Enter your organization" className="profile-input" />
                      </div>
                    </div>
                    <button className="profile-save-btn">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z"/>
                      </svg>
                      Save Changes
                    </button>
                  </div>
                </div>

                {/* Right Column - Statistics */}
                <div className="profile-card">
                  <div className="profile-card-header">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                    </svg>
                    <h3>Activity Statistics</h3>
                  </div>
                  <div className="profile-card-body">
                    <div className="stats-grid">
                      <div className="stat-item">
                        <div className="stat-icon tests">
                          <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
                          </svg>
                        </div>
                        <div className="stat-info">
                          <div className="stat-value">0</div>
                          <div className="stat-label">Tests Run</div>
                        </div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-icon security">
                          <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <div className="stat-info">
                          <div className="stat-value">0</div>
                          <div className="stat-label">Security Scans</div>
                        </div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-icon issues">
                          <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <div className="stat-info">
                          <div className="stat-value">0</div>
                          <div className="stat-label">Issues Found</div>
                        </div>
                      </div>
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
