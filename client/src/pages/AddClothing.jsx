// client/src/pages/AddClothing.jsx
// Add new clothing item to personal wardrobe

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as wardrobeService from '../services/wardrobeService';

const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories'];

const SAMPLE_IMAGES = [
  { name: 'Blush Silk Top', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80' },
  { name: 'Floral Day Dress', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80' },
  { name: 'Tailored Wide Trousers', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80' },
  { name: 'Classic Sneakers', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80' },
  { name: 'Pastel Shoulder Bag', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80' }
];

const AddClothing = ({ onNavigate }) => {
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Tops',
    color: 'Pink',
    description: '',
    image: '',
    favorite: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError('');
  };

  const handlePickSample = (url) => {
    setFormData((prev) => ({ ...prev, image: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Please provide a name for the clothing item');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await wardrobeService.createWardrobeItem(formData, token);
      onNavigate('/wardrobe');
    } catch (err) {
      setError(err.message || 'Failed to add clothing item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page-container">
      <div className="form-header">
        <span className="hero-tag">👗 WARDROBE EXPANSION</span>
        <h1>Add Clothing Item</h1>
        <p>Catalog a new item in your digital wardrobe collection</p>
      </div>

      {error && (
        <div className="alert-box alert-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-group">
          <label htmlFor="item-name">Item Name *</label>
          <input
            id="item-name"
            type="text"
            name="name"
            placeholder="e.g. Puff Sleeve Rose Blouse"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="item-category">Category *</label>
            <select
              id="item-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="item-color">Color</label>
            <input
              id="item-color"
              type="text"
              name="color"
              placeholder="e.g. Soft Pink, Cream, Black"
              value={formData.color}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="item-image">Photo / Image URL</label>
          <input
            id="item-image"
            type="url"
            name="image"
            placeholder="https://images.unsplash.com/photo-..."
            value={formData.image}
            onChange={handleChange}
            disabled={loading}
          />
          <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Or pick a quick sample photo:
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
              {SAMPLE_IMAGES.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  className="btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                  onClick={() => handlePickSample(sample.url)}
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {formData.image && (
          <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Preview:</p>
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
          <label htmlFor="item-description">Styling Notes / Description</label>
          <textarea
            id="item-description"
            name="description"
            rows="3"
            placeholder="Fabric type, fitting notes, or best seasons to wear..."
            value={formData.description}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.25rem' }}>
          <input
            id="item-favorite"
            type="checkbox"
            name="favorite"
            checked={formData.favorite}
            onChange={handleChange}
            disabled={loading}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="item-favorite" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
            Mark as wardrobe favorite (♡)
          </label>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="submit"
            className="btn-primary"
            style={{ flex: 1 }}
            disabled={loading}
          >
            {loading ? 'Adding Item...' : 'Save to Wardrobe 👗'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onNavigate('/wardrobe')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddClothing;
