import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { notificationService } from '@/services/tourService';
import { useAuthStore } from '@/store';
import { emitNotificationsRefresh, NOTIFICATIONS_REFRESH_EVENT } from '@/utils/notificationEvents';
import NotificationItem from './notifications/NotificationItem';

const MOBILE_QUERY = '(max-width: 767px)';
const NOTIFICATION_CACHE_TTL_MS = 60000;

let notificationCache = null;
let notificationRequest = null;

const buildNotificationSnapshot = (response) => ({
    notifications: response.data.data || [],
    unreadCount: response.data.unreadCount || 0,
    fetchedAt: Date.now(),
});

const isCacheFresh = () => (
    notificationCache && Date.now() - notificationCache.fetchedAt < NOTIFICATION_CACHE_TTL_MS
);

const NotificationBell = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { isAuthenticated } = useAuthStore();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const dropdownRef = useRef(null);
    const isMountedRef = useRef(false);

    const applySnapshot = useCallback((snapshot) => {
        if (!snapshot || !isMountedRef.current) return;
        setNotifications(snapshot.notifications);
        setUnreadCount(snapshot.unreadCount);
    }, []);

    const fetchNotifications = useCallback(async ({ force = false } = {}) => {
        if (!isAuthenticated) return;

        if (!force && isCacheFresh()) {
            applySnapshot(notificationCache);
            return;
        }

        try {
            notificationRequest ||= notificationService.getAll({ limit: 20 })
                .then((response) => {
                    notificationCache = buildNotificationSnapshot(response);
                    return notificationCache;
                })
                .finally(() => {
                    notificationRequest = null;
                });

            const snapshot = await notificationRequest;
            applySnapshot(snapshot);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }, [applySnapshot, isAuthenticated]);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        fetchNotifications();
    }, [fetchNotifications, isAuthenticated]);

    useEffect(() => {
        const handleRefresh = (event) => {
            if (event.detail?.snapshot) {
                notificationCache = event.detail.snapshot;
                applySnapshot(notificationCache);
                return;
            }

            fetchNotifications({ force: true });
        };

        window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, handleRefresh);
        return () => window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, handleRefresh);
    }, [applySnapshot, fetchNotifications]);

    useEffect(() => {
        const mediaQuery = window.matchMedia(MOBILE_QUERY);
        const updateIsMobile = () => setIsMobile(mediaQuery.matches);

        updateIsMobile();
        mediaQuery.addEventListener('change', updateIsMobile);
        return () => mediaQuery.removeEventListener('change', updateIsMobile);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBellClick = () => {
        if (isMobile) {
            navigate('/notifications');
            return;
        }

        setIsOpen((prev) => {
            const nextOpen = !prev;
            if (nextOpen) {
                fetchNotifications();
            }
            return nextOpen;
        });
    };

    const handleMarkRead = async (id) => {
        try {
            await notificationService.markOneAsRead(id);
            const nextNotifications = notifications.map((item) => (
                item.id === id ? { ...item, is_read: 1 } : item
            ));
            const nextSnapshot = {
                notifications: nextNotifications,
                unreadCount: Math.max(0, unreadCount - 1),
                fetchedAt: Date.now(),
            };
            notificationCache = nextSnapshot;
            applySnapshot(nextSnapshot);
            emitNotificationsRefresh({ snapshot: nextSnapshot });
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleNotificationClick = (notification) => {
        handleMarkRead(notification.id);

        if (notification.related_slug) {
            navigate(`/tours/${notification.related_slug}`);
            setIsOpen(false);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAsRead();
            const nextSnapshot = {
                notifications: notifications.map((item) => ({ ...item, is_read: 1 })),
                unreadCount: 0,
                fetchedAt: Date.now(),
            };
            notificationCache = nextSnapshot;
            applySnapshot(nextSnapshot);
            emitNotificationsRefresh({ snapshot: nextSnapshot });
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
        }
    };

    const handleViewAll = () => {
        setIsOpen(false);
        navigate('/notifications');
    };

    if (!isAuthenticated) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={handleBellClick}
                aria-label={t('notification.openNotifications')}
                className="relative p-1.5 rounded-lg text-text-secondary hover:bg-surface-alt hover:text-primary transition-all duration-200"
            >
                <Bell className={`w-5 h-5 ${isOpen ? 'text-primary fill-primary/10' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {!isMobile && isOpen && (
                <div className="absolute left-1/2 mt-2 w-[min(calc(100vw-1.5rem),20rem)] -translate-x-1/2 bg-white rounded-lg shadow-lg border border-border z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-2.5 border-b border-border flex items-center justify-between gap-3 bg-surface-alt/30">
                        <h3 className="text-sm font-semibold text-text">{t('notification.title')}</h3>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllAsRead}
                                className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
                            >
                                <CheckCircle2 className="w-3 h-3" />
                                {t('notification.markAllRead')}
                            </button>
                        )}
                    </div>

                    <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onClick={() => handleNotificationClick(notification)}
                                />
                            ))
                        ) : (
                            <div className="py-10 flex flex-col items-center justify-center text-center px-5">
                                <div className="w-12 h-12 rounded-full bg-surface-alt flex items-center justify-center mb-3">
                                    <Bell className="w-6 h-6 text-border" />
                                </div>
                                <p className="text-sm font-medium text-text-secondary">{t('notification.emptyTitle')}</p>
                                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                                    {t('notification.emptyDescription')}
                                </p>
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-border bg-surface-alt/20 text-center">
                            <button
                                type="button"
                                onClick={handleViewAll}
                                className="text-xs font-semibold text-text-muted hover:text-primary transition-colors"
                            >
                                {t('notification.viewAll')}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
