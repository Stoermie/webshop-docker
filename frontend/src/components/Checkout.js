// src/components/Checkout.js
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

export default function Checkout() {
  const { customerId, isLoggedIn } = useContext(AuthContext);
  const [cart, setCart] = useState([]);    // nur cart‐items (article_id + quantity)
  const [items, setItems] = useState([]);  // cart‐items plus article‐details
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1) Warenkorb laden
  useEffect(() => {
    const cartId = localStorage.getItem("cartId");
    if (!cartId) {
      setLoading(false);
      return;
    }
    axios
      .get(`http://192.168.178.122:8002/carts/${cartId}`)
      .then(res => setCart(res.data.items || []))
      .catch(() => setCart([]))
      .finally(() => setLoading(false));
  }, []);

  // 2) Produkt-Details aus Catalog holen
  useEffect(() => {
    if (cart.length === 0) {
      setItems([]);
      return;
    }
    setLoading(true);
    Promise.all(
      cart.map(item =>
        axios
          .get(`http://192.168.178.122:8000/api/articles/${item.article_id}`)
          .then(res => {
            const article = res.data;
            // OpenLibrary-Cover-URL aus der ISBN generieren
            const coverUrl = article.isbn
              ? `https://covers.openlibrary.org/b/isbn/${article.isbn}-M.jpg`
              : null;
            return {
              ...item,
              article: {
                ...article,
                coverUrl
              }
            };
          })
          .catch(() => ({
            ...item,
            article: { coverUrl: null }
          }))
      )
    )
      .then(detailItems => setItems(detailItems))
      .finally(() => setLoading(false));
  }, [cart]);

  // 3) Bestellung abschicken und Warenkorb leeren
  const handlePlaceOrder = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    const cartId = localStorage.getItem("cartId");
    try {
      await axios.post("http://192.168.178.122:8003/orders/", {
        customer_id: customerId,
        cart_id: cartId,
        items: cart.map(i => ({
          article_id: i.article_id,
          quantity: i.quantity,
        })),
      });
      // Warenkorb zurücksetzen
      localStorage.removeItem("cartId");
      setCart([]);
      setItems([]);
      navigate("/order-confirmation");
    } catch (err) {
      console.error(err);
      alert("Bestellung fehlgeschlagen.");
    }
  };

  // 4) Zwischensumme berechnen
  const totalPrice = items.reduce(
    (sum, it) => sum + (it.article.price || 0) * it.quantity,
    0
  );

  if (loading) {
    return (
      <div className="checkout-container">
        <p>Lade Warenkorb …</p>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h2>Zur Kasse</h2>

      {items.length === 0 ? (
        <p>Warenkorb ist leer.</p>
      ) : (
        <>
          <ul className="checkout-items">
            {items.map(it => {
              const imgSrc = it.article.coverUrl
                || "/placeholder-book.png";  // Fallback, falls Cover nicht verfügbar
              return (
                <li key={it.id} className="checkout-item">
                  <img
                    src={imgSrc}
                    alt={it.article.title || "Buch-Cover"}
                    onError={e => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-book.png";
                    }}
                  />
                  <div className="checkout-item-info">
                    {/* Titel und Autor anzeigen */}
                    <h3 className="checkout-title">{it.article.name}</h3>
                    <p className="checkout-author">von {it.article.author}</p>
                    
                    <p>
                      {it.quantity} × {(it.article.price || 0).toFixed(2)} €
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="checkout-summary">
            <span>Zwischensumme:</span>
            <strong>{totalPrice.toFixed(2)} €</strong>
          </div>

          <button onClick={handlePlaceOrder} className="btn-primary">
            Bestellung abschicken
          </button>
        </>
      )}
    </div>
  );
}
