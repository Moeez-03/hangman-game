// backend/controllers/gameController.js
const { pool } = require('../config/db');

// ── GET RANDOM WORD ───────────────────────────────────
// GET /api/game/word?category=tech&difficulty=easy
async function getWord(req, res) {
  const { category = 'all', difficulty = 'easy' } = req.query;

  const validDiff = ['easy', 'medium', 'hard'];
  const validCat  = ['all', 'tech', 'general', 'games', 'science'];

  if (!validDiff.includes(difficulty)) {
    return res.status(400).json({ error: 'Invalid difficulty' });
  }
  if (!validCat.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  try {
    let query, params;

    if (category === 'all') {
      query  = 'SELECT id, word, hint, difficulty FROM words WHERE difficulty = ? ORDER BY RAND() LIMIT 1';
      params = [difficulty];
    } else {
      query  = `SELECT w.id, w.word, w.hint, w.difficulty
                FROM words w
                JOIN categories c ON w.category_id = c.id
                WHERE c.name = ? AND w.difficulty = ?
                ORDER BY RAND() LIMIT 1`;
      params = [category, difficulty];
    }

    const [rows] = await pool.query(query, params);

    if (rows.length === 0) {
      // Fallback: any word in that difficulty
      const [fallback] = await pool.query(
        'SELECT id, word, hint, difficulty FROM words WHERE difficulty = ? ORDER BY RAND() LIMIT 1',
        [difficulty]
      );
      if (fallback.length === 0) {
        return res.status(404).json({ error: 'No words found' });
      }
      return res.json(fallback[0]);
    }

    // Increment usage count
    await pool.query('UPDATE words SET times_used = times_used + 1 WHERE id = ?', [rows[0].id]);

    res.json(rows[0]);

  } catch (err) {
    console.error('getWord error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

// ── SUBMIT GAME RESULT ────────────────────────────────
// POST /api/game/submit  (requires auth)
async function submitGame(req, res) {
  const { word_id, score, wrong_guesses, time_taken, difficulty, won, hint_used } = req.body;

  if (!word_id || score === undefined || difficulty === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Save game session
    await conn.query(
      `INSERT INTO game_sessions
         (user_id, word_id, score, wrong_guesses, time_taken, difficulty, won, hint_used)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        word_id,
        score,
        wrong_guesses || 0,
        time_taken   || 0,
        difficulty,
        won ? 1 : 0,
        hint_used ? 1 : 0,
      ]
    );

    // Update user stats
    const winIncrement = won ? 1 : 0;
    await conn.query(
      `UPDATE users SET
         total_score = total_score + ?,
         total_games = total_games + 1,
         total_wins  = total_wins  + ?,
         updated_at  = NOW()
       WHERE id = ?`,
      [score, winIncrement, req.user.id]
    );

    // Update best_streak if needed — frontend sends current streak
    if (req.body.streak) {
      await conn.query(
        'UPDATE users SET best_streak = GREATEST(best_streak, ?) WHERE id = ?',
        [req.body.streak, req.user.id]
      );
    }

    await conn.commit();

    // Return updated user stats
    const [updated] = await conn.query(
      'SELECT total_score, total_wins, total_games, best_streak FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({ message: 'Game saved!', stats: updated[0] });

  } catch (err) {
    await conn.rollback();
    console.error('submitGame error:', err);
    res.status(500).json({ error: 'Server error saving game' });
  } finally {
    conn.release();
  }
}

// ── GET ALL CATEGORIES ────────────────────────────────
async function getCategories(req, res) {
  try {
    const [rows] = await pool.query('SELECT id, name, icon FROM categories');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

// ── GET GAME HISTORY (for logged-in user) ─────────────
async function getHistory(req, res) {
  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  try {
    const [rows] = await pool.query(
      `SELECT gs.id, gs.score, gs.won, gs.difficulty,
              gs.time_taken, gs.wrong_guesses, gs.hint_used, gs.played_at,
              w.word, w.hint, c.name AS category, c.icon
       FROM game_sessions gs
       JOIN words w ON gs.word_id = w.id
       JOIN categories c ON w.category_id = c.id
       WHERE gs.user_id = ?
       ORDER BY gs.played_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, limit, offset]
    );

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM game_sessions WHERE user_id = ?',
      [req.user.id]
    );

    res.json({ games: rows, total, page, limit });

  } catch (err) {
    console.error('getHistory error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getWord, submitGame, getCategories, getHistory };
