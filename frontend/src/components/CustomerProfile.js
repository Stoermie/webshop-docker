// src/components/CustomerProfile.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import './CustomerProfile.css';

const CustomerProfile = () => {
  const { customerId } = useContext(AuthContext);
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`http://192.168.178.122:8001/customers/${customerId}`)
      .then(resp => {
        setCustomer(resp.data);
        return axios.get(`http://192.168.178.122:8003/orders/${customerId}`);
      })
      .then(res2 => setOrders(res2.data))
      .catch(err => {
        console.error(err);
        setError('Daten konnten nicht geladen werden.');
      })
      .finally(() => setLoading(false));
  }, [customerId]);

  if (loading) return <div className="profile-container"><p>Lade Daten…</p></div>;
  if (error)   return <div className="profile-container"><p className="error">{error}</p></div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <img
          className="profile-avatar"
          src={customer.avatarUrl || '/benutzerlogo.png'}
          alt="Profilbild"
        />
        <h1 className="profile-name">{customer.name || '– kein Name –'}</h1>
        <div className="field"><span className="label">E-Mail:</span> {customer.email}</div>
        <div className="field"><span className="label">Adresse:</span> {customer.address || '– fehlt –'}</div>

        <h2>Deine Bestellungen</h2>
        {orders.length === 0
          ? <p>Keine Bestellungen.</p>
          : (
            <ul className="order-list">
              {orders.map(o => (
                <li key={o.id}>
                  <strong>#{o.id}</strong> am {new Date(o.created_at).toLocaleDateString()}
                  <ul>
                    {o.items.map(it => (
                      <li key={it.id}>Artikel {it.article_id} × {it.quantity}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )
        }
      </div>
    </div>
  );
};

export default CustomerProfile;
