// services/api.js — Axios instance + tất cả API calls
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

// Tự động gắn JWT token từ localStorage vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Nếu 401 → tự logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(err);
  }
);

// ── Auth ────────────────────────────────────────────────────
export const authAPI = {
  register: (data)  => api.post('/auth/register', data).then(r => r.data),
  login:    (data)  => api.post('/auth/login', data).then(r => r.data),
  me:       ()      => api.get('/auth/me').then(r => r.data),
};

// ── Cafes ───────────────────────────────────────────────────
export const cafeAPI = {
  list:   (params = {}) => api.get('/cafes', { params }).then(r => r.data.data),
  getById:(id)          => api.get(`/cafes/${id}`).then(r => r.data.data),
};
// ── Favorites ─────────────────────────────────────────────────
export const favoriteAPI = {
  list:   ()            => api.get('/favorites').then(r => r.data.data),
  add:    (cafeId)      => api.post(`/favorites/${cafeId}`).then(r => r.data),
  remove: (cafeId)      => api.delete(`/favorites/${cafeId}`).then(r => r.data),
};
// ── Reviews ─────────────────────────────────────────────────
export const reviewAPI = {
  list:   (cafeId)                 => api.get(`/cafes/${cafeId}/reviews`).then(r => r.data.data),
  create: (cafeId, body)           => api.post(`/cafes/${cafeId}/reviews`, body).then(r => r.data),
  update: (cafeId, reviewId, body) => api.patch(`/cafes/${cafeId}/reviews/${reviewId}`, body).then(r => r.data),
  remove: (cafeId, reviewId)       => api.delete(`/cafes/${cafeId}/reviews/${reviewId}`).then(r => r.data),
};
