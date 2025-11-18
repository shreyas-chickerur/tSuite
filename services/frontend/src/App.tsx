import { useState } from 'react';
import LandingPage from './components/LandingPage';
import ModernDashboard from './components/ModernDashboard';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleLogin = (email: string) => {
    setIsLoading(true);
    
    // Simulate authentication process
    setTimeout(() => {
      setUserEmail(email);
      setIsAuthenticated(true);
      setIsLoading(false);
    }, 2000); // 2 second loading screen
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail('');
  };

  if (isLoading) {
    return <LoadingScreen message="Authenticating..." />;
  }

  if (!isAuthenticated) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return <ModernDashboard userEmail={userEmail} onLogout={handleLogout} />;
}

export default App;
