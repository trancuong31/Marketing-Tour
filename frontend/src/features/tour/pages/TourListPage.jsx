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

// 💡 Đổi mảng BUDGET_OPTIONS sang dùng value khớp với backend API
const BUDGET_OPTIONS = [
    { label: 'Dưới 5 triệu', value: 'under_5M' },
    { label: '5 - 10 triệu', value: '5M_10M' },
    { label: '10 - 20 triệu', value: '10M_20M' },
    { label: 'Trên 20 triệu', value: 'over_20M' },
];

const TRANSPORTS = ['Xe máy lạnh', 'Máy bay']; // Tùy chỉnh theo data thực tế

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
    const config = typeConfig[type];
    const Icon = config.icon;

    // 💡 Đọc params từ URL (do SearchBar ở trang chủ truyền sang)
    const searchParams = new URLSearchParams(location.search);
    const initialQ = searchParams.get('q') || '';
    const initialDate = searchParams.get('date') || '';
    const initialBudget = searchParams.get('budget') || '';

    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const [departurePoints, setDeparturePoints] = useState([]); // List điểm đón

    // Filter state
    const [filters, setFilters] = useState({
        budget: initialBudget || '', 
        departureDate: initialDate || '',
        departure: '', 
        destination: '', 
        transport: '', 
    });

    useEffect(() => {
        const fetchPickupLocations = async () => {
            try {
                const res = await tourService.getPickupLocations();
                if (res.data?.data) {
                    setDeparturePoints(res.data.data);
                }
            } catch (err) {
                console.error('Lỗi tải điểm đón:', err);
            }
        };
        fetchPickupLocations();
    }, []);

    useEffect(() => {
        const fetchTours = async () => {
            setLoading(true);
            try {
                const params = {
                    type: config.apiType,
                    q: initialQ, 
                };
                if (filters.budget) params.budget = filters.budget;
                if (filters.departureDate) params.date = filters.departureDate;
                const res = await tourService.getAll(params);
                setTours(res.data.data || []);
            } catch (err) {
                console.error('Lỗi tải tour:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTours();
    }, [config.apiType, initialQ, filters.budget, filters.departureDate]);


    // Extract unique destinations cho dropdown
    const destinations = useMemo(() => {
        const set = new Set(tours.map(t => t.Category?.name).filter(Boolean));
        return [...set].sort();
    }, [tours]);

    // 💡 3. Frontend lọc các tiêu chí còn lại
    const filteredTours = useMemo(() => {
        return tours.filter(tour => {
            // Lọc theo điểm đón (Pickup Location)
            if (filters.departure) {
                const hasLocation = tour.pickupLocations?.some(loc => loc.location_name === filters.departure);
                if (!hasLocation) return false;
            }

            // Lọc theo Điểm đến (Dựa vào category name tạm thời)
            if (filters.destination) {
                const dest = tour.Category?.name || '';
                if (dest !== filters.destination) return false;
            }

            // Lọc theo phương tiện (Nếu DB bạn có trường lưu phương tiện thì thêm logic vào đây)
            // if (filters.transport) { ... }

            return true;
        });
    }, [tours, filters]);

    const hasActiveFilter = filters.budget !== '' || filters.departure !== '' || filters.destination !== '' || filters.departureDate !== '' || filters.transport !== '';

    const clearFilters = () => {
        setFilters({ budget: '', departure: '', destination: '', departureDate: '', transport: '' });
    };

    /* ═══ Filter sidebar content ═══ */
    const FilterContent = () => (
        <div className="space-y-6">
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
                    {BUDGET_OPTIONS.map((opt) => (
                        <ChipToggle
                            key={opt.value}
                            label={opt.label}
                            active={filters.budget === opt.value}
                            onClick={() => setFilters(f => ({ ...f, budget: f.budget === opt.value ? '' : opt.value }))}
                        />
                    ))}
                </div>
            </div>

            {/* Điểm khởi hành (Fetch từ Backend) */}
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
                            onClick={() => setFilters(f => ({ ...f, transport: f.transport === t ? '' : t }))}
                        />
                    ))}
                </div>
            </div>

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
                    {/* SIDEBAR FILTER (Desktop) */}
                    <aside className="hidden lg:block w-[280px] shrink-0">
                        <div className="sticky top-20 bg-white rounded-2xl border border-border shadow-sm p-5">
                            <FilterContent />
                        </div>
                    </aside>

                    {/* TOUR GRID */}
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

            {/* MOBILE FILTER DRAWER */}
            {showMobileFilter && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilter(false)} />
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