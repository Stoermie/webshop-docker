// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext({
  customerId: null,
  isLoggedIn: false,
  login: (_id) => {},
  logout: () => {}
});

export function AuthProvider({ children }) {
  const [customerId, setCustomerId] = useState(null);

  // beim Start aus localStorage laden
  useEffect(() => {
    const saved = localStorage.getItem('customerId');
    if (saved) setCustomerId(saved);
  }, []);

  const login = id => {
    localStorage.setItem('customerId', id);
    setCustomerId(id);
  };

  const logout = () => {
    localStorage.removeItem('customerId');
    setCustomerId(null);
  };

  const isLoggedIn = Boolean(customerId);

  return (
    <AuthContext.Provider value={{ customerId, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
