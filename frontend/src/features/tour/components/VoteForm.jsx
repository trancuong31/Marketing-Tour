import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { tourService } from '@/services/tourService';
import { Star, Send, CheckCircle2, Loader2, ImagePlus, X, LogIn, ShieldX } from 'lucide-react';
import { useAuthStore } from '@/store';
import { toast } from 'sonner';

const VoteForm = ({ tourId, onSuccess }) => {
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);
    const [images, setImages] = useState([]);
    const { isAuthenticated } = useAuthStore();

    // Vote eligibility state
    const [eligibility, setEligibility] = useState({ loading: true, eligible: false, reason: '' });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            rating: 0,
            comment: '',
        },
    });

    const currentRating = watch('rating');

    // Check vote eligibility when authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            setEligibility({ loading: false, eligible: false, reason: '' });
            return;
        }

        const checkEligibility = async () => {
            try {
                const res = await tourService.checkVoteEligibility(tourId);
                const data = res.data.data;
                setEligibility({ loading: false, eligible: data.eligible, reason: data.reason || '' });
            } catch {
                setEligibility({ loading: false, eligible: false, reason: 'Không thể kiểm tra quyền đánh giá.' });
            }
        };

        checkEligibility();
    }, [isAuthenticated, tourId]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 5) {
            toast.error('Bạn chỉ được tải lên tối đa 5 hình ảnh.');
            return;
        }
        setImages((prev) => [...prev, ...files]);
    };

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data) => {
        if (data.rating === 0) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('rating', data.rating);
            if (data.comment) formData.append('comment', data.comment);
            
            images.forEach(image => {
                formData.append('images', image);
            });

            await tourService.createVote(tourId, formData);
            setSubmitted(true);
            reset();
            setImages([]);
            if (onSuccess) onSuccess();
        } catch (err) {
            const msg = err.response?.data?.message || 'Có lỗi xảy ra';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="mt-6 p-5 bg-success/5 border border-success/20 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
                <div>
                    <p className="font-semibold text-success">Cảm ơn bạn đã đánh giá!</p>
                    <p className="text-sm text-text-secondary">Đánh giá của bạn đang chờ duyệt và sẽ hiển thị sau khi được phê duyệt.</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="mt-6 p-6 bg-surface-alt rounded-xl border border-border text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <LogIn className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-text mb-2">Đăng nhập để đánh giá</h4>
                <p className="text-sm text-text-secondary mb-4">Bạn cần đăng nhập để có thể gửi nhận xét và hình ảnh cho tour này.</p>
            </div>
        );
    }

    // Loading eligibility
    if (eligibility.loading) {
        return (
            <div className="mt-6 p-6 bg-surface-alt rounded-xl border border-border text-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
                <p className="text-sm text-text-muted">Đang kiểm tra quyền đánh giá...</p>
            </div>
        );
    }

    // Not eligible
    if (!eligibility.eligible) {
        return (
            <div className="mt-6 p-5 bg-warning/5 border border-warning/20 rounded-xl flex items-center gap-3">
                <ShieldX className="w-6 h-6 text-warning flex-shrink-0" />
                <div>
                    <p className="font-semibold text-warning">Chưa thể đánh giá</p>
                    <p className="text-sm text-text-secondary">{eligibility.reason}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6 p-5 bg-surface-alt rounded-xl border border-border">
            <h4 className="font-semibold text-text mb-4 flex items-center gap-2">
                <Send className="w-4 h-4" />
                Gửi đánh giá của bạn
            </h4>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Rating Stars */}
                <div>
                    <label className="text-sm font-medium text-text mb-2 block">Đánh giá sao <span className="text-error">*</span></label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                type="button"
                                key={star}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setValue('rating', star)}
                                className="p-0.5 transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`w-7 h-7 transition-colors ${
                                        star <= (hoverRating || currentRating)
                                            ? 'text-secondary fill-secondary'
                                            : 'text-border'
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                    {currentRating === 0 && errors.rating && (
                        <p className="mt-1 text-xs text-error">Vui lòng chọn số sao</p>
                    )}
                    <input type="hidden" {...register('rating', { required: true, min: 1 })} />
                </div>

                {/* Images Upload */}
                <div>
                    <label className="text-sm font-medium text-text mb-2 block">Hình ảnh thực tế (tối đa 5 ảnh)</label>
                    <div className="flex flex-wrap gap-3 mb-2">
                        {images.map((img, index) => (
                            <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                                <img
                                    src={URL.createObjectURL(img)}
                                    alt="preview"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 w-5 h-5 bg-black/50 hover:bg-error text-white rounded-full flex items-center justify-center transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                        {images.length < 5 && (
                            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer bg-white transition-colors">
                                <ImagePlus className="w-6 h-6 text-text-muted mb-1" />
                                <span className="text-[10px] text-text-muted">Thêm ảnh</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </label>
                        )}
                    </div>
                </div>

                {/* Comment */}
                <textarea
                    {...register('comment')}
                    rows={3}
                    className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
                    placeholder="Nhận xét của bạn..."
                />

                <button
                    type="submit"
                    disabled={submitting || currentRating === 0}
                    className="px-6 py-2.5 bg-gradient-to-r from-secondary to-secondary-dark text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                    {submitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...</>
                    ) : (
                        <><Send className="w-4 h-4" /> Gửi đánh giá</>
                    )}
                </button>
            </form>
        </div>
    );
};

export default VoteForm;
