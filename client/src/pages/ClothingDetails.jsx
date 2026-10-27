// client/src/pages/ClothingDetails.jsx
// Detailed view of a single clothing piece

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as wardrobeService from '../services/wardrobeService';

const ClothingDetails = ({ itemId, onNavigate }) => {
  const { token } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchItem = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await wardrobeService.getWardrobeItemById(itemId, token);
      setItem(data.item);
    } catch (err) {
      setError(err.message || 'Clothing item not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId && token) {
      fetchItem();
    }
  }, [itemId, token]);

  const handleToggleFavorite = async () => {
    try {
      const res = await wardrobeService.toggleWardrobeFavorite(itemId, token);
      setItem((prev) => ({ ...prev, favorite: res.favorite }));
    } catch (err) {
      alert(err.message || 'Failed to toggle favorite');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this clothing item from your wardrobe?')) {
      try {
        await wardrobeService.deleteWardrobeItem(itemId, token);
        onNavigate('/wardrobe');
      } catch (err) {
        alert(err.message || 'Failed to delete item');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading item showcase...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h3>Item Not Found</h3>
        <p>{error || 'This clothing item does not exist in your wardrobe.'}</p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => onNavigate('/wardrobe')}
        >
          Return to Wardrobe
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <button
        type="button"
        className="btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem' }}
        onClick={() => onNavigate('/wardrobe')}
      >
        ← Back to Wardrobe
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 380px) 1fr', gap: '2.5rem', background: '#fff', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-card)' }}>
        {/* Item Image */}
        <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative', background: 'var(--bg-blush-subtle)', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80';
              }}
            />
          ) : (
            <div className="placeholder-fashion-img">
              <span className="icon" style={{ fontSize: '3.5rem' }}>👗</span>
              <span>{item.category}</span>
            </div>
          )}

          <button
            type="button"
            className="card-fav-btn"
            style={{ width: '42px', height: '42px', fontSize: '1.4rem' }}
            onClick={handleToggleFavorite}
          >
            {item.favorite ? '♥' : '♡'}
          </button>
        </div>

        {/* Item Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'center' }}>
          <div>
            <span className="clothing-category-badge">{item.category}</span>
            <h1 style={{ fontSize: '2.2rem', marginTop: '0.4rem', marginBottom: '0.2rem' }}>
              {item.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Added to wardrobe on {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', padding: '1rem 0', borderTop: '1px solid var(--border-soft)', borderBottom: '1px solid var(--border-soft)' }}>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Color</span>
              <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--rose-dark)' }}>{item.color || 'Multi'}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Category</span>
              <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>{item.category}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Status</span>
              <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>{item.favorite ? 'Favorite ♡' : 'Cataloged'}</p>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>Styling Notes & Description</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7' }}>
              {item.description || 'No additional styling notes provided yet for this wardrobe item.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => onNavigate(`/wardrobe/${item._id}/edit`)}
            >
              ✎ Edit Clothing Item
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => onNavigate('/outfits/create')}
            >
              + Add to an Outfit
            </button>
            <button
              type="button"
              className="btn-secondary btn-danger"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClothingDetails;
