import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { adminService } from '@/services/tourService';
import { Loader2, Trash2, Calendar, Map, Star, MessageSquare, ChevronLeft, ChevronRight, Filter, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { format } from 'date-fns';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';
import { useThemeStore } from '@/store';
import { vi } from 'date-fns/locale';

export default function ReviewManagementPage() {
    const [selectedTour, setSelectedTour] = useState('');
    const [selectedTourLabel, setSelectedTourLabel] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [tours, setTours] = useState([]);
    const [toursLoading, setToursLoading] = useState(false);
    const [tourSearchTerm, setTourSearchTerm] = useState('');
    const [showTourSuggestions, setShowTourSuggestions] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const tourSearchRef = useRef(null);
    const suggestionsRef = useRef(null);
    const debounceRef = useRef(null);
    const { theme } = useThemeStore();
    const isDark = theme === 'dark';
    
    // Pagination for table
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [topTours, setTopTours] = useState([]);
    const [stats, setStats] = useState([]);
    const [reviews, setReviews] = useState([]);
    
    const [loading, setLoading] = useState(true);

    // Time filter options for CustomSelect - Dynamically generated for last few years
    const timeOptions = useMemo(() => {
        const options = [
            { value: '', label: 'Tất cả thời gian' },
            { value: '7days', label: '7 ngày qua' },
            { value: 'month', label: 'Tháng này' },
            { value: 'quarter', label: 'Quý này' },
            { value: 'year', label: 'Năm nay' },
        ];

        const d = new Date();
        const currentYear = d.getFullYear();
        const currentQuarter = Math.floor(d.getMonth() / 3) + 1;

        // Add remaining quarters for the current year
        for (let q = currentQuarter - 1; q >= 1; q--) {
            options.push({ value: `q${q}_${currentYear}`, label: `Quý ${q}/${currentYear}` });
        }

        // Add the previous 2 years and their quarters
        for (let y = currentYear - 1; y >= currentYear - 2; y--) {
            options.push({ value: `year_${y}`, label: `Nguyên năm ${y}` });
            options.push({ value: `q4_${y}`, label: `Quý 4/${y}` });
            options.push({ value: `q3_${y}`, label: `Quý 3/${y}` });
            options.push({ value: `q2_${y}`, label: `Quý 2/${y}` });
            options.push({ value: `q1_${y}`, label: `Quý 1/${y}` });
        }
        return options;
    }, []);

    // Fetch tours with search term (debounced)
    const fetchToursDropdown = useCallback(async (searchTerm = '') => {
        setToursLoading(true);
        try {
            const params = { limit: 15 };
            if (searchTerm.trim()) {
                params.search = searchTerm.trim();
            }
            const res = await adminService.getTours(params);
            if (res.data?.data) {
                setTours(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching tours:', error);
        } finally {
            setToursLoading(false);
        }
    }, []);

    // Handle tour search input change with debounce
    const handleTourInputChange = useCallback((value) => {
        setTourSearchTerm(value);
        setShowTourSuggestions(true);
        setHighlightedIndex(-1);
        
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchToursDropdown(value);
        }, 400);
    }, [fetchToursDropdown]);

    // Select a tour from suggestions
    const handleSelectTour = useCallback((tour) => {
        setSelectedTour(String(tour.id));
        setSelectedTourLabel(tour.title);
        setTourSearchTerm(tour.title);
        setShowTourSuggestions(false);
        setCurrentPage(1);
    }, []);

    // Clear tour selection
    const handleClearTour = useCallback(() => {
        setSelectedTour('');
        setSelectedTourLabel('');
        setTourSearchTerm('');
        setShowTourSuggestions(false);
        setCurrentPage(1);
        fetchToursDropdown('');
    }, [fetchToursDropdown]);

    // Keyboard navigation for suggestions
    const handleTourKeyDown = useCallback((e) => {
        if (!showTourSuggestions || tours.length === 0) {
            if (e.key === 'ArrowDown') {
                setShowTourSuggestions(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => prev < tours.length - 1 ? prev + 1 : prev);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && tours[highlightedIndex]) {
                    handleSelectTour(tours[highlightedIndex]);
                }
                break;
            case 'Escape':
                setShowTourSuggestions(false);
                break;
            default:
                break;
        }
    }, [showTourSuggestions, tours, highlightedIndex, handleSelectTour]);

    // Scroll highlighted item into view
    useEffect(() => {
        if (highlightedIndex >= 0 && suggestionsRef.current) {
            const items = suggestionsRef.current.querySelectorAll('[data-suggestion]');
            if (items[highlightedIndex]) {
                items[highlightedIndex].scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex]);

    // Close suggestions on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (tourSearchRef.current && !tourSearchRef.current.contains(e.target)) {
                setShowTourSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cleanup debounce timer
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    // Main fetch data logic
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedTour) params.tour_id = selectedTour;
            if (selectedTime) params.time = selectedTime;

            // Stats calls don't need pagination
            const statsParams = { ...params };
            const topParams = { time: selectedTime }; // Tour selection shouldn't filter top tours ranking usually, but let's stick to system level top tours.

            const [topRes, statsRes, reviewsRes] = await Promise.all([
                adminService.getTopRatedTours(topParams),
                adminService.getReviewStats(statsParams),
                adminService.getVotes({ ...params, page: currentPage, limit: 10 })
            ]);

            setTopTours(topRes.data?.data || []);
            setStats(statsRes.data?.data || []);
            
            if (reviewsRes.data?.data) {
                setReviews(reviewsRes.data.data);
                setTotalPages(reviewsRes.data.totalPages || 1);
                setTotalItems(reviewsRes.data.totalItems || 0);
            }
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi tải dữ liệu đánh giá');
        } finally {
            setLoading(false);
        }
    }, [selectedTour, selectedTime, currentPage]);

    useEffect(() => {
        fetchToursDropdown(); // Load initial tours
    }, [fetchToursDropdown]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async (id) => {
        toast('Bạn có chắc chắn muốn xóa đánh giá này?', {
            icon: '⚠️',
            action: {
                label: 'Xóa',
                onClick: async () => {
                    try {
                        await adminService.deleteVote(id);
                        toast.success('Xóa đánh giá thành công');
                        fetchData(); // Reload all data since stats changed
                    } catch (error) {
                        toast.error(error.response?.data?.message || 'Lỗi khi xóa đánh giá');
                    }
                }
            },
            cancel: { label: 'Hủy' }
        });
    };

    const handleApprove = async (id, currentStatus) => {
        try {
            await adminService.updateVote(id, { is_approved: !currentStatus });
            toast.success(currentStatus ? 'Đã gỡ duyệt đánh giá' : 'Đã duyệt đánh giá');
            fetchData();
        } catch (error) {
            toast.error('Lỗi khi thay đổi trạng thái');
        }
    };

    // Highcharts options
    const pieChartOptions = {
        chart: { type: 'pie', backgroundColor: 'transparent', height: 350 },
        title: { text: null },
        tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b> ({point.y})' },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                },
                innerSize: '50%'
            }
        },
        series: [{
            name: 'Đánh giá',
            colorByPoint: true,
            data: stats.map(s => ({
                name: `${s.rating} Sao`,
                y: parseInt(s.count),
            }))
        }],
        colors: ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'] // 5,4,3,2,1 colors roughly
    };

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text">Quản lý Đánh giá</h1>
                    <p className="text-sm text-text-muted mt-1">Phân tích và theo dõi phản hồi của khách hàng</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-surface border border-border rounded-2xl p-4 mb-6 flex flex-wrap gap-4 items-center shadow-sm">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-text">Bộ Lọc</span>
                </div>
                
                <div className="flex-1 flex flex-wrap gap-4 max-w-3xl">
                    {/* Tour Filter — Autocomplete Search Input */}
                    <div ref={tourSearchRef} className="flex-1 min-w-[300px] relative">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                type="text"
                                value={tourSearchTerm}
                                onChange={(e) => handleTourInputChange(e.target.value)}
                                onFocus={() => { setShowTourSuggestions(true); if (!tourSearchTerm) fetchToursDropdown(''); }}
                                onKeyDown={handleTourKeyDown}
                                placeholder="Nhập tên tour để tìm kiếm..."
                                className={`
                                    w-full pl-9 pr-10 py-2 rounded-lg border text-sm
                                    transition-all duration-200 ease-in-out bg-transparent text-text
                                    border-border hover:border-primary/40
                                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
                                    placeholder:text-text-muted
                                    ${selectedTour ? 'border-primary/50 bg-primary/5' : ''}
                                `}
                            />
                            {/* Loading or Clear button */}
                            {toursLoading ? (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                </div>
                            ) : (tourSearchTerm || selectedTour) ? (
                                <button
                                    type="button"
                                    onClick={handleClearTour}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-error/10 text-text-muted hover:text-error transition-colors"
                                    title="Xóa bộ lọc tour"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            ) : null}
                        </div>

                        {/* Selected tour badge */}
                        {selectedTour && selectedTourLabel && (
                            <div className="mt-1.5 flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                    <Map className="w-3 h-3" />
                                    {selectedTourLabel}
                                    <button onClick={handleClearTour} className="ml-0.5 hover:text-error transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            </div>
                        )}

                        {/* Suggestions Dropdown */}
                        {showTourSuggestions && (
                            <div className="absolute z-[9999] w-full mt-1.5 rounded-xl shadow-lg overflow-hidden bg-surface border border-border animate-in fade-in slide-in-from-top-1 duration-200">
                                <div
                                    ref={suggestionsRef}
                                    className="overflow-y-auto max-h-64 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600"
                                >
                                    {toursLoading ? (
                                        <div className="px-3 py-6 text-center text-sm text-text-muted flex flex-col items-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                            <span>Đang tìm kiếm tour...</span>
                                        </div>
                                    ) : tours.length > 0 ? (
                                        tours.map((tour, index) => {
                                            const isSelected = selectedTour === String(tour.id);
                                            const isHighlighted = highlightedIndex === index;
                                            return (
                                                <button
                                                    key={tour.id}
                                                    type="button"
                                                    data-suggestion
                                                    onClick={() => handleSelectTour(tour)}
                                                    onMouseEnter={() => setHighlightedIndex(index)}
                                                    className={`
                                                        w-full px-3 py-2.5 text-left text-sm transition-colors duration-150 flex items-center gap-2
                                                        ${isSelected
                                                            ? 'bg-primary text-white font-medium'
                                                            : isHighlighted
                                                                ? (isDark ? 'bg-surface-hover text-text' : 'bg-surface-alt text-text')
                                                                : 'text-text-secondary hover:bg-surface-alt'
                                                        }
                                                    `}
                                                >
                                                    <Map className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-text-muted'}`} />
                                                    <span className="truncate">
                                                        {tourSearchTerm.trim() ? highlightText(tour.title, tourSearchTerm) : tour.title}
                                                    </span>
                                                </button>
                                            );
                                        })
                                    ) : tourSearchTerm.trim() ? (
                                        <div className="px-3 py-6 text-center text-sm text-text-muted">
                                            Không tìm thấy tour nào cho "{tourSearchTerm}"
                                        </div>
                                    ) : (
                                        <div className="px-3 py-4 text-center text-sm text-text-muted">
                                            Nhập từ khóa để tìm tour...
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Time Filter — CustomSelect */}
                    <div className="min-w-[180px]">
                        <CustomSelect
                            value={selectedTime}
                            onChange={(val) => { setSelectedTime(val); setCurrentPage(1); }}
                            options={timeOptions}
                            placeholder="Tất cả thời gian"
                            icon={<Calendar className="w-4 h-4" />}
                        />
                    </div>
                </div>
            </div>

            {loading && <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}

            {!loading && (
                <>
                    {/* Dashboard Stats */}
                    <div className="grid lg:grid-cols-3 gap-6 mb-8">
                        
                        {/* Top Tours Ranking */}
                        <div className="lg:col-span-1 bg-surface border border-border rounded-2xl p-6 shadow-sm">
                            <h2 className="text-sm font-bold text-text mb-4 uppercase tracking-wider flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Top 5 Tour Đánh Giá Cao
                            </h2>
                            {topTours.length > 0 ? (
                                <div className="space-y-4">
                                    {topTours.map((t, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-surface-alt rounded-xl">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-black text-primary">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-text truncate" title={t.Tour?.title}>
                                                    {t.Tour?.title || 'Tour ẩn'}
                                                </p>
                                                <p className="text-xs text-text-muted mt-0.5">
                                                    {Number(t.avgRating).toFixed(1)} / 5 ({t.reviewCount} lượt)
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-text-muted text-sm">Chưa có số liệu đánh giá.</div>
                            )}
                        </div>

                        {/* Pie Chart */}
                        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6 shadow-sm">
                            <h2 className="text-sm font-bold text-text mb-4 uppercase tracking-wider flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-blue-500" />
                                {selectedTour ? 'Tỷ lệ điểm tương ứng với Tour đã lọc' : 'Thống kê đánh giá toàn hệ thống'}
                            </h2>
                            {stats.length > 0 ? (
                                <HighchartsReact highcharts={Highcharts} options={pieChartOptions} />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[300px] text-text-muted">
                                    <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                                    <p>Chưa có dữ liệu thống kê cho bộ lọc này.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[400px]">
                        <div className="p-4 border-b border-border bg-surface-alt flex justify-between items-center">
                            <h2 className="font-bold text-text">Danh sách bình luận ({totalItems})</h2>
                        </div>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-alt border-b border-border">
                                        <th className="p-4 text-xs font-semibold text-text-muted uppercase">Khách hàng</th>
                                        <th className="p-4 text-xs font-semibold text-text-muted uppercase">Tour</th>
                                        <th className="p-4 text-xs font-semibold text-text-muted uppercase">Rating & Comment</th>
                                        <th className="p-4 text-xs font-semibold text-text-muted uppercase">Ngày đăng</th>
                                        <th className="p-4 text-xs font-semibold text-text-muted uppercase flex justify-end">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reviews.length > 0 ? (
                                        reviews.map((v) => (
                                            <tr key={v.id} className="border-b border-border hover:bg-surface-hover transition-colors">
                                                <td className="p-4">
                                                    <p className="font-semibold text-sm text-text">{v.customer_name}</p>
                                                </td>
                                                <td className="p-4">
                                                    <p className="text-sm text-text max-w-[200px] truncate" title={v.Tour?.title}>
                                                        {v.Tour?.title || 'Đã xóa'}
                                                    </p>
                                                </td>
                                                <td className="p-4 max-w-sm">
                                                    <div className="flex items-center gap-1 mb-1">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star key={i} className={`w-3 h-3 ${i < v.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                                                        ))}
                                                    </div>
                                                    <p className="text-sm text-text-muted italic line-clamp-2" title={v.comment}>
                                                        {v.comment ? `"${v.comment}"` : '- Không có nhận xét -'}
                                                    </p>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-xs text-text-muted">
                                                        {v.created_at ? format(new Date(v.created_at), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                                                v.is_approved 
                                                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                            }`}
                                                            onClick={() => handleApprove(v.id, v.is_approved)}
                                                        >
                                                            {v.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(v.id)}
                                                            className="p-1.5 text-error hover:bg-error/10 rounded-lg transition-colors"
                                                            title="Xóa vĩnh viễn"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-text-muted">
                                                Không có bình luận nào phù hợp
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="p-4 border-t border-border flex items-center justify-between bg-surface">
                                <span className="text-sm text-text-muted hidden sm:block">
                                    Đang xem trang {currentPage} / {totalPages}
                                </span>
                                <div className="flex gap-2 mx-auto sm:mx-0">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => p - 1)}
                                        className="p-2 border border-border rounded-xl text-text hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`w-9 h-9 rounded-xl text-sm font-medium ${
                                                    currentPage === i + 1 
                                                    ? 'bg-primary text-white shadow-md' 
                                                    : 'text-text hover:bg-surface-hover'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(p => p + 1)}
                                        className="p-2 border border-border rounded-xl text-text hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </AdminLayout>
    );
}

/**
 * Highlight matching text segments in tour name
 */
function highlightText(text, term) {
    if (!term.trim()) return text;
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
        <span>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="bg-primary/20 text-inherit rounded-sm px-0.5">{part}</mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </span>
    );
}
