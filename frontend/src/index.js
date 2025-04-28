// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';

// React-Toastify importieren
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Native alert() überschreiben – nutzt jetzt toast.info()
window.alert = (msg) => toast.info(msg);

// Optional kannst du auch spezialisierte Varianten anlegen:
// window.alertSuccess = (msg) => toast.success(msg);
// window.alertError   = (msg) => toast.error(msg);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Toast-Container muss einmal im Root stehen */}
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      pauseOnHover
    />

    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);