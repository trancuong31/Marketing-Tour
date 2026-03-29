import React, { useEffect, useState } from 'react';
import { userService } from '@/services/userService';
import ClientLayout from '@/components/layout/ClientLayout';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Loader2, Ticket, MapPin, Calendar, Clock, User, Users, FileText, Ban } from 'lucide-react';

const HistoryPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await userService.getBookings();
            setBookings(res.data?.data || []);
            setError('');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Lỗi khi lấy lịch sử đặt tour. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

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
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Đang xử lý';
            case 'confirmed': return 'Đã xác nhận';
            case 'completed': return 'Hoàn thành';
            case 'cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    return (
        <ClientLayout>
            <div className="max-w-5xl mx-auto py-10 px-4 md:px-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-primary/10 rounded-xl relative">
                        <Ticket className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Lịch sử đặt tour</h1>
                        <p className="text-gray-500 mt-1">Quản lý và theo dõi các chuyến đi của bạn</p>
                    </div>
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
                    <div className="space-y-6">
                        {bookings.map((b) => (
                            <div key={b.id} className="bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col md:flex-row">
                                {/* Left Side - Tour Info */}
                                <div className="bg-gray-50/50 p-6 md:w-[40%] border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-xs font-bold px-3 py-1 bg-gray-200 text-gray-600 rounded-lg uppercase tracking-wider">
                                                {b.booking_code}
                                            </span>
                                            <span className={`text-xs font-bold px-3 py-1 rounded-lg border uppercase tracking-wider ${getStatusStyle(b.status)}`}>
                                                {getStatusText(b.status)}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 leading-snug line-clamp-2">
                                            {b.tour?.title || 'Tour ưu đãi chưa cập nhật tên'}
                                        </h3>
                                        <div className="mt-4 space-y-2">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                <span>Đặt ngày: <span className="font-medium text-gray-800">{b.created_at ? format(new Date(b.created_at), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'N/A'}</span></span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Users className="w-4 h-4 mr-2 text-gray-400" />
                                                <span>Số người: <span className="font-medium text-gray-800">{b.number_of_people} khách</span></span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-gray-200">
                                        <p className="text-sm text-gray-500 mb-1">Tổng tiền ước tính</p>
                                        <div className="flex items-end gap-2">
                                            {b.tour?.sale_price_adult > 0 ? (
                                                <>
                                                    <span className="text-2xl font-black text-rose-600">{formatPrice(b.tour.sale_price_adult * b.number_of_people)}</span>
                                                    <span className="text-sm text-gray-400 line-through pb-1">{formatPrice((b.tour.price_adult || 0) * b.number_of_people)}</span>
                                                </>
                                            ) : (
                                                <span className="text-2xl font-black text-primary">{b.tour?.price_adult ? formatPrice(b.tour.price_adult * b.number_of_people) : 'Liên hệ'}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side - Booking Details */}
                                <div className="p-6 md:w-[60%] flex flex-col justify-between bg-white relative">
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Người liên hệ</p>
                                            <p className="text-sm font-semibold text-gray-900">{b.customer_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Số điện thoại</p>
                                            <p className="text-sm font-semibold text-gray-900">{b.customer_phone}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email liên hệ</p>
                                            <p className="text-sm font-semibold text-gray-900">{b.customer_email}</p>
                                        </div>
                                        {b.customer_note && (
                                            <div className="col-span-2 p-3 bg-amber-50 rounded-xl border border-amber-100/50">
                                                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> Ghi chú từ bạn</p>
                                                <p className="text-sm text-gray-800 italic">"{b.customer_note}"</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="mt-8 flex justify-end">
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
                        ))}
                    </div>
                )}
            </div>
        </ClientLayout>
    );
};

export default HistoryPage;