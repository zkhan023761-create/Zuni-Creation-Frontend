import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach access token ──────────────────────────────
// User tokens are stored as 'userToken'; admin tokens as 'token'.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('userToken') || localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ────────────────────────────
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, and not on the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Determine whether this is a customer session or admin session
        const userRefreshToken  = localStorage.getItem('userRefreshToken');
        const adminRefreshToken = localStorage.getItem('refreshToken');
        const isUserSession = !!userRefreshToken;

        let newToken;
        if (isUserSession) {
          // Customer: refresh via /users/refresh
          const res = await axios.post(`${API_URL}/users/refresh`, { refreshToken: userRefreshToken });
          newToken = res.data.accessToken;
          localStorage.setItem('userToken', newToken);
        } else {
          // Admin: refresh via /auth/refresh
          if (!adminRefreshToken) throw new Error('No refresh token');
          const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: adminRefreshToken });
          newToken = res.data.token;
          localStorage.setItem('token', newToken);
        }

        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed — detect session type BEFORE clearing, then redirect
        if (typeof window !== 'undefined') {
          const isUserSession = !!localStorage.getItem('userRefreshToken');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('admin');
          localStorage.removeItem('userToken');
          localStorage.removeItem('userRefreshToken');
          localStorage.removeItem('userProfile');
          window.location.href = isUserSession ? '/login' : '/login?tab=admin';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

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
  sendResetOtp:  (data) => api.post('/users/send-reset-otp', data),
  resetPassword: (data) => api.post('/users/reset-password', data),
};

export const authAPI = {
  register:     (data) => api.post('/auth/register', data),
  login:        (data) => api.post('/auth/login', data),
  googleLogin:  (data) => api.post('/auth/google', data),
  refresh:      (data) => api.post('/auth/refresh', data),
  me:           ()     => api.get('/auth/me'),
  sendResetOtp: (data) => api.post('/auth/send-reset-otp', data),
  resetPassword:(data) => api.post('/auth/reset-password', data),
  getUsers:     ()     => api.get('/auth/users'),
};

export const servicesAPI = {
  getAll:      ()         => api.get('/services'),
  getAllAdmin:  ()         => api.get('/services/all'),
  getOne:      (id)       => api.get(`/services/${id}`),
  create:      (data)     => api.post('/services', data),
  update:      (id, data) => api.put(`/services/${id}`, data),
  delete:      (id)       => api.delete(`/services/${id}`),
};

export const bookingsAPI = {
  getUnavailableDates: () => api.get('/bookings/unavailable-dates'),
  getAll: ()         => api.get('/bookings'),
  create: (data)     => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  delete: (id)       => api.delete(`/bookings/${id}`),
};

export const galleryAPI = {
  getAll:       (category) => api.get(category ? `/gallery?category=${category}` : '/gallery'),
  getAllAdmin:   ()         => api.get('/gallery/all'),
  getCategories:()         => api.get('/gallery/categories'),
  create:       (data)     => api.post('/gallery', data),
  update:       (id, data) => api.put(`/gallery/${id}`, data),
  delete:       (id)       => api.delete(`/gallery/${id}`),
  upload:       (formData) => api.post('/gallery/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};


export const contactAPI = {
  getAll:   ()     => api.get('/contact'),
  create:   (data) => api.post('/contact', data),
  markRead: (id)   => api.put(`/contact/${id}/read`),
  delete:   (id)   => api.delete(`/contact/${id}`),
};

export default api;
