// client/src/App.jsx
// Main application router component for STYLEMUSE

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Wardrobe from './pages/Wardrobe';
import AddClothing from './pages/AddClothing';
import EditClothing from './pages/EditClothing';
import ClothingDetails from './pages/ClothingDetails';
import Outfits from './pages/Outfits';
import CreateOutfit from './pages/CreateOutfit';
import EditOutfit from './pages/EditOutfit';
import OutfitDetails from './pages/OutfitDetails';
import Favorites from './pages/Favorites';
import StyleRecommendations from './pages/StyleRecommendations';
import Profile from './pages/Profile';

import './App.css';

const AppContent = () => {
  const { user, loading } = useAuth();

  // Simple client-side path state synchronized with window.location.pathname
  const [currentPath, setCurrentPath] = useState(
    window.location.pathname === '' ? '/' : window.location.pathname
  );

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Listen to browser popstate (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Automatic redirect rules based on authentication status
  useEffect(() => {
    if (!loading) {
      if (user) {
        // If already logged in and visiting login or signup, redirect to dashboard
        if (currentPath === '/login' || currentPath === '/signup') {
          navigate('/dashboard');
        }
      } else {
        // If unauthenticated and trying to visit private protected routes
        const privateRoutes = [
          '/dashboard',
          '/wardrobe',
          '/wardrobe/add',
          '/outfits',
          '/outfits/create',
          '/favorites',
          '/recommendations',
          '/profile',
        ];
        const isPrivateRoute =
          privateRoutes.includes(currentPath) ||
          currentPath.startsWith('/wardrobe/') ||
          currentPath.startsWith('/outfits/');

        if (isPrivateRoute) {
          navigate('/login');
        }
      }
    }
  }, [user, loading, currentPath]);

  // Route matcher helper
  const matchRoute = (path) => {
    // Wardrobe Edit: /wardrobe/:id/edit
    const wardrobeEditMatch = path.match(/^\/wardrobe\/([a-zA-Z0-9_-]+)\/edit$/);
    if (wardrobeEditMatch) {
      return { route: 'wardrobe-edit', id: wardrobeEditMatch[1] };
    }

    // Wardrobe Add: /wardrobe/add
    if (path === '/wardrobe/add') {
      return { route: 'wardrobe-add' };
    }

    // Wardrobe Details: /wardrobe/:id
    const wardrobeDetailsMatch = path.match(/^\/wardrobe\/([a-zA-Z0-9_-]+)$/);
    if (wardrobeDetailsMatch) {
      return { route: 'wardrobe-details', id: wardrobeDetailsMatch[1] };
    }

    // Outfits Edit: /outfits/:id/edit
    const outfitEditMatch = path.match(/^\/outfits\/([a-zA-Z0-9_-]+)\/edit$/);
    if (outfitEditMatch) {
      return { route: 'outfit-edit', id: outfitEditMatch[1] };
    }

    // Outfits Create: /outfits/create
    if (path === '/outfits/create') {
      return { route: 'outfit-create' };
    }

    // Outfits Details: /outfits/:id
    const outfitDetailsMatch = path.match(/^\/outfits\/([a-zA-Z0-9_-]+)$/);
    if (outfitDetailsMatch) {
      return { route: 'outfit-details', id: outfitDetailsMatch[1] };
    }

    // Static pages
    if (path === '/wardrobe') return { route: 'wardrobe' };
    if (path === '/outfits') return { route: 'outfits' };
    if (path === '/favorites') return { route: 'favorites' };
    if (path === '/recommendations') return { route: 'recommendations' };
    if (path === '/profile') return { route: 'profile' };
    if (path === '/dashboard') return { route: 'dashboard' };
    if (path === '/signup') return { route: 'signup' };
    if (path === '/login') return { route: 'login' };
    if (path === '/') return { route: 'landing' };

    // Default route
    return { route: 'landing' };
  };

  const renderCurrentView = () => {
    if (loading) {
      return (
        <div className="auth-loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading StyleMuse...</p>
        </div>
      );
    }

    const { route, id } = matchRoute(currentPath);

    switch (route) {
      case 'landing':
        return <Landing onNavigate={navigate} />;

      case 'login':
        return <Login onNavigate={navigate} />;

      case 'signup':
        return <Signup onNavigate={navigate} />;

      case 'dashboard':
        return (
          <ProtectedRoute onNavigate={navigate}>
            <Dashboard onNavigate={navigate} />
          </ProtectedRoute>
        );

      case 'wardrobe':
        return (
          <ProtectedRoute onNavigate={navigate}>
            <Wardrobe onNavigate={navigate} />
          </ProtectedRoute>
        );

      case 'wardrobe-add':
        return (
          <ProtectedRoute onNavigate={navigate}>
            <AddClothing onNavigate={navigate} />
          </ProtectedRoute>
        );

      case 'wardrobe-edit':
        return (
          <ProtectedRoute onNavigate={navigate}>
            <EditClothing itemId={id} onNavigate={navigate} />
          </ProtectedRoute>
        );

      case 'wardrobe-details':
        return (
          <ProtectedRoute onNavigate={navigate}>
            <ClothingDetails itemId={id} onNavigate={navigate} />
          </ProtectedRoute>
        );

      case 'outfits':
        return (
          <ProtectedRoute onNavigate={navigate}>
            <Outfits onNavigate={navigate} />
          </ProtectedRoute>
        );

      case 'outfit-create':
        return (
          <ProtectedRoute onNavigate={navigate}>
            <CreateOutfit onNavigate={navigate} />
          </ProtectedRoute>
        );

      case 'outfit-edit':
        return (
          <ProtectedRoute onNavigate={navigate}>
            <EditOutfit outfitId={id} onNavigate={navigate} />
          </ProtectedRoute>
        );

      case 'outfit-details':
        return (
          <ProtectedRoute onNavigate={navigate}>
            <OutfitDetails outfitId={id} onNavigate={navigate} />
          </ProtectedRoute>
        );

      case 'favorites':
        return (
          <ProtectedRoute onNavigate={navigate}>
            <Favorites onNavigate={navigate} />
          </ProtectedRoute>
        );

      case 'recommendations':
        return (
          <ProtectedRoute onNavigate={navigate}>
            <StyleRecommendations onNavigate={navigate} />
          </ProtectedRoute>
        );

      case 'profile':
        return (
          <ProtectedRoute onNavigate={navigate}>
            <Profile onNavigate={navigate} />
          </ProtectedRoute>
        );

      default:
        return <Landing onNavigate={navigate} />;
    }
  };

  return (
    <div className="app-container">
      <Navbar currentPath={currentPath} onNavigate={navigate} />
      <main className="main-content">{renderCurrentView()}</main>
      <footer className="app-footer">
        <div className="footer-content">
          <p className="footer-brand">StyleMuse 🌸</p>
          <p className="footer-quote">"Your wardrobe. Your mood. Your style."</p>
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} StyleMuse — Personal Fashion & Outfit Management System
          </p>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
