import { ExternalLink, List } from 'lucide-react';
import { getImageUrl } from '@/utils/imageUrl';

const TourOverviewGridItem = ({ tour, onSelectTour }) => {
    return (
        <div 
            className="group bg-surface rounded-2xl border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        >
            <div className="relative h-40 overflow-hidden cursor-pointer group/img" onClick={() => window.open(`/tours/${tour.slug}`, '_blank')}>
                <img 
                    src={getImageUrl(tour.thumbnail_url) || '/placeholder-tour.jpg'} 
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover/img:opacity-80 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-2">
                    <h3 className="text-white font-bold line-clamp-2 leading-tight group-hover/img:text-primary-light transition-colors">{tour.title}</h3>
                    <ExternalLink className="w-4 h-4 text-white/50 group-hover/img:text-white transition-all flex-shrink-0 mb-1" />
                </div>
                {tour.pending > 0 && (
                    <div className="absolute top-4 right-4 bg-error text-white text-[10px] font-bold px-2 py-1 rounded-full animate-bounce shadow-lg shadow-error/20">
                        {tour.pending} ĐƠN CHỜ
                    </div>
                )}
            </div>
        
            <div className="p-5">
                <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-warning/5 border border-warning/10 p-3 rounded-xl flex flex-col items-center justify-center">
                        <span className="text-xs text-warning font-medium mb-1 uppercase tracking-wider">Đang chờ</span>
                        <span className="text-xl font-bold text-warning">{tour.pending}</span>
                    </div>
                    <div className="bg-success/5 border border-success/10 p-3 rounded-xl flex flex-col items-center justify-center">
                        <span className="text-xs text-success font-medium mb-1 uppercase tracking-wider">Đã duyệt</span>
                        <span className="text-xl font-bold text-success">{tour.approved}</span>
                    </div>
                    <div className="bg-error/5 border border-error/10 p-3 rounded-xl flex flex-col items-center justify-center">
                        <span className="text-xs text-error font-medium mb-1 uppercase tracking-wider">Đã hủy</span>
                        <span className="text-xl font-bold text-error">{tour.cancelled}</span>
                    </div>
                </div>                                    
                <button 
                    onClick={() => onSelectTour(tour)}
                    className="w-full py-3 bg-primary/5 hover:bg-primary text-primary hover:text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-primary/20 group-hover:border-primary"
                >
                    <List className="w-4 h-4" />
                    Xem chi tiết
                </button>
            </div>
        </div>
    );
};

export default TourOverviewGridItem;
