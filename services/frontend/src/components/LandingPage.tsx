import { useState } from 'react';
import './LandingPage.css';

interface LandingPageProps {
  onLogin: (email: string) => void;
}

const LandingPage = ({ onLogin }: LandingPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, just log in
    onLogin(email || 'demo@tsuite.dev');
  };

  return (
    <div className="landing-page">
      <div className="landing-hero">
        <div className="hero-content">
          <div className="logo-section">
            <div className="logo">
              <span className="logo-icon">⚡</span>
              <span className="logo-text">tSuite</span>
            </div>
            <p className="tagline">DevSecOps Testing Platform</p>
          </div>
          
          <h1 className="hero-title">
            Automated Testing & Security
            <br />
            <span className="gradient-text">Built for Modern Teams</span>
          </h1>
          
          <p className="hero-description">
            Run tests, scan for vulnerabilities, and ensure code quality—all in one platform.
            Integrate seamlessly with your CI/CD pipeline.
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🧪</div>
              <h3>Test Execution</h3>
              <p>Jest, pytest, Cypress, and more</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Security Scanning</h3>
              <p>Dependency & SAST analysis</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Real-time Results</h3>
              <p>Live status updates & metrics</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚙️</div>
              <h3>CI/CD Ready</h3>
              <p>Easy integration with pipelines</p>
            </div>
          </div>
        </div>

        <div className="auth-section">
          <div className="auth-card">
            <div className="auth-tabs">
              <button
                className={`auth-tab ${isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(true)}
              >
                Sign In
              </button>
              <button
                className={`auth-tab ${!isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {isLogin && (
                <div className="form-footer">
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="forgot-link">Forgot password?</a>
                </div>
              )}

              <button type="submit" className="auth-button">
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>

              <div className="demo-note">
                <p>👋 Demo Mode: Click Sign In to explore</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
