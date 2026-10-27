// client/src/pages/Wardrobe.jsx
// StyleMuse Personal Wardrobe Collection view with categories, color filters, and search

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as wardrobeService from '../services/wardrobeService';

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories'];
const COLORS = ['All', 'Pink', 'White', 'Black', 'Blue', 'Beige', 'Red', 'Pastel', 'Multi'];

const Wardrobe = ({ onNavigate }) => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await wardrobeService.getWardrobeItems(
        {
          category: selectedCategory,
          color: selectedColor,
          search: searchQuery,
        },
        token
      );
      setItems(data.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load wardrobe items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      const delayDebounceFn = setTimeout(() => {
        fetchItems();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [token, selectedCategory, selectedColor, searchQuery]);

  // Debounced or simple search trigger
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleToggleFavorite = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await wardrobeService.toggleWardrobeFavorite(id, token);
      setItems((prev) =>
        prev.map((item) => (item._id === id ? { ...item, favorite: res.favorite } : item))
      );
    } catch (err) {
      console.error('Favorite toggle failed:', err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this piece from your wardrobe?')) {
      try {
        await wardrobeService.deleteWardrobeItem(id, token);
        setItems((prev) => prev.filter((item) => item._id !== id));
      } catch (err) {
        alert(err.message || 'Failed to delete item');
      }
    }
  };

  return (
    <div className="wardrobe-page">
      <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
        <div>
          <span className="section-tag">MY PRIVATE WARDROBE</span>
          <h1 style={{ fontSize: '2.2rem' }}>Clothing Collection</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            {items.length} piece{items.length === 1 ? '' : 's'} cataloged in your closet
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => onNavigate('/wardrobe/add')}
        >
          + Add Clothing Item 👗
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="chips-group">
          {CATEGORIES.map((cat) => (
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
            placeholder="Search clothes by name, color..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Color Filter Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Color Palette:</span>
        {COLORS.map((col) => (
          <button
            key={col}
            type="button"
            className={`chip-btn ${selectedColor === col ? 'active' : ''}`}
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
            onClick={() => setSelectedColor(col)}
          >
            {col}
          </button>
        ))}
      </div>

      {error && (
        <div className="alert-box alert-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Accessing your wardrobe...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👗</div>
          <h3>No clothing items found</h3>
          <p>
            {selectedCategory !== 'All' || selectedColor !== 'All' || searchQuery
              ? 'Try relaxing your search or filters to see more pieces.'
              : 'Start your digital wardrobe by adding your first clothing item!'}
          </p>
          <button
            type="button"
            className="btn-primary btn-sm"
            onClick={() => onNavigate('/wardrobe/add')}
          >
            + Add New Clothing
          </button>
        </div>
      ) : (
        <div className="items-grid">
          {items.map((item) => (
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
                  onClick={(e) => handleToggleFavorite(item._id, e)}
                  title={item.favorite ? 'Favorited' : 'Add to favorites'}
                >
                  {item.favorite ? '♥' : '♡'}
                </button>
              </div>

              <div className="clothing-card-body">
                <span className="clothing-category-badge">{item.category}</span>
                <h3 className="clothing-card-title">{item.name}</h3>
                <div className="clothing-meta">
                  <span>Color: <strong>{item.color || 'Multi'}</strong></span>
                </div>
              </div>

              <div className="clothing-card-actions">
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(`/wardrobe/${item._id}/edit`);
                  }}
                >
                  ✎ Edit
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-sm btn-danger"
                  onClick={(e) => handleDelete(item._id, e)}
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

export default Wardrobe;
