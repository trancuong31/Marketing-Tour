import { Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const clip = (value) => value || '-';

const TranslationTable = ({ items, onEdit, onDelete }) => {
    const { t } = useTranslation();

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] text-sm">
                    <thead className="border-b border-border bg-surface-alt">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-text-secondary">
                                {t('admin.translations.key', 'Key')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-text-secondary">
                                {t('admin.translations.description', 'Description')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-text-secondary">VI</th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-text-secondary">EN</th>
                            <th className="px-4 py-3 text-left text-xs font-bold uppercase text-text-secondary">ZH</th>
                            <th className="px-4 py-3 text-right text-xs font-bold uppercase text-text-secondary">
                                {t('admin.translations.actions', 'Actions')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id} className="border-b border-border last:border-0 hover:bg-surface-alt/50">
                                <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{item.translation_key}</td>
                                <td className="px-4 py-3 text-text-secondary">{clip(item.description)}</td>
                                <td className="max-w-[220px] px-4 py-3 text-text"><p className="line-clamp-2">{clip(item.vi)}</p></td>
                                <td className="max-w-[220px] px-4 py-3 text-text"><p className="line-clamp-2">{clip(item.en)}</p></td>
                                <td className="max-w-[220px] px-4 py-3 text-text"><p className="line-clamp-2">{clip(item.zh)}</p></td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => onEdit(item)}
                                            className="rounded-lg p-2 text-primary hover:bg-primary/10"
                                            title={t('common.edit', 'Edit')}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDelete(item)}
                                            className="rounded-lg p-2 text-error hover:bg-error/10"
                                            title={t('common.delete', 'Delete')}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {items.length === 0 && (
                <div className="px-4 py-14 text-center text-sm font-medium text-text-muted">
                    {t('admin.translations.empty', 'No translations found')}
                </div>
            )}
        </div>
    );
};

export default TranslationTable;
