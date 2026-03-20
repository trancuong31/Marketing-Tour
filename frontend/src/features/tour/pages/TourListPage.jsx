import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { tourService } from '@/services/tourService';
import TourCard from '@/components/tour/TourCard';
import ClientLayout from '@/components/layout/ClientLayout';
import { MapPin, Globe2, Loader2, ChevronDown, X, Filter, SlidersHorizontal } from 'lucide-react';
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
};

const BUDGET_OPTIONS = [
    { label: 'Dưới 5 triệu', min: 0, max: 5000000 },
    { label: '5 - 10 triệu', min: 5000000, max: 10000000 },
    { label: '10 - 20 triệu', min: 10000000, max: 20000000 },
    { label: 'Trên 20 triệu', min: 20000000, max: Infinity },
];

const TRANSPORTS = ['Xe', 'Máy bay'];

/* ═══ Reusable: chip toggle ═══ */
const ChipToggle = ({ label, active, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
            active
                ? 'bg-[#1a3c6e] text-white border-[#1a3c6e]'
                : 'bg-white text-text-secondary border-border hover:border-primary/40 hover:text-primary'
        }`}
    >
        {label}
    </button>
);

/* ═══ Reusable: select dropdown ═══ */
const SelectField = ({ label, value, onChange, options }) => (
    <div>
        <p className="text-sm font-bold text-text mb-2">{label}</p>
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full appearance-none px-3 py-2.5 pr-9 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition cursor-pointer"
            >
                <option value="">Tất cả</option>
                {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        </div>
    </div>
);

const TourListPage = () => {
    const location = useLocation();
    const type = location.pathname.includes('quoc-te') ? 'quoc-te' : 'noi-dia';
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMobileFilter, setShowMobileFilter] = useState(false);

    const config = typeConfig[type];
    const Icon = config.icon;

    // Filter state
    const [filters, setFilters] = useState({
        budget: null,        // index in BUDGET_OPTIONS or null
        departure: '',       // departure_point string
        destination: '',     // destination string (placeholder — tours may not have this field)
        departureDate: '',   // ISO date string
        transport: null,     // string from TRANSPORTS or null
    });

    useEffect(() => {
        const fetchTours = async () => {
            setLoading(true);
            try {
                const res = await tourService.getAll(config.apiType);
                setTours(res.data.data || []);
            } catch (err) {
                console.error('Lỗi tải tour:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTours();
        // Reset filters when type changes
        setFilters({ budget: null, departure: '', destination: '', departureDate: '', tourLine: null, transport: null });
    }, [type]);

    // Extract unique departure points for the dropdown
    const departurePoints = useMemo(() => {
        const set = new Set(tours.map(t => t.departure_point).filter(Boolean));
        return [...set].sort();
    }, [tours]);

    // Extract unique destinations (could be category name or destination field)
    const destinations = useMemo(() => {
        const set = new Set(tours.map(t => t.destination || t.Category?.name).filter(Boolean));
        return [...set].sort();
    }, [tours]);

    // Apply filters
    const filteredTours = useMemo(() => {
        return tours.filter(tour => {
            // Budget
            if (filters.budget !== null) {
                const opt = BUDGET_OPTIONS[filters.budget];
                const price = parseFloat(tour.sale_price || tour.price || 0);
                if (price < opt.min || price >= opt.max) return false;
            }
            // Departure point
            if (filters.departure && tour.departure_point !== filters.departure) return false;
            // Destination
            if (filters.destination) {
                const dest = tour.destination || tour.Category?.name || '';
                if (dest !== filters.destination) return false;
            }
            return true;
        });
    }, [tours, filters]);

    const hasActiveFilter = filters.budget !== null || filters.departure || filters.destination || filters.departureDate || filters.tourLine !== null || filters.transport !== null;

    const clearFilters = () => {
        setFilters({ budget: null, departure: '', destination: '', departureDate: '', tourLine: null, transport: null });
    };

    /* ═══ Filter sidebar content (shared mobile/desktop) ═══ */
    const FilterContent = () => (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#1a3c6e] uppercase tracking-wide flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    Bộ lọc tìm kiếm
                </h3>
                {hasActiveFilter && (
                    <button onClick={clearFilters} className="text-xs text-primary hover:underline font-medium">
                        Xóa tất cả
                    </button>
                )}
            </div>

            {/* Ngân sách */}
            <div>
                <p className="text-sm font-bold text-text mb-2">Ngân sách</p>
                <div className="flex flex-wrap gap-2">
                    {BUDGET_OPTIONS.map((opt, i) => (
                        <ChipToggle
                            key={i}
                            label={opt.label}
                            active={filters.budget === i}
                            onClick={() => setFilters(f => ({ ...f, budget: f.budget === i ? null : i }))}
                        />
                    ))}
                </div>
            </div>

            {/* Điểm khởi hành */}
            <SelectField
                label="Điểm khởi hành"
                value={filters.departure}
                onChange={(v) => setFilters(f => ({ ...f, departure: v }))}
                options={departurePoints}
            />

            {/* Điểm đến */}
            <SelectField
                label="Điểm đến"
                value={filters.destination}
                onChange={(v) => setFilters(f => ({ ...f, destination: v }))}
                options={destinations}
            />

            {/* Ngày đi */}
            <div>
                <p className="text-sm font-bold text-text mb-2">Ngày đi</p>
                <input
                    type="date"
                    value={filters.departureDate}
                    onChange={(e) => setFilters(f => ({ ...f, departureDate: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
            </div>
            {/* Phương tiện */}
            <div>
                <p className="text-sm font-bold text-text mb-2">Phương tiện</p>
                <div className="flex flex-wrap gap-2">
                    {TRANSPORTS.map((t) => (
                        <ChipToggle
                            key={t}
                            label={t}
                            active={filters.transport === t}
                            onClick={() => setFilters(f => ({ ...f, transport: f.transport === t ? null : t }))}
                        />
                    ))}
                </div>
            </div>

            {/* Áp dụng (mobile only) */}
            <button
                onClick={() => setShowMobileFilter(false)}
                className="w-full py-3 bg-[#1a3c6e] text-white font-bold rounded-xl hover:bg-[#15325c] transition lg:hidden"
            >
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
                {/* Mobile filter toggle */}
                <button
                    onClick={() => setShowMobileFilter(true)}
                    className="lg:hidden mb-4 inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-sm font-medium text-text shadow-sm hover:shadow transition"
                >
                    <Filter className="w-4 h-4" />
                    Bộ lọc
                    {hasActiveFilter && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                    )}
                </button>

                <div className="flex gap-8">
                    {/* ═══ SIDEBAR FILTER (Desktop) ═══ */}
                    <aside className="hidden lg:block w-[280px] shrink-0">
                        <div className="sticky top-20 bg-white rounded-2xl border border-border shadow-sm p-5">
                            <FilterContent />
                        </div>
                    </aside>

                    {/* ═══ TOUR GRID ═══ */}
                    <div className="flex-1 min-w-0">
                        <p className="text-text-muted text-sm mb-6">
                            {loading ? 'Đang tải...' : `Hiển thị ${filteredTours.length} / ${tours.length} tour`}
                        </p>

                        {loading ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
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
                                    <button
                                        onClick={clearFilters}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        Xóa bộ lọc
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ═══ MOBILE FILTER DRAWER ═══ */}
            {showMobileFilter && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilter(false)} />
                    {/* Drawer */}
                    <div className="absolute inset-y-0 left-0 w-[320px] max-w-[85vw] bg-white shadow-2xl overflow-y-auto animate-slide-left">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h3 className="font-bold text-text">Bộ lọc tìm kiếm</h3>
                            <button onClick={() => setShowMobileFilter(false)} className="p-1.5 rounded-lg hover:bg-surface-alt transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5">
                            <FilterContent />
                        </div>
                    </div>
                </div>
            )}
        </ClientLayout>
    );
};

export default TourListPage;
