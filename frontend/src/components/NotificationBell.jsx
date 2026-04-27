import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Heart, MessageCircle, CheckCircle2 } from 'lucide-react';
import { notificationService } from '@/services/tourService';
import { useAuthStore } from '@/store';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const NotificationBell = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        if (!isAuthenticated) return;
        try {
            const res = await notificationService.getAll();
            setNotifications(res.data.data || []);
            setUnreadCount(res.data.unreadCount || 0);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Polling every 5 seconds for new notifications
        const interval = setInterval(fetchNotifications, 5000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await notificationService.markOneAsRead(id);
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAsRead();
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl text-text-secondary hover:bg-surface-alt hover:text-primary transition-all duration-300 group"
            >
                <Bell className={`w-6 h-6 ${isOpen ? 'text-primary fill-primary/10' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce-subtle">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-border z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-border flex items-center justify-between bg-surface-alt/30">
                        <h3 className="font-bold text-text">Thông báo</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={handleMarkAllAsRead}
                                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                            >
                                <CheckCircle2 className="w-3 h-3" />
                                Đánh dấu tất cả đã đọc
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <div 
                                    key={notif.id}
                                    onClick={() => {
                                        handleMarkRead(notif.id);
                                        if (notif.related_slug) {
                                            navigate(`/tours/${notif.related_slug}`);
                                            setIsOpen(false);
                                        }
                                    }}
                                    className={`p-4 flex gap-3 hover:bg-surface-alt transition-colors cursor-pointer border-b border-border/50 last:border-0 ${!notif.is_read ? 'bg-primary/5' : ''}`}
                                >
                                    <div className="shrink-0 mt-1">
                                        {notif.type === 'like' ? (
                                            <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                                                <Heart className="w-5 h-5 text-error fill-error" />
                                            </div>
                                        ) : notif.type === 'reply' ? (
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <MessageCircle className="w-5 h-5 text-primary fill-primary/10" />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-text leading-snug">
                                            <span className="font-bold">{notif.sender_name}</span> {notif.message}
                                        </p>
                                        <span className="text-[10px] text-text-muted font-medium mt-1 block">
                                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: vi })}
                                        </span>
                                    </div>
                                    {!notif.is_read && (
                                        <div className="shrink-0 pt-2">
                                            <div className="w-2 h-2 rounded-full bg-primary shadow-sm" />
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                                <div className="w-16 h-16 rounded-full bg-surface-alt flex items-center justify-center mb-3">
                                    <Bell className="w-8 h-8 text-border" />
                                </div>
                                <p className="text-sm font-medium text-text-secondary">Bạn chưa có thông báo nào</p>
                                <p className="text-xs text-text-muted mt-1 leading-relaxed">Khi có lượt thích hoặc phản hồi bình luận, chúng sẽ xuất hiện ở đây.</p>
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-border bg-surface-alt/20 text-center">
                            <button className="text-xs font-bold text-text-muted hover:text-primary transition-colors">
                                Xem tất cả thông báo
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
