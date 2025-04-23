// src/pages/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submitHandler = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8001/customers/', { email, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registrierung fehlgeschlagen.');
    }
  };

  return (
    <div className="form-container">
      <h1>Registrieren</h1>
      {error && <div className="error-box">{error}</div>}
      <form onSubmit={submitHandler}>
        <label htmlFor="email">E-Mail</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <label htmlFor="password">Passwort</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary">Registrieren</button>
      </form>
      <p>
        Schon registriert? <Link to="/login">Einloggen</Link>
      </p>
    </div>
  );
}

export default Register;
