const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { optionalAuthenticateToken } = require('../middleware/auth');

// GET /api/games
router.get('/', optionalAuthenticateToken, async (req, res) => {
  try {
    const games = await db.games.getAll();
    let userScores = [];

    if (req.user) {
      userScores = await db.scores.getUserScores(req.user.id);
    }

    const enhancedGames = games.map(game => {
      const gameScores = userScores.filter(s => Number(s.game_id) === Number(game.id));
      const bestScore = gameScores.length ? Math.max(...gameScores.map(s => s.score)) : 0;
      const timesPlayed = gameScores.length;

      return {
        ...game,
        userBestScore: bestScore,
        userTimesPlayed: timesPlayed
      };
    });

    return res.json({
      success: true,
      games: enhancedGames
    });
  } catch (err) {
    console.error('Games list error:', err);
    return res.status(500).json({ success: false, message: 'Error retrieving games.' });
  }
});

// GET /api/games/:slugOrId
router.get('/:identifier', optionalAuthenticateToken, async (req, res) => {
  try {
    const { identifier } = req.params;
    let game = null;

    if (!isNaN(identifier)) {
      game = await db.games.findById(Number(identifier));
    } else {
      game = await db.games.findBySlug(identifier);
    }

    if (!game) {
      return res.status(404).json({ success: false, message: 'Game not found.' });
    }

    let userStats = { bestScore: 0, timesPlayed: 0, avgAccuracy: 0 };
    if (req.user) {
      const userScores = await db.scores.getUserScores(req.user.id);
      const gameScores = userScores.filter(s => Number(s.game_id) === Number(game.id));
      if (gameScores.length > 0) {
        userStats.bestScore = Math.max(...gameScores.map(s => s.score));
        userStats.timesPlayed = gameScores.length;
        userStats.avgAccuracy = Math.round(gameScores.reduce((acc, s) => acc + (Number(s.accuracy) || 100), 0) / gameScores.length);
      }
    }

    return res.json({
      success: true,
      game: {
        ...game,
        userStats
      }
    });
  } catch (err) {
    console.error('Game detail error:', err);
    return res.status(500).json({ success: false, message: 'Error retrieving game details.' });
  }
});

module.exports = router;
