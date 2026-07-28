import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SWIPE_THRESHOLD_PX = 45;
const HORIZONTAL_SWIPE_RATIO = 1.2;

const getCardsPerView = () => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 4;
};

const useCarouselSwipe = ({
    enabled,
    onSwipeLeft,
    onSwipeRight,
    onSwipeStart,
    onSwipeEnd,
}) => {
    const swipeRef = useRef({ startX: 0, startY: 0, isTracking: false });

    return useMemo(() => ({
        onTouchStart: (event) => {
            if (!enabled) return;
            const touch = event.touches?.[0];
            if (!touch) return;

            swipeRef.current = {
                startX: touch.clientX,
                startY: touch.clientY,
                isTracking: true,
            };
            onSwipeStart?.();
        },
        onTouchEnd: (event) => {
            if (!enabled || !swipeRef.current.isTracking) return;
            const touch = event.changedTouches?.[0];
            if (!touch) return;

            const deltaX = touch.clientX - swipeRef.current.startX;
            const deltaY = touch.clientY - swipeRef.current.startY;
            const isHorizontalSwipe = Math.abs(deltaX) > SWIPE_THRESHOLD_PX
                && Math.abs(deltaX) > Math.abs(deltaY) * HORIZONTAL_SWIPE_RATIO;

            swipeRef.current.isTracking = false;

            if (isHorizontalSwipe) {
                if (deltaX < 0) {
                    onSwipeLeft?.();
                } else {
                    onSwipeRight?.();
                }
            }

            onSwipeEnd?.();
        },
        onTouchCancel: () => {
            swipeRef.current.isTracking = false;
            onSwipeEnd?.();
        },
    }), [enabled, onSwipeEnd, onSwipeLeft, onSwipeRight, onSwipeStart]);
};

const CarouselSection = ({
    items,
    title,
    description,
    renderItem,
    getItemKey = (item) => item?.id,
    previousLabel,
    nextLabel,
    getDotLabel,
    sectionClassName = 'py-12 bg-white border-t border-border',
    titleClassName = 'text-xl',
    autoplayDelay = 4500,
    maxItems = 8,
}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [cardsPerView, setCardsPerView] = useState(getCardsPerView);
    const [isPaused, setIsPaused] = useState(false);
    const carouselItems = useMemo(() => (items || []).slice(0, maxItems), [items, maxItems]);

    useEffect(() => {
        const updateCardsPerView = () => {
            setCardsPerView(getCardsPerView());
        };

        updateCardsPerView();
        window.addEventListener('resize', updateCardsPerView);
        return () => window.removeEventListener('resize', updateCardsPerView);
    }, []);

    useEffect(() => {
        setActiveIndex(0);
    }, [carouselItems.length]);

    useEffect(() => {
        if (carouselItems.length <= cardsPerView || isPaused) return undefined;

        const timer = setInterval(() => {
            setActiveIndex((current) => (current + 1) % carouselItems.length);
        }, autoplayDelay);

        return () => clearInterval(timer);
    }, [autoplayDelay, cardsPerView, carouselItems.length, isPaused]);

    const moveToItem = (index) => {
        setActiveIndex((index + carouselItems.length) % carouselItems.length);
    };

    const swipeHandlers = useCarouselSwipe({
        enabled: carouselItems.length > cardsPerView,
        onSwipeLeft: () => moveToItem(activeIndex + 1),
        onSwipeRight: () => moveToItem(activeIndex - 1),
        onSwipeStart: () => setIsPaused(true),
        onSwipeEnd: () => setIsPaused(false),
    });

    const visibleItems = useMemo(() => {
        const visibleCount = Math.min(cardsPerView, carouselItems.length);

        return Array.from({ length: visibleCount }, (_, offset) => (
            carouselItems[(activeIndex + offset) % carouselItems.length]
        ));
    }, [activeIndex, cardsPerView, carouselItems]);

    if (carouselItems.length === 0) return null;

    const shouldShowControls = carouselItems.length > cardsPerView;

    return (
        <section
            className={sectionClassName}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-primary rounded-full" />
                            <h2 className={`${titleClassName} font-bold text-text uppercase tracking-tight`}>
                                {title}
                            </h2>
                        </div>
                        {description && (
                            <p className="text-sm text-text-muted mt-1">{description}</p>
                        )}
                    </div>

                    {shouldShowControls && (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => moveToItem(activeIndex - 1)}
                                className="w-10 h-10 rounded-full border border-border bg-white text-primary shadow-sm hover:border-primary hover:bg-primary hover:text-white transition-colors flex items-center justify-center"
                                aria-label={previousLabel}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => moveToItem(activeIndex + 1)}
                                className="w-10 h-10 rounded-full border border-border bg-white text-primary shadow-sm hover:border-primary hover:bg-primary hover:text-white transition-colors flex items-center justify-center"
                                aria-label={nextLabel}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="overflow-hidden touch-pan-y select-none" {...swipeHandlers}>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {visibleItems.map((item, index) => (
                            <div
                                key={`${getItemKey(item) ?? index}-${activeIndex}-${index}`}
                                className="min-w-0 animate-in fade-in slide-in-from-right-2"
                            >
                                {renderItem(item, index, activeIndex)}
                            </div>
                        ))}
                    </div>
                </div>

                {shouldShowControls && (
                    <div className="flex items-center justify-center gap-3 mt-8">
                        {carouselItems.map((item, index) => (
                            <button
                                key={`carousel-dot-${getItemKey(item) ?? index}-${index}`}
                                type="button"
                                onClick={() => moveToItem(index)}
                                className={`h-3 rounded-full transition-all ${
                                    index === activeIndex
                                        ? 'w-3 bg-primary shadow-sm'
                                        : 'w-3 bg-border hover:bg-primary/50'
                                }`}
                                aria-label={getDotLabel?.(index, item)}
                                aria-current={index === activeIndex ? 'true' : undefined}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default CarouselSection;
