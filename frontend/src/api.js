import axios from 'axios';

// Create a centralized axios instance for better control 
// over headers, base URL, and interceptors
const API = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to attach authentication token
API.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Adding auth token to request headers');
    } else {
      console.warn('No auth token found in localStorage!');
      // Check if we can get the token from sessionStorage as fallback
      const sessionToken = sessionStorage.getItem('token');
      if (sessionToken) {
        config.headers['Authorization'] = `Bearer ${sessionToken}`;
        console.log('Using token from sessionStorage instead');
      }
    }
    
    return config;
  },
  (error) => {
    console.error('API request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for global error handling
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      // Clear token and user data on unauthorized response
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default API;
