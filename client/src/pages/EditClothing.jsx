// client/src/pages/EditClothing.jsx
// Edit existing clothing item in personal wardrobe

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as wardrobeService from '../services/wardrobeService';

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories'];

const EditClothing = ({ itemId, onNavigate }) => {
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Tops',
    color: '',
    description: '',
    image: '',
    favorite: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await wardrobeService.getWardrobeItemById(itemId, token);
        if (res && res.item) {
          setFormData({
            name: res.item.name || '',
            category: res.item.category || 'Tops',
            color: res.item.color || '',
            description: res.item.description || '',
            image: res.item.image || '',
            favorite: Boolean(res.item.favorite),
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load item details');
      } finally {
        setLoading(false);
      }
    };

    if (itemId && token) {
      fetchItem();
    }
  }, [itemId, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Please provide a name for the clothing item');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await wardrobeService.updateWardrobeItem(itemId, formData, token);
      onNavigate(`/wardrobe/${itemId}`);
    } catch (err) {
      setError(err.message || 'Failed to update clothing item');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading piece details...</p>
      </div>
    );
  }

  return (
    <div className="form-page-container">
      <div className="form-header">
        <span className="hero-tag">✎ WARDROBE REVISION</span>
        <h1>Edit Clothing Item</h1>
        <p>Update styling parameters and details for this piece</p>
      </div>

      {error && (
        <div className="alert-box alert-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-group">
          <label htmlFor="edit-item-name">Item Name *</label>
          <input
            id="edit-item-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={saving}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="edit-item-category">Category *</label>
            <select
              id="edit-item-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={saving}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="edit-item-color">Color</label>
            <input
              id="edit-item-color"
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              disabled={saving}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="edit-item-image">Photo / Image URL</label>
          <input
            id="edit-item-image"
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            disabled={saving}
          />
        </div>

        {formData.image && (
          <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
            <img
              src={formData.image}
              alt="Preview"
              style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-soft)' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="edit-item-description">Styling Notes / Description</label>
          <textarea
            id="edit-item-description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            disabled={saving}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.25rem' }}>
          <input
            id="edit-item-favorite"
            type="checkbox"
            name="favorite"
            checked={formData.favorite}
            onChange={handleChange}
            disabled={saving}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="edit-item-favorite" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
            Mark as wardrobe favorite (♡)
          </label>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="submit"
            className="btn-primary"
            style={{ flex: 1 }}
            disabled={saving}
          >
            {saving ? 'Updating...' : 'Save Changes 🌸'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigate(`/wardrobe/${itemId}`)}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditClothing;
