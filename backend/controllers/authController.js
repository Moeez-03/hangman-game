// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { pool } = require('../config/db');

// ── Helper: generate token ────────────────────────────
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// ── REGISTER ─────────────────────────────────────────
async function register(req, res) {
  const { username, email, password } = req.body;

  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (username.length < 3 || username.length > 30) {
    return res.status(400).json({ error: 'Username must be 3-30 characters' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    // Check if username/email already exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Username or email already taken' });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 12);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hash]
    );

    const user = { id: result.insertId, username };
    const token = generateToken(user);

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: { id: user.id, username, email, avatar: '🎮' }
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
}

// ── LOGIN ─────────────────────────────────────────────
async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Logged in successfully!',
      token,
      user: {
        id:          user.id,
        username:    user.username,
        email:       user.email,
        avatar:      user.avatar,
        total_score: user.total_score,
        total_wins:  user.total_wins,
        total_games: user.total_games,
        best_streak: user.best_streak,
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
}

// ── GET PROFILE ───────────────────────────────────────
async function getProfile(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, username, email, avatar,
              total_score, total_wins, total_games, best_streak, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Also get last 10 games
    const [games] = await pool.query(
      `SELECT gs.score, gs.won, gs.difficulty, gs.time_taken,
              gs.wrong_guesses, gs.played_at, w.word
       FROM game_sessions gs
       JOIN words w ON gs.word_id = w.id
       WHERE gs.user_id = ?
       ORDER BY gs.played_at DESC LIMIT 10`,
      [req.user.id]
    );

    res.json({ user: rows[0], recentGames: games });

  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

// ── UPDATE AVATAR ─────────────────────────────────────
async function updateAvatar(req, res) {
  const { avatar } = req.body;
  const allowed = ['🎮','👾','🤖','💀','🔥','⚡','🎯','🏆','😎','🧠'];

  if (!allowed.includes(avatar)) {
    return res.status(400).json({ error: 'Invalid avatar' });
  }

  try {
    await pool.query('UPDATE users SET avatar = ? WHERE id = ?', [avatar, req.user.id]);
    res.json({ message: 'Avatar updated!', avatar });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { register, login, getProfile, updateAvatar };
