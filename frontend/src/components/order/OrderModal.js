import React from 'react';
import './OrderModal.css';

function OrderModal({ children, onClose }) {
  return (
    <div className="order-modal-overlay" onClick={onClose}>
      <div className="order-modal-content" onClick={e => e.stopPropagation()}>  
        <button className="order-modal-close" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}

export default OrderModal;