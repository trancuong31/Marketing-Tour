import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import ClientLayout from '@/components/layout/ClientLayout';
import NotificationItem from '@/components/notifications/NotificationItem';
import { notificationService } from '@/services/tourService';

const ITEMS_PER_PAGE = 12;

const NotificationsPage = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchNotifications = useCallback(async (page = 1) => {
        try {
            setIsLoading(true);
            const res = await notificationService.getAll({ page, limit: ITEMS_PER_PAGE });
            const pagination = res.data.pagination || {};

            setNotifications(res.data.data || []);
            setUnreadCount(res.data.unreadCount || 0);
            setCurrentPage(pagination.currentPage || page);
            setTotalPages(pagination.totalPages || 1);
            setTotalItems(pagination.totalItems || 0);
            setError('');
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
            setError(t('notification.fetchError'));
        } finally {
            setIsLoading(false);
        }
    }, [t, i18n.language]);

    useEffect(() => {
        fetchNotifications(1);
    }, [fetchNotifications]);

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages || page === currentPage) return;

        fetchNotifications(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.is_read) {
                await notificationService.markOneAsRead(notification.id);
                setUnreadCount((prev) => Math.max(0, prev - 1));
                setNotifications((prev) => prev.map((item) => (
                    item.id === notification.id ? { ...item, is_read: 1 } : item
                )));
            }

            if (notification.related_slug) {
                navigate(`/tours/${notification.related_slug}`);
            }
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
            toast.error(t('notification.markReadError'));
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAsRead();
            setUnreadCount(0);
            setNotifications((prev) => prev.map((item) => ({ ...item, is_read: 1 })));
            toast.success(t('notification.markAllReadSuccess'));
        } catch (err) {
            console.error('Failed to mark notifications as read:', err);
            toast.error(t('notification.markReadError'));
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        const end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let page = start; page <= end; page += 1) {
            pages.push(page);
        }

        return pages;
    };

    return (
        <ClientLayout>
            <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Bell className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
                                {t('notification.pageTitle')}
                            </h1>
                            <p className="text-sm text-text-muted mt-1">
                                {t('notification.pageSubtitle', { count: totalItems })}
                            </p>
                        </div>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={handleMarkAllAsRead}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors shadow-sm"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            {t('notification.markAllRead')}
                        </button>
                    )}
                </div>

                <section className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
                    {isLoading ? (
                        <div className="min-h-[320px] flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="min-h-[320px] flex flex-col items-center justify-center text-center px-6">
                            <p className="text-sm font-semibold text-error">{error}</p>
                            <button
                                type="button"
                                onClick={() => fetchNotifications(currentPage)}
                                className="mt-4 px-4 py-2 rounded-lg border border-border text-sm font-semibold text-text hover:bg-surface-alt transition-colors"
                            >
                                {t('notification.retry')}
                            </button>
                        </div>
                    ) : notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                variant="page"
                                onClick={() => handleNotificationClick(notification)}
                            />
                        ))
                    ) : (
                        <div className="min-h-[320px] flex flex-col items-center justify-center text-center px-6">
                            <div className="w-16 h-16 rounded-full bg-surface-alt flex items-center justify-center mb-3">
                                <Bell className="w-8 h-8 text-border" />
                            </div>
                            <p className="text-base font-semibold text-text-secondary">{t('notification.emptyTitle')}</p>
                            <p className="text-sm text-text-muted mt-1 max-w-sm">{t('notification.emptyDescription')}</p>
                        </div>
                    )}
                </section>

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <button
                            type="button"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-10 h-10 rounded-lg border border-border flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-alt transition-colors"
                            aria-label={t('notification.previousPage')}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {getPageNumbers().map((page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => handlePageChange(page)}
                                className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                                    page === currentPage
                                        ? 'bg-primary text-white'
                                        : 'border border-border text-text hover:bg-surface-alt'
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="w-10 h-10 rounded-lg border border-border flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-alt transition-colors"
                            aria-label={t('notification.nextPage')}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </main>
        </ClientLayout>
    );
};

export default NotificationsPage;
