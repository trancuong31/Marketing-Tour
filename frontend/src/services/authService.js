import api from './api';

/**
 * Authentication API Service
 */
const authService = {
    /**
     * Register a new user
     */
    register: (data) => api.post('/auth/register', data),

    /**
     * Verify email with OTP
     */
    verifyEmail: (data) => api.post('/auth/verify-email', data),

    /**
     * Login user
     */
    login: (data) => api.post('/auth/login', data),

    /**
     * Refresh access token (uses HttpOnly cookie)
     */
    refresh: () => api.post('/auth/refresh'),

    /**
     * Forgot password — request OTP
     */
    forgotPassword: (data) => api.post('/auth/forgot-password', data),

    /**
     * Verify reset password OTP
     */
    verifyResetOtp: (data) => api.post('/auth/verify-reset-otp', data),

    /**
     * Reset password with token
     */
    resetPassword: (data) => api.post('/auth/reset-password', data),

    /**
     * Resend OTP
     */
    resendOtp: (data) => api.post('/auth/resend-otp', data),

    /**
     * Get current user profile (requires access token)
     */
    getMe: () => api.get('/auth/me'),

    /**
     * Logout — clears refresh token cookie on server
     */
    logout: () => api.post('/auth/logout'),
};

export default authService;
