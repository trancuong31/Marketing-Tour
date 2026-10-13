import ContactIcon from './ContactIcon';
import { getContactHref, getContactText, isContactCopyAction } from '@/utils/contactSettings';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const ContactAction = ({ contact, language, className, iconClassName, children, targetBlank = false }) => {
    const { t } = useTranslation();
    const label = getContactText(contact.labels, language);
    const content = children || <ContactIcon name={contact.icon} className={iconClassName} />;

    const copyAccountIdentifier = async () => {
        try {
            await navigator.clipboard.writeText(contact.accountIdentifier);
            toast.success(t('footer.contactCopied', 'Contact copied'));
        } catch {
            toast.error(t('footer.contactCopyFailed', 'Unable to copy contact'));
        }
    };

    if (isContactCopyAction(contact)) {
        return (
            <button
                type="button"
                className={className}
                aria-label={`${label}: ${contact.accountIdentifier}`}
                title={`${label}: ${contact.accountIdentifier}`}
                onClick={copyAccountIdentifier}
            >
                {content}
            </button>
        );
    }

    const href = getContactHref(contact);
    if (!href) {
        return (
            <span className={className} role="img" aria-label={label} title={label}>
                {content}
            </span>
        );
    }

    const opensExternalPage = ['facebook', 'zalo', 'wechat'].includes(contact.type);

    return (
        <a
            href={href}
            className={className}
            aria-label={label}
            title={label}
            target={targetBlank && opensExternalPage ? '_blank' : undefined}
            rel={targetBlank && opensExternalPage ? 'noopener noreferrer' : undefined}
        >
            {content}
        </a>
    );
};

export default ContactAction;