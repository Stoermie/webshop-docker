import React from 'react';
import { Link } from 'react-router-dom';
import './OrderConfirmation.css';

export default function OrderConfirmation() {
  return (
    <div className="order-confirmation-container">
      <h2>Vielen Dank für Ihre Bestellung!</h2>
      <p>Ihre Bestellung wurde erfolgreich durchgeführt.</p>
      <Link to="/" className="btn-primary">
        Zur Startseite
      </Link>
    </div>
  );
}