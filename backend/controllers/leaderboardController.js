// backend/controllers/leaderboardController.js
const { pool } = require('../config/db');

// ── GLOBAL LEADERBOARD ────────────────────────────────
// GET /api/leaderboard?limit=10
async function getLeaderboard(req, res) {
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);

  try {
    const [rows] = await pool.query(
      'SELECT * FROM leaderboard LIMIT ?',
      [limit]
    );
    res.json(rows);
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

// ── TOP SCORES BY DIFFICULTY ──────────────────────────
// GET /api/leaderboard/difficulty/:diff
async function getByDifficulty(req, res) {
  const { diff } = req.params;
  if (!['easy','medium','hard'].includes(diff)) {
    return res.status(400).json({ error: 'Invalid difficulty' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT u.username, u.avatar,
              MAX(gs.score) AS best_score,
              COUNT(*)      AS games_played,
              SUM(gs.won)   AS wins
       FROM game_sessions gs
       JOIN users u ON gs.user_id = u.id
       WHERE gs.difficulty = ?
       GROUP BY u.id, u.username, u.avatar
       ORDER BY best_score DESC
       LIMIT 10`,
      [diff]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

// ── USER'S RANK ───────────────────────────────────────
// GET /api/leaderboard/rank  (requires auth)
async function getUserRank(req, res) {
  try {
    const [[rank]] = await pool.query(
      `SELECT COUNT(*) + 1 AS rank
       FROM users
       WHERE total_score > (SELECT total_score FROM users WHERE id = ?)`,
      [req.user.id]
    );

    const [[user]] = await pool.query(
      'SELECT total_score, total_wins, total_games, best_streak FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({ rank: rank.rank, ...user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getLeaderboard, getByDifficulty, getUserRank };
