const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const FALLBACK_GAMES = [
  {
    id: 1,
    slug: 'memory-match',
    name: 'Memory Match',
    category: 'Memory',
    description: 'Flip and match pairs of cards as fast as possible with minimal moves.',
    difficulty: 'Adaptive',
    icon: 'Brain'
  },
  {
    id: 2,
    slug: 'reaction-time',
    name: 'Reaction Game',
    category: 'Reaction',
    description: 'Test your visual reflexes. Click instantly when the screen turns green.',
    difficulty: 'High Speed',
    icon: 'Zap'
  },
  {
    id: 3,
    slug: 'number-challenge',
    name: 'Number Challenge',
    category: 'Mathematics',
    description: 'Solve quick arithmetic problems under rapid time pressure.',
    difficulty: 'Medium to Hard',
    icon: 'Calculator'
  },
  {
    id: 4,
    slug: 'pattern-memory',
    name: 'Pattern Memory',
    category: 'Pattern',
    description: 'Memorize and replicate evolving light-up matrix sequences.',
    difficulty: 'Progressive',
    icon: 'Grid'
  },
  {
    id: 5,
    slug: 'logic-puzzle',
    name: 'Funny Logic & Riddles',
    category: 'Logic',
    description: 'Solve funny brain teasers, witty trick riddles, and hilarious lateral thinking questions.',
    difficulty: 'Brain Buster',
    icon: 'Puzzle'
  },
  {
    id: 6,
    slug: 'emoji-riddle',
    name: 'Emoji Riddle Master',
    category: 'Puzzle',
    description: 'Decipher hilarious emoji combinations, student slang, and pop culture riddles!',
    difficulty: 'Fun & Playful',
    icon: 'Sparkles'
  },
  {
    id: 7,
    slug: 'color-clash',
    name: 'Color Clash (Stroop)',
    category: 'Reaction',
    description: 'The ultimate colorful brain-twister! Match the ink color, NOT the word you read!',
    difficulty: 'Mind Bending',
    icon: 'Zap'
  },
  {
    id: 8,
    slug: 'speed-spotter',
    name: 'Speed Spotter (Impostor)',
    category: 'Speed',
    description: 'Spot the funny odd emoji/impostor hidden in a colorful crowded grid before time runs out!',
    difficulty: 'Lightning Reflex',
    icon: 'Target'
  }
];

const FALLBACK_ACHIEVEMENTS = [
  { id: 1, code: 'FIRST_GAME', name: 'First Step', description: 'Play your very first brain game on BrainRush.', category: 'General', icon: 'Award', target_value: 1, xp_reward: 50 },
  { id: 2, code: 'BRAIN_BEGINNER', name: 'Brain Beginner', description: 'Score over 500 points in any game mode.', category: 'General', icon: 'Sparkles', target_value: 500, xp_reward: 100 },
  { id: 3, code: 'MEMORY_MASTER', name: 'Memory Master', description: 'Complete a Memory Match game in under 30 seconds.', category: 'Memory', icon: 'Brain', target_value: 1, xp_reward: 200 },
  { id: 4, code: 'SPEED_DEMON', name: 'Speed Master', description: 'Achieve a sub-220ms average reaction time.', category: 'Reaction', icon: 'Zap', target_value: 1, xp_reward: 250 },
  { id: 5, code: 'MATH_WIZARD', name: 'Math Wizard', description: 'Reach a 10-answer streak in Number Challenge.', category: 'Mathematics', icon: 'Flame', target_value: 10, xp_reward: 200 },
  { id: 6, code: 'PATTERN_PRO', name: 'Pattern Master', description: 'Reach Level 7 in Pattern Memory without losing a life.', category: 'Pattern', icon: 'Layers', target_value: 7, xp_reward: 250 },
  { id: 7, code: 'LOGIC_GENIUS', name: 'Logic Master', description: 'Solve 5 logic puzzles with 100% accuracy.', category: 'Logic', icon: 'Target', target_value: 5, xp_reward: 200 },
  { id: 8, code: 'HIGH_SCORER', name: 'High Scorer', description: 'Accumulate 10,000 total score points.', category: 'General', icon: 'Trophy', target_value: 10000, xp_reward: 500 },
  { id: 9, code: 'STREAK_7_DAYS', name: '7 Day Streak', description: 'Train your brain every day for 7 consecutive days.', category: 'Daily', icon: 'Calendar', target_value: 7, xp_reward: 750 },
  { id: 10, code: 'PUZZLE_EXPERT', name: 'Puzzle Expert', description: 'Play all 8 different game types.', category: 'General', icon: 'Compass', target_value: 8, xp_reward: 300 }
];

