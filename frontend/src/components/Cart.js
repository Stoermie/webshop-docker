import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { Link } from 'react-router-dom';
import './Cart.css';

export default function Cart() {
  const [cartId, setCartId] = useState(null);
  const [rawItems, setRawItems] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);


  const CART_API = process.env.REACT_APP_API_CART; 
  const ARTICLE_API = `${process.env.REACT_APP_API_CATALOG}/api`;

  const getCartId = async () => {
    let id = localStorage.getItem('cartId');
    if (!id) {
      const res = await axios.post(`${CART_API}/carts`, {});
      id = res.data.id;
      localStorage.setItem('cartId', id);
    }
    setCartId(id);
    return id;
  };

  useEffect(() => {
    (async () => {
      try {
        const id = await getCartId();
        const res = await axios.get(`${CART_API}/carts/${id}`);
        setRawItems(res.data.items || []);
      } catch {
        setRawItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (rawItems.length === 0) {
      setItems([]);
      return;
    }
    Promise.all(
      rawItems.map(async it => {
        const res = await axios.get(
          `${ARTICLE_API}/articles/${it.article_id}`
        );
        return { ...it, article: res.data };
      })
    ).then(setItems);
  }, [rawItems]);

  const refreshCart = async () => {
    const res = await axios.get(`${CART_API}/carts/${cartId}`);
    setRawItems(res.data.items || []);
  };

  const updateQty = async (itemId, delta) => {
    const item = items.find(i => i.id === itemId);
    const newQty = item.quantity + delta;
    if (newQty < 1) {
      await removeItem(itemId);
      return;
    }
    try {
      await axios.post(
        `${CART_API}/carts/${cartId}/items`,
        { article_id: item.article_id, quantity: delta }
      );
      await refreshCart();
    } catch (err) {
      console.error('Fehler beim Aktualisieren der Menge', err);
      alert('Fehler beim Aktualisieren der Menge.');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await axios.delete(
        `${CART_API}/carts/${cartId}/items/${itemId}`
      );
      await refreshCart();
    } catch (err) {
      console.error('Fehler beim Entfernen des Artikels', err);
      alert('Fehler beim Entfernen des Artikels.');
    }
  };

  if (loading) {
    return (
      <div className="cart-container">
        <p>Lade Warenkorb…</p>
      </div>
    );
  }

  const total = items.reduce(
    (sum, i) => sum + i.quantity * (i.article?.price || 0),
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
                  src={item.article?.image_url || '/placeholder-book.png'}
                  alt={item.article?.name}
                  className="item-image"
                />
                <div className="item-info">
                  <p className="item-name">{item.article?.name}</p>
                  <p className="item-price">
                    {(item.quantity * (item.article?.price || 0)).toFixed(2)} €
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
