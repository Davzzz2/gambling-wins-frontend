import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear auth state on token expiration
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// Cache for API responses
const cache = new Map();

export const api = {
  // Auth methods
  async login(username, password) {
    const response = await axiosInstance.post('/api/auth/login', {
      username,
      password,
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  async logout() {
    try {
      await axiosInstance.post('/api/auth/logout');
    } finally {
      this.clearCache();
    }
  },

  async verifyToken() {
    try {
      const response = await axiosInstance.get('/api/auth/verify');
      return response.status === 200;
    } catch {
      return false;
    }
  },

  // User methods
  async getUserProfile(username) {
    const cacheKey = `profile_${username}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const response = await axiosInstance.get(`/api/users/${username}`);
    cache.set(cacheKey, response.data);
    return response.data;
  },

  // Win methods
  async getWins(type = null) {
    const cacheKey = `wins_${type || 'all'}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const params = type ? { type } : {};
    const response = await axiosInstance.get('/api/wins', { params });
    cache.set(cacheKey, response.data);
    return response.data;
  },

  async createWin(winData) {
    const response = await axiosInstance.post('/api/wins', winData);
    this.clearCache();
    return response.data;
  },

  async updateWin(winId, updates) {
    const response = await axiosInstance.put(`/api/wins/${winId}`, updates);
    this.clearCache();
    return response.data;
  },

  async deleteWin(winId) {
    const response = await axiosInstance.delete(`/api/wins/${winId}`);
    this.clearCache();
    return response.data;
  },

  // Cache management
  clearCache() {
    cache.clear();
  },

  // Error handling
  handleError(error) {
    if (error.response) {
      // Server responded with error
      return {
        status: error.response.status,
        message: error.response.data.message || 'An error occurred',
      };
    } else if (error.request) {
      // Request made but no response
      return {
        status: 0,
        message: 'No response from server',
      };
    } else {
      // Request setup error
      return {
        status: -1,
        message: error.message || 'Request failed',
      };
    }
  },
};

export default api; 
