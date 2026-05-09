import { Check, Loader2 } from 'lucide-react';
import { getImageUrl } from '@/utils/imageUrl';

const BannerTourListItem = ({ tour, isPinned, isActionLoading, isItemLoading, onToggle, idx }) => {
    return (
        <div 
            className={`group bg-surface rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col md:flex-row ${
                isPinned ? 'border-primary shadow-lg ring-1 ring-primary/20' : 'border-border hover:border-primary/40 hover:shadow-md'
            }`}
            style={{ animationDelay: `${idx * 30}ms` }}
        >
            <div className="relative w-full md:w-64 h-48 md:h-auto overflow-hidden shrink-0 bg-surface-alt">
                <img 
                    src={getImageUrl(tour.thumbnail_url || (tour.images && tour.images[0]?.image_url))} 
                    alt={tour.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                {isPinned && (
                    <div className="absolute top-3 left-3 bg-primary text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Đang hiển thị
                    </div>
                )}
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-bold text-text line-clamp-2 mb-2">
                        {tour.title}
                    </h3>
                    <span className="text-xs text-text-muted">Mã Tour: #{tour.id}</span>
                </div>
                
                <div className="flex justify-end pt-4 border-t border-border/50 mt-4 md:mt-0">
                    <button
                        onClick={() => onToggle(tour)}
                        disabled={isActionLoading}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                            isPinned 
                                ? 'bg-error/10 text-error hover:bg-error hover:text-white' 
                                : 'bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-primary/30'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        { isItemLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isPinned ? (
                            <>Gỡ khỏi Slider</>
                        ) : (
                            <>Đưa vào Slider</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BannerTourListItem;
