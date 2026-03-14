# 🎮 HANGMAN PRO — Full Stack App

React + Node.js + Express + MySQL

---

## 📁 Project Structure

```
hangman/
├── database/
│   └── schema.sql          ← MySQL tables + seed data
├── backend/                ← Node.js + Express API
│   ├── server.js
│   ├── .env
│   ├── config/db.js
│   ├── middleware/auth.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── gameController.js
│   │   └── leaderboardController.js
│   └── routes/
│       ├── auth.js
│       ├── game.js
│       └── leaderboard.js
└── frontend/               ← React app
    └── src/
        ├── App.jsx
        ├── index.js
        ├── context/AuthContext.jsx
        ├── hooks/useGame.js
        ├── utils/api.js
        ├── components/
        │   ├── Gallows.jsx
        │   ├── Keyboard.jsx
        │   ├── WordDisplay.jsx
        │   ├── Powerups.jsx
        │   ├── AuthModal.jsx
        │   └── Toast.jsx
        └── pages/
            ├── HomePage.jsx
            ├── GamePage.jsx
            └── LeaderboardPage.jsx
```

---

## ⚙️ Setup — Step by Step

### 1. MySQL Database

```bash
# Open MySQL
mysql -u root -p

# Run the schema file
source /path/to/hangman/database/schema.sql;

# OR from terminal
mysql -u root -p < database/schema.sql
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Edit .env file with your MySQL password
nano .env
# Set: DB_PASSWORD=your_mysql_password
# Set: JWT_SECRET=any_long_random_string

# Start development server
npm run dev

# Server runs at: http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start React app
npm start

# App runs at: http://localhost:3000
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint             | Access  | Description        |
|--------|----------------------|---------|--------------------|
| POST   | /api/auth/register   | Public  | Create account     |
| POST   | /api/auth/login      | Public  | Login              |
| GET    | /api/auth/profile    | 🔒 Auth | Get user profile   |
| PATCH  | /api/auth/avatar     | 🔒 Auth | Update avatar      |

### Game
| Method | Endpoint             | Access  | Description           |
|--------|----------------------|---------|-----------------------|
| GET    | /api/game/word       | Public  | Get random word       |
| GET    | /api/game/categories | Public  | List categories       |
| POST   | /api/game/submit     | 🔒 Auth | Save game result      |
| GET    | /api/game/history    | 🔒 Auth | User game history     |

### Leaderboard
| Method | Endpoint                        | Access  | Description           |
|--------|---------------------------------|---------|-----------------------|
| GET    | /api/leaderboard                | Public  | Global top 10         |
| GET    | /api/leaderboard/difficulty/:d  | Public  | By difficulty         |
| GET    | /api/leaderboard/rank           | 🔒 Auth | My rank               |

---

## 🗄️ Database Tables

| Table          | Description                      |
|----------------|----------------------------------|
| users          | Accounts, stats, avatars         |
| categories     | tech, general, games, science    |
| words          | Word bank with hints + difficulty|
| game_sessions  | Every game played with result    |
| leaderboard    | VIEW — auto-calculated rankings  |

---

## 🎮 Features

- 4 Categories × 3 Difficulties
- Countdown timer (toggle on/off)
- Combo system (+bonus on streaks)
- 3 Powerups: Reveal / Eliminate / +Life
- Pre-revealed letters (easy=2, medium=1, hard=0)
- Hint system (unlocks after 3 wrong guesses)
- User accounts with JWT auth
- Real leaderboard saved in MySQL
- Game history per user
- Avatar selection
- Wrong letter tracking
- Progress bar
- Sound effects (Web Audio API)

---

## 🚀 Production Build

```bash
# Build frontend
cd frontend && npm run build

# Serve build folder with Express (add to server.js):
# app.use(express.static(path.join(__dirname, '../frontend/build')));
# app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/build/index.html')));
```
