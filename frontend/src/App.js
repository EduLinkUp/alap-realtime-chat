import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Chatting from './pages/chatting';
import Signin from './pages/signin';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/signin" />;
};

// Public Route Component (redirects to chat if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  return user ? <Navigate to="/chat" /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/signin" element={
        <PublicRoute>
          <Signin />
        </PublicRoute>
      } />
      <Route path="/chat" element={
        <ProtectedRoute>
          <SocketProvider>
            <Chatting />
          </SocketProvider>
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/chat" />} />
      <Route path="*" element={<Navigate to="/chat" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
