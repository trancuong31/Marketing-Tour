import { Link } from 'react-router-dom';
import { Clock, MapPin } from 'lucide-react';

const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

const truncateText = (text, maxLen = 159) => {
    if (!text) return '';
    return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
};

/** Hiển thị thời gian tour dạng "3N2Đ" hoặc "3 ngày" */
const formatDuration = (days, nights) => {
    if (days && nights) return `${days} Ngày ${nights} Đêm`;
    if (days) return `${days} ngày`;
    return null;
};

const TourCard = ({ tour }) => {
    const thumbnail = tour.thumbnail_url || tour.images?.[0]?.image_url || '/placeholder-tour.jpg';
    const hasSale = tour.sale_price_adult && parseFloat(tour.sale_price_adult) < parseFloat(tour.price_adult);
    const duration = formatDuration(tour.duration_days, tour.duration_nights);

    return (
        <Link
            to={`/tours/${tour.slug}`}
            className="group block bg-white rounded-2xl overflow-hidden border-2 border-transparent shadow-[0_2px_12px_rgba(0,0,0,0.2)] hover:border-[#26bed6] hover:shadow-2xl transition-all duration-300"
        >
            {/* Ảnh */}
            <div className="relative aspect-[16/10] overflow-hidden">
                <img
                    src={thumbnail}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                />

                {/* Badge Featured */}
                {tour.is_featured ? (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-secondary text-white text-xs font-bold rounded-full shadow-lg">
                        ⭐ Nổi bật
                    </span>
                ) : null}

                {/* Badge Duration */}
                {duration && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-medium rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {duration}
                    </span>
                )}

                {/* Sale badge */}
                {hasSale && (
                    <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-error text-white text-xs font-bold rounded-md">
                        SALE
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

                {/* Departure */}
                {tour.departure_point && (
                    <div className="flex items-center gap-1.5 mt-2 text-sm text-text-muted">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{tour.departure_point}</span>
                    </div>
                )}

                {/* Description */}
                {tour.summary && (
                    <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                        {truncateText(tour.summary)}
                    </p>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Price — bottom right */}
                <div className="mt-4 flex items-end justify-end gap-2">
                    {hasSale ? (
                        <>
                            <span className="text-sm text-text-muted line-through">
                                {formatPrice(tour.price_adult)}
                            </span>
                            <span className="text-xl font-extrabold text-secondary">
                                {formatPrice(tour.sale_price_adult)}
                            </span>
                        </>
                    ) : (
                        <span className="text-xl font-extrabold text-primary">
                            {formatPrice(tour.price_adult)}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default TourCard;
