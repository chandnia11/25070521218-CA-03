// client/src/pages/Favorites.jsx
// StyleMuse Favorites Collection (Clothing & Outfits tabs)

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as styleService from '../services/styleService';
import * as wardrobeService from '../services/wardrobeService';
import * as outfitService from '../services/outfitService';

const Favorites = ({ onNavigate }) => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('clothing'); // 'clothing' or 'outfits'
  const [favoriteClothing, setFavoriteClothing] = useState([]);
  const [favoriteOutfits, setFavoriteOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await styleService.getFavorites(token);
      setFavoriteClothing(data.favoriteClothing || []);
      setFavoriteOutfits(data.favoriteOutfits || []);
    } catch (err) {
      setError(err.message || 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFavorites();
    }
  }, [token]);

  const handleRemoveClothingFav = async (id, e) => {
    e.stopPropagation();
    try {
      await wardrobeService.toggleWardrobeFavorite(id, token);
      setFavoriteClothing((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveOutfitFav = async (id, e) => {
    e.stopPropagation();
    try {
      await outfitService.toggleOutfitFavorite(id, token);
      setFavoriteOutfits((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="favorites-page">
      <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
        <div>
          <span className="section-tag">LOVED LOOKS & PIECES</span>
          <h1 style={{ fontSize: '2.2rem' }}>My Favorites ♡</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Your curated collection of treasured wardrobe items and signature outfits
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="filter-bar" style={{ borderBottom: '1px solid var(--border-soft)', paddingBottom: '1rem' }}>
        <div className="chips-group">
          <button
            type="button"
            className={`chip-btn ${activeTab === 'clothing' ? 'active' : ''}`}
            onClick={() => setActiveTab('clothing')}
          >
            👗 Favorite Clothing ({favoriteClothing.length})
          </button>
          <button
            type="button"
            className={`chip-btn ${activeTab === 'outfits' ? 'active' : ''}`}
            onClick={() => setActiveTab('outfits')}
          >
            ✨ Favorite Outfits ({favoriteOutfits.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-box alert-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your favorite styles...</p>
        </div>
      ) : activeTab === 'clothing' ? (
        favoriteClothing.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">♡</div>
            <h3>No favorite clothing items yet</h3>
            <p>Heart items in your wardrobe to keep your favorite staples right here.</p>
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() => onNavigate('/wardrobe')}
            >
              Browse Wardrobe
            </button>
          </div>
        ) : (
          <div className="items-grid">
            {favoriteClothing.map((item) => (
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
                      <span>👗</span>
                      <span>{item.category}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="card-fav-btn"
                    onClick={(e) => handleRemoveClothingFav(item._id, e)}
                    title="Remove from favorites"
                  >
                    ♥
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
        )
      ) : (
        favoriteOutfits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">♥</div>
            <h3>No favorite outfits saved yet</h3>
            <p>Tap the heart icon on any outfit card to save your go-to style ensembles.</p>
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() => onNavigate('/outfits')}
            >
              Browse Outfits
            </button>
          </div>
        ) : (
          <div className="outfits-grid">
            {favoriteOutfits.map((outfit) => (
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
                      <span>✨</span>
                      <span>{outfit.category}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className="card-fav-btn"
                    onClick={(e) => handleRemoveOutfitFav(outfit._id, e)}
                    title="Remove from favorites"
                  >
                    ♥
                  </button>
                </div>

                <div className="outfit-card-body">
                  <span className="outfit-category-pill">{outfit.category}</span>
                  <h3 className="outfit-title">{outfit.name}</h3>
                  {outfit.description && <p className="outfit-desc">{outfit.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default Favorites;
