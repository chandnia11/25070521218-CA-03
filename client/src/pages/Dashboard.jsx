// client/src/pages/Dashboard.jsx
// Personal Style Dashboard for authenticated user

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as styleService from '../services/styleService';
import * as wardrobeService from '../services/wardrobeService';
import * as outfitService from '../services/outfitService';

const Dashboard = ({ onNavigate }) => {
  const { user, token } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await styleService.getStyleDashboard(token);
      setDashboardData(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboard();
    }
  }, [token]);

  const handleToggleClothingFav = async (id, e) => {
    e.stopPropagation();
    try {
      await wardrobeService.toggleWardrobeFavorite(id, token);
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleOutfitFav = async (id, e) => {
    e.stopPropagation();
    try {
      await outfitService.toggleOutfitFavorite(id, token);
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Curating your personal style dashboard...</p>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    totalWardrobeItems: 0,
    totalOutfits: 0,
    favoriteOutfitsCount: 0,
    favoriteClothingCount: 0,
  };

  const recentClothing = dashboardData?.recentClothing || [];
  const recentOutfits = dashboardData?.recentOutfits || [];

  return (
    <div className="dashboard-page">
      {/* Welcome Banner */}
      <section className="dashboard-hero-card">
        <div className="dashboard-welcome">
          <span className="hero-tag">🌸 StyleMuse Sanctuary</span>
          <h1>Welcome, {user?.name || 'Fashionista'}!</h1>
          <p>Here is your daily fashion snapshot and wardrobe management overview.</p>
        </div>

        <div className="dashboard-quick-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => onNavigate('/wardrobe/add')}
          >
            + Add Clothing
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigate('/outfits/create')}
          >
            + Create Outfit
          </button>
        </div>
      </section>

      {error && (
        <div className="alert-box alert-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <section className="stats-grid">
        <div className="stat-card" onClick={() => onNavigate('/wardrobe')}>
          <div className="stat-icon">👗</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalWardrobeItems}</span>
            <span className="stat-label">Wardrobe Items</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('/outfits')}>
          <div className="stat-icon">✨</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalOutfits}</span>
            <span className="stat-label">Curated Outfits</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('/favorites')}>
          <div className="stat-icon">♡</div>
          <div className="stat-info">
            <span className="stat-value">{stats.favoriteClothingCount}</span>
            <span className="stat-label">Favorite Clothing</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('/favorites')}>
          <div className="stat-icon">♥</div>
          <div className="stat-info">
            <span className="stat-value">{stats.favoriteOutfitsCount}</span>
            <span className="stat-label">Favorite Outfits</span>
          </div>
        </div>
      </section>

      {/* Style Inspiration / Today's Recommendation Banner */}
      <section className="dashboard-hero-card" style={{ background: '#fff', border: '1px solid var(--border-soft)' }}>
        <div>
          <span className="section-tag">TODAY'S STYLE INSPIRATION</span>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>Need an Outfit Idea for Today?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Explore intelligent combinations curated from your very own closet by occasion or mood.
          </p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => onNavigate('/recommendations')}
        >
          🪄 Open Style Muse
        </button>
      </section>

      {/* Recently Added Clothing */}
      <section>
        <div className="filter-bar">
          <div>
            <h2 style={{ fontSize: '1.5rem' }}>Recently Added Clothing</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Latest pieces added to your personal wardrobe</p>
          </div>
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={() => onNavigate('/wardrobe')}
          >
            View All Wardrobe →
          </button>
        </div>

        {recentClothing.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👗</div>
            <h3>Your wardrobe is still empty</h3>
            <p>Add your first top, dress, pair of shoes, or accessory to begin building your digital closet.</p>
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() => onNavigate('/wardrobe/add')}
            >
              + Add First Item
            </button>
          </div>
        ) : (
          <div className="items-grid">
            {recentClothing.map((item) => (
              <div
                key={item._id}
                className="clothing-card"
                onClick={() => onNavigate(`/wardrobe/${item._id}`)}
              >
                <div className="clothing-image-container">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80';
                      }}
                    />
                  ) : (
                    <div className="placeholder-fashion-img">
                      <span className="icon">👗</span>
                      <span>{item.category}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="card-fav-btn"
                    onClick={(e) => handleToggleClothingFav(item._id, e)}
                    title={item.favorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {item.favorite ? '♥' : '♡'}
                  </button>
                </div>
                <div className="clothing-card-body">
                  <span className="clothing-category-badge">{item.category}</span>
                  <h4 className="clothing-card-title">{item.name}</h4>
                  <div className="clothing-meta">
                    <span>Color: <strong>{item.color || 'Multi'}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recently Created Outfits */}
      <section>
        <div className="filter-bar">
          <div>
            <h2 style={{ fontSize: '1.5rem' }}>Recent Outfits</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Ensembles ready for your next outing</p>
          </div>
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={() => onNavigate('/outfits')}
          >
            View All Outfits →
          </button>
        </div>

        {recentOutfits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✨</div>
            <h3>No outfits created yet</h3>
            <p>Combine items from your wardrobe into stylish looks for College, Casual days, Parties, or Formals.</p>
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() => onNavigate('/outfits/create')}
            >
              + Create First Outfit
            </button>
          </div>
        ) : (
          <div className="outfits-grid">
            {recentOutfits.map((outfit) => (
              <div
                key={outfit._id}
                className="outfit-card"
                onClick={() => onNavigate(`/outfits/${outfit._id}`)}
              >
                <div className="outfit-cover">
                  {outfit.coverImage ? (
                    <img
                      src={outfit.coverImage}
                      alt={outfit.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  ) : (
                    <div className="placeholder-fashion-img">
                      <span className="icon">✨</span>
                      <span>{outfit.category}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="card-fav-btn"
                    onClick={(e) => handleToggleOutfitFav(outfit._id, e)}
                  >
                    {outfit.favorite ? '♥' : '♡'}
                  </button>
                </div>
                <div className="outfit-card-body">
                  <span className="outfit-category-pill">{outfit.category}</span>
                  <h3 className="outfit-title">{outfit.name}</h3>
                  {outfit.description && <p className="outfit-desc">{outfit.description}</p>}

                  {outfit.items && outfit.items.length > 0 && (
                    <div className="outfit-items-preview">
                      {outfit.items.slice(0, 4).map((it) => (
                        it.image ? (
                          <img
                            key={it._id}
                            src={it.image}
                            alt={it.name}
                            className="outfit-mini-thumb"
                            title={it.name}
                          />
                        ) : null
                      ))}
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {outfit.items.length} piece{outfit.items.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
