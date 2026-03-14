// frontend/src/components/WordDisplay.jsx
import { useEffect, useRef } from 'react';

export default function WordDisplay({ word, guessed, preRevealed, lastGuess }) {
  const prevGuessed = useRef(new Set());

  useEffect(() => {
    prevGuessed.current = new Set(guessed);
  });

  if (!word) return null;

  let pos = 1;

  return (
    <div style={{
      display: 'flex', gap: 6, flexWrap: 'wrap',
      justifyContent: 'center', minHeight: 52,
    }}>
      {word.split('').map((ch, i) => {
        if (ch === ' ') {
          return <div key={i} style={{ width: 12 }} />;
        }

        const revealed  = guessed.has(ch);
        const isPre     = preRevealed.has(ch) && revealed;
        const isNew     = lastGuess?.correct && lastGuess.letter === ch;
        const thisPos   = pos++;

        return (
          <div key={i} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3,
          }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 28,
              lineHeight: 1,
              minWidth: 22,
              textAlign: 'center',
              minHeight: 28,
              color: isPre ? '#4da6ff' : '#c8f135',
              animation: isNew ? 'letterPop 0.4s cubic-bezier(.34,1.56,.64,1)' : 'none',
            }}>
              {revealed ? ch : ''}
            </div>

            {!revealed && (
              <div style={{
                fontSize: 8, color: '#3a3a4a',
                textAlign: 'center', lineHeight: 1,
              }}>
                {thisPos}
              </div>
            )}

            <div style={{
              width: 22, height: 2,
              background: revealed
                ? (isPre ? '#4da6ff' : '#c8f135')
                : '#34343f',
              transition: 'background 0.3s',
            }} />
          </div>
        );
      })}
    </div>
  );
}
