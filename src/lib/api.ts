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
  // Remove Content-Type for FormData so the browser can set multipart/form-data with the correct boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Never auto-redirect on auth endpoints — those handle their own errors
    const isAuthCall = (err.config?.url as string | undefined)?.includes('/api/auth/');
    if (err.response?.status === 401 && typeof window !== 'undefined' && !isAuthCall) {
      localStorage.removeItem('fixng_token');
      localStorage.removeItem('fixng_user');
      // Redirect to the right login page depending on where the user was
      const isAdminPage = window.location.pathname.startsWith('/admin');
      window.location.href = isAdminPage ? '/admin/login' : '/login';
    }
    return Promise.reject(err);
  }
);

// Public API — no JWT, no 401 redirect. Use for endpoints that are open to all visitors.
export const publicApi = axios.create(baseConfig);

export default api;
