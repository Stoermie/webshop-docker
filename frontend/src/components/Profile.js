import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

export default function Profile() {
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = localStorage.getItem('customerId');
    if (!id) {
      setError('Nicht eingeloggt.');
      return;
    }
    axios.get(`http://localhost:8001/customers/${id}`)
      .then(res => setCustomer(res.data))
      .catch(() => setError('Fehler beim Laden der Profildaten.'));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!customer) return <p>Lade Kundendaten…</p>;

  return (
    <div className="profile-container">
      <h2>Kundenprofil</h2>
      <p><strong>ID:</strong> {customer.id}</p>
      <p><strong>E-Mail:</strong> {customer.email}</p>
    </div>
  );
}
