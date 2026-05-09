import React, { useState } from 'react';
import { bookingService } from '@/services/tourService';
import ClientLayout from '@/components/layout/ClientLayout';
import { Search, Phone, Mail, Loader2, Calendar, Users, MapPin, ReceiptText, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';

const getStatusStyle = (status) => {
    switch (status) {
        case 'pending': return { bg: '#FEF9C3', text: '#92400E', border: '#FDE68A', icon: '⏳', label: 'Đang xử lý' };
        case 'confirmed':
        case 'contacted': return { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE', icon: '✅', label: 'Đã xác nhận' };
        case 'completed':
        case 'approved': return { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB', icon: '📋', label: 'Hoàn thành' };
        case 'cancelled': return { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA', icon: '❌', label: 'Đã hủy' };
        default: return { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB', icon: '📋', label: status };
    }
};

const formatPrice = (price) => {
    if (!price && price !== 0) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
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

const LookupBookingPage = () => {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [errors, setErrors] = useState({ email: '', phone: '' });

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const [expandedId, setExpandedId] = useState(null);
    const navigate = useNavigate();

    const validateForm = () => {
        let valid = true;
        let newErrors = { email: '', phone: '' };

        if (!email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
            valid = false;
        } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            newErrors.email = 'Sai định dạng email (VD: abc@gmail.com)';
            valid = false;
        }

        if (!phone.trim()) {
            newErrors.phone = 'Vui lòng nhập số điện thoại';
            valid = false;
        } else if (phone.trim().length < 9) {
            newErrors.phone = 'Vui lòng nhập số điện thoại hợp lệ (từ 9 số)';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        setSearched(true);
        setExpandedId(null);
        setBookings([]);

        try {
            const res = await bookingService.lookup({ email: email.trim(), phone: phone.trim() });
            setBookings(res.data?.data || []);
        } catch (err) {
            console.error('Lỗi tra cứu:', err);
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tra cứu. Vui lòng thử lại sau.');
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const handleTourClick = (b) => {
        if (b.tour?.slug) navigate(`/tours/${b.tour.slug}`);
        else if (b.tour?.id) navigate(`/tours/${b.tour.id}`);
    };

    return (
        <ClientLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-text mb-3 tracking-tight">Tra Cứu Đơn Đặt Tour</h1>
                    <p className="text-text-muted text-lg max-w-xl mx-auto">
                        Nhập email và số điện thoại đã sử dụng khi đặt tour để xem chi tiết lịch trình của bạn.
                    </p>
                </div>

                {/* Form Tra Cứu */}
                <form onSubmit={handleSearch} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-10 max-w-2xl mx-auto relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row gap-5 mb-6 focus-within:relative">
                        {/* Email */}
                        <div className="flex-1 relative">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Mail className="w-4 h-4 text-primary" />
                                Email
                            </label>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); if(errors.email) setErrors({...errors, email: ''}); }}
                                placeholder="nguyenvana@gmail.com"
                                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-base focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                                    errors.email ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-primary/30 focus:border-primary'
                                }`}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">{errors.email}</p>}
                        </div>

                        {/* Số điện thoại */}
                        <div className="flex-1 relative">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                <Phone className="w-4 h-4 text-primary" />
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => { setPhone(e.target.value); if(errors.phone) setErrors({...errors, phone: ''}); }}
                                placeholder="0987654321"
                                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-base focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                                    errors.phone ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-primary/30 focus:border-primary'
                                }`}
                            />
                            {errors.phone && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 left-0">{errors.phone}</p>}
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mx-auto"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Đang tra cứu...
                                </>
                            ) : (
                                <>
                                    <Search className="w-5 h-5" /> Tra cứu ngay
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Loading State */}
                {loading && (
                    <div className="space-y-6">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                                <div className="h-6 w-1/4 bg-gray-200 rounded mb-4" />
                                <div className="h-4 w-1/2 bg-gray-100 rounded mb-6" />
                                <div className="flex gap-4">
                                    <div className="h-10 w-24 bg-gray-200 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Kết Quả */}
                {!loading && searched && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {bookings.length === 0 ? (
                            <div className="text-center py-20 px-4 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center shadow-sm">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                    <MapPin className="w-10 h-10 text-gray-400 opacity-50" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy đơn đặt tour nào</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">
                                    Vui lòng kiểm tra lại email hoặc số điện thoại bạn đã điền hoặc liên hệ hotline để được hỗ trợ.
                                </p>
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 mb-4 pl-2 border-l-4 border-primary">
                                    Kết quả tra cứu ({bookings.length} đơn)
                                </h2>
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
                                                className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
                                            >
                                                {/* Card Header */}
                                                <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-100">
                                                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                                                        Mã đơn: {b.booking_code}
                                                    </span>
                                                    <span
                                                        className="text-xs font-bold px-3 py-1 rounded-md border uppercase tracking-wider"
                                                        style={{ backgroundColor: status.bg, color: status.text, borderColor: status.border }}
                                                    >
                                                        {status.icon} {status.label}
                                                    </span>
                                                </div>

                                                {/* Clickable Tour Info */}
                                                <div
                                                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                                                    onClick={() => handleTourClick(b)}
                                                >
                                                    <h3 className="text-xl font-bold text-gray-900 leading-snug line-clamp-1 mb-2 hover:text-primary transition-colors">
                                                        {b.tour?.title || 'Tour chưa cập nhật tên'}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-600">
                                                            Khởi hành: {departureDate ? format(new Date(departureDate), 'dd/MM/yyyy') : 'Chưa xác định'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-start gap-3 bg-white">
                                                    <button
                                                        onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                                                        className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all text-sm shadow-md"
                                                    >
                                                        {expandedId === b.id ? 'Thu gọn' : 'Xem chi tiết'}
                                                    </button>
                                                </div>

                                                {/* Expanded Details */}
                                                {expandedId === b.id && (
                                                    <div className="p-6 bg-gray-50 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        <h4 className="font-bold text-gray-900 mb-6 inline-flex items-center gap-2">
                                                            <span className="text-primary text-xs">▼</span> Thông tin đặt tour chi tiết
                                                        </h4>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                            {/* Chi tiết tour */}
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">📍 Chi tiết lịch trình</p>
                                                                <div className="space-y-1">
                                                                    <p className="text-sm text-gray-700"><span className="text-gray-500">Người đặt:</span> {b.customer_name}</p>
                                                                    <p className="text-sm text-gray-700"><span className="text-gray-500">Thời lượng:</span> {duration}</p>
                                                                    <p className="text-sm text-gray-700"><span className="text-gray-500">Điểm đón:</span> {b.pickupLocation?.location_name || 'Không có yêu cầu'}</p>
                                                                </div>
                                                            </div>

                                                            {/* Hành khách */}
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">👥 Số người tham gia</p>
                                                                <div className="space-y-1">
                                                                    <p className="text-sm text-gray-700"><span className="text-gray-500">Người lớn:</span> {passengers.adults}</p>
                                                                    <p className="text-sm text-gray-700"><span className="text-gray-500">Trẻ em:</span> {passengers.children}</p>
                                                                    <p className="text-sm text-gray-700"><span className="text-gray-500">Trẻ nhỏ:</span> {passengers.infants}</p>
                                                                </div>
                                                            </div>

                                                            {/* Liên hệ */}
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">📞 Thông tin liên hệ</p>
                                                                <div className="space-y-1">
                                                                    <p className="text-sm text-gray-700">{b.customer_phone}</p>
                                                                    <p className="text-sm text-gray-700">{b.customer_email}</p>
                                                                </div>
                                                            </div>

                                                            {/* Tổng tiền */}
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">📅 Ngày lập đơn</p>
                                                                <p className="text-sm text-gray-700 mb-4">{b.created_at ? format(new Date(b.created_at), 'dd/MM/yyyy HH:mm') : 'N/A'}</p>
                                                                
                                                                <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 shadow-inner">
                                                                    <p className="text-[10px] font-bold text-primary/70 uppercase tracking-wider mb-1">💰 Tổng tiền dự kiến</p>
                                                                    <p className="text-xl font-black text-primary">{total !== null ? formatPrice(total) : 'Liên hệ để nhận báo giá'}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {cleanNote && (
                                                            <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
                                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                                    <FileText className="w-3 h-3" /> Ghi chú từ khách hàng
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
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ClientLayout>
    );
};

export default LookupBookingPage;
