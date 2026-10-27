// client/src/services/outfitService.js
// Outfit API service communicating with Express backend /api/outfits

const API_BASE = '/api/outfits';

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
 * Fetch outfits with optional filters
 * @param {Object} filters - { category, search, favorite }
 * @param {string} token - JWT Bearer token
 */
export const getOutfits = async (filters = {}, token) => {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== 'All') params.append('category', filters.category);
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
 * Fetch a single outfit by ID
 */
export const getOutfitById = async (id, token) => {
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
 * Create a new outfit
 */
export const createOutfit = async (outfitData, token) => {
  const response = await fetch(`${API_BASE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(outfitData),
  });

  return handleResponse(response);
};

/**
 * Update an existing outfit
 */
export const updateOutfit = async (id, outfitData, token) => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(outfitData),
  });

  return handleResponse(response);
};

/**
 * Toggle favorite status of an outfit
 */
export const toggleOutfitFavorite = async (id, token) => {
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
 * Delete an outfit
 */
export const deleteOutfit = async (id, token) => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};
