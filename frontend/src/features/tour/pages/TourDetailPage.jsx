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
import { Clock, MapPin, Tag, Star, X, ChevronLeft, ChevronRight, ShieldCheck, AlertTriangle, ZoomIn } from 'lucide-react';

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
        const speed = 0.5; // px per frame
        const animate = () => {
            pos += speed;
            // Each card ~320px + 16px gap = 336px, total original width = votes.length * 336
            const totalW = votes.length * 336;
            if (pos >= totalW) pos = 0;
            el.style.transform = `translateX(-${pos}px)`;
            animRef.current = requestAnimationFrame(animate);
        };
        animRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animRef.current);
    }, [votes]);

    if (votes.length === 0) return <p className="text-text-muted text-sm py-4">Chưa có đánh giá nào</p>;

    // Duplicate for seamless loop
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

            {/* Counter */}
            <div className="absolute top-4 left-4 text-white/70 text-sm font-medium">
                {current + 1} / {images.length}
            </div>

            {/* Main image */}
            <div className="relative max-w-5xl w-full mx-4" onClick={e => e.stopPropagation()}>
                <img
                    src={images[current]?.image_url}
                    alt=""
                    className="w-full max-h-[80vh] object-contain rounded-lg"
                />

                {/* Nav arrows */}
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

            {/* Thumbnails */}
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
                            <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
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

    const hasSaleAdult = tour.sale_price_adult && parseFloat(tour.sale_price_adult) < parseFloat(tour.price_adult);
    const hasSaleChild = tour.sale_price_child && tour.price_child && parseFloat(tour.sale_price_child) < parseFloat(tour.price_child);
    const hasSaleInfant = tour.sale_price_infant && tour.price_infant && parseFloat(tour.sale_price_infant) < parseFloat(tour.price_infant);
    const images = tour.images || [];
    const durationText = tour.duration_days && tour.duration_nights
        ? `${tour.duration_days} ngày ${tour.duration_nights} đêm`
        : tour.duration_days ? `${tour.duration_days} ngày` : null;

    return (
        <ClientLayout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* ═══ SLIDER ẢNH — Clickable for gallery ═══ */}
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
                                    <div
                                        className="relative"
                                        onClick={() => setGallery({ open: true, index: i })}
                                    >
                                        <img
                                            src={img.image_url}
                                            alt={tour.title}
                                            className="w-full aspect-video object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {/* Image count badge */}
                        <button
                            onClick={() => setGallery({ open: true, index: 0 })}
                            className="absolute bottom-12 right-4 z-10 px-3 py-1.5 bg-black/60 backdrop-blur text-white text-sm rounded-lg flex items-center gap-1.5 hover:bg-black/70 transition"
                        >
                            <ZoomIn className="w-4 h-4" />
                            {images.length} ảnh
                        </button>
                    </div>
                ) : tour.thumbnail_url ? (
                    <img
                        src={tour.thumbnail_url}
                        alt={tour.title}
                        className="w-full aspect-video object-cover rounded-2xl shadow-lg mb-8"
                    />
                ) : null}

                {/* ═══ THÔNG TIN TOUR ═══ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cột trái: thông tin */}
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

                        {/* Meta info */}
                        <div className="flex flex-wrap gap-4 text-text-secondary">
                            {durationText && (
                                <span className="flex items-center gap-1.5 text-sm">
                                    <Clock className="w-4 h-4 text-primary" />
                                    {durationText}
                                </span>
                            )}
                            {tour.departure_point && (
                                <span className="flex items-center gap-1.5 text-sm">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    Khởi hành: {tour.departure_point}
                                </span>
                            )}
                        </div>

                        {/* Bảng giá */}
                        <div className="rounded-xl border border-border overflow-hidden">
                            <div className="bg-primary/5 px-4 py-3 border-b border-border">
                                <h3 className="text-sm font-bold text-primary">Bảng giá tour</h3>
                            </div>
                            <div className="divide-y divide-border">
                                {/* Người lớn */}
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div>
                                        <p className="text-sm font-semibold text-text">Người lớn</p>
                                        <p className="text-xs text-text-muted">Trên 10 tuổi</p>
                                    </div>
                                    <div className="text-right">
                                        {hasSaleAdult ? (
                                            <>
                                                <p className="text-lg font-extrabold text-secondary">{formatPrice(tour.sale_price_adult)}</p>
                                                <p className="text-xs text-text-muted line-through">{formatPrice(tour.price_adult)}</p>
                                            </>
                                        ) : (
                                            <p className="text-lg font-extrabold text-primary">{formatPrice(tour.price_adult)}</p>
                                        )}
                                    </div>
                                </div>
                                {/* Trẻ em */}
                                {tour.price_child && (
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <div>
                                            <p className="text-sm font-semibold text-text">Trẻ em</p>
                                            <p className="text-xs text-text-muted">Từ 2 – 10 tuổi</p>
                                        </div>
                                        <div className="text-right">
                                            {hasSaleChild ? (
                                                <>
                                                    <p className="text-lg font-bold text-secondary">{formatPrice(tour.sale_price_child)}</p>
                                                    <p className="text-xs text-text-muted line-through">{formatPrice(tour.price_child)}</p>
                                                </>
                                            ) : (
                                                <p className="text-lg font-bold text-primary">{formatPrice(tour.price_child)}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {/* Trẻ nhỏ */}
                                {tour.price_infant && (
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <div>
                                            <p className="text-sm font-semibold text-text">Trẻ nhỏ / Em bé</p>
                                            <p className="text-xs text-text-muted">Dưới 2 tuổi</p>
                                        </div>
                                        <div className="text-right">
                                            {hasSaleInfant ? (
                                                <>
                                                    <p className="text-lg font-bold text-secondary">{formatPrice(tour.sale_price_infant)}</p>
                                                    <p className="text-xs text-text-muted line-through">{formatPrice(tour.price_infant)}</p>
                                                </>
                                            ) : (
                                                <p className="text-lg font-bold text-primary">{formatPrice(tour.price_infant)}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mô tả */}
                        {tour.summary && (
                            <div className="p-4 bg-surface-alt rounded-xl border border-border">
                                <p className="text-text-secondary leading-relaxed">{tour.summary}</p>
                            </div>
                        )}

                        {/* Nội dung chi tiết (HTML) */}
                        {tour.content && (
                            <div className="prose-content">
                                <h2 className="text-xl font-bold text-text mb-4">Chi tiết hành trình</h2>
                                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(tour.content) }} />
                            </div>
                        )}

                        {/* ═══ ĐIỀU KHOẢN & LƯU Ý ═══ */}
                        <div className="space-y-4 pt-2">
                            {/* Điều khoản */}
                            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                    <h3 className="text-lg font-bold text-primary">Điều khoản</h3>
                                </div>
                                <ul className="space-y-2 text-sm text-text-secondary">
                                    <li className="flex gap-2"><span className="text-primary font-bold">•</span> Giá tour đã bao gồm xe đưa đón, khách sạn, bữa ăn theo chương trình.</li>
                                    <li className="flex gap-2"><span className="text-primary font-bold">•</span> Trẻ em dưới 2 tuổi miễn phí (không bao gồm giường và suất ăn riêng).</li>
                                    <li className="flex gap-2"><span className="text-primary font-bold">•</span> Trẻ em 2–10 tuổi tính 75% giá tour người lớn.</li>
                                    <li className="flex gap-2"><span className="text-primary font-bold">•</span> Hủy tour trước 7 ngày: hoàn 100%. Trước 3 ngày: phạt 50%.</li>
                                    <li className="flex gap-2"><span className="text-primary font-bold">•</span> Giá tour có thể thay đổi tùy theo thời điểm đặt và tình trạng chỗ.</li>
                                </ul>
                            </div>

                            {/* Lưu ý */}
                            <div className="rounded-2xl border border-warning/30 bg-warning/5 p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className="w-5 h-5 text-warning" />
                                    <h3 className="text-lg font-bold text-warning">Lưu ý quan trọng</h3>
                                </div>
                                <ul className="space-y-2 text-sm text-text-secondary">
                                    <li className="flex gap-2"><span className="text-warning font-bold">•</span> Quý khách vui lòng mang theo CMND/CCCD hoặc hộ chiếu (tour quốc tế).</li>
                                    <li className="flex gap-2"><span className="text-warning font-bold">•</span> Tập trung đúng giờ tại điểm hẹn. Tour không chờ khách trễ.</li>
                                    <li className="flex gap-2"><span className="text-warning font-bold">•</span> Không bao gồm chi phí phát sinh cá nhân: đồ uống, minibar, giặt ủi...</li>
                                    <li className="flex gap-2"><span className="text-warning font-bold">•</span> Lịch trình có thể thay đổi tùy điều kiện thời tiết và thực tế.</li>
                                </ul>
                            </div>
                        </div>

                        {/* ═══ VOTE FORM ═══ */}
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

                {/* ═══ ĐÁNH GIÁ KHÁCH HÀNG — Auto scroll carousel ═══ */}
                <div className="mt-12 pt-8 border-t border-border">
                    <div className="flex items-center gap-2 mb-6">
                        <Star className="w-6 h-6 text-secondary fill-secondary" />
                        <h2 className="text-2xl font-bold text-text">Đánh giá từ khách hàng ({votes.length})</h2>
                    </div>
                    <ReviewsCarousel votes={votes} />
                </div>
            </div>

            {/* ═══ GALLERY MODAL ═══ */}
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
