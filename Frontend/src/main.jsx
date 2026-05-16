import { StrictMode } from 'react'
import { CreditProvider } from "./context/creditscontext";
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId = "976952821348-99jmor4h16mjq1ei2pjeeu896f167og9.apps.googleusercontent.com"; // REPLACE WITH YOUR GOOGLE CLIENT ID

console.log("CLIENT ID:", clientId);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <BrowserRouter>

        <CreditProvider>
          <App />
        </CreditProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
)
