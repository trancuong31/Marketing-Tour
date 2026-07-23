import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { useTranslation } from 'react-i18next';
import {
    ShoppingCart, Map, FileText, Star,
    LogOut, Menu, X, ChevronRight, User, Home, Image, Languages
} from 'lucide-react';
import logo from "../../../public/logo.jpg";

const menuItems = [
    { path: '/admin/bookings', label: 'Quản lý Đơn', icon: ShoppingCart },
    { path: '/admin/tours', label: 'Quản lý Tour', icon: Map },
    { path: '/admin/banners', label: 'Quản lý Banner', icon: Image },
    { path: '/admin/content', label: 'Bài viết', icon: FileText },
    { path: '/admin/reviews', label: 'Quản lý Đánh giá', icon: Star },
    { path: '/admin/translations', labelKey: 'admin.menu.translations', fallback: 'Translations', icon: Languages },
];

const AdminLayout = ({ children, hidePageTitle = false }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const getMenuLabel = (item) => item.labelKey ? t(item.labelKey, item.fallback) : item.label;
    const shouldShowPageTitle = !hidePageTitle;

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* ═══ SIDEBAR ═══ */}
            {/* Overlay mobile */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-surface border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}>
                {/* Logo */}
                <div className="flex items-center gap-2 px-5 h-16 border-b border-border">
                    <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg" />
                    <span className="font-bold text-text">Admin Panel</span>
                    <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Menu */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {menuItems.map(item => {
                        const active = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-text-secondary hover:bg-surface-hover hover:text-text'
                                    }`}
                            >
                                <item.icon className="w-4.5 h-4.5" />
                                {getMenuLabel(item)}
                                {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* User info */}
                <div className="p-3 border-t border-border">
                    <Link
                        to="/"
                        className="mb-2 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-text-secondary hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
                    >
                        <Home className="w-4 h-4" /> Về trang chủ
                    </Link>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-alt">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text truncate">{user?.full_name || 'Admin'}</p>
                            <p className="text-xs text-text-muted truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/5 rounded-xl transition"
                    >
                        <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                </div>
            </aside>

            {/* ═══ MAIN ═══ */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="sticky top-0 z-30 h-16 bg-surface/80 backdrop-blur-xl border-b border-border flex items-center px-4 sm:px-6">
                    <button
                        className="lg:hidden p-2 rounded-lg hover:bg-surface-hover mr-3"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    {shouldShowPageTitle && (
                        <h1 className="text-lg font-bold text-text">
                            {(() => {
                                const currentItem = menuItems.find(m => location.pathname.startsWith(m.path));
                                return currentItem ? getMenuLabel(currentItem) : t('admin.menu.dashboard', 'Dashboard');
                            })()}
                        </h1>
                    )}
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
