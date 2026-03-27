import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LoaderProvider } from './context/LoaderContext.jsx';
import { ToastProvider } from './context/Toast/ToastProvider.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import ApiLoader from './components/ApiLoader/ApiLoader.jsx';
import App from './App.jsx';

import './styles/index.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <LoaderProvider>
      <ToastProvider>
        <AuthProvider>
          <GoogleOAuthProvider clientId={googleClientId}>
            <App />
            <ApiLoader />
          </GoogleOAuthProvider>
        </AuthProvider>
      </ToastProvider>
    </LoaderProvider>
  </BrowserRouter>,
);
