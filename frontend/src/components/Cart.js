// src/components/Cart.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Cart.css';

export default function Cart() {
  const [cartId, setCartId] = useState(null);
  const [rawItems, setRawItems] = useState([]);   // Items vom Cart-Service
  const [items, setItems] = useState([]);         // Items mit Artikel-Details
  const [loading, setLoading] = useState(true);

  // 1) Cart-ID holen/erzeugen
  const getCartId = async () => {
    let id = localStorage.getItem('cartId');
    if (!id) {
      const res = await axios.post('http://192.168.178.122:8002/carts/', {});
      id = res.data.id;
      localStorage.setItem('cartId', id);
    }
    setCartId(id);
    return id;
  };

  // 2) Roh-Items laden
  useEffect(() => {
    (async () => {
      const id = await getCartId();
      try {
        const res = await axios.get(`http://192.168.178.122:8002/carts/${id}`);
        setRawItems(res.data.items || []);
      } catch {
        setRawItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 3) Artikel-Details holen, sobald rawItems da sind
  useEffect(() => {
    if (rawItems.length === 0) {
      setItems([]);
      return;
    }
    Promise.all(
      rawItems.map(async it => {
        const res = await axios.get(
          `http://192.168.178.122:8000/api/articles/${it.article_id}`
        );
        return {
          ...it,
          article: res.data
        };
      })
    ).then(setItems);
  }, [rawItems]);

  // 4) Menge updaten
  const updateQty = async (itemId, delta) => {
    const item = items.find(i => i.id === itemId);
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    await axios.put(
      `http://192.168.178.122:8002/carts/${cartId}/items/${itemId}`,
      { article_id: item.article_id, quantity: newQty }
    );
    // Nach update neu laden
    const res = await axios.get(`http://192.168.178.122:8002/carts/${cartId}`);
    setRawItems(res.data.items || []);
  };

  // 5) Item entfernen
  const removeItem = async itemId => {
    await axios.delete(
      `http://192.168.178.122:8002/carts/${cartId}/items/${itemId}`
    );
    const res = await axios.get(`http://192.168.178.122:8002/carts/${cartId}`);
    setRawItems(res.data.items || []);
  };

  if (loading) {
    return <div className="cart-container"><p>Lade Warenkorb…</p></div>;
  }

  const total = items.reduce(
    (sum, i) => sum + i.quantity * i.article.price,
    0
  );

  return (
    <div className="cart-container">
      <h1>Warenkorb</h1>
      {items.length === 0 ? (
        <p>Dein Warenkorb ist leer.</p>
      ) : (
        <>
          <ul className="cart-items">
            {items.map(item => (
              <li key={item.id} className="cart-item">
                <img
                  src={item.article.image_url || '/placeholder-book.png'}
                  alt={item.article.name}
                  className="item-image"
                />
                <div className="item-info">
                  <p className="item-name">{item.article.name}</p>
                  <p className="item-price">
                    {(item.article.price * item.quantity).toFixed(2)} €
                  </p>
                </div>
                <div className="item-qty">
                  <button onClick={() => updateQty(item.id, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, +1)}>+</button>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeItem(item.id)}
                >
                  Entfernen
                </button>
              </li>
            ))}
          </ul>
          <div className="cart-footer">
            <p className="cart-total">
              Zwischensumme: <strong>{total.toFixed(2)} €</strong>
            </p>
            <Link to="/checkout" className="checkout-btn">
              Zur Kasse
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
