// src/components/Checkout.js
import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

function Checkout() {
  const { customerId, isLoggedIn } = useContext(AuthContext);
  const [cart, setCart] = useState([]);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  // Warenkorb vom Cart-Service holen
  useEffect(() => {
    if (!customerId) return;
    axios
      .get(`http://192.168.178.122:8002/carts/${customerId}`)
      .then(res => setCart(res.data.items))
      .catch(() => setCart([]));
  }, [customerId]);

  // Details (Bild, Name, Preis) aus Catalog-Service holen
  useEffect(() => {
    if (cart.length === 0) {
      setItems([]);
      return;
    }
    Promise.all(
      cart.map(item =>
        axios
          .get(`http://192.168.178.122:8000/api/articles/${item.article_id}`)
          .then(res => ({ ...item, article: res.data }))
      )
    ).then(setItems);
  }, [cart]);

  // Bestellen und Warenkorb leeren
  const handlePlaceOrder = async () => {
    try {
      // 1) Bestellung anlegen
      await axios.post("http://192.168.178.122:8003/orders/", {
        customer_id: customerId,
        items: items.map(i => ({
          article_id: i.article_id,
          quantity: i.quantity
        }))
      });

      // 2) Alle Cart-Items löschen
      await Promise.all(
        items.map(i =>
          axios.delete(
            `http://192.168.178.122:8002/carts/${customerId}/items/${i.id}`
          )
        )
      );

      alert("Bestellung aufgenommen und Warenkorb geleert!");
      navigate("/profile");
    } catch (err) {
      console.error("Fehler beim Bestellen oder Leeren des Warenkorbs:", err);
      alert("Fehler beim Bestellen. Bitte versuche es später erneut.");
    }
  };

  if (!isLoggedIn) {
    return <p>Bitte logge dich ein, um deine Bestellung abzuschließen.</p>;
  }

  // Zwischensumme
  const totalPrice = items.reduce(
    (sum, i) => sum + i.quantity * i.article.price,
    0
  );

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>

      {items.length === 0 ? (
        <p>Dein Warenkorb ist leer.</p>
      ) : (
        <div className="checkout-list">
          {items.map(i => (
            <div className="checkout-item" key={i.article_id}>
              <img
                src={i.article.image_url || "/placeholder-book.png"}
                alt={i.article.name}
                className="checkout-item-image"
              />
              <div className="checkout-item-details">
                <p className="checkout-item-name">{i.article.name}</p>
                <p className="checkout-item-qty">× {i.quantity}</p>
                <p className="checkout-item-price">
                  {(i.article.price * i.quantity).toFixed(2)} €
                </p>
              </div>
            </div>
          ))}

          <div className="checkout-summary">
            <span>Zwischensumme:</span>
            <strong>{totalPrice.toFixed(2)} €</strong>
          </div>

          <button onClick={handlePlaceOrder} className="btn-primary">
            Bestellung abschicken
          </button>
        </div>
      )}
    </div>
  );
}

export default Checkout;
