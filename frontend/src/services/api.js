import axios from 'axios';

const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT, 10) || 30000;
// Ưu tiên VITE_API_URL_PUBLIC, sau đó đến LOCAL, mặc định fallback về '/api'
const baseURL = import.meta.env.VITE_API_URL_PUBLIC || import.meta.env.VITE_API_URL_LOCAL || '/api';

const api = axios.create({
    baseURL,
    timeout: API_TIMEOUT,
    withCredentials: true, // gửi cookie (refresh token) mỗi request
});

// ─── Token management (in-memory only, no localStorage) ──────────────────────
let accessToken = null;
let authStateHandlers = {
    onRefreshSuccess: null,
    onRefreshFailure: null,
};

export const setAccessToken = (token) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
    accessToken = null;
};

export const setAuthStateHandlers = (handlers = {}) => {
    authStateHandlers = {
        onRefreshSuccess: handlers.onRefreshSuccess || null,
        onRefreshFailure: handlers.onRefreshFailure || null,
    };
};

// ─── Request interceptor — attach access token from memory ───────────────────
api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        const lang = localStorage.getItem('i18nextLng') || 'vi';
        config.headers['x-language'] = lang;
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
            authStateHandlers.onRefreshSuccess?.(newAccessToken, data.data.user);

            processQueue(null, newAccessToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            accessToken = null;
            authStateHandlers.onRefreshFailure?.();

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;
