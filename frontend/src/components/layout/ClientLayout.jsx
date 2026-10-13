import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, MapPin, Globe2, Clock, LogIn, UserPlus, LogOut, User as UserIcon, List, Shield } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import AuthModal from '../../features/auth/components/AuthModal';
import { useAuthStore } from '../../store';
import { getImageUrl } from '@/utils/imageUrl';
import { useContactSettings } from '@/hooks/useContactSettings';
import ContactAction from '@/components/contact/ContactAction';
import ContactIcon from '@/components/contact/ContactIcon';
import { getContactText, getVisibleContacts } from '@/utils/contactSettings';
import logo from '../../../public/logo.jpg';
import NotificationBell from '../NotificationBell';
import LanguageSwitcher from '../ui/LanguageSwitcher/LanguageSwitcher';
const navLinks = [
    { path: '/', key: 'header.home' },
    { path: '/tours/noi-dia', key: 'header.domesticTour', icon: MapPin },
    { path: '/tours/quoc-te', key: 'header.internationalTour', icon: Globe2 },
    { path: '/lookup-booking', key: 'header.lookupBooking' },
    { path: '/guides', key: 'header.guides' },
];

const FOOTER_GUIDE_LINKS = {
    about: 've-chung-toi',
    blog: 'blog-du-lich',
    terms: 'dieu-khoan-su-dung',
    faq: 'cau-hoi-thuong-gap',
    policy: 'chinh-sach-bao-mat',
    payment: 'huong-dan-thanh-toan',
};

const ClientLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [mobileMenuUserOpen, setMobileMenuUserOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuthStore();
    const { t, i18n } = useTranslation();
    const { settings: contactSettings } = useContactSettings();
    const language = i18n.resolvedLanguage || i18n.language;
    const footerContacts = getVisibleContacts(contactSettings, 'footer');
    const floatingContacts = getVisibleContacts(contactSettings, 'floating');
    const hasFooterContact = Boolean(contactSettings && footerContacts.length > 0);
    const ignoreScrollRef = useRef(false);

    const getFooterGuidePath = (key) => {
        const targetSlug = FOOTER_GUIDE_LINKS[key];
        return targetSlug ? `/guides/${targetSlug}` : '/guides';
    };

    useEffect(() => {
        let lastScrollY = window.scrollY;
        const handleScroll = () => {
            if (ignoreScrollRef.current) {
                lastScrollY = window.scrollY;
                return;
            }
            if (Math.abs(window.scrollY - lastScrollY) > 20) {
                setMenuOpen(false);
                setMobileMenuUserOpen(false);
            }
            lastScrollY = window.scrollY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
                        <Link to="/" className="flex items-center gap-2 group shrink-0 min-w-fit">
                            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center overflow-hidden shrink-0">
                                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <span className="inline-block font-pacifico pb-1 pr-1 text-sm min-[380px]:text-base sm:text-xl xl:text-lg 2xl:text-xl whitespace-nowrap bg-gradient-to-r from-[#e8401c] to-[#1E6FBF] bg-clip-text text-transparent">
                                <i>{t('header.brandName')}</i>
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden xl:flex items-center gap-2 ml-auto">
                            <nav className="flex items-center gap-1 whitespace-nowrap">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                                            location.pathname === link.path ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-surface-alt hover:text-text'
                                        }`}
                                    >
                                        {link.icon && <link.icon className="w-3.5 h-3.5" />}
                                        {t(link.key)}
                                    </Link>
                                ))}
                            </nav>

                            {/* Auth buttons & Notifications */}
                            {isAuthenticated ? (
                                <div className="flex items-center gap-2">
                                    <div className="relative group cursor-pointer flex items-center gap-2">
                                        <div className="flex items-center gap-2 text-sm font-medium text-text">
                                            {user?.avatar_url ? (
                                                <img src={getImageUrl(user.avatar_url)} alt={user.full_name} className="w-9 h-9 rounded-full object-cover border border-border" />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <UserIcon className="w-4 h-4" />
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="max-w-[110px] truncate">{user?.full_name || t('header.guest')}</span>
                                                {/* admin hoặc customer */}
                                                {user?.role_id === 1 && <span className="text-[10px] uppercase font-bold text-primary/80 leading-none">{t('header.roleAdmin', 'Admin')}</span>}
                                                {user?.role_id === 2 && <span className="text-[10px] uppercase font-bold text-primary/80 leading-none">{t('header.roleCustomer', 'Customer')}</span>}
                                            </div>
                                        </div>

                                        {/* Dropdown Menu */}
                                        <div className="absolute left-1/2 top-full mt-2 w-56 -translate-x-1/2 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] rounded-2xl border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col pt-1 pb-1 z-50">
                                            <div className="px-4 py-3 border-b border-border bg-surface-alt/50 rounded-t-2xl">
                                                <p className="text-sm font-semibold text-text truncate">{user?.full_name}</p>
                                                <p className="text-xs text-text-muted truncate">{user?.email}</p>
                                            </div>
                                            <div className="py-1.5 flex flex-col px-1.5 gap-1">
                                                {user?.role_id === 1 && (
                                                    <Link to="/admin" className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors text-text group/item">
                                                        <Shield className="w-4 h-4 text-text-muted group-hover/item:text-primary transition-colors" />
                                                        <span className="text-sm font-medium">{t('header.adminPanel')}</span>
                                                    </Link>
                                                )}
                                                <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-surface-alt transition-colors text-text group/item">
                                                    <UserIcon className="w-4 h-4 text-text-muted group-hover/item:text-text transition-colors" />
                                                    <span className="text-sm font-medium">{t('header.profile')}</span>
                                                </Link>
                                                <Link to="/history" className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-surface-alt transition-colors text-text group/item">
                                                    <List className="w-4 h-4 text-text-muted group-hover/item:text-text transition-colors" />
                                                    <span className="text-sm font-medium">{t('header.history')}</span>
                                                </Link>
                                            </div>
                                            <div className="border-t border-border py-1.5 px-1.5 flex flex-col">
                                                <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-error/10 text-error transition-colors group/item">
                                                    <LogOut className="w-4 h-4 text-error/70 group-hover/item:text-error transition-colors" />
                                                    <span className="text-sm font-medium">{t('header.logout')}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="w-px h-6 bg-border mx-0.5"></div>

                                    {/* Notifications */}
                                    <NotificationBell />
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button onClick={() => openAuth('login')} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors border border-transparent">
                                        <LogIn className="w-4 h-4" />
                                        <span>{t('common.login')}</span>
                                    </button>
                                    <button onClick={() => openAuth('register')} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm">
                                        <UserPlus className="w-4 h-4" />
                                        <span>{t('common.register')}</span>
                                    </button>
                                </div>
                            )}

                            {/* Divider line */}
                            <div className="w-px h-6 bg-border mx-2"></div>

                            {/* Language Switcher */}
                            <div className="flex items-center">
                                <LanguageSwitcher />
                            </div>
                        </div>

                        {/* Mobile Right Icons */}
                        <div className="xl:hidden flex items-center gap-2 min-[380px]:gap-3">
                            {isAuthenticated && <NotificationBell />}
                            <LanguageSwitcher compact />
                            <button
                                className="p-2 rounded-lg hover:bg-surface-alt transition"
                                onClick={() => {
                                    ignoreScrollRef.current = true;
                                    setMenuOpen(!menuOpen);
                                    if (menuOpen) setMobileMenuUserOpen(false);
                                    setTimeout(() => {
                                        ignoreScrollRef.current = false;
                                    }, 400);
                                }}
                            >
                                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Nav — Full-screen overlay */}
                    {menuOpen && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="xl:hidden fixed inset-0 top-16 bg-black/40 z-40"
                                onClick={() => {
                                    setMenuOpen(false);
                                    setMobileMenuUserOpen(false);
                                }}
                            />
                            <nav className="xl:hidden fixed left-0 right-0 top-16 bottom-0 z-50 bg-white overflow-y-auto animate-slide-down">
                                <div className="py-3 px-2">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                                                location.pathname === link.path ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-surface-alt'
                                            }`}
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            {link.icon && <link.icon className="w-4 h-4" />}
                                            {t(link.key)}
                                        </Link>
                                    ))}

                                    <div className="my-2 border-t border-border"></div>

                                    {isAuthenticated ? (
                                        <div className="px-4 py-2">
                                            <div
                                                className="flex items-center justify-between bg-surface-alt/50 p-3 rounded-lg cursor-pointer hover:bg-surface-alt transition-colors"
                                                onClick={() => {
                                                    ignoreScrollRef.current = true;
                                                    setMobileMenuUserOpen(!mobileMenuUserOpen);
                                                    setTimeout(() => {
                                                        ignoreScrollRef.current = false;
                                                    }, 400);
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {user?.avatar_url ? (
                                                        <img src={getImageUrl(user.avatar_url)} alt={user.full_name} className="w-10 h-10 rounded-full object-cover border border-border" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                            <UserIcon className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-text text-sm">{user?.full_name || t('header.guest')}</span>
                                                        <span className="text-xs text-text-muted">{user?.email}</span>
                                                    </div>
                                                </div>
                                                <svg className={`w-5 h-5 text-text-muted transition-transform duration-200 ${mobileMenuUserOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>

                                            {/* Mobile Dropdown Menu */}
                                            <div className={`overflow-hidden transition-all duration-300 ${mobileMenuUserOpen ? 'max-h-64 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                                                <div className="flex flex-col px-2 gap-1 bg-surface-alt/30 rounded-lg p-2 border border-border/50">
                                                    {user?.role_id === 1 && (
                                                        <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-alt transition-colors text-text">
                                                            <Shield className="w-4 h-4 text-text-muted" />
                                                            <span className="text-sm font-medium">{t('header.adminPanel')}</span>
                                                        </Link>
                                                    )}
                                                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-alt transition-colors text-text">
                                                        <UserIcon className="w-4 h-4 text-text-muted" />
                                                        <span className="text-sm font-medium">{t('header.profile')}</span>
                                                    </Link>
                                                    <Link to="/history" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-alt transition-colors text-text">
                                                        <List className="w-4 h-4 text-text-muted" />
                                                        <span className="text-sm font-medium">{t('header.history')}</span>
                                                    </Link>
                                                </div>
                                            </div>

                                            <div className="mt-2 border-t border-border pt-2 px-1">
                                                <button
                                                    onClick={() => {
                                                        handleLogout();
                                                        setMenuOpen(false);
                                                    }}
                                                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-error/10 hover:bg-error/20 text-error transition-colors shadow-sm"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    <span className="font-semibold text-sm">{t('header.logout')}</span>
                                                </button>
                                            </div>
                                        </div>
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
                                                {t('common.login')}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setMenuOpen(false);
                                                    openAuth('register');
                                                }}
                                                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-white bg-primary rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors shadow-sm"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                                {t('common.register')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </nav>
                        </>
                    )}

                    <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode={authMode} />
                </div>
            </header>

            {/* ═══ MAIN CONTENT ═══ */}
            <main className="flex-1">{children}</main>

            {/* ═══ FLOATING SUPPORT BUTTONS ═══ */}
            {floatingContacts.length > 0 && (
                <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col gap-2 sm:gap-3">
                    {floatingContacts.map((contact) => {
                        const color = contact.type === 'wechat' ? 'bg-[#07C160]' : contact.type === 'zalo' ? 'bg-[#0068FF]' : 'bg-gradient-to-br from-primary to-primary-dark';
                        const ripple = contact.type === 'wechat' ? 'bg-[#07C160]' : contact.type === 'zalo' ? 'bg-[#0068FF]' : 'bg-primary';
                        const iconClassName = contact.icon === 'zalo' ? 'h-7 w-7 sm:h-10 sm:w-10' : 'h-6 w-6 text-white sm:h-8 sm:w-8';

                        return (
                            <div key={contact.id} className="relative group">
                                <span aria-hidden="true" className={`absolute inset-0 rounded-full ${ripple}/30 animate-ring`} />
                                <span aria-hidden="true" className={`absolute inset-0 rounded-full ${ripple}/20 animate-ring delay-300`} />
                                <ContactAction
                                    contact={contact}
                                    language={language}
                                    targetBlank
                                    className={`relative flex h-11 w-11 items-center justify-center rounded-full ${color} shadow-xl transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:h-14 sm:w-14`}
                                    iconClassName={iconClassName}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ═══ FOOTER — iVIVU Style ═══ */}
            <footer className="border-t border-border mt-auto bg-white">
                {/* Main Footer */}
                <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-10">
                    <div className={`grid grid-cols-2 gap-x-5 gap-y-7 text-sm sm:gap-8 ${hasFooterContact ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
                        {/* Col 1 - About */}
                        <div className="min-w-0">
                            <h4 className="font-bold uppercase text-text mb-3 text-sm sm:mb-4 sm:text-base">{t('footer.aboutUs')}</h4>
                            <ul className="space-y-2.5 text-text-secondary">
                                <li>
                                    <Link to={getFooterGuidePath('about')} className="hover:text-primary transition text-text-secondary">
                                        {t('footer.about')}
                                    </Link>
                                </li>
                                <li>
                                    <Link to={getFooterGuidePath('blog')} className="hover:text-primary transition text-text-secondary">
                                        {t('footer.blog')}
                                    </Link>
                                </li>
                                <li>
                                    <Link to={getFooterGuidePath('terms')} className="hover:text-primary transition text-text-secondary">
                                        {t('footer.terms')}
                                    </Link>
                                </li>
                                <li>
                                    <Link to={getFooterGuidePath('faq')} className="hover:text-primary transition text-text-secondary">
                                        {t('footer.faq')}
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Col 2 - Info */}
                        <div className="min-w-0">
                            <h4 className="font-bold uppercase text-text mb-3 text-sm sm:mb-4 sm:text-base">{t('footer.info')}</h4>
                            <ul className="space-y-2.5 text-text-secondary">
                                <li>
                                    <Link to={getFooterGuidePath('terms')} className="hover:text-primary transition text-text-secondary">
                                        {t('footer.terms')}
                                    </Link>
                                </li>
                                <li>
                                    <Link to={getFooterGuidePath('policy')} className="hover:text-primary transition text-text-secondary">
                                        {t('footer.policy')}
                                    </Link>
                                </li>
                                <li>
                                    <Link to={getFooterGuidePath('payment')} className="hover:text-primary transition text-text-secondary">
                                        {t('footer.payment')}
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Col 3 - Partners */}
                        <div className="min-w-0">
                            <h4 className="font-bold text-text uppercase mb-3 text-sm sm:mb-4 sm:text-base">{t('footer.partners')}</h4>
                            <ul className="space-y-2.5 text-text-secondary">
                                <li>
                                    <a href="#" className="hover:text-primary transition text-text-secondary">
                                        Vietnam Airlines
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-primary transition text-text-secondary">
                                        VNExpress
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-primary transition text-text-secondary">
                                        Booking.com
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-primary transition text-text-secondary">
                                        TripAdvisor
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Col 4 - Contact + Hotline */}
                        {hasFooterContact && (
                            <div className="min-w-0">
                                {getContactText(contactSettings.general?.heading, language) && (
                                    <h4 className="mb-3 text-sm font-bold uppercase text-text sm:mb-4 sm:text-base">
                                        {getContactText(contactSettings.general.heading, language)}
                                    </h4>
                                )}
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
                                    {footerContacts.map((contact) => {
                                        if (contact.id === 'hotline') {
                                            return (
                                                <div key={contact.id} className="mb-1 w-full min-w-0">
                                                    <ContactAction
                                                        contact={contact}
                                                        language={language}
                                                        className="flex items-center gap-2 text-primary transition hover:text-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                                    >
                                                        <ContactIcon name="phone" className="h-5 w-5 shrink-0" />
                                                        <span className="text-xl font-extrabold tracking-wide sm:text-2xl">{contact.displayValue}</span>
                                                    </ContactAction>
                                                    {getContactText(contactSettings.general?.workingHours, language) && (
                                                        <p className="mt-1 flex items-center gap-1 text-xs text-text-muted">
                                                            <Clock className="h-3 w-3" />
                                                            {getContactText(contactSettings.general.workingHours, language)}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        }

                                        if (contact.id === 'email') {
                                            return (
                                                <ContactAction
                                                    key={contact.id}
                                                    contact={contact}
                                                    language={language}
                                                    className="mb-1 flex w-full min-w-0 items-center gap-2 text-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                                >
                                                    <ContactIcon name="mail" className="h-4 w-4 shrink-0 text-primary" />
                                                    <span className="truncate">{contact.displayValue}</span>
                                                </ContactAction>
                                            );
                                        }

                                        const color = contact.type === 'facebook' ? 'bg-[#1877f2]' : contact.type === 'zalo' ? 'bg-[#0068FF]' : 'bg-[#07C160]';
                                        return (
                                            <ContactAction
                                                key={contact.id}
                                                contact={contact}
                                                language={language}
                                                targetBlank
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color} text-white transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
                                                iconClassName={contact.icon === 'wechat' ? 'h-5 w-5' : 'h-4 w-4'}
                                            >
                                                {contact.icon === 'zalo'
                                                    ? <span className="text-xs font-bold text-white">Zalo</span>
                                                    : <ContactIcon name={contact.icon} className={contact.icon === 'wechat' ? 'h-5 w-5' : 'h-4 w-4'} />}
                                            </ContactAction>
                                        );
                                    })}
                                </div>
                                {contactSettings.general?.description?.[language?.split('-')[0]] && (
                                    <p className="mt-2 text-xs text-text-muted">
                                        {getContactText(contactSettings.general.description, language)}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-border bg-surface-alt">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-primary" />
                                <span>{t('footer.address')}</span>
                            </div>
                            <span>{t('footer.copyright')}</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ClientLayout;
