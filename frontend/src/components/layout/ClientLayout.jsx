import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Phone, Mail, Globe, Menu, X, MapPin, Globe2, Clock, LogIn, UserPlus, LogOut, User as UserIcon, List, Key, Shield } from 'lucide-react';
import { useState } from 'react';
import AuthModal from '../../features/auth/components/AuthModal';
import { useAuthStore } from '../../store';
import zalo from '../../assets/images/zalo-2.png';
import logo from '../../../public/logo.jpg';
const navLinks = [
    { path: '/', label: 'Trang chủ' },
    { path: '/tours/noi-dia', label: 'Tour Nội Địa', icon: MapPin },
    { path: '/tours/quoc-te', label: 'Tour Quốc Tế', icon: Globe2 },
    { path: '/lookup-booking', label: 'Tra cứu đơn' },
    { path: '/guides', label: 'Hướng dẫn' },
];

const ClientLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const { isAuthenticated, user, logout } = useAuthStore();

    const openAuth = (mode) => {
        setAuthMode(mode);
        setAuthModalOpen(true);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* ═══ HEADER ═══ */}
            <header className="sticky top-0 z-50 bg-white border-b border-border shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-2xl font-bold text-primary">
                                Kỳ nghỉ quyến rũ
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-4">
                            <nav className="flex items-center gap-0.5">
                                {navLinks.map(link => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`px-3.5 py-2 rounded-lg text-base font-medium transition-all duration-200 flex items-center gap-1.5 ${location.pathname === link.path
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-text-secondary hover:bg-surface-alt hover:text-text'
                                            }`}
                                    >
                                        {link.icon && <link.icon className="w-3.5 h-3.5" />}
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>

                            {/* Divider line */}
                            <div className="w-px h-6 bg-border mx-2"></div>

                            {/* Auth buttons */}
                            {isAuthenticated ? (
                                <div className="relative group cursor-pointer flex items-center gap-3">
                                    <div className="flex items-center gap-2 text-sm font-medium text-text">
                                        {user?.avatar_url ? (
                                            <img
                                                src={user.avatar_url.startsWith('http') ? user.avatar_url : `http://localhost:8888${user.avatar_url}`}
                                                alt={user.full_name}
                                                className="w-9 h-9 rounded-full object-cover border border-border"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <UserIcon className="w-4 h-4" />
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span>{user?.full_name || 'Người dùng'}</span>
                                            {user?.role_id === 1 && (
                                                <span className="text-[10px] uppercase font-bold text-primary/80 leading-none">Admin</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Dropdown Menu */}
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] rounded-2xl border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col pt-1 pb-1 z-50">
                                        <div className="px-4 py-3 border-b border-border bg-surface-alt/50 rounded-t-2xl">
                                            <p className="text-sm font-semibold text-text truncate">{user?.full_name}</p>
                                            <p className="text-xs text-text-muted truncate">{user?.email}</p>
                                        </div>
                                        <div className="py-1.5 flex flex-col px-1.5 gap-1">
                                            {user?.role_id === 1 && (
                                                <Link to="/admin" className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors text-text group/item">
                                                    <Shield className="w-4 h-4 text-text-muted group-hover/item:text-primary transition-colors" />
                                                    <span className="text-sm font-medium">Trang quản trị</span>
                                                </Link>
                                            )}
                                            <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface-alt transition-colors text-text group/item">
                                                <UserIcon className="w-4 h-4 text-text-muted group-hover/item:text-text transition-colors" />
                                                <span className="text-sm font-medium">Hồ sơ cá nhân</span>
                                            </Link>
                                            <Link to="/history" className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface-alt transition-colors text-text group/item">
                                                <List className="w-4 h-4 text-text-muted group-hover/item:text-text transition-colors" />
                                                <span className="text-sm font-medium">Lịch sử đặt tour</span>
                                            </Link>
                                        </div>
                                        <div className="border-t border-border py-1.5 px-1.5 flex flex-col">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-error/10 text-error transition-colors group/item"
                                            >
                                                <LogOut className="w-4 h-4 text-error/70 group-hover/item:text-error transition-colors" />
                                                <span className="text-sm font-medium">Đăng xuất</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openAuth('login')}
                                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors border border-transparent"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        <span>Đăng nhập</span>
                                    </button>
                                    <button
                                        onClick={() => openAuth('register')}
                                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        <span>Đăng ký</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-surface-alt transition"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Mobile Nav */}
                    {menuOpen && (
                        <nav className="md:hidden py-3 border-t border-border animate-slide-down">
                            {navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${location.pathname === link.path
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-text-secondary hover:bg-surface-alt'
                                        }`}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {link.icon && <link.icon className="w-4 h-4" />}
                                    {link.label}
                                </Link>
                            ))}

                            <div className="my-2 border-t border-border"></div>

                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center justify-between px-4">
                                        {/* User bên trái */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <UserIcon className="w-5 h-5" />
                                            </div>
                                            <span className="font-medium text-text">
                                                {user?.full_name || 'Người dùng'}
                                            </span>
                                        </div>

                                        {/* Logout bên phải */}
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setMenuOpen(false);
                                            }}
                                            className="flex items-center gap-2 text-error hover:bg-error/5 transition-colors font-medium text-sm px-2 py-1 rounded"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col gap-2 px-4 py-2">
                                    <button
                                        onClick={() => {
                                            setMenuOpen(false);
                                            openAuth('login');
                                        }}
                                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-primary bg-primary/10 rounded-lg font-medium text-sm hover:bg-primary/20 transition-colors"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        Đăng nhập
                                    </button>
                                    <button
                                        onClick={() => {
                                            setMenuOpen(false);
                                            openAuth('register');
                                        }}
                                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-white bg-primary rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors shadow-sm"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        Đăng ký
                                    </button>
                                </div>
                            )}
                        </nav>
                    )}

                    <AuthModal
                        isOpen={authModalOpen}
                        onClose={() => setAuthModalOpen(false)}
                        initialMode={authMode}
                    />
                </div>
            </header>

            {/* ═══ MAIN CONTENT ═══ */}
            <main className="flex-1">
                {children}
            </main>

            {/* ═══ FLOATING SUPPORT BUTTONS ═══ */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
                {/* Zalo */}
                <a
                    href="https://zalo.me/0987654321"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group"
                    title="Chat Zalo"
                >
                    {/* Ripple ring */}
                    <span className="absolute inset-0 rounded-full bg-[#0068FF]/30 animate-ring" />
                    <span className="absolute inset-0 rounded-full bg-[#0068FF]/20 animate-ring delay-300" />
                    <div className="relative w-14 h-14 rounded-full bg-[#0068FF] flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer">
                        <img src={zalo} alt="Zalo" className="w-10 h-10" />
                    </div>
                </a>

                {/* Phone */}
                <a
                    href="tel:0987654321"
                    className="relative group"
                    title="Gọi ngay"
                >
                    <span className="absolute inset-0 rounded-full bg-primary/30 animate-ring" />
                    <span className="absolute inset-0 rounded-full bg-primary/20 animate-ring delay-300" />
                    <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-xl hover:scale-110 transition-transform delay-200 cursor-pointer">
                        <Phone className="w-6 h-6 text-white" />
                    </div>
                </a>
            </div>

            {/* ═══ FOOTER — iVIVU Style ═══ */}
            <footer className="border-t border-border mt-auto bg-white">
                {/* Main Footer */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
                        {/* Col 1 - About */}
                        <div>
                            <h4 className="font-bold text-text mb-4 text-base">Về Marketing Tour</h4>
                            <ul className="space-y-2.5 text-text-secondary">
                                <li><Link to="/" className="hover:text-primary transition text-text-secondary">Chúng tôi</Link></li>
                                <li><Link to="/guides" className="hover:text-primary transition text-text-secondary">Blog du lịch</Link></li>
                                <li><a href="#" className="hover:text-primary transition text-text-secondary">Quy chế hoạt động</a></li>
                                <li><a href="#" className="hover:text-primary transition text-text-secondary">Câu hỏi thường gặp</a></li>
                            </ul>
                        </div>

                        {/* Col 2 - Info */}
                        <div>
                            <h4 className="font-bold text-text mb-4 text-base">Thông Tin Cần Biết</h4>
                            <ul className="space-y-2.5 text-text-secondary">
                                <li><a href="#" className="hover:text-primary transition text-text-secondary">Điều kiện & Điều khoản</a></li>
                                <li><a href="#" className="hover:text-primary transition text-text-secondary">Chính sách giá tốt</a></li>
                                <li><a href="#" className="hover:text-primary transition text-text-secondary">Chính sách bảo mật</a></li>
                                <li><a href="#" className="hover:text-primary transition text-text-secondary">Hướng dẫn thanh toán</a></li>
                            </ul>
                        </div>

                        {/* Col 3 - Partners */}
                        <div>
                            <h4 className="font-bold text-text mb-4 text-base">Đối Tác & Liên Kết</h4>
                            <ul className="space-y-2.5 text-text-secondary">
                                <li><a href="#" className="hover:text-primary transition text-text-secondary">Vietnam Airlines</a></li>
                                <li><a href="#" className="hover:text-primary transition text-text-secondary">VNExpress</a></li>
                                <li><a href="#" className="hover:text-primary transition text-text-secondary">Booking.com</a></li>
                                <li><a href="#" className="hover:text-primary transition text-text-secondary">TripAdvisor</a></li>
                            </ul>
                        </div>

                        {/* Col 4 - Contact + Hotline */}
                        <div>
                            <h4 className="font-bold text-text mb-4 text-base">Bạn cần trợ giúp?</h4>
                            <div className="mb-4">
                                <a href="tel:19002045" className="flex items-center gap-2 text-primary hover:text-primary-dark transition">
                                    <Phone className="w-5 h-5" />
                                    <span className="text-2xl font-extrabold tracking-wide">1900 0000</span>
                                </a>
                                <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> 7h30 → 21h hàng ngày
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-text-secondary mb-2">
                                <Mail className="w-4 h-4 text-primary" />
                                <span>info@kynghiquyenru.vn</span>
                            </div>
                            {/* Social Icons */}
                            <div className="flex gap-2 mt-4">
                                {/* Facebook */}
                                <a href="#" className="w-9 h-9 rounded-full bg-[#1877f2] flex items-center justify-center text-white hover:opacity-80 transition">
                                    <svg className="w-4 h-4" fill="#fff" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
                                </a>
                                {/* Zalo */}
                                <a href="#" className="w-9 h-9 rounded-full bg-[#0068FF] flex items-center justify-center text-white hover:opacity-80 transition">
                                    <span className="text-xs font-bold text-white">Zalo</span>
                                </a>
                                {/* Instagram */}
                                <a href="#" className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center text-white hover:opacity-80 transition">
                                    <svg className="w-4 h-4" fill="#fff" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.013-3.667-.07-4.847-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-border bg-surface-alt">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-primary" />
                                <span>1 Phố Nhổn, P. Bắc Từ Liêm, TP. Hà Nội</span>
                            </div>
                            <span>© {new Date().getFullYear()} Marketing Tour. Tất cả quyền được bảo lưu.</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ClientLayout;
