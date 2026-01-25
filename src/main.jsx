import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom";
import {AuthProvider} from "./context/AuthContext.jsx";
import {LoaderProvider} from "./context/LoaderContext.jsx";
import ApiLoader from "./components/commonLoader/ApiLoader.jsx";
import {GoogleOAuthProvider} from "@react-oauth/google";
import {ToastProvider} from "./context/Toast/ToastProvider.jsx";


const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <ToastProvider>
    <AuthProvider>
      <GoogleOAuthProvider clientId={googleClientId}>
      <LoaderProvider>
       <App />
        <ApiLoader/>
      </LoaderProvider>
      </GoogleOAuthProvider>
    </AuthProvider>
    </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
