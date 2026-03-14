// frontend/src/App.jsx
import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import HomePage         from './pages/HomePage';
import GamePage         from './pages/GamePage';
import LeaderboardPage  from './pages/LeaderboardPage';
import ToastContainer   from './components/Toast';

// Pages
const PAGE = { HOME: 'home', GAME: 'game', LEADERBOARD: 'lb' };

export default function App() {
  const [page,       setPage]      = useState(PAGE.HOME);
  const [gameConfig, setGameConfig] = useState({ category:'all', difficulty:'easy', timerOn:true });

  function startGame(config) {
    setGameConfig(config);
    setPage(PAGE.GAME);
  }

  return (
    <AuthProvider>
      {/* Global font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #09090b; }
        body {
          font-family: 'Space Mono', monospace;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-x: hidden;
        }
        #root {
          width: 100%;
          display: flex;
          justify-content: center;
        }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #26262f; }
      `}</style>

      <ToastContainer />

      {page === PAGE.HOME && (
        <HomePage
          onStart={startGame}
          onLeaderboard={() => setPage(PAGE.LEADERBOARD)}
        />
      )}

      {page === PAGE.GAME && (
        <GamePage
          category={gameConfig.category}
          difficulty={gameConfig.difficulty}
          timerOn={gameConfig.timerOn}
          onHome={() => setPage(PAGE.HOME)}
          onLeaderboard={() => setPage(PAGE.LEADERBOARD)}
        />
      )}

      {page === PAGE.LEADERBOARD && (
        <LeaderboardPage
          onBack={() => setPage(PAGE.HOME)}
        />
      )}
    </AuthProvider>
  );
}
