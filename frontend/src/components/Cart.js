import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Cart.css'; // Styles siehe unten

function Cart() {
  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const cartId = 1; // später durch eingeloggten User ersetzen

  // 1. Warenkorb‑Metadaten holen
  const fetchCart = () => {
    axios
      .get(`http://192.168.178.122:8002/carts/${cartId}`)
      .then(res => setCart(res.data))
      .catch(err => console.error("Cart laden:", err));
  };

  // 2. Beim Mounten einmal laden
  useEffect(fetchCart, []);

  // 3. Sobald sich cart ändert, Details aus Catalog holen
  useEffect(() => {
    if (!cart) return;
    Promise.all(
      cart.items.map(async item => {
        const res = await axios.get(
          `http://192.168.178.122:8000/api/articles/${item.article_id}`
        );
        return {
          ...item,
          article: res.data
        };
      })
    )
      .then(setItems)
      .catch(err => console.error("Details holen:", err));
  }, [cart]);

  // 4. Menge updaten (PUT)
  const updateQty = (itemId, delta) => {
    const item = items.find(i => i.id === itemId);
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    axios
      .put(
        `http://192.168.178.122:8002/carts/${cartId}/items/${itemId}`,
        { article_id: item.article_id, quantity: newQty }
      )
      .then(fetchCart)
      .catch(err => console.error("Menge updaten:", err));
  };

  // 5. Artikel entfernen (DELETE)
  const removeItem = itemId => {
    axios
      .delete(`http://192.168.178.122:8002/carts/${cartId}/items/${itemId}`)
      .then(fetchCart)
      .catch(err => console.error("Entfernen:", err));
  };

  // 6. Gesamtsumme berechnen
  const totalPrice = items.reduce(
    (sum, i) => sum + i.quantity * i.article.price,
    0
  );

  return (
    <div className="cart-container">
      <h1 className="cart-title">Dein Warenkorb</h1>

      {items.length > 0 ? (
        <>
          <div className="cart-items">
            {items.map(item => (
              <div className="cart-item" key={item.id}>
                <img
                  src={item.article.image_url || '/placeholder-book.png'}
                  alt={item.article.name}
                  className="item-image"
                />
                <div className="item-details">
                  <p className="item-name">{item.article.name}</p>
                  <p className="item-price">
                    {item.article.price.toFixed(2)} €
                  </p>
                </div>
                <div className="item-qty">
                  <button
                    className="qty-btn"
                    onClick={() => updateQty(item.id, -1)}
                  >
                    –
                  </button>
                  <input
                    className="qty-input"
                    type="text"
                    value={item.quantity}
                    readOnly
                  />
                  <button
                    className="qty-btn"
                    onClick={() => updateQty(item.id, +1)}
                  >
                    +
                  </button>
                </div>
                <p className="item-total">
                  {(item.quantity * item.article.price).toFixed(2)} €
                </p>
                <button
                  className="remove-btn"
                  onClick={() => removeItem(item.id)}
                >
                  Entfernen
                </button>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <p className="cart-sum">
              Zwischensumme: <strong>{totalPrice.toFixed(2)} €</strong>
            </p>
            <button className="checkout-btn">
              Weiter zur Kasse
            </button>
          </div>
        </>
      ) : (
        <p className="empty-msg">Dein Warenkorb ist noch leer.</p>
      )}
    </div>
  );
}

export default Cart;
