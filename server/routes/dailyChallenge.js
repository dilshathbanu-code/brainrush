const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { optionalAuthenticateToken, authenticateToken } = require('../middleware/auth');

// GET /api/daily-challenge
router.get('/', optionalAuthenticateToken, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const challenge = await db.daily.getTodayChallenge(userId);

    let streak = 0;
    if (userId) {
      const user = await db.users.findById(userId);
      if (user) streak = user.streak_count || 0;
    }

    return res.json({
      success: true,
      challenge,
      userStreak: streak
    });
  } catch (err) {
    console.error('Daily challenge error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve daily challenge.' });
  }
});

// POST /api/daily-challenge/complete
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const { score } = req.body;
    if (score === undefined) {
      return res.status(400).json({ success: false, message: 'Score is required to verify daily challenge completion.' });
    }

    const result = await db.daily.completeTodayChallenge(req.user.id, parseInt(score, 10));
    const user = await db.users.findById(req.user.id);

    return res.json({
      success: true,
      message: result.success ? '🎉 Daily challenge completed! Streak increased!' : 'Challenge attempted, score recorded.',
      completed: result.success,
      scoreAchieved: result.scoreAchieved,
      targetScore: result.targetScore,
      newStreak: user ? user.streak_count : 1
    });
  } catch (err) {
    console.error('Daily challenge complete error:', err);
    return res.status(500).json({ success: false, message: 'Failed to complete daily challenge.' });
  }
});

module.exports = router;
