import { CheckCircle2, ChevronLeft, ChevronRight, Clock, Eye, Loader2, Search, Trash2, Users, XCircle } from 'lucide-react';
import AdminTable from '@/components/ui/AdminTable';

const statusConfig = {
    pending: { label: 'Đang chờ', className: 'bg-warning/10 text-warning border-warning/20', icon: Clock },
    approved: { label: 'Đã duyệt', className: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
    cancelled: { label: 'Đã hủy', className: 'bg-error/10 text-error border-error/20', icon: XCircle },
};

const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const getTotalPeople = (booking) =>
    (booking.adult_qty || 0) + (booking.child_qty || 0) + (booking.infant_qty || 0);

const BookingManagementTable = ({
    bookings,
    currentPage,
    totalPages,
    totalItems,
    selectedTour,
    loading = false,
    updating,
    getPageNumbers,
    onPageChange,
    onShowDetail,
    onApprove,
    onDelete,
    onClearFilters,
}) => {
    const columns = [
        {
            key: 'booking',
            header: 'Ma don / Ngay',
            cellClassName: 'whitespace-nowrap',
            render: booking => (
                <div className="flex flex-col">
                    <button
                        type="button"
                        className="w-fit font-mono font-bold text-primary transition-colors hover:text-primary-dark"
                        onClick={() => onShowDetail(booking)}
                    >
                        {booking.booking_code}
                    </button>
                    <span className="mt-1 flex items-center gap-1 text-[10px] text-text-muted">
                        <Clock className="h-3 w-3" />
                        {new Date(booking.created_at).toLocaleDateString('vi-VN')}
                    </span>
                </div>
            ),
        },
        {
            key: 'customer',
            header: 'Khach hang',
            render: booking => (
                <div className="flex flex-col">
                    <span className="font-semibold text-text">{booking.customer_name}</span>
                    <span className="text-xs text-text-muted">{booking.customer_phone}</span>
                </div>
            ),
        },
        !selectedTour && {
            key: 'tour',
            header: 'Tour',
            headerClassName: 'hidden md:table-cell',
            cellClassName: 'hidden max-w-[200px] md:table-cell',
            render: booking => (
                <div>
                    <p className="truncate font-medium text-text">
                        {booking.Tour?.title || booking.tour_title_snapshot || 'Tour chua cap nhat ten'}
                    </p>
                    {(booking.departure || booking.departure_date_snapshot) && (
                        <span className="mt-1 inline-block rounded border border-primary/10 bg-primary/5 px-1.5 py-0.5 text-[10px] text-primary">
                            Khoi hanh: {new Date(booking.departure?.departure_date || booking.departure_date_snapshot).toLocaleDateString('vi-VN')}
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: 'people',
            header: 'Khach',
            headerClassName: 'hidden sm:table-cell',
            cellClassName: 'hidden sm:table-cell',
            render: booking => (
                <div>
                    <div className="flex items-center gap-2 text-text-secondary">
                        <Users className="h-4 w-4 text-primary/60" />
                        <span className="font-medium">{getTotalPeople(booking)}</span>
                    </div>
                    <div className="mt-1 flex gap-1 text-[10px] text-text-muted">
                        <span>{booking.adult_qty}NL</span>
                        {booking.child_qty > 0 && <span>- {booking.child_qty}TE</span>}
                        {booking.infant_qty > 0 && <span>- {booking.infant_qty}EB</span>}
                    </div>
                </div>
            ),
        },
        {
            key: 'total',
            header: 'Tong tien',
            headerClassName: 'hidden lg:table-cell',
            cellClassName: 'hidden whitespace-nowrap lg:table-cell',
            render: booking => <span className="text-base font-bold text-primary">{formatPrice(booking.total_price)}</span>,
        },
        {
            key: 'status',
            header: 'Trang thai',
            render: booking => {
                const status = statusConfig[booking.status] || statusConfig.pending;
                const StatusIcon = status.icon;

                return (
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${status.className}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        <span className="text-[11px] font-bold uppercase tracking-tighter">{status.label}</span>
                    </span>
                );
            },
        },
        {
            key: 'actions',
            header: 'Hanh dong',
            align: 'right',
            cellClassName: 'whitespace-nowrap',
            render: booking => (
                <div className="flex justify-end gap-1.5">
                    <AdminTable.Action icon={Eye} label="Xem chi tiet" onClick={() => onShowDetail(booking)} />
                    {booking.status === 'pending' && (
                        <AdminTable.Action
                            icon={updating === booking.id ? Loader2 : CheckCircle2}
                            label="Duyet"
                            tone="success"
                            className={updating === booking.id ? '[&_svg]:animate-spin' : ''}
                            disabled={updating === booking.id}
                            onClick={() => onApprove(booking.id)}
                        />
                    )}
                    {booking.status === 'cancelled' && (
                        <AdminTable.Action icon={Trash2} label="Xoa" tone="danger" onClick={() => onDelete(booking.id)} />
                    )}
                </div>
            ),
        },
    ].filter(Boolean);

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
            <AdminTable
                columns={columns}
                rows={bookings}
                getRowKey={booking => booking.id}
                emptyIcon={Search}
                emptyMessage="Khong tim thay don hang nao phu hop"
                emptyAction={(
                    <button type="button" onClick={onClearFilters} className="text-sm font-semibold text-primary hover:underline">
                        Xoa tat ca bo loc
                    </button>
                )}
                minWidth="920px"
                className="min-h-0 flex-1"
                scrollable
                loading={loading}
            />

            {totalPages > 1 && (
                <div className="flex shrink-0 flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface p-4 sm:flex-row">

                    <div className="order-1 flex items-center gap-1.5 sm:order-2">
                        <button
                            type="button"
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={loading || currentPage === 1}
                            className="rounded-lg border border-border bg-surface p-2 text-text-secondary transition-all hover:bg-surface-hover disabled:opacity-50"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-1">
                            {getPageNumbers().map(page => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => onPageChange(page)}
                                    disabled={loading || page === currentPage}
                                    className={`h-10 min-w-[40px] rounded-lg border text-sm font-bold transition-all ${
                                        page === currentPage
                                            ? 'border-primary bg-primary text-white shadow-lg shadow-primary/25'
                                            : 'border-border bg-surface text-text-secondary hover:bg-surface-hover'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={loading || currentPage === totalPages}
                            className="rounded-lg border border-border bg-surface p-2 text-text-secondary transition-all hover:bg-surface-hover disabled:opacity-50"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingManagementTable;
