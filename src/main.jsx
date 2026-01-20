import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom";
import {AuthProvider} from "./context/AuthContext.jsx";
import {LoaderProvider} from "./context/LoaderContext.jsx";
import ApiLoader from "./components/commonLoader/ApiLoader.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
    <BrowserRouter>
      <LoaderProvider>
       <App />
        <ApiLoader/>
      </LoaderProvider>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
