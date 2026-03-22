import { useState } from 'react';
import { bookingService } from '@/services/tourService';
import ClientLayout from '@/components/layout/ClientLayout';
import { Search, Phone, Mail, Loader2, Calendar, Users, MapPin, ReceiptText, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusConfig = {
    pending: { label: 'Đang chờ', className: 'bg-warning/10 text-warning border-warning/20' },
    contacted: { label: 'Đã liên hệ', className: 'bg-info/10 text-info border-info/20' },
    approved: { label: 'Đã duyệt', className: 'bg-success/10 text-success border-success/20' },
    cancelled: { label: 'Đã hủy', className: 'bg-error/10 text-error border-error/20' },
};

const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const BookingCard = ({ booking, index }) => {
    const status = statusConfig[booking.status] || statusConfig.pending;
    const tour = booking.Tour || {};
    const unitPrice = parseFloat(tour.sale_price_adult || tour.price_adult || 0);
    const totalPrice = unitPrice * (booking.number_of_people || 1);

    return (
        <div
            className="bg-surface rounded-2xl border border-border p-5 md:p-6 hover:shadow-lg transition-all animate-fade-up flex flex-col sm:flex-row gap-6"
            style={{ animationDelay: `${index * 80}ms` }}
        >
            {/* Ảnh Tour */}
            <div className="w-full sm:w-40 h-32 rounded-xl overflow-hidden bg-surface-alt flex-shrink-0 border border-border relative">
                {tour.cover_image ? (
                    <img
                        src={tour.cover_image.startsWith('http') ? tour.cover_image : `http://localhost:8888${tour.cover_image}`}
                        alt={tour.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-text-muted">
                        <ImageIcon className="w-8 h-8 opacity-50 mb-1" />
                        <span className="text-xs">No image</span>
                    </div>
                )}
                <div className="absolute top-2 left-2 px-2.5 py-1 bg-surface/90 backdrop-blur rounded-lg shadow-sm border border-border text-xs font-bold text-text">
                    {booking.booking_code}
                </div>
            </div>

            {/* Thông tin */}
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                        <Link to={tour.slug ? `/tours/${tour.slug}` : '#'} className="font-bold text-lg text-text hover:text-primary transition-colors line-clamp-2 pr-4 flex-1">
                            {tour.title || 'Tour không xác định'}
                        </Link>
                        <span className={`px-3 py-1.5 text-xs font-bold rounded-full border whitespace-nowrap ${status.className}`}>
                            {status.label}
                        </span>
                    </div>

                    {/* Thông tin người đặt */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted mb-3">
                        <span>Người đặt: <strong className="text-text">{booking.customer_name}</strong></span>
                        <span>SĐT: <strong className="text-text">{booking.customer_phone}</strong></span>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-text-secondary">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-text-muted">Ngày đặt</p>
                                <p className="font-medium text-text">{new Date(booking.created_at).toLocaleDateString('vi-VN')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center">
                                <Users className="w-4 h-4 text-secondary" />
                            </div>
                            <div>
                                <p className="text-xs text-text-muted">Số lượng</p>
                                <p className="font-medium text-text">{booking.number_of_people} người</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:ml-auto">
                            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                                <ReceiptText className="w-4 h-4 text-success" />
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-text-muted">Tổng tiền</p>
                                <p className="font-bold text-lg text-primary">{formatPrice(totalPrice)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LookupBookingPage = () => {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!email.trim() && !phone.trim()) return;
        setLoading(true);
        setSearched(true);
        try {
            const params = {};
            if (email.trim()) params.email = email.trim();
            if (phone.trim()) params.phone = phone.trim();
            const res = await bookingService.getHistory(params);
            setBookings(res.data.data || []);
        } catch (err) {
            console.error('Lỗi tra cứu:', err);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ClientLayout>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-16">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-text mb-3 tracking-tight">Tra Cứu Đơn Đặt Tour</h1>
                    <p className="text-text-muted text-lg max-w-xl mx-auto">
                        Nhập email và số điện thoại đã sử dụng khi đặt tour để tra cứu lại đơn đặt tour của bạn.
                    </p>
                </div>

                {/* Form Tra Cứu */}
                <form onSubmit={handleSearch} className="bg-surface rounded-3xl border border-border shadow-md p-6 sm:p-8 mb-10 max-w-2xl mx-auto">
                    <div className="flex flex-col gap-4 mb-5">
                        {/* Email */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-text mb-2">
                                <Mail className="w-4 h-4 text-primary" />
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Nhập email..."
                                className="w-full px-5 py-3.5 bg-surface-alt border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                            />
                        </div>

                        {/* Số điện thoại */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-text mb-2">
                                <Phone className="w-4 h-4 text-primary" />
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Nhập số điện thoại..."
                                className="w-full px-5 py-3.5 bg-surface-alt border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || (!email.trim() && !phone.trim())}
                        className="w-full px-8 py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                        Tra cứu
                    </button>
                </form>

                {/* Kết Quả */}
                {loading ? (
                    <div className="space-y-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-surface rounded-2xl border border-border p-6 animate-pulse flex flex-col sm:flex-row gap-6">
                                <div className="w-full sm:w-40 h-32 bg-surface-alt rounded-xl flex-shrink-0" />
                                <div className="flex-1 space-y-4">
                                    <div className="flex justify-between">
                                        <div className="h-6 bg-surface-alt rounded w-1/2" />
                                        <div className="h-6 bg-surface-alt rounded-full w-24" />
                                    </div>
                                    <div className="h-4 bg-surface-alt rounded w-1/4" />
                                    <div className="pt-4 flex gap-4">
                                        <div className="h-10 bg-surface-alt rounded w-24" />
                                        <div className="h-10 bg-surface-alt rounded w-24" />
                                        <div className="h-10 bg-surface-alt rounded w-32 ml-auto" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : searched && bookings.length === 0 ? (
                    <div className="text-center py-20 px-4 bg-surface rounded-3xl border border-dashed border-border flex flex-col items-center">
                        <div className="w-20 h-20 bg-surface-alt rounded-full flex items-center justify-center mb-6">
                            <MapPin className="w-10 h-10 text-text-muted opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-text mb-2">Không tìm thấy đơn đặt tour</h3>
                        <p className="text-text-muted max-w-sm mx-auto">
                            Vui lòng kiểm tra lại email hoặc số điện thoại bạn đã nhập.
                        </p>
                    </div>
                ) : bookings.length > 0 ? (
                    <div>
                        <h2 className="text-lg font-bold text-text mb-4">
                            Kết quả ({bookings.length} đơn)
                        </h2>
                        <div className="space-y-6">
                            {bookings.map((booking, i) => (
                                <BookingCard key={booking.id} booking={booking} index={i} />
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
        </ClientLayout>
    );
};

export default LookupBookingPage;
