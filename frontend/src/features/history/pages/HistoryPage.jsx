import React, { useEffect, useState } from 'react';
import { userService } from '@/services/userService';
import ClientLayout from '@/components/layout/ClientLayout';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import {
    Loader2, Ticket, Calendar, Clock, User, Users, FileText, Ban,
    DollarSign, ChevronRight, Baby, UserCheck, ChevronLeft, Trash2
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const HistoryPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [expandedId, setExpandedId] = useState(null);
    const navigate = useNavigate();

    const fetchBookings = async (page = 1) => {
        try {
            setLoading(true);
            const res = await userService.getBookings(page, ITEMS_PER_PAGE);
            const resData = res.data;
            setBookings(resData?.data || []);
            setTotalPages(resData?.totalPages || 1);
            setCurrentPage(resData?.currentPage || 1);
            setTotalItems(resData?.totalItems || 0);
            setError('');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Lỗi khi lấy lịch sử đặt tour. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings(currentPage);
    }, []);

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages || page === currentPage) return;
        setCurrentPage(page);
        fetchBookings(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const performCancel = async (bookingId) => {
        try {
            await userService.cancelBooking(bookingId);
            toast.success('Hủy booking thành công!');
            setBookings(prevBookings =>
                prevBookings.map(b =>
                    b.id === bookingId ? { ...b, status: 'cancelled' } : b
                )
            );
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Hủy booking thất bại.');
        }
    };

    const handleCancel = (bookingId) => {
        toast('Xác nhận hủy', {
            description: 'Bạn có chắc chắn muốn hủy booking này không? Thao tác không thể hoàn tác.',
            action: {
                label: 'Hủy',
                onClick: () => performCancel(bookingId)
            },
            cancel: {
                label: 'Quay lại'
            },
            duration: 5000,
        });
    };

    const performDelete = async (bookingId) => {
        try {
            await userService.deleteBooking(bookingId);
            toast.success('Xóa lịch sử thành công!');
            setBookings(prevBookings => prevBookings.filter(b => b.id !== bookingId));
            setTotalItems(prev => prev - 1);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Xóa lịch sử thất bại.');
        }
    };

    const handleDelete = (bookingId) => {
        toast('Xác nhận xóa', {
            description: 'Bạn có chắc chắn muốn xóa lịch sử này không?',
            action: {
                label: 'Xóa',
                onClick: () => performDelete(bookingId)
            },
            cancel: {
                label: 'Hủy'
            },
            duration: 5000,
        });
    };

    const formatPrice = (price) => {
        if (!price && price !== 0) return 'Liên hệ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return { bg: '#FEF9C3', text: '#92400E', border: '#FDE68A', icon: '⏳' };
            case 'confirmed':
            case 'contacted': return { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE', icon: '✅' };
            case 'completed':
            case 'approved': return { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB', icon: '📋' };
            case 'cancelled': return { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA', icon: '❌' };
            default: return { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB', icon: '📋' };
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Đang xử lý';
            case 'confirmed':
            case 'contacted': return 'Đã xác nhận';
            case 'completed':
            case 'approved': return 'Hoàn thành';
            case 'cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    const computeTotal = (b) => {
        if (b.total_price && parseFloat(b.total_price) > 0) return parseFloat(b.total_price);
        if (!b.tour) return null;
        const adultCount = b.adult_count || b.number_of_people || 1;
        const childCount = b.child_count || 0;
        const infantCount = b.infant_count || 0;
        const adultPrice = (b.tour.sale_price_adult && parseFloat(b.tour.sale_price_adult) > 0)
            ? parseFloat(b.tour.sale_price_adult) : parseFloat(b.tour.price_adult || 0);
        const childPrice = b.tour.price_child
            ? (b.tour.sale_price_child && parseFloat(b.tour.sale_price_child) < parseFloat(b.tour.price_child)
                ? parseFloat(b.tour.sale_price_child) : parseFloat(b.tour.price_child)) : 0;
        const infantPrice = b.tour.price_infant
            ? (b.tour.sale_price_infant && parseFloat(b.tour.sale_price_infant) < parseFloat(b.tour.price_infant)
                ? parseFloat(b.tour.sale_price_infant) : parseFloat(b.tour.price_infant)) : 0;
        return (adultCount * adultPrice) + (childCount * childPrice) + (infantCount * infantPrice);
    };

    const getDepartureDate = (b) => {
        if (b.departure_date) return b.departure_date;
        if (b.customer_note) {
            const match = b.customer_note.match(/Ngày khởi hành:\s*(\d{4}-\d{2}-\d{2})/);
            if (match) return match[1];
        }
        return null;
    };

    const getPassengers = (b) => {
        if (b.adult_count !== undefined && b.adult_count !== null) {
            return { adults: b.adult_count, children: b.child_count || 0, infants: b.infant_count || 0 };
        }
        let adults = b.number_of_people || 1, children = 0, infants = 0;
        if (b.customer_note) {
            const a = b.customer_note.match(/Người lớn[^:]*:\s*(\d+)/);
            const c = b.customer_note.match(/Trẻ em[^:]*:\s*(\d+)/);
            const i = b.customer_note.match(/Trẻ nhỏ[^:]*:\s*(\d+)/);
            if (a) adults = parseInt(a[1]);
            if (c) children = parseInt(c[1]);
            if (i) infants = parseInt(i[1]);
        }
        return { adults, children, infants };
    };

    const getCleanNote = (b) => {
        if (!b.customer_note) return null;
        const cleaned = b.customer_note
            .replace(/\s*\|\s*Ngày khởi hành:.*$/g, '')
            .replace(/Ngày khởi hành:.*?\|/g, '')
            .replace(/Người lớn[^|]*\|?/g, '')
            .replace(/Trẻ em[^|]*\|?/g, '')
            .replace(/Trẻ nhỏ[^|]*/g, '')
            .replace(/\s*\|\s*/g, ' ')
            .trim();
        return cleaned || null;
    };

    const handleTourClick = (b) => {
        if (b.tour?.slug) navigate(`/tours/${b.tour.slug}`);
        else if (b.tour?.id) navigate(`/tours/${b.tour.id}`);
    };

    /** Build page numbers to show */
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    return (
        <ClientLayout>
            <div className="max-w-5xl mx-auto py-10 px-4 md:px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <Ticket className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Lịch sử đặt tour</h1>
                            <p className="text-gray-500 mt-1">Quản lý và theo dõi các chuyến đi của bạn</p>
                        </div>
                    </div>
                    {totalItems > 0 && (
                        <span className="hidden sm:inline-flex items-center gap-1.5 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                            <Ticket className="w-4 h-4" />
                            {totalItems} booking
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <span className="ml-3 text-lg text-gray-500 font-medium">Đang tải lịch sử...</span>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-2xl shadow-sm text-center">
                        <p className="font-semibold">{error}</p>
                    </div>
                ) : !bookings.length ? (
                    <div className="bg-white border text-center border-gray-100 rounded-3xl p-12 shadow-sm flex flex-col items-center">
                        <img src="/assets/images/empty_booking.svg" alt="Trống" className="w-48 h-48 opacity-50 mb-6 object-contain" onError={(e) => e.target.style.display = 'none'} />
                        <h3 className="text-2xl font-bold text-gray-800">Chưa có chuyến đi nào</h3>
                        <p className="text-gray-500 mt-2 max-w-md">Bạn chưa đặt tour nào. Đừng bỏ lỡ các ưu đãi tuyệt vời, hãy bắt đầu chuyến hành trình của mình ngay hôm nay!</p>
                        <a href="/" className="mt-6 px-6 py-3 bg-primary hover:bg-primary-dark transition text-white rounded-xl font-bold tracking-wide shadow-lg shadow-primary/30">
                            Khám phá tour ngay
                        </a>
                    </div>
                ) : (
                    <>
                        <div className="space-y-6">
                            {bookings.map((b) => {
                                const status = getStatusStyle(b.status);
                                const passengers = getPassengers(b);
                                const departureDate = getDepartureDate(b);
                                const total = computeTotal(b);
                                const cleanNote = getCleanNote(b);
                                const duration = (b.tour?.duration_days && b.tour?.duration_nights)
                                    ? `${b.tour.duration_days} ngày ${b.tour.duration_nights} đêm`
                                    : (b.tour?.duration_days ? `${b.tour.duration_days} ngày` : 'Chưa cập nhật');

                                return (
                                    <div
                                        key={b.id}
                                        id={`booking-${b.id}`}
                                        className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
                                    >
                                        {/* Header */}
                                        <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-100">
                                            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                                                {b.booking_code}
                                            </span>
                                            <span
                                                className="text-xs font-bold px-3 py-1 rounded-md border uppercase tracking-wider"
                                                style={{ backgroundColor: status.bg, color: status.text, borderColor: status.border }}
                                            >
                                                {status.icon} {getStatusText(b.status)}
                                            </span>
                                        </div>

                                        {/* Clickable Tour Block */}
                                        <div
                                            className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => handleTourClick(b)}
                                        >
                                            <h3 className="text-xl font-bold text-gray-900 leading-snug line-clamp-1 mb-2 group-hover:text-primary transition-colors">
                                                {b.tour?.title || 'Tour ưu đãi chưa cập nhật tên'}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-600">
                                                    Khởi hành: {departureDate ? format(new Date(departureDate), 'dd/MM/yyyy') : 'Chưa chọn'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-start gap-3 bg-white">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === b.id ? null : b.id); }}
                                                className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors text-sm"
                                            >
                                                {expandedId === b.id ? 'Thu gọn' : 'Xem chi tiết'}
                                            </button>

                                            {b.status !== 'cancelled' && b.status !== 'completed' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleCancel(b.id); }}
                                                    className="px-4 py-2 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-lg transition-colors text-sm flex items-center gap-1.5"
                                                >
                                                    <Ban className="w-4 h-4" /> Hủy
                                                </button>
                                            )}

                                            {(b.status === 'cancelled' || b.status === 'completed') && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(b.id); }}
                                                    className="px-4 py-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg transition-colors text-sm flex items-center gap-1.5"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Xóa
                                                </button>
                                            )}
                                        </div>

                                        {/* Booking Detail (Expand) */}
                                        {expandedId === b.id && (
                                            <div className="p-6 bg-gray-50 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300" onClick={(e) => e.stopPropagation()}>
                                                <h4 className="font-bold text-gray-900 mb-4 inline-flex items-center gap-2">
                                                    <span className="text-primary text-xs">▼</span> Chi tiết đặt tour
                                                </h4>

                                                <p className="text-sm font-semibold text-gray-900 mb-6">Tên tour: {b.tour?.title || 'Chưa cập nhật'}</p>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                    {/* Chi tiết tour */}
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">📍 Chi tiết tour</p>
                                                        <div className="space-y-1">
                                                            <p className="text-sm text-gray-700"><span className="text-gray-500">Khởi hành:</span> {departureDate ? format(new Date(departureDate), 'dd/MM/yyyy') : 'Chưa chọn'}</p>
                                                            <p className="text-sm text-gray-700"><span className="text-gray-500">Thời lượng:</span> {duration}</p>
                                                            <p className="text-sm text-gray-700"><span className="text-gray-500">Điểm đón:</span> {b.pickupLocation?.location_name || 'Không có'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Hành khách */}
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">👥 Hành khách</p>
                                                        <div className="space-y-1">
                                                            <p className="text-sm text-gray-700"><span className="text-gray-500">Người lớn:</span> {passengers.adults}</p>
                                                            <p className="text-sm text-gray-700"><span className="text-gray-500">Trẻ em:</span> {passengers.children}</p>
                                                            <p className="text-sm text-gray-700"><span className="text-gray-500">Trẻ nhỏ:</span> {passengers.infants}</p>
                                                        </div>
                                                    </div>

                                                    {/* Người liên hệ */}
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">📞 Người liên hệ</p>
                                                        <div className="space-y-1">
                                                            <p className="text-sm text-gray-700">{b.customer_name}</p>
                                                            <p className="text-sm text-gray-700">{b.customer_phone}</p>
                                                            <p className="text-sm text-gray-700">{b.customer_email}</p>
                                                        </div>
                                                    </div>

                                                    {/* Ngày đặt & Tổng tiền */}
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">📅 Ngày đặt</p>
                                                        <p className="text-sm text-gray-700 mb-4">{b.created_at ? format(new Date(b.created_at), 'dd/MM/yyyy') : 'N/A'}</p>
                                                        <div className="bg-primary/5 border border-primary/10 rounded-xl p-3">
                                                            <p className="text-[10px] font-bold text-primary/70 uppercase tracking-wider mb-1 flex items-center gap-1">💰 Tổng tiền</p>
                                                            <p className="text-xl font-black text-primary">{total !== null ? formatPrice(total) : 'Liên hệ'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {cleanNote && (
                                                    <div className="mt-6 p-4 bg-white rounded-xl border border-gray-100">
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                            <FileText className="w-3 h-3" /> Ghi chú từ bạn
                                                        </p>
                                                        <p className="text-sm text-gray-800 italic">"{cleanNote}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* ═══ PAGINATION ═══ */}
                        {totalPages > 1 && (
                            <div className="mt-10 flex items-center justify-center gap-2">
                                {/* Prev */}
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span className="hidden sm:inline">Trước</span>
                                </button>

                                {/* Page numbers */}
                                {getPageNumbers()[0] > 1 && (
                                    <>
                                        <button
                                            onClick={() => handlePageChange(1)}
                                            className="w-10 h-10 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                                        >
                                            1
                                        </button>
                                        {getPageNumbers()[0] > 2 && (
                                            <span className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">…</span>
                                        )}
                                    </>
                                )}

                                {getPageNumbers().map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`w-10 h-10 rounded-xl text-sm font-semibold border transition-all ${
                                            page === currentPage
                                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-105'
                                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                                    <>
                                        {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                                            <span className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">…</span>
                                        )}
                                        <button
                                            onClick={() => handlePageChange(totalPages)}
                                            className="w-10 h-10 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                                        >
                                            {totalPages}
                                        </button>
                                    </>
                                )}

                                {/* Next */}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200"
                                >
                                    <span className="hidden sm:inline">Sau</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Page info */}
                        {totalPages > 1 && (
                            <p className="mt-3 text-center text-xs text-gray-400">
                                Trang {currentPage} / {totalPages} • Tổng {totalItems} booking
                            </p>
                        )}
                    </>
                )}
            </div>
        </ClientLayout>
    );
};

export default HistoryPage;