import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const emptyForm = {
    translation_key: '',
    description: '',
    vi: '',
    en: '',
    zh: '',
};

const TranslationEditorModal = ({ translation, saving, onClose, onSubmit }) => {
    const { t } = useTranslation();
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        setForm(translation ? {
            translation_key: translation.translation_key || '',
            description: translation.description || '',
            vi: translation.vi || '',
            en: translation.en || '',
            zh: translation.zh || '',
        } : emptyForm);
    }, [translation]);

    const updateField = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(form);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <form
                onSubmit={handleSubmit}
                className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface shadow-2xl border border-border"
            >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-5 py-4">
                    <div>
                        <h3 className="text-lg font-bold text-text">
                            {translation
                                ? t('admin.translations.editTitle', 'Edit translation')
                                : t('admin.translations.createTitle', 'Create translation')}
                        </h3>
                        <p className="mt-1 text-xs text-text-muted">
                            {t('admin.translations.editorHint', 'Values saved here override local JSON translations.')}
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-surface-hover">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4 p-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <label className="block">
                            <span className="mb-1 block text-sm font-semibold text-text">
                                {t('admin.translations.key', 'Key')} *
                            </span>
                            <input
                                value={form.translation_key}
                                onChange={event => updateField('translation_key', event.target.value)}
                                placeholder="common.save"
                                pattern="(?:[A-Za-z0-9_.]|-){2,160}"
                                maxLength={160}
                                required
                                className="w-full rounded-xl border border-border bg-surface-alt px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-1 block text-sm font-semibold text-text">
                                {t('admin.translations.description', 'Description')}
                            </span>
                            <input
                                value={form.description}
                                onChange={event => updateField('description', event.target.value)}
                                maxLength={255}
                                className="w-full rounded-xl border border-border bg-surface-alt px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </label>
                    </div>

                    {[
                        ['vi', t('admin.translations.vietnamese', 'Vietnamese')],
                        ['en', t('admin.translations.english', 'English')],
                        ['zh', t('admin.translations.chinese', 'Chinese')],
                    ].map(([field, label]) => (
                        <label key={field} className="block">
                            <span className="mb-1 block text-sm font-semibold text-text">{label}</span>
                            <textarea
                                value={form[field]}
                                onChange={event => updateField(field, event.target.value)}
                                maxLength={5000}
                                rows={3}
                                className="w-full resize-y rounded-xl border border-border bg-surface-alt px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </label>
                    ))}
                </div>

                <div className="sticky bottom-0 flex justify-end gap-3 border-t border-border bg-surface px-5 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl bg-surface-alt px-5 py-2.5 text-sm font-bold text-text-secondary hover:bg-surface-hover"
                    >
                        {t('common.cancel', 'Cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-primary-dark disabled:opacity-60"
                    >
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                        {t('common.save', 'Save')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TranslationEditorModal;
