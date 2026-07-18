import axios from 'axios';

const baseConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-app-key': process.env.NEXT_PUBLIC_APP_KEY!,
  },
};

// Authenticated API — attaches JWT and redirects on 401
const api = axios.create(baseConfig);

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fixng_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('fixng_token');
      localStorage.removeItem('fixng_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Public API — no JWT, no 401 redirect. Use for endpoints that are open to all visitors.
export const publicApi = axios.create(baseConfig);

export default api;
