import axios from 'axios';

const API_PORT = process.env.REACT_APP_API_PORT || 5001;
const API_URL = process.env.REACT_APP_API_URL || `http://localhost:${API_PORT}/api`;

console.log('API Configuration:', {
    API_PORT,
    API_URL,
    NODE_ENV: process.env.NODE_ENV
});

// Create axios instance with the correct base URL
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 30000,
    withCredentials: true
});

// Add auth token to every request
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Adding auth token to request');
    } else {
        console.log('No auth token found in localStorage');
    }
    return config;
});

// Add request interceptor for debugging
api.interceptors.request.use(
    config => {
        if (process.env.NODE_ENV === 'development') {
            console.log('API Request:', {
                method: config.method,
                url: config.url,
                baseURL: config.baseURL,
                fullURL: `${config.baseURL}${config.url}`,
                data: config.data,
                headers: config.headers
            });
        }
        return config;
    },
    error => {
        console.error('API Request Error:', {
            message: error.message,
            config: error.config
        });
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
api.interceptors.response.use(
    response => {
        if (process.env.NODE_ENV === 'development') {
            console.log('API Response:', {
                status: response.status,
                statusText: response.statusText,
                data: response.data,
                headers: response.headers
            });
        }
        return response;
    },
    error => {
        const errorDetails = {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL
        };
        
        console.error('API Response Error:', errorDetails);
        
        // Enhance error object with more details
        error.details = errorDetails;
        return Promise.reject(error);
    }
);

// Health check function
async function checkApiHealth() {
    try {
        const response = await api.get('/health');
        console.log('API Health Check Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Health Check Failed:', {
            message: error.message,
            details: error.details
        });
        return null;
    }
}

// Test the API connection on load
checkApiHealth().then(health => {
    if (health) {
        console.log('API is healthy:', health);
    } else {
        console.error('API health check failed - server might be down or misconfigured');
    }
});

// Products API endpoints
export const getProducts = async (params) => {
  try {
    const response = await api.get('/products', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;