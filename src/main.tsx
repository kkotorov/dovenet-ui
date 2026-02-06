import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';
import { UserProvider } from './components/utilities/UserContext';

import ReactGA from 'react-ga4';

const consent = localStorage.getItem("cookieConsent");

if (import.meta.env.PROD && import.meta.env.VITE_GA_MEASUREMENT_ID && consent === "true") {
  ReactGA.initialize(import.meta.env.VITE_GA_MEASUREMENT_ID);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>,
);
