import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { adminService } from '@/services/tourService';
import AdminLayout from '@/components/layout/AdminLayout';
import GuideGrid from '@/features/admin/components/GuideGrid';
import { Languages, Loader2, X } from 'lucide-react';
import { getImageUrl } from '@/utils/imageUrl';

const ADMIN_GUIDE_TEXT = {
    viLabel: 'Ti\u1ebfng Vi\u1ec7t',
    zhLabel: '\u4e2d\u6587',
    uploadImageError: 'L\u1ed7i upload \u1ea3nh b\u00e0i vi\u1ebft',
    vietnameseRequiredBeforeTranslate: 'Vui l\u00f2ng nh\u1eadp ti\u00eau \u0111\u1ec1 v\u00e0 n\u1ed9i dung ti\u1ebfng Vi\u1ec7t tr\u01b0\u1edbc khi d\u1ecbch.',
    translateError: 'Kh\u00f4ng th\u1ec3 d\u1ecbch b\u00e0i vi\u1ebft l\u00fac n\u00e0y.',
    vietnameseRequiredBeforeSave: 'Ti\u00eau \u0111\u1ec1 v\u00e0 n\u1ed9i dung ti\u1ebfng Vi\u1ec7t kh\u00f4ng \u0111\u01b0\u1ee3c b\u1ecf tr\u1ed1ng.',
    saveError: 'L\u1ed7i l\u01b0u b\u00e0i vi\u1ebft',
    pageDescription: 'Qu\u1ea3n l\u00fd danh s\u00e1ch c\u00e1c b\u00e0i vi\u1ebft h\u01b0\u1edbng d\u1eabn du l\u1ecbch tr\u00ean trang web.',
    loading: '\u0110ang t\u1ea3i d\u1eef li\u1ec7u...',
    editTitle: 'Ch\u1ec9nh s\u1eeda b\u00e0i vi\u1ebft',
    createTitle: 'Th\u00eam b\u00e0i vi\u1ebft m\u1edbi',
    editSubtitle: 'C\u1eadp nh\u1eadt n\u1ed9i dung b\u00e0i vi\u1ebft',
    createSubtitle: 'T\u1ea1o b\u00e0i vi\u1ebft h\u01b0\u1edbng d\u1eabn du l\u1ecbch',
    translating: '\u0110ang d\u1ecbch...',
    translateTo: 'D\u1ecbch sang',
    publicLabel: 'Hi\u1ec3n th\u1ecb c\u00f4ng khai',
    publicDescription: 'B\u00e0i vi\u1ebft s\u1ebd xu\u1ea5t hi\u1ec7n tr\u00ean trang ng\u01b0\u1eddi d\u00f9ng',
    cancel: 'H\u1ee7y b\u1ecf',
    updateAction: 'C\u1eadp nh\u1eadt b\u00e0i vi\u1ebft',
    createAction: 'T\u1ea1o b\u00e0i vi\u1ebft',
};

const GUIDE_LANGUAGES = [
    { code: 'vi', label: ADMIN_GUIDE_TEXT.viLabel },
    { code: 'en', label: 'English' },
    { code: 'zh', label: ADMIN_GUIDE_TEXT.zhLabel },
];

const DEFAULT_GUIDE_TRANSLATIONS = [
    { language: 'en', title: '', content: '' },
    { language: 'zh', title: '', content: '' },
];

const mergeGuideTranslations = (translations = []) => (
    DEFAULT_GUIDE_TRANSLATIONS.map(defaultTranslation => {
        const found = translations.find(item => item.language === defaultTranslation.language);
        return {
            ...defaultTranslation,
            title: found?.title || '',
            content: found?.content || '',
        };
    })
);

const getPlainText = (html = '') => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

