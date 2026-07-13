import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tourService, bannerService } from '@/services/tourService';
import { getImageUrl, onImgError } from '@/utils/imageUrl';
import TourCard from '@/components/tour/TourCard';
import ClientLayout from '@/components/layout/ClientLayout';
import SearchBar from '@/components/ui/SearchBar';
import { Compass, MapPin, Globe2, ChevronRight, ChevronLeft } from 'lucide-react';
import banahill from '@/assets/images/banahill.webp';
import tokyo from '@/assets/images/tokyo.webp';

const HomePage = () => {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [heroBanners, setHeroBanners] = useState([]);
    const [heroIndex, setHeroIndex] = useState(0);
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(amount);
    };
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
    }, [i18n.language]);

    // Hero slideshow auto-play
    useEffect(() => {
        if (heroBanners.length <= 1) return;
        const timer = setInterval(() => {
            setHeroIndex(prev => (prev + 1) % heroBanners.length);
        }, 7000);
        return () => clearInterval(timer);
    }, [heroBanners.length]);

    const featured = tours.filter(t => t.tour_badge === 'featured' && t.departures?.length > 0).slice(0, 6);
    const onSale = tours.filter(t => t.tour_badge === 'promotion' && t.departures?.length > 0).slice(0, 6);

    const departurePriceMap = useMemo(() => {
        const map = {};
        tours.forEach(tour => {
            (tour.departures || []).forEach(dep => {
                const d = dep.departure_date;
                const p = parseFloat(dep.price_adult);
                if (!map[d] || p < map[d]) map[d] = p;
            });
        });
        return map;
    }, [tours]);

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
            <section className="relative py-12 sm:py-20 px-4 min-h-[400px] lg:min-h-[500px] flex items-center justify-center group/hero z-30">

                {/* 1. Background (Clickable) */}
                <div
                    className="absolute inset-0 cursor-pointer z-0 overflow-hidden bg-black"
                    onClick={() => heroBanners.length > 0 && handleBannerClick(heroBanners[heroIndex])}
                >
                    {heroBanners.length > 0 ? (
                        <>
                            {heroBanners.map((banner, idx) => (
                                <img
                                    key={banner.id}
                                    src={getImageUrl(banner.image_url)}
                                    alt={banner.title}
                                    className={`absolute inset-0 w-full h-full object-cover brightness-[0.45] transition-opacity duration-[1500ms] ease-in-out transform-gpu will-change-[opacity,transform] ${idx === heroIndex
                                        ? 'opacity-100 z-10 animate-ken-burns'
                                        : 'opacity-0 z-0'
                                        }`}
                                    onError={onImgError('banner')}
                                    style={{ color: 'transparent' }}
                                />
                            ))}
                        </>
                    ) : (
                        <div className="w-full h-full bg-black" />
                    )}
                </div>
                {/* Cấu trúc Content linh hoạt */}
                <div className="relative z-10 w-full max-w-[1400px] 2xl:max-w-[1800px] mx-auto pointer-events-none flex flex-col gap-6 xl:gap-8 px-2 sm:px-6 mt-4 mb-6">

                    {/* HÀNG TRÊN: Cột Trái (Slogan) & Cột Phải (Banner Info) */}
                    <div className="flex flex-col xl:flex-row items-center justify-between gap-8 xl:gap-10 w-full">
                        {/* Cột Trái: Slogan */}
                        <div className="text-center xl:text-left w-full max-w-3xl xl:max-w-4xl mx-auto xl:mx-0 flex-1">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 border border-white/20 rounded-full text-xs sm:text-sm font-medium mb-4 text-white drop-shadow-md">
                                <Compass className="w-4 h-4" />
                                {t('home.sloganTag')}
                            </div>

                            {/* Title cố định */}
                            <div className="max-w-2xl mx-auto xl:mx-0">
                                <h1
                                    className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-3 text-white drop-shadow-lg tracking-tight animate-fade-in-up"
                                >
                                    {t('home.heroTitle1')}
                                    <br />
                                    <span className="bg-gradient-to-r from-secondary to-yellow-300 bg-clip-text text-transparent drop-shadow-md">
                                        {t('home.heroTitle2')}
                                    </span>
                                </h1>
                                <p
                                    className="text-base sm:text-lg text-white/90 mb-4 drop-shadow-md font-medium max-w-xl mx-auto xl:mx-0 animate-fade-in-up delay-100"
                                >
                                    {t('home.heroDesc')}
                                </p>
                            </div>
                        </div>

                        {/* Cột Phải: Banner Info */}
                        {heroBanners.length > 0 && (
                            <div
                                key={`banner-card-${heroIndex}`}
                                className="hidden xl:block pointer-events-auto cursor-pointer group w-full max-w-sm shrink-0 animate-fade-in-right"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleBannerClick(heroBanners[heroIndex]);
                                }}
                            >
                                <div className="p-5 rounded-3xl shadow-2xl transition-all duration-500 bg-white/10 border border-white/10 hover:bg-white/20 hover:scale-[1.02]">
                                    <div className="text-white/90 text-sm font-semibold uppercase tracking-wider mb-2 flex flex-col gap-1">
                                        <span className="text-xs normal-case font-medium text-white/60">{t('home.priceFrom')}</span>
                                        <span className="text-4xl font-extrabold text-secondary drop-shadow-xl leading-none">
                                            {formatCurrency(heroBanners[heroIndex].tour?.departures?.[0]?.price_adult || 0)}
                                            <span className="text-base font-medium text-white/50 ml-1">{t('home.perGuest')}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-end gap-4 justify-between mt-6">
                                        <h3 className="text-white font-bold text-xl leading-tight line-clamp-2 drop-shadow-md">
                                            {heroBanners[heroIndex].title}
                                        </h3>
                                        <div className="bg-primary p-3 rounded-xl group-hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all duration-300 shrink-0">
                                            <ChevronRight className="w-5 h-5 text-white transition-transform duration-300" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* HÀNG DƯỚI: Search Bar*/}
                    <div className="relative z-20 pointer-events-auto w-full max-w-4xl mx-auto xl:mx-0 mt-2">
                        <SearchBar departurePriceMap={departurePriceMap} />
                    </div>
                </div>

                {/* 4. Sleek Slideshow Controls (Senior Style) */}
                {heroBanners.length > 1 && (
                    <div className="absolute bottom-8 right-8 z-40 pointer-events-auto animate-fade-in hidden lg:flex flex-col items-end gap-5">

                        {/* 1. Next Up Preview */}
                        <div className="flex flex-col items-end opacity-0 group-hover/hero:opacity-100 transition-all duration-500 translate-y-2 group-hover/hero:translate-y-0">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary mb-1">{t('home.exploreNext')}</span>
                            <span className="text-sm font-medium text-white/90 truncate max-w-[240px] drop-shadow-md">
                                {heroBanners[(heroIndex + 1) % heroBanners.length].title}
                            </span>
                        </div>

                        {/* 2. Main Navigation Block */}
                        <div className="flex items-center gap-6">
                            {/* Prev Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setHeroIndex(prev => (prev - 1 + heroBanners.length) % heroBanners.length);
                                }}
                                className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 text-white hover:bg-primary hover:border-transparent transition-all duration-300 flex items-center justify-center group/btn"
                            >
                                <ChevronLeft className="w-5 h-5 transition-transform" />
                            </button>

                            {/* Counter */}
                            <div className="text-4xl font-light tracking-tighter flex items-baseline text-white">
                                <span className="font-bold">{(heroIndex + 1).toString().padStart(2, '0')}</span>
                                <span className="mx-3 text-xl opacity-20">/</span>
                                <span className="text-xl opacity-40">{heroBanners.length.toString().padStart(2, '0')}</span>
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setHeroIndex(prev => (prev + 1) % heroBanners.length);
                                }}
                                className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 text-white hover:bg-primary hover:border-transparent transition-all duration-300 flex items-center justify-center group/btn"
                            >
                                <ChevronRight className="w-5 h-5 transition-transform" />
                            </button>
                        </div>

                        {/* 3. Visual Progress Bar */}
                        <div className="w-full h-[3px] bg-white/10 rounded-full overflow-hidden relative">
                            <div
                                key={heroIndex}
                                className="absolute left-0 top-0 h-full bg-secondary animate-slide-progress"
                            />
                        </div>
                    </div>
                )}
            </section>

            {/* ═══ MAIN CONTENT TÁCH 2 PHẦN ĐỂ SET BACKGROUND ĐỘC LẬP ═══ */}
            <div className="w-full flex flex-col">

                {/* ═══ PHẦN 1: TOUR NỔI BẬT ═══ */}
                <div className="w-full py-12 bg-[#FFF3E0]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-6 w-full">
                        <div className="flex-1 min-w-0">
                            <section>
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <h2 className="text-3xl font-bold text-text">{t('home.featuredTours')}</h2>
                                            <p className="text-sm text-text-muted">{t('home.featuredDesc')}</p>
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
                                    <p className="text-center text-text-muted py-8">{t('home.noFeaturedTours')}</p>
                                )}

                                {featured.length >= 6 && (
                                    <div className="flex justify-center mt-8">
                                        <Link
                                            to="/tours?tour_badge=featured"
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white border border-primary font-bold rounded-xl transition shadow-lg"
                                        >
                                            {t('home.viewMore')}
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
                </div>


                {/* ═══ PHẦN 2: TOUR SALE ═══ */}
                {(loading || onSale.length >= 0) && (
                    <div className="w-full py-12 bg-[#EBF0F2] rounded-t-3xl">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-6 w-full">
                            <div className="flex-1 min-w-0">
                                <section>
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <h2 className="text-3xl font-bold text-text">{t('home.saleTours')}</h2>
                                                <p className="text-sm text-text-muted">{t('home.saleDesc')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Logic hiển thị khi mảng rỗng */}
                                    {onSale.length === 0 && !loading && (
                                        <p className="text-center text-text-muted py-8">{t('home.noSaleTours')}</p>
                                    )}

                                    {loading ? (
                                        <SkeletonGrid />
                                    ) : onSale.length > 0 && (
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
                                                {t('home.viewMore')}
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    )}
                                </section>
                            </div>
                        </div>
                    </div>
                )}

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
                        {t('home.browseTypeHeading')}
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto text-base sm:text-lg">
                        {t('home.browseTypeDesc')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* TOUR NỘI ĐỊA */}
                    <Link
                        to="/tours/noi-dia"
                        className="group relative overflow-hidden rounded-3xl p-8 sm:p-10 min-h-[280px] sm:min-h-[320px] flex flex-col justify-between text-white shadow-lg hover:shadow-2xl transition-all duration-300"
                        aria-label="Xem tất cả Tour Nội Địa"
                    >
                        <img
                            src={banahill}
                            alt="Tour Nội Địa"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 transform-gpu will-change-transform group-hover:scale-110 brightness-[0.5] group-hover:brightness-[0.3]"
                        />
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-white/20 transition-colors duration-500" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <MapPin className="w-7 h-7 text-white" strokeWidth={2.5} />
                            </div>
                            <h3 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">{t('home.domesticTour')}</h3>
                            <p className="text-white/80 text-base sm:text-lg max-w-md line-clamp-2">
                                {t('home.domesticDesc')}
                            </p>
                        </div>
                        <div className="relative z-10 mt-8">
                            <span className="inline-flex items-center gap-2 text-sm sm:text-base font-bold bg-white text-[#0068FF] px-6 py-3 rounded-full group-hover:bg-gray-50 transition-colors w-fit shadow-md">
                                {t('home.viewList')} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </div>
                    </Link>

                    {/* TOUR QUỐC TẾ */}
                    <Link
                        to="/tours/quoc-te"
                        className="group relative overflow-hidden rounded-3xl  p-8 sm:p-10 min-h-[280px] sm:min-h-[320px] flex flex-col justify-between text-white shadow-lg hover:shadow-2xl transition-all duration-300"
                        aria-label="Xem tất cả Tour Quốc Tế"
                    >
                        <img
                            src={tokyo}
                            alt="Tour Quốc Tế"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 transform-gpu will-change-transform group-hover:scale-110 brightness-[0.5] group-hover:brightness-[0.3]"
                        />
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-white/20 transition-colors duration-500" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Globe2 className="w-7 h-7 text-white" strokeWidth={2.5} />
                            </div>
                            <h3 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">{t('home.internationalTour')}</h3>
                            <p className="text-white/80 text-base sm:text-lg max-w-md line-clamp-2">
                                {t('home.internationalDesc')}
                            </p>
                        </div>
                        <div className="relative z-10 mt-8">
                            <span className="inline-flex items-center gap-2 text-sm sm:text-base font-bold bg-white text-teal-700 px-6 py-3 rounded-full group-hover:bg-gray-50 transition-colors w-fit shadow-md">
                                {t('home.viewList')} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </div>
                    </Link>
                </div>
            </section>
        </ClientLayout>
    );
};

export default HomePage;
