import axios from 'axios';

// Pre-configured Axios instance for future API integrations
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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
      // Handle unauthorized access (token expired or invalid)
      console.warn('Unauthorized request detected');
    }
    return Promise.reject(error);
  }
);

export default api;
