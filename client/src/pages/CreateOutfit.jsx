// client/src/pages/CreateOutfit.jsx
// Interactive visual outfit builder page

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as wardrobeService from '../services/wardrobeService';
import * as outfitService from '../services/outfitService';

const OUTFIT_CATEGORIES = ['Casual', 'College', 'Party', 'Formal', 'Traditional', 'Other'];

const CreateOutfit = ({ onNavigate }) => {
  const { token } = useAuth();

  const [wardrobe, setWardrobe] = useState([]);
  const [loadingWardrobe, setLoadingWardrobe] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    category: 'College',
    description: '',
    coverImage: '',
    favorite: false,
  });

  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchWardrobe = async () => {
      try {
        setLoadingWardrobe(true);
        const data = await wardrobeService.getWardrobeItems({}, token);
        setWardrobe(data.items || []);
      } catch (err) {
        console.error('Failed to load wardrobe:', err);
      } finally {
        setLoadingWardrobe(false);
      }
    };

    if (token) {
      fetchWardrobe();
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError('');
  };

  const toggleItemSelection = (id) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedItems = wardrobe.filter((item) => selectedItemIds.includes(item._id));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Please provide an outfit name (e.g., "Pink College Day")');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await outfitService.createOutfit(
        {
          ...formData,
          items: selectedItemIds,
        },
        token
      );
      onNavigate('/outfits');
    } catch (err) {
      setError(err.message || 'Failed to create outfit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-page-container" style={{ maxWidth: '850px' }}>
      <div className="form-header">
        <span className="hero-tag">✨ OUTFIT CURATOR</span>
        <h1>Create New Outfit</h1>
        <p>Select coordinating pieces from your wardrobe to build a cohesive look</p>
      </div>

      {error && (
        <div className="alert-box alert-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="outfit-name">Outfit Name *</label>
            <input
              id="outfit-name"
              type="text"
              name="name"
              placeholder="e.g. Pink College Day, Sunday Brunch Chic"
              value={formData.name}
              onChange={handleChange}
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="outfit-category">Occasion / Category *</label>
            <select
              id="outfit-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={submitting}
            >
              {OUTFIT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="outfit-cover">Custom Cover Image URL (Optional)</label>
          <input
            id="outfit-cover"
            type="url"
            name="coverImage"
            placeholder="Leave blank to automatically use one of your selected items"
            value={formData.coverImage}
            onChange={handleChange}
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="outfit-description">Outfit Description / Vibe</label>
          <textarea
            id="outfit-description"
            name="description"
            rows="2"
            placeholder="Describe the mood, jewelry pairing, or occasion for this outfit..."
            value={formData.description}
            onChange={handleChange}
            disabled={submitting}
          />
        </div>

        {/* Selected Pieces Preview Pill Bar */}
        <div style={{ marginTop: '0.5rem', marginBottom: '1rem', padding: '1rem', background: 'var(--bg-blush-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--rose-dark)' }}>
              Selected Pieces ({selectedItems.length})
            </span>
            {selectedItems.length > 0 && (
              <button
                type="button"
                className="btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                onClick={() => setSelectedItemIds([])}
              >
                Clear Selected
              </button>
            )}
          </div>

          {selectedItems.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              No pieces selected yet. Click any item from your wardrobe below to include it in this outfit.
            </p>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {selectedItems.map((item) => (
                <div
                  key={item._id}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#fff', border: '1px solid var(--border-soft)', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem' }}
                >
                  <span>🌸 {item.name} ({item.category})</span>
                  <span
                    style={{ cursor: 'pointer', color: 'var(--danger)', fontWeight: 'bold' }}
                    onClick={() => toggleItemSelection(item._id)}
                  >
                    ×
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Wardrobe Items Grid for Selection */}
        <div className="form-group">
          <label>Select Items From Your Wardrobe:</label>
          {loadingWardrobe ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading your wardrobe pieces...</p>
          ) : wardrobe.length === 0 ? (
            <div className="empty-state" style={{ padding: '1.5rem', margin: '0' }}>
              <p>You have no clothing items in your wardrobe yet.</p>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => onNavigate('/wardrobe/add')}
              >
                + Add Clothing First
              </button>
            </div>
          ) : (
            <div className="items-selector-grid">
              {wardrobe.map((item) => {
                const isSelected = selectedItemIds.includes(item._id);
                return (
                  <div
                    key={item._id}
                    className={`select-item-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleItemSelection(item._id)}
                  >
                    {isSelected && <span className="select-check-badge">✓</span>}
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="select-item-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80';
                        }}
                      />
                    ) : (
                      <div className="placeholder-fashion-img" style={{ height: '90px' }}>
                        <span>👗</span>
                      </div>
                    )}
                    <p style={{ fontSize: '0.78rem', fontWeight: 600, marginTop: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {item.category}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.25rem' }}>
          <input
            id="outfit-favorite"
            type="checkbox"
            name="favorite"
            checked={formData.favorite}
            onChange={handleChange}
            disabled={submitting}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="outfit-favorite" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
            Mark as favorite look (♡)
          </label>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            type="submit"
            className="btn-primary"
            style={{ flex: 1 }}
            disabled={submitting}
          >
            {submitting ? 'Saving Outfit...' : 'Save Outfit to Lookbook ✨'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigate('/outfits')}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOutfit;
