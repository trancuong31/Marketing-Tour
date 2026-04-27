import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import authService from '@/services/authService';
import { Globe, Loader2, Lock, Mail } from 'lucide-react';

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await authService.login({ email, password });
            const { accessToken, user } = res.data.data;

            // Chỉ admin mới được vào
            if (user.role_id !== 1) {
                setError('Tài khoản không có quyền admin');
                return;
            }

            setAuth(accessToken, user);
            navigate('/admin/bookings');
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg mb-4">
                        <Globe className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-text">Admin Portal</h1>
                    <p className="text-sm text-text-muted mt-1">Marketing Tour Dashboard</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-border shadow-lg p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-sm text-error text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-text mb-1.5">
                            <Mail className="w-3.5 h-3.5 text-text-muted" /> Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                            placeholder="admin@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-text mb-1.5">
                            <Lock className="w-3.5 h-3.5 text-text-muted" /> Mật khẩu
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;
