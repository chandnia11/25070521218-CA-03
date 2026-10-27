// client/src/pages/Profile.jsx
// Personal Profile for StyleMuse user

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as styleService from '../services/styleService';

const Profile = ({ onNavigate }) => {
  const { user, token, logout } = useAuth();
  const [stats, setStats] = useState({
    totalWardrobeItems: 0,
    totalOutfits: 0,
    favoriteClothingCount: 0,
    favoriteOutfitsCount: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await styleService.getStyleDashboard(token);
        if (data && data.stats) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to load profile stats:', err);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    onNavigate('/login');
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-cover"></div>
        <div className="profile-avatar-wrapper">
          <div className="profile-large-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>
        </div>

        <div className="profile-details">
          <h2>{user?.name || 'StyleMuse Member'}</h2>
          <p className="profile-email">{user?.email || 'member@stylemuse.com'}</p>

          <span className="hero-tag" style={{ marginBottom: '1.5rem' }}>
            🌸 StyleMuse Curator
          </span>

          <div className="profile-stats-row">
            <div className="profile-stat-item" onClick={() => onNavigate('/wardrobe')} style={{ cursor: 'pointer' }}>
              <span className="profile-stat-number">{stats.totalWardrobeItems}</span>
              <span className="profile-stat-title">Wardrobe Items</span>
            </div>

            <div className="profile-stat-item" onClick={() => onNavigate('/outfits')} style={{ cursor: 'pointer' }}>
              <span className="profile-stat-number">{stats.totalOutfits}</span>
              <span className="profile-stat-title">Curated Outfits</span>
            </div>

            <div className="profile-stat-item" onClick={() => onNavigate('/favorites')} style={{ cursor: 'pointer' }}>
              <span className="profile-stat-number">{stats.favoriteOutfitsCount + stats.favoriteClothingCount}</span>
              <span className="profile-stat-title">Total Favorites</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxWidth: '300px', margin: '0 auto' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => onNavigate('/wardrobe/add')}
            >
              + Add Clothing Item
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => onNavigate('/outfits/create')}
            >
              + Create New Outfit
            </button>
            <button
              type="button"
              className="btn-secondary btn-danger"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
