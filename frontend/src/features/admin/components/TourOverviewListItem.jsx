import { List } from 'lucide-react';
import { getImageUrl } from '@/utils/imageUrl';

const TourOverviewListItem = ({ tour, onSelectTour }) => {
    return (
        <div 
            className="group bg-surface rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col md:flex-row"
        >
            <div className="relative w-full md:w-64 h-48 md:h-auto overflow-hidden cursor-pointer shrink-0 group/img" onClick={() => window.open(`/tours/${tour.slug}`, '_blank')}>
                <img 
                    src={getImageUrl(tour.thumbnail_url) || '/placeholder-tour.jpg'} 
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/20 group-hover/img:bg-transparent transition-colors" />
                {tour.pending > 0 && (
                    <div className="absolute top-3 left-3 bg-error text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg shadow-error/20">
                        {tour.pending} ĐƠN CHỜ
                    </div>
                )}
            </div>
        
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-text line-clamp-2 hover:text-primary transition-colors cursor-pointer" onClick={() => window.open(`/tours/${tour.slug}`, '_blank')}>
                            {tour.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-text-muted">Mã Tour: #{tour.id}</span>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 shrink-0 overflow-x-auto pb-2 xl:pb-0">
                        <div className="bg-warning/5 border border-warning/10 px-4 py-2 rounded-xl flex flex-col items-center justify-center min-w-[75px]">
                            <span className="text-[10px] text-warning font-medium mb-0.5 uppercase tracking-wider">Đang chờ</span>
                            <span className="text-lg font-bold text-warning leading-none">{tour.pending}</span>
                        </div>
                        <div className="bg-success/5 border border-success/10 px-4 py-2 rounded-xl flex flex-col items-center justify-center min-w-[75px]">
                            <span className="text-[10px] text-success font-medium mb-0.5 uppercase tracking-wider">Đã duyệt</span>
                            <span className="text-lg font-bold text-success leading-none">{tour.approved}</span>
                        </div>
                        <div className="bg-error/5 border border-error/10 px-4 py-2 rounded-xl flex flex-col items-center justify-center min-w-[75px]">
                            <span className="text-[10px] text-error font-medium mb-0.5 uppercase tracking-wider">Đã hủy</span>
                            <span className="text-lg font-bold text-error leading-none">{tour.cancelled}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t border-border/50">
                    <button 
                        onClick={() => onSelectTour(tour)}
                        className="px-6 py-2.5 bg-primary/5 hover:bg-primary text-primary hover:text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-primary/20"
                    >
                        <List className="w-4 h-4" />
                        Xem chi tiết đơn hàng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TourOverviewListItem;
