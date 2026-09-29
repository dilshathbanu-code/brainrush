const express = require('express');
const router = express.Router();
const { db } = require('../config/db');

// GET /api/leaderboard
router.get('/', async (req, res) => {
  try {
    const { period = 'all-time', game = null } = req.query;
    const validPeriods = ['daily', 'weekly', 'monthly', 'all-time'];
    const selectedPeriod = validPeriods.includes(period.toLowerCase()) ? period.toLowerCase() : 'all-time';

    const rankings = await db.leaderboard.getLeaderboard(selectedPeriod, game);

    return res.json({
      success: true,
      period: selectedPeriod,
      gameFilter: game,
      count: rankings.length,
      leaderboard: rankings
    });
  } catch (err) {
    console.error('Leaderboard error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve leaderboard rankings.' });
  }
});

module.exports = router;
