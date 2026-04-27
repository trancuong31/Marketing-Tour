import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { tourService } from '@/services/tourService';
import TourCard from '@/components/tour/TourCard';
import ClientLayout from '@/components/layout/ClientLayout';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';
import { MapPin, Globe2, Loader2, X, Filter, SlidersHorizontal, Star, Sparkles, Search } from 'lucide-react';
import DepartureCalendar from '../../../components/ui/DepartureCalendar';
import banahill from '../../../assets/images/banahill.webp';
import tokyo from '../../../assets/images/tokyo.webp';

const typeConfig = {
    'noi-dia': {
        label: 'Tour Nội Địa',
        description: 'Khám phá vẻ đẹp Việt Nam từ Bắc đến Nam',
        icon: MapPin,
        gradient: 'from-primary-400 to-primary-dark',
        apiType: 'domestic',
        img: banahill,
    },
    'quoc-te': {
        label: 'Tour Quốc Tế',
        description: 'Trải nghiệm văn hóa đa dạng khắp thế giới',
        icon: Globe2,
        gradient: 'from-secondary-400 to-secondary-dark',
        apiType: 'international',
        img: tokyo,
    },
    'all': {
        label: 'Kết quả tìm kiếm',
        description: 'Khám phá những hành trình phù hợp nhất với bạn',
        icon: Search,
        gradient: 'from-slate-600 to-slate-800',
        apiType: '',
        img: banahill,
    },
};

const BUDGET_OPTIONS = [
    { label: 'Tất cả', value: '' },
    { label: 'Dưới 5 triệu', value: 'under_5M' },
    { label: '5 - 10 triệu', value: '5M_10M' },
    { label: '10 - 20 triệu', value: '10M_20M' },
    { label: 'Trên 20 triệu', value: 'over_20M' },
];

const BADGE_OPTIONS = [
    { label: 'Tất cả', value: '' },
    { label: '⭐ Tour nổi bật', value: 'featured' },
    { label: '🎁 Tour ưu đãi', value: 'promotion' },
];

const SORT_OPTIONS = [
    { label: 'Mặc định', value: '' },
    { label: 'Giá thấp → cao', value: 'price_asc' },
    { label: 'Giá cao → thấp', value: 'price_desc' },
    { label: 'Ngày khởi hành gần nhất', value: 'date_asc' },
];

