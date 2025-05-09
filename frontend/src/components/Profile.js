import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

export default function Profile() {
  const { customerId, isLoggedIn, logout } = useContext(AuthContext);
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      setError('Bitte melde dich erst an.');
      return;
    }
    axios
      .get(`${process.env.REACT_APP_API_CUSTOMER}/customers/${customerId}`)
      .then(res => {
        setCustomer(res.data);
        setError('');
      })
      .catch(() => {
        setError('Fehler beim Laden der Profildaten.');
      });
  }, [isLoggedIn, customerId]);

  if (error && !isLoggedIn) {
    return (
      <div className="profile-container">
        <p className="error">{error}</p>
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="btn-logout"
        >
          Abmelden
        </button>
      </div>
    );
  }

  if (error) return <p className="error">{error}</p>;
  if (!customer) return <p>Lade Profildaten…</p>;

  return (
    <div className="profile-container">
      <h2>Kundenprofil</h2>
      <p><strong>ID:</strong> {customer.id}</p>
      <p><strong>E-Mail:</strong> {customer.email}</p>
      <button
        onClick={() => {
          logout();
          navigate('/');
        }}
        className="btn-logout"
      >
        Abmelden
      </button>
    </div>
  );
}
