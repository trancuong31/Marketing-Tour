import { Mail, Phone } from 'lucide-react';
import zalo from '@/assets/images/zalo-2.png';

const ContactIcon = ({ name, className = 'h-5 w-5' }) => {
    if (name === 'phone') return <Phone className={className} aria-hidden="true" />;
    if (name === 'mail') return <Mail className={className} aria-hidden="true" />;
    if (name === 'zalo') return <img src={zalo} alt="" className={className} />;

    if (name === 'facebook') {
        return (
            <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
            </svg>
        );
    }

    if (name === 'wechat') {
        return (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M9.5 4C5.36 4 2 6.72 2 10.08c0 1.94 1.12 3.68 2.87 4.78L4.2 17.5l2.7-1.48c.82.25 1.69.38 2.6.38.25 0 .5-.01.74-.03A6.2 6.2 0 0 1 10 14.1c0-3.36 3.36-6.08 7.5-6.08.36 0 .72.02 1.07.07C17.5 5.74 13.93 4 9.5 4Zm-2.25 5.2a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8Zm4.5 0a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8Z" />
                <path d="M17.5 9.25c-3.04 0-5.5 1.94-5.5 4.34 0 2.4 2.46 4.34 5.5 4.34.67 0 1.32-.1 1.91-.28l2.09 1.15-.52-1.83c1.23-.82 2.02-2 2.02-3.38 0-2.4-2.46-4.34-5.5-4.34Zm-1.8 4.02a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Zm3.6 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
            </svg>
        );
    }

    return null;
};

export default ContactIcon;