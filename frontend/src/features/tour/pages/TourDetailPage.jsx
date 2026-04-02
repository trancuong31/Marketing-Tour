import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import DOMPurify from 'dompurify';
import { tourService } from '@/services/tourService';
import ClientLayout from '@/components/layout/ClientLayout';
import BookingForm from '@/features/tour/components/BookingForm';
import VoteForm from '@/features/tour/components/VoteForm';
import { getImageUrl } from '@/utils/imageUrl';
import {
    Clock, Tag, Star, X, ChevronLeft, ChevronRight, ZoomIn,
    ChevronDown, CheckCircle, XCircle, ShieldCheck, AlertTriangle, Ban,
} from 'lucide-react';

const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

/* ═══ AUTO-SCROLL REVIEWS ═══ */
const ReviewsCarousel = ({ votes }) => {
    const scrollRef = useRef(null);
    const animRef = useRef(null);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el || votes.length === 0) return;
        let pos = 0;
        const speed = 0.5;
        const animate = () => {
            pos += speed;
            const totalW = votes.length * 336;
            if (pos >= totalW) pos = 0;
            el.style.transform = `translateX(-${pos}px)`;
            animRef.current = requestAnimationFrame(animate);
        };
        animRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animRef.current);
    }, [votes]);

    if (votes.length === 0) return <p className="text-text-muted text-sm py-4">Chưa có đánh giá nào</p>;

    const items = [...votes, ...votes, ...votes];

    return (
        <div className="overflow-hidden">
            <div ref={scrollRef} className="flex gap-4 will-change-transform" style={{ width: 'max-content' }}>
                {items.map((vote, idx) => (
                    <div
                        key={`${vote.id}-${idx}`}
                        className="w-[320px] shrink-0 p-5 bg-white rounded-2xl border border-border shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-sm font-bold text-primary">
                                        {vote.customer_name?.charAt(0)?.toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-text">{vote.customer_name}</p>
                                    <p className="text-xs text-text-muted">
                                        {new Date(vote.created_at).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-3.5 h-3.5 ${i < vote.rating ? 'text-secondary fill-secondary' : 'text-border'}`}
                                    />
                                ))}
                            </div>
                        </div>
                        {vote.comment && (
                            <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">{vote.comment}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ═══ IMAGE GALLERY MODAL ═══ */
const GalleryModal = ({ images, startIndex, onClose }) => {
    const [current, setCurrent] = useState(startIndex || 0);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') setCurrent(p => (p - 1 + images.length) % images.length);
            if (e.key === 'ArrowRight') setCurrent(p => (p + 1) % images.length);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [images.length, onClose]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90" onClick={onClose}>
            <div className="absolute top-4 right-4 z-10">
                <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition">
                    <X className="w-6 h-6 text-white" />
                </button>
            </div>
            <div className="absolute top-4 left-4 text-white/70 text-sm font-medium">
                {current + 1} / {images.length}
            </div>
            <div className="relative max-w-5xl w-full mx-4" onClick={e => e.stopPropagation()}>
                <img src={getImageUrl(images[current]?.image_url)} alt="" className="w-full max-h-[80vh] object-contain rounded-lg" />
                {images.length > 1 && (
                    <>
                        <button
                            onClick={() => setCurrent(p => (p - 1 + images.length) % images.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 transition"
                        >
                            <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <button
                            onClick={() => setCurrent(p => (p + 1) % images.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 transition"
                        >
                            <ChevronRight className="w-6 h-6 text-white" />
                        </button>
                    </>
                )}
            </div>
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4">
                    {images.map((img, i) => (
                        <button
                            key={img.id}
                            onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                            className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                                i === current ? 'border-primary opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
                            }`}
                        >
                            <img src={getImageUrl(img.image_url)} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ═══ ITINERARY ACCORDION ═══ */
const ItineraryAccordion = ({ itineraries }) => {
    const [openDay, setOpenDay] = useState(0);

    if (!itineraries || itineraries.length === 0) return null;

    return (
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-text mb-4">Lịch trình chi tiết</h2>
            {itineraries.map((item, idx) => (
                <div key={item.id || idx} className="rounded-xl border border-border overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setOpenDay(openDay === idx ? -1 : idx)}
                        className="w-full flex items-center justify-between px-4 py-3.5 bg-surface-alt hover:bg-surface-hover transition text-left"
                    >
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">
                                {item.day_number}
                            </span>
                            <span className="text-sm font-semibold text-text">{item.title}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${openDay === idx ? 'rotate-180' : ''}`} />
                    </button>
                    {openDay === idx && (
                        <div className="px-4 py-4 bg-surface border-t border-border overflow-hidden">
                            <div
                                className="prose-content break-words text-sm text-text-secondary leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.content) }}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

/* ═══ MAIN PAGE ═══ */
const TourDetailPage = () => {
    const { slug } = useParams();
    const [tour, setTour] = useState(null);
    const [votes, setVotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gallery, setGallery] = useState({ open: false, index: 0 });

    useEffect(() => {
        const fetchTour = async () => {
            try {
                const res = await tourService.getBySlug(slug);
                setTour(res.data.data);
                if (res.data.data?.id) {
                    const votesRes = await tourService.getVotes(res.data.data.id);
                    setVotes(votesRes.data.data || []);
                }
            } catch (err) {
                console.error('Lỗi tải tour:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTour();
    }, [slug]);

    const refreshVotes = async () => {
        if (tour?.id) {
            const res = await tourService.getVotes(tour.id);
            setVotes(res.data.data || []);
        }
    };

    if (loading) {
        return (
            <ClientLayout>
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <div className="animate-pulse space-y-6">
                        <div className="aspect-video bg-surface-alt rounded-2xl" />
                        <div className="h-8 bg-surface-alt rounded w-3/4" />
                        <div className="h-5 bg-surface-alt rounded w-1/2" />
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-4 bg-surface-alt rounded" />
                            ))}
                        </div>
                    </div>
                </div>
            </ClientLayout>
        );
    }

    if (!tour) {
        return (
            <ClientLayout>
                <div className="max-w-6xl mx-auto px-4 py-20 text-center">
                    <h2 className="text-2xl font-bold text-text mb-2">Không tìm thấy tour</h2>
                    <p className="text-text-muted">Tour này có thể đã ngừng hoặc không tồn tại.</p>
                </div>
            </ClientLayout>
        );
    }

    const images = tour.images || [];
    const itineraries = tour.itineraries || [];
    const departures = tour.departures || [];
    const durationText = tour.duration_days && tour.duration_nights
        ? `${tour.duration_days} ngày ${tour.duration_nights} đêm`
        : tour.duration_days ? `${tour.duration_days} ngày` : null;

    // Giá thấp nhất từ departures
    const minPrice = departures.length > 0
        ? Math.min(...departures.map(d => parseFloat(d.price_adult)))
        : null;

    return (
        <ClientLayout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* ═══ SLIDER ẢNH ═══ */}
                {images.length > 0 ? (
                    <div className="relative group">
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            navigation
                            pagination={{ clickable: true }}
                            autoplay={{ delay: 4000, disableOnInteraction: false }}
                            loop={images.length > 1}
                            className="rounded-2xl overflow-hidden shadow-lg mb-8 cursor-pointer"
                        >
                            {images.map((img, i) => (
                                <SwiperSlide key={img.id}>
                                    <div className="relative" onClick={() => setGallery({ open: true, index: i })}>
                                        <img src={getImageUrl(img.image_url)} alt={tour.title} className="w-full aspect-video object-cover" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        <button
                            onClick={() => setGallery({ open: true, index: 0 })}
                            className="absolute bottom-12 right-4 z-10 px-3 py-1.5 bg-black/60 backdrop-blur text-white text-sm rounded-lg flex items-center gap-1.5 hover:bg-black/70 transition"
                        >
                            <ZoomIn className="w-4 h-4" />
                            {images.length} ảnh
                        </button>
                    </div>
                ) : tour.thumbnail_url ? (
                    <img src={getImageUrl(tour.thumbnail_url)} alt={tour.title} className="w-full aspect-video object-cover rounded-2xl shadow-lg mb-8" />
                ) : null}

                {/* ═══ THÔNG TIN TOUR ═══ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cột trái */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Category */}
                        {tour.Category && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                                <Tag className="w-3.5 h-3.5" />
                                {tour.Category.name}
                            </span>
                        )}

                        <h1 className="text-3xl sm:text-4xl font-extrabold text-text leading-tight">
                            {tour.title}
                        </h1>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-4 text-text-secondary">
                            {durationText && (
                                <span className="flex items-center gap-1.5 text-sm">
                                    <Clock className="w-4 h-4 text-primary" />
                                    {durationText}
                                </span>
                            )}
                            {minPrice && (
                                <span className="flex items-center gap-1.5 text-sm">
                                    <Tag className="w-4 h-4 text-primary" />
                                    Giá từ <span className="font-bold text-primary">{formatPrice(minPrice)}</span>/người
                                </span>
                            )}
                        </div>

                        {/* Tóm tắt */}
                        {tour.summary && (
                            <div className="p-4 bg-surface-alt rounded-xl border border-border">
                                <p className="text-text-secondary leading-relaxed">{tour.summary}</p>
                            </div>
                        )}

                        {/* Điểm nổi bật */}
                        {tour.highlights && (
                            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 overflow-hidden">
                                <h3 className="text-lg font-bold text-primary mb-3">✨ Điểm nổi bật</h3>
                                <div
                                    className="prose-content break-words text-sm text-text-secondary"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(tour.highlights) }}
                                />
                            </div>
                        )}

                        {/* Lịch trình chi tiết */}
                        {itineraries.length > 0 && <ItineraryAccordion itineraries={itineraries} />}

                        {/* Giá bao gồm / không bao gồm */}
                        {(tour.price_includes || tour.price_excludes) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tour.price_includes && (
                                    <div className="rounded-xl border border-success/20 bg-success/5 p-4 overflow-hidden">
                                        <div className="flex items-center gap-2 mb-3">
                                            <CheckCircle className="w-5 h-5 text-success" />
                                            <h3 className="text-sm font-bold text-success">Giá bao gồm</h3>
                                        </div>
                                        <div
                                            className="prose-content break-words text-sm text-text-secondary"
                                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(tour.price_includes) }}
                                        />
                                    </div>
                                )}
                                {tour.price_excludes && (
                                    <div className="rounded-xl border border-error/20 bg-error/5 p-4 overflow-hidden">
                                        <div className="flex items-center gap-2 mb-3">
                                            <XCircle className="w-5 h-5 text-error" />
                                            <h3 className="text-sm font-bold text-error">Giá không bao gồm</h3>
                                        </div>
                                        <div
                                            className="prose-content break-words text-sm text-text-secondary"
                                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(tour.price_excludes) }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Điều khoản & lưu ý */}
                        {tour.terms_and_notes && (
                            <div className="rounded-2xl border border-warning/30 bg-warning/5 p-5 overflow-hidden">
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className="w-5 h-5 text-warning" />
                                    <h3 className="text-lg font-bold text-warning">Điều khoản & Lưu ý</h3>
                                </div>
                                <div
                                    className="prose-content break-words text-sm text-text-secondary"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(tour.terms_and_notes) }}
                                />
                            </div>
                        )}

                        {/* Quy định hoàn hủy */}
                        {tour.cancellation_policy && (
                            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 overflow-hidden">
                                <div className="flex items-center gap-2 mb-3">
                                    <Ban className="w-5 h-5 text-primary" />
                                    <h3 className="text-lg font-bold text-primary">Quy định hoàn hủy</h3>
                                </div>
                                <div
                                    className="prose-content break-words text-sm text-text-secondary"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(tour.cancellation_policy) }}
                                />
                            </div>
                        )}

                        {/* Vote Form */}
                        <div className="pt-6 border-t border-border">
                            <VoteForm tourId={tour.id} onSuccess={refreshVotes} />
                        </div>
                    </div>

                    {/* Cột phải: Form đặt tour */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-20">
                            <BookingForm tour={tour} />
                        </div>
                    </div>
                </div>

                {/* ═══ ĐÁNH GIÁ KHÁCH HÀNG ═══ */}
                <div className="mt-12 pt-8 border-t border-border">
                    <div className="flex items-center gap-2 mb-6">
                        <Star className="w-6 h-6 text-secondary fill-secondary" />
                        <h2 className="text-2xl font-bold text-text">Đánh giá từ khách hàng ({votes.length})</h2>
                    </div>
                    <ReviewsCarousel votes={votes} />
                </div>
            </div>

            {/* Gallery Modal */}
            {gallery.open && images.length > 0 && (
                <GalleryModal
                    images={images}
                    startIndex={gallery.index}
                    onClose={() => setGallery({ open: false, index: 0 })}
                />
            )}
        </ClientLayout>
    );
};

export default TourDetailPage;
