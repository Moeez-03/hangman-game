// frontend/src/components/AuthModal.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from './Toast';

export default function AuthModal({ onClose }) {
  const { login, register } = useAuth();
  const [mode,    setMode]   = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [form,    setForm]   = useState({ username:'', email:'', password:'' });
  const [error,   setError]  = useState('');

  const S = {
    overlay: {
      position: 'fixed', inset: 0,
      background: 'rgba(9,9,11,.92)',
      backdropFilter: 'blur(8px)',
      zIndex: 500,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    box: {
      background: '#18181d',
      border: '1px solid #34343f',
      borderRadius: 6,
      padding: '32px 36px',
      width: '100%', maxWidth: 380,
      position: 'relative',
    },
    title: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: 36, letterSpacing: 4,
      color: '#c8f135', marginBottom: 6,
    },
    sub: { fontSize: 11, color: '#55556a', letterSpacing: 2, marginBottom: 24 },
    label: { fontSize: 10, letterSpacing: 2, color: '#55556a', display: 'block', marginBottom: 5 },
    input: {
      width: '100%', background: '#111114',
      border: '1px solid #34343f', color: '#e8e8f0',
      fontFamily: "'Space Mono', monospace",
      fontSize: 13, padding: '10px 12px',
      borderRadius: 4, marginBottom: 14,
      outline: 'none', boxSizing: 'border-box',
    },
    btn: {
      width: '100%', background: '#c8f135',
      color: '#09090b', border: 'none',
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: 18, letterSpacing: 4,
      padding: '12px', cursor: 'pointer',
      borderRadius: 4, marginTop: 4,
    },
    switch: {
      textAlign: 'center', marginTop: 16,
      fontSize: 11, color: '#55556a',
    },
    switchLink: {
      color: '#c8f135', cursor: 'pointer',
      textDecoration: 'underline', marginLeft: 4,
    },
    error: {
      background: 'rgba(255,77,109,.1)',
      border: '1px solid rgba(255,77,109,.3)',
      color: '#ff4d6d', fontSize: 11,
      padding: '8px 12px', borderRadius: 4,
      marginBottom: 14,
    },
    close: {
      position: 'absolute', top: 14, right: 14,
      background: 'none', border: 'none',
      color: '#55556a', fontSize: 18, cursor: 'pointer',
    },
  };

  function change(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await login(form.username, form.password);
        toast('Welcome back! 🎮', 'success');
      } else {
        await register(form.username, form.email, form.password);
        toast('Account created! Let\'s play 🎉', 'success');
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.box}>
        <button style={S.close} onClick={onClose}>✕</button>

        <div style={S.title}>{mode === 'login' ? 'SIGN IN' : 'SIGN UP'}</div>
        <div style={S.sub}>
          {mode === 'login' ? 'Welcome back, player' : 'Create your account'}
        </div>

        {error && <div style={S.error}>{error}</div>}

        <form onSubmit={submit}>
          <label style={S.label}>USERNAME {mode === 'login' ? '/ EMAIL' : ''}</label>
          <input
            style={S.input} name="username" type="text"
            value={form.username} onChange={change}
            placeholder={mode === 'login' ? 'username or email' : 'choose a username'}
            autoComplete="username" required
          />

          {mode === 'register' && (
            <>
              <label style={S.label}>EMAIL</label>
              <input
                style={S.input} name="email" type="email"
                value={form.email} onChange={change}
                placeholder="your@email.com"
                autoComplete="email" required
              />
            </>
          )}

          <label style={S.label}>PASSWORD</label>
          <input
            style={S.input} name="password" type="password"
            value={form.password} onChange={change}
            placeholder={mode === 'register' ? 'min 6 characters' : '••••••••'}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
          />

          <button style={S.btn} type="submit" disabled={loading}>
            {loading ? 'LOADING...' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div style={S.switch}>
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <span style={S.switchLink}
                onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? ' Sign up' : ' Sign in'}
          </span>
        </div>
      </div>
    </div>
  );
}
