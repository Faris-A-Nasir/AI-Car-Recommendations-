import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // correct ES module import

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ email: decoded.email, name: decoded.name });
      } catch (err) {
        console.error('Invalid token in localStorage:', err);
        localStorage.removeItem('token');
      }
    }
  }, []);

   // 🔁 Watch token changes and auto-logout if removed
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (!token && user) {
        setUser(null);
        setChatHistory([]);
      }
    }, 500); // check every half second

    return () => clearInterval(interval);
  }, [user]);

  const login = (token) => {
    try {
      const decoded = jwtDecode(token);
      setUser({ email: decoded.email, name: decoded.name });
      localStorage.setItem('token', token);
    } catch (err) {
      console.error('Failed to decode token at login:', err);
    }
  };

  const logout = () => {
    setUser(null);
    setChatHistory([]);
    localStorage.removeItem('token');
  };

  const addToHistory = (message) => {
    setChatHistory((prev) => [...prev, message]);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, chatHistory, addToHistory }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Make sure this line exists!
export const useAuth = () => useContext(AuthContext);
