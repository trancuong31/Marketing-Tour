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

    const featured = tours.filter(t => t.is_featured);
    const onSale = tours.filter(t => t.sale_price_adult && parseFloat(t.sale_price_adult) < parseFloat(t.price_adult));

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
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
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
            </section>

            {/* ═══ TOUR SALE ═══ */}
            {(loading || onSale.length > 0) && (
                <section className="bg-gradient-to-b from-white to-surface-alt py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-error" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-text">Ưu Đãi Hôm Nay</h2>
                                    <p className="text-sm text-text-muted">Tour giảm giá đặc biệt, số lượng có hạn</p>
                                </div>
                            </div>
                        </div>

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
                    </div>
                </section>
            )}

            {/* ═══ BROWSE BY TYPE ═══ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link
                        to="/tours/noi-dia"
                        className="group relative overflow-hidden rounded-2xl bg-[#0068FF] p-8 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <MapPin className="w-10 h-10 mb-3 opacity-80" />
                        <h3 className="text-3xl font-extrabold mb-1">Tour Nội Địa</h3>
                        <p className="text-white/70 text-sm mb-4">Khám phá vẻ đẹp Việt Nam từ Bắc đến Nam</p>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all">
                            Xem tất cả <ChevronRight className="w-4 h-4" />
                        </span>
                    </Link>

                    <Link
                        to="/tours/quoc-te"
                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary to-secondary-dark p-8 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <Globe2 className="w-10 h-10 mb-3 opacity-80" />
                        <h3 className="text-3xl font-extrabold mb-1">Tour Quốc Tế</h3>
                        <p className="text-white/70 text-sm mb-4">Trải nghiệm văn hóa đa dạng khắp thế giới</p>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all">
                            Xem tất cả <ChevronRight className="w-4 h-4" />
                        </span>
                    </Link>
                </div>
            </section>
        </ClientLayout>
    );
};

export default HomePage;
