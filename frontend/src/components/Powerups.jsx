// frontend/src/components/Powerups.jsx
import { toast } from './Toast';

export default function Powerups({ powers, disabled, onReveal, onEliminate, onExtra }) {
  const btns = [
    {
      icon: '🔍', label: 'REVEAL', count: powers.reveal,
      action: () => { onReveal(); toast('Letter revealed!', 'success'); },
      title: 'Reveal a random missing letter',
    },
    {
      icon: '❌', label: 'ELIMINATE', count: powers.elim,
      action: () => { onEliminate(); toast('5 wrong letters eliminated!', 'success'); },
      title: 'Remove 5 wrong letters from keyboard',
    },
    {
      icon: '❤️', label: '+LIFE', count: powers.extra,
      action: () => { onExtra(); toast('+2 lives restored!', 'success'); },
      title: 'Restore 2 lives',
    },
  ];

  return (
    <div style={{
      display: 'flex', gap: 6, width: '100%',
      padding: '4px 18px', flexWrap: 'wrap',
    }}>
      {btns.map(b => (
        <button
          key={b.label}
          title={b.title}
          disabled={disabled || b.count <= 0}
          onClick={b.action}
          style={{
            background: '#18181d',
            border: '1px solid #34343f',
            color: '#e8e8f0',
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            letterSpacing: 1,
            padding: '6px 10px',
            cursor: disabled || b.count <= 0 ? 'not-allowed' : 'pointer',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            opacity: disabled || b.count <= 0 ? 0.3 : 1,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            if (!disabled && b.count > 0)
              e.currentTarget.style.borderColor = '#c8f135';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#34343f';
          }}
        >
          <span style={{ fontSize: 13 }}>{b.icon}</span>
          {b.label}
          <span style={{
            background: '#34343f', borderRadius: 10,
            padding: '1px 5px', fontSize: 9, color: '#55556a',
          }}>
            {b.count}
          </span>
        </button>
      ))}
    </div>
  );
}
