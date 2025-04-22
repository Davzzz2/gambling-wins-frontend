import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'your-fallback-key';

class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL;
    this.headers = {
      'Content-Type': 'application/json',
      'X-Client-Version': '1.0',
      'X-Request-Time': '',
    };
  }

  // Add security headers and encrypt sensitive data
  async prepareRequest(endpoint, options = {}) {
    const timestamp = Date.now().toString();
    const token = localStorage.getItem('token');

    // Add security headers
    const headers = {
      ...this.headers,
      'X-Request-Time': timestamp,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    // Add request signature
    const signature = this.generateRequestSignature(endpoint, timestamp);
    headers['X-Request-Signature'] = signature;

    return {
      ...options,
      headers,
      credentials: 'include',
    };
  }

  // Generate a unique signature for each request
  generateRequestSignature(endpoint, timestamp) {
    const dataToSign = `${endpoint}:${timestamp}`;
    return CryptoJS.HmacSHA256(dataToSign, ENCRYPTION_KEY).toString();
  }

  // Encrypt sensitive data
  encryptData(data) {
    if (!data) return data;
    return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
  }

  // Decrypt response data
  decryptData(encryptedData) {
    if (!encryptedData) return encryptedData;
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const secureOptions = await this.prepareRequest(endpoint, options);

    try {
      const response = await fetch(url, secureOptions);
      
      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new Error(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
      }

      // Handle unauthorized access
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Unauthorized access');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Handle errors silently in production
      if (process.env.NODE_ENV !== 'development') {
        console.clear();
      }
      throw error;
    }
  }

  // API methods
  async login(credentials) {
    const encryptedData = this.encryptData(credentials);
    return this.request('/api/login', {
      method: 'POST',
      body: JSON.stringify({ data: encryptedData }),
    });
  }

  async getWins(type) {
    return this.request(`/api/wins?type=${type}`);
  }

  async createWin(formData) {
    return this.request('/api/wins', {
      method: 'POST',
      body: formData,
    });
  }

  async moderateWin(winId, status, comment) {
    const encryptedComment = this.encryptData(comment);
    return this.request(`/api/wins/${winId}/moderate`, {
      method: 'PUT',
      body: JSON.stringify({
        status,
        moderationComment: encryptedComment,
      }),
    });
  }

  async getUserProfile(username) {
    return this.request(`/api/users/${username}`);
  }

  async getNotifications() {
    return this.request('/api/notifications');
  }
}

export const api = new ApiService(); 
