// src/components/Login.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Login.css';

function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'http://192.168.178.122:8001/customers/login',
        { email, password }
      );
      login(res.data.id);
      navigate('/profile');
    } catch {
      setErrorMsg('Ungültige E-Mail oder Passwort.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Anmelden</h1>
        {errorMsg && <div className="login-error">{errorMsg}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <label className="login-label">
            E-Mail
            <input
              type="email"
              className="login-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="login-label">
            Passwort
            <input
              type="password"
              className="login-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="login-button">
            Einloggen
          </button>
        </form>

        <div className="login-footer">
          Noch kein Konto?{' '}
          <button
            className="login-register"
            onClick={() => navigate('/register')}
          >
            Jetzt registrieren
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
