// frontend/src/pages/GamePage.jsx
import { useEffect, useRef } from 'react';
import { useGame }      from '../hooks/useGame';
import { useAuth }      from '../context/AuthContext';
import Gallows          from '../components/Gallows';
import WordDisplay      from '../components/WordDisplay';
import Keyboard         from '../components/Keyboard';
import Powerups         from '../components/Powerups';
import { toast }        from '../components/Toast';

const DIFF_COLOR = { easy: '#c8f135', medium: '#ffd700', hard: '#ff4d6d' };

export default function GamePage({ category, difficulty, timerOn, onHome, onLeaderboard }) {
  const { user } = useAuth();
  const G = useGame();
  const startedRef = useRef(false);

  // Start first game
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      G.startGame(category, difficulty, timerOn);
    }
  }, []);

  // Toast on combo
  useEffect(() => {
    if (G.combo >= 3) toast(`${G.combo}x COMBO! 🔥`, 'success');
  }, [G.combo]);

  // Toast on wrong
  useEffect(() => {
    if (G.lastGuess && !G.lastGuess.correct && G.livesLeft <= 3 && G.livesLeft > 0) {
      toast(`⚠️ Only ${G.livesLeft} ${G.livesLeft === 1 ? 'life' : 'lives'} left!`, 'error');
    }
  }, [G.fails]);

  const diffColor = DIFF_COLOR[G.difficulty] || '#c8f135';
  const timerPct  = timerOn ? (G.timeLeft / G.cfg.timeLimit) * 100 : 100;

  const S = {
    wrapper: {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      width: '100%', maxWidth: 600, maxHeight: '100vh',
      overflowY: 'auto', position: 'relative', zIndex: 1,
    },
    hdr: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: '100%', padding: '11px 18px',
      borderBottom: '1px solid #26262f', background: '#111114',
      position: 'sticky', top: 0, zIndex: 10,
    },
    hdrLeft: { display: 'flex', alignItems: 'center', gap: 10 },
    logo: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: 24, letterSpacing: 5, color: '#c8f135',
    },
    badge: {
      fontSize: 9, letterSpacing: 2, color: '#55556a',
      border: '1px solid #26262f', padding: '3px 8px', borderRadius: 2,
    },
    hdrRight: { display: 'flex', gap: 10 },
    iconBtn: {
      background: 'none', border: 'none', cursor: 'pointer',
      color: '#55556a', fontSize: 16, padding: 4, transition: 'color .2s',
    },
    scoreStrip: {
      display: 'flex', width: '100%', borderBottom: '1px solid #26262f',
    },
    scoreCell: {
      flex: 1, padding: '9px 0', textAlign: 'center',
      borderRight: '1px solid #26262f',
    },
    scoreCellLast: { flex: 1, padding: '9px 0', textAlign: 'center' },
    scVal: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: 20, color: '#e8e8f0', display: 'block',
    },
    scLbl: { fontSize: 9, letterSpacing: 2, color: '#55556a' },
    timerWrap: { width: '100%', height: 3, background: '#26262f' },
    timerBar: {
      height: '100%', transition: 'width 1s linear, background .5s',
      width: timerPct + '%',
      background: timerPct < 30
        ? 'linear-gradient(90deg,#ff4d6d,#ff7b00)'
        : timerPct < 55
        ? 'linear-gradient(90deg,#ffd700,#ff9800)'
        : 'linear-gradient(90deg,#c8f135,#94b820)',
    },
    gallowsSec: {
      width: '100%', display: 'flex', justifyContent: 'center',
      alignItems: 'center', padding: '8px 20px 4px', position: 'relative',
    },
    gallowsWrap: { width: 160, height: 160, flexShrink: 0 },
    diffLabel: {
      position: 'absolute', right: 20, top: 8,
      fontFamily: "'Bebas Neue', sans-serif", fontSize: 11,
      letterSpacing: 3, padding: '4px 10px', borderRadius: 2,
      color: diffColor, border: `1px solid ${diffColor}40`,
    },
    progSec: { width: '100%', padding: '4px 18px' },
    progRow: { display: 'flex', alignItems: 'center', gap: 10 },
    progWrap: { flex: 1, height: 3, background: '#26262f', borderRadius: 2, overflow: 'hidden' },
    progBar: {
      height: '100%', background: '#c8f135',
      transition: 'width .4s ease', borderRadius: 2,
      width: G.progress + '%',
    },
    progLbl: { fontSize: 9, color: '#55556a', letterSpacing: 1, whiteSpace: 'nowrap' },
    wordSec: {
      width: '100%', padding: '8px 18px 6px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
    },
    wordMeta: { fontSize: 9, letterSpacing: 3, color: '#55556a', textTransform: 'uppercase' },
    infoRow: {
      display: 'flex', gap: 10, width: '100%',
      padding: '5px 18px', alignItems: 'flex-start', flexWrap: 'wrap',
    },
    wrongBox: { flex: 1, minWidth: 110 },
    wrongLbl: { fontSize: 9, letterSpacing: 2, color: '#55556a', marginBottom: 4 },
    wrongLetters: { display: 'flex', flexWrap: 'wrap', gap: 4, minHeight: 20 },
    wrongChip: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: 14, color: '#ff4d6d', letterSpacing: 1,
    },
    hintBox: { flex: 1, minWidth: 110 },
    hintBtn: (locked) => ({
      background: 'transparent',
      border: '1px solid #26262f', color: '#55556a',
      fontFamily: "'Space Mono', monospace", fontSize: 10,
      letterSpacing: 2, padding: '6px 10px', cursor: locked ? 'not-allowed' : 'pointer',
      borderRadius: 4, opacity: locked ? 0.4 : 1, transition: 'all .2s',
    }),
    hintContent: {
      marginTop: 5, background: 'rgba(77,166,255,.06)',
      borderLeft: '2px solid #4da6ff',
      padding: '8px 10px', fontSize: 11, color: '#55556a',
      lineHeight: 1.6, borderRadius: '0 4px 4px 0',
    },
  };

  // ── Result overlay ──────────────────────────────────
  if (G.status === 'won' || G.status === 'lost') {
    const win = G.status === 'won';
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: win
          ? 'linear-gradient(rgba(0,125,0,.92) 20%, rgba(0,0,0,.85) 80%)'
          : 'linear-gradient(rgba(125,0,0,.92) 20%, rgba(0,0,0,.85) 80%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 300, padding: 20,
        animation: 'fadeIn .3s ease',
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 10, letterSpacing: 7, color: '#e8e8f0', marginBottom: 10,
        }}>
          {win ? '🎉 Congratulations' : '💀 Game Over'}
        </div>

        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(60px,12vw,100px)', lineHeight: .9,
          color: win ? '#c8f135' : '#ff4d6d', letterSpacing: 4,
          marginBottom: 8,
        }}>
          {win ? 'YOU WIN' : 'YOU LOSE'}
        </div>

        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 22, letterSpacing: 4, color: '#c8f135', marginBottom: 4,
        }}>
          {G.word}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 24 }}>
          "{G.hint}"
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { val: G.score,            lbl: 'SCORE'  },
            { val: G.fails,            lbl: 'WRONG'  },
            { val: G.streak + '🔥',   lbl: 'STREAK' },
          ].map(s => (
            <div key={s.lbl} style={{
              background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)',
              padding: '12px 20px', textAlign: 'center', borderRadius: 4, minWidth: 90,
            }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: '#e8e8f0' }}>{s.val}</div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,.4)' }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {!user && (
          <div style={{
            fontSize: 11, color: 'rgba(255,255,255,.4)',
            marginBottom: 16, letterSpacing: 1,
          }}>
            Sign in to save your score to the leaderboard!
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => G.startGame(category, difficulty, timerOn)}
            style={{
              background: '#c8f135', color: '#09090b', border: 'none',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 20,
              letterSpacing: 4, padding: '13px 40px', cursor: 'pointer',
              clipPath: 'polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)',
            }}>
            PLAY AGAIN
          </button>
          <button
            onClick={onHome}
            style={{
              background: 'transparent', color: 'rgba(255,255,255,.5)',
              border: '1px solid rgba(255,255,255,.2)',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 14,
              letterSpacing: 3, padding: '10px 24px', cursor: 'pointer',
              borderRadius: 4,
            }}>
            HOME
          </button>
          <button
            onClick={onLeaderboard}
            style={{
              background: 'transparent', color: 'rgba(255,255,255,.5)',
              border: '1px solid rgba(255,255,255,.2)',
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 14,
              letterSpacing: 3, padding: '10px 24px', cursor: 'pointer',
              borderRadius: 4,
            }}>
            🏆 LEADERBOARD
          </button>
        </div>
      </div>
    );
  }

  // ── Active game ─────────────────────────────────────
  return (
    <div style={S.wrapper}>
      {/* Header */}
      <div style={S.hdr}>
        <div style={S.hdrLeft}>
          <div style={S.logo}>HMN</div>
          <div style={S.badge}>{category.toUpperCase()}</div>
        </div>
        <div style={S.hdrRight}>
          <button style={S.iconBtn} onClick={onHome} title="Home">⌂</button>
          <button style={S.iconBtn} onClick={onLeaderboard} title="Leaderboard">🏆</button>
        </div>
      </div>

      {/* Score strip */}
      <div style={S.scoreStrip}>
        {[
          { val: G.score,             lbl: 'SCORE'  },
          { val: G.streak + '🔥',    lbl: 'STREAK' },
          { val: G.livesLeft,         lbl: 'LIVES'  },
          { val: timerOn ? G.timeLeft : '∞', lbl: 'TIME' },
        ].map((c, i, arr) => (
          <div key={c.lbl} style={i < arr.length - 1 ? S.scoreCell : S.scoreCellLast}>
            <span style={S.scVal}>{c.val}</span>
            <span style={S.scLbl}>{c.lbl}</span>
          </div>
        ))}
      </div>

      {/* Timer bar */}
      <div style={S.timerWrap}><div style={S.timerBar} /></div>

      {/* Gallows */}
      <div style={S.gallowsSec}>
        <div style={S.gallowsWrap}>
          {G.loading ? (
            <div style={{ color: '#55556a', textAlign: 'center', paddingTop: 60, fontSize: 11, letterSpacing: 2 }}>
              LOADING...
            </div>
          ) : (
            <Gallows step={G.gallowsStep} />
          )}
        </div>
        <div style={S.diffLabel}>{G.difficulty.toUpperCase()}</div>
      </div>

      {/* Progress bar */}
      <div style={S.progSec}>
        <div style={S.progRow}>
          <div style={S.progWrap}><div style={S.progBar} /></div>
          <div style={S.progLbl}>{G.foundCount} / {G.totalCount} LETTERS</div>
        </div>
      </div>

      {/* Word */}
      <div style={S.wordSec}>
        <div style={S.wordMeta}>
          {G.word.length} CHARS · {category.toUpperCase()} · {G.difficulty.toUpperCase()}
        </div>
        <WordDisplay
          word={G.word}
          guessed={G.guessed}
          preRevealed={G.preRevealed}
          lastGuess={G.lastGuess}
        />
      </div>

      {/* Wrong letters + Hint */}
      <div style={S.infoRow}>
        <div style={S.wrongBox}>
          <div style={S.wrongLbl}>WRONG GUESSES</div>
          <div style={S.wrongLetters}>
            {[...G.guessed]
              .filter(l => !G.word.includes(l))
              .map(l => (
                <span key={l} style={S.wrongChip}>{l} </span>
              ))}
          </div>
        </div>

        <div style={S.hintBox}>
          <button
            style={S.hintBtn(G.fails < 3)}
            onClick={G.toggleHint}
            disabled={G.fails < 3}
          >
            💡 {G.hintVisible ? 'HIDE' : 'SHOW'} HINT
            {!G.hintUsed && (
              <span style={{ fontSize: 9, color: '#ff4d6d', marginLeft: 4 }}>
                (-{G.cfg.hintPen}pts)
              </span>
            )}
          </button>
          {G.hintVisible && (
            <div style={S.hintContent}>{G.hint}</div>
          )}
        </div>
      </div>

      {/* Powerups */}
      <Powerups
        powers={G.powers}
        disabled={G.status !== 'playing'}
        onReveal={G.powerReveal}
        onEliminate={G.powerEliminate}
        onExtra={G.powerExtraLife}
      />

      {/* Keyboard */}
      <Keyboard
        guessed={G.guessed}
        word={G.word}
        onGuess={G.guess}
        disabled={G.status !== 'playing'}
      />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes letterPop {
          0%   { transform: scale(0) translateY(-8px); opacity: 0; }
          100% { transform: scale(1) translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
