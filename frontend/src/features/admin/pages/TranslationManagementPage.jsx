import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/layout/AdminLayout';
import TranslationEditorModal from '@/features/admin/components/TranslationEditorModal';
import TranslationTable from '@/features/admin/components/TranslationTable';
import { translationService } from '@/services/translationService';
import { reloadDbTranslations } from '@/i18n';

const PAGE_SIZE = 50;

const TranslationManagementPage = () => {
    const { t } = useTranslation();
    const [items, setItems] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchTranslations = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await translationService.getAll({
                page,
                limit: PAGE_SIZE,
                search: debouncedSearch,
            });
            setItems(response.data.data.items || []);
            setPagination(response.data.data.pagination || { page, totalPages: 1, totalItems: 0 });
        } catch (error) {
            toast.error(error.response?.data?.message || t('admin.translations.loadError', 'Unable to load translations'));
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, t]);

    useEffect(() => {
        fetchTranslations(1);
    }, [fetchTranslations]);

    const pageNumbers = useMemo(() => {
        const total = pagination.totalPages || 1;
        const current = pagination.page || 1;
        const start = Math.max(1, current - 2);
        const end = Math.min(total, start + 4);

        return Array.from({ length: end - start + 1 }, (_, index) => start + index);
    }, [pagination]);

    const openCreate = () => {
        setEditingItem(null);
        setIsEditorOpen(true);
    };

    const openEdit = (item) => {
        setEditingItem(item);
        setIsEditorOpen(true);
    };

    const closeEditor = () => {
        setEditingItem(null);
        setIsEditorOpen(false);
    };

    const handleSubmit = async (form) => {
        setSaving(true);
        try {
            if (editingItem) {
                await translationService.update(editingItem.id, form);
            } else {
                await translationService.create(form);
            }

            await reloadDbTranslations();
            closeEditor();
            await fetchTranslations(pagination.page);
            toast.success(t('admin.translations.saveSuccess', 'Translation saved'));
        } catch (error) {
            toast.error(error.response?.data?.message || t('admin.translations.saveError', 'Unable to save translation'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (item) => {
        toast(t('admin.translations.confirmDelete', 'Delete this translation?'), {
            description: item.translation_key,
            action: {
                label: t('common.delete', 'Delete'),
                onClick: async () => {
                    try {
                        await translationService.remove(item.id);
                        await reloadDbTranslations();
                        await fetchTranslations(pagination.page);
                        toast.success(t('admin.translations.deleteSuccess', 'Translation deleted'));
                    } catch (error) {
                        toast.error(error.response?.data?.message || t('admin.translations.deleteError', 'Unable to delete translation'));
                    }
                },
            },
            cancel: {
                label: t('common.cancel', 'Cancel'),
            },
        });
    };

    return (
        <AdminLayout>
            <div className="space-y-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm text-text-muted">
                            {t('admin.translations.subtitle', 'Quản lý Translate VI,EN,ZH')}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                            {t('admin.translations.total', '{{count}} keys', { count: pagination.totalItems || 0 })}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-primary-dark"
                    >
                        <Plus className="h-4 w-4" />
                        {t('admin.translations.add', 'Add key')}
                    </button>
                </div>

                <div className="relative max-w-xl">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                        placeholder={t('admin.translations.searchPlaceholder', 'Search key or content...')}
                        className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <TranslationTable items={items} onEdit={openEdit} onDelete={handleDelete} />
                )}

                {!loading && pagination.totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => fetchTranslations(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="rounded-xl border border-border bg-surface p-2.5 text-text-secondary hover:bg-surface-hover disabled:opacity-50"
                            aria-label={t('common.previous', 'Previous')}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        {pageNumbers.map(page => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => fetchTranslations(page)}
                                className={`h-10 w-10 rounded-xl border text-sm font-bold ${
                                    page === pagination.page
                                        ? 'border-primary bg-primary text-white'
                                        : 'border-border bg-surface text-text-secondary hover:bg-surface-hover'
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={() => fetchTranslations(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="rounded-xl border border-border bg-surface p-2.5 text-text-secondary hover:bg-surface-hover disabled:opacity-50"
                            aria-label={t('common.next', 'Next')}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            {isEditorOpen && (
                <TranslationEditorModal
                    translation={editingItem}
                    saving={saving}
                    onClose={closeEditor}
                    onSubmit={handleSubmit}
                />
            )}
        </AdminLayout>
    );
};

export default TranslationManagementPage;
