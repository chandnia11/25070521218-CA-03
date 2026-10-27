// client/src/services/wardrobeService.js
// Wardrobe API service communicating with Express backend /api/wardrobe

const API_BASE = '/api/wardrobe';

const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error('Unexpected response format from server');
  }

  if (!response.ok) {
    const errorMessage = data && data.message ? data.message : 'Request failed. Please try again.';
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }

  return data;
};

/**
 * Fetch wardrobe items with optional filters
 * @param {Object} filters - { category, color, search, favorite }
 * @param {string} token - JWT Bearer token
 */
export const getWardrobeItems = async (filters = {}, token) => {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== 'All') params.append('category', filters.category);
  if (filters.color && filters.color !== 'All') params.append('color', filters.color);
  if (filters.search) params.append('search', filters.search);
  if (filters.favorite) params.append('favorite', 'true');

  const queryString = params.toString() ? `?${params.toString()}` : '';

  const response = await fetch(`${API_BASE}${queryString}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};

/**
 * Fetch a single wardrobe item by ID
 */
export const getWardrobeItemById = async (id, token) => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};

/**
 * Add a new clothing item to wardrobe
 */
export const createWardrobeItem = async (itemData, token) => {
  const response = await fetch(`${API_BASE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(itemData),
  });

  return handleResponse(response);
};

/**
 * Update an existing clothing item
 */
export const updateWardrobeItem = async (id, itemData, token) => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(itemData),
  });

  return handleResponse(response);
};

/**
 * Toggle favorite status of a clothing item
 */
export const toggleWardrobeFavorite = async (id, token) => {
  const response = await fetch(`${API_BASE}/${id}/favorite`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};

/**
 * Delete a clothing item from wardrobe
 */
export const deleteWardrobeItem = async (id, token) => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};
