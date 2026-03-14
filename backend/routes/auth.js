// backend/routes/auth.js
const express = require('express');
const router  = express.Router();
const { register, login, getProfile, updateAvatar } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login',    login);

// Protected routes
router.get('/profile',        authMiddleware, getProfile);
router.patch('/avatar',       authMiddleware, updateAvatar);

module.exports = router;
