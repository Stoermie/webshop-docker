import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import './ProductDetails.css';

export default function ProductDetails() {
  const { id: bookId } = useParams();
  const [book, setBook] = useState(null);
  const [recs, setRecs] = useState([]);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_CATALOG}/api/articles/${bookId}`)
      .then(res => setBook(res.data))
      .catch(console.error);
  }, [bookId]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_CATALOG}/api/articles/`)
      .then(res => {
        const others = res.data.filter(b => b.article_id !== +bookId);
        const picks = [];
        while (picks.length < 4 && others.length) {
          const idx = Math.floor(Math.random() * others.length);
          picks.push(others.splice(idx, 1)[0]);
        }
        setRecs(picks);
      })
      .catch(console.error);
  }, [bookId]);

  const getCartId = async () => {
    let cartId = localStorage.getItem('cartId');
    if (!cartId) {
      const res = await axios.post(`${process.env.REACT_APP_API_CART}/carts/`, {});
      cartId = res.data.id;
      localStorage.setItem('cartId', cartId);
    }
    return cartId;
  };

  const handleAddToCart = async (articleId) => {
    setAddingId(articleId);
    try {
      const cartId = await getCartId();
      await axios.post(
        `${process.env.REACT_APP_API_CART}/carts/${cartId}/items`,
        { article_id: articleId, quantity: 1 }
      );
      alert('Buch zum Warenkorb hinzugefügt!');
    } catch (err) {
      console.error(err);
      alert('Fehler beim Hinzufügen zum Warenkorb.');
    } finally {
      setAddingId(null);
    }
  };

  if (!book) return <div className="pd-loading">Lade Buchdaten…</div>;

  return (
    <div className="pd-page">
      <div className="pd-main">
        <div className="pd-image-col">
          <img
            src={book.image_url || '/placeholder-book.png'}
            alt={book.name}
            className="pd-image"
          />
        </div>
        <div className="pd-info-col">
          <h1 className="pd-title">{book.name}</h1>
          {book.author && <p className="pd-author">von {book.author}</p>}
          <p className="pd-price">{book.price.toFixed(2)} €</p>
          <p className="pd-category">{book.book_category || '—'}</p>
          <p className="pd-isbn"><strong>ISBN:</strong> {book.isbn || '—'}</p>
          <p className="pd-delivery"><strong>Lieferzeit:</strong> 1–3 Arbeitstage</p>

          <button
            className="pd-add-btn"
            onClick={() => handleAddToCart(+bookId)}
            disabled={addingId === +bookId}
          >
            {addingId === +bookId ? '…' : 'In den Warenkorb'}
          </button>

          {book.description && (
            <div className="pd-desc">
              <h2>Beschreibung</h2>
              <p>{book.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="pd-recs">
        <h2>Vielleicht interessieren Sie sich auch für</h2>
        <div className="pd-recs-grid">
          {recs.map(r => (
            <Link
              to={`/product/${r.article_id}`}
              key={r.article_id}
              className="pd-rec-card"
            >
              <img
                src={r.image_url || '/placeholder-book.png'}
                alt={r.name}
                className="pd-rec-img"
              />
              <p className="pd-rec-title">{r.name}</p>
              <p className="pd-rec-price">{r.price.toFixed(2)} €</p>
              <button
                className="pd-rec-add"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCart(r.article_id);
                }}
                disabled={addingId === r.article_id}
              >
                {addingId === r.article_id ? '…' : '🛒'}
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