/* ═══ Main Page ═══ */
const TourListPage = () => {
    const location = useLocation();
    const type = location.pathname.includes('quoc-te') ? 'quoc-te' : location.pathname.includes('noi-dia') ? 'noi-dia' : 'all';
    const config = typeConfig[type];
    const Icon = config.icon;

    const searchParams = new URLSearchParams(location.search);
    const initialQ = searchParams.get('q') || '';
    const initialDate = searchParams.get('date') || '';
    const initialBudget = searchParams.get('budget') || '';

    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const [departurePoints, setDeparturePoints] = useState([]);
    const [filters, setFilters] = useState({
        budget: initialBudget || '', departureDate: initialDate || '',
        departure: '', destination: '', badge: '',
    });
    const [sortBy, setSortBy] = useState('');

    useEffect(() => {
        tourService.getPickupLocations()
            .then(res => { if (res.data?.data) setDeparturePoints(res.data.data); })
            .catch(err => console.error('Lỗi tải điểm đón:', err));
    }, []);

    // Fetch tours WITHOUT date param — date filtering is client-side so calendar always has full departure data
    useEffect(() => {
        const fetchTours = async () => {
            setLoading(true);
            try {
                const params = { type: config.apiType, q: initialQ };
                if (filters.budget) params.budget = filters.budget;
                const res = await tourService.getAll(params);
                setTours(res.data.data || []);
            } catch (err) { console.error('Lỗi tải tour:', err); }
            finally { setLoading(false); }
        };
        fetchTours();
    }, [config.apiType, initialQ, filters.budget]);

    // Aggregate: dateStr → min price across ALL tours
    const departurePriceMap = useMemo(() => {
        const map = {};
        tours.forEach(tour => {
            (tour.departures || []).forEach(dep => {
                const d = dep.departure_date;
                const p = parseFloat(dep.price_adult);
                if (!map[d] || p < map[d]) map[d] = p;
            });
        });
        return map;
    }, [tours]);

    const departureOptions = useMemo(() => [
        { label: 'Tất cả', value: '' },
        ...departurePoints.map(d => ({ label: d, value: d })),
    ], [departurePoints]);

    const destinationOptions = useMemo(() => {
        const set = new Set(tours.map(t => t.Category?.name).filter(Boolean));
        return [{ label: 'Tất cả', value: '' }, ...[...set].sort().map(d => ({ label: d, value: d }))];
    }, [tours]);

    const filteredTours = useMemo(() => {
        let result = tours.filter(tour => {
            if (filters.departure) {
                if (!tour.pickupLocations?.some(loc => loc.location_name === filters.departure)) return false;
            }
            if (filters.destination && (tour.Category?.name || '') !== filters.destination) return false;
            if (filters.badge && tour.tour_badge !== filters.badge) return false;
            // Client-side date filter
            if (filters.departureDate) {
                if (!tour.departures?.some(d => d.departure_date === filters.departureDate)) return false;
            }
            return true;
        });
        if (sortBy === 'price_asc') result = [...result].sort((a, b) => getMinPrice(a) - getMinPrice(b));
        else if (sortBy === 'price_desc') result = [...result].sort((a, b) => getMinPrice(b) - getMinPrice(a));
        else if (sortBy === 'date_asc') result = [...result].sort((a, b) => getEarliestDate(a).localeCompare(getEarliestDate(b)));
        return result;
    }, [tours, filters, sortBy]);

    const hasActiveFilter = filters.budget !== '' || filters.departure !== '' || filters.destination !== '' || filters.departureDate !== '' || filters.badge !== '';

    const clearFilters = () => {
        setFilters({ budget: '', departure: '', destination: '', departureDate: '', badge: '' });
        setSortBy('');
    };

    const filterContent = (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#1a3c6e] uppercase tracking-wide flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    Bộ lọc tìm kiếm
                </h3>
                {hasActiveFilter && (
                    <button onClick={clearFilters} className="text-xs text-primary hover:underline font-medium">Xóa tất cả</button>
                )}
            </div>
            <DepartureCalendar
                label="Ngày khởi hành"
                value={filters.departureDate}
                onChange={(v) => setFilters(f => ({ ...f, departureDate: v }))}
                departurePriceMap={departurePriceMap}
            />
            <CustomSelect label="Loại tour" value={filters.badge} onChange={(v) => setFilters(f => ({ ...f, badge: v }))} options={BADGE_OPTIONS} placeholder="Tất cả" icon={<Star className="w-4 h-4" />} />
            <CustomSelect label="Ngân sách" value={filters.budget} onChange={(v) => setFilters(f => ({ ...f, budget: v }))} options={BUDGET_OPTIONS} placeholder="Tất cả" />
            <CustomSelect label="Điểm khởi hành" value={filters.departure} onChange={(v) => setFilters(f => ({ ...f, departure: v }))} options={departureOptions} placeholder="Tất cả" icon={<MapPin className="w-4 h-4" />} />
            <CustomSelect label="Điểm đến" value={filters.destination} onChange={(v) => setFilters(f => ({ ...f, destination: v }))} options={destinationOptions} placeholder="Tất cả" />

            

            <CustomSelect label="Sắp xếp theo" value={sortBy} onChange={(v) => setSortBy(v)} options={SORT_OPTIONS} placeholder="Mặc định" />

            <button onClick={() => setShowMobileFilter(false)} className="w-full py-3 bg-[#1a3c6e] text-white font-bold rounded-xl hover:bg-[#15325c] transition lg:hidden">
                Áp dụng
            </button>
        </div>
    );

    return (
        <ClientLayout>
            {/* Banner */}
            <section className={`relative overflow-hidden bg-gradient-to-br ${config.gradient} py-12 sm:py-16 px-4`}>
                <div className="absolute inset-0 opacity-30">
                    <img src={config.img} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="relative max-w-7xl mx-auto text-center text-white">
                    <Icon className="w-12 h-12 mx-auto mb-3 opacity-80" />
                    <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">{config.label}</h1>
                    <p className="text-white/70 text-lg">{config.description}</p>
                </div>
            </section>

            {/* Content: Sidebar + Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                <button onClick={() => setShowMobileFilter(true)} className="lg:hidden mb-4 inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-sm font-medium text-text shadow-sm hover:shadow transition">
                    <Filter className="w-4 h-4" />
                    Bộ lọc
                    {hasActiveFilter && <span className="w-2 h-2 rounded-full bg-primary" />}
                </button>

                <div className="flex gap-8">
                    {/* SIDEBAR — z-10 so calendar popup renders above tour grid */}
                    <aside className="hidden lg:block w-[280px] shrink-0 relative z-10">
                        <div className="sticky top-20 bg-white rounded-2xl border border-border shadow-sm p-5 overflow-visible">
                            {filterContent}
                        </div>
                    </aside>

                    {/* TOUR GRID */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-text-muted text-sm">
                                {loading ? 'Đang tải...' : `Hiển thị ${filteredTours.length} / ${tours.length} tour`}
                            </p>
                            {hasActiveFilter && (
                                <div className="hidden sm:flex items-center gap-2 flex-wrap">
                                    {filters.badge && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded-full">
                                            <Sparkles className="w-3 h-3" />
                                            {BADGE_OPTIONS.find(o => o.value === filters.badge)?.label}
                                            <button onClick={() => setFilters(f => ({ ...f, badge: '' }))} className="ml-0.5 hover:text-secondary-dark"><X className="w-3 h-3" /></button>
                                        </span>
                                    )}
                                    {filters.departure && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                            {filters.departure}
                                            <button onClick={() => setFilters(f => ({ ...f, departure: '' }))} className="ml-0.5 hover:text-primary-dark"><X className="w-3 h-3" /></button>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
                        ) : filteredTours.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredTours.map((tour, i) => (
                                    <div key={tour.id} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                                        <TourCard tour={tour} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <Icon className="w-16 h-16 mx-auto text-text-muted/30 mb-4" />
                                <p className="text-xl font-semibold text-text mb-1">Không tìm thấy tour</p>
                                <p className="text-text-muted mb-4">Thử thay đổi bộ lọc để xem thêm kết quả</p>
                                {hasActiveFilter && (
                                    <button onClick={clearFilters} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition">
                                        <X className="w-3.5 h-3.5" /> Xóa bộ lọc
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* MOBILE FILTER DRAWER */}
            {showMobileFilter && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilter(false)} />
                    <div className="absolute inset-y-0 left-0 w-[320px] max-w-[85vw] bg-white shadow-2xl overflow-y-auto animate-slide-left">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h3 className="font-bold text-text">Bộ lọc tìm kiếm</h3>
                            <button onClick={() => setShowMobileFilter(false)} className="p-1.5 rounded-lg hover:bg-surface-alt transition"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-5">{filterContent}</div>
                    </div>
                </div>
            )}
        </ClientLayout>
    );
};

export default TourListPage;