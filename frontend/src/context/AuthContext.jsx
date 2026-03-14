// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
    const saved = localStorage.getItem('hm_user');
    const token = localStorage.getItem('hm_token');
    if (saved && token) {
      setUser(JSON.parse(saved));
      // Verify token is still valid
      authAPI.profile()
        .then(res => {
          setUser(res.data.user);
          localStorage.setItem('hm_user', JSON.stringify(res.data.user));
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function register(username, email, password) {
    const res = await authAPI.register({ username, email, password });
    localStorage.setItem('hm_token', res.data.token);
    localStorage.setItem('hm_user',  JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  }

  async function login(username, password) {
    const res = await authAPI.login({ username, password });
    localStorage.setItem('hm_token', res.data.token);
    localStorage.setItem('hm_user',  JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  }

  function logout() {
    localStorage.removeItem('hm_token');
    localStorage.removeItem('hm_user');
    setUser(null);
  }

  function updateUserStats(stats) {
    const updated = { ...user, ...stats };
    setUser(updated);
    localStorage.setItem('hm_user', JSON.stringify(updated));
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateUserStats }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
