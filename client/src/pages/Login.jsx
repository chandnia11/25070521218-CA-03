// client/src/pages/Login.jsx
// StyleMuse Member Login Page

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = ({ onNavigate }) => {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      setError('Please provide both your email and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });
      onNavigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge">🌸 StyleMuse Wardrobe Portal</div>
          <h2>Welcome Back</h2>
          <p>Log in to access your personal closet and curated outfits</p>
        </div>

        {error && (
          <div className="alert-box alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="e.g. style@muse.fashion"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner-sm"></span> Signing In...
              </span>
            ) : (
              'Enter StyleMuse ✨'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            New to StyleMuse?{' '}
            <button
              type="button"
              className="link-button"
              onClick={() => onNavigate('/signup')}
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
