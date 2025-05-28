// src/RouteChangeHandler.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const RouteChangeHandler = () => {
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');

    // If token exists and user is navigating away from /chat, remove the token
    if (token && location.pathname !== '/chat') {
      localStorage.removeItem('token');
      console.log('Token removed due to browser back or route change away from /chat');
    }
  }, [location]);

  return null;
};

export default RouteChangeHandler;
