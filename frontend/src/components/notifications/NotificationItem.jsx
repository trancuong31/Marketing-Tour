import { CheckCircle2, Heart, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enUS, vi, zhCN } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const dateLocales = {
    en: enUS,
    vi,
    zh: zhCN,
};

const notificationIcons = {
    like: {
        Icon: Heart,
        wrapperClassName: 'bg-error/10',
        iconClassName: 'text-error fill-error',
    },
    reply: {
        Icon: MessageCircle,
        wrapperClassName: 'bg-primary/10',
        iconClassName: 'text-primary fill-primary/10',
    },
    booking: {
        Icon: CheckCircle2,
        wrapperClassName: 'bg-green-100',
        iconClassName: 'text-green-600',
    },
};

const getDateLocale = (language) => dateLocales[language?.split('-')[0]] || vi;

const NotificationItem = ({ notification, onClick, variant = 'dropdown' }) => {
    const { i18n } = useTranslation();
    const iconConfig = notificationIcons[notification.type] || notificationIcons.booking;
    const Icon = iconConfig.Icon;
    const isPageVariant = variant === 'page';

    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full text-left flex transition-colors border-b border-border/50 last:border-0 ${
                isPageVariant ? 'gap-3 p-4 sm:p-5 hover:bg-surface-alt/60' : 'gap-2.5 px-3 py-2.5 hover:bg-surface-alt'
            } ${!notification.is_read ? 'bg-primary/5' : 'bg-white'}`}
        >
            <div className="shrink-0 mt-1">
                <div className={`${isPageVariant ? 'w-10 h-10' : 'w-8 h-8'} rounded-full flex items-center justify-center ${iconConfig.wrapperClassName}`}>
                    <Icon className={`${isPageVariant ? 'w-5 h-5' : 'w-4 h-4'} ${iconConfig.iconClassName}`} />
                </div>
            </div>
            <div className="min-w-0 flex-1">
                <p className={`${isPageVariant ? 'text-sm sm:text-base' : 'text-xs'} text-text leading-snug`}>
                    {notification.sender_name && (
                        <span className="font-semibold">{notification.sender_name} </span>
                    )}
                    {notification.message}
                </p>
                <span className={`${isPageVariant ? 'text-[11px] mt-1.5' : 'text-[10px] mt-1'} text-text-muted font-medium block`}>
                    {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: getDateLocale(i18n.language),
                    })}
                </span>
            </div>
            {!notification.is_read && (
                <div className="shrink-0 pt-2">
                    <div className={`${isPageVariant ? 'w-2 h-2' : 'w-1.5 h-1.5'} rounded-full bg-primary shadow-sm`} />
                </div>
            )}
        </button>
    );
};

export default NotificationItem;
