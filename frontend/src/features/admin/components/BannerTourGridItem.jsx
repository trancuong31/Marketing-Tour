import { Check, Loader2 } from 'lucide-react';
import { getImageUrl } from '@/utils/imageUrl';

const BannerTourGridItem = ({ tour, isPinned, isActionLoading, isItemLoading, onToggle, idx }) => {
    return (
        <div 
            className={`group relative bg-surface rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col ${
                isPinned ? 'border-primary shadow-lg ring-1 ring-primary/20' : 'border-border hover:border-primary/40 hover:shadow-md'
            }`}
            style={{ animationDelay: `${idx * 30}ms` }}
        >
            {/* Thumbnail */}
            <div className="aspect-[16/10] overflow-hidden relative bg-surface-alt">
                <img 
                    src={getImageUrl(tour.thumbnail_url || (tour.images && tour.images[0]?.image_url))} 
                    alt={tour.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {isPinned && (
                    <div className="absolute top-2 right-2 bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                        <Check className="w-3 h-3" /> Đang hiển thị
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-text text-sm line-clamp-2 mb-4 flex-1">
                    {tour.title}
                </h3>
                
                <button
                    onClick={() => onToggle(tour)}
                    disabled={isActionLoading}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        isPinned 
                            ? 'bg-error/10 text-error hover:bg-error hover:text-white' 
                            : 'bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-primary/30'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    { isItemLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isPinned ? (
                        <>Gỡ khỏi Slider</>
                    ) : (
                        <>Đưa vào Slider</>
                    )}
                </button>
            </div>
        </div>
    );
};

export default BannerTourGridItem;
