import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../store';
import { Button } from '../../../components/ui';
import { X, Mail, Lock, User, Phone, ArrowLeft, Shield, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

const inputCls = 'w-full pl-11 pr-4 py-3 bg-surface-alt border border-border rounded-xl text-text text-base transition-all duration-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-text-muted/60';

const InputField = ({ icon, ...props }) => (
    <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">{icon}</span>
        <input {...props} className={inputCls} />
    </div>
);

/**
 * Views: login | register | otp_verify | forgot_password | forgot_otp | reset_password
 */
const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
    const { t } = useTranslation();
    const {
        isLoading, error, clearError,
        login, register, verifyEmail, forgotPassword,
        verifyResetOtp, resetPassword, resendOtp,
    } = useAuthStore();

    const [view, setView] = useState(initialMode);
    const [formData, setFormData] = useState({
        full_name: '', email: '', password: '', confirmPassword: '', phone_number: '',
    });
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [countdown, setCountdown] = useState(0);
    const [otpEmail, setOtpEmail] = useState('');
    const [otpType, setOtpType] = useState('register');
    const [resetToken, setResetToken] = useState('');
    const otpRefs = useRef([]);

    // Reset on open/close
    useEffect(() => {
        if (!isOpen) {
            setFormData({ full_name: '', email: '', password: '', confirmPassword: '', phone_number: '' });
            setOtpDigits(['', '', '', '', '', '']);
            setCountdown(0);
            setResetToken('');
            clearError();
        }
    }, [isOpen, clearError]);

    useEffect(() => {
        if (isOpen) setView(initialMode);
    }, [initialMode, isOpen]);

    // Countdown timer for OTP
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    // ESC key + body scroll lock
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) clearError();
    };

    // OTP digit input handlers
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newDigits = [...otpDigits];
        newDigits[index] = value.slice(-1);
        setOtpDigits(newDigits);
        if (error) clearError();
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasteData) return;
        const newDigits = [...otpDigits];
        pasteData.split('').forEach((d, i) => { newDigits[i] = d; });
        setOtpDigits(newDigits);
        const focusIndex = Math.min(pasteData.length, 5);
        otpRefs.current[focusIndex]?.focus();
    };

    const startCountdown = () => setCountdown(300); // 5 minutes

    const switchView = useCallback((newView) => {
        setView(newView);
        setOtpDigits(['', '', '', '', '', '']);
        clearError();
    }, [clearError]);

    // ── Form Submissions ──

    const handleLogin = async (e) => {
        e.preventDefault();
        const result = await login(formData.email, formData.password);
        if (result.success) {
            onClose();
            toast.success(t('auth.loginSuccess'));
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const result = await register(formData);
        if (result.success) {
            setOtpEmail(formData.email);
            setOtpType('register');
            startCountdown();
            switchView('otp_verify');
            toast.success(t('auth.otpSent'));
        }
    };

    const handleVerifyOtp = async () => {
        const code = otpDigits.join('');
        if (code.length !== 6) return;

        if (otpType === 'register') {
            const result = await verifyEmail(otpEmail, code);
            if (result.success) {
                onClose();
                toast.success(t('auth.verifySuccess'));
            }
        } else {
            const result = await verifyResetOtp(otpEmail, code);
            if (result.success) {
                setResetToken(result.resetToken);
                switchView('reset_password');
            }
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        const result = await forgotPassword(formData.email);
        if (result.success) {
            setOtpEmail(formData.email);
            setOtpType('reset_password');
            startCountdown();
            switchView('forgot_otp');
            toast.success(t('auth.otpSent'));
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error(t('auth.passwordMismatch'));
            return;
        }
        const result = await resetPassword(resetToken, formData.password, formData.confirmPassword);
        if (result.success) {
            toast.success(t('auth.resetSuccess'));
            switchView('login');
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        }
    };

    const handleResendOtp = async () => {
        if (countdown > 0) return;
        const result = await resendOtp(otpEmail, otpType);
        if (result.success) {
            startCountdown();
            setOtpDigits(['', '', '', '', '', '']);
            toast.success(t('auth.otpResent'));
        }
    };

    if (!isOpen) return null;

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    // 2. CHUYỂN THÀNH HÀM RENDER ĐỂ TRÁNH MẤT FOCUS
    const renderOtpInput = () => (
        <div className="flex justify-center gap-2.5 my-6">
            {otpDigits.map((digit, i) => (
                <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    onPaste={i === 0 ? handleOtpPaste : undefined}
                    className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all duration-200 focus:outline-none ${digit
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border bg-surface-alt text-text'
                        } focus:border-primary focus:ring-2 focus:ring-primary/20`}
                    autoFocus={i === 0}
                />
            ))}
        </div>
    );

    // ── View Renderers ──

    const renderLogin = () => (
        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            {renderError()}
            <InputField icon={<Mail size={18} />} type="email" name="email" value={formData.email}
                onChange={handleChange} placeholder={t('auth.enterEmail')} required />
            <InputField icon={<Lock size={18} />} type="password" name="password" value={formData.password}
                onChange={handleChange} placeholder={t('auth.enterPassword')} required />

            <div className="flex justify-end">
                <button type="button" onClick={() => switchView('forgot_password')}
                    className="text-sm text-primary hover:text-primary-dark hover:underline transition-colors">
                    {t('auth.forgotPassword')}
                </button>
            </div>

            <Button type="submit" variant="primary" size="large" loading={isLoading} className="w-full mt-1">
                {t('auth.signIn')}
            </Button>

            <p className="text-center text-text-secondary text-sm mt-2">
                {t('auth.noAccount')}{' '}
                <button type="button" onClick={() => { switchView('register'); setFormData({ full_name: '', email: '', password: '', confirmPassword: '', phone_number: '' }); }}
                    className="text-primary font-medium hover:underline">{t('auth.signUp')}</button>
            </p>
        </form>
    );

    const renderRegister = () => (
        <form className="flex flex-col gap-3.5" onSubmit={handleRegister}>
            {renderError()}
            <InputField icon={<User size={18} />} type="text" name="full_name" value={formData.full_name}
                onChange={handleChange} placeholder={t('auth.enterName')} required minLength={2} />
            <InputField icon={<Mail size={18} />} type="email" name="email" value={formData.email}
                onChange={handleChange} placeholder={t('auth.enterEmail')} required />
            <InputField icon={<Phone size={18} />} type="tel" name="phone_number" value={formData.phone_number}
                onChange={handleChange} placeholder={t('auth.enterPhone')} />
            <InputField icon={<Lock size={18} />} type="password" name="password" value={formData.password}
                onChange={handleChange} placeholder={t('auth.createPassword')} required minLength={8} />
            <InputField icon={<Lock size={18} />} type="password" name="confirmPassword" value={formData.confirmPassword}
                onChange={handleChange} placeholder={t('auth.confirmPasswordPlaceholder')} required minLength={8} />

            <Button type="submit" variant="primary" size="large" loading={isLoading} className="w-full mt-1">
                {t('auth.register')}
            </Button>

            <p className="text-center text-text-secondary text-sm mt-1">
                {t('auth.alreadyHaveAccount')}{' '}
                <button type="button" onClick={() => { switchView('login'); setFormData(prev => ({ ...prev, password: '', confirmPassword: '' })); }}
                    className="text-primary font-medium hover:underline">{t('auth.signIn')}</button>
            </p>
        </form>
    );

    const renderOtpVerify = () => (
        <div className="flex flex-col items-center">
            {renderError()}
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="text-primary" size={32} />
            </div>
            <h3 className="text-lg font-semibold mb-1">{t('auth.verifyEmail')}</h3>
            <p className="text-text-muted text-sm text-center mb-1 max-w-[320px]">
                {t('auth.otpSentTo')} <span className="font-medium text-text">{otpEmail}</span>
            </p>

            {renderOtpInput()}

            {countdown > 0 && (
                <p className="text-text-muted text-sm mb-4">
                    {t('auth.otpExpires')} <span className="font-mono font-semibold text-primary">{formatTime(countdown)}</span>
                </p>
            )}

            <Button variant="primary" size="large" loading={isLoading} className="w-full"
                onClick={handleVerifyOtp} disabled={otpDigits.join('').length !== 6}>
                {t('auth.verify')}
            </Button>

            <button type="button" onClick={handleResendOtp}
                disabled={countdown > 0 || isLoading}
                className={`mt-4 text-sm transition-colors ${countdown > 0 ? 'text-text-muted cursor-not-allowed' : 'text-primary hover:text-primary-dark hover:underline'
                    }`}>
                {countdown > 0 ? t('auth.resendIn', { time: formatTime(countdown) }) : t('auth.resendOtp')}
            </button>
        </div>
    );

    const renderForgotPassword = () => (
        <form className="flex flex-col gap-4" onSubmit={handleForgotPassword}>
            {renderError()}
            <div className="flex flex-col items-center mb-2">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-4">
                    <KeyRound className="text-secondary" size={32} />
                </div>
                <p className="text-text-muted text-sm text-center max-w-[320px]">{t('auth.forgotDesc')}</p>
            </div>

            <InputField icon={<Mail size={18} />} type="email" name="email" value={formData.email}
                onChange={handleChange} placeholder={t('auth.enterEmail')} required />

            <Button type="submit" variant="primary" size="large" loading={isLoading} className="w-full">
                {t('auth.sendOtp')}
            </Button>

            <button type="button" onClick={() => switchView('login')}
                className="flex items-center justify-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors mt-1">
                <ArrowLeft size={16} /> {t('auth.backToLogin')}
            </button>
        </form>
    );

    const renderForgotOtp = () => (
        <div className="flex flex-col items-center">
            {renderError()}
            <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-4">
                <KeyRound className="text-secondary" size={32} />
            </div>
            <h3 className="text-lg font-semibold mb-1">{t('auth.verifyResetOtp')}</h3>
            <p className="text-text-muted text-sm text-center mb-1 max-w-[320px]">
                {t('auth.otpSentTo')} <span className="font-medium text-text">{otpEmail}</span>
            </p>

            {renderOtpInput()}

            {countdown > 0 && (
                <p className="text-text-muted text-sm mb-4">
                    {t('auth.otpExpires')} <span className="font-mono font-semibold text-secondary">{formatTime(countdown)}</span>
                </p>
            )}

            <Button variant="primary" size="large" loading={isLoading} className="w-full"
                onClick={handleVerifyOtp} disabled={otpDigits.join('').length !== 6}>
                {t('auth.verify')}
            </Button>

            <button type="button" onClick={handleResendOtp}
                disabled={countdown > 0 || isLoading}
                className={`mt-4 text-sm transition-colors ${countdown > 0 ? 'text-text-muted cursor-not-allowed' : 'text-primary hover:text-primary-dark hover:underline'
                    }`}>
                {countdown > 0 ? t('auth.resendIn', { time: formatTime(countdown) }) : t('auth.resendOtp')}
            </button>
        </div>
    );

    const renderResetPassword = () => (
        <form className="flex flex-col gap-4" onSubmit={handleResetPassword}>
            {renderError()}
            <div className="flex flex-col items-center mb-2">
                <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mb-4">
                    <Lock className="text-success" size={32} />
                </div>
                <p className="text-text-muted text-sm text-center max-w-[320px]">{t('auth.newPasswordDesc')}</p>
            </div>

            <InputField icon={<Lock size={18} />} type="password" name="password" value={formData.password}
                onChange={handleChange} placeholder={t('auth.newPassword')} required minLength={8} />
            <InputField icon={<Lock size={18} />} type="password" name="confirmPassword" value={formData.confirmPassword}
                onChange={handleChange} placeholder={t('auth.confirmNewPassword')} required minLength={8} />

            <Button type="submit" variant="primary" size="large" loading={isLoading} className="w-full">
                {t('auth.resetPassword')}
            </Button>
        </form>
    );

    // ── Shared Components ──

    const renderError = () => error && (
        <div className="bg-error/5 text-error px-4 py-3 rounded-xl border border-error/20 text-sm animate-fade-in">
            {error}
        </div>
    );

    const viewTitles = {
        login: { title: t('auth.welcomeBack'), desc: t('auth.signInDesc') },
        register: { title: t('auth.createAccount'), desc: t('auth.createAccountDesc') },
        otp_verify: { title: t('auth.verifyEmail'), desc: '' },
        forgot_password: { title: t('auth.forgotPassword'), desc: '' },
        forgot_otp: { title: t('auth.verifyResetOtp'), desc: '' },
        reset_password: { title: t('auth.resetPassword'), desc: '' },
    };

    const currentView = viewTitles[view] || viewTitles.login;
    const showBackButton = ['otp_verify', 'forgot_password', 'forgot_otp', 'reset_password'].includes(view);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-md animate-fade-in" />

            {/* Modal */}
            <div className="relative w-full max-w-[460px] bg-surface rounded-2xl shadow-2xl border border-border animate-fade-up delay-100 max-h-[90vh] overflow-y-auto scrollbar-hide"
                onClick={e => e.stopPropagation()}>
                {/* Close */}
                <button onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 text-text-muted hover:text-text hover:bg-surface-hover rounded-xl transition-colors duration-150"
                    aria-label="Close">
                    <X size={20} />
                </button>

                {/* Content */}
                <div className="p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        {showBackButton && view !== 'otp_verify' && view !== 'forgot_otp' && view !== 'reset_password' && (
                            <button onClick={() => switchView('login')}
                                className="absolute top-4 left-4 p-2 text-text-muted hover:text-text hover:bg-surface-hover rounded-xl transition-colors">
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        {(view === 'login' || view === 'register') && (
                            <>
                                <h2 className="text-2xl font-bold mb-1.5">{currentView.title}</h2>
                                <p className="text-text-muted text-sm">{currentView.desc}</p>
                            </>
                        )}
                    </div>

                    {/* Views */}
                    {view === 'login' && renderLogin()}
                    {view === 'register' && renderRegister()}
                    {view === 'otp_verify' && renderOtpVerify()}
                    {view === 'forgot_password' && renderForgotPassword()}
                    {view === 'forgot_otp' && renderForgotOtp()}
                    {view === 'reset_password' && renderResetPassword()}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;