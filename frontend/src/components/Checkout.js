import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

export default function Checkout() {
  const { customerId, isLoggedIn } = useContext(AuthContext);
  const [cart, setCart] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const cartId = localStorage.getItem("cartId");
    if (!cartId) {
      setLoading(false);
      return;
    }
    axios
      .get(`${process.env.REACT_APP_API_CART}/carts/${cartId}`)
      .then(res => setCart(res.data.items || []))
      .catch(() => setCart([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (cart.length === 0) {
      setItems([]);
      return;
    }
    setLoading(true);
    Promise.all(
      cart.map(item =>
        axios
          .get(`${process.env.REACT_APP_API_CATALOG}/api/articles/${item.article_id}`)
          .then(res => {
            const article = res.data;
            const coverUrl = article.isbn
              ? `https://covers.openlibrary.org/b/isbn/${article.isbn}-M.jpg`
              : null;
            return { ...item, article: { ...article, coverUrl } };
          })
          .catch(() => ({ ...item, article: { coverUrl: null } }))
      )
    )
      .then(detailItems => setItems(detailItems))
      .finally(() => setLoading(false));
  }, [cart]);

  const handlePlaceOrder = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    const cartId = localStorage.getItem("cartId");
    try {
      await axios.post(`${process.env.REACT_APP_API_ORDER}/orders/`, {
        customer_id: customerId,
        cart_id: cartId,
        items: cart.map(i => ({ article_id: i.article_id, quantity: i.quantity }))
      });
      localStorage.removeItem("cartId");
      setCart([]);
      setItems([]);
      navigate("/order-confirmation");
    } catch {
      alert("Bestellung fehlgeschlagen.");
    }
  };

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
              const imgSrc = it.article.coverUrl || "/placeholder-book.png";
              return (
                <li key={it.id} className="checkout-item">
                  <img src={imgSrc} alt={it.article.name} />
                  <div className="checkout-item-info">
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

