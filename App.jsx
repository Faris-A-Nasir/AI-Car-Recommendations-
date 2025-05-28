import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import LandingPage from './pages/LandingPage';
import { AuthProvider } from './context/AuthContext';
import RouteChangeHandler from './RouteChangeHandler'; // ✅ Import this

function App() {
  return (
    <AuthProvider>
      <Router>
        <RouteChangeHandler /> {/* ✅ Watch for route changes */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
