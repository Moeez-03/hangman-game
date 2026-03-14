// frontend/src/components/Keyboard.jsx
import { useEffect } from 'react';

const ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M'],
];

export default function Keyboard({ guessed, word, onGuess, disabled }) {
  // Physical keyboard support
  useEffect(() => {
    function handleKey(e) {
      if (disabled) return;
      const l = e.key.toUpperCase();
      if (/^[A-Z]$/.test(l) && !guessed.has(l)) onGuess(l);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [disabled, guessed, onGuess]);

  function getKeyState(letter) {
    if (!guessed.has(letter)) return 'idle';
    return word.includes(letter) ? 'correct' : 'wrong';
  }

  const styles = {
    wrapper: {
      width: '100%',
      padding: '6px 10px 14px',
    },
    row: {
      display: 'flex',
      justifyContent: 'center',
      gap: 5,
      marginBottom: 5,
    },
    key: (state) => ({
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: 17,
      width: 34,
      height: 38,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: state === 'idle' ? 'pointer' : 'default',
      border: '1px solid',
      borderRadius: 4,
      userSelect: 'none',
      position: 'relative',
      transition: 'all 0.12s',
      background:
        state === 'correct' ? 'rgba(200,241,53,.12)' :
        state === 'wrong'   ? 'rgba(255,77,109,.07)' :
        '#18181d',
      borderColor:
        state === 'correct' ? '#c8f135' :
        state === 'wrong'   ? 'rgba(255,77,109,.3)' :
        '#34343f',
      color:
        state === 'correct' ? '#c8f135' :
        state === 'wrong'   ? 'rgba(255,77,109,.5)' :
        '#e8e8f0',
      opacity: state === 'wrong' ? 0.6 : 1,
      transform: 'translateY(0)',
      boxShadow: state === 'idle'
        ? '0 3px 0 #26262f'
        : state === 'correct'
        ? '0 2px 0 #94b820'
        : '0 2px 0 rgba(255,77,109,.2)',
    }),
  };

  return (
    <div style={styles.wrapper}>
      {ROWS.map((row, ri) => (
        <div key={ri} style={styles.row}>
          {row.map(letter => {
            const state = getKeyState(letter);
            return (
              <div
                key={letter}
                style={styles.key(state)}
                onClick={() => {
                  if (disabled || state !== 'idle') return;
                  onGuess(letter);
                }}
                onMouseEnter={e => {
                  if (state === 'idle' && !disabled)
                    e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {letter}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
