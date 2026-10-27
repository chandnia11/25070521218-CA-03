// client/src/pages/OutfitDetails.jsx
// Detailed showcase of an outfit with its component wardrobe pieces

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as outfitService from '../services/outfitService';

const OutfitDetails = ({ outfitId, onNavigate }) => {
  const { token } = useAuth();
  const [outfit, setOutfit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOutfit = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await outfitService.getOutfitById(outfitId, token);
      setOutfit(data.outfit);
    } catch (err) {
      setError(err.message || 'Outfit not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (outfitId && token) {
      fetchOutfit();
    }
  }, [outfitId, token]);

  const handleToggleFavorite = async () => {
    try {
      const res = await outfitService.toggleOutfitFavorite(outfitId, token);
      setOutfit((prev) => ({ ...prev, favorite: res.favorite }));
    } catch (err) {
      alert(err.message || 'Failed to toggle favorite');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this outfit? (Your wardrobe pieces will remain safe)')) {
      try {
        await outfitService.deleteOutfit(outfitId, token);
        onNavigate('/outfits');
      } catch (err) {
        alert(err.message || 'Failed to delete outfit');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading outfit showcase...</p>
      </div>
    );
  }

  if (error || !outfit) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <h3>Outfit Not Found</h3>
        <p>{error || 'This outfit does not exist in your collection.'}</p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => onNavigate('/outfits')}
        >
          Return to Outfits
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <button
        type="button"
        className="btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem' }}
        onClick={() => onNavigate('/outfits')}
      >
        ← Back to Outfits
      </button>

      {/* Outfit Hero Banner */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '2.5rem', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-card)', marginBottom: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: '2rem', alignItems: 'center' }}>
          <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative', background: 'var(--bg-blush-subtle)', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {outfit.coverImage ? (
              <img
                src={outfit.coverImage}
                alt={outfit.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80';
                }}
              />
            ) : (
              <div className="placeholder-fashion-img">
                <span className="icon" style={{ fontSize: '3.5rem' }}>✨</span>
                <span>{outfit.category}</span>
              </div>
            )}
            <button
              type="button"
              className="card-fav-btn"
              style={{ width: '42px', height: '42px', fontSize: '1.4rem' }}
              onClick={handleToggleFavorite}
            >
              {outfit.favorite ? '♥' : '♡'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <span className="outfit-category-pill">{outfit.category} Occasion</span>
              <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '0.2rem' }}>
                {outfit.name}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Curated on {new Date(outfit.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Style Description</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {outfit.description || 'No description provided for this look.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => onNavigate(`/outfits/${outfit._id}/edit`)}
              >
                ✎ Edit Outfit
              </button>
              <button
                type="button"
                className="btn-secondary btn-danger"
                onClick={handleDelete}
              >
                Delete Outfit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Component Pieces in this Outfit */}
      <section>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.75rem' }}>Wardrobe Pieces in this Ensemble</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {outfit.items?.length || 0} coordinated clothing item{outfit.items?.length === 1 ? '' : 's'}
          </p>
        </div>

        {(!outfit.items || outfit.items.length === 0) ? (
          <div className="empty-state">
            <p>No individual pieces linked to this outfit yet.</p>
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => onNavigate(`/outfits/${outfit._id}/edit`)}
            >
              + Link Pieces from Wardrobe
            </button>
          </div>
        ) : (
          <div className="items-grid">
            {outfit.items.map((item) => (
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
    </div>
  );
};

export default OutfitDetails;
