import axios from 'axios';
import { API_BASE_URL } from '../config/api';

/**
 * Base URL gọi API:
 * - Nếu có BACKEND_URL trong .env → dùng (vd: http://localhost:5000/api khi BE chạy cổng 5000).
 * - Dev không set env: dùng "/api" + "proxy" trong package.json → CRA chuyển tới http://localhost:3000
 *   (tránh gọi nhầm vào chính dev server React → 404).
 * - Production build: nên set BACKEND_URL trỏ domain API thật.
 */
function resolveApiBaseURL() {
    const env = process.env.BACKEND_URL;
    if (env && String(env).trim()) {
        return String(env).replace(/\/$/, '');
    }
    if (process.env.NODE_ENV === 'development') {
        return '/api';
    }
    return '/api';
}

const baseURL = resolveApiBaseURL();

const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(
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

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized (logout user, etc.)
            console.error('Unauthorized access');
        }
        return Promise.reject(error);
    }
);

export default apiClient;
