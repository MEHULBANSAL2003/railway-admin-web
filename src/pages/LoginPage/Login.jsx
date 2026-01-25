import './Login.css';
import {useLoader} from "../../hooks/useLoader.js";
import {GoogleLogin} from "@react-oauth/google";
import {useAuth} from "../../context/AuthContext.jsx";

const Login = () => {

  const {showLoader, hideLoader} = useLoader();
  const {login} = useAuth();

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      showLoader();
      const authToken = credentialResponse?.credential;
      if (!authToken) {
        throw new Error("Token is missing");
      }
      await login(authToken);
    }
    catch (error) {
      console.log(error);
      showError(error.message || 'Something went wrong.Please try again later.');
      console.log(error);
    }
    finally {
      hideLoader();
    }
  }

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

        <GoogleLogin
          onSuccess={(credentialResponse) => {
             handleGoogleLogin(credentialResponse);
            // credentialResponse.credential = JWT token
          }}
          onError={() => {
            console.log('Login Failed');
          }}
        />

      </div>
    </div>
  );
};

export default Login;
