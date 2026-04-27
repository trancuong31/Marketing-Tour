import { useState, useEffect, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { CalendarDays, X, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
const DAY_HEADERS = ['Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'CN'];

const formatShortPrice = (price) => {
    const m = price / 1000000;
    return m.toFixed(1).replace(/\.0$/, '').replace('.', ',') + 'tr';
};

const DepartureCalendar = ({ label, value, onChange, departurePriceMap = {}, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownAbove, setIsDropdownAbove] = useState(false);
    const [displayMonth, setDisplayMonth] = useState(() => new Date());
    const ref = useRef(null);

    // Measure space to decide dropdown direction
    useEffect(() => {
        if (isOpen && ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            // Estimated calendar height is ~380px
            if (spaceBelow < 380 && spaceAbove > spaceBelow) {
                setIsDropdownAbove(true);
            } else {
                setIsDropdownAbove(false);
            }
        }
    }, [isOpen]);

    useEffect(() => {
        const handler = (e) => { 
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); 
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const year = displayMonth.getFullYear();
    const month = displayMonth.getMonth();
    const startDow = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weeks = useMemo(() => {
        const result = [];
        let week = new Array(startDow).fill(null);
        for (let d = 1; d <= daysInMonth; d++) {
            week.push(d);
            if (week.length === 7) { result.push(week); week = []; }
        }
        if (week.length) { while (week.length < 7) week.push(null); result.push(week); }
        return result;
    }, [startDow, daysInMonth]);

    const today = new Date(); 
    today.setHours(0, 0, 0, 0);

    const monthMinPrice = useMemo(() => {
        let min = Infinity;
        for (let d = 1; d <= daysInMonth; d++) {
            const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            if (departurePriceMap[key] && departurePriceMap[key] < min) min = departurePriceMap[key];
        }
        return min;
    }, [departurePriceMap, year, month, daysInMonth]);

    const handleDayClick = (day) => {
        const dateStr = format(new Date(year, month, day), 'yyyy-MM-dd');
        onChange(dateStr === value ? '' : dateStr);
        setIsOpen(false);
    };

    return (
        <div ref={ref} className={`relative ${className}`}>
            {/* Label */}
            {label && (
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 cursor-pointer">
                    {label}
                </label>
            )}

            {/* Input Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between gap-2 px-3.5 py-2.5 
                    bg-white border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20
                    ${isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'}
                `}
            >
                <div className="flex items-center gap-3 truncate">
                    <CalendarDays className={`w-5 h-5 flex-shrink-0 transition-colors ${value ? 'text-primary' : 'text-gray-400'}`} />
                    <span className={`truncate text-sm sm:text-base text-left ${value ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                        {value 
                            ? new Date(value + 'T00:00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
                            : 'Chọn ngày khởi hành...'}
                    </span>
                </div>
                
                {value && (
                    <div 
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            onChange(''); 
                        }} 
                        className="p-1 rounded-md hover:bg-slate-100 transition-colors group flex-shrink-0"
                    >
                        <X className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                    </div>
                )}
            </button>

            {/* Dropdown Calendar */}
            {isOpen && (
                <div className={`absolute left-0 z-[9999] bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 p-4 w-[340px] ${
                    isDropdownAbove ? 'bottom-[105%] mb-2' : 'top-[105%] mt-2'
                }`}>
                    <div className="flex items-center justify-between mb-4">
                        <button type="button" onClick={() => setDisplayMonth(new Date(year, month - 1, 1))} className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-500 hover:text-slate-800">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="font-bold text-base text-slate-800">{MONTH_NAMES[month]} {year}</span>
                        <button type="button" onClick={() => setDisplayMonth(new Date(year, month + 1, 1))} className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-500 hover:text-slate-800">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 mb-2">
                        {DAY_HEADERS.map(d => (
                            <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
                        ))}
                    </div>

                    {weeks.map((week, wi) => (
                        <div key={wi} className="grid grid-cols-7 gap-y-1">
                            {week.map((day, di) => {
                                if (!day) return <div key={di} className="h-12" />;
                                
                                const dateStr = format(new Date(year, month, day), 'yyyy-MM-dd');
                                const dateObj = new Date(year, month, day);
                                const isPast = dateObj < today;
                                const isSelected = value === dateStr;
                                const price = departurePriceMap[dateStr];
                                const hasDep = !!price;
                                const isCheapest = hasDep && price === monthMinPrice;

                                return (
                                    <button
                                        key={di}
                                        type="button"
                                        disabled={isPast || !hasDep}
                                        onClick={() => handleDayClick(day)}
                                        className={`
                                            h-12 flex flex-col items-center justify-center rounded-xl text-sm transition-all relative
                                            ${isSelected ? 'bg-primary text-white shadow-md' : ''}
                                            ${isPast ? 'text-slate-200 cursor-not-allowed' : ''}
                                            ${!hasDep && !isPast ? 'text-slate-300 cursor-default' : ''}
                                            ${hasDep && !isSelected && !isPast ? 'text-slate-700 font-medium hover:bg-primary/10 hover:text-primary cursor-pointer' : ''}
                                        `}
                                    >
                                        <span className="leading-none">{day}</span>
                                        {hasDep && (
                                            <span className={`text-[10px] leading-tight mt-1 tracking-tight ${isSelected ? 'text-white/90' : isCheapest ? 'text-emerald-500 font-bold' : 'text-slate-400'}`}>
                                                {formatShortPrice(price)}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DepartureCalendar;