function getAuthHeaders() {
  const token = localStorage.getItem('brainrush_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

function getLocalScores() {
  try {
    const raw = localStorage.getItem('brainrush_local_scores');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalScore(scoreItem) {
  try {
    const scores = getLocalScores();
    const newEntry = {
      id: Date.now(),
      ...scoreItem,
      created_at: new Date().toISOString()
    };
    scores.unshift(newEntry);
    localStorage.setItem('brainrush_local_scores', JSON.stringify(scores));
    return newEntry;
  } catch (e) {
    console.error('Error saving local score:', e);
  }
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
    // Graceful offline fallback
    console.warn(`[BrainRush API] Server unavailable (${endpoint}). Falling back to local arcade engine.`);
    return handleOfflineFallback(endpoint, options);
  }
}

function handleOfflineFallback(endpoint, options) {
  const localScores = getLocalScores();

  // GET /games
  if (endpoint === '/games' || endpoint.startsWith('/games?')) {
    const enhancedGames = FALLBACK_GAMES.map(g => {
      const gScores = localScores.filter(s => s.game_id === g.id || s.slug === g.slug);
      const best = gScores.length ? Math.max(...gScores.map(s => s.score || 0)) : 0;
      return {
        ...g,
        userBestScore: best,
        userTimesPlayed: gScores.length
      };
    });
    return { success: true, games: enhancedGames };
  }

  // GET /games/:slug
  if (endpoint.startsWith('/games/')) {
    const slug = endpoint.replace('/games/', '');
    const game = FALLBACK_GAMES.find(g => g.slug === slug || String(g.id) === slug) || FALLBACK_GAMES[0];
    const gScores = localScores.filter(s => s.game_id === game.id || s.slug === game.slug);
    const best = gScores.length ? Math.max(...gScores.map(s => s.score || 0)) : 0;
    return {
      success: true,
      game: {
        ...game,
        userStats: {
          bestScore: best,
          timesPlayed: gScores.length,
          avgAccuracy: 95
        }
      }
    };
  }

  // POST /scores
  if (endpoint === '/scores' && options.method === 'POST') {
    const body = options.body ? JSON.parse(options.body) : {};
    const saved = saveLocalScore(body);
    return {
      success: true,
      message: 'Score saved to local arcade profile!',
      score: saved,
      newAchievements: []
    };
  }

  // GET /scores/user
  if (endpoint === '/scores/user') {
    return {
      success: true,
      scores: localScores
    };
  }

  // GET /leaderboard
  if (endpoint.startsWith('/leaderboard')) {
    const topScores = [
      { id: 1, user_name: 'Alex Mercer (Champion)', avatar: 'brain_blue', score: 9850, accuracy: 98, game_name: 'Speed Spotter' },
      { id: 2, user_name: 'Elena Rostova ⚡', avatar: 'brain_purple', score: 8740, accuracy: 96, game_name: 'Emoji Riddle' },
      { id: 3, user_name: 'Marcus Chen 🚀', avatar: 'brain_amber', score: 7600, accuracy: 94, game_name: 'Funny Logic' },
      { id: 4, user_name: 'Sophia Kim 🎯', avatar: 'brain_emerald', score: 6520, accuracy: 92, game_name: 'Color Clash' },
      { id: 5, user_name: 'Dilshath (Guest Star) 🌟', avatar: 'brain_blue', score: 5400, accuracy: 95, game_name: 'Memory Match' }
    ];
    return { success: true, leaderboard: topScores };
  }

  // GET /achievements
  if (endpoint === '/achievements') {
    return {
      success: true,
      achievements: FALLBACK_ACHIEVEMENTS.map(a => ({
        ...a,
        unlocked: localScores.length > 0,
        progress: localScores.length > 0 ? a.target_value : 0
      }))
    };
  }

  // GET /daily-challenge
  if (endpoint === '/daily-challenge') {
    return {
      success: true,
      challenge: {
        id: 1,
        title: 'Super Brain Combo Challenge 🧠⚡',
        description: 'Complete any 2 games with over 80% accuracy to earn 250 XP bonus!',
        target_score: 1200,
        reward_xp: 250,
        game_slug: 'speed-spotter',
        game_name: 'Speed Spotter'
      },
      completed: false
    };
  }

  // AUTH endpoints
  if (endpoint === '/auth/me') {
    const localUser = localStorage.getItem('brainrush_user');
    if (localUser) {
      return { success: true, user: JSON.parse(localUser) };
    }
    return {
      success: true,
      user: {
        id: 999,
        name: 'Brain Challenger 🧠',
        email: 'guest@brainrush.com',
        avatar: 'brain_blue',
        streak_count: 3
      }
    };
  }

  return { success: true };
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
