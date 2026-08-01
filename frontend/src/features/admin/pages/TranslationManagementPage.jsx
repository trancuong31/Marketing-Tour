import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/layout/AdminLayout';
import SearchBar from '@/components/ui/SearchBar';
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
            await translationService.update(editingItem.id, form);

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
            <div className="flex h-[calc(100dvh-6rem)] flex-col gap-5 overflow-hidden sm:h-[calc(100dvh-5.5rem)]">
                <div className="max-w-xl shrink-0">
                    <SearchBar
                        variant="admin"
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                        onClear={() => setSearch('')}
                        placeholder={t('admin.translations.searchPlaceholder', 'Search key or content...')}
                    />
                    <div>
                        <p className="text-xs text-text-muted">
                            {t('admin.translations.total', '{{count}} keys', { count: pagination.totalItems || 0 })}
                        </p>
                    </div>
                </div>

                <TranslationTable items={items} loading={loading} onEdit={openEdit} onDelete={handleDelete} />

                {pagination.totalPages > 1 && (
                    <div className="flex shrink-0 flex-wrap items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => fetchTranslations(pagination.page - 1)}
                            disabled={loading || pagination.page <= 1}
                            className="rounded-lg border border-border bg-surface p-2.5 text-text-secondary hover:bg-surface-hover disabled:opacity-50"
                            aria-label={t('common.previous', 'Previous')}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        {pageNumbers.map(page => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => fetchTranslations(page)}
                                disabled={loading || page === pagination.page}
                                className={`h-10 w-10 rounded-lg border text-sm font-bold ${
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
                            disabled={loading || pagination.page >= pagination.totalPages}
                            className="rounded-lg border border-border bg-surface p-2.5 text-text-secondary hover:bg-surface-hover disabled:opacity-50"
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
