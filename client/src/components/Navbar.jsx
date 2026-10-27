// client/src/components/Navbar.jsx
// StyleMuse navigation bar

import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ currentPath, onNavigate }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onNavigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <div className="navbar-brand" onClick={() => onNavigate('/')}>
          <div className="navbar-logo-icon">🌸</div>
          <div className="navbar-brand-text">
            <span className="navbar-title">StyleMuse</span>
            <span className="navbar-tagline">Your wardrobe. Your mood. Your style.</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="navbar-nav">
          <button
            type="button"
            className={`nav-link ${currentPath === '/' ? 'active' : ''}`}
            onClick={() => onNavigate('/')}
          >
            ✦ Home
          </button>

          {user ? (
            <div className="navbar-user-actions">
              <button
                type="button"
                className={`nav-link ${currentPath === '/wardrobe' ? 'active' : ''}`}
                onClick={() => onNavigate('/wardrobe')}
              >
                👗 Wardrobe
              </button>

              <button
                type="button"
                className={`nav-link ${currentPath === '/outfits' ? 'active' : ''}`}
                onClick={() => onNavigate('/outfits')}
              >
                ✨ Outfits
              </button>

              <button
                type="button"
                className={`nav-link ${currentPath === '/favorites' ? 'active' : ''}`}
                onClick={() => onNavigate('/favorites')}
              >
                ♡ Favorites
              </button>

              <button
                type="button"
                className={`nav-link ${currentPath === '/recommendations' ? 'active' : ''}`}
                onClick={() => onNavigate('/recommendations')}
              >
                🪄 Style Muse
              </button>

              <button
                type="button"
                className={`nav-link ${currentPath === '/dashboard' ? 'active' : ''}`}
                onClick={() => onNavigate('/dashboard')}
              >
                📊 Dashboard
              </button>

              <button
                type="button"
                className={`user-tag ${currentPath === '/profile' ? 'active' : ''}`}
                onClick={() => onNavigate('/profile')}
                title="View Profile"
              >
                <span className="user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                <span className="user-name">
                  {user.name ? user.name.split(' ')[0] : 'User'}
                </span>
              </button>

              <button type="button" className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar-auth-actions">
              <button
                type="button"
                className={`nav-link ${currentPath === '/login' ? 'active' : ''}`}
                onClick={() => onNavigate('/login')}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`btn-primary-nav ${currentPath === '/signup' ? 'active' : ''}`}
                onClick={() => onNavigate('/signup')}
              >
                Get Started
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
