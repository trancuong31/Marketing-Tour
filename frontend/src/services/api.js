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
    withCredentials: true, // gửi cookie (refresh token) mỗi request
});

// ─── Token management (in-memory only, no localStorage) ──────────────────────
let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
    accessToken = null;
};

// ─── Request interceptor — attach access token from memory ───────────────────
api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response interceptor — auto-refresh on 401 ─────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        // Only attempt refresh for 401 errors, not on refresh/login/register endpoints
        const isAuthEndpoint = originalRequest.url?.includes('/auth/refresh')
            || originalRequest.url?.includes('/auth/login')
            || originalRequest.url?.includes('/auth/register');

        if (error.response?.status !== 401 || originalRequest._retry || isAuthEndpoint) {
            return Promise.reject(error);
        }

        // If already refreshing, queue this request
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const { data } = await axios.post(`${baseURL}/auth/refresh`, null, {
                withCredentials: true,
            });

            const newAccessToken = data.data.accessToken;
            accessToken = newAccessToken;

            // Sync to Zustand store (lazy import to avoid circular dependency)
            const { useAuthStore } = await import('@/store');
            useAuthStore.getState().setAuth(newAccessToken, data.data.user);

            processQueue(null, newAccessToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            accessToken = null;

            // Lazy import to avoid circular dep
            const { useAuthStore } = await import('@/store');
            useAuthStore.getState().logout();

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;
