import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { adminService } from '@/services/tourService';
import { Loader2, Trash2, Calendar, Map, Star, MessageSquare, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { toast } from 'sonner';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ReviewManagementPage() {
    const [selectedTour, setSelectedTour] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [tours, setTours] = useState([]);
    
    // Pagination for table
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [topTours, setTopTours] = useState([]);
    const [stats, setStats] = useState([]);
    const [reviews, setReviews] = useState([]);
    
    const [loading, setLoading] = useState(true);

    // Fetch dropdown list of tours
    const fetchToursDropdown = async () => {
        try {
            const res = await adminService.getTours({ limit: 1000 }); // Get max
            if (res.data?.data) {
                setTours(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching tours:', error);
        }
    };

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
        fetchToursDropdown();
    }, []);

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
                
                <div className="flex-1 flex flex-wrap gap-4 max-w-2xl">
                    {/* Tour Filter */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Map className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <select
                            value={selectedTour}
                            onChange={(e) => { setSelectedTour(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-9 pr-4 py-2 bg-surface-alt border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                        >
                            <option value="">Tất cả Tour hệ thống</option>
                            {tours.map(t => (
                                <option key={t.id} value={t.id}>{t.title}</option>
                            ))}
                        </select>
                    </div>

                    {/* Time Filter */}
                    <div className="relative min-w-[160px]">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <select
                            value={selectedTime}
                            onChange={(e) => { setSelectedTime(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-9 pr-4 py-2 bg-surface-alt border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                        >
                            <option value="">Tất cả thời gian</option>
                            <option value="7days">7 ngày qua</option>
                            <option value="month">Tháng này</option>
                        </select>
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
                                                    ⭐ {Number(t.avgRating).toFixed(1)} / 5 ({t.reviewCount} lượt)
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
