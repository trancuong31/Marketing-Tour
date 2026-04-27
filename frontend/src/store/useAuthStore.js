import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';

const useAuthStore = create(
    persist(
        (set, get) => ({
            token: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            /**
             * Set auth state
             */
            setAuth: (token, user, refreshToken) => set({
                token,
                refreshToken: refreshToken || get().refreshToken,
                user,
                isAuthenticated: true,
                error: null,
            }),

            /**
             * Clear error
             */
            clearError: () => set({ error: null }),

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
                    const { user, token, refreshToken } = data.data;
                    set({
                        token,
                        refreshToken,
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
                    const { user, token, refreshToken } = data.data;
                    set({
                        token,
                        refreshToken,
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
             * Logout
             */
            logout: () => set({
                token: null,
                refreshToken: null,
                user: null,
                isAuthenticated: false,
                error: null,
            }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                token: state.token,
                refreshToken: state.refreshToken,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export { useAuthStore };
