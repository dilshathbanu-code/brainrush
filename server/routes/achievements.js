const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { optionalAuthenticateToken } = require('../middleware/auth');

// GET /api/achievements
router.get('/', optionalAuthenticateToken, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const achievements = await db.achievements.getAllWithUserStatus(userId);

    const totalCount = achievements.length;
    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return res.json({
      success: true,
      stats: {
        total: totalCount,
        unlocked: unlockedCount,
        completionPercentage: totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0
      },
      achievements
    });
  } catch (err) {
    console.error('Achievements error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve achievements.' });
  }
});

module.exports = router;
