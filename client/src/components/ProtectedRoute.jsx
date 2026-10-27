// client/src/components/ProtectedRoute.jsx
// Protects routes from unauthenticated access

import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component
 * Renders children if authenticated, otherwise redirects or displays loading
 */
const ProtectedRoute = ({ children, onNavigate }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="loading-spinner"></div>
        <p>Verifying authentication...</p>
      </div>
    );
  }

  if (!user) {
    // If not authenticated, prompt navigation to login
    if (onNavigate) {
      onNavigate('/login');
    }
    return null;
  }

  return children;
};

export default ProtectedRoute;
