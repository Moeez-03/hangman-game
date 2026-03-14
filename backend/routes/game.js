// backend/routes/game.js
const express = require('express');
const router  = express.Router();
const { getWord, submitGame, getCategories, getHistory } = require('../controllers/gameController');
const { authMiddleware } = require('../middleware/auth');

// Public
router.get('/word',       getWord);
router.get('/categories', getCategories);

// Protected
router.post('/submit',  authMiddleware, submitGame);
router.get('/history',  authMiddleware, getHistory);

module.exports = router;
