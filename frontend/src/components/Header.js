import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Header.css';

function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const { isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const submitHandler = e => {
    e.preventDefault();
    const q = searchTerm.trim();
    navigate(q ? `/?search=${encodeURIComponent(q)}` : '/');
  };


  useEffect(() => {
    const handler = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="header">
      {/* Logo + Titel */}
      <div className="header-left">
        <Link to="/" className="logo-link">
          <img src="/websitelogo.png" alt="Logo" className="header-logo" />
          <span className="logo-text">Wortwunderland</span>
        </Link>
      </div>

      {/* Suchleiste */}
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

      {/* Profil-Dropdown + Warenkorb */}
      <div className="header-right">
        <div className="header-profile column" ref={menuRef}>
          <img
            src="/benutzerlogo.png"
            alt="Profil"
            className="header-icon profile-icon"
            onClick={() => setMenuOpen(o => !o)}
          />
          <span className="icon-caption" onClick={() => setMenuOpen(o => !o)}>
            Mein Konto
          </span>
          {menuOpen && (
            <div className="profile-menu dark">
              {isLoggedIn ? (
                <>
                  <Link to="/profile" className="menu-item">
                    Profil
                  </Link>
                  <button
                    className="menu-item logout-item"
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                      navigate('/');
                    }}
                  >
                    Abmelden
                  </button>
                </>
              ) : (
                <Link to="/login" className="menu-item">
                  Anmelden
                </Link>
              )}
            </div>
          )}
        </div>

        <Link to="/cart" className="icon-link">
          <img src="/cart.png" alt="Warenkorb" className="header-icon" />
          <span className="icon-caption">Warenkorb</span>
        </Link>
      </div>
    </header>
  );
}

export default Header;
