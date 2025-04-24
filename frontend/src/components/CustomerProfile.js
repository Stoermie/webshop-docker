// src/components/CustomerProfile.js
import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './CustomerProfile.css';

export default function CustomerProfile() {
  const { customerId, isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    (async () => {
      try {
        // Kundeninfos laden
        const custRes = await axios.get(
          `http://192.168.178.122:8001/customers/${customerId}`
        );
        setCustomer(custRes.data);

        // Alle Bestellungen laden
        const ordRes = await axios.get(
          `http://192.168.178.122:8003/orders/${customerId}`
        );
        const rawOrders = ordRes.data;

        // Artikel-Details anreichern
        const enriched = await Promise.all(
          rawOrders.map(async order => {
            const items = await Promise.all(
              order.items.map(async it => {
                const artRes = await axios.get(
                  `http://192.168.178.122:8000/api/articles/${it.article_id}`
                );
                return {
                  ...it,
                  article: artRes.data,
                  lineTotal: it.quantity * artRes.data.price
                };
              })
            );
            return {
              ...order,
              items,
              orderTotal: items.reduce((sum, i) => sum + i.lineTotal, 0)
            };
          })
        );

        // Nur die beiden neuesten Bestellungen anzeigen
        const latestTwo = enriched
          .sort((a, b) => new Date(b.order_date) - new Date(a.order_date))
          .slice(0, 2);
        setOrders(latestTwo);
      } catch (e) {
        console.error(e);
        setError('Fehler beim Laden der Daten.');
      } finally {
        setLoading(false);
      }
    })();
  }, [customerId, isLoggedIn, navigate]);

  if (loading) return <div className="cp-center">Lade Daten…</div>;
  if (error)   return <div className="cp-center cp-error">{error}</div>;

  return (
    <div className="cp-container">
      <div className="cp-profile-card">
        <div className="cp-avatar">👤</div>
        <h2 className="cp-name">{customer.name}</h2>
        <p className="cp-text"><strong>E-Mail:</strong> {customer.email}</p>
        <p className="cp-text"><strong>Adresse:</strong> {customer.address}</p>
        <button
          className="cp-logout-btn"
          onClick={() => { logout(); navigate('/'); }}
        >
          Abmelden
        </button>
      </div>

      <h3 className="cp-section-title">Deine neuesten Bestellungen</h3>
      {orders.length === 0 ? (
        <p className="cp-center">Du hast noch keine Bestellungen.</p>
      ) : (
        <div className="cp-orders-grid">
          {orders.map(order => (
            <div key={order.id} className="cp-order-card">
              <div className="cp-order-header">
                <span># {order.id}</span>
                <span>{new Date(order.order_date).toLocaleDateString()}</span>
              </div>
              <div className="cp-order-items">
                {order.items.map(it => (
                  <div key={it.id} className="cp-item-row">
                    <img
                      src={it.article.image_url || '/placeholder-book.png'}
                      alt={it.article.name}
                      className="cp-item-img"
                    />
                    <div className="cp-item-meta">
                      <p className="cp-item-name">{it.article.name}</p>
                      <p className="cp-item-qty">× {it.quantity}</p>
                      <p className="cp-item-price">
                        {it.lineTotal.toFixed(2)} €
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cp-order-total">
                Gesamt: <strong>{order.orderTotal.toFixed(2)} €</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
