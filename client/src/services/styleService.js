// client/src/services/styleService.js
// Style Dashboard, Recommendations, and Favorites API service

const API_BASE = '/api/style';

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
 * Fetch StyleMuse personal dashboard statistics & recent entries
 */
export const getStyleDashboard = async (token) => {
  const response = await fetch(`${API_BASE}/dashboard`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};

/**
 * Fetch style recommendations based on occasion and color preference
 */
export const getStyleRecommendations = async ({ occasion, color } = {}, token) => {
  const params = new URLSearchParams();
  if (occasion) params.append('occasion', occasion);
  if (color) params.append('color', color);

  const queryString = params.toString() ? `?${params.toString()}` : '';

  const response = await fetch(`${API_BASE}/recommendations${queryString}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};

/**
 * Fetch all favorite clothing and outfits
 */
export const getFavorites = async (token) => {
  const response = await fetch(`${API_BASE}/favorites`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse(response);
};
