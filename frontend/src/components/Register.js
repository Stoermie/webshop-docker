import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(
        `${process.env.REACT_APP_API_CUSTOMER}/customers/`,
        {
          name: form.name,
          email: form.email,
          address: form.address,
          password: form.password
        }
      );
      navigate('/login');
    } catch (err) {
      console.error('Registrierung fehlgeschlagen:', err);
      setError(
        err.response?.data?.detail ||
        'Registrierung fehlgeschlagen. Bitte prüfe deine Eingaben.'
      );
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h1 className="register-title">Neues Konto erstellen</h1>
        {error && <div className="register-error">{error}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <label className="register-label">
            Name
            <input
              type="text"
              name="name"
              className="register-input"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label className="register-label">
            E-Mail
            <input
              type="email"
              name="email"
              className="register-input"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="register-label">
            Adresse
            <input
              type="text"
              name="address"
              className="register-input"
              value={form.address}
              onChange={handleChange}
            />
          </label>

          <label className="register-label">
            Passwort
            <input
              type="password"
              name="password"
              className="register-input"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit" className="register-button">
            Registrieren
          </button>
        </form>

        <p className="register-footer">
          Schon registriert?{' '}
          <button
            className="register-link"
            onClick={() => navigate('/login')}
          >
            Einloggen
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;
