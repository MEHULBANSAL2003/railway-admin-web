import './Login.css';
import {useLoader} from "../../hooks/useLoader.js";
import {useEffect} from "react";

const Login = () => {

  return (
    <div className="login-container">
      <div className="login-card">

        {/* Railway illustration */}
        <div className="railway-illustration">
          🚆
        </div>

        <h1 className="login-title">Railways</h1>
        <p className="login-subtitle">
          Sign in to start session
        </p>

        {/* Google Login Button */}
        <button className="google-login-btn">
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
          />
          Login with Google
        </button>

      </div>
    </div>
  );
};

export default Login;
