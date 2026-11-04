import axios from 'axios';

/**
 * Resolves the backend API base URL.
 * In production: Uses VITE_API_BASE_URL (formats properly with trailing /api if needed).
 * If missing in production: logs an actionable error in console rather than silently failing.
 * In local dev: Falls back cleanly to http://localhost:3000/api.
 */
export const resolveBaseUrl = () => {
  let url = import.meta.env.VITE_API_BASE_URL;

  if (url && typeof url === 'string') {
    url = url.trim().replace(/\/+$/, '');
    if (!url.endsWith('/api')) {
      url = `${url}/api`;
    }
    return url;
  }

  if (import.meta.env.PROD) {
    console.error(
      '[DevSpace Production Configuration Error] Missing VITE_API_BASE_URL environment variable.\n' +
      'Production API requests require a defined backend URL (e.g. https://your-backend.onrender.com/api).\n' +
      'Please configure VITE_API_BASE_URL in your Vercel project environment variables and redeploy.'
    );
  }

  return 'http://localhost:3000/api';
};

// Pre-configured Axios instance for DevSpace API
const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach auth token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('devspace_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common error codes globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401 unauthorized / expired session
      localStorage.removeItem('devspace_token');
      window.dispatchEvent(new Event('devspace:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
