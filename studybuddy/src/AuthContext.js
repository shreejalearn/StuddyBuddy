// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ token: false });

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setAuth({ token: true });
    }
  }, []);

  const login = (token) => {
    setAuth({ token: true });
    localStorage.setItem('authToken', token);
  };

  const logout = () => {
    setAuth({ token: false });
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
