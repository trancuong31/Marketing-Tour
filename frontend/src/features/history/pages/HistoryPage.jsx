import React, { useEffect, useState } from 'react';
import { userService } from '@/services/userService';
import ClientLayout from '@/components/layout/ClientLayout';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import {
    Loader2, Ticket, Calendar, Clock, User, Users, FileText, Ban,
    DollarSign, ChevronRight, Baby, UserCheck, ChevronLeft
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const HistoryPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
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

    const handleCancel = async (bookingId) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy booking này không? Thao tác không thể hoàn tác.')) return;

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
            case 'approved': return { bg: '#D1FAE5', text: '#065F46', border: '#A7F3D0', icon: '🎉' };
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
                                const totalPeople = passengers.adults + passengers.children + passengers.infants;

                                return (
                                    <div
                                        key={b.id}
                                        id={`booking-${b.id}`}
                                        className="bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                                    >
                                        {/* Top bar */}
                                        <div className="flex items-center justify-between px-6 py-3 bg-gray-50/70 border-b border-gray-100">
                                            <span className="text-xs font-bold px-3 py-1 bg-gray-200 text-gray-600 rounded-lg uppercase tracking-wider">
                                                {b.booking_code}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="text-xs text-gray-500">
                                                    {b.created_at ? format(new Date(b.created_at), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'N/A'}
                                                </span>
                                                <span
                                                    className="text-xs font-bold px-3 py-1 rounded-lg border uppercase tracking-wider ml-2"
                                                    style={{ backgroundColor: status.bg, color: status.text, borderColor: status.border }}
                                                >
                                                    {status.icon} {getStatusText(b.status)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Main content */}
                                        <div className="flex flex-col md:flex-row">
                                            {/* Left: Tour info */}
                                            <div className="p-6 md:w-[55%] md:border-r border-gray-100">
                                                {/* 1. Tên tour (click được) */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleTourClick(b)}
                                                    className="group text-left w-full mb-4"
                                                    disabled={!b.tour?.slug && !b.tour?.id}
                                                >
                                                    <h3 className="text-xl font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
                                                        {b.tour?.title || 'Tour ưu đãi chưa cập nhật tên'}
                                                        {(b.tour?.slug || b.tour?.id) && (
                                                            <ChevronRight className="inline-block w-5 h-5 ml-1 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                                                        )}
                                                    </h3>
                                                </button>

                                                {/* 2. Số người */}
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Users className="w-4 h-4 text-primary/60" />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        Số người: <span className="font-bold text-gray-900">{totalPeople} khách</span>
                                                    </span>
                                                </div>

                                                {/* 3. Ngày khởi hành | Người lớn | Trẻ em | Trẻ nhỏ */}
                                                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                            <div>
                                                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Khởi hành</p>
                                                                <p className="text-sm font-bold text-gray-800">
                                                                    {departureDate ? format(new Date(departureDate), 'dd/MM/yyyy') : 'Chưa chọn'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <UserCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                            <div>
                                                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Người lớn</p>
                                                                <p className="text-sm font-bold text-gray-800">{passengers.adults}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                                            <div>
                                                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Trẻ em</p>
                                                                <p className="text-sm font-bold text-gray-800">{passengers.children}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Baby className="w-4 h-4 text-pink-500 flex-shrink-0" />
                                                            <div>
                                                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Trẻ nhỏ</p>
                                                                <p className="text-sm font-bold text-gray-800">{passengers.infants}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 4. Tổng tiền ước tính */}
                                                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/10">
                                                    <DollarSign className="w-5 h-5 text-primary" />
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng tiền ước tính</p>
                                                        <p className="text-xl font-black text-primary">
                                                            {total !== null ? formatPrice(total) : 'Liên hệ'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Contact info + actions */}
                                            <div className="p-6 md:w-[45%] flex flex-col justify-between bg-white">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                            <User className="w-3 h-3" /> Người liên hệ
                                                        </p>
                                                        <p className="text-sm font-semibold text-gray-900">{b.customer_name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Số điện thoại</p>
                                                        <p className="text-sm font-semibold text-gray-900">{b.customer_phone}</p>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email liên hệ</p>
                                                        <p className="text-sm font-semibold text-gray-900">{b.customer_email}</p>
                                                    </div>
                                                    {cleanNote && (
                                                        <div className="sm:col-span-2 p-3 bg-amber-50 rounded-xl border border-amber-100/50">
                                                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                                <FileText className="w-3 h-3" /> Ghi chú từ bạn
                                                            </p>
                                                            <p className="text-sm text-gray-800 italic">"{cleanNote}"</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-6 flex justify-end">
                                                    {b.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleCancel(b.id)}
                                                            className="group inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white border-2 border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-200 transition-all active:scale-95 focus:ring-4 focus:ring-red-100"
                                                        >
                                                            <Ban className="w-4 h-4 group-hover:-rotate-12 transition-transform" />
                                                            Hủy chuyến đi
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
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