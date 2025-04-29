import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import './ProductList.css';

export default function ProductList() {
  const [books, setBooks] = useState([]);
  const [addingId, setAddingId] = useState(null);
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';

  // Bücher laden
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_CATALOG}/api/articles/`)
      .then(res => setBooks(res.data))
      .catch(err => console.error(err));
  }, []);

  const filteredBooks = books.filter(book =>
    book.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCartId = async () => {
    let cartId = localStorage.getItem('cartId');
    if (!cartId) {
      const res = await axios.post(`${process.env.REACT_APP_API_CART}/carts/`, {});
      cartId = res.data.id;
      localStorage.setItem('cartId', cartId);
    }
    return cartId;
  };

  const addToCart = async (id) => {
    setAddingId(id);
    try {
      const cartId = await getCartId();
      await axios.post(
        `${process.env.REACT_APP_API_CART}/carts/${cartId}/items`,
        { article_id: id, quantity: 1 }
      );
      alert('Buch zum Warenkorb hinzugefügt!');
    } catch (err) {
      console.error(err);
      alert('Fehler beim Hinzufügen zum Warenkorb.');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="books-grid">
      {filteredBooks.map(book => (
        <Link
          to={`/product/${book.article_id}`}
          key={book.article_id}
          className="book-card"
        >
          <div className="book-image-wrap">
            <img
              src={book.image_url || 'https://via.placeholder.com/180x240?text=Kein+Cover'}
              alt={book.name}
              className="book-image"
              loading="lazy"
            />
          </div>
          <div className="book-body">
            <h2 className="book-title">{book.name}</h2>
            {book.author && <p className="book-author">von {book.author}</p>}
            <p className="book-price">{book.price.toFixed(2)} €</p>
            <button
              className="book-add-btn"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(book.article_id);
              }}
              disabled={addingId === book.article_id}
              title="In den Warenkorb"
            >
              {addingId === book.article_id ? '…' : '🛒'}
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
}

