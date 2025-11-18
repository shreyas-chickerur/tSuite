import { useState } from 'react';
import LandingPage from './components/LandingPage';
import ModernDashboard from './components/ModernDashboard';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleLogin = (email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail('');
  };

  if (!isAuthenticated) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return <ModernDashboard userEmail={userEmail} onLogout={handleLogout} />;
}

export default App;
