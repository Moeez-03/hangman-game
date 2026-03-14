// backend/server.js
require('dotenv').config();

const express     = require('express');
const cors        = require('cors');
const rateLimit   = require('express-rate-limit');
const { testConnection } = require('./config/db');

const app = express();

// ── MIDDLEWARE ────────────────────────────────────────
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting — prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      100,             // max 100 requests per window
  message:  { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Stricter limit on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { error: 'Too many auth attempts, please wait 15 minutes.' }
});
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);

// ── ROUTES ────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/game',        require('./routes/game'));
app.use('/api/leaderboard', require('./routes/leaderboard'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── START ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function start() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API base: http://localhost:${PORT}/api`);
  });
}

start();
