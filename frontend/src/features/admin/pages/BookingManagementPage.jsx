import { useState, useEffect } from 'react';
import { adminService } from '@/services/tourService';
import AdminLayout from '@/components/layout/AdminLayout';
import { Loader2, Phone, Mail, Calendar, X, CheckCircle2, Eye, Filter, Users } from 'lucide-react';

const statusConfig = {
    pending:   { label: 'Đang chờ',   className: 'bg-warning/10 text-warning border-warning/20' },
    contacted: { label: 'Đã liên hệ', className: 'bg-info/10 text-info border-info/20' },
    approved:  { label: 'Đã duyệt',   className: 'bg-success/10 text-success border-success/20' },
    cancelled: { label: 'Đã hủy',     className: 'bg-error/10 text-error border-error/20' },
};

const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const ITEMS_PER_PAGE = 10;

const BookingManagementPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [detail, setDetail] = useState(null);
    const [updating, setUpdating] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                ...(filter ? { status: filter } : {})
            };
            const res = await adminService.getBookings(params);
            setBookings(res.data.data || []);
            setTotalPages(res.data.totalPages || 1);
            setTotalItems(res.data.totalItems || 0);
        } catch (err) {
            console.error('Lỗi tải đơn:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { setCurrentPage(1); }, [filter]);
    useEffect(() => { fetchBookings(); }, [filter, currentPage]);

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages || page === currentPage) return;
        setCurrentPage(page);
    };

    const handleDeleteBooking = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đơn đặt này?')) return;
        try {
            await adminService.deleteBooking(id);
            await fetchBookings();
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi xóa đơn');
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    const handleUpdateStatus = async (id, status) => {
        setUpdating(id);
        try {
            await adminService.updateBookingStatus(id, { status });
            await fetchBookings();
            if (detail?.id === id) {
                setDetail(prev => ({ ...prev, status }));
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi cập nhật');
        } finally {
            setUpdating(null);
        }
    };

    return (
        <AdminLayout>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
                <Filter className="w-4 h-4 text-text-muted" />
                {['', 'pending', 'contacted', 'approved', 'cancelled'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                            filter === status
                                ? 'bg-primary text-white'
                                : 'bg-surface-alt text-text-secondary hover:bg-surface-hover'
                        }`}
                    >
                        {status === '' ? 'Tất cả' : statusConfig[status]?.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : (
                <div className="bg-surface rounded-xl border border-border overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-surface-alt border-b border-border">
                                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Mã đơn</th>
                                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Khách hàng</th>
                                <th className="px-4 py-3 text-left font-semibold text-text-secondary hidden md:table-cell">Tour</th>
                                <th className="px-4 py-3 text-left font-semibold text-text-secondary hidden sm:table-cell">Hành khách</th>
                                <th className="px-4 py-3 text-left font-semibold text-text-secondary hidden lg:table-cell">Tổng tiền</th>
                                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Trạng thái</th>
                                <th className="px-4 py-3 text-right font-semibold text-text-secondary">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(booking => {
                                const status = statusConfig[booking.status] || statusConfig.pending;
                                const totalPeople = (booking.adult_qty || 0) + (booking.child_qty || 0) + (booking.infant_qty || 0);
                                return (
                                    <tr key={booking.id} className="border-b border-border last:border-0 hover:bg-surface-alt/50 transition">
                                        <td className="px-4 py-3">
                                            <span className="font-mono font-semibold text-primary text-xs">{booking.booking_code}</span>
                                            <p className="text-xs text-text-muted mt-0.5">
                                                {new Date(booking.created_at).toLocaleDateString('vi-VN')}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-text">{booking.customer_name}</p>
                                            <p className="text-xs text-text-muted">{booking.customer_phone}</p>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <p className="text-text truncate max-w-[200px]">{booking.Tour?.title}</p>
                                            {booking.departure && (
                                                <p className="text-xs text-text-muted mt-0.5">
                                                    Khởi hành: {new Date(booking.departure.departure_date).toLocaleDateString('vi-VN')}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <div className="flex items-center gap-1 text-text-secondary">
                                                <Users className="w-3.5 h-3.5" />
                                                <span>{totalPeople}</span>
                                            </div>
                                            <p className="text-xs text-text-muted">
                                                {booking.adult_qty}NL {booking.child_qty > 0 ? `${booking.child_qty}TE ` : ''}{booking.infant_qty > 0 ? `${booking.infant_qty}EB` : ''}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <span className="font-semibold text-primary">{formatPrice(booking.total_price)}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${status.className}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => setDetail(booking)}
                                                    className="p-1.5 rounded-lg hover:bg-surface-hover transition"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="w-4 h-4 text-text-muted" />
                                                </button>
                                                {booking.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(booking.id, 'approved')}
                                                        disabled={updating === booking.id}
                                                        className="p-1.5 rounded-lg hover:bg-success/10 transition"
                                                        title="Duyệt"
                                                    >
                                                        {updating === booking.id
                                                            ? <Loader2 className="w-4 h-4 animate-spin text-success" />
                                                            : <CheckCircle2 className="w-4 h-4 text-success" />
                                                        }
                                                    </button>
                                                )}
                                                {booking.status === 'cancelled' && (
                                                    <button
                                                        onClick={() => handleDeleteBooking(booking.id)}
                                                        className="p-1.5 rounded-lg hover:bg-error/10 transition"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-error" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {bookings.length === 0 && (
                        <div className="text-center py-12 text-text-muted">Không có đơn đặt nào</div>
                    )}
                </div>
            )}

            {/* Pagination Logic */}
            {!loading && totalPages > 1 && (
                <div className="mt-8 flex flex-col items-center">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xl border border-border bg-surface text-text-secondary hover:bg-surface-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Trước</span>
                        </button>

                        {getPageNumbers().map(page => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`w-10 h-10 rounded-xl text-sm font-semibold border transition ${
                                    page === currentPage
                                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105'
                                        : 'bg-surface border-border text-text-secondary hover:bg-surface-hover'
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xl border border-border bg-surface text-text-secondary hover:bg-surface-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="hidden sm:inline">Sau</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="mt-3 text-xs text-text-muted">
                        Trang {currentPage} / {totalPages} • Tổng {totalItems} đơn đặt
                    </p>
                </div>
            )}

            {/* ═══ DETAIL POPUP ═══ */}
            {detail && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDetail(null)} />
                    <div className="relative bg-surface rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-fade-up max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setDetail(null)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-surface-hover">
                            <X className="w-5 h-5 text-text-muted" />
                        </button>

                        <h3 className="text-lg font-bold text-text mb-4">Chi tiết đơn đặt</h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between p-3 bg-surface-alt rounded-xl">
                                <span className="text-text-secondary">Mã đơn</span>
                                <span className="font-mono font-bold text-primary">{detail.booking_code}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-surface-alt rounded-xl">
                                <span className="text-text-secondary">Tour</span>
                                <span className="font-medium text-text text-right max-w-[60%]">{detail.Tour?.title}</span>
                            </div>
                            {detail.departure && (
                                <div className="flex justify-between p-3 bg-surface-alt rounded-xl">
                                    <span className="text-text-secondary flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Ngày khởi hành</span>
                                    <span className="font-medium text-text">
                                        {new Date(detail.departure.departure_date).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between p-3 bg-surface-alt rounded-xl">
                                <span className="text-text-secondary">Khách hàng</span>
                                <span className="font-medium text-text">{detail.customer_name}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-surface-alt rounded-xl">
                                <span className="text-text-secondary flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> SĐT</span>
                                <a href={`tel:${detail.customer_phone}`} className="font-semibold text-primary hover:underline">
                                    {detail.customer_phone}
                                </a>
                            </div>
                            <div className="flex justify-between p-3 bg-surface-alt rounded-xl">
                                <span className="text-text-secondary flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email</span>
                                <span className="text-text">{detail.customer_email}</span>
                            </div>

                            {/* Hành khách */}
                            <div className="p-3 bg-surface-alt rounded-xl">
                                <span className="text-text-secondary block mb-2">Hành khách</span>
                                <div className="flex gap-4 text-text">
                                    <span>{detail.adult_qty} Người lớn</span>
                                    {detail.child_qty > 0 && <span>{detail.child_qty} Trẻ em</span>}
                                    {detail.infant_qty > 0 && <span>{detail.infant_qty} Em bé</span>}
                                </div>
                            </div>

                            {/* Điểm đón */}
                            {detail.pickupLocation && (
                                <div className="flex justify-between p-3 bg-surface-alt rounded-xl">
                                    <span className="text-text-secondary">Điểm đón</span>
                                    <span className="text-text">
                                        {detail.pickupLocation.location_name}
                                        {parseFloat(detail.pickupLocation.surcharge_amount) > 0 && (
                                            <span className="text-xs text-text-muted ml-1">(+{formatPrice(detail.pickupLocation.surcharge_amount)}/người)</span>
                                        )}
                                    </span>
                                </div>
                            )}

                            {/* Booking Options */}
                            {detail.bookingOptions?.length > 0 && (
                                <div className="p-3 bg-surface-alt rounded-xl">
                                    <span className="text-text-secondary block mb-2">Dịch vụ thêm</span>
                                    <div className="space-y-1">
                                        {detail.bookingOptions.map((opt, idx) => (
                                            <div key={idx} className="flex justify-between text-text text-xs">
                                                <span>{opt.option_name} ×{opt.quantity}</span>
                                                <span className="font-medium">{formatPrice(opt.total)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {detail.customer_note && (
                                <div className="p-3 bg-surface-alt rounded-xl">
                                    <span className="text-text-secondary block mb-1">Ghi chú</span>
                                    <p className="text-text">{detail.customer_note}</p>
                                </div>
                            )}

                            {/* Tổng tiền */}
                            <div className="flex justify-between p-3 bg-primary/5 border border-primary/20 rounded-xl">
                                <span className="font-bold text-primary">Tổng tiền</span>
                                <span className="font-bold text-primary text-lg">{formatPrice(detail.total_price)}</span>
                            </div>

                            <div className="flex justify-between p-3 bg-surface-alt rounded-xl">
                                <span className="text-text-secondary">Trạng thái</span>
                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${statusConfig[detail.status]?.className}`}>
                                    {statusConfig[detail.status]?.label}
                                </span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 mt-5">
                            {detail.status === 'cancelled' && (
                                <button
                                    onClick={() => { handleDeleteBooking(detail.id); setDetail(null); }}
                                    className="flex-1 py-2.5 bg-error/10 text-error font-semibold rounded-xl hover:bg-error hover:text-white transition text-sm flex justify-center items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Xóa đơn
                                </button>
                            )}
                            {detail.status !== 'approved' && detail.status !== 'cancelled' && (
                                <button
                                    onClick={() => { handleUpdateStatus(detail.id, 'approved'); setDetail(null); }}
                                    className="flex-1 py-2.5 bg-success text-white font-semibold rounded-xl hover:opacity-90 transition text-sm"
                                >
                                    Duyệt đơn
                                </button>
                            )}
                            {detail.status !== 'cancelled' && (
                                <button
                                    onClick={() => { handleUpdateStatus(detail.id, 'cancelled'); setDetail(null); }}
                                    className="flex-1 py-2.5 bg-error text-white font-semibold rounded-xl hover:opacity-90 transition text-sm"
                                >
                                    Hủy đơn
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default BookingManagementPage;
