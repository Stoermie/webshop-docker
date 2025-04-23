// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault();
    axios.post("http://192.168.178.122:8001/customers/login", { email, password })
      .then(response => {
        console.log("Login erfolgreich:", response.data);
        localStorage.setItem("customerId", response.data.id)
        navigate("/profile");  // Weiterleitung zum Kundenprofil
      })
      .catch(error => {
        console.error("Login fehlgeschlagen:", error);
        setErrorMsg("Ungültige Zugangsdaten, bitte erneut versuchen.");
      });
  };


  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Login</h1>
        {errorMsg && <p className="error">{errorMsg}</p>}
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">E-Mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Deine E-Mail"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Passwort</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Dein Passwort"
              required
            />
          </div>
          <button type="submit" className="button">Einloggen</button>
        </form>
        <p className="register-link">
          Noch kein Konto? <span onClick={() => navigate("/register")}>Jetzt registrieren</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
