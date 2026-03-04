import { useState } from 'react';
import { bookingService } from '@/services/tourService';
import ClientLayout from '@/components/layout/ClientLayout';
import { Search, Phone, Mail, Loader2, Calendar, Users, MapPin } from 'lucide-react';

const statusConfig = {
    pending:   { label: 'Đang chờ',   className: 'bg-warning/10 text-warning border-warning/20' },
    contacted: { label: 'Đã liên hệ', className: 'bg-info/10 text-info border-info/20' },
    approved:  { label: 'Đã duyệt',   className: 'bg-success/10 text-success border-success/20' },
    cancelled: { label: 'Đã hủy',     className: 'bg-error/10 text-error border-error/20' },
};

const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const HistoryPage = () => {
    const [searchType, setSearchType] = useState('phone');
    const [searchValue, setSearchValue] = useState('');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchValue.trim()) return;
        setLoading(true);
        setSearched(true);
        try {
            const params = searchType === 'phone'
                ? { phone: searchValue.trim() }
                : { email: searchValue.trim() };
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
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-text mb-2">Lịch Sử Đặt Tour</h1>
                    <p className="text-text-muted">Nhập số điện thoại hoặc email để tra cứu đơn đặt tour</p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="bg-surface rounded-2xl border border-border shadow-sm p-5 mb-8">
                    <div className="flex gap-2 mb-4">
                        <button
                            type="button"
                            onClick={() => { setSearchType('phone'); setSearchValue(''); }}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition ${
                                searchType === 'phone'
                                    ? 'bg-primary text-white'
                                    : 'bg-surface-alt text-text-secondary hover:bg-surface-hover'
                            }`}
                        >
                            <Phone className="w-4 h-4" /> Số điện thoại
                        </button>
                        <button
                            type="button"
                            onClick={() => { setSearchType('email'); setSearchValue(''); }}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition ${
                                searchType === 'email'
                                    ? 'bg-primary text-white'
                                    : 'bg-surface-alt text-text-secondary hover:bg-surface-hover'
                            }`}
                        >
                            <Mail className="w-4 h-4" /> Email
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <input
                            type={searchType === 'phone' ? 'tel' : 'email'}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder={searchType === 'phone' ? 'Nhập số điện thoại...' : 'Nhập email...'}
                            className="flex-1 px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                        />
                        <button
                            type="submit"
                            disabled={loading || !searchValue.trim()}
                            className="px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            Tra cứu
                        </button>
                    </div>
                </form>

                {/* Results */}
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-surface rounded-xl border border-border p-5 animate-pulse">
                                <div className="flex justify-between mb-3">
                                    <div className="h-5 bg-surface-alt rounded w-1/3" />
                                    <div className="h-6 bg-surface-alt rounded w-20" />
                                </div>
                                <div className="h-4 bg-surface-alt rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : searched && bookings.length === 0 ? (
                    <div className="text-center py-12 text-text-muted">
                        <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">Không tìm thấy đơn đặt nào</p>
                        <p className="text-sm">Kiểm tra lại thông tin và thử lại</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking, i) => {
                            const status = statusConfig[booking.status] || statusConfig.pending;
                            return (
                                <div
                                    key={booking.id}
                                    className="bg-surface rounded-xl border border-border p-5 hover:shadow-md transition-shadow animate-fade-up"
                                    style={{ animationDelay: `${i * 80}ms` }}
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                                        <div>
                                            <h3 className="font-bold text-text">
                                                {booking.Tour?.title || 'Tour'}
                                            </h3>
                                            <p className="text-sm text-text-muted">
                                                Mã đặt: <span className="font-mono font-semibold text-primary">{booking.booking_code}</span>
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${status.className}`}>
                                            {status.label}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5" />
                                            {booking.number_of_people} người
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(booking.created_at).toLocaleDateString('vi-VN')}
                                        </span>
                                        {booking.Tour?.price && (
                                            <span className="font-semibold text-primary">
                                                {formatPrice(booking.Tour.sale_price || booking.Tour.price)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </ClientLayout>
    );
};

export default HistoryPage;
