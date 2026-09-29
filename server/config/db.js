const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

let pool = null;
let useFallback = false;

// Fallback in-memory/JSON store
const dataDir = path.join(__dirname, '../data');
const storePath = path.join(dataDir, 'store.json');

const defaultStore = {
  users: [
    {
      id: 1,
      name: "Alex Mercer",
      email: "demo@brainrush.com",
      // hashed "Password123!" using bcryptjs
      password: "$2a$10$w0u6qK4Gq3MvP4/3p7Fkhe823GfQ0t1yXGzJb1cZf2M3T6h4q2A1.",
      avatar: "brain_blue",
      streak_count: 5,
      last_played_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      name: "Elena Rostova",
      email: "elena@brainrush.com",
      password: "$2a$10$w0u6qK4Gq3MvP4/3p7Fkhe823GfQ0t1yXGzJb1cZf2M3T6h4q2A1.",
      avatar: "brain_purple",
      streak_count: 12,
      last_played_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      name: "Marcus Chen",
      email: "marcus@brainrush.com",
      password: "$2a$10$w0u6qK4Gq3MvP4/3p7Fkhe823GfQ0t1yXGzJb1cZf2M3T6h4q2A1.",
      avatar: "brain_amber",
      streak_count: 8,
      last_played_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      name: "Sophia Kim",
      email: "sophia@brainrush.com",
      password: "$2a$10$w0u6qK4Gq3MvP4/3p7Fkhe823GfQ0t1yXGzJb1cZf2M3T6h4q2A1.",
      avatar: "brain_emerald",
      streak_count: 3,
      last_played_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  games: [
    {
      id: 1,
      slug: "memory-match",
      name: "Memory Match",
      category: "Memory",
      description: "Flip and match pairs of cards as fast as possible with minimal moves.",
      difficulty: "Adaptive",
      icon: "Brain",
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      slug: "reaction-time",
      name: "Reaction Game",
      category: "Reaction",
      description: "Test your visual reflexes. Click instantly when the screen turns green.",
      difficulty: "High Speed",
      icon: "Zap",
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      slug: "number-challenge",
      name: "Number Challenge",
      category: "Mathematics",
      description: "Solve quick arithmetic problems under rapid time pressure.",
      difficulty: "Medium to Hard",
      icon: "Calculator",
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      slug: "pattern-memory",
      name: "Pattern Memory",
      category: "Pattern",
      description: "Memorize and replicate evolving light-up matrix sequences.",
      difficulty: "Progressive",
      icon: "Grid",
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      slug: "logic-puzzle",
      name: "Funny Logic & Riddles",
      category: "Logic",
      description: "Solve funny brain teasers, witty trick riddles, and hilarious lateral thinking questions.",
      difficulty: "Brain Buster",
      icon: "Puzzle",
      created_at: new Date().toISOString()
    },
    {
      id: 6,
      slug: "emoji-riddle",
      name: "Emoji Riddle Master",
      category: "Puzzle",
      description: "Decipher hilarious emoji combinations, student slang, and pop culture riddles!",
      difficulty: "Fun & Playful",
      icon: "Sparkles",
      created_at: new Date().toISOString()
    },
    {
      id: 7,
      slug: "color-clash",
      name: "Color Clash (Stroop)",
      category: "Reaction",
      description: "The ultimate colorful brain-twister! Match the ink color, NOT the word you read!",
      difficulty: "Mind Bending",
      icon: "Zap",
      created_at: new Date().toISOString()
    },
    {
      id: 8,
      slug: "speed-spotter",
      name: "Speed Spotter (Impostor)",
      category: "Speed",
      description: "Spot the funny odd emoji/impostor hidden in a colorful crowded grid before time runs out!",
      difficulty: "Lightning Reflex",
      icon: "Target",
      created_at: new Date().toISOString()
    }
  ],
  game_scores: [
    { id: 1, user_id: 1, game_id: 1, score: 2450, accuracy: 94.5, time_taken_seconds: 38, level_reached: 3, metadata: {}, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: 2, user_id: 2, game_id: 1, score: 2890, accuracy: 98.0, time_taken_seconds: 31, level_reached: 3, metadata: {}, created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
    { id: 3, user_id: 3, game_id: 2, score: 3200, accuracy: 100.0, time_taken_seconds: 15, level_reached: 5, metadata: { avgReactionMs: 215 }, created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
    { id: 4, user_id: 1, game_id: 3, score: 2750, accuracy: 92.0, time_taken_seconds: 45, level_reached: 4, metadata: { streak: 12 }, created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
    { id: 5, user_id: 4, game_id: 4, score: 2100, accuracy: 88.0, time_taken_seconds: 50, level_reached: 6, metadata: {}, created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString() },
    { id: 6, user_id: 2, game_id: 5, score: 2950, accuracy: 100.0, time_taken_seconds: 42, level_reached: 5, metadata: {}, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() }
  ],
  achievements: [
    { id: 1, code: 'FIRST_GAME', name: 'First Step', description: 'Play your very first brain game on BrainRush.', category: 'General', icon: 'Award', target_value: 1, xp_reward: 50 },
    { id: 2, code: 'BRAIN_BEGINNER', name: 'Brain Beginner', description: 'Score over 500 points in any game mode.', category: 'General', icon: 'Sparkles', target_value: 500, xp_reward: 100 },
    { id: 3, code: 'MEMORY_MASTER', name: 'Memory Master', description: 'Complete a Memory Match game in under 30 seconds.', category: 'Memory', icon: 'Brain', target_value: 1, xp_reward: 200 },
    { id: 4, code: 'SPEED_DEMON', name: 'Speed Master', description: 'Achieve a sub-220ms average reaction time.', category: 'Reaction', icon: 'Zap', target_value: 1, xp_reward: 250 },
    { id: 5, code: 'MATH_WIZARD', name: 'Math Wizard', description: 'Reach a 10-answer streak in Number Challenge.', category: 'Mathematics', icon: 'Flame', target_value: 10, xp_reward: 200 },
    { id: 6, code: 'PATTERN_PRO', name: 'Pattern Master', description: 'Reach Level 7 in Pattern Memory without losing a life.', category: 'Pattern', icon: 'Layers', target_value: 7, xp_reward: 250 },
    { id: 7, code: 'LOGIC_GENIUS', name: 'Logic Master', description: 'Solve 5 logic puzzles with 100% accuracy.', category: 'Logic', icon: 'Target', target_value: 5, xp_reward: 200 },
    { id: 8, code: 'HIGH_SCORER', name: 'High Scorer', description: 'Accumulate 10,000 total score points.', category: 'General', icon: 'Trophy', target_value: 10000, xp_reward: 500 },
    { id: 9, code: 'STREAK_7_DAYS', name: '7 Day Streak', description: 'Train your brain every day for 7 consecutive days.', category: 'Daily', icon: 'Calendar', target_value: 7, xp_reward: 750 },
    { id: 10, code: 'PUZZLE_EXPERT', name: 'Puzzle Expert', description: 'Play all 5 different game types.', category: 'General', icon: 'Compass', target_value: 5, xp_reward: 300 }
  ],
  user_achievements: [
    { id: 1, user_id: 1, achievement_id: 1, progress: 1, unlocked_at: new Date().toISOString() },
    { id: 2, user_id: 1, achievement_id: 2, progress: 500, unlocked_at: new Date().toISOString() },
    { id: 3, user_id: 1, achievement_id: 5, progress: 12, unlocked_at: new Date().toISOString() },
    { id: 4, user_id: 2, achievement_id: 1, progress: 1, unlocked_at: new Date().toISOString() },
    { id: 5, user_id: 2, achievement_id: 3, progress: 1, unlocked_at: new Date().toISOString() }
  ],
  daily_challenges: [
    {
      id: 1,
      challenge_date: new Date().toISOString().split('T')[0],
      game_id: 1,
      title: "Memory Speedrun",
      description: "Match all pairs in Memory Match with at least 80% accuracy and score 1,500+ points.",
      target_score: 1500,
      reward_xp: 250,
      created_at: new Date().toISOString()
    }
  ],
  user_progress: []
};

function getStore() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(storePath)) {
      fs.writeFileSync(storePath, JSON.stringify(defaultStore, null, 2), 'utf-8');
      return defaultStore;
    }
    const raw = fs.readFileSync(storePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading store:", err);
    return defaultStore;
  }
}

function saveStore(data) {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(storePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error saving store:", err);
  }
}

// Initialize Database connection
async function initDb() {
  const host = process.env.MYSQL_HOST || 'localhost';
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10);
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'brainrush';

  try {
    // Attempt root connection with fast 1.5s timeout race
    const connectPromise = (async () => {
      const tempConnection = await mysql.createConnection({
        host,
        port,
        user,
        password,
        connectTimeout: 1500
      });

      await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
      await tempConnection.end();

      pool = mysql.createPool({
        host,
        port,
        user,
        password,
        database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      // Test pool connection
      const [rows] = await pool.query('SELECT 1 + 1 AS solution');
      console.log('✅ Connected to MySQL database successfully on ' + host + ':' + port + '/' + database);

      // Auto migrate schema
      const schemaFile = path.join(__dirname, '../database/schema.sql');
      if (fs.existsSync(schemaFile)) {
        const sqlContent = fs.readFileSync(schemaFile, 'utf-8');
        const statements = sqlContent
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().startsWith('use '));

        for (const statement of statements) {
          try {
            await pool.query(statement);
          } catch (err) {
            // Ignore table already exists or duplicate insert warnings
          }
        }
        console.log('✅ MySQL schema synchronized successfully');
      }

      useFallback = false;
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('MySQL connection timed out (Server not active on port 3306)')), 1500)
    );

    await Promise.race([connectPromise, timeoutPromise]);
  } catch (err) {
    console.warn(`⚠️ MySQL Connection note: ${err.message}.`);
    console.log(`🚀 Using BrainRush High-Performance JSON/Storage Engine (Seamless MySQL mirror).`);
    useFallback = true;
    getStore(); // Ensure data store initialized
  }
}

// Database helper functions abstraction
const db = {
  isUsingFallback: () => useFallback,

  // Direct query if MySQL is active
  async query(sql, params = []) {
    if (!useFallback && pool) {
      try {
        return await pool.query(sql, params);
      } catch (err) {
        console.error("MySQL query error:", err.message);
        throw err;
      }
    }
    return null;
  },

  // User queries
  users: {
    async findByEmail(email) {
      if (!useFallback && pool) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email.toLowerCase().trim()]);
        return rows[0] || null;
      }
      const store = getStore();
      return store.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
    },

    async findById(id) {
      if (!useFallback && pool) {
        const [rows] = await pool.query('SELECT id, name, email, avatar, streak_count, last_played_date, created_at FROM users WHERE id = ? LIMIT 1', [id]);
        return rows[0] || null;
      }
      const store = getStore();
      const u = store.users.find(u => Number(u.id) === Number(id));
      if (!u) return null;
      const { password, ...safeUser } = u;
      return safeUser;
    },

    async create({ name, email, password, avatar = 'brain_blue' }) {
      const trimmedEmail = email.toLowerCase().trim();
      if (!useFallback && pool) {
        const [result] = await pool.query(
          'INSERT INTO users (name, email, password, avatar, streak_count, created_at) VALUES (?, ?, ?, ?, 0, NOW())',
          [name.trim(), trimmedEmail, password, avatar]
        );
        return { id: result.insertId, name: name.trim(), email: trimmedEmail, avatar, streak_count: 0 };
      }
      const store = getStore();
      const newId = store.users.length ? Math.max(...store.users.map(u => u.id)) + 1 : 1;
      const newUser = {
        id: newId,
        name: name.trim(),
        email: trimmedEmail,
        password,
        avatar,
        streak_count: 0,
        last_played_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      store.users.push(newUser);
      saveStore(store);
      const { password: _, ...safeUser } = newUser;
      return safeUser;
    },

    async updateProfile(id, { name, avatar }) {
      if (!useFallback && pool) {
        await pool.query('UPDATE users SET name = COALESCE(?, name), avatar = COALESCE(?, avatar) WHERE id = ?', [name, avatar, id]);
        return this.findById(id);
      }
      const store = getStore();
      const index = store.users.findIndex(u => Number(u.id) === Number(id));
      if (index !== -1) {
        if (name) store.users[index].name = name;
        if (avatar) store.users[index].avatar = avatar;
        store.users[index].updated_at = new Date().toISOString();
        saveStore(store);
        const { password: _, ...safeUser } = store.users[index];
        return safeUser;
      }
      return null;
    },

    async updateStreak(id) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (!useFallback && pool) {
        const [users] = await pool.query('SELECT streak_count, last_played_date FROM users WHERE id = ?', [id]);
        if (users.length) {
          let streak = users[0].streak_count || 0;
          const last = users[0].last_played_date ? new Date(users[0].last_played_date).toISOString().split('T')[0] : null;

          if (last === yesterday) {
            streak += 1;
          } else if (last !== today) {
            streak = 1;
          }

          await pool.query('UPDATE users SET streak_count = ?, last_played_date = ? WHERE id = ?', [streak, today, id]);
          return streak;
        }
      } else {
        const store = getStore();
        const user = store.users.find(u => Number(u.id) === Number(id));
        if (user) {
          const last = user.last_played_date;
          if (last === yesterday) {
            user.streak_count = (user.streak_count || 0) + 1;
          } else if (last !== today) {
            user.streak_count = 1;
          }
          user.last_played_date = today;
          saveStore(store);
          return user.streak_count;
        }
      }
      return 1;
    }
  },

  // Games
  games: {
    async getAll() {
      if (!useFallback && pool) {
        const [rows] = await pool.query('SELECT * FROM games ORDER BY id ASC');
        return rows;
      }
      const store = getStore();
      return store.games;
    },

    async findBySlug(slug) {
      if (!useFallback && pool) {
        const [rows] = await pool.query('SELECT * FROM games WHERE slug = ? LIMIT 1', [slug]);
        return rows[0] || null;
      }
      const store = getStore();
      return store.games.find(g => g.slug === slug) || null;
    },

    async findById(id) {
      if (!useFallback && pool) {
        const [rows] = await pool.query('SELECT * FROM games WHERE id = ? LIMIT 1', [id]);
        return rows[0] || null;
      }
      const store = getStore();
      return store.games.find(g => Number(g.id) === Number(id)) || null;
    }
  },

  // Game Scores
  scores: {
    async add({ userId, gameId, score, accuracy = 100, timeTakenSeconds = 0, levelReached = 1, metadata = {} }) {
      if (!useFallback && pool) {
        const [result] = await pool.query(
          'INSERT INTO game_scores (user_id, game_id, score, accuracy, time_taken_seconds, level_reached, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
          [userId, gameId, score, accuracy, timeTakenSeconds, levelReached, JSON.stringify(metadata)]
        );
        return { id: result.insertId, userId, gameId, score, accuracy, timeTakenSeconds, levelReached, metadata };
      }
      const store = getStore();
      const newScore = {
        id: store.game_scores.length ? Math.max(...store.game_scores.map(s => s.id)) + 1 : 1,
        user_id: Number(userId),
        game_id: Number(gameId),
        score: Number(score),
        accuracy: Number(accuracy),
        time_taken_seconds: Number(timeTakenSeconds),
        level_reached: Number(levelReached),
        metadata,
        created_at: new Date().toISOString()
      };
      store.game_scores.push(newScore);
      saveStore(store);
      return newScore;
    },

    async getUserScores(userId) {
      if (!useFallback && pool) {
        const [rows] = await pool.query(
          `SELECT gs.*, g.name as game_name, g.category as game_category, g.slug as game_slug, g.icon as game_icon
           FROM game_scores gs
           JOIN games g ON gs.game_id = g.id
           WHERE gs.user_id = ?
           ORDER BY gs.created_at DESC LIMIT 50`,
          [userId]
        );
        return rows;
      }
      const store = getStore();
      return store.game_scores
        .filter(s => Number(s.user_id) === Number(userId))
        .map(s => {
          const game = store.games.find(g => Number(g.id) === Number(s.game_id));
          return {
            ...s,
            game_name: game ? game.name : 'Unknown Game',
            game_category: game ? game.category : 'General',
            game_slug: game ? game.slug : '',
            game_icon: game ? game.icon : 'Brain'
          };
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },

    async getUserStats(userId) {
      const scores = await this.getUserScores(userId);
      const totalGames = scores.length;
      if (totalGames === 0) {
        return {
          totalGames: 0,
          totalScore: 0,
          highestScore: 0,
          averageScore: 0,
          categoryStats: {
            Memory: { gamesPlayed: 0, bestScore: 0, avgAccuracy: 0 },
            Reaction: { gamesPlayed: 0, bestScore: 0, avgAccuracy: 0 },
            Mathematics: { gamesPlayed: 0, bestScore: 0, avgAccuracy: 0 },
            Pattern: { gamesPlayed: 0, bestScore: 0, avgAccuracy: 0 },
            Logic: { gamesPlayed: 0, bestScore: 0, avgAccuracy: 0 }
          },
          recentHistory: []
        };
      }

      const totalScore = scores.reduce((sum, s) => sum + (s.score || 0), 0);
      const highestScore = Math.max(...scores.map(s => s.score || 0));
      const averageScore = Math.round(totalScore / totalGames);

      const categoryStats = {
        Memory: { gamesPlayed: 0, bestScore: 0, totalAccuracy: 0, avgAccuracy: 0 },
        Reaction: { gamesPlayed: 0, bestScore: 0, totalAccuracy: 0, avgAccuracy: 0 },
        Mathematics: { gamesPlayed: 0, bestScore: 0, totalAccuracy: 0, avgAccuracy: 0 },
        Pattern: { gamesPlayed: 0, bestScore: 0, totalAccuracy: 0, avgAccuracy: 0 },
        Logic: { gamesPlayed: 0, bestScore: 0, totalAccuracy: 0, avgAccuracy: 0 }
      };

      scores.forEach(s => {
        const cat = s.game_category || 'Memory';
        if (!categoryStats[cat]) {
          categoryStats[cat] = { gamesPlayed: 0, bestScore: 0, totalAccuracy: 0, avgAccuracy: 0 };
        }
        categoryStats[cat].gamesPlayed += 1;
        if (s.score > categoryStats[cat].bestScore) {
          categoryStats[cat].bestScore = s.score;
        }
        categoryStats[cat].totalAccuracy += (Number(s.accuracy) || 100);
      });

      Object.keys(categoryStats).forEach(cat => {
        if (categoryStats[cat].gamesPlayed > 0) {
          categoryStats[cat].avgAccuracy = Math.round(categoryStats[cat].totalAccuracy / categoryStats[cat].gamesPlayed);
        }
      });

      return {
        totalGames,
        totalScore,
        highestScore,
        averageScore,
        categoryStats,
        recentHistory: scores.slice(0, 10)
      };
    }
  },

  // Leaderboard
  leaderboard: {
    async getLeaderboard(period = 'all-time', gameSlug = null) {
      let timeCondition = '';
      const now = new Date();

      if (period === 'daily') {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        timeCondition = `AND gs.created_at >= '${todayStart}'`;
      } else if (period === 'weekly') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        timeCondition = `AND gs.created_at >= '${weekAgo}'`;
      } else if (period === 'monthly') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        timeCondition = `AND gs.created_at >= '${monthAgo}'`;
      }

      if (!useFallback && pool) {
        let gameFilter = '';
        let queryParams = [];
        if (gameSlug) {
          gameFilter = 'AND g.slug = ?';
          queryParams.push(gameSlug);
        }

        const sql = `
          SELECT 
            u.id as user_id,
            u.name as player_name,
            u.avatar as player_avatar,
            u.streak_count,
            SUM(gs.score) as total_score,
            MAX(gs.score) as best_score,
            COUNT(gs.id) as games_played,
            ROUND(AVG(gs.accuracy), 1) as avg_accuracy
          FROM users u
          JOIN game_scores gs ON u.id = gs.user_id
          JOIN games g ON gs.game_id = g.id
          WHERE 1=1 ${timeCondition} ${gameFilter}
          GROUP BY u.id, u.name, u.avatar, u.streak_count
          ORDER BY total_score DESC
          LIMIT 50
        `;
        const [rows] = await pool.query(sql, queryParams);
        return rows.map((r, index) => ({
          ...r,
          rank: index + 1
        }));
      }

      // JSON Fallback Leaderboard
      const store = getStore();
      const cutoffDate = period === 'daily' ? new Date(now.getFullYear(), now.getMonth(), now.getDate()) :
                         period === 'weekly' ? new Date(now.getTime() - 7 * 86400000) :
                         period === 'monthly' ? new Date(now.getTime() - 30 * 86400000) : null;

      let filteredScores = store.game_scores;
      if (cutoffDate) {
        filteredScores = filteredScores.filter(s => new Date(s.created_at) >= cutoffDate);
      }
      if (gameSlug) {
        const matchedGame = store.games.find(g => g.slug === gameSlug);
        if (matchedGame) {
          filteredScores = filteredScores.filter(s => Number(s.game_id) === Number(matchedGame.id));
        }
      }

      const userMap = {};
      filteredScores.forEach(s => {
        const uid = s.user_id;
        if (!userMap[uid]) {
          const user = store.users.find(u => Number(u.id) === Number(uid));
          userMap[uid] = {
            user_id: uid,
            player_name: user ? user.name : `Player #${uid}`,
            player_avatar: user ? user.avatar : 'brain_blue',
            streak_count: user ? user.streak_count || 0 : 0,
            total_score: 0,
            best_score: 0,
            games_played: 0,
            total_accuracy: 0
          };
        }
        userMap[uid].total_score += (s.score || 0);
        userMap[uid].games_played += 1;
        userMap[uid].total_accuracy += (Number(s.accuracy) || 100);
        if (s.score > userMap[uid].best_score) {
          userMap[uid].best_score = s.score;
        }
      });

      const list = Object.values(userMap)
        .map(u => ({
          ...u,
          avg_accuracy: u.games_played ? Math.round(u.total_accuracy / u.games_played) : 100
        }))
        .sort((a, b) => b.total_score - a.total_score)
        .slice(0, 50)
        .map((r, idx) => ({ ...r, rank: idx + 1 }));

      return list;
    }
  },

  // Achievements
  achievements: {
    async getAllWithUserStatus(userId = null) {
      let achievementsList = [];
      let unlockedMap = {};

      if (!useFallback && pool) {
        const [achRows] = await pool.query('SELECT * FROM achievements ORDER BY id ASC');
        achievementsList = achRows;

        if (userId) {
          const [userAch] = await pool.query('SELECT * FROM user_achievements WHERE user_id = ?', [userId]);
          userAch.forEach(ua => {
            unlockedMap[ua.achievement_id] = {
              unlocked: true,
              unlocked_at: ua.unlocked_at,
              progress: ua.progress
            };
          });
        }
      } else {
        const store = getStore();
        achievementsList = store.achievements;
        if (userId) {
          store.user_achievements
            .filter(ua => Number(ua.user_id) === Number(userId))
            .forEach(ua => {
              unlockedMap[ua.achievement_id] = {
                unlocked: true,
                unlocked_at: ua.unlocked_at,
                progress: ua.progress
              };
            });
        }
      }

      return achievementsList.map(a => ({
        ...a,
        unlocked: Boolean(unlockedMap[a.id]),
        unlocked_at: unlockedMap[a.id]?.unlocked_at || null,
        progress: unlockedMap[a.id]?.progress || 0
      }));
    },

    async checkAndUnlock(userId, gameSlug, scoreData) {
      const newlyUnlocked = [];
      const userScores = await db.scores.getUserScores(userId);
      const allAchievements = await db.achievements.getAllWithUserStatus(userId);
      const unlockedIds = new Set(allAchievements.filter(a => a.unlocked).map(a => a.id));

      const totalScore = userScores.reduce((acc, s) => acc + (s.score || 0), 0);
      const playedGameSlugs = new Set(userScores.map(s => s.game_slug));

      for (const ach of allAchievements) {
        if (unlockedIds.has(ach.id)) continue;

        let shouldUnlock = false;
        let progressVal = 0;

        switch (ach.code) {
          case 'FIRST_GAME':
            if (userScores.length >= 1) shouldUnlock = true;
            break;
          case 'BRAIN_BEGINNER':
            if (scoreData.score >= 500) shouldUnlock = true;
            break;
          case 'MEMORY_MASTER':
            if (gameSlug === 'memory-match' && scoreData.timeTakenSeconds <= 30 && scoreData.score > 0) {
              shouldUnlock = true;
            }
            break;
          case 'SPEED_DEMON':
            if (gameSlug === 'reaction-time' && scoreData.metadata?.avgReactionMs && scoreData.metadata.avgReactionMs <= 220) {
              shouldUnlock = true;
            }
            break;
          case 'MATH_WIZARD':
            if (gameSlug === 'number-challenge' && scoreData.metadata?.streak >= 10) {
              shouldUnlock = true;
            }
            break;
          case 'PATTERN_PRO':
            if (gameSlug === 'pattern-memory' && scoreData.levelReached >= 7) {
              shouldUnlock = true;
            }
            break;
          case 'LOGIC_GENIUS':
            if (gameSlug === 'logic-puzzle' && scoreData.accuracy >= 100 && scoreData.levelReached >= 5) {
              shouldUnlock = true;
            }
            break;
          case 'HIGH_SCORER':
            progressVal = totalScore;
            if (totalScore >= 10000) shouldUnlock = true;
            break;
          case 'PUZZLE_EXPERT':
            progressVal = playedGameSlugs.size;
            if (playedGameSlugs.size >= 5) shouldUnlock = true;
            break;
          default:
            break;
        }

        if (shouldUnlock) {
          await this.unlock(userId, ach.id, progressVal || ach.target_value);
          newlyUnlocked.push(ach);
        }
      }

      return newlyUnlocked;
    },

    async unlock(userId, achievementId, progress = 1) {
      if (!useFallback && pool) {
        await pool.query(
          'INSERT INTO user_achievements (user_id, achievement_id, progress, unlocked_at) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE progress = VALUES(progress)',
          [userId, achievementId, progress]
        );
      } else {
        const store = getStore();
        const existing = store.user_achievements.find(ua => Number(ua.user_id) === Number(userId) && Number(ua.achievement_id) === Number(achievementId));
        if (!existing) {
          store.user_achievements.push({
            id: store.user_achievements.length + 1,
            user_id: Number(userId),
            achievement_id: Number(achievementId),
            progress,
            unlocked_at: new Date().toISOString()
          });
          saveStore(store);
        }
      }
    }
  },

  // Daily Challenges
  daily: {
    async getTodayChallenge(userId = null) {
      const todayStr = new Date().toISOString().split('T')[0];
      let challenge = null;

      if (!useFallback && pool) {
        const [rows] = await pool.query(
          `SELECT dc.*, g.name as game_name, g.slug as game_slug, g.category as game_category, g.icon as game_icon
           FROM daily_challenges dc
           JOIN games g ON dc.game_id = g.id
           WHERE dc.challenge_date = ? LIMIT 1`,
          [todayStr]
        );
        challenge = rows[0] || null;

        if (!challenge) {
          // Generate today's challenge
          const [games] = await pool.query('SELECT * FROM games');
          if (games.length) {
            const dayNum = new Date().getDate();
            const selectedGame = games[dayNum % games.length];
            const titles = [
              "Daily Cortex Boost",
              "Synapse Sprint",
              "Neural Spark Challenge",
              "Mind Matrix Mastery",
              "Cognitive Reflex Pro"
            ];
            const title = titles[dayNum % titles.length];
            const targetScore = 1200 + (dayNum % 5) * 200;

            const [ins] = await pool.query(
              'INSERT INTO daily_challenges (challenge_date, game_id, title, description, target_score, reward_xp) VALUES (?, ?, ?, ?, ?, ?)',
              [todayStr, selectedGame.id, title, `Score at least ${targetScore} points in ${selectedGame.name} to complete today's mission.`, targetScore, 300]
            );
            challenge = {
              id: ins.insertId,
              challenge_date: todayStr,
              game_id: selectedGame.id,
              title,
              description: `Score at least ${targetScore} points in ${selectedGame.name} to complete today's mission.`,
              target_score: targetScore,
              reward_xp: 300,
              game_name: selectedGame.name,
              game_slug: selectedGame.slug,
              game_category: selectedGame.category,
              game_icon: selectedGame.icon
            };
          }
        }
      } else {
        const store = getStore();
        let dc = store.daily_challenges.find(c => c.challenge_date === todayStr);
        if (!dc) {
          const games = store.games;
          const dayNum = new Date().getDate();
          const selectedGame = games[dayNum % games.length];
          const targetScore = 1200 + (dayNum % 5) * 200;
          dc = {
            id: store.daily_challenges.length + 1,
            challenge_date: todayStr,
            game_id: selectedGame.id,
            title: "Daily Neural Boost",
            description: `Score at least ${targetScore} points in ${selectedGame.name} to complete today's mission.`,
            target_score: targetScore,
            reward_xp: 300,
            created_at: new Date().toISOString()
          };
          store.daily_challenges.push(dc);
          saveStore(store);
        }

        const game = store.games.find(g => Number(g.id) === Number(dc.game_id));
        challenge = {
          ...dc,
          game_name: game ? game.name : 'Memory Match',
          game_slug: game ? game.slug : 'memory-match',
          game_category: game ? game.category : 'Memory',
          game_icon: game ? game.icon : 'Brain'
        };
      }

      let userStatus = { completed: false, scoreAchieved: 0 };
      if (userId && challenge) {
        if (!useFallback && pool) {
          const [prog] = await pool.query(
            'SELECT * FROM user_progress WHERE user_id = ? AND challenge_date = ? LIMIT 1',
            [userId, todayStr]
          );
          if (prog.length) {
            userStatus = { completed: Boolean(prog[0].completed), scoreAchieved: prog[0].score_achieved };
          }
        } else {
          const store = getStore();
          const prog = store.user_progress.find(p => Number(p.user_id) === Number(userId) && p.challenge_date === todayStr);
          if (prog) {
            userStatus = { completed: Boolean(prog.completed), scoreAchieved: prog.score_achieved };
          }
        }
      }

      return {
        ...challenge,
        userStatus
      };
    },

    async completeTodayChallenge(userId, scoreAchieved) {
      const todayStr = new Date().toISOString().split('T')[0];
      const challengeInfo = await this.getTodayChallenge(userId);

      const isSuccess = scoreAchieved >= challengeInfo.target_score;

      if (!useFallback && pool) {
        await pool.query(
          `INSERT INTO user_progress (user_id, challenge_date, completed, score_achieved, completed_at)
           VALUES (?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE completed = VALUES(completed), score_achieved = GREATEST(score_achieved, VALUES(score_achieved)), completed_at = NOW()`,
          [userId, todayStr, isSuccess ? 1 : 0, scoreAchieved]
        );
      } else {
        const store = getStore();
        const index = store.user_progress.findIndex(p => Number(p.user_id) === Number(userId) && p.challenge_date === todayStr);
        if (index !== -1) {
          store.user_progress[index].completed = store.user_progress[index].completed || isSuccess;
          store.user_progress[index].score_achieved = Math.max(store.user_progress[index].score_achieved, scoreAchieved);
          store.user_progress[index].completed_at = new Date().toISOString();
        } else {
          store.user_progress.push({
            id: store.user_progress.length + 1,
            user_id: Number(userId),
            challenge_date: todayStr,
            completed: isSuccess,
            score_achieved: scoreAchieved,
            completed_at: new Date().toISOString()
          });
        }
        saveStore(store);
      }

      if (isSuccess) {
        await db.users.updateStreak(userId);
      }

      return { success: isSuccess, scoreAchieved, targetScore: challengeInfo.target_score };
    }
  }
};

module.exports = {
  initDb,
  db
};
