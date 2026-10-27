// client/src/pages/StyleRecommendations.jsx
// Rule-based style matcher and occasion outfit recommendations

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as styleService from '../services/styleService';

const OCCASIONS = ['Casual', 'College', 'Party', 'Formal', 'Traditional'];
const COLORS = ['All', 'Pink', 'White', 'Black', 'Blue', 'Beige', 'Red', 'Pastel'];

const StyleRecommendations = ({ onNavigate }) => {
  const { token } = useAuth();
  const [selectedOccasion, setSelectedOccasion] = useState('College');
  const [selectedColor, setSelectedColor] = useState('All');

  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await styleService.getStyleRecommendations(
        {
          occasion: selectedOccasion,
          color: selectedColor,
        },
        token
      );
      setRecommendations(data);
    } catch (err) {
      setError(err.message || 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRecommendations();
    }
  }, [token, selectedOccasion, selectedColor]);

  const suggestedLook = recommendations?.suggestedLook;
  const matchingOutfits = recommendations?.matchingOutfits || [];
  const matchingItems = recommendations?.matchingItems || [];

  return (
    <div className="recommendations-page">
      <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
        <div>
          <span className="section-tag">MAGIC STYLE STYLIST</span>
          <h1 style={{ fontSize: '2.2rem' }}>Style Muse Recommendations 🪄</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Instant rule-based outfit coordinates tailored to your event and color mood
          </p>
        </div>
      </div>

      {/* Occasion Selector */}
      <div style={{ background: '#fff', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-subtle)', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.8rem' }}>1. Choose What You Are Dressing For:</h3>
        <div className="chips-group" style={{ marginBottom: '1.25rem' }}>
          {OCCASIONS.map((occ) => (
            <button
              key={occ}
              type="button"
              className={`chip-btn ${selectedOccasion === occ ? 'active' : ''}`}
              style={{ padding: '0.6rem 1.4rem', fontSize: '0.92rem' }}
              onClick={() => setSelectedOccasion(occ)}
            >
              {occ}
            </button>
          ))}
        </div>

        <h3 style={{ fontSize: '1.15rem', marginBottom: '0.8rem' }}>2. Optional Palette Preference:</h3>
        <div className="chips-group">
          {COLORS.map((col) => (
            <button
              key={col}
              type="button"
              className={`chip-btn ${selectedColor === col ? 'active' : ''}`}
              style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
              onClick={() => setSelectedColor(col)}
            >
              {col}
            </button>
          ))}
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
          <p>StyleMuse is coordinating your wardrobe...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {/* Smart Pairing Look */}
          <section style={{ background: 'linear-gradient(135deg, #FFF0F5, #FCE4EC)', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid var(--border-soft)' }}>
            <span className="hero-tag">🌸 SUGGESTED COORDINATE</span>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
              Suggested {selectedOccasion} Look
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
              Synthesized ensemble from your available tops, bottoms, shoes, and accessories:
            </p>

            {(!suggestedLook?.top && !suggestedLook?.bottom && !suggestedLook?.dress) ? (
              <div className="empty-state" style={{ background: '#fff' }}>
                <p>Not enough pieces in your wardrobe to assemble a full coordinate yet.</p>
                <button
                  type="button"
                  className="btn-primary btn-sm"
                  onClick={() => onNavigate('/wardrobe/add')}
                >
                  + Add More Wardrobe Items
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                {suggestedLook.top && (
                  <div className="clothing-card" style={{ background: '#fff' }} onClick={() => onNavigate(`/wardrobe/${suggestedLook.top._id}`)}>
                    <div className="clothing-image-container" style={{ aspectRatio: '1' }}>
                      {suggestedLook.top.image ? (
                        <img src={suggestedLook.top.image} alt={suggestedLook.top.name} />
                      ) : (
                        <div className="placeholder-fashion-img"><span>👗</span></div>
                      )}
                    </div>
                    <div className="clothing-card-body">
                      <span className="clothing-category-badge">Top</span>
                      <h4 style={{ fontSize: '0.95rem' }}>{suggestedLook.top.name}</h4>
                    </div>
                  </div>
                )}

                {suggestedLook.bottom && (
                  <div className="clothing-card" style={{ background: '#fff' }} onClick={() => onNavigate(`/wardrobe/${suggestedLook.bottom._id}`)}>
                    <div className="clothing-image-container" style={{ aspectRatio: '1' }}>
                      {suggestedLook.bottom.image ? (
                        <img src={suggestedLook.bottom.image} alt={suggestedLook.bottom.name} />
                      ) : (
                        <div className="placeholder-fashion-img"><span>👖</span></div>
                      )}
                    </div>
                    <div className="clothing-card-body">
                      <span className="clothing-category-badge">Bottom</span>
                      <h4 style={{ fontSize: '0.95rem' }}>{suggestedLook.bottom.name}</h4>
                    </div>
                  </div>
                )}

                {suggestedLook.dress && (
                  <div className="clothing-card" style={{ background: '#fff' }} onClick={() => onNavigate(`/wardrobe/${suggestedLook.dress._id}`)}>
                    <div className="clothing-image-container" style={{ aspectRatio: '1' }}>
                      {suggestedLook.dress.image ? (
                        <img src={suggestedLook.dress.image} alt={suggestedLook.dress.name} />
                      ) : (
                        <div className="placeholder-fashion-img"><span>👗</span></div>
                      )}
                    </div>
                    <div className="clothing-card-body">
                      <span className="clothing-category-badge">Dress</span>
                      <h4 style={{ fontSize: '0.95rem' }}>{suggestedLook.dress.name}</h4>
                    </div>
                  </div>
                )}

                {suggestedLook.shoes && (
                  <div className="clothing-card" style={{ background: '#fff' }} onClick={() => onNavigate(`/wardrobe/${suggestedLook.shoes._id}`)}>
                    <div className="clothing-image-container" style={{ aspectRatio: '1' }}>
                      {suggestedLook.shoes.image ? (
                        <img src={suggestedLook.shoes.image} alt={suggestedLook.shoes.name} />
                      ) : (
                        <div className="placeholder-fashion-img"><span>👠</span></div>
                      )}
                    </div>
                    <div className="clothing-card-body">
                      <span className="clothing-category-badge">Footwear</span>
                      <h4 style={{ fontSize: '0.95rem' }}>{suggestedLook.shoes.name}</h4>
                    </div>
                  </div>
                )}

                {suggestedLook.accessory && (
                  <div className="clothing-card" style={{ background: '#fff' }} onClick={() => onNavigate(`/wardrobe/${suggestedLook.accessory._id}`)}>
                    <div className="clothing-image-container" style={{ aspectRatio: '1' }}>
                      {suggestedLook.accessory.image ? (
                        <img src={suggestedLook.accessory.image} alt={suggestedLook.accessory.name} />
                      ) : (
                        <div className="placeholder-fashion-img"><span>👜</span></div>
                      )}
                    </div>
                    <div className="clothing-card-body">
                      <span className="clothing-category-badge">Accessory</span>
                      <h4 style={{ fontSize: '0.95rem' }}>{suggestedLook.accessory.name}</h4>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Matching Saved Outfits */}
          <section>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.6rem' }}>Matching Saved Outfits for {selectedOccasion}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Pre-curated looks in your collection tailored to {selectedOccasion}
              </p>
            </div>

            {matchingOutfits.length === 0 ? (
              <div className="empty-state">
                <p>No outfits saved under the "{selectedOccasion}" category yet.</p>
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => onNavigate('/outfits/create')}
                >
                  + Create {selectedOccasion} Outfit
                </button>
              </div>
            ) : (
              <div className="outfits-grid">
                {matchingOutfits.map((outfit) => (
                  <div
                    key={outfit._id}
                    className="outfit-card"
                    onClick={() => onNavigate(`/outfits/${outfit._id}`)}
                  >
                    <div className="outfit-cover">
                      {outfit.coverImage ? (
                        <img src={outfit.coverImage} alt={outfit.name} />
                      ) : (
                        <div className="placeholder-fashion-img"><span>✨</span></div>
                      )}
                    </div>
                    <div className="outfit-card-body">
                      <span className="outfit-category-pill">{outfit.category}</span>
                      <h3 className="outfit-title">{outfit.name}</h3>
                      {outfit.description && <p className="outfit-desc">{outfit.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Matching Color Wardrobe Items */}
          {selectedColor !== 'All' && (
            <section>
              <div style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.6rem' }}>Matching {selectedColor} Wardrobe Pieces</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  Items in your closet that match your selected color vibe
                </p>
              </div>

              {matchingItems.length === 0 ? (
                <div className="empty-state">
                  <p>No items found in your wardrobe matching "{selectedColor}".</p>
                </div>
              ) : (
                <div className="items-grid">
                  {matchingItems.map((item) => (
                    <div
                      key={item._id}
                      className="clothing-card"
                      onClick={() => onNavigate(`/wardrobe/${item._id}`)}
                    >
                      <div className="clothing-image-container">
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <div className="placeholder-fashion-img"><span>👗</span></div>
                        )}
                      </div>
                      <div className="clothing-card-body">
                        <span className="clothing-category-badge">{item.category}</span>
                        <h4 className="clothing-card-title">{item.name}</h4>
                        <div className="clothing-meta">
                          <span>Color: <strong>{item.color}</strong></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default StyleRecommendations;
