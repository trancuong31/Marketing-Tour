import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { tourService, bannerService } from '@/services/tourService';
import TourCard from '@/components/tour/TourCard';
import ClientLayout from '@/components/layout/ClientLayout';
import { Compass, Star, MapPin, Globe2, ChevronRight, Sparkles, ChevronLeft } from 'lucide-react';

const HomePage = () => {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [heroBanners, setHeroBanners] = useState([]);
    const [heroIndex, setHeroIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tourRes, heroRes] = await Promise.all([
                    tourService.getAll(),
                    bannerService.getByPosition('hero'),
                ]);
                setTours(tourRes.data.data || []);
                setHeroBanners(heroRes.data.data || []);
            } catch (err) {
                console.error('Lỗi tải dữ liệu:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Hero slideshow auto-play
    useEffect(() => {
        if (heroBanners.length <= 1) return;
        const timer = setInterval(() => {
            setHeroIndex(prev => (prev + 1) % heroBanners.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [heroBanners.length]);

    const featured = tours.filter(t => t.tour_badge === 'featured').slice(0, 6);
    const onSale = tours.filter(t => t.tour_badge === 'promotion' && t.sale_price_adult && parseFloat(t.sale_price_adult) < parseFloat(t.price_adult)).slice(0, 6);

    const getImageUrl = useCallback((url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const hostname = window.location.hostname;
        const isLocal = hostname === 'localhost' || hostname.startsWith('192.168.');
        const base = isLocal
            ? (import.meta.env.VITE_API_URL_LOCAL || 'http://localhost:8888').replace('/api', '')
            : (import.meta.env.VITE_API_URL_PUBLIC || '').replace('/api', '');
        return `${base}${url}`;
    }, []);

    const handleBannerClick = (banner) => {
        if (banner.target_link) {
            if (banner.target_link.startsWith('http')) {
                window.open(banner.target_link, '_blank');
            } else {
                navigate(banner.target_link);
            }
        }
    };

    const SkeletonGrid = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-border animate-pulse">
                    <div className="aspect-[16/10] bg-surface-alt" />
                    <div className="p-5 space-y-3">
                        <div className="h-3 bg-surface-alt rounded w-1/3" />
                        <div className="h-5 bg-surface-alt rounded w-3/4" />
                        <div className="h-4 bg-surface-alt rounded w-full" />
                        <div className="h-4 bg-surface-alt rounded w-2/3" />
                        <div className="h-6 bg-surface-alt rounded w-1/3 ml-auto" />
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <ClientLayout>
            {/* ═══ HERO BANNER ═══ */}
            <section className="relative overflow-hidden py-20 sm:py-28 px-4 min-h-[550px] flex items-center justify-center group/hero">
                
                {/* 1. Background (Clickable) */}
                <div 
                    className="absolute inset-0 cursor-pointer z-0"
                    onClick={() => heroBanners.length > 0 && handleBannerClick(heroBanners[heroIndex])}
                    title="Xem chi tiết ưu đãi này"
                >
                    {heroBanners.length > 0 ? (
                        <>
                            {heroBanners.map((banner, idx) => (
                                <img
                                    key={banner.id}
                                    src={getImageUrl(banner.image_url)}
                                    alt={banner.title}
                                    className={`absolute inset-0 w-full h-full object-cover brightness-[0.45] transition-opacity duration-1000 ${
                                        idx === heroIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                                    } duration-[10s]`}
                                />
                            ))}
                        </>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary via-primary-dark to-accent" />
                    )}
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto pointer-events-none">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-medium mb-6 text-white drop-shadow-md">
                            <Compass className="w-4 h-4" />
                            Khám phá thế giới cùng chúng tôi
                        </div>

                        {/* Title cố định */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 text-white drop-shadow-lg">
                            Hành trình đáng nhớ
                            <br />
                            <span className="bg-gradient-to-r from-secondary to-yellow-300 bg-clip-text text-transparent drop-shadow-md">
                                bắt đầu từ đây
                            </span>
                        </h1>
                        <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-8 drop-shadow-md font-medium">
                            Tour du lịch nội địa và quốc tế chất lượng cao với giá tốt nhất
                        </p>

                        <div className="flex flex-wrap justify-center gap-4 pointer-events-auto">
                            <Link
                                to="/tours/noi-dia"
                                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl hover:bg-white/25 transition border border-white/30 text-sm shadow-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MapPin className="w-4 h-4" />
                                Tour Nội Địa
                                <ChevronRight className="w-4 h-4 opacity-70" />
                            </Link>
                            <Link
                                to="/tours/quoc-te"
                                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl hover:bg-white/25 transition border border-white/30 text-sm shadow-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Globe2 className="w-4 h-4" />
                                Tour Quốc Tế
                                <ChevronRight className="w-4 h-4 opacity-70" />
                            </Link>
                        </div>
                    </div>

                    {/* 3. Banner Title (Lệch phải) */}
                    {heroBanners.length > 0 && heroBanners[heroIndex]?.title && (
                        <div 
                            className="absolute top-1/2 -translate-y-1/2 right-4 lg:right-12 hidden md:block pointer-events-auto cursor-pointer group"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleBannerClick(heroBanners[heroIndex]);
                            }}
                        >
                            <div className="bg-black/30 backdrop-blur-md border border-white/20 p-5 rounded-2xl shadow-2xl hover:bg-black/50 transition duration-300 max-w-xs xl:max-w-sm hover:-translate-x-2 transform">
                                <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    Giá chỉ từ 
                                </p>
                                <div className="flex items-start gap-4 justify-between">
                                    <h3 className="text-white font-bold text-lg leading-snug line-clamp-3">
                                        {heroBanners[heroIndex].title}
                                    </h3>
                                    <div className="bg-white/20 p-2 rounded-full group-hover:bg-primary transition-colors flex-shrink-0 mt-0.5">
                                        <ChevronRight className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. Slideshow dots */}
                {heroBanners.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-3 z-20 pointer-events-auto">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setHeroIndex(prev => (prev - 1 + heroBanners.length) % heroBanners.length);
                            }}
                            className="p-1.5 rounded-full bg-white/10 backdrop-blur hover:bg-white/30 transition border border-white/20"
                        >
                            <ChevronLeft className="w-4 h-4 text-white" />
                        </button>
                        
                        <div className="flex gap-2">
                            {heroBanners.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setHeroIndex(idx);
                                    }}
                                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                        idx === heroIndex
                                            ? 'bg-secondary w-8' 
                                            : 'bg-white/50 hover:bg-white'
                                    }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setHeroIndex(prev => (prev + 1) % heroBanners.length);
                            }}
                            className="p-1.5 rounded-full bg-white/10 backdrop-blur hover:bg-white/30 transition border border-white/20"
                        >
                            <ChevronRight className="w-4 h-4 text-white" />
                        </button>
                    </div>
                )}
            </section>

            {/* ═══ MAIN CONTENT: CENTER ═══ */}
            <div className="mx-auto px-4 sm:px-6 py-12">
                <div className="max-w-7xl mx-auto flex gap-6 w-full">

                    {/* ── Main Content ── */}
                    <div className="flex-1 min-w-0 space-y-16">
                        {/* ═══ TOUR NỔI BẬT ═══ */}
                        <section>
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                                        <Star className="w-5 h-5 text-secondary" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-text">Tour Nổi Bật</h2>
                                        <p className="text-sm text-text-muted">Những hành trình được yêu thích nhất</p>
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <SkeletonGrid />
                            ) : featured.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {featured.map((tour, i) => (
                                        <div key={tour.id} className="animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                                            <TourCard tour={tour} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-text-muted py-8">Chưa có tour nổi bật nào</p>
                            )}
                            {featured.length >= 6 && (
                                <div className="flex justify-center mt-8">
                                    <Link
                                        to="/tours?tour_badge=featured"
                                        className="inline-flex items-center gap-2 px-6 py-3 text-white border border-primary font-bold rounded-xl transition shadow-lg"
                                    >
                                        Xem thêm
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            )}
                        </section>

                        {/* ═══ TOUR SALE ═══ */}
                        {(loading || onSale.length >= 0) && (
                            <section className="bg-gradient-to-b from-white to-surface-alt py-12 -mx-4 sm:-mx-6 px-4 sm:px-6 rounded-3xl">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-error" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold text-text">Tour Ưu Đãi Tốt Nhất Hôm Nay</h2>
                                            <p className="text-sm text-text-muted">Tour giảm giá đặc biệt, số lượng có hạn</p>
                                        </div>
                                    </div>
                                </div>
                                {onSale.length === 0 && !loading && (
                                    <p className="text-center text-text-muted py-8">Chưa có tour ưu đãi nào</p>
                                )}
                                {loading ? (
                                    <SkeletonGrid />
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {onSale.map((tour, i) => (
                                            <div key={tour.id} className="animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                                                <TourCard tour={tour} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {onSale.length >= 6 && (
                                    <div className="flex justify-center mt-8">
                                        <Link
                                            to="/tours?tour_badge=promotion"
                                            className="inline-flex items-center gap-2 px-6 py-3 text-white border border-primary font-bold rounded-xl transition shadow-lg"
                                        >
                                            Xem thêm
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                )}
                            </section>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ BROWSE BY TYPE ═══ */}
            <section
                className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24"
                aria-labelledby="browse-type-heading"
            >
                <div className="text-center mb-10 lg:mb-14">
                    <h2
                        id="browse-type-heading"
                        className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight"
                    >
                        Khám Phá Hành Trình Của Bạn
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto text-base sm:text-lg">
                        Lựa chọn điểm đến lý tưởng cho kỳ nghỉ sắp tới với các tour du lịch đa dạng, chất lượng cao từ trong nước đến quốc tế.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* TOUR NỘI ĐỊA */}
                    <Link
                        to="/tours/noi-dia"
                        className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0068FF] to-[#004bbd] p-8 sm:p-10 min-h-[280px] sm:min-h-[320px] flex flex-col justify-between text-white shadow-lg hover:shadow-2xl transition-all duration-300"
                        aria-label="Xem tất cả Tour Nội Địa"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-white/20 transition-colors duration-500" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <MapPin className="w-7 h-7 text-white" strokeWidth={2.5} />
                            </div>
                            <h3 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">Tour Nội Địa</h3>
                            <p className="text-white/80 text-base sm:text-lg max-w-md line-clamp-2">
                                Khám phá vẻ đẹp bất tận của Việt Nam từ miền non nước hữu tình đến những bãi biển thơ mộng.
                            </p>
                        </div>
                        <div className="relative z-10 mt-8">
                            <span className="inline-flex items-center gap-2 text-sm sm:text-base font-bold bg-white text-[#0068FF] px-6 py-3 rounded-full group-hover:bg-gray-50 transition-colors w-fit shadow-md">
                                Xem danh sách <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </div>
                    </Link>

                    {/* TOUR QUỐC TẾ */}
                    <Link
                        to="/tours/quoc-te"
                        className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 p-8 sm:p-10 min-h-[280px] sm:min-h-[320px] flex flex-col justify-between text-white shadow-lg hover:shadow-2xl transition-all duration-300"
                        aria-label="Xem tất cả Tour Quốc Tế"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-white/20 transition-colors duration-500" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Globe2 className="w-7 h-7 text-white" strokeWidth={2.5} />
                            </div>
                            <h3 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">Tour Quốc Tế</h3>
                            <p className="text-white/80 text-base sm:text-lg max-w-md line-clamp-2">
                                Trải nghiệm văn hóa đa dạng, thưởng thức ẩm thực độc đáo và chinh phục những vùng đất mới khắp thế giới.
                            </p>
                        </div>
                        <div className="relative z-10 mt-8">
                            <span className="inline-flex items-center gap-2 text-sm sm:text-base font-bold bg-white text-teal-700 px-6 py-3 rounded-full group-hover:bg-gray-50 transition-colors w-fit shadow-md">
                                Xem danh sách <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </div>
                    </Link>
                </div>
            </section>
        </ClientLayout>
    );
};

export default HomePage;
