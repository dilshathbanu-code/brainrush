const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/users/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await db.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const stats = await db.scores.getUserStats(req.user.id);
    const achievements = await db.achievements.getAllWithUserStatus(req.user.id);

    return res.json({
      success: true,
      profile: {
        ...user,
        stats,
        achievements: {
          total: achievements.length,
          unlockedCount: achievements.filter(a => a.unlocked).length,
          items: achievements
        }
      }
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    return res.status(500).json({ success: false, message: 'Error fetching profile data.' });
  }
});

// PUT /api/users/profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    if (!name && !avatar) {
      return res.status(400).json({ success: false, message: 'Please provide name or avatar to update.' });
    }

    const updatedUser = await db.users.updateProfile(req.user.id, { name, avatar });
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ success: false, message: 'Error updating profile.' });
  }
});

module.exports = router;
