import './Login.css';
import {useLoader} from "../../hooks/useLoader.js";
import {useEffect} from "react";
import {GoogleLogin} from "@react-oauth/google";
import {AuthService} from "../../services/AuthService.js";
import {useToast} from "../../context/Toast/useToast.js";
import {useNavigate} from "react-router-dom";

const Login = () => {

  const {showLoader, hideLoader} = useLoader();
  const {showSuccess, showError} = useToast();
  const navigate = useNavigate();

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      showLoader();
      const authToken = credentialResponse?.credential;
      if (!authToken) {
        throw new Error("Token is missing");
      }
      const payload = {
        google_auth_token: authToken,
      }
      const response = await AuthService.loginByEmail(payload);
      if(response?.data?.status === 'success'){
          showSuccess("logged in successfully!");
          navigate("/dashboard");
      }
      else{
        showError('something went wrong');
      }

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
