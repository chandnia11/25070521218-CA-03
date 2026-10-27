// client/src/pages/Outfits.jsx
// StyleMuse Pinterest-style Outfits Gallery

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as outfitService from '../services/outfitService';

const OUTFIT_CATEGORIES = ['All', 'Casual', 'College', 'Party', 'Formal', 'Traditional', 'Other'];

const Outfits = ({ onNavigate }) => {
  const { token } = useAuth();
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOutfits = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await outfitService.getOutfits(
        {
          category: selectedCategory,
          search: searchQuery,
        },
        token
      );
      setOutfits(data.outfits || []);
    } catch (err) {
      setError(err.message || 'Failed to load outfits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      const delayDebounceFn = setTimeout(() => {
        fetchOutfits();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [token, selectedCategory, searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOutfits();
  };

  const handleToggleFavorite = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await outfitService.toggleOutfitFavorite(id, token);
      setOutfits((prev) =>
        prev.map((o) => (o._id === id ? { ...o, favorite: res.favorite } : o))
      );
    } catch (err) {
      console.error('Failed to toggle outfit favorite:', err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this outfit from your collection?')) {
      try {
        await outfitService.deleteOutfit(id, token);
        setOutfits((prev) => prev.filter((o) => o._id !== id));
      } catch (err) {
        alert(err.message || 'Failed to delete outfit');
      }
    }
  };

  return (
    <div className="outfits-page">
      <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
        <div>
          <span className="section-tag">LOOKBOOK & ENSEMBLES</span>
          <h1 style={{ fontSize: '2.2rem' }}>My Outfits</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            {outfits.length} curated outfit{outfits.length === 1 ? '' : 's'} styled from your wardrobe
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => onNavigate('/outfits/create')}
        >
          + Create Outfit ✨
        </button>
      </div>

      {/* Categories & Search */}
      <div className="filter-bar">
        <div className="chips-group">
          {OUTFIT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`chip-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="search-input-wrapper">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search outfits by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {error && (
        <div className="alert-box alert-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Assembling your lookbook...</p>
        </div>
      ) : outfits.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✨</div>
          <h3>No outfits found</h3>
          <p>
            {selectedCategory !== 'All' || searchQuery
              ? 'Try adjusting your filter or search query.'
              : 'Bring your wardrobe together! Combine your favorite tops, bottoms, and dresses into a chic outfit.'}
          </p>
          <button
            type="button"
            className="btn-primary btn-sm"
            onClick={() => onNavigate('/outfits/create')}
          >
            + Create Your First Look
          </button>
        </div>
      ) : (
        <div className="outfits-grid">
          {outfits.map((outfit) => (
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
                  onClick={(e) => handleToggleFavorite(outfit._id, e)}
                  title={outfit.favorite ? 'Favorited' : 'Add to favorites'}
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
                    {outfit.items.slice(0, 5).map((it) => (
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
                      {outfit.items.length} item{outfit.items.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>

              <div className="outfit-card-actions">
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(`/outfits/${outfit._id}/edit`);
                  }}
                >
                  ✎ Edit
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-sm btn-danger"
                  onClick={(e) => handleDelete(outfit._id, e)}
                >
                  ✕ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Outfits;
