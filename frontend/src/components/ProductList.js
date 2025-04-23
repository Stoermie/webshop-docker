import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import './ProductList.css';

function ProductList() {
  const [books, setBooks] = useState([]);
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';

  useEffect(() => {
    axios.get("http://192.168.178.122:8000/api/articles/")
      .then(response => setBooks(response.data))
      .catch(error => console.error("Fehler beim Laden der Bücher:", error));
  }, []);

  // Filtert die Bücherliste nach dem Suchbegriff (case‑insensitive)
  const filteredBooks = books.filter(book =>
    book.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="books-container">
      <h1>
        {searchTerm
          ? `Suchergebnisse für „${searchTerm}“`
          : 'Unsere Bücher'}
      </h1>
      {!searchTerm && <p className="books-subtitle">Tauche ein in die Welt der Geschichten!</p>}

      {filteredBooks.length === 0
        ? <p>Keine Bücher gefunden{searchTerm && ` für „${searchTerm}“`}.</p>
        : (
          <div className="books-grid">
            {filteredBooks.map(book => (
              <div className="book-card" key={book.article_id}>
                <img
                  src={book.image_url || 'https://via.placeholder.com/180x240?text=Kein+Cover'}
                  alt={book.name}
                  className="book-image"
                />
                <h2 className="book-title">{book.name}</h2>
                {book.author && <p className="book-author">{book.author}</p>}
                <p className="book-price">{book.price.toFixed(2)} €</p>
                <Link to={`/product/${book.article_id}`} className="book-link">
                  Details
                </Link>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}

export default ProductList;
