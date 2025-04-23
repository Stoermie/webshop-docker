// src/components/Header.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const isLoggedIn = false; // später aus deinem Auth‑Context

  const submitHandler = e => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (!query) {
      navigate('/');
    } else {
      navigate(`/?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="header">
      {/* Links (Logo + Titel) */}
      <div className="header-left">
        <Link to="/" className="logo-link">
          <img src="/websitelogo.png" alt="Logo" className="header-logo" />
          <span className="logo-text">Wortwunderland</span>
        </Link>
      </div>

      {/* Suchleiste in der Mitte */}
      <div className="header-center">
        <form onSubmit={submitHandler} className="search-form">
          <input
            type="text"
            placeholder="Bücher suchen…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">🔍</button>
        </form>
      </div>

      {/* Icons rechts */}
      <div className="header-right">
        <div className="header-icon-container">
          <Link to={isLoggedIn ? "/profile" : "/login"} className="icon-link">
            <img src="/benutzerlogo.png" alt="Benutzerprofil" className="header-icon" />
            <span className="icon-caption">Mein Konto</span>
          </Link>
        </div>
        <div className="header-icon-container">
          <Link to="/cart" className="icon-link">
            <img src="/cart.png" alt="Warenkorb" className="header-icon" />
            <span className="icon-caption">Warenkorb</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
