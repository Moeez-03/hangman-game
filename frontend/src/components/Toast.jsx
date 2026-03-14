// frontend/src/components/Toast.jsx
import { useState, useEffect, useCallback } from 'react';

let addToastFn = null;

export function toast(msg, type = 'info') {
  if (addToastFn) addToastFn(msg, type);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((msg, type) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  const colors = { info: '#4da6ff', success: '#c8f135', error: '#ff4d6d' };

  return (
    <div style={{
      position: 'fixed', top: 20, right: 20,
      display: 'flex', flexDirection: 'column', gap: 8,
      zIndex: 9999, pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: '#18181d',
          border: '1px solid #34343f',
          borderLeft: `3px solid ${colors[t.type] || colors.info}`,
          padding: '10px 16px',
          fontSize: 11,
          letterSpacing: 1,
          color: '#e8e8f0',
          borderRadius: 4,
          maxWidth: 260,
          animation: 'toastIn 0.3s ease',
        }}>
          {t.msg}
        </div>
      ))}
      <style>{`
        @keyframes toastIn {
          from { opacity:0; transform:translateX(20px); }
          to   { opacity:1; transform:translateX(0); }
        }
      `}</style>
    </div>
  );
}
