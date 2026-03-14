// backend/routes/leaderboard.js
const express = require('express');
const router  = express.Router();
const { getLeaderboard, getByDifficulty, getUserRank } = require('../controllers/leaderboardController');
const { authMiddleware } = require('../middleware/auth');

// Public
router.get('/',                  getLeaderboard);
router.get('/difficulty/:diff',  getByDifficulty);

// Protected
router.get('/rank', authMiddleware, getUserRank);

module.exports = router;
