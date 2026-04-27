import { create } from 'zustand';
import authService from '../services/authService';
import { setAccessToken, clearAccessToken } from '../services/api';

const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false, // true sau khi initAuth hoàn tất
    error: null,

    /**
     * Set auth state + sync access token vào memory
     * Nếu accessToken = null thì giữ nguyên token hiện tại (dùng khi chỉ update user)
     */
    setAuth: (accessToken, user) => {
        if (accessToken) {
            setAccessToken(accessToken);
        }
        set({
            user,
            isAuthenticated: true,
            error: null,
        });
    },

    /**
     * Update user data without changing token (e.g. after profile update)
     */
    updateUser: (user) => {
        set({ user });
    },

    /**
     * Clear error
     */
    clearError: () => set({ error: null }),

    /**
     * Initialize auth on app load — try refresh token cookie
     * Gọi 1 lần khi App mount để khôi phục session
     */
    initAuth: async () => {
        // Nếu đã init rồi thì bỏ qua
        if (get().isInitialized) return;

        try {
            const { data } = await authService.refresh();
            const { user, accessToken } = data.data;
            setAccessToken(accessToken);
            set({
                user,
                isAuthenticated: true,
                isInitialized: true,
                error: null,
            });
        } catch {
            // Không có refresh token hoặc hết hạn → chưa login
            clearAccessToken();
            set({
                user: null,
                isAuthenticated: false,
                isInitialized: true,
                error: null,
            });
        }
    },

    /**
     * Register a new user
     */
    register: async (formData) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await authService.register(formData);
            set({ isLoading: false });
            return { success: true, data: data.data };
        } catch (err) {
            const message = err.response?.data?.message || 'Đăng ký thất bại';
            set({ isLoading: false, error: message });
            return { success: false, message };
        }
    },

    /**
     * Verify email with OTP
     */
    verifyEmail: async (email, otpCode) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await authService.verifyEmail({
                email,
                otp_code: otpCode,
            });
            const { user, accessToken } = data.data;
            setAccessToken(accessToken);
            set({
                user,
                isAuthenticated: true,
                isLoading: false,
            });
            return { success: true, data: data.data };
        } catch (err) {
            const message = err.response?.data?.message || 'Xác thực OTP thất bại';
            set({ isLoading: false, error: message });
            return { success: false, message };
        }
    },

    /**
     * Login user
     */
    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await authService.login({ email, password });
            const { user, accessToken } = data.data;
            setAccessToken(accessToken);
            set({
                user,
                isAuthenticated: true,
                isLoading: false,
            });
            return { success: true, data: data.data };
        } catch (err) {
            const message = err.response?.data?.message || 'Đăng nhập thất bại';
            set({ isLoading: false, error: message });
            return { success: false, message };
        }
    },

    /**
     * Forgot password
     */
    forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await authService.forgotPassword({ email });
            set({ isLoading: false });
            return { success: true, message: data.message };
        } catch (err) {
            const message = err.response?.data?.message || 'Gửi yêu cầu thất bại';
            set({ isLoading: false, error: message });
            return { success: false, message };
        }
    },

    /**
     * Verify reset password OTP
     */
    verifyResetOtp: async (email, otpCode) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await authService.verifyResetOtp({
                email,
                otp_code: otpCode,
            });
            set({ isLoading: false });
            return { success: true, resetToken: data.data.resetToken };
        } catch (err) {
            const message = err.response?.data?.message || 'Xác thực OTP thất bại';
            set({ isLoading: false, error: message });
            return { success: false, message };
        }
    },

    /**
     * Reset password
     */
    resetPassword: async (resetToken, password, confirmPassword) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await authService.resetPassword({
                reset_token: resetToken,
                password,
                confirmPassword,
            });
            set({ isLoading: false });
            return { success: true, message: data.message };
        } catch (err) {
            const message = err.response?.data?.message || 'Đặt lại mật khẩu thất bại';
            set({ isLoading: false, error: message });
            return { success: false, message };
        }
    },

    /**
     * Resend OTP
     */
    resendOtp: async (email, type) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await authService.resendOtp({ email, type });
            set({ isLoading: false });
            return { success: true, message: data.message };
        } catch (err) {
            const message = err.response?.data?.message || 'Gửi lại OTP thất bại';
            set({ isLoading: false, error: message });
            return { success: false, message };
        }
    },

    /**
     * Logout — clear memory + call server to clear cookie
     */
    logout: async () => {
        try {
            await authService.logout();
        } catch {
            // Ignore — server may be unreachable
        }
        clearAccessToken();
        set({
            user: null,
            isAuthenticated: false,
            error: null,
        });
    },
}));

export { useAuthStore };
