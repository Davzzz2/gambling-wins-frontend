import axios from 'axios';

// Debug environment variables in development
if (process.env.NODE_ENV === 'development') {
  console.log('Environment Variables:', {
    NODE_ENV: process.env.NODE_ENV,
    BACKEND_URL: process.env.REACT_APP_BACKEND_URL,
  });
}

const backendUrl = process.env.REACT_APP_BACKEND_URL;

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: backendUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug axios configuration
console.log('Axios Instance Config:', {
  baseURL: axiosInstance.defaults.baseURL,
  timeout: axiosInstance.defaults.timeout,
});

// Remove URL from error messages
const sanitizeError = (error) => {
  if (error.config) {
    delete error.config.baseURL;
    delete error.config.url;
  }
  if (error.request) {
    delete error.request.responseURL;
  }
  return error;
};

// Request interceptor for API calls
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Debug request config
    if (process.env.NODE_ENV === 'development') {
      console.log('Request Config:', {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL,
        headers: config.headers,
      });
    }
    return config;
  },
  (error) => {
    return Promise.reject(sanitizeError(error));
  }
);

// Response interceptor for API calls
axiosInstance.interceptors.response.use(
  (response) => {
    // Remove sensitive headers and URLs from response
    delete response.config.baseURL;
    delete response.config.url;
    return response;
  },
  async (error) => {
    // Debug error response
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
      }
    });

    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear auth state on token expiration
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(sanitizeError(error));
  }
);

// Cache for API responses
const cache = new Map();

export const api = {
  // Auth methods
  async login(username, password) {
    try {
      console.log('Attempting login with URL:', axiosInstance.defaults.baseURL + '/api/auth/login');
      
      const response = await axiosInstance.post('/api/auth/login', {
        username: username,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw sanitizeError(error);
    }
  },

  async logout() {
    try {
      await axiosInstance.post('/api/auth/logout');
    } catch (error) {
      // Ignore logout errors
    } finally {
      this.clearCache();
    }
  },

  async verifyToken() {
    try {
      const response = await axiosInstance.get('/api/auth/verify');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  },

  // User methods
  async getUserProfile(username) {
    try {
      const cacheKey = `profile_${username}`;
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
      }

      const response = await axiosInstance.get(`/api/users/${username}`);
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw sanitizeError(error);
    }
  },

  // Win methods
  async getWins(type = null) {
    try {
      const cacheKey = `wins_${type || 'all'}`;
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
      }

      const params = type ? { type } : {};
      const response = await axiosInstance.get('/api/wins', { params });
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      throw sanitizeError(error);
    }
  },

  async createWin(winData) {
    try {
      const response = await axiosInstance.post('/api/wins', winData);
      this.clearCache();
      return response.data;
    } catch (error) {
      throw sanitizeError(error);
    }
  },

  async updateWin(winId, updates) {
    try {
      const response = await axiosInstance.put(`/api/wins/${winId}`, updates);
      this.clearCache();
      return response.data;
    } catch (error) {
      throw sanitizeError(error);
    }
  },

  async deleteWin(winId) {
    try {
      const response = await axiosInstance.delete(`/api/wins/${winId}`);
      this.clearCache();
      return response.data;
    } catch (error) {
      throw sanitizeError(error);
    }
  },

  // Cache management
  clearCache() {
    cache.clear();
  },

  // Error handling
  handleError(error) {
    error = sanitizeError(error);
    
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
        message: 'Network error occurred',
      };
    } else {
      // Request setup error
      return {
        status: -1,
        message: 'Request failed',
      };
    }
  },
};

export default api; 
