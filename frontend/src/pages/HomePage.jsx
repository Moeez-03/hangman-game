// frontend/src/pages/HomePage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthModal   from '../components/AuthModal';

const CATS  = ['all','tech','general','games','science'];
const DIFFS = ['easy','medium','hard'];
const CAT_ICON = { all:'🎯', tech:'💻', general:'🌍', games:'🎮', science:'🔬' };
const DIFF_COLOR = { easy:'#c8f135', medium:'#ffd700', hard:'#ff4d6d' };
const AVATARS = ['🎮','👾','🤖','💀','🔥','⚡','🎯','🏆','😎','🧠'];

export default function HomePage({ onStart, onLeaderboard }) {
  const { user, logout } = useAuth();

  const [cat,       setCat]      = useState('all');
  const [diff,      setDiff]     = useState('easy');
  const [timerOn,   setTimerOn]  = useState(true);
  const [showAuth,  setShowAuth] = useState(false);
  const [showAvatar,setShowAvatar]= useState(false);

  const S = {
    page: {
      minHeight: '100vh',
      background: '#09090b',
      color: '#e8e8f0',
      fontFamily: "'Space Mono', monospace",
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden',
    },
    grid: {
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
      backgroundImage:
        'linear-gradient(rgba(200,241,53,.025) 1px,transparent 1px),' +
        'linear-gradient(90deg,rgba(200,241,53,.025) 1px,transparent 1px)',
      backgroundSize: '48px 48px',
    },
    badge: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: 10, letterSpacing: 7, color: '#c8f135', marginBottom: 10, zIndex:1,
    },
    title: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: 'clamp(72px,14vw,130px)',
      lineHeight: .88, letterSpacing: 6,
      background: 'linear-gradient(135deg,#e8e8f0 30%,#c8f135 100%)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      marginBottom: 6, zIndex:1,
    },
    sub: { color: '#55556a', fontSize: 11, letterSpacing: 3, marginBottom: 28, zIndex:1 },
    // Stats row (when logged in)
    statsRow: {
      display: 'flex', gap: 28, marginBottom: 24, zIndex:1,
    },
    statBox: { textAlign: 'center' },
    statVal: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: 34, color: '#c8f135', display: 'block',
    },
    statLbl: { fontSize: 10, letterSpacing: 2, color: '#55556a' },
    // Category
    catRow: {
      display: 'flex', gap: 8, flexWrap: 'wrap',
      justifyContent: 'center', marginBottom: 16, zIndex:1,
    },
    catPill: (active) => ({
      background: active ? 'rgba(200,241,53,.1)' : '#18181d',
      border: `1px solid ${active ? '#c8f135' : '#34343f'}`,
      color: active ? '#c8f135' : '#55556a',
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: 13, letterSpacing: 2,
      padding: '8px 16px', cursor: 'pointer',
      borderRadius: 4, transition: 'all .2s',
    }),
    // Difficulty
    diffRow: { display: 'flex', gap: 10, marginBottom: 20, zIndex:1 },
    diffBtn: (active, d) => ({
      background: active ? `${DIFF_COLOR[d]}18` : '#18181d',
      border: `1px solid ${active ? DIFF_COLOR[d] : '#34343f'}`,
      color: active ? DIFF_COLOR[d] : '#55556a',
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: 15, letterSpacing: 3,
      padding: '10px 22px', cursor: 'pointer',
      borderRadius: 4, transition: 'all .2s',
    }),
    // Timer toggle
    timerRow: {
      display: 'flex', alignItems: 'center', gap: 12,
      marginBottom: 28, zIndex:1,
    },
    timerLbl: { fontSize: 11, letterSpacing: 2, color: '#55556a' },
    toggleWrap: { position: 'relative', width: 44, height: 24, cursor: 'pointer' },
    // Buttons
    startBtn: {
      background: '#c8f135', color: '#09090b', border: 'none',
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: 22, letterSpacing: 4,
      padding: '14px 50px', cursor: 'pointer',
      clipPath: 'polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)',
      transition: 'transform .15s, background .15s, box-shadow .15s',
      zIndex:1,
    },
    secRow: { display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center', zIndex:1 },
    secBtn: {
      background: 'transparent', color: '#55556a',
      border: '1px solid #34343f',
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: 13, letterSpacing: 2,
      padding: '10px 22px', cursor: 'pointer',
      borderRadius: 4, transition: 'all .2s',
    },
    // User bar top-right
    userBar: {
      position: 'fixed', top: 16, right: 16,
      display: 'flex', alignItems: 'center', gap: 8, zIndex: 50,
    },
    userChip: {
      background: '#18181d', border: '1px solid #34343f',
      padding: '6px 12px', borderRadius: 4,
      fontSize: 11, letterSpacing: 1,
      display: 'flex', alignItems: 'center', gap: 6,
    },
    logoutBtn: {
      background: 'none', border: 'none',
      color: '#55556a', cursor: 'pointer',
      fontSize: 11, letterSpacing: 1,
      padding: '6px 10px',
    },
  };

  return (
    <div style={S.page}>
      <div style={S.grid} />

      {/* User bar */}
      <div style={S.userBar}>
        {user ? (
          <>
            <div style={S.userChip} onClick={() => setShowAvatar(true)}
                 title="Change avatar" role="button">
              <span>{user.avatar || '🎮'}</span>
              <span>{user.username}</span>
            </div>
            <button style={S.logoutBtn} onClick={logout}>SIGN OUT</button>
          </>
        ) : (
          <button style={{ ...S.secBtn, margin: 0 }} onClick={() => setShowAuth(true)}>
            SIGN IN
          </button>
        )}
      </div>

      <div style={S.badge}>Word Guessing Game</div>
      <div style={S.title}>HANG<br/>MAN</div>
      <div style={S.sub}>Pro Edition · v3.0</div>

      {/* Stats (logged in) */}
      {user && (
        <div style={S.statsRow}>
          {[
            { val: user.total_wins  || 0, lbl: 'WINS'        },
            { val: user.best_streak || 0, lbl: 'BEST STREAK' },
            { val: user.total_score || 0, lbl: 'BEST SCORE'  },
          ].map(s => (
            <div key={s.lbl} style={S.statBox}>
              <span style={S.statVal}>{s.val}</span>
              <span style={S.statLbl}>{s.lbl}</span>
            </div>
          ))}
        </div>
      )}

      {/* Category */}
      <div style={S.catRow}>
        {CATS.map(c => (
          <div key={c} style={S.catPill(cat === c)} onClick={() => setCat(c)}>
            {CAT_ICON[c]} {c.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Difficulty */}
      <div style={S.diffRow}>
        {DIFFS.map(d => (
          <button key={d} style={S.diffBtn(diff === d, d)} onClick={() => setDiff(d)}>
            {d.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Timer toggle */}
      <div style={S.timerRow}>
        <span style={S.timerLbl}>COUNTDOWN TIMER</span>
        <div style={S.toggleWrap} onClick={() => setTimerOn(t => !t)}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 12,
            background: timerOn ? '#c8f135' : '#34343f', transition: 'background .2s',
          }}/>
          <div style={{
            position: 'absolute', top: 3, left: 3, width: 18, height: 18,
            background: '#fff', borderRadius: '50%',
            transform: timerOn ? 'translateX(20px)' : 'translateX(0)',
            transition: 'transform .2s',
          }}/>
        </div>
        <span style={{ ...S.timerLbl, color: timerOn ? '#c8f135' : '#55556a' }}>
          {timerOn ? 'ON' : 'OFF'}
        </span>
      </div>

      {/* Start */}
      <button
        style={S.startBtn}
        onMouseEnter={e => { e.target.style.transform='scale(1.04)'; e.target.style.background='#d9ff5f'; }}
        onMouseLeave={e => { e.target.style.transform='scale(1)';    e.target.style.background='#c8f135'; }}
        onClick={() => onStart({ category: cat, difficulty: diff, timerOn })}
      >
        START GAME
      </button>

      <div style={S.secRow}>
        <button style={S.secBtn}
                onMouseEnter={e => { e.target.style.borderColor='#c8f135'; e.target.style.color='#c8f135'; }}
                onMouseLeave={e => { e.target.style.borderColor='#34343f'; e.target.style.color='#55556a'; }}
                onClick={onLeaderboard}>
          🏆 LEADERBOARD
        </button>
        {!user && (
          <button style={S.secBtn}
                  onMouseEnter={e => { e.target.style.borderColor='#c8f135'; e.target.style.color='#c8f135'; }}
                  onMouseLeave={e => { e.target.style.borderColor='#34343f'; e.target.style.color='#55556a'; }}
                  onClick={() => setShowAuth(true)}>
            CREATE ACCOUNT
          </button>
        )}
      </div>

      {/* Auth modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Avatar picker */}
      {showAvatar && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(9,9,11,.9)', backdropFilter: 'blur(8px)',
          zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={e => e.target === e.currentTarget && setShowAvatar(false)}>
          <div style={{
            background: '#18181d', border: '1px solid #34343f',
            borderRadius: 6, padding: '28px 32px', textAlign: 'center',
          }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 24, letterSpacing: 4, color: '#c8f135', marginBottom: 16,
            }}>CHOOSE AVATAR</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 280 }}>
              {AVATARS.map(a => (
                <div key={a} style={{
                  fontSize: 28, cursor: 'pointer', padding: 8, borderRadius: 4,
                  border: `1px solid ${user?.avatar === a ? '#c8f135' : '#34343f'}`,
                  background: user?.avatar === a ? 'rgba(200,241,53,.1)' : 'transparent',
                  transition: 'all .15s',
                }} onClick={async () => {
                  const { authAPI } = await import('../utils/api');
                  await authAPI.avatar(a);
                  // Update local user
                  const saved = JSON.parse(localStorage.getItem('hm_user') || '{}');
                  saved.avatar = a;
                  localStorage.setItem('hm_user', JSON.stringify(saved));
                  window.location.reload(); // simple refresh to sync
                }}>{a}</div>
              ))}
            </div>
            <button style={{
              marginTop: 20, background: 'transparent', border: '1px solid #34343f',
              color: '#55556a', fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 14, letterSpacing: 3, padding: '8px 20px', cursor: 'pointer', borderRadius: 4,
            }} onClick={() => setShowAvatar(false)}>CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );
}
