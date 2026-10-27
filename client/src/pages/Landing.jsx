// client/src/pages/Landing.jsx
// StyleMuse editorial Pinterest-inspired fashion landing page

import React from 'react';
import { useAuth } from '../context/AuthContext';

const Landing = ({ onNavigate }) => {
  const { user } = useAuth();

  const fashionCollage = [
    {
      title: 'Blush Chic Ensemble',
      tag: 'Casual Aesthetic',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Silk & Tailored Trousers',
      tag: 'College & Formal',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Rose Gold Evening Wear',
      tag: 'Party Glam',
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Pastel Handbag & Accents',
      tag: 'Accessories',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-content">
          <div className="hero-tag">
            <span>🌸</span> The Personal Wardrobe Sanctuary
          </div>
          <h1 className="hero-title">
            Your wardrobe, <span className="highlight">curated</span> your way.
          </h1>
          <p className="hero-subtitle">
            Say goodbye to "I have nothing to wear." Digitize your clothing items, coordinate stunning daily outfits, save your favorite looks, and discover effortless style pairings tailored to every occasion.
          </p>
          <div className="hero-actions">
            {user ? (
              <>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => onNavigate('/wardrobe')}
                >
                  Explore My Wardrobe 👗
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => onNavigate('/outfits/create')}
                >
                  + Create Outfit ✨
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => onNavigate('/signup')}
                >
                  Create Your Style ✦
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => onNavigate('/login')}
                >
                  Sign In to Wardrobe
                </button>
              </>
            )}
          </div>
        </div>

        {/* Editorial Visual Collage */}
        <div className="hero-visual-collage">
          <div className="collage-col">
            <div className="collage-card">
              <img
                src={fashionCollage[0].image}
                alt={fashionCollage[0].title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80';
                }}
              />
              <span className="collage-badge">{fashionCollage[0].tag}</span>
            </div>
            <div className="collage-card">
              <img
                src={fashionCollage[1].image}
                alt={fashionCollage[1].title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80';
                }}
              />
              <span className="collage-badge">{fashionCollage[1].tag}</span>
            </div>
          </div>

          <div className="collage-col offset">
            <div className="collage-card">
              <img
                src={fashionCollage[2].image}
                alt={fashionCollage[2].title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80';
                }}
              />
              <span className="collage-badge">{fashionCollage[2].tag}</span>
            </div>
            <div className="collage-card">
              <img
                src={fashionCollage[3].image}
                alt={fashionCollage[3].title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80';
                }}
              />
              <span className="collage-badge">{fashionCollage[3].tag}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="landing-features">
        <div className="section-header">
          <span className="section-tag">ELEVATE YOUR DAILY FASHION</span>
          <h2 className="section-title">Designed for the Modern Wardrobe</h2>
          <p className="section-desc">
            Organize every top, skirt, dress, and accessory into an aesthetic visual catalog with instant outfit planning and smart styling suggestions.
          </p>
        </div>

        <div className="feature-grid">
          <div className="feature-box">
            <div className="feature-icon-wrapper">👗</div>
            <h3>Digitize Wardrobe</h3>
            <p>
              Keep photographic record of all your clothes categorized by Tops, Bottoms, Dresses, Shoes, and Accessories with custom colors.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-icon-wrapper">✨</div>
            <h3>Curate Outfits</h3>
            <p>
              Pair tops and bottoms or dresses with matching accessories into ready-to-wear ensembles for College, Casual, Parties, and Formals.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-icon-wrapper">🪄</div>
            <h3>Occasion Recommender</h3>
            <p>
              Quickly see matching style pairings and coordinate what to wear based on occasion and your palette preferences.
            </p>
          </div>

          <div className="feature-box">
            <div className="feature-icon-wrapper">♡</div>
            <h3>Save Favorites</h3>
            <p>
              Heart your most-loved go-to statement items and signature outfits for one-tap morning inspiration.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
