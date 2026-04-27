import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';
import { tourService } from '@/services/tourService';
import ClientLayout from '@/components/layout/ClientLayout';
import BookingForm from '@/features/tour/components/BookingForm';
import VoteForm from '@/features/tour/components/VoteForm';
import { getImageUrl } from '@/utils/imageUrl';
import { useAuthStore } from '@/store/useAuthStore';
import {
    Clock, Tag, Star, X, ChevronLeft, ChevronRight, ZoomIn,
    ChevronDown, CheckCircle, XCircle, AlertTriangle, Ban,
    Heart, Trash2
} from 'lucide-react';

const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

/* ═══ MODERN REVIEWS LIST (Facebook/TikTok Style) ═══ */
const SubReviewItem = ({ reply, onLike, onReply, onDelete }) => {
    const { user } = useAuthStore();
    const [localLikes, setLocalLikes] = useState(reply.likes_count || 0);
    const [isLiked, setIsLiked] = useState(reply.user_has_liked || false);

    const handleLike = async () => {
        try {
            const res = await tourService.likeVote(reply.id);
            const { isLiked: newIsLiked, likes_count } = res.data.data;
            setIsLiked(newIsLiked);
            setLocalLikes(likes_count);
        } catch (err) {
            toast.error('Có lỗi xảy ra khi like');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Bạn có chắc muốn xóa phản hồi này?')) return;
        try {
            await tourService.deleteVote(reply.id);
            toast.success('Đã xóa phản hồi');
            if (onDelete) onDelete();
        } catch (err) {
            toast.error('Không thể xóa phản hồi');
        }
    };

    return (
        <div className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-[10px] font-bold text-primary shadow-sm">
                    {reply.customer_name?.charAt(0).toUpperCase()}
                </div>
            </div>
            <div className="flex-1">
                <div className="bg-surface-alt/70 rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow relative group/item">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-text">{reply.customer_name}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] text-text-muted font-medium">
                                {new Date(reply.created_at).toLocaleDateString('vi-VN')}
                            </span>
                            {user?.id === reply.user_id && (
                                <button 
                                    onClick={handleDelete}
                                    className="p-1 hover:bg-error/10 rounded-full text-error transition-all opacity-0 group-hover/item:opacity-100"
                                    title="Xóa phản hồi"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">{reply.comment}</p>
                </div>
                
                <div className="flex items-center gap-3 mt-1.5 ml-2 text-[10px] font-bold text-text-muted">
                    <button 
                        onClick={handleLike}
                        className={`hover:text-primary transition-colors flex items-center gap-1 ${isLiked ? 'text-primary' : ''}`}
                    >
                        <Heart className={`w-3 h-3 ${isLiked ? 'fill-primary' : ''}`} />
                        Thích {localLikes > 0 && <span>({localLikes})</span>}
                    </button>
                    <button 
                        onClick={onReply}
                        className="hover:text-primary transition-colors"
                    >
                        Phản hồi
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReviewItem = ({ vote, tourId, onReplySuccess, onDeleteSuccess }) => {
    const { user } = useAuthStore();
    const [localLikes, setLocalLikes] = useState(vote.likes_count || 0);
    const [isLiked, setIsLiked] = useState(vote.user_has_liked || false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyContent, setReplyContent] = useState('');

    // Update state if vote prop changes (e.g. after refresh)
    useEffect(() => {
        setLocalLikes(vote.likes_count || 0);
        setIsLiked(vote.user_has_liked || false);
    }, [vote]);

    // Robustly handle JSON images (Sequential can sometimes return strings)
    const images = useMemo(() => {
        if (!vote.images) return [];
        if (Array.isArray(vote.images)) return vote.images;
        try { return JSON.parse(vote.images); } catch { return []; }
    }, [vote.images]);

    const handleLike = async () => {
        try {
            const res = await tourService.likeVote(vote.id);
            const { isLiked: newIsLiked, likes_count } = res.data.data;
            setIsLiked(newIsLiked);
            setLocalLikes(likes_count);
        } catch (err) {
            toast.error('Có lỗi xảy ra khi like');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Bạn có chắc muốn xóa đánh giá này và tất cả phản hồi liên quan?')) return;
        try {
            await tourService.deleteVote(vote.id);
            toast.success('Đã xóa đánh giá');
            if (onDeleteSuccess) onDeleteSuccess();
        } catch (err) {
            toast.error('Không thể xóa đánh giá');
        }
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('comment', replyContent);
            formData.append('parent_id', vote.id);
            formData.append('rating', 0); // Phản hồi không cần rating

            await tourService.createVote(tourId, formData);
            toast.success('Gửi phản hồi thành công!');
            setReplyContent('');
            setShowReplyForm(false);
            if (onReplySuccess) onReplySuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="group animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex gap-4">
                {/* Avatar */}
                <div className="shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark p-[2px]">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                            <span className="text-base font-bold text-primary">
                                {vote.customer_name?.charAt(0)?.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="bg-surface-alt rounded-2xl p-4 shadow-sm group-hover:shadow-md transition-all duration-300 relative group/root">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-bold text-text">{vote.customer_name}</h4>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-text-muted font-medium bg-border/30 px-2 py-0.5 rounded-full">
                                    {new Date(vote.created_at).toLocaleDateString('vi-VN')}
                                </span>
                                {user?.id === vote.user_id && (
                                    <button 
                                        onClick={handleDelete}
                                        className="p-1.5 hover:bg-error/10 rounded-full text-error transition-all opacity-0 group-hover/root:opacity-100"
                                        title="Xóa đánh giá"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < vote.rating ? 'text-amber-400 fill-amber-400' : 'text-border'}`}
                                />
                            ))}
                            {vote.rating >= 4 && (
                                <span className="ml-2 text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded uppercase">
                                    Hài lòng
                                </span>
                            )}
                        </div>

                        {vote.comment ? (
                            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                                {vote.comment}
                            </p>
                        ) : (
                            <p className="text-sm text-text-muted italic opacity-70">Khách hàng không để lại bình luận văn bản.</p>
                        )}

                        {/* Images */}
                        {images.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {images.map((img, i) => (
                                    <div 
                                        key={i} 
                                        className="w-20 h-20 rounded-xl overflow-hidden border border-border/50 cursor-pointer hover:opacity-90 transition shadow-sm"
                                    >
                                        <img 
                                            src={getImageUrl(img)} 
                                            alt="Review" 
                                            className="w-full h-full object-cover" 
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Admin Reply */}
                        {vote.admin_reply && (
                            <div className="mt-4 p-4 bg-white/50 rounded-xl border-l-4 border-primary shadow-sm">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                        <span className="text-[10px] text-white font-bold">A</span>
                                    </div>
                                    <span className="text-xs font-bold text-primary">Phản hồi của KyNghiTuyetVoi</span>
                                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold uppercase">Chính thức</span>
                                </div>
                                <p className="text-sm text-text-secondary italic pl-8">
                                    "{vote.admin_reply}"
                                </p>
                            </div>
                        )}
                    </div>
                    
                    {/* Interaction Bar */}
                    <div className="flex items-center gap-4 mt-2 ml-2 text-xs font-bold text-text-muted">
                        <button 
                            onClick={handleLike}
                            className={`hover:text-primary transition-colors cursor-pointer flex items-center gap-1 ${isLiked ? 'text-primary' : ''}`}
                        >
                            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-primary' : ''}`} />
                            Thích {localLikes > 0 && <span>({localLikes})</span>}
                        </button>
                        <button 
                            className="hover:text-primary transition-colors cursor-pointer"
                            onClick={() => setShowReplyForm(!showReplyForm)}
                        >
                            Phản hồi {vote.replies?.length > 0 && <span>({vote.replies.length})</span>}
                        </button>
                        <span className="text-[10px] font-medium">•</span>
                        <span className="text-[10px] font-medium opacity-60">KyNghiTuyetVoi đã ghi nhận</span>
                    </div>

                    {/* Community Replies List */}
                    {vote.replies && vote.replies.length > 0 && (
                        <div className="mt-4 space-y-4 ml-6 border-l-2 border-border/50 pl-4">
                            {vote.replies.map((reply) => (
                                <SubReviewItem 
                                    key={reply.id} 
                                    reply={reply} 
                                    onDelete={onReplySuccess}
                                    onReply={() => {
                                        setShowReplyForm(true);
                                        setReplyContent(`@${reply.customer_name} `);
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Reply Form */}
                    {showReplyForm && (
                        <form onSubmit={handleReplySubmit} className="mt-4 ml-6 animate-in slide-in-from-top-2">
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <textarea
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder="Viết phản hồi của bạn..."
                                        className="w-full bg-surface-alt rounded-xl p-3 text-xs border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none h-20"
                                        autoFocus
                                    />
                                    <div className="absolute bottom-2 right-2 flex gap-2">
                                        <button 
                                            type="button"
                                            onClick={() => setShowReplyForm(false)}
                                            className="px-3 py-1.5 text-[10px] font-bold text-text-muted hover:text-text transition"
                                        >
                                            Hủy
                                        </button>
                                        <button 
                                            disabled={isSubmitting || !replyContent.trim()}
                                            className="px-4 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Đang gửi...' : 'Gửi'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
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

/* ═══ FEATURED REVIEWS CAROUSEL (Global 5-star Reviews) ═══ */
const FeaturedReviewsCarousel = ({ votes }) => {
    const scrollRef = useRef(null);
    const animRef = useRef(null);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el || votes.length === 0) return;
        let pos = 0;
        const speed = 0.6; // Slightly faster for global ones
        const animate = () => {
            pos += speed;
            const totalW = votes.length * 340;
            if (pos >= totalW) pos = 0;
            el.style.transform = `translateX(-${pos}px)`;
            animRef.current = requestAnimationFrame(animate);
        };
        animRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animRef.current);
    }, [votes]);

    if (votes.length === 0) return null;

    const items = [...votes, ...votes, ...votes];

    return (
        <div className="py-12 bg-surface-alt/40 border-y border-border overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 mb-8">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                    <h2 className="text-xl font-bold text-text uppercase tracking-tight">Trải nghiệm thực tế từ khách hàng</h2>
                </div>
                <p className="text-sm text-text-muted mt-1">Những chia sẻ chân thực từ khách hàng trên toàn hệ thống</p>
            </div>
            
            <div className="relative">
                <div ref={scrollRef} className="flex gap-5 will-change-transform" style={{ width: 'max-content' }}>
                    {items.map((vote, idx) => (
                        <div
                            key={`${vote.id}-${idx}`}
                            className="w-[320px] shrink-0 p-6 bg-white rounded-2xl border border-border/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-300 group"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                                    <span className="text-sm font-bold text-primary">
                                        {vote.customer_name?.charAt(0)?.toUpperCase() || 'K'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-text truncate">{vote.customer_name || "Khách hàng"}</p>
                                        {vote.is_mock && (
                                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase transition-opacity group-hover:opacity-100">Gợi ý</span>
                                        )}
                                    </div>
                                    <div className="flex gap-0.5 mt-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <span className="absolute -top-3 -left-2 text-4xl text-primary/10 font-serif leading-none">“</span>
                                <p className="text-sm text-text-secondary leading-relaxed italic line-clamp-3 relative z-10 px-1">
                                    {vote.comment || "Chuyến đi thật tuyệt vời! Mọi thứ từ khách sạn đến hướng dẫn viên đều vượt mong đợi. Chắc chắn tôi sẽ đặt thêm nhiều tour nữa tại đây."}
                                </p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-border/50">
                                <p className="text-[11px] text-primary font-semibold uppercase tracking-wider flex items-center gap-1.5">
                                    <Tag className="w-3 h-3" />
                                    {vote.Tour?.title || "Tour Khuyến Mãi Đặc Biệt"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ═══ MOCK DATA FOR THE CAROUSEL (Show when DB is empty) ═══ */
const MOCK_REVIEWS = [
    { id: 'm1', customer_name: 'Minh Tuyền', comment: 'Chuyến đi Malaysia thật tuyệt vời, công ty tổ chức rất chuyên nghiệp!', Tour: { title: 'Tour Malaysia 5N4Đ' }, rating: 5, is_mock: true },
    { id: 'm2', customer_name: 'Hoàng Nam', comment: 'Hướng dẫn viên nhiệt tình, hỗ trợ đoàn rất chu đáo suốt hành trình.', Tour: { title: 'Hàn Quốc Mùa Thu' }, rating: 5, is_mock: true },
    { id: 'm3', customer_name: 'Thanh Thủy', comment: 'Gia đình tôi đã có những kỷ niệm khó quên. Cảm ơn KyNghiTuyetVoi!', Tour: { title: 'Đà Nẵng Hội An 4N3Đ' }, rating: 5, is_mock: true },
];

/* ═══ MAIN PAGE ═══ */
const TourDetailPage = () => {
    const { slug } = useParams();
    const [tour, setTour] = useState(null);
    const [votes, setVotes] = useState([]);
    const [featuredVotes, setFeaturedVotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gallery, setGallery] = useState({ open: false, index: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await tourService.getBySlug(slug);
                const tourData = res.data.data;
                setTour(tourData);
                
                const fetchPromises = [];
                if (tourData?.id) {
                    fetchPromises.push(tourService.getVotes(tourData.id));
                } else {
                    fetchPromises.push(Promise.resolve({ data: { data: [] } }));
                }
                fetchPromises.push(tourService.getFeaturedVotes());
                
                const [votesRes, featuredRes] = await Promise.all(fetchPromises);
                
                const fetchedVotes = votesRes.data.data || [];
                console.log(`[TourDetail] ID: ${tourData?.id || '?'}, Votes:`, fetchedVotes);
                setVotes(fetchedVotes);
                
                const realFeatured = featuredRes.data.data || [];
                setFeaturedVotes(realFeatured.length > 0 ? realFeatured : MOCK_REVIEWS);
            } catch (err) {
                console.error('Lỗi tải dữ liệu:', err);
                setFeaturedVotes(MOCK_REVIEWS);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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
                {/* ═══ BỐ CỤC ẢNH GRID THÔNG MINH ═══ */}
                {(images.length > 0 || tour.thumbnail_url) && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-3 mb-8 h-[300px] sm:h-[400px] md:h-[400px]">
                        
                        {/* ẢNH CHÍNH (BÊN TRÁI) */}
                        <div 
                            className={`relative group cursor-pointer h-full ${images.length > 1 ? 'md:col-span-7 lg:col-span-8' : 'md:col-span-12'} rounded-2xl overflow-hidden shadow-sm`}
                            onClick={() => setGallery({ open: true, index: 0 })}
                        >
                            <img 
                                src={getImageUrl(images.length > 0 ? images[0].image_url : tour.thumbnail_url)} 
                                alt={tour.title} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" 
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                            
                            {/* Nhãn giảm giá / Badge (Nếu có) */}
                            {tour.tour_badge === 'promotion' ? (
                                <div className="absolute top-4 left-0 bg-[#e53935] text-white text-sm font-semibold px-4 py-1.5 shadow-md z-10 rounded-r-md tracking-wide">
                                    Tour Ưu Đãi
                                </div>
                            ) : tour.tour_badge === 'featured' ? (
                                <div className="absolute top-4 left-0 bg-primary text-white text-sm font-semibold px-4 py-1.5 shadow-md z-10 rounded-r-md tracking-wide">
                                    Tour Nổi Bật
                                </div>
                            ) : null}

                            {/* Nút đếm ảnh nổi */}
                            {images.length > 0 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setGallery({ open: true, index: 0 }); }}
                                    className="absolute bottom-4 right-4 z-10 px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-sm font-medium rounded-lg flex items-center gap-1.5 hover:bg-black/80 transition"
                                >
                                    <ZoomIn className="w-4 h-4" />
                                    {images.length} ảnh
                                </button>
                            )}
                        </div>

                        {/* GRID ẢNH PHỤ (BÊN PHẢI) - Chỉ hiện khi có >1 ảnh, trên Desktop */}
                        {images.length > 1 && (
                            <div className={`hidden md:grid md:col-span-5 lg:col-span-4 gap-2 sm:gap-3 h-full ${
                                images.length === 2 ? 'grid-cols-1 grid-rows-1' :
                                images.length === 3 ? 'grid-cols-1 grid-rows-2' :
                                'grid-cols-2 grid-rows-2'
                            }`}>
                                {images.slice(1, 5).map((img, i) => {
                                    // Tính toán lưới khi có số lẻ ảnh phụ
                                    let itemClass = '';
                                    if (images.length === 4 && i === 2) {
                                        // 4 ảnh tổng cộng: 1 chính + 3 phụ => Ảnh thứ 3 nằm full hàng dưới
                                        itemClass = 'col-span-2';
                                    }

                                    return (
                                        <div 
                                            key={img.id || i}
                                            className={`relative group cursor-pointer overflow-hidden rounded-2xl shadow-sm ${itemClass}`}
                                            onClick={() => setGallery({ open: true, index: i + 1 })}
                                        >
                                            <img 
                                                src={getImageUrl(img.image_url)} 
                                                alt={`${tour.title} - ${i+1}`} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

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

                {/* ═══ ĐÁNH GIÁ CỘNG ĐỒNG ═══ */}
                <div className="mt-16 pt-10 border-t border-border">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                            <h2 className="text-2xl font-bold text-text">Đánh giá cộng đồng ({votes.length})</h2>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-text-muted">
                            Sắp xếp: <span className="text-primary cursor-pointer">Mới nhất</span>
                        </div>
                    </div>
                    
                    <div className="space-y-8 max-w-3xl">
                        {votes.length > 0 ? (
                            votes.map((vote) => (
                                <ReviewItem 
                                    key={vote.id} 
                                    vote={vote} 
                                    tourId={tour.id} 
                                    onReplySuccess={refreshVotes} 
                                    onDeleteSuccess={refreshVotes}
                                />
                            ))
                        ) : (
                            <div className="py-12 text-center bg-surface-alt rounded-2xl border border-dashed border-border">
                                <p className="text-text-muted italic">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ ĐÁNH GIÁ ĐẶC SẮC (GLOBAL 5-STAR) ═══ */}
            <FeaturedReviewsCarousel votes={featuredVotes} />

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
