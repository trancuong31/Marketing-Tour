import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tourService } from '@/services/tourService';
import TourCard from '@/components/tour/TourCard';
import ClientLayout from '@/components/layout/ClientLayout';
import { Compass, Star, MapPin, Globe2, ChevronRight, Sparkles } from 'lucide-react';
import bg1 from '@/assets/images/bg1.jpg';


const HomePage = () => {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const res = await tourService.getAll();
                setTours(res.data.data || []);
            } catch (err) {
                console.error('Lỗi tải danh sách tour:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTours();
    }, []);
    // get 6 tour featured
    const featured = tours.filter(t => t.tour_badge === 'featured').slice(0, 6);
    // get 6 tour sale
    const onSale = tours.filter(t =>t.tour_badge === 'promotion' && t.sale_price_adult && parseFloat(t.sale_price_adult) < parseFloat(t.price_adult)).slice(0, 6);

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
            {/* ═══ HERO ═══ */}
            <section className="relative overflow-hidden py-16 sm:py-24 px-4">
                <div className="absolute inset-0">
                    <img src={bg1} alt="" className="w-full h-full object-cover brightness-50" />
                </div>

                <div className="relative max-w-4xl mx-auto text-center text-white">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur rounded-full text-sm font-medium mb-6">
                        <Compass className="w-4 h-4" />
                        Khám phá thế giới cùng chúng tôi
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
                        Hành trình đáng nhớ
                        <br />
                        <span className="bg-gradient-to-r from-secondary to-yellow-300 bg-clip-text text-transparent">
                            bắt đầu từ đây
                        </span>
                    </h1>
                    <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-8">
                        Tour du lịch nội địa và quốc tế chất lượng cao với giá tốt nhất
                    </p>

                    {/* Quick links */}
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link
                            to="/tours/noi-dia"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-bold rounded-xl hover:bg-white/90 transition shadow-lg text-sm"
                        >
                            <MapPin className="w-4 h-4" />
                            Tour Nội Địa
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                        <Link
                            to="/tours/quoc-te"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/35 backdrop-blur text-white font-bold rounded-xl hover:bg-white/25 transition border border-white/30 text-sm"
                        >
                            <Globe2 className="w-4 h-4" />
                            Tour Quốc Tế
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══ TOUR NỔI BẬT ═══ */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
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
                <section className="bg-gradient-to-b from-white to-surface-alt py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
                    </div>
                </section>
            )}

            {/* ═══ BROWSE BY TYPE ═══ */}
            <section 
            className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24"
            aria-labelledby="browse-type-heading"
        >
            {/* Header Section - Chuẩn SEO với thẻ H2 */}
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

            {/* Grid Layout - Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* === CARD: TOUR NỘI ĐỊA === */}
                <Link
                    to="/tours/noi-dia"
                    className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0068FF] to-[#004bbd] p-8 sm:p-10 min-h-[280px] sm:min-h-[320px] flex flex-col justify-between text-white shadow-lg hover:shadow-2xl transition-all duration-300"
                    aria-label="Xem tất cả Tour Nội Địa"
                >
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-white/20 transition-colors duration-500" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                    
                    {/* Content Top */}
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <MapPin className="w-7 h-7 text-white" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">
                            Tour Nội Địa
                        </h3>
                        <p className="text-white/80 text-base sm:text-lg max-w-md line-clamp-2">
                            Khám phá vẻ đẹp bất tận của Việt Nam từ miền non nước hữu tình đến những bãi biển thơ mộng.
                        </p>
                    </div>

                    {/* Content Bottom (Call to action) */}
                    <div className="relative z-10 mt-8">
                        <span className="inline-flex items-center gap-2 text-sm sm:text-base font-bold bg-white text-[#0068FF] px-6 py-3 rounded-full group-hover:bg-gray-50 transition-colors w-fit shadow-md">
                            Xem danh sách <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </div>
                </Link>

                {/* === CARD: TOUR QUỐC TẾ === */}
                <Link
                    to="/tours/quoc-te"
                    className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 p-8 sm:p-10 min-h-[280px] sm:min-h-[320px] flex flex-col justify-between text-white shadow-lg hover:shadow-2xl transition-all duration-300"
                    // Thay from-emerald-500 to-teal-700 bằng from-secondary to-secondary-dark của bạn
                    aria-label="Xem tất cả Tour Quốc Tế"
                >
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-white/20 transition-colors duration-500" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                    
                    {/* Content Top */}
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Globe2 className="w-7 h-7 text-white" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">
                            Tour Quốc Tế
                        </h3>
                        <p className="text-white/80 text-base sm:text-lg max-w-md line-clamp-2">
                            Trải nghiệm văn hóa đa dạng, thưởng thức ẩm thực độc đáo và chinh phục những vùng đất mới khắp thế giới.
                        </p>
                    </div>

                    {/* Content Bottom (Call to action) */}
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