const ContentManagementPage = () => {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [guideModal, setGuideModal] = useState({ open: false, guide: null });
    const [guideForm, setGuideForm] = useState({
        title: '',
        content: '',
        is_active: 1,
        translations: DEFAULT_GUIDE_TRANSLATIONS,
    });
    const [currentGuideLang, setCurrentGuideLang] = useState('vi');
    const [submitting, setSubmitting] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [ReactQuill, setReactQuill] = useState(null);
    const quillRef = useRef(null);

    useEffect(() => {
        import('react-quill-new').then(mod => setReactQuill(() => mod.default));
        import('react-quill-new/dist/quill.snow.css');
    }, []);
    const handleEditorImageUpload = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('image', file);

            setUploadingImage(true);
            try {
                const res = await adminService.uploadGuideImage(formData);
                const imageUrl = getImageUrl(res.data.data.image_url);
                const editor = quillRef.current?.getEditor();
                const range = editor?.getSelection(true);

                if (editor && range) {
                    editor.insertEmbed(range.index, 'image', imageUrl, 'user');
                    editor.setSelection(range.index + 1);
                }
            } catch (err) {
                alert(err.response?.data?.message || ADMIN_GUIDE_TEXT.uploadImageError);
            } finally {
                setUploadingImage(false);
            }
        };

        input.click();
    }, []);

    const editorModules = useMemo(() => ({
        toolbar: {
            container: [
                [{ header: [1, 2, 3, false] }],
                ['bold', 'italic', 'underline'],
                ['link', 'image'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['clean'],
            ],
            handlers: {
                image: handleEditorImageUpload,
            },
        },
    }), [handleEditorImageUpload]);

    const editorFormats = [
        'header',
        'bold',
        'italic',
        'underline',
        'link',
        'image',
        'list',
        'bullet',
    ];

    const currentTranslationIndex = guideForm.translations.findIndex(item => item.language === currentGuideLang);
    const isVietnameseGuide = currentGuideLang === 'vi';
    const currentGuideTitle = isVietnameseGuide
        ? guideForm.title
        : guideForm.translations[currentTranslationIndex]?.title || '';
    const currentGuideContent = isVietnameseGuide
        ? guideForm.content
        : guideForm.translations[currentTranslationIndex]?.content || '';

    const updateGuideLanguageField = (field, value) => {
        if (isVietnameseGuide) {
            setGuideForm(prev => ({ ...prev, [field]: value }));
            return;
        }

        setGuideForm(prev => ({
            ...prev,
            translations: prev.translations.map(item => (
                item.language === currentGuideLang ? { ...item, [field]: value } : item
            )),
        }));
    };

    const fetchGuides = async () => {
        try {
            const res = await adminService.getGuides();
            setGuides(res.data.data || []);
        } catch { /* ignore */ }
    };

    useEffect(() => {
        setLoading(true);
        fetchGuides().finally(() => setLoading(false));
    }, []);

    // â”€â”€ GUIDES â”€â”€
    const openGuideCreate = () => {
        setCurrentGuideLang('vi');
        setGuideForm({
            title: '',
            content: '',
            is_active: 1,
            translations: DEFAULT_GUIDE_TRANSLATIONS,
        });
        setGuideModal({ open: true, guide: null });
    };

    const openGuideEdit = (guide) => {
        setCurrentGuideLang('vi');
        setGuideForm({
            title: guide.title,
            content: guide.content,
            is_active: guide.is_active,
            translations: mergeGuideTranslations(guide.translations || []),
        });
        setGuideModal({ open: true, guide });
    };

    const closeGuideModal = () => setGuideModal({ open: false, guide: null });

    const handleTranslateGuide = async () => {
        if (currentGuideLang === 'vi' || translating) return;
        if (!guideForm.title.trim() || !getPlainText(guideForm.content)) {
            alert(ADMIN_GUIDE_TEXT.vietnameseRequiredBeforeTranslate);
            return;
        }

        setTranslating(true);
        try {
            const res = await adminService.translateContent({
                texts: {
                    title: guideForm.title,
                    content: guideForm.content,
                },
                targetLang: currentGuideLang,
            });
            const translated = res.data.data || {};

            setGuideForm(prev => ({
                ...prev,
                translations: prev.translations.map(item => (
                    item.language === currentGuideLang
                        ? {
                            ...item,
                            title: translated.title || item.title,
                            content: translated.content || item.content,
                        }
                        : item
                )),
            }));
        } catch (err) {
            alert(err.response?.data?.message || ADMIN_GUIDE_TEXT.translateError);
        } finally {
            setTranslating(false);
        }
    };

    const handleGuideSubmit = async (e) => {
        e.preventDefault();
        if (!guideForm.title.trim() || !getPlainText(guideForm.content)) {
            alert(ADMIN_GUIDE_TEXT.vietnameseRequiredBeforeSave);
            setCurrentGuideLang('vi');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...guideForm,
                title: guideForm.title.trim(),
                translations: guideForm.translations.map(item => ({
                    ...item,
                    title: item.title.trim(),
                })),
            };

            if (guideModal.guide) {
                await adminService.updateGuide(guideModal.guide.id, payload);
            } else {
                await adminService.createGuide(payload);
            }
            closeGuideModal();
            await fetchGuides();
        } catch (err) {
            alert(err.response?.data?.message || ADMIN_GUIDE_TEXT.saveError);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AdminLayout>
            <div className="mb-4">
                <p className="text-sm text-text-muted mt-1">
                    {ADMIN_GUIDE_TEXT.pageDescription}
                </p>
            </div>

            {/* â•â•â• CONTENT â•â•â• */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-text-muted mt-3">{ADMIN_GUIDE_TEXT.loading}</p>
                </div>
            ) : (
                <GuideGrid
                    guides={guides}
                    onCreate={openGuideCreate}
                    onEdit={openGuideEdit}
                />
            )}

            {/* â•â•â• GUIDE MODAL â•â•â• */}
            {guideModal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeGuideModal}
                    />
                    <div className="relative bg-surface rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fade-upanimate-fade-up">
                        {/* Header */}
                        <div className="sticky top-0 bg-surface z-10 px-6 py-4 border-b border-border flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-text">
                                    {guideModal.guide ? ADMIN_GUIDE_TEXT.editTitle : ADMIN_GUIDE_TEXT.createTitle}
                                </h3>
                                <p className="text-xs text-text-muted mt-0.5">
                                    {guideModal.guide ? ADMIN_GUIDE_TEXT.editSubtitle : ADMIN_GUIDE_TEXT.createSubtitle}
                                </p>
                            </div>
                            <button
                                onClick={closeGuideModal}
                                className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                            >
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleGuideSubmit} className="p-6 space-y-5">
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-alt p-2">
                                <div className="flex flex-wrap gap-2">
                                    {GUIDE_LANGUAGES.map(language => (
                                        <button
                                            key={language.code}
                                            type="button"
                                            onClick={() => setCurrentGuideLang(language.code)}
                                            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                                currentGuideLang === language.code
                                                    ? 'bg-primary text-white shadow-sm'
                                                    : 'text-text-secondary hover:bg-white hover:text-primary'
                                            }`}
                                        >
                                            {language.label}
                                        </button>
                                    ))}
                                </div>

                                {currentGuideLang !== 'vi' && (
                                    <button
                                        type="button"
                                        onClick={handleTranslateGuide}
                                        disabled={translating}
                                        className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {translating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                                        {translating ? ADMIN_GUIDE_TEXT.translating : `${ADMIN_GUIDE_TEXT.translateTo} ${GUIDE_LANGUAGES.find(item => item.code === currentGuideLang)?.label}`}
                                    </button>
                                )}
                            </div>

                            {/* Title */}
                            <div>
                                <label className="text-sm font-semibold text-text mb-1.5 block">
                                    Tiêu đề bài viết {currentGuideLang === 'vi' && <span className="text-error">*</span>}
                                </label>
                                <input
                                    value={currentGuideTitle}
                                    onChange={e => updateGuideLanguageField('title', e.target.value)}
                                    placeholder="Nhập tiêu đề bài viết..."
                                    className="w-full px-4 py-3 bg-surface-alt border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition"
                                    required={currentGuideLang === 'vi'}
                                />
                            </div>

                            {/* Content Editor */}
                            <div>
                                <label className="text-sm font-semibold text-text mb-1.5 block">
                                    Nội dung {currentGuideLang === 'vi' && <span className="text-error">*</span>}
                                </label>
                                {ReactQuill ? (
                                    <ReactQuill
                                        ref={quillRef}
                                        theme="snow"
                                        value={currentGuideContent}
                                        onChange={val => updateGuideLanguageField('content', val)}
                                        modules={editorModules}
                                        formats={editorFormats}
                                        className="bg-surface rounded-lg [&_.ql-toolbar]:rounded-t-xl [&_.ql-container]:rounded-b-xl [&_.ql-editor]:min-h-[240px] [&_.ql-toolbar]:border-border [&_.ql-container]:border-border"
                                    />
                                ) : (
                                    <textarea
                                        value={currentGuideContent}
                                        onChange={e => updateGuideLanguageField('content', e.target.value)}
                                        rows={10}
                                        placeholder="Viết nội dung bài hướng dẫn..."
                                        className="w-full px-4 py-3 bg-surface-alt border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition resize-none"
                                    />
                                )}
                                {uploadingImage && (
                                    <p className="mt-2 text-xs font-medium text-primary">Đang tải ảnh lên...</p>
                                )}
                            </div>

                            {/* Active toggle */}
                            <div className="flex items-center gap-3 p-3 bg-surface-alt rounded-lg">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={guideForm.is_active === 1}
                                        onChange={e => setGuideForm(p => ({ ...p, is_active: e.target.checked ? 1 : 0 }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-10 h-5.5 bg-border rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-[18px] after:shadow-sm" />
                                </label>
                                <div>
                                    <p className="text-sm font-medium text-text">{ADMIN_GUIDE_TEXT.publicLabel}</p>
                                    <p className="text-xs text-text-muted">{ADMIN_GUIDE_TEXT.publicDescription}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-3 border-t border-border">
                                <button
                                    type="button"
                                    onClick={closeGuideModal}
                                    className="flex-1 py-3 bg-surface-alt text-text-secondary font-semibold rounded-lg hover:bg-surface-hover transition text-sm"
                                >
                                    {ADMIN_GUIDE_TEXT.cancel}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 text-sm disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {guideModal.guide ? ADMIN_GUIDE_TEXT.updateAction : ADMIN_GUIDE_TEXT.createAction}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default ContentManagementPage;

