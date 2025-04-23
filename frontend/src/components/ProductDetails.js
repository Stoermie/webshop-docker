import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ProductDetails.css';

function ProductDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);

  useEffect(() => {
    axios
      .get(`http://192.168.178.122:8000/api/articles/${id}`)
      .then(response => setBook(response.data))
      .catch(error => console.error('Fehler beim Laden der Buchdetails:', error));
  }, [id]);

  const addToCart = () => {
    axios
      .post(`http://192.168.178.122:8002/carts/1/items/`, {
        article_id: book.article_id,
        quantity: 1,
      })
      .then(() => alert('Buch wurde zum Warenkorb hinzugefügt.'))
      .catch(error => console.error('Fehler beim Hinzufügen zum Warenkorb:', error));
  };

  if (!book) {
    return <div className="loading">Lade Buchdetails…</div>;
  }

  return (
    <div className="product-details">
      <div className="product-image">
        <img
          src={book.image_url || '/placeholder-book.png'}
          alt={book.name}
        />
      </div>
      <div className="product-info">
        <h1 className="product-title">{book.name}</h1>
        {book.author && <p className="product-author">{book.author}</p>}
        <p className="product-price">{book.price.toFixed(2)} €</p>
        <p className="product-category">
          {book.book_category || 'Keine Kategorie'}
        </p>
        {book.isbn && (
          <p className="product-isbn"><strong>ISBN:</strong> {book.isbn}</p>
        )}
        <div className="product-description">
          <h2>Beschreibung</h2>
          <p>{book.description || 'Leider liegt keine Beschreibung vor.'}</p>
        </div>
        <button className="btn-add-cart" onClick={addToCart}>
          In den Warenkorb
        </button>
      </div>
    </div>
  );
}

export default ProductDetails;
