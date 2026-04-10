import './Login.css';
import { useLoader } from '../../hooks/useLoader.js';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext.jsx';

const Login = () => {
  const { showLoader, hideLoader } = useLoader();
  const { login } = useAuth();

  const handleGoogleLogin = async (credentialResponse) => {
    showLoader();
    const idToken = credentialResponse?.credential;
    await login(idToken);
    hideLoader();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="railway-illustration">
          🚆
        </div>

        <h1 className="login-title">Railways</h1>
        <p className="login-subtitle">
          Sign in to start session
        </p>

        <div className="login-google-btn">
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            handleGoogleLogin(credentialResponse);
          }}
          onError={() => {
            console.log('Login Failed');
          }}
        />
        </div>
      </div>
    </div>
  );
};

export default Login;
