import { Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminTable from '@/components/ui/AdminTable';

const clip = (value) => value || '-';

const TranslationTable = ({ items, onEdit, onDelete }) => {
    const { t } = useTranslation();

    const columns = [
        {
            key: 'translation_key',
            header: t('admin.translations.key', 'Key'),
            cellClassName: 'font-mono text-xs font-semibold text-primary',
        },
        {
            key: 'vi',
            header: t('admin.translations.vietnameseShort', 'VI'),
            cellClassName: 'max-w-[220px] text-text',
            render: item => <p className="line-clamp-2">{clip(item.vi)}</p>,
        },
        {
            key: 'en',
            header: t('admin.translations.englishShort', 'EN'),
            cellClassName: 'max-w-[220px] text-text',
            render: item => <p className="line-clamp-2">{clip(item.en)}</p>,
        },
        {
            key: 'zh',
            header: t('admin.translations.chineseShort', 'ZH'),
            cellClassName: 'max-w-[220px] text-text',
            render: item => <p className="line-clamp-2">{clip(item.zh)}</p>,
        },
        {
            key: 'actions',
            header: t('admin.translations.actions', 'Actions'),
            align: 'right',
            render: item => (
                <div className="flex justify-end gap-1.5">
                    <AdminTable.Action icon={Edit2} label={t('common.edit', 'Edit')} tone="primary" onClick={() => onEdit(item)} />
                    <AdminTable.Action icon={Trash2} label={t('common.delete', 'Delete')} tone="danger" onClick={() => onDelete(item)} />
                </div>
            ),
        },
    ];

    return (
        <AdminTable
            columns={columns}
            rows={items}
            getRowKey={item => item.id}
            emptyMessage={t('admin.translations.empty', 'No translations found')}
        />
    );
};

export default TranslationTable;
