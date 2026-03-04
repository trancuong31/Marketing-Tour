import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { tourService } from '@/services/tourService';
import { Star, Send, CheckCircle2, Loader2 } from 'lucide-react';

const VoteForm = ({ tourId, onSuccess }) => {
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            customer_name: '',
            customer_email: '',
            rating: 0,
            comment: '',
        },
    });

    const currentRating = watch('rating');

    const onSubmit = async (data) => {
        if (data.rating === 0) return;
        setSubmitting(true);
        try {
            await tourService.createVote(tourId, data);
            setSubmitted(true);
            reset();
            if (onSuccess) onSuccess();
        } catch (err) {
            const msg = err.response?.data?.message || 'Có lỗi xảy ra';
            alert(msg);
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

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <input
                            {...register('customer_name', { required: 'Vui lòng nhập tên' })}
                            className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                            placeholder="Họ tên *"
                        />
                        {errors.customer_name && (
                            <p className="mt-1 text-xs text-error">{errors.customer_name.message}</p>
                        )}
                    </div>
                    <div>
                        <input
                            {...register('customer_email', {
                                required: 'Vui lòng nhập email',
                                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không hợp lệ' },
                            })}
                            className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                            placeholder="Email *"
                        />
                        {errors.customer_email && (
                            <p className="mt-1 text-xs text-error">{errors.customer_email.message}</p>
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
