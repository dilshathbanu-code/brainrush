const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('brainrush_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred during network request');
    }

    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  auth: {
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    getMe: () => request('/auth/me')
  },

  // Users
  users: {
    getProfile: () => request('/users/profile'),
    updateProfile: (profileData) => request('/users/profile', { method: 'PUT', body: JSON.stringify(profileData) })
  },

  // Games
  games: {
    getAll: () => request('/games'),
    getBySlug: (slug) => request(`/games/${slug}`)
  },

  // Scores
  scores: {
    submit: (scorePayload) => request('/scores', { method: 'POST', body: JSON.stringify(scorePayload) }),
    getUserScores: () => request('/scores/user')
  },

  // Leaderboard
  leaderboard: {
    get: (period = 'all-time', game = '') => {
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      if (game) params.append('game', game);
      return request(`/leaderboard?${params.toString()}`);
    }
  },

  // Achievements
  achievements: {
    getAll: () => request('/achievements')
  },

  // Daily Challenge
  dailyChallenge: {
    get: () => request('/daily-challenge'),
    complete: (score) => request('/daily-challenge/complete', { method: 'POST', body: JSON.stringify({ score }) })
  }
};
