import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, MessageSquare, Star, Trash2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import AdminTable from '@/components/ui/AdminTable';
import { getImageUrl } from '@/utils/imageUrl';

const getReviewImages = (images) => {
    if (!images) return [];
    if (Array.isArray(images)) return images;

    try {
        const parsedImages = JSON.parse(images);
        return Array.isArray(parsedImages) ? parsedImages : [];
    } catch {
        return [];
    }
};

const ReviewManagementTable = ({
    reviews,
    totalItems,
    reviewsLoading,
    approvalFilter,
    currentPage,
    totalPages,
    onApprovalFilterChange,
    onPageChange,
    onReply,
    onApprove,
    onDelete,
}) => {
    const { t } = useTranslation();

    const approvalTabs = [
        { value: '', label: t('admin.reviews.filters.all', 'All') },
        { value: '1', label: t('admin.reviews.filters.approved', 'Approved') },
        { value: '0', label: t('admin.reviews.filters.pending', 'Pending') },
    ];

    const columns = [
        {
            key: 'customer',
            header: t('admin.reviews.columns.customer', 'Customer'),
            render: review => <p className="text-sm font-semibold text-text">{review.customer_name}</p>,
        },
        {
            key: 'tour',
            header: 'Tour',
            render: review => (
                <p className="max-w-[200px] truncate text-sm text-text" title={review.Tour?.title}>
                    {review.Tour?.title || t('admin.reviews.deletedTour', 'Deleted')}
                </p>
            ),
        },
        {
            key: 'content',
            header: t('admin.reviews.columns.ratingComment', 'Rating & Comment'),
            cellClassName: 'max-w-sm',
            render: review => {
                const images = getReviewImages(review.images);

                return (
                    <div>
                        <div className="mb-1 flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Star
                                    key={index}
                                    className={`h-3 w-3 ${index < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                                />
                            ))}
                        </div>
                        <p className="line-clamp-2 text-sm italic text-text-muted" title={review.comment}>
                            {review.comment ? `"${review.comment}"` : t('admin.reviews.noComment', '- No comment -')}
                        </p>

                        {review.admin_reply && (
                            <div className="mt-2 rounded border-l-2 border-primary bg-primary/5 p-2 text-xs">
                                <p className="mb-1 flex items-center gap-1 font-bold text-primary">
                                    <MessageSquare className="h-3 w-3" />
                                    {t('admin.reviews.yourReply', 'Your reply:')}
                                </p>
                                <p className="italic text-text-secondary">{review.admin_reply}</p>
                                {review.admin_reply_at && (
                                    <p className="mt-1 text-right text-[10px] text-text-muted">
                                        {format(new Date(review.admin_reply_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                    </p>
                                )}
                            </div>
                        )}

                        {images.length > 0 && (
                            <div className="mt-2 flex gap-1.5">
                                {images.map((image, index) => (
                                    <div key={`${image}-${index}`} className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border transition-transform hover:scale-110">
                                        <img src={getImageUrl(image)} alt={t('admin.reviews.imageAlt', 'Review image')} loading="lazy" className="h-full w-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            key: 'created_at',
            header: t('admin.reviews.columns.createdAt', 'Created at'),
            render: review => (
                <span className="text-xs text-text-muted">
                    {review.created_at ? format(new Date(review.created_at), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'N/A'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: t('admin.reviews.columns.actions', 'Actions'),
            align: 'right',
            render: review => (
                <div className="flex justify-end gap-1.5">
                    <AdminTable.Action
                        icon={MessageSquare}
                        label={t('admin.reviews.actions.reply', 'Reply to review')}
                        tone={review.admin_reply ? 'primary' : 'default'}
                        className={review.admin_reply ? '[&_svg]:fill-primary/20' : ''}
                        onClick={() => onReply(review)}
                    />
                    <AdminTable.Action
                        icon={review.is_approved ? XCircle : CheckCircle2}
                        label={review.is_approved ? t('admin.reviews.actions.unapprove', 'Unapprove') : t('admin.reviews.actions.approve', 'Approve')}
                        tone={review.is_approved ? 'warning' : 'success'}
                        onClick={() => onApprove(review.id, review.is_approved)}
                    />
                    <AdminTable.Action icon={Trash2} label={t('admin.reviews.actions.delete', 'Delete permanently')} tone="danger" onClick={() => onDelete(review.id)} />
                </div>
            ),
        },
    ];

    return (
        <div className="flex min-h-[400px] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-alt p-4">
                <h2 className="flex items-center gap-2 font-bold text-text">
                    {t('admin.reviews.title', 'Review list')} ({totalItems})
                    {reviewsLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                </h2>
                <div className="flex items-center gap-1 rounded-lg bg-surface p-1">
                    {approvalTabs.map(tab => (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => onApprovalFilterChange(tab.value)}
                            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                                approvalFilter === tab.value
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-text-secondary hover:bg-surface-hover hover:text-text'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1">
                <AdminTable
                    columns={columns}
                    rows={reviews}
                    getRowKey={review => review.id}
                    emptyIcon={MessageSquare}
                    emptyMessage={t('admin.reviews.empty', 'No matching reviews')}
                    className="rounded-none border-0 shadow-none"
                    minWidth="900px"
                />
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border bg-surface p-4">
                    <span className="hidden text-sm text-text-muted sm:block">
                        {t('admin.reviews.pagination', 'Page {{current}} / {{total}}', {
                            current: currentPage,
                            total: totalPages,
                        })}
                    </span>
                    <div className="mx-auto flex gap-2 sm:mx-0">
                        <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => onPageChange(currentPage - 1)}
                            className="rounded-lg border border-border p-2 text-text hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }).map((_, index) => {
                                const page = index + 1;

                                return (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => onPageChange(page)}
                                        className={`h-9 w-9 rounded-lg text-sm font-medium ${
                                            currentPage === page
                                                ? 'bg-primary text-white shadow-md'
                                                : 'text-text hover:bg-surface-hover'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            type="button"
                            disabled={currentPage === totalPages}
                            onClick={() => onPageChange(currentPage + 1)}
                            className="rounded-lg border border-border p-2 text-text hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewManagementTable;
