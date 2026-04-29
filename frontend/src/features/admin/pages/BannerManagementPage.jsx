import { useState, useEffect, useRef } from 'react';
import { adminService } from '@/services/tourService';
import { getImageUrl } from '@/utils/imageUrl';
import AdminLayout from '@/components/layout/AdminLayout';
import {
    Image, Plus, Pencil, Trash2, X, Loader2, Upload,
    Monitor, Eye, EyeOff, Link2, Search, Check,
} from 'lucide-react';
import { toast } from 'sonner';

const BannerManagementPage = () => {
    const [banners, setBanners] = useState([]);
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tourSearch, setTourSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(null);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [bannerRes, tourRes] = await Promise.all([
                adminService.getBanners(),
                adminService.getTours({ limit: 100 })
            ]);
            setBanners(bannerRes.data.data || []);
            setTours(tourRes.data.data || []);
        } catch (err) {
            console.error('Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const performToggle = async (tour, existingBanner) => {
        if (existingBanner) {
            setDeleting(existingBanner.id);
            try {
                await adminService.deleteBanner(existingBanner.id);
                const res = await adminService.getBanners();
                setBanners(res.data.data || []);
                toast.success(`Đã gỡ tour "${tour.title}" khỏi slider`);
            } catch (err) {
                toast.error('Lỗi khi gỡ tour');
            } finally {
                setDeleting(null);
            }
        } else {
            setSubmitting(true);
            try {
                const fd = new FormData();
                fd.append('title', tour.title);
                fd.append('target_link', `/tours/${tour.slug}`);
                fd.append('position', 'hero');
                fd.append('is_active', 1);
                fd.append('tour_id', tour.id);

                const thumbnail = tour.thumbnail_url || (tour.images && tour.images[0]?.image_url);
                if (thumbnail) {
                    const imgUrl = getImageUrl(thumbnail);
                    const response = await fetch(imgUrl);
                    const blob = await response.blob();
                    const file = new File([blob], 'banner.jpg', { type: blob.type });
                    fd.append('image', file);
                } else {
                    toast.error('Tour này không có ảnh để làm banner!');
                    setSubmitting(false);
                    return;
                }

                await adminService.createBanner(fd);
                const res = await adminService.getBanners();
                setBanners(res.data.data || []);
                toast.success(`Đã thêm tour "${tour.title}" vào slider thành công`);
            } catch (err) {
                toast.error('Lỗi khi thêm tour vào slider');
            } finally {
                setSubmitting(false);
            }
        }
    };

    const toggleTourInHero = (tour) => {
        const existingBanner = banners.find(b => b.tour_id === tour.id && b.position === 'hero');
        
        if (existingBanner) {
            toast('Xác nhận gỡ', {
                description: `Bạn có chắc chắn muốn gỡ tour "${tour.title}" khỏi slider trang chủ?`,
                action: {
                    label: 'Gỡ',
                    onClick: () => performToggle(tour, existingBanner)
                },
                cancel: {
                    label: 'Hủy'
                },
                duration: 5000,
            });
        } else {
            performToggle(tour, null);
        }
    };

    const filteredTours = tourSearch
        ? tours.filter(t => t.title.toLowerCase().includes(tourSearch.toLowerCase()))
        : tours;

    const heroTourIds = banners.filter(b => b.position === 'hero').map(b => b.tour_id);

    return (
        <AdminLayout>
            {/* ═══ PAGE HEADER ═══ */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text">Quản lý Slider Trang chủ</h1>
                    <p className="text-sm text-text-muted mt-1">
                        Chọn tối đa 5-7 tour tiêu biểu để hiển thị trên slider lớn tại đầu trang chủ
                    </p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        placeholder="Tìm tour nhanh..."
                        value={tourSearch}
                        onChange={e => setTourSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
            </div>

            {/* ═══ TOUR SELECTION GRID ═══ */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-text-muted mt-3">Đang tải danh sách tour...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-up">
                    {filteredTours.map((tour, idx) => {
                        const isPinned = heroTourIds.includes(tour.id);
                        const isActionLoading = submitting || (deleting !== null);

                        return (
                            <div 
                                key={tour.id} 
                                className={`group relative bg-surface rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col ${
                                    isPinned ? 'border-primary shadow-lg ring-1 ring-primary/20' : 'border-border hover:border-primary/40 hover:shadow-md'
                                }`}
                                style={{ animationDelay: `${idx * 30}ms` }}
                            >
                                {/* Thumbnail */}
                                <div className="aspect-[16/10] overflow-hidden relative bg-surface-alt">
                                    <img 
                                        src={getImageUrl(tour.thumbnail_url || (tour.images && tour.images[0]?.image_url))} 
                                        alt={tour.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    {isPinned && (
                                        <div className="absolute top-2 right-2 bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                                            <Check className="w-3 h-3" /> Đang hiển thị
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-4 flex flex-col flex-1">
                                    <h3 className="font-bold text-text text-sm line-clamp-2 mb-4 flex-1">
                                        {tour.title}
                                    </h3>
                                    
                                    <button
                                        onClick={() => toggleTourInHero(tour)}
                                        disabled={isActionLoading}
                                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                            isPinned 
                                                ? 'bg-error/10 text-error hover:bg-error hover:text-white' 
                                                : 'bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-primary/30'
                                        }`}
                                    >
                                        { (isPinned && deleting === banners.find(b => b.tour_id === tour.id)?.id) || (submitting && !isPinned) ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : isPinned ? (
                                            <>Gỡ khỏi Slider</>
                                        ) : (
                                            <>Đưa vào Slider</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </AdminLayout>
    );
};

export default BannerManagementPage;
