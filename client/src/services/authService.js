// client/src/services/authService.js
// Authentication API service communicating with the Express backend

const API_BASE = '/api/auth';

/**
 * Handle API responses and return parsed JSON or throw informative errors
 */
const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error('Unexpected response format from server');
  }

  if (!response.ok) {
    // If backend returned an error message, use it
    const errorMessage = data && data.message ? data.message : 'Something went wrong. Please try again.';
    throw new Error(errorMessage);
  }

  return data;
};

/**
 * Register a new student account
 * @param {Object} userData - { name, email, password }
 */
export const signup = async (userData) => {
  const response = await fetch(`${API_BASE}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  return handleResponse(response);
};

/**
 * Authenticate student user and obtain JWT token
 * @param {Object} credentials - { email, password }
 */
export const login = async (credentials) => {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  return handleResponse(response);
};

/**
 * Fetch currently authenticated user profile using stored JWT token
 * @param {string} token - JWT token
 */
export const getCurrentUser = async (token) => {
  const response = await fetch(`${API_BASE}/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};
