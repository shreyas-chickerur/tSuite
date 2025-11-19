import Logo from './Logo';
import './LoadingScreen.css';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message = 'Loading...' }: LoadingScreenProps) => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <Logo size={80} animated={true} showText={false} />
        <h2 className="loading-title">tSuite</h2>
        <p className="loading-message">{message}</p>
        <div className="loading-bar">
          <div className="loading-bar-fill"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
