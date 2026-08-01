import { useState, useEffect, useCallback } from 'react';
import { adminService } from '@/services/tourService';
import AdminLayout from '@/components/layout/AdminLayout';
import SearchBar from '@/components/ui/SearchBar';
import BookingManagementTable from '../components/BookingManagementTable';
import TourOverviewGridItem from '../components/TourOverviewGridItem';
import TourOverviewListItem from '../components/TourOverviewListItem';
import {
    Loader2, Mail, Calendar, X, CheckCircle2,
    Filter, Users,
    ArrowLeft, Trash2,
    LayoutGrid, List, AlertCircle, Clock, XCircle, FileText
} from 'lucide-react';
import { toast } from 'sonner';

const statusConfig = {
    pending:   { label: 'Đang chờ',   className: 'bg-warning/10 text-warning border-warning/20', icon: Clock },
    approved:  { label: 'Đã duyệt',   className: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
    cancelled: { label: 'Đã hủy',     className: 'bg-error/10 text-error border-error/20', icon: XCircle },
};

const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const ITEMS_PER_PAGE = 10;

const BookingManagementPage = () => {
    const [view, setView] = useState('overview'); // 'overview' or 'list'
    const [overviewLayout, setOverviewLayout] = useState(() => localStorage.getItem('admin_booking_layout') || 'grid'); // 'grid' or 'list'
    const [overviewData, setOverviewData] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detail, setDetail] = useState(null);
    const [updating, setUpdating] = useState(null);
    
    // Filters
    const [selectedTour, setSelectedTour] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [bookingSearchInput, setBookingSearchInput] = useState('');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Overview Search
    const [overviewSearch, setOverviewSearch] = useState('');
    const [overviewSearchInput, setOverviewSearchInput] = useState('');
    const [totalItems, setTotalItems] = useState(0);
    const [isDesktop, setIsDesktop] = useState(() =>
        typeof window === 'undefined' ? true : window.matchMedia('(min-width: 1024px)').matches
    );
    const effectiveOverviewLayout = isDesktop ? overviewLayout : 'grid';

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 1024px)');
        const handleChange = (event) => setIsDesktop(event.matches);

        setIsDesktop(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const fetchOverview = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminService.getBookingOverview();
            setOverviewData(res.data.data || []);
        } catch (err) {
            console.error('Lỗi tải tổng quan:', err);
            toast.error('Không thể tải dữ liệu tổng quan');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                ...(statusFilter ? { status: statusFilter } : {}),
                ...(selectedTour ? { tour_id: selectedTour.id } : {}),
                ...(debouncedSearch ? { search: debouncedSearch } : {})
            };
            const res = await adminService.getBookings(params);
            setBookings(res.data.data || []);
            setTotalPages(res.data.totalPages || 1);
            setTotalItems(res.data.totalItems || 0);
        } catch (err) {
            console.error('Lỗi tải đơn:', err);
            toast.error('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearch, selectedTour, statusFilter]);

    useEffect(() => {
        if (view === 'overview') {
            fetchOverview();
        } else {
            fetchBookings();
        }
    }, [view, fetchOverview, fetchBookings]);

    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, selectedTour, debouncedSearch]);

    useEffect(() => {
        localStorage.setItem('admin_booking_layout', overviewLayout);
    }, [overviewLayout]);

    const handleUpdateStatus = async (id, status) => {
        setUpdating(id);
        try {
            await adminService.updateBookingStatus(id, { status });
            await fetchBookings();
            if (detail?.id === id) {
                setDetail(prev => ({ ...prev, status }));
            }
            toast.success('Cập nhật trạng thái thành công!');
            setDetail(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi cập nhật');
        } finally {
            setUpdating(null);
        }
    };

    const performDeleteBooking = async (id) => {
        try {
            await adminService.deleteBooking(id);
            toast.success('Xóa đơn hàng thành công');
            await fetchBookings();
            setDetail(null);
        } catch (err) {
            toast.error('Lỗi khi xóa đơn hàng');
        }
    };

    const filteredOverview = overviewData.filter(tour => 
        tour.title.toLowerCase().includes(overviewSearch.toLowerCase())
    );

    const handleDeleteBooking = (id) => {
        toast('Xác nhận xóa', {
            description: 'Bạn có chắc chắn muốn xóa đơn đặt này?',
            action: {
                label: 'Xóa',
                onClick: () => performDeleteBooking(id)
            },
            cancel: {
                label: 'Hủy'
            },
            duration: 5000,
        });
    };

    const selectTour = (tour) => {
        setSelectedTour(tour);
        setView('list');
    };

    const goBack = () => {
        setSelectedTour(null);
        setView('overview');
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

    const handleSearch = () => {
        if (view === 'overview') {
            setOverviewSearch(overviewSearchInput.trim());
            return;
        }

        setCurrentPage(1);
        setDebouncedSearch(bookingSearchInput.trim());
    };

    const clearSearch = () => {
        if (view === 'overview') {
            setOverviewSearchInput('');
            setOverviewSearch('');
            return;
        }

        setBookingSearchInput('');
        setCurrentPage(1);
        setDebouncedSearch('');
    };

    return (
        <AdminLayout>
            <div className="flex h-[calc(100dvh-6rem)] flex-col gap-6 overflow-hidden sm:h-[calc(100dvh-5.5rem)]">
                {/* Header Section */}
                <div className="flex shrink-0 flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div className="min-w-0 flex-1">
                        <div className="w-full max-w-2xl">
                            <SearchBar
                                variant="admin"
                                value={view === 'overview' ? overviewSearchInput : bookingSearchInput}
                                onChange={event => view === 'overview'
                                    ? setOverviewSearchInput(event.target.value)
                                    : setBookingSearchInput(event.target.value)}
                                onSearch={handleSearch}
                                onClear={clearSearch}
                                placeholder={view === 'overview'
                                    ? 'Tìm tên tour trong tổng quan...'
                                    : 'Tìm mã đơn, khách hàng, SĐT...'}
                                showButton
                            />
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] font-medium text-text-muted">
                                <span>{view === 'overview' ? `Hiển thị ${filteredOverview.length} tour` : `Tổng cộng ${totalItems} đơn hàng`}</span>
                                {selectedTour && view === 'list' && (
                                    <span className="inline-flex items-center gap-2 px-2 py-1 bg-primary/10 border border-primary/20 rounded-lg text-primary uppercase tracking-tighter">
                                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                        <span className="truncate max-w-[160px] font-black">{selectedTour.title}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex min-h-[46px] items-center gap-2 bg-surface p-1 rounded-xl border border-border shadow-sm shrink-0 self-end md:self-auto lg:self-start">
                        <button 
                            onClick={() => setView('overview')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${view === 'overview' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:bg-surface-alt'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            Tổng quan
                        </button>
                        <button 
                            onClick={() => setView('list')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${view === 'list' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:bg-surface-alt'}`}
                        >
                            <List className="w-4 h-4" />
                            Danh sách
                        </button>
                    </div>
                </div>

                {/* Options Bar */}
                <div className="hidden shrink-0 items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4 lg:flex lg:flex-row">
                    {view === 'list' ? (
                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                            {selectedTour && (
                                <button 
                                    onClick={goBack}
                                    className="flex items-center gap-2 px-4 py-2 bg-surface-alt hover:bg-primary/10 text-text-secondary hover:text-primary rounded-lg transition-all border border-border font-bold"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span className="text-sm">Quay lại Tổng quan</span>
                                </button>
                            )}
                            
                            <Filter className="w-4 h-4 text-text-muted flex-shrink-0" />
                            {['', 'pending', 'approved', 'cancelled'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex-shrink-0 border ${
                                        statusFilter === status
                                            ? 'bg-primary border-primary text-white'
                                            : 'bg-surface-alt border-border text-text-secondary hover:bg-surface-hover'
                                    }`}
                                >
                                    {status === '' ? 'Tất cả' : statusConfig[status]?.label}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-text-secondary">Hiển thị <span className="text-primary">{filteredOverview.length}</span> tour</span>
                            </div>
                            <div className="flex items-center gap-1 bg-surface-alt p-1 rounded-lg border border-border">
                                <button 
                                    onClick={() => setOverviewLayout('grid')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${overviewLayout === 'grid' ? 'bg-surface shadow-sm text-primary' : 'text-text-muted hover:text-text-secondary hover:bg-surface/50'}`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                    <span className="hidden sm:block">Lưới</span>
                                </button>
                                <button 
                                    onClick={() => setOverviewLayout('list')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${overviewLayout === 'list' ? 'bg-surface shadow-sm text-primary' : 'text-text-muted hover:text-text-secondary hover:bg-surface/50'}`}
                                >
                                    <List className="w-4 h-4" />
                                    <span className="hidden sm:block">Danh sách</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                {view === 'overview' ? (
                    loading ? (
                    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-text-muted font-medium animate-pulse">Đang tải dữ liệu...</p>
                    </div>
                    ) : (
                    /* ═══ OVERVIEW DASHBOARD ═══ */
                    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto">
                        <div className={effectiveOverviewLayout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                            {filteredOverview.length > 0 ? filteredOverview.map(tour => (
                                effectiveOverviewLayout === 'grid' ? (
                                    <TourOverviewGridItem key={tour.id} tour={tour} onSelectTour={selectTour} />
                                ) : (
                                    <TourOverviewListItem key={tour.id} tour={tour} onSelectTour={selectTour} />
                                )
                        )) : (
                            <div className="col-span-full py-20 bg-surface rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-4">
                                <AlertCircle className="w-12 h-12 text-text-muted" />
                                <p className="text-text-muted font-medium">Không dữ liệu</p>
                            </div>
                        )}
                    </div>
                    </div>
                )) : (
                    /* ═══ LIST VIEW TABLE ═══ */
                    <BookingManagementTable
                        bookings={bookings}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        selectedTour={selectedTour}
                        loading={loading}
                        updating={updating}
                        getPageNumbers={getPageNumbers}
                        onPageChange={setCurrentPage}
                        onShowDetail={setDetail}
                        onApprove={id => handleUpdateStatus(id, 'approved')}
                        onDelete={handleDeleteBooking}
                        onClearFilters={() => {
                            setStatusFilter('');
                            setBookingSearchInput('');
                            setDebouncedSearch('');
                        }}
                    />
                )}
            </div>


            {detail && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setDetail(null)} />
                    <div className="relative bg-surface rounded-3xl shadow-2xl max-w-2xl w-full p-8 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto border border-border">
                        <button 
                            onClick={() => setDetail(null)} 
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-surface-alt transition-colors"
                        >
                            <X className="w-6 h-6 text-text-muted" />
                        </button>

                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-text uppercase tracking-tight">Chi tiết đơn hàng</h3>
                                <p className="text-text-muted text-sm font-medium">Mã đơn: <span className="text-primary font-bold">{detail.booking_code}</span></p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column: Info */}
                            <div className="space-y-6">
                                <section>
                                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Thông tin Tour</h4>
                                    <div className="bg-surface-alt p-4 rounded-2xl border border-border space-y-3">
                                        <p className="font-bold text-text leading-snug">{detail.Tour?.title || detail.tour_title_snapshot || 'Tour chưa cập nhật tên'}</p>
                                        {(detail.departure || detail.departure_date_snapshot) && (
                                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                <Calendar className="w-4 h-4 text-primary" />
                                                <span className="font-medium">Khởi hành: {new Date(detail.departure?.departure_date || detail.departure_date_snapshot).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        )}
                                        {(detail.pickupLocation || detail.pickup_location_snapshot) && (
                                            <div className="text-sm bg-primary/5 p-2 rounded-lg border border-primary/10">
                                                <p className="text-xs text-primary font-bold mb-1">Điểm đón:</p>
                                                <p className="text-text font-medium">{detail.pickupLocation?.location_name || detail.pickup_location_snapshot}</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Thông tin Khách hàng</h4>
                                    <div className="bg-surface-alt p-4 rounded-2xl border border-border space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-surface rounded-full flex items-center justify-center border border-border">
                                                <Users className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-text">{detail.customer_name}</p>
                                                <p className="text-xs text-text-muted font-medium">{detail.customer_phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-surface rounded-full flex items-center justify-center border border-border">
                                                <Mail className="w-4 h-4 text-primary" />
                                            </div>
                                            <p className="text-sm font-medium text-text truncate">{detail.customer_email}</p>
                                        </div>
                                        <div className="pt-2 border-t border-border/50">
                                            <p className="text-xs text-text-muted font-bold mb-1 uppercase tracking-tighter">Hành khách:</p>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="px-2 py-1 bg-surface border border-border rounded-lg text-xs font-bold">{detail.adult_qty} Người lớn</span>
                                                {detail.child_qty > 0 && <span className="px-2 py-1 bg-surface border border-border rounded-lg text-xs font-bold">{detail.child_qty} Trẻ em</span>}
                                                {detail.infant_qty > 0 && <span className="px-2 py-1 bg-surface border border-border rounded-lg text-xs font-bold">{detail.infant_qty} Em bé</span>}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>


                            {/* Right Column: Services & Total */}
                            <div className="space-y-6">
                                <section>
                                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Dịch vụ & Thanh toán</h4>
                                    <div className="bg-surface-alt p-5 rounded-3xl border border-border">
                                        {detail.bookingOptions?.length > 0 && (
                                            <div className="space-y-3 mb-4 pb-4 border-b border-border/50">
                                                {detail.bookingOptions.map((opt, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-sm">
                                                        <span className="text-text-secondary">{opt.option_name} <span className="text-text font-bold">×{opt.quantity}</span></span>
                                                        <span className="font-bold text-text">{formatPrice(opt.total)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        <div className="flex flex-col gap-1 mb-6">
                                            <div className="flex justify-between items-center text-text-secondary text-sm">
                                                <span>Trạng thái thanh toán</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${statusConfig[detail.status]?.className}`}>
                                                    {statusConfig[detail.status]?.label}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-primary/10">
                                                <span className="font-black text-text uppercase tracking-tighter">Tổng cộng</span>
                                                <span className="text-2xl font-black text-primary">{formatPrice(detail.total_price)}</span>
                                            </div>
                                        </div>

                                        {detail.customer_note && (
                                            <div className="p-3 bg-surface rounded-lg border border-border">
                                                <p className="text-[10px] text-text-muted font-black uppercase mb-1">Ghi chú từ khách</p>
                                                <p className="text-sm italic text-text-secondary leading-tight">{detail.customer_note}</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Modal Actions */}
                                <div className="flex flex-col gap-3">
                                    {detail.status !== 'approved' && detail.status !== 'cancelled' && (
                                        <button
                                            onClick={() => { handleUpdateStatus(detail.id, 'approved'); setDetail(null); }}
                                            className="w-full py-4 bg-success text-white font-black rounded-2xl hover:shadow-xl hover:shadow-success/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                            DUYỆT ĐƠN HÀNG
                                        </button>
                                    )}
                                    {detail.status !== 'cancelled' && (
                                        <button
                                            onClick={() => { handleUpdateStatus(detail.id, 'cancelled'); setDetail(null); }}
                                            className="w-full py-4 bg-error text-white font-black rounded-2xl hover:shadow-xl hover:shadow-error/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            HỦY ĐƠN HÀNG
                                        </button>
                                    )}
                                    {detail.status === 'cancelled' && (
                                        <button
                                            onClick={() => { handleDeleteBooking(detail.id); setDetail(null); }}
                                            className="w-full py-4 bg-error/10 text-error font-black rounded-2xl hover:bg-error hover:text-white transition-all flex items-center justify-center gap-2 border-2 border-dashed border-error/30 hover:border-error"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                            XÓA VĨNH VIỄN
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default BookingManagementPage;

