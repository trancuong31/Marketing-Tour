import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { getImageUrl, onImgError } from '@/utils/imageUrl';
import { useTranslation } from 'react-i18next';
const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const truncateText = (text, maxLen = 159) => {
    if (!text) return '';
    return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
};

/** Hiển thị thời gian tour dạng "3N2Đ" hoặc "3 ngày" */
const formatDuration = (days, nights, t) => {
    if (days && nights) return t('tour.card.durationDaysNights', '{{days}} Ngày {{nights}} Đêm', { days, nights });
    if (days) return t('tour.card.durationDays', '{{days}} Ngày', { days });
    return null;
};

/** Lấy giá thấp nhất từ departures */
const getMinPrice = (tour) => {
    const departures = tour.departures || [];
    if (departures.length === 0) return null;
    return Math.min(...departures.map(d => parseFloat(d.price_adult)));
};

const TourCard = ({ tour }) => {
    const { t } = useTranslation();
    const thumbnail = getImageUrl(tour.thumbnail_url || tour.images?.[0]?.image_url) || '/placeholder-tour.jpg';
    const duration = formatDuration(tour.duration_days, tour.duration_nights, t);
    const minPrice = getMinPrice(tour);

    return (
        <Link
            to={`/tours/${tour.slug}`}
            className="group block bg-white rounded-2xl overflow-hidden border-2 border-transparent shadow-[0_2px_12px_rgba(0,0,0,0.2)] transition-all duration-300"
        >
            {/* Ảnh */}
            <div className="relative aspect-[16/10] overflow-hidden">
                <img
                    src={thumbnail}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={onImgError('tour')}
                />

                {/* Badge Featured */}
                {tour.tour_badge === 'featured' ? (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-secondary text-white text-xs font-bold rounded-full shadow-lg">
                        {t('tour.card.featured', 'Nổi bật')}
                    </span>
                ) : null}

                {tour.tour_badge === 'promotion' ? (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-error text-white text-xs font-bold rounded-full shadow-lg">
                        {t('tour.card.promotion', 'Khuyến mãi')}
                    </span>
                ) : null}

                {/* Badge Duration */}
                {duration && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {duration}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col min-h-[180px]">
                {/* Category */}
                {tour.Category && (
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                        {tour.Category.name}
                    </span>
                )}

                {/* Title */}
                <h3 className="mt-1.5 text-lg font-bold text-text line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                    {tour.title}
                </h3>

                {/* Description */}
                {tour.summary && (
                    <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                        {truncateText(tour.summary)}
                    </p>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Price — từ departures */}
                <div className="mt-4 flex items-end justify-end gap-2">
                    {minPrice ? (
                        <div className="text-right">
                            <p className="text-xs text-text-muted">{t('tour.card.from', 'Giá từ')}</p>
                            <span className="text-xl font-extrabold text-primary">
                                {formatPrice(minPrice)}
                            </span>
                        </div>
                    ) : (
                        <span className="text-sm text-text-muted">{t('tour.card.contact', 'Liên hệ')}</span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default TourCard;
