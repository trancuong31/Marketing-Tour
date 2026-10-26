import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { getImageUrl, onImgError } from '@/utils/imageUrl';
import { getCategoryDisplayName } from '@/utils/tourLabels';
import { hasUnavailableTourContent } from '@/features/tour/utils/localeContent';
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

const TourCard = ({ tour, compact = false }) => {
    const { t } = useTranslation();
    const thumbnail = getImageUrl(tour.thumbnail_url || tour.images?.[0]?.image_url) || '/placeholder-tour.svg';
    const duration = formatDuration(tour.duration_days, tour.duration_nights, t);
    const minPrice = getMinPrice(tour);
    const summary = truncateText(tour.summary, compact ? 90 : 159);
    const categoryName = getCategoryDisplayName(tour.Category, t);
    const title = tour.locale_content_status && tour.locale_content_status.title !== 'available'
        ? t('tour.detail.titleUnavailable', 'Tour title unavailable')
        : tour.title || t('tour.detail.titleUnavailable', 'Tour title unavailable');
    const hasUnavailableContent = !compact && hasUnavailableTourContent(tour, ['title', 'summary']);

    return (
        <Link
            to={tour.slug ? `/tours/${tour.slug}` : '/tours'}
            aria-disabled={!tour.slug}
            onClick={(event) => {
                if (!tour.slug) event.preventDefault();
            }}
            className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-border/70 hover:border-primary/40 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-xl transition-all duration-300"
        >
            {/* Ảnh */}
            <div className={`relative overflow-hidden bg-surface-alt shrink-0 ${compact ? 'aspect-[4/3]' : 'aspect-[16/10]'}`}>
                <img
                    src={thumbnail}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={onImgError('tour')}
                    style={{ color: 'transparent' }}
                />

                {/* Badge Featured */}
                {tour.tour_badge === 'featured' ? (
                    <span className={`absolute top-3 left-3 bg-secondary text-white font-bold rounded-full shadow-lg ${compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}`}>
                        {t('tour.card.featured', 'Nổi bật')}
                    </span>
                ) : null}

                {tour.tour_badge === 'promotion' ? (
                    <span className={`absolute top-3 left-3 bg-error text-white font-bold rounded-full shadow-lg ${compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}`}>
                        {t('tour.card.promotion', 'Khuyến mãi')}
                    </span>
                ) : null}

                {/* Badge Duration */}
                {duration && (
                    <span className={`absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white font-medium rounded-full flex items-center gap-1 ${compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}`}>
                        <Clock className="w-3 h-3" />
                        {duration}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className={`flex flex-col flex-1 justify-between ${compact ? 'p-4' : 'p-5'}`}>
                <div className="flex flex-col">
                    {/* Category */}
                    {categoryName ? (
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider line-clamp-1">
                            {categoryName}
                        </span>
                    ) : (
                        <span className="text-xs font-semibold text-transparent select-none">&nbsp;</span>
                    )}

                    {/* Title */}
                    <h3 className={`mt-1.5 font-bold text-text line-clamp-2 min-h-[2.5rem] sm:min-h-[2.75rem] group-hover:text-primary transition-colors leading-snug ${compact ? 'text-sm' : 'text-base'}`}>
                        {title}
                    </h3>

                    {/* Description */}
                    <p className={`mt-2 text-text-secondary leading-relaxed line-clamp-2 min-h-[2.5rem] ${compact ? 'text-xs' : 'text-sm'}`}>
                        {summary || '\u00A0'}
                    </p>

                    {hasUnavailableContent && (
                        <p role="status" className="mt-2 text-xs text-text-muted line-clamp-2">
                            {t('tour.detail.contentUnavailable', 'Some tour content is unavailable or under review. It has not been replaced with content from another language.')}
                        </p>
                    )}
                </div>

                {/* Price — từ departures */}
                <div className="mt-4 pt-3 border-t border-border/40 flex items-end justify-end gap-2">
                    {minPrice ? (
                        <div className="text-right">
                            <p className="text-xs text-text-muted">{t('tour.card.from', 'Giá từ')}</p>
                            <span className={`font-extrabold text-primary ${compact ? 'text-base' : 'text-xl'}`}>
                                {formatPrice(minPrice)}
                            </span>
                        </div>
                    ) : (
                        <span className="text-sm font-semibold text-text-muted">{t('tour.card.contact', 'Liên hệ')}</span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default TourCard;
