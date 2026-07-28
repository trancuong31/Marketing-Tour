import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { adminService } from '@/services/tourService';
import { Loader2, Calendar, Map, Star, MessageSquare, Filter, X } from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
import ReviewManagementTable from '../components/ReviewManagementTable';
import { toast } from 'sonner';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';
import { useThemeStore } from '@/store';

export default function ReviewManagementPage() {
    const [selectedTour, setSelectedTour] = useState('');
    const [selectedTourLabel, setSelectedTourLabel] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [approvalFilter, setApprovalFilter] = useState(''); // '' = all, '1' = approved, '0' = pending
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
    const [improvementTours, setImprovementTours] = useState([]);
    const [rankingTab, setRankingTab] = useState('top');
    const [stats, setStats] = useState([]);
    const [reviews, setReviews] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const initialLoadsRef = useRef({ overview: false, reviews: false });
    const overviewRequestRef = useRef({ key: '', promise: null });
    const reviewsRequestRef = useRef({ key: '', promise: null });

    const markInitialLoadDone = useCallback((key) => {
        initialLoadsRef.current[key] = true;
        if (initialLoadsRef.current.overview && initialLoadsRef.current.reviews) {
            setLoading(false);
        }
    }, []);

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

    const fetchOverviewData = useCallback(async (force = false) => {
        const requestKey = JSON.stringify({ selectedTime });
        if (!force && overviewRequestRef.current.key === requestKey && overviewRequestRef.current.promise) {
            return overviewRequestRef.current.promise;
        }

        const requestPromise = (async () => {
            const statsParams = { time: selectedTime };
            const topParams = { time: selectedTime };
            const improvementParams = { time: selectedTime, mode: 'improvement' };

            const [topRes, improvementRes, statsRes] = await Promise.all([
                adminService.getTopRatedTours(topParams),
                adminService.getTopRatedTours(improvementParams),
                adminService.getReviewStats(statsParams),
            ]);

            setTopTours(topRes.data?.data || []);
            setImprovementTours(improvementRes.data?.data || []);
            setStats(statsRes.data?.data || []);
        })();

        overviewRequestRef.current = { key: requestKey, promise: requestPromise };

        try {
            await requestPromise;
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi tải thống kê đánh giá');
        } finally {
            markInitialLoadDone('overview');
            if (overviewRequestRef.current.promise === requestPromise) {
                overviewRequestRef.current.promise = null;
            }
        }
    }, [selectedTime, markInitialLoadDone]);

    const fetchReviewsData = useCallback(async (force = false) => {
        const requestKey = JSON.stringify({ selectedTour, selectedTime, currentPage, approvalFilter });
        if (!force && reviewsRequestRef.current.key === requestKey && reviewsRequestRef.current.promise) {
            return reviewsRequestRef.current.promise;
        }

        setReviewsLoading(true);

        const requestPromise = (async () => {
            const voteParams = { page: currentPage, limit: 10 };
            if (selectedTour) voteParams.tour_id = selectedTour;
            if (selectedTime) voteParams.time = selectedTime;
            if (approvalFilter !== '') voteParams.approved = approvalFilter;

            const reviewsRes = await adminService.getVotes(voteParams);

            if (reviewsRes.data?.data) {
                setReviews(reviewsRes.data.data);
                setTotalPages(reviewsRes.data.totalPages || 1);
                setTotalItems(reviewsRes.data.totalItems || 0);
            }
        })();

        reviewsRequestRef.current = { key: requestKey, promise: requestPromise };

        try {
            await requestPromise;
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi tải dữ liệu đánh giá');
        } finally {
            markInitialLoadDone('reviews');
            if (reviewsRequestRef.current.promise === requestPromise) {
                setReviewsLoading(false);
                reviewsRequestRef.current.promise = null;
            }
        }
    }, [selectedTour, selectedTime, currentPage, approvalFilter, markInitialLoadDone]);

    const fetchData = useCallback(async () => {
        await Promise.all([
            fetchOverviewData(true),
            fetchReviewsData(true),
        ]);
    }, [fetchOverviewData, fetchReviewsData]);

    useEffect(() => {
        fetchToursDropdown(); // Load initial tours
    }, [fetchToursDropdown]);

    useEffect(() => {
        fetchOverviewData();
    }, [fetchOverviewData]);

    useEffect(() => {
        fetchReviewsData();
    }, [fetchReviewsData]);

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

    const handleReply = async (v) => {
        const reply = window.prompt(`Trả lời đánh giá của ${v.customer_name}:`, v.admin_reply || '');
        if (reply === null) return; // User cancelled
        
        try {
            await adminService.replyToVote(v.id, reply);
            toast.success('Gửi phản hồi thành công');
            fetchData();
        } catch (error) {
            toast.error('Lỗi khi gửi phản hồi');
        }
    };

    // Highcharts options
    // Calculate total average for middle display
    const chartData = useMemo(() => stats.map(s => ({
        name: `${s.rating} Sao`,
        y: parseInt(s.count),
    })), [stats]);
    const totalVotes = useMemo(() => stats.reduce((acc, s) => acc + parseInt(s.count), 0), [stats]);
    const avgRating = useMemo(() => totalVotes > 0
        ? (stats.reduce((acc, s) => acc + (s.rating * s.count), 0) / totalVotes).toFixed(1)
        : '0.0', [stats, totalVotes]);
    const rankingTabs = [
        { value: 'top', label: 'Top 5 Tour nổi bật' },
        { value: 'improvement', label: 'Top 5 Tour cần cải thiện' },
    ];
    const activeRankingTours = rankingTab === 'top' ? topTours : improvementTours;
    const activeRankingTitle = rankingTabs.find(tab => tab.value === rankingTab)?.label || rankingTabs[0].label;

    const pieChartOptions = useMemo(() => ({
        chart: { type: 'pie', backgroundColor: 'transparent', height: 350 },
        title: { 
            text: `<div style="text-align:center"><span style="font-size:32px; font-weight:bold; color:var(--text)">${avgRating}</span><br><span style="font-size:14px; color:var(--text-muted)">Sao Trung Bình</span></div>`,
            align: 'center',
            verticalAlign: 'middle',
            useHTML: true,
            y: 15
        },
        credits: { enabled: false },
        accessibility: { enabled: false },
        tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b> ({point.y})' },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                },
                innerSize: '70%'
            }
        },
        series: [{
            name: 'Đánh giá',
            colorByPoint: true,
            data: chartData
        }],
        colors: ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444']
    }), [avgRating, chartData]);

    return (
        <AdminLayout>
            <div className="mb-4">
                <p className="text-sm text-text-muted">Phân tích và theo dõi phản hồi của khách hàng</p>
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
                        <div>
                            <SearchBar
                                variant="admin"
                                value={tourSearchTerm}
                                onChange={(e) => handleTourInputChange(e.target.value)}
                                onFocus={() => { setShowTourSuggestions(true); if (!tourSearchTerm) fetchToursDropdown(''); }}
                                onKeyDown={handleTourKeyDown}
                                onClear={handleClearTour}
                                placeholder="Nhập tên tour để tìm kiếm..."
                                loading={toursLoading}
                            />
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
                            <div className="absolute z-[9999] w-full mt-1.5 rounded-lg shadow-lg overflow-hidden bg-surface border border-border animate-in fade-in slide-in-from-top-1 duration-200">
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
                                            Không tìm thấy tour nào cho <span className="font-semibold">{tourSearchTerm}</span>
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
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {activeRankingTitle}
                            </h2>
                            <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-surface-alt p-1">
                                {rankingTabs.map(tab => (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        onClick={() => setRankingTab(tab.value)}
                                        className={`px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${
                                            rankingTab === tab.value
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'text-text-secondary hover:bg-surface hover:text-text'
                                        }`}
                                    >
                                        {tab.value === 'top' ? 'Đánh giá cao' : 'Cần cải thiện'}
                                    </button>
                                ))}
                            </div>
                            {activeRankingTours.length > 0 ? (
                                <div className="space-y-4">
                                    {activeRankingTours.map((t, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-surface-alt rounded-lg">
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

                        {/* Chart and Summary */}
                        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6 shadow-sm">
                            <h2 className="text-sm font-bold text-text mb-6 uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
                                <MessageSquare className="w-4 h-4 text-blue-500" />
                                Đánh giá toàn hệ thống
                            </h2>
                            
                            {stats.length > 0 ? (
                                <div className="grid md:grid-cols-5 gap-8 items-center">
                                    {/* Left: Summary Metrics */}
                                    <div className="md:col-span-2 space-y-5">
                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <div className="text-5xl font-black text-text leading-tight">{avgRating}</div>
                                                <div className="flex justify-center mt-1">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Star 
                                                            key={s} 
                                                            className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-border'}`} 
                                                        />
                                                    ))}
                                                </div>
                                                <div className="text-xs text-text-muted mt-2 font-medium uppercase">{totalVotes} nhận xét</div>
                                            </div>
                                            
                                            <div className="flex-1 space-y-2">
                                                {[5, 4, 3, 2, 1].map(num => {
                                                    const stat = stats.find(s => s.rating === num) || { count: 0 };
                                                    const percentage = totalVotes > 0 ? (stat.count / totalVotes) * 100 : 0;
                                                    return (
                                                        <div key={num} className="flex items-center gap-3 group">
                                                            <div className="flex items-center gap-1 w-12 shrink-0">
                                                                <span className="text-xs font-bold text-text">{num}</span>
                                                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                            </div>
                                                            <div className="flex-1 h-2 bg-surface-alt rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-amber-400 rounded-full transition-all duration-1000 ease-out" 
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            </div>
                                                            <div className="w-8 text-right">
                                                                <span className="text-[10px] font-bold text-text-muted group-hover:text-primary transition-colors">
                                                                    {stat.count}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        
                                        <div className="pt-4 border-t border-border/50">
                                            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                                                <p className="text-[11px] text-primary font-medium leading-relaxed italic">
                                                    Hầu hết khách hàng hài lòng với chất lượng dịch vụ và hướng dẫn viên nhiệt tình.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: The Donut Chart */}
                                    <div className="md:col-span-3">
                                        <HighchartsReact highcharts={Highcharts} options={pieChartOptions} />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[300px] text-text-muted">
                                    <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                                    <p>Chưa có dữ liệu thống kê cho bộ lọc này.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <ReviewManagementTable
                        reviews={reviews}
                        totalItems={totalItems}
                        reviewsLoading={reviewsLoading}
                        approvalFilter={approvalFilter}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onApprovalFilterChange={(value) => {
                            setApprovalFilter(value);
                            setCurrentPage(1);
                        }}
                        onPageChange={setCurrentPage}
                        onReply={handleReply}
                        onApprove={handleApprove}
                        onDelete={handleDelete}
                    />
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
