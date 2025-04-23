// src/components/Checkout.js
import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const { customerId } = useContext(AuthContext);
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://192.168.178.122:8002/carts/${customerId}`)
      .then(res => setCart(res.data.items))
      .catch(() => setCart([]));
  }, [customerId]);

  const handlePlaceOrder = () => {
    const payload = {
      customer_id: customerId,
      items: cart.map(i => ({ article_id: i.article_id, quantity: i.quantity }))
    };
    axios.post("http://192.168.178.122:8003/orders/", payload)
      .then(() => {
        alert("Bestellung aufgenommen!");
        navigate("/profile");
      })
      .catch(() => alert("Fehler beim Bestellen"));
  };

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      {cart.length === 0
        ? <p>Dein Warenkorb ist leer.</p>
        : (
          <div>
            <ul>
              {cart.map(i => (
                <li key={i.article_id}>
                  Artikel {i.article_id} × {i.quantity}
                </li>
              ))}
            </ul>
            <button onClick={handlePlaceOrder} className="btn-primary">
              Bestellung abschicken
            </button>
          </div>
        )
      }
    </div>
  );
}

export default Checkout;
