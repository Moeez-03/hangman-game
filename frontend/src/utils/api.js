// frontend/src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — logout if token expired
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hm_token');
      localStorage.removeItem('hm_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

// ── AUTH ──────────────────────────────────────────────
export const authAPI = {
  register: (data)   => api.post('/auth/register', data),
  login:    (data)   => api.post('/auth/login',    data),
  profile:  ()       => api.get('/auth/profile'),
  avatar:   (avatar) => api.patch('/auth/avatar', { avatar }),
};

// ── GAME ──────────────────────────────────────────────
export const gameAPI = {
  getWord:     (category, difficulty) =>
    api.get('/game/word', { params: { category, difficulty } }),

  submit: (data) => api.post('/game/submit', data),

  categories: () => api.get('/game/categories'),

  history: (page = 1) =>
    api.get('/game/history', { params: { page, limit: 20 } }),
};

// ── LEADERBOARD ───────────────────────────────────────
export const lbAPI = {
  global:    (limit = 10) =>
    api.get('/leaderboard', { params: { limit } }),

  byDiff:    (diff) =>
    api.get(`/leaderboard/difficulty/${diff}`),

  myRank:    () => api.get('/leaderboard/rank'),
};

export default api;
