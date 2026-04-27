import axios from 'axios';

const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT, 10) || 30000;
const API_URL_LOCAL = import.meta.env.VITE_API_URL_LOCAL || 'http://localhost:8888/api';
const API_URL_PUBLIC = import.meta.env.VITE_API_URL_PUBLIC || API_URL_LOCAL;

const hostname = window.location.hostname;
const isLocal = hostname === 'localhost' || hostname.startsWith('192.168.') || hostname === '127.0.0.1';
const baseURL = isLocal ? API_URL_LOCAL : API_URL_PUBLIC;

const api = axios.create({
    baseURL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// flag để tránh refresh token vô tận
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor - thêm JWT token
api.interceptors.request.use(
    (config) => {
        // Import dynamically để tránh circular dependency
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
            try {
                const { state } = JSON.parse(authStorage);
                if (state?.token) {
                    config.headers.Authorization = `Bearer ${state.token}`;
                }
            } catch (e) {
                console.error('Lỗi parse auth storage:', e);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - xử lý lỗi auth và refresh token
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 và không phải là request retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            // Không thử refresh token cho các endpoint auth công khai (login, register, v.v.)
            // hoặc nếu chính request refresh-token bị lỗi
            const isPublicAuth = originalRequest.url.includes('/auth/login') || 
                               originalRequest.url.includes('/auth/register') ||
                               originalRequest.url.includes('/auth/refresh-token') ||
                               originalRequest.url.includes('/auth/verify-email');

            if (isPublicAuth) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const authStorage = localStorage.getItem('auth-storage');
                if (!authStorage) throw new Error('No auth storage found');

                const { state } = JSON.parse(authStorage);
                const refreshToken = state?.refreshToken;

                if (!refreshToken) throw new Error('No refresh token found');

                // Gọi API refresh token
                const response = await axios.post(`${baseURL}/auth/refresh-token`, { refreshToken });
                const { token, refreshToken: newRefreshToken } = response.data.data;

                // Cập nhật store
                const { useAuthStore } = await import('@/store');
                useAuthStore.getState().setAuth(token, state.user, newRefreshToken);

                // Thực hiện các request đang đợi
                processQueue(null, token);

                // Thử lại request ban đầu
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Logout nếu refresh thất bại
                const { useAuthStore } = await import('@/store');
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
