const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// POST /api/scores
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { gameSlug, gameId, score, accuracy, timeTakenSeconds, levelReached, metadata = {} } = req.body;

    if (score === undefined || score === null) {
      return res.status(400).json({ success: false, message: 'Score value is required.' });
    }

    let targetGame = null;
    if (gameId) {
      targetGame = await db.games.findById(gameId);
    } else if (gameSlug) {
      targetGame = await db.games.findBySlug(gameSlug);
    }

    if (!targetGame) {
      return res.status(404).json({ success: false, message: 'Invalid game identifier.' });
    }

    // Save score
    const savedScore = await db.scores.add({
      userId: req.user.id,
      gameId: targetGame.id,
      score: Math.max(0, parseInt(score, 10)),
      accuracy: Math.min(100, Math.max(0, parseFloat(accuracy) || 100)),
      timeTakenSeconds: parseInt(timeTakenSeconds, 10) || 0,
      levelReached: parseInt(levelReached, 10) || 1,
      metadata
    });

    // Update streak
    const newStreak = await db.users.updateStreak(req.user.id);

    // Check achievements
    const newlyUnlockedAchievements = await db.achievements.checkAndUnlock(req.user.id, targetGame.slug, {
      score: savedScore.score,
      accuracy: savedScore.accuracy,
      timeTakenSeconds: savedScore.time_taken_seconds,
      levelReached: savedScore.level_reached,
      metadata
    });

    // Check if daily challenge can be completed
    const dailyChallenge = await db.daily.getTodayChallenge(req.user.id);
    let dailyCompleted = false;
    if (dailyChallenge && Number(dailyChallenge.game_id) === Number(targetGame.id) && savedScore.score >= dailyChallenge.target_score) {
      await db.daily.completeTodayChallenge(req.user.id, savedScore.score);
      dailyCompleted = true;
    }

    return res.status(201).json({
      success: true,
      message: 'Score saved successfully!',
      score: savedScore,
      streak: newStreak,
      unlockedAchievements: newlyUnlockedAchievements,
      dailyCompleted
    });
  } catch (err) {
    console.error('Score submission error:', err);
    return res.status(500).json({ success: false, message: 'Failed to record game score.' });
  }
});

// GET /api/scores/user
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const scores = await db.scores.getUserScores(req.user.id);
    const stats = await db.scores.getUserStats(req.user.id);

    return res.json({
      success: true,
      scores,
      stats
    });
  } catch (err) {
    console.error('User scores fetch error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve score history.' });
  }
});

module.exports = router;
