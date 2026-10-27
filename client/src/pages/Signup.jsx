// client/src/pages/Signup.jsx
// StyleMuse Member Signup Page

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Signup = ({ onNavigate }) => {
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify and retype.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await signup({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      onNavigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge">🌸 Become a Muse</div>
          <h2>Join StyleMuse</h2>
          <p>Organize your wardrobe, curate fashion looks, and define your personal style</p>
        </div>

        {error && (
          <div className="alert-box alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              type="text"
              name="name"
              placeholder="e.g. Mia Sterling"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">Email Address</label>
            <input
              id="signup-email"
              type="email"
              name="email"
              placeholder="e.g. mia@stylemuse.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              name="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-confirm">Confirm Password</label>
            <input
              id="signup-confirm"
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              autoComplete="new-password"
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
                <span className="spinner-sm"></span> Creating Your Wardrobe...
              </span>
            ) : (
              'Create My Wardrobe 🌸'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already a member?{' '}
            <button
              type="button"
              className="link-button"
              onClick={() => onNavigate('/login')}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
