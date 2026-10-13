import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loader2, RotateCcw, Save } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import ContactIcon from '@/components/contact/ContactIcon';
import { contactSettingsService } from '@/services/contactSettingsService';
import ContactSettingsPreview from '@/features/admin/components/ContactSettingsPreview';

const LANGUAGES = [
    { code: 'vi', labelKey: 'admin.contact.languages.vi' },
    { code: 'en', labelKey: 'admin.contact.languages.en' },
    { code: 'zh', labelKey: 'admin.contact.languages.zh' },
];

const ICONS = ['phone', 'mail', 'facebook', 'zalo', 'wechat'];
const SOCIAL_HOSTS = {
    facebook: ['facebook.com', 'fb.com', 'fb.me'],
    zalo: ['zalo.me'],
    wechat: ['wechat.com', 'weixin.qq.com'],
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const isValidPhone = (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    return /^[+\d(). -]+$/.test(value) && digits.length >= 6 && digits.length <= 15;
};

const isAllowedSocialUrl = (value, type) => {
    if (!value) return true;
    try {
        const url = new URL(value);
        return url.protocol === 'https:'
            && !url.username
            && !url.password
            && SOCIAL_HOSTS[type]?.some((host) => url.hostname.toLowerCase() === host || url.hostname.toLowerCase().endsWith(`.${host}`));
    } catch {
        return false;
    }
};

const ContactSettingsPage = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const [saved, setSaved] = useState(null);
    const [draft, setDraft] = useState(null);
    const [language, setLanguage] = useState('vi');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const dirty = useMemo(() => Boolean(saved && draft && JSON.stringify(saved) !== JSON.stringify(draft)), [draft, saved]);

    useEffect(() => {
        let active = true;
        contactSettingsService.getAdmin()
            .then((response) => {
                const configuration = response.data.data.configuration;
                if (active) {
                    setSaved(clone(configuration));
                    setDraft(clone(configuration));
                    setLoadError('');
                }
            })
            .catch((error) => {
                if (active) setLoadError(error.response?.data?.message || t('admin.contact.loadError'));
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [t]);

    useEffect(() => {
        if (!dirty) return undefined;
        const warnBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = '';
        };
        const confirmInternalNavigation = (event) => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            if (!(event.target instanceof Element)) return;
            const link = event.target.closest('a[href]');
            if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

            const destination = new URL(link.href, window.location.href);
            if (destination.origin !== window.location.origin) return;
            if (destination.pathname === location.pathname && destination.search === location.search) return;
            if (window.confirm(t('admin.contact.discardConfirm'))) return;

            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        };

        window.addEventListener('beforeunload', warnBeforeUnload);
        document.addEventListener('click', confirmInternalNavigation, true);
        return () => {
            window.removeEventListener('beforeunload', warnBeforeUnload);
            document.removeEventListener('click', confirmInternalNavigation, true);
        };
    }, [dirty, location.pathname, location.search, t]);

    const updateGeneral = (section, field, value) => {
        setDraft((current) => ({
            ...current,
            general: {
                ...current.general,
                [section]: { ...current.general[section], [field]: value },
            },
        }));
        setFieldErrors((current) => {
            const next = { ...current };
            delete next[`general.${section}.${field}`];
            return next;
        });
    };

    const updateContact = (id, field, value) => {
        setDraft((current) => ({
            ...current,
            contacts: current.contacts.map((contact) => (
                contact.id === id ? { ...contact, [field]: value } : contact
            )),
        }));
        setFieldErrors((current) => {
            const next = { ...current };
            delete next[`${id}.${field}`];
            return next;
        });
    };

    const updateContactLabel = (id, value) => {
        setDraft((current) => ({
            ...current,
            contacts: current.contacts.map((contact) => (
                contact.id === id
                    ? { ...contact, labels: { ...contact.labels, [language]: value } }
                    : contact
            )),
        }));
        setFieldErrors((current) => {
            const next = { ...current };
            delete next[`${id}.label.${language}`];
            return next;
        });
    };

    const validate = (configuration) => {
        const errors = {};
        let firstInvalidLanguage = '';
        for (const locale of ['vi', 'en', 'zh']) {
            if (!configuration.general.heading[locale].trim()) {
                errors[`general.heading.${locale}`] = t('admin.contact.required');
                firstInvalidLanguage ||= locale;
            }
            if (!configuration.general.workingHours[locale].trim()) {
                errors[`general.workingHours.${locale}`] = t('admin.contact.required');
                firstInvalidLanguage ||= locale;
            }
        }

        for (const contact of configuration.contacts) {
            for (const locale of ['vi', 'en', 'zh']) {
                if (!contact.labels[locale].trim()) {
                    errors[`${contact.id}.label.${locale}`] = t('admin.contact.required');
                    firstInvalidLanguage ||= locale;
                }
            }

            if (contact.phoneNumber && !isValidPhone(contact.phoneNumber)) {
                errors[`${contact.id}.phoneNumber`] = t('admin.contact.invalidPhone');
            }
            if (contact.type === 'phone' && contact.destination && !isValidPhone(contact.destination)) {
                errors[`${contact.id}.destination`] = t('admin.contact.invalidPhone');
            }
            if (contact.type === 'phone' && contact.enabled && !contact.destination) {
                errors[`${contact.id}.destination`] = t('admin.contact.required');
            }
            if (contact.type === 'email' && contact.displayValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.displayValue)) {
                errors[`${contact.id}.displayValue`] = t('admin.contact.invalidEmail');
            }
            if (contact.type === 'email' && contact.enabled && !contact.displayValue) {
                errors[`${contact.id}.displayValue`] = t('admin.contact.required');
            }
            if (SOCIAL_HOSTS[contact.type] && !isAllowedSocialUrl(contact.destination, contact.type)) {
                errors[`${contact.id}.destination`] = t('admin.contact.invalidUrl');
            }
            if (contact.type === 'wechat' && contact.wechatAction === 'url' && !contact.destination) {
                errors[`${contact.id}.destination`] = t('admin.contact.required');
            }
            if (contact.type === 'wechat' && contact.wechatAction === 'copy' && !contact.accountIdentifier.trim()) {
                errors[`${contact.id}.accountIdentifier`] = t('admin.contact.required');
            }

            for (const location of ['footer', 'floating']) {
                const order = contact[`${location}Order`];
                if (!Number.isInteger(order) || order < 1 || order > 100) {
                    errors[`${contact.id}.${location}Order`] = t('admin.contact.invalidOrder');
                }
            }
        }

        for (const location of ['footer', 'floating']) {
            const orderKey = `${location}Order`;
            const visibilityKey = `${location}Visible`;
            const orders = configuration.contacts
                .filter((contact) => contact.enabled && contact[visibilityKey])
                .map((contact) => ({ id: contact.id, order: contact[orderKey] }));
            const counts = orders.reduce((result, item) => ({
                ...result,
                [item.order]: (result[item.order] || 0) + 1,
            }), {});
            orders.filter((item) => counts[item.order] > 1).forEach(({ id }) => {
                errors[`${id}.${orderKey}`] = t('admin.contact.duplicateOrder');
            });
        }

        setFieldErrors(errors);
        if (firstInvalidLanguage) setLanguage(firstInvalidLanguage);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async (event) => {
        event.preventDefault();
        if (!draft || saving || !validate(draft)) return;

        setSaving(true);
        try {
            const response = await contactSettingsService.updateAdmin(draft);
            const configuration = response.data.data.configuration;
            setSaved(clone(configuration));
            setDraft(clone(configuration));
            setFieldErrors({});
            toast.success(t('admin.contact.saveSuccess'));
        } catch (error) {
            toast.error(error.response?.data?.message || t('admin.contact.saveError'));
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (!saved || (!dirty || window.confirm(t('admin.contact.discardConfirm')))) {
            setDraft(clone(saved));
            setFieldErrors({});
        }
    };

    const fieldError = (key) => fieldErrors[key] && (
        <p className="mt-1 text-xs text-error" role="alert">{fieldErrors[key]}</p>
    );

    const inputClassName = 'w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

    return (
        <AdminLayout>
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm text-text-muted">{t('admin.contact.subtitle')}</p>
                    </div>
                    {draft && <p className="text-xs text-text-muted">{t('admin.contact.databaseSource')}</p>}
                </div>

                {loading ? (
                    <div className="flex items-center gap-3 py-12 text-sm text-text-muted">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        {t('admin.contact.loading')}
                    </div>
                ) : loadError ? (
                    <div className="border border-error/30 bg-error/5 p-4 text-sm text-error" role="alert">
                        <p>{loadError}</p>
                        <button type="button" onClick={() => window.location.reload()} className="mt-2 font-semibold underline">
                            {t('admin.contact.retry')}
                        </button>
                    </div>
                ) : draft && (
                    <form onSubmit={handleSave} className="space-y-6" noValidate>
                        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3" role="group" aria-label={t('admin.contact.language')}>
                            {LANGUAGES.map(({ code, labelKey }) => (
                                <button
                                    key={code}
                                    type="button"
                                    aria-pressed={language === code}
                                    onClick={() => setLanguage(code)}
                                    className={`border px-3 py-1.5 text-sm font-semibold ${language === code ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-secondary hover:bg-surface-alt'}`}
                                >
                                    {t(labelKey)}
                                </button>
                            ))}
                        </div>

                        <section className="space-y-4" aria-labelledby="contact-general-heading">
                            <div>
                                <h2 id="contact-general-heading" className="text-base font-bold text-text">{t('admin.contact.general')}</h2>
                                <p className="mt-1 text-sm text-text-muted">{t('admin.contact.generalDescription')}</p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="block text-sm font-medium text-text">
                                    {t('admin.contact.heading')} ({language.toUpperCase()})
                                    <input className={`${inputClassName} mt-1.5`} value={draft.general.heading[language]} onChange={(event) => updateGeneral('heading', language, event.target.value)} />
                                    {fieldError(`general.heading.${language}`)}
                                </label>
                                <label className="block text-sm font-medium text-text">
                                    {t('admin.contact.hours')} ({language.toUpperCase()})
                                    <input className={`${inputClassName} mt-1.5`} value={draft.general.workingHours[language]} onChange={(event) => updateGeneral('workingHours', language, event.target.value)} />
                                    {fieldError(`general.workingHours.${language}`)}
                                </label>
                                <label className="block text-sm font-medium text-text md:col-span-2">
                                    {t('admin.contact.description')} ({language.toUpperCase()})
                                    <textarea className={`${inputClassName} mt-1.5 min-h-20 resize-y`} value={draft.general.description[language]} onChange={(event) => updateGeneral('description', language, event.target.value)} maxLength={280} />
                                </label>
                            </div>
                        </section>

                        <section className="space-y-4 border-t border-border pt-6" aria-labelledby="contact-methods-heading">
                            <div>
                                <h2 id="contact-methods-heading" className="text-base font-bold text-text">{t('admin.contact.methods')}</h2>
                                <p className="mt-1 text-sm text-text-muted">{t('admin.contact.methodsDescription')}</p>
                            </div>
                            <div className="divide-y divide-border border-y border-border">
                                {draft.contacts.map((contact) => (
                                    <fieldset key={contact.id} className="space-y-4 py-5">
                                        <legend className="sr-only">{t(`admin.contact.methodsById.${contact.id}`)}</legend>
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 font-semibold text-text">
                                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-alt text-primary">
                                                    <ContactIcon name={contact.icon} className="h-5 w-5" />
                                                </span>
                                                {t(`admin.contact.methodsById.${contact.id}`)}
                                            </div>
                                            <label className="inline-flex items-center gap-2 text-sm font-medium text-text">
                                                <input type="checkbox" checked={contact.enabled} onChange={(event) => updateContact(contact.id, 'enabled', event.target.checked)} />
                                                {t('admin.contact.enabled')}
                                            </label>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <label className="block text-sm font-medium text-text">
                                                {t('admin.contact.accessibleLabel')} ({language.toUpperCase()})
                                                <input className={`${inputClassName} mt-1.5`} value={contact.labels[language]} onChange={(event) => updateContactLabel(contact.id, event.target.value)} maxLength={80} />
                                                {fieldError(`${contact.id}.label.${language}`)}
                                            </label>
                                            <label className="block text-sm font-medium text-text">
                                                {contact.type === 'email' ? t('admin.contact.email') : t('admin.contact.displayValue')}
                                                <input
                                                    className={`${inputClassName} mt-1.5`}
                                                    type={contact.type === 'email' ? 'email' : 'text'}
                                                    value={contact.displayValue}
                                                    onChange={(event) => updateContact(contact.id, 'displayValue', event.target.value)}
                                                    maxLength={180}
                                                />
                                                {fieldError(`${contact.id}.displayValue`)}
                                            </label>

                                            {contact.type !== 'email' && (
                                                <label className="block text-sm font-medium text-text">
                                                    {contact.type === 'phone' ? t('admin.contact.callNumber') : t('admin.contact.destinationUrl')}
                                                    <input
                                                        className={`${inputClassName} mt-1.5`}
                                                        type={contact.type === 'phone' ? 'tel' : 'url'}
                                                        value={contact.destination}
                                                        onChange={(event) => updateContact(contact.id, 'destination', event.target.value)}
                                                        maxLength={500}
                                                    />
                                                    {fieldError(`${contact.id}.destination`)}
                                                </label>
                                            )}

                                            {contact.phoneNumber !== '' && (
                                                <label className="block text-sm font-medium text-text">
                                                    {t('admin.contact.phoneNumber')}
                                                    <input className={`${inputClassName} mt-1.5`} type="tel" value={contact.phoneNumber} onChange={(event) => updateContact(contact.id, 'phoneNumber', event.target.value)} maxLength={32} />
                                                    {fieldError(`${contact.id}.phoneNumber`)}
                                                </label>
                                            )}

                                            {contact.id === 'wechat' && (
                                                <>
                                                    <label className="block text-sm font-medium text-text">
                                                        {t('admin.contact.wechatAction')}
                                                        <select className={`${inputClassName} mt-1.5`} value={contact.wechatAction} onChange={(event) => updateContact(contact.id, 'wechatAction', event.target.value)}>
                                                            <option value="none">{t('admin.contact.wechatActionNone')}</option>
                                                            <option value="url">{t('admin.contact.wechatActionUrl')}</option>
                                                            <option value="copy">{t('admin.contact.wechatActionCopy')}</option>
                                                        </select>
                                                    </label>
                                                    <label className="block text-sm font-medium text-text">
                                                        {t('admin.contact.accountIdentifier')}
                                                        <input className={`${inputClassName} mt-1.5`} value={contact.accountIdentifier} onChange={(event) => updateContact(contact.id, 'accountIdentifier', event.target.value)} maxLength={120} />
                                                        {fieldError(`${contact.id}.accountIdentifier`)}
                                                    </label>
                                                </>
                                            )}

                                            <label className="block text-sm font-medium text-text">
                                                {t('admin.contact.icon')}
                                                <select className={`${inputClassName} mt-1.5`} value={contact.icon} onChange={(event) => updateContact(contact.id, 'icon', event.target.value)}>
                                                    {ICONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
                                                </select>
                                            </label>
                                        </div>

                                        <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
                                            {['footer', 'floating'].map((location) => (
                                                <label key={location} className="inline-flex items-center gap-2 text-sm text-text">
                                                    <input type="checkbox" checked={contact[`${location}Visible`]} onChange={(event) => updateContact(contact.id, `${location}Visible`, event.target.checked)} />
                                                    {t(`admin.contact.${location}Visibility`)}
                                                </label>
                                            ))}
                                            <label className="block text-sm text-text">
                                                {t('admin.contact.footerOrder')}
                                                <input className={`${inputClassName} mt-1.5 w-24`} type="number" min="1" max="100" value={contact.footerOrder} onChange={(event) => updateContact(contact.id, 'footerOrder', Number(event.target.value))} />
                                                {fieldError(`${contact.id}.footerOrder`)}
                                            </label>
                                            <label className="block text-sm text-text">
                                                {t('admin.contact.floatingOrder')}
                                                <input className={`${inputClassName} mt-1.5 w-24`} type="number" min="1" max="100" value={contact.floatingOrder} onChange={(event) => updateContact(contact.id, 'floatingOrder', Number(event.target.value))} />
                                                {fieldError(`${contact.id}.floatingOrder`)}
                                            </label>
                                        </div>
                                    </fieldset>
                                ))}
                            </div>
                        </section>

                        <ContactSettingsPreview settings={draft} language={language} />

                        <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-border bg-background/95 py-4 backdrop-blur">
                            <button type="button" onClick={handleReset} disabled={!dirty || saving} className="inline-flex items-center gap-2 border border-border bg-white px-4 py-2.5 text-sm font-semibold text-text-secondary disabled:cursor-not-allowed disabled:opacity-50">
                                <RotateCcw className="h-4 w-4" />
                                {t('admin.contact.discard')}
                            </button>
                            <button type="submit" disabled={!dirty || saving} className="inline-flex items-center gap-2 bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {saving ? t('admin.contact.saving') : t('admin.contact.save')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </AdminLayout>
    );
};

export default ContactSettingsPage;