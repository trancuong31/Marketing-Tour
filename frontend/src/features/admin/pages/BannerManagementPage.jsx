import { useState, useEffect, useRef } from 'react';
import { adminService } from '@/services/tourService';
import { getImageUrl } from '@/utils/imageUrl';
import AdminLayout from '@/components/layout/AdminLayout';
import BannerTourGridItem from '../components/BannerTourGridItem';
import BannerTourListItem from '../components/BannerTourListItem';
import {
    Image, Plus, Pencil, Trash2, X, Loader2, Upload,
    Monitor, Eye, EyeOff, Link2, Search, Check, LayoutGrid, List
} from 'lucide-react';
import { toast } from 'sonner';

const BannerManagementPage = () => {
    const [viewLayout, setViewLayout] = useState(() => localStorage.getItem('admin_banner_layout') || 'grid');
    const [banners, setBanners] = useState([]);
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tourSearch, setTourSearch] = useState('');
    const [submittingTourId, setSubmittingTourId] = useState(null);
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

    useEffect(() => {
        localStorage.setItem('admin_banner_layout', viewLayout);
    }, [viewLayout]);

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
            setSubmittingTourId(tour.id);
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
                    setSubmittingTourId(null);
                    return;
                }

                await adminService.createBanner(fd);
                const res = await adminService.getBanners();
                setBanners(res.data.data || []);
                toast.success(`Đã thêm tour "${tour.title}" vào slider thành công`);
            } catch (err) {
                toast.error('Lỗi khi thêm tour vào slider');
            } finally {
                setSubmittingTourId(null);
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
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Tìm tour nhanh..."
                            value={tourSearch}
                            onChange={e => setTourSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border w-full sm:w-auto justify-center">
                        <button 
                            onClick={() => setViewLayout('grid')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${viewLayout === 'grid' ? 'bg-surface-alt shadow-sm text-primary' : 'text-text-muted hover:text-text-secondary hover:bg-surface-hover'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            <span className="hidden sm:block">Lưới</span>
                        </button>
                        <button 
                            onClick={() => setViewLayout('list')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${viewLayout === 'list' ? 'bg-surface-alt shadow-sm text-primary' : 'text-text-muted hover:text-text-secondary hover:bg-surface-hover'}`}
                        >
                            <List className="w-4 h-4" />
                            <span className="hidden sm:block">Danh sách</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══ TOUR SELECTION GRID ═══ */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 overflow-auto scrollbar-hide">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-text-muted mt-3">Đang tải danh sách tour...</p>
                </div>
            ) : (
                <div className={viewLayout === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-up" : "flex flex-col gap-4 animate-fade-up"}>
                    {filteredTours.map((tour, idx) => {
                        const isPinned = heroTourIds.includes(tour.id);
                        const isActionLoading = (submittingTourId !== null) || (deleting !== null);
                        const isItemLoading = (isPinned && deleting === banners.find(b => b.tour_id === tour.id)?.id) || (!isPinned && submittingTourId === tour.id);

                        return viewLayout === 'grid' ? (
                            <BannerTourGridItem 
                                key={tour.id} 
                                tour={tour} 
                                isPinned={isPinned} 
                                isActionLoading={isActionLoading}
                                isItemLoading={isItemLoading}
                                onToggle={toggleTourInHero}
                                idx={idx}
                            />
                        ) : (
                            <BannerTourListItem 
                                key={tour.id} 
                                tour={tour} 
                                isPinned={isPinned} 
                                isActionLoading={isActionLoading}
                                isItemLoading={isItemLoading}
                                onToggle={toggleTourInHero}
                                idx={idx}
                            />
                        );
                    })}
                </div>
            )}
        </AdminLayout>
    );
};

export default BannerManagementPage;
