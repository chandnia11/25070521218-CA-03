// client/src/pages/EditOutfit.jsx
// Edit existing Outfit

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as wardrobeService from '../services/wardrobeService';
import * as outfitService from '../services/outfitService';

const OUTFIT_CATEGORIES = ['Casual', 'College', 'Party', 'Formal', 'Traditional', 'Other'];

const EditOutfit = ({ outfitId, onNavigate }) => {
  const { token } = useAuth();

  const [wardrobe, setWardrobe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'Casual',
    description: '',
    coverImage: '',
    favorite: false,
  });

  const [selectedItemIds, setSelectedItemIds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [outfitRes, wardrobeRes] = await Promise.all([
          outfitService.getOutfitById(outfitId, token),
          wardrobeService.getWardrobeItems({}, token),
        ]);

        if (outfitRes && outfitRes.outfit) {
          const o = outfitRes.outfit;
          setFormData({
            name: o.name || '',
            category: o.category || 'Casual',
            description: o.description || '',
            coverImage: o.coverImage || '',
            favorite: Boolean(o.favorite),
          });
          setSelectedItemIds(o.items ? o.items.map((it) => (it._id ? it._id : it)) : []);
        }

        if (wardrobeRes && wardrobeRes.items) {
          setWardrobe(wardrobeRes.items);
        }
      } catch (err) {
        setError(err.message || 'Failed to load outfit');
      } finally {
        setLoading(false);
      }
    };

    if (outfitId && token) {
      fetchData();
    }
  }, [outfitId, token]);

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
      setError('Please provide an outfit name');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await outfitService.updateOutfit(
        outfitId,
        {
          ...formData,
          items: selectedItemIds,
        },
        token
      );
      onNavigate(`/outfits/${outfitId}`);
    } catch (err) {
      setError(err.message || 'Failed to update outfit');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading outfit details...</p>
      </div>
    );
  }

  return (
    <div className="form-page-container" style={{ maxWidth: '850px' }}>
      <div className="form-header">
        <span className="hero-tag">✎ EDIT ENSEMBLE</span>
        <h1>Edit Outfit</h1>
        <p>Modify outfit styling, category, and selected wardrobe components</p>
      </div>

      {error && (
        <div className="alert-box alert-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="edit-outfit-name">Outfit Name *</label>
            <input
              id="edit-outfit-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={saving}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-outfit-category">Occasion / Category *</label>
            <select
              id="edit-outfit-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={saving}
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
          <label htmlFor="edit-outfit-cover">Cover Image URL</label>
          <input
            id="edit-outfit-cover"
            type="url"
            name="coverImage"
            value={formData.coverImage}
            onChange={handleChange}
            disabled={saving}
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-outfit-description">Outfit Description</label>
          <textarea
            id="edit-outfit-description"
            name="description"
            rows="2"
            value={formData.description}
            onChange={handleChange}
            disabled={saving}
          />
        </div>

        {/* Selected Pieces Pill Preview */}
        <div style={{ padding: '1rem', background: 'var(--bg-blush-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-soft)' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--rose-dark)' }}>
            Selected Items ({selectedItems.length})
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
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
        </div>

        {/* Wardrobe Items Grid */}
        <div className="form-group">
          <label>Click items to toggle inclusion in this outfit:</label>
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
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.25rem' }}>
          <input
            id="edit-outfit-favorite"
            type="checkbox"
            name="favorite"
            checked={formData.favorite}
            onChange={handleChange}
            disabled={saving}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="edit-outfit-favorite" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
            Mark as favorite look (♡)
          </label>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            type="submit"
            className="btn-primary"
            style={{ flex: 1 }}
            disabled={saving}
          >
            {saving ? 'Updating...' : 'Save Outfit Changes ✨'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigate(`/outfits/${outfitId}`)}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditOutfit;
