import { useTranslation } from 'react-i18next';
import ContactIcon from '@/components/contact/ContactIcon';
import { getContactText, getVisibleContacts } from '@/utils/contactSettings';

const ContactSettingsPreview = ({ settings, language }) => {
    const { t } = useTranslation();
    const footerContacts = getVisibleContacts(settings, 'footer');
    const floatingContacts = getVisibleContacts(settings, 'floating');

    return (
        <section className="space-y-4 border-t border-border pt-6" aria-labelledby="contact-preview-title">
            <div>
                <h2 id="contact-preview-title" className="text-base font-bold text-text">{t('admin.contact.preview')}</h2>
                <p className="mt-1 text-sm text-text-muted">{t('admin.contact.previewDescription')}</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
                <div className="min-w-0 border border-border bg-white p-4">
                    <h3 className="text-sm font-bold text-text">
                        {getContactText(settings?.general?.heading, language)}
                    </h3>
                    <div className="mt-3 flex flex-wrap items-center gap-2" aria-label={t('admin.contact.footerSocialPreview')}>
                        {footerContacts.map((contact) => {
                            if (contact.id === 'hotline') {
                                return (
                                    <div key={contact.id} className="w-full">
                                        <p className="flex items-center gap-2 font-bold text-primary">
                                            <ContactIcon name="phone" className="h-4 w-4" />
                                            {contact.displayValue}
                                        </p>
                                        {settings.general?.workingHours?.[language] && (
                                            <p className="mt-1 text-xs text-text-muted">{settings.general.workingHours[language]}</p>
                                        )}
                                    </div>
                                );
                            }

                            if (contact.id === 'email') {
                                return (
                                    <p key={contact.id} className="flex w-full items-center gap-2 break-all text-sm text-text-secondary">
                                        <ContactIcon name="mail" className="h-4 w-4 shrink-0 text-primary" />
                                        {contact.displayValue}
                                    </p>
                                );
                            }

                            return (
                                <span key={contact.id} title={getContactText(contact.labels, language)} className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-alt text-primary">
                                    <ContactIcon name={contact.icon} className="h-5 w-5" />
                                </span>
                            );
                        })}
                    </div>
                    {settings?.general?.description?.[language] && (
                        <p className="mt-2 text-sm text-text-secondary">{settings.general.description[language]}</p>
                    )}
                </div>
                <div className="flex min-h-40 items-end justify-end border border-border bg-surface-alt p-4">
                    <div className="flex flex-col gap-2" aria-label={t('admin.contact.floatingPreview')}>
                        {floatingContacts.map((contact) => (
                            <span key={contact.id} title={getContactText(contact.labels, language)} className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                                <ContactIcon name={contact.icon} className="h-6 w-6" />
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSettingsPreview;