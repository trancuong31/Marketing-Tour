import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import authService from '@/services/authService';
import { Eye, EyeOff, Globe, Loader2, Lock, Mail } from 'lucide-react';

const ADMIN_LOGIN_TEXT = {
    dashboardName: 'KyNghiTuyetVoi Dashboard',
    emailLabel: 'Email',
    emailPlaceholder: 'admin@email.com',
    passwordLabel: 'M\u1eadt kh\u1ea9u',
    passwordPlaceholder: '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022',
    showPassword: 'Hi\u1ec7n m\u1eadt kh\u1ea9u',
    hidePassword: '\u1ea8n m\u1eadt kh\u1ea9u',
    loggingIn: '\u0110ang \u0111\u0103ng nh\u1eadp...',
    login: '\u0110\u0103ng nh\u1eadp',
    invalidCredentials: 'Email ho\u1eb7c m\u1eadt kh\u1ea9u kh\u00f4ng \u0111\u00fang',
    inactiveAccount: 'T\u00e0i kho\u1ea3n ch\u01b0a x\u00e1c th\u1ef1c email',
    noAdminPermission: 'T\u00e0i kho\u1ea3n kh\u00f4ng c\u00f3 quy\u1ec1n admin',
    loginFailed: '\u0110\u0103ng nh\u1eadp th\u1ea5t b\u1ea1i',
};

const getLoginErrorMessage = (err) => {
    if (err.response?.status === 401) return ADMIN_LOGIN_TEXT.invalidCredentials;
    if (err.response?.status === 403) return ADMIN_LOGIN_TEXT.inactiveAccount;
    return err.response?.data?.message || ADMIN_LOGIN_TEXT.loginFailed;
};

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const submitLockRef = useRef(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (submitLockRef.current || loading) return;

        submitLockRef.current = true;
        setLoading(true);
        setError('');

        try {
            const response = await authService.login({
                email: email.trim(),
                password,
            });
            const { accessToken, user } = response.data.data;

            if (user.role_id !== 1) {
                setError(ADMIN_LOGIN_TEXT.noAdminPermission);
                return;
            }

            setAuth(accessToken, user);
            navigate('/admin/bookings');
        } catch (err) {
            setError(getLoginErrorMessage(err));
        } finally {
            submitLockRef.current = false;
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg mb-4">
                        <Globe className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-text">Admin Portal</h1>
                    <p className="text-sm text-text-muted mt-1">{ADMIN_LOGIN_TEXT.dashboardName}</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-border shadow-lg p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-sm text-error text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-text mb-1.5">
                            <Mail className="w-3.5 h-3.5 text-text-muted" /> {ADMIN_LOGIN_TEXT.emailLabel}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                            placeholder={ADMIN_LOGIN_TEXT.emailPlaceholder}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-text mb-1.5">
                            <Lock className="w-3.5 h-3.5 text-text-muted" /> {ADMIN_LOGIN_TEXT.passwordLabel}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className="w-full px-3 py-2.5 pr-11 bg-surface-alt border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                                placeholder={ADMIN_LOGIN_TEXT.passwordPlaceholder}
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition hover:text-text focus:outline-none"
                                aria-label={showPassword ? ADMIN_LOGIN_TEXT.hidePassword : ADMIN_LOGIN_TEXT.showPassword}
                                title={showPassword ? ADMIN_LOGIN_TEXT.hidePassword : ADMIN_LOGIN_TEXT.showPassword}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {loading ? ADMIN_LOGIN_TEXT.loggingIn : ADMIN_LOGIN_TEXT.login}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;
