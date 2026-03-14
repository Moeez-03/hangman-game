-- =====================================================
--  HANGMAN PRO — MySQL Database Schema
-- =====================================================

CREATE DATABASE IF NOT EXISTS hangman_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hangman_db;

-- ─────────────────────────────────────────
--  USERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(30)     NOT NULL UNIQUE,
  email         VARCHAR(100)    NOT NULL UNIQUE,
  password_hash VARCHAR(255)    NOT NULL,
  avatar        VARCHAR(10)     DEFAULT '🎮',
  total_score   INT UNSIGNED    DEFAULT 0,
  total_wins    INT UNSIGNED    DEFAULT 0,
  total_games   INT UNSIGNED    DEFAULT 0,
  best_streak   INT UNSIGNED    DEFAULT 0,
  created_at    DATETIME        DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  CATEGORIES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id    INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(50)   NOT NULL UNIQUE,
  icon  VARCHAR(10)   DEFAULT '📁'
);

INSERT INTO categories (name, icon) VALUES
  ('tech',    '💻'),
  ('general', '🌍'),
  ('games',   '🎮'),
  ('science', '🔬');

-- ─────────────────────────────────────────
--  WORDS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS words (
  id          INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  word        VARCHAR(100)    NOT NULL,
  hint        VARCHAR(255)    NOT NULL,
  category_id INT UNSIGNED    NOT NULL,
  difficulty  ENUM('easy','medium','hard') NOT NULL DEFAULT 'easy',
  times_used  INT UNSIGNED    DEFAULT 0,
  created_at  DATETIME        DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Seed words
INSERT INTO words (word, hint, category_id, difficulty) VALUES
-- TECH - easy
('HTML',       'Markup language for web pages.',              1, 'easy'),
('CSS',        'Styles and layouts for web pages.',           1, 'easy'),
('PHP',        'Popular server-side scripting language.',     1, 'easy'),
('Java',       'Write once, run anywhere.',                   1, 'easy'),
('Python',     'Beginner-friendly high-level language.',      1, 'easy'),
('API',        'Interface allowing apps to communicate.',     1, 'easy'),
('Binary',     'Number system with only 0 and 1.',            1, 'easy'),
-- TECH - medium
('JavaScript', 'Makes web pages interactive.',                1, 'medium'),
('Algorithm',  'Step-by-step problem-solving process.',       1, 'medium'),
('Database',   'Organized collection of structured data.',    1, 'medium'),
('Framework',  'Pre-built foundation for software.',          1, 'medium'),
('Compiler',   'Translates source code to machine code.',     1, 'medium'),
('Encryption', 'Converts data into unreadable format.',       1, 'medium'),
-- TECH - hard
('Repository', 'Where code is stored and versioned.',         1, 'hard'),
('Kubernetes', 'Container orchestration by Google.',          1, 'hard'),
('Blockchain', 'Distributed ledger behind crypto.',           1, 'hard'),
('Recursion',  'A function that calls itself.',               1, 'hard'),
-- GENERAL - easy
('Hangman',    'The game you are playing right now.',         2, 'easy'),
('Love',       'Baby don''t hurt me, no more.',               2, 'easy'),
('Document',   'A file filled with text.',                    2, 'easy'),
('Samsung',    'Korean giant: phones, TVs, chips.',           2, 'easy'),
('Smartphone', 'Device always in your pocket.',               2, 'easy'),
-- GENERAL - medium
('Telescope',  'Device for viewing distant objects.',         2, 'medium'),
('Dictionary', 'Book of word definitions.',                   2, 'medium'),
('Photograph', 'Image captured by a camera.',                 2, 'medium'),
-- GENERAL - hard
('Symphony',   'A long orchestral composition.',              2, 'hard'),
('Phenomenon', 'Remarkable or unexplained occurrence.',       2, 'hard'),
-- GAMES - easy
('Super Mario','Nintendo hero in a red hat.',                 3, 'easy'),
('Minecraft',  'Build anything with blocks.',                 3, 'easy'),
('Fortnite',   'Battle royale with building.',                3, 'easy'),
('Zelda',      'Link''s legendary adventure.',                3, 'easy'),
('Pokemon',    'Gotta catch them all.',                       3, 'easy'),
-- GAMES - medium
('Cyberpunk',  'Night City futuristic RPG.',                  3, 'medium'),
('Elden Ring', 'FromSoftware open-world soulslike.',          3, 'medium'),
('Overwatch',  'Blizzard team-based hero shooter.',           3, 'medium'),
-- GAMES - hard
('Baldurs Gate','Classic D&D-based RPG.',                     3, 'hard'),
-- SCIENCE - easy
('Galaxy',     'Milky Way is one of these.',                  4, 'easy'),
('Atom',       'Smallest unit of matter.',                    4, 'easy'),
('Gravity',    'Force keeping you on the ground.',            4, 'easy'),
-- SCIENCE - medium
('Neutron',    'Neutral particle in nucleus.',                4, 'medium'),
('Evolution',  'Darwin''s theory of species change.',         4, 'medium'),
('Mitosis',    'Cell division process.',                      4, 'medium'),
-- SCIENCE - hard
('Chromosome', 'Carries DNA in cell nucleus.',                4, 'hard'),
('Thermodynamics','Physics of heat and energy.',              4, 'hard'),
('Photosynthesis','How plants make food from sunlight.',      4, 'hard');

-- ─────────────────────────────────────────
--  GAME SESSIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS game_sessions (
  id            INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  user_id       INT UNSIGNED    NOT NULL,
  word_id       INT UNSIGNED    NOT NULL,
  score         INT UNSIGNED    DEFAULT 0,
  wrong_guesses INT UNSIGNED    DEFAULT 0,
  time_taken    INT UNSIGNED    DEFAULT 0,  -- seconds
  difficulty    ENUM('easy','medium','hard') NOT NULL,
  won           TINYINT(1)      DEFAULT 0,
  hint_used     TINYINT(1)      DEFAULT 0,
  played_at     DATETIME        DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
--  LEADERBOARD VIEW (top scores)
-- ─────────────────────────────────────────
CREATE OR REPLACE VIEW leaderboard AS
  SELECT
    u.id          AS user_id,
    u.username,
    u.avatar,
    u.total_score AS score,
    u.total_wins  AS wins,
    u.best_streak AS streak,
    u.total_games AS games,
    ROUND((u.total_wins / GREATEST(u.total_games, 1)) * 100, 1) AS win_rate
  FROM users u
  WHERE u.total_games > 0
  ORDER BY u.total_score DESC
  LIMIT 100;

-- ─────────────────────────────────────────
--  INDEXES for performance
-- ─────────────────────────────────────────
CREATE INDEX idx_words_cat_diff   ON words (category_id, difficulty);
CREATE INDEX idx_sessions_user    ON game_sessions (user_id);
CREATE INDEX idx_sessions_played  ON game_sessions (played_at DESC);
CREATE INDEX idx_users_score      ON users (total_score DESC);
