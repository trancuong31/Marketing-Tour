import { Edit2, Image, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminTable from '@/components/ui/AdminTable';
import { getImageUrl } from '@/utils/imageUrl';

const formatPrice = (price, language) =>
    new Intl.NumberFormat(language, { style: 'currency', currency: 'VND' }).format(price);

const getMinPrice = (tour) => {
    const prices = (tour.Departures || tour.departures || [])
        .map(departure => Number(departure.price_adult ?? departure.adult_price))
        .filter(price => Number.isFinite(price) && price > 0);
    return prices.length ? Math.min(...prices) : null;
};

const TourManagementTable = ({ tours, onEdit, onDelete }) => {
    const { t, i18n } = useTranslation();

    const statusLabels = {
        active: t('admin.tours.status.active', 'Active'),
        hidden: t('admin.tours.status.hidden', 'Hidden'),
        sold_out: t('admin.tours.status.soldOut', 'Sold out'),
    };

    const columns = [
        {
            key: 'tour',
            header: t('admin.tours.columns.tour', 'Tour'),
            render: (tour) => {
                const imageUrl = getImageUrl(tour.thumbnail_url);

                return (
                    <div className="flex min-w-[260px] items-center gap-3">
                        {tour.thumbnail_url ? (
                            <img src={imageUrl} alt="" loading="lazy" className="h-11 w-16 rounded-lg border border-border object-cover shadow-sm" />
                        ) : (
                            <div className="flex h-11 w-16 items-center justify-center rounded-lg border border-border bg-surface-alt">
                                <Image className="h-4 w-4 text-text-muted" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="line-clamp-2 font-semibold text-text">{tour.title}</p>
                            {tour.tour_badge !== 'none' && (
                                <span className={`mt-1 inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold text-white ${
                                    tour.tour_badge === 'featured' ? 'bg-orange-500' : 'bg-emerald-500'
                                }`}>
                                    {t(`admin.tours.badge.${tour.tour_badge}`, tour.tour_badge)}
                                </span>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            key: 'category',
            header: t('admin.tours.columns.category', 'Category'),
            cellClassName: 'font-medium text-text-secondary',
            render: (tour) => tour.Category?.name || '-',
        },
        {
            key: 'priceFrom',
            header: t('admin.tours.columns.priceFrom', 'Price from'),
            cellClassName: 'whitespace-nowrap font-bold text-primary',
            render: (tour) => {
                const minPrice = getMinPrice(tour);
                return minPrice ? formatPrice(minPrice, i18n.language) : t('admin.tours.noPrice', 'No price');
            },
        },
        {
            key: 'duration',
            header: t('admin.tours.columns.duration', 'Duration'),
            cellClassName: 'whitespace-nowrap font-medium text-text-secondary',
            render: (tour) => (
                tour.duration_days
                    ? t('admin.tours.duration', '{{days}}D{{nights}}N', {
                        days: tour.duration_days,
                        nights: tour.duration_nights || 0,
                    })
                    : '-'
            ),
        },
        {
            key: 'status',
            header: t('admin.tours.columns.status', 'Status'),
            render: (tour) => (
                <AdminTable.StatusBadge tone={tour.status === 'active' ? 'success' : tour.status === 'hidden' ? 'warning' : 'danger'}>
                    {statusLabels[tour.status] || tour.status}
                </AdminTable.StatusBadge>
            ),
        },
        {
            key: 'actions',
            header: t('admin.tours.columns.actions', 'Actions'),
            align: 'right',
            render: (tour) => (
                <div className="flex justify-end gap-1.5">
                    <AdminTable.Action icon={Edit2} label={t('common.edit', 'Edit')} tone="primary" onClick={() => onEdit(tour)} />
                    <AdminTable.Action icon={Trash2} label={t('common.delete', 'Delete')} tone="danger" onClick={() => onDelete(tour.id)} />
                </div>
            ),
        },
    ];

    return (
        <AdminTable
            columns={columns}
            rows={tours}
            getRowKey={tour => tour.id}
            emptyMessage={t('admin.tours.empty', 'No tours found')}
        />
    );
};

export default TourManagementTable;
