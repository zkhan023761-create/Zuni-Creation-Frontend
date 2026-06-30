import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─────────────────────────────────────────────────────────────────────────────
// Two separate axios instances so admin and user tokens are NEVER mixed up.
// adminApi → always reads localStorage.getItem('token')    (admin JWT)
// api      → always reads localStorage.getItem('userToken') (customer JWT)
// ─────────────────────────────────────────────────────────────────────────────

// ── Admin API instance ────────────────────────────────────────────────────────
const adminApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

adminApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin refresh on 401
let adminRefreshing = false;
let adminQueue = [];
function processAdminQueue(err, token = null) {
  adminQueue.forEach(p => err ? p.reject(err) : p.resolve(token));
  adminQueue = [];
}

adminApi.interceptors.response.use(
  (r) => r,
  async (error) => {
    const orig = error.config;
    if (
      error.response?.status === 401 &&
      !orig._retry &&
      !orig.url?.includes('/auth/refresh') &&
      !orig.url?.includes('/auth/login')
    ) {
      if (adminRefreshing) {
        return new Promise((resolve, reject) => adminQueue.push({ resolve, reject }))
          .then(t => { orig.headers.Authorization = `Bearer ${t}`; return adminApi(orig); });
      }
      orig._retry = true;
      adminRefreshing = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No admin refresh token');
        const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const newToken = res.data.token;
        localStorage.setItem('token', newToken);
        adminApi.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processAdminQueue(null, newToken);
        orig.headers.Authorization = `Bearer ${newToken}`;
        return adminApi(orig);
      } catch (e) {
        processAdminQueue(e, null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('admin');
          window.location.href = '/login?tab=admin';
        }
        return Promise.reject(e);
      } finally {
        adminRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ── User/Public API instance ──────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('userToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// User refresh on 401
let userRefreshing = false;
let userQueue = [];
function processUserQueue(err, token = null) {
  userQueue.forEach(p => err ? p.reject(err) : p.resolve(token));
  userQueue = [];
}

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const orig = error.config;
    if (
      error.response?.status === 401 &&
      !orig._retry &&
      !orig.url?.includes('/users/refresh') &&
      !orig.url?.includes('/users/login')
    ) {
      if (userRefreshing) {
        return new Promise((resolve, reject) => userQueue.push({ resolve, reject }))
          .then(t => { orig.headers.Authorization = `Bearer ${t}`; return api(orig); });
      }
      orig._retry = true;
      userRefreshing = true;
      try {
        const refreshToken = localStorage.getItem('userRefreshToken');
        if (!refreshToken) throw new Error('No user refresh token');
        const res = await axios.post(`${API_URL}/users/refresh`, { refreshToken });
        const newToken = res.data.accessToken;
        localStorage.setItem('userToken', newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processUserQueue(null, newToken);
        orig.headers.Authorization = `Bearer ${newToken}`;
        return api(orig);
      } catch (e) {
        processUserQueue(e, null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('userToken');
          localStorage.removeItem('userRefreshToken');
          localStorage.removeItem('userProfile');
          window.location.href = '/login';
        }
        return Promise.reject(e);
      } finally {
        userRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// API method exports
// ─────────────────────────────────────────────────────────────────────────────

// ── Customer auth & profile (user api) ───────────────────────────────────────
export const userAuthAPI = {
  register:      (data) => api.post('/users/register', data),
  verifyOtp:     (data) => api.post('/users/verify-otp', data),
  loginPassword: (data) => api.post('/users/login-password', data),
  sendLoginOtp:  (data) => api.post('/users/send-login-otp', data),
  loginOtp:      (data) => api.post('/users/login-otp', data),
  refresh:       (data) => api.post('/users/refresh', data),
  me:            ()     => api.get('/users/me'),
  myBookings:    ()     => api.get('/users/my-bookings'),
  updateEmoji:   (data) => api.put('/users/profile/emoji', data),
  updateProfile: (data) => api.put('/users/profile', data),
  sendResetOtp:  (data) => api.post('/users/send-reset-otp', data),
  resetPassword: (data) => api.post('/users/reset-password', data),
};

// ── Admin auth (adminApi) ─────────────────────────────────────────────────────
export const authAPI = {
  register:            (data) => adminApi.post('/auth/register', data),
  login:               (data) => adminApi.post('/auth/login', data),
  googleLogin:         (data) => adminApi.post('/auth/google', data),
  refresh:             (data) => adminApi.post('/auth/refresh', data),
  me:                  ()     => adminApi.get('/auth/me'),
  sendResetOtp:        (data) => adminApi.post('/auth/send-reset-otp', data),
  resetPassword:       (data) => adminApi.post('/auth/reset-password', data),
  getUsers:            ()     => adminApi.get('/auth/users'),
  updateAdminProfile:  (data) => adminApi.put('/auth/profile', data),
  changeAdminPassword: (data) => adminApi.put('/auth/change-password', data),
};

// ── Services (public reads via api; admin writes via adminApi) ────────────────
export const servicesAPI = {
  getAll:     ()         => api.get('/services'),
  getAllAdmin: ()         => adminApi.get('/services/all'),
  getOne:     (id)       => api.get(`/services/${id}`),
  create:     (data)     => adminApi.post('/services', data),
  update:     (id, data) => adminApi.put(`/services/${id}`, data),
  delete:     (id)       => adminApi.delete(`/services/${id}`),
};

// ── Bookings (public create/dates; admin reads & writes via adminApi) ─────────
export const bookingsAPI = {
  getUnavailableDates: ()         => api.get('/bookings/unavailable-dates'),
  create:              (data)     => api.post('/bookings', data),
  getAll:              ()         => adminApi.get('/bookings'),
  update:              (id, data) => adminApi.put(`/bookings/${id}`, data),
  delete:              (id)       => adminApi.delete(`/bookings/${id}`),
};

// ── Gallery (public reads via api; admin writes via adminApi) ─────────────────
export const galleryAPI = {
  getAll:        (category) => api.get(category ? `/gallery?category=${category}` : '/gallery'),
  getCategories: ()         => api.get('/gallery/categories'),
  getAllAdmin:    ()         => adminApi.get('/gallery/all'),
  create:        (data)     => adminApi.post('/gallery', data),
  update:        (id, data) => adminApi.put(`/gallery/${id}`, data),
  delete:        (id)       => adminApi.delete(`/gallery/${id}`),
  upload:        (formData) => adminApi.post('/gallery/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ── Logs (admin only) ─────────────────────────────────────────────────────────
export const logsAPI = {
  getSecurityLogs:  () => adminApi.get('/logs/security'),
  getActivityLogs:  () => adminApi.get('/logs/activity'),
  getActivityStats: () => adminApi.get('/logs/activity-stats'),
};

export default api;
