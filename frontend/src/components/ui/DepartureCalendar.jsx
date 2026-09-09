import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { CalendarDays, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const formatShortPrice = (price) => {
    const m = price / 1000000;
    return m.toFixed(1).replace(/\.0$/, '').replace('.', ',') + 'tr';
};

const DepartureCalendar = ({
    label,
    labelIcon,
    value,
    onChange,
    departurePriceMap = {},
    className = '',
    placeholder,
    minDate,
    selectableDatesOnly = true,
    disabled = false,
}) => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownAbove, setIsDropdownAbove] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState({});
    const [displayMonth, setDisplayMonth] = useState(() => value ? new Date(value + 'T00:00:00') : new Date());
    const ref = useRef(null);
    const dropdownRef = useRef(null);

    const locale = i18n.language === 'en' ? 'en-US' : i18n.language === 'zh' ? 'zh-CN' : 'vi-VN';
    const monthNames = useMemo(() => Array.from({length: 12}, (_, i) => new Date(2000, i, 1).toLocaleString(locale, { month: 'long' })), [locale]);
    const dayHeaders = useMemo(() => Array.from({length: 7}, (_, i) => new Date(2000, 0, 3 + i).toLocaleString(locale, { weekday: 'short' })), [locale]);

    // Render the calendar as a viewport-level floating layer so parent overflow never clips it.
    useEffect(() => {
        if (!isOpen || !ref.current) return;

        const updateDropdownPosition = () => {
            const rect = ref.current.getBoundingClientRect();
            const horizontalPadding = 16;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const width = Math.min(340, viewportWidth - horizontalPadding * 2);
            const measuredHeight = dropdownRef.current?.offsetHeight || 360;
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;
            const isAbove = spaceBelow < measuredHeight + 16 && spaceAbove > spaceBelow;
            const left = Math.min(
                Math.max(rect.left, horizontalPadding),
                Math.max(horizontalPadding, viewportWidth - width - horizontalPadding)
            );
            const top = isAbove
                ? Math.max(horizontalPadding, rect.top - measuredHeight - 8)
                : Math.min(rect.bottom + 8, Math.max(horizontalPadding, viewportHeight - measuredHeight - horizontalPadding));

            setIsDropdownAbove(isAbove);
            setDropdownStyle({
                left,
                top,
                width,
            });
        };

        updateDropdownPosition();
        const frame = requestAnimationFrame(updateDropdownPosition);
        window.addEventListener('resize', updateDropdownPosition);
        window.addEventListener('scroll', updateDropdownPosition, true);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('resize', updateDropdownPosition);
            window.removeEventListener('scroll', updateDropdownPosition, true);
        };
    }, [isOpen, displayMonth]);

    useEffect(() => {
        const handler = (e) => { 
            const isInsideTrigger = ref.current?.contains(e.target);
            const isInsideDropdown = dropdownRef.current?.contains(e.target);
            if (!isInsideTrigger && !isInsideDropdown) {
                setIsOpen(false);
            }
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
    const defaultMinDate = format(today, 'yyyy-MM-dd');
    const effectiveMinDate = minDate === undefined ? defaultMinDate : minDate;

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
        if (effectiveMinDate && dateStr < effectiveMinDate) return;
        onChange(dateStr === value ? '' : dateStr);
        setIsOpen(false);
    };

    const handleToggle = () => {
        if (disabled) return;
        if (!isOpen && value) {
            setDisplayMonth(new Date(value + 'T00:00:00'));
        }
        setIsOpen(!isOpen);
    };

    return (
        <div ref={ref} className={`relative ${className}`}>
            {/* Label */}
            {label && (
                <label className="flex items-center gap-2 text-[0.7rem] uppercase tracking-wider text-text-secondary font-bold mb-2 cursor-pointer">
                    {labelIcon && <span className="text-primary">{labelIcon}</span>}
                    {label}
                </label>
            )}

            {/* Input Trigger */}
            <button
                type="button"
                onClick={handleToggle}
                disabled={disabled}
                className={`
                    w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-sm
                    transition-all duration-200 ease-in-out bg-transparent text-text
                    border-border hover:border-primary/40
                    focus:outline-none 
                    ${isOpen ? 'ring-2 ring-primary/30 border-primary/50' : ''}
                    ${disabled ? 'cursor-not-allowed opacity-60 hover:border-border' : ''}
                `}
            >
                <span className={`flex items-center gap-2 truncate font-medium ${!value ? 'text-text-muted' : 'text-text'}`}>
                    {value 
                        ? new Date(value + 'T00:00:00').toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }) 
                        : placeholder || t('home.search.selectDeparture', 'Chọn ngày khởi hành...')}
                </span>
                
                {value && !disabled ? (
                    <div 
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            onChange(''); 
                        }} 
                        className="p-1 rounded-md hover:bg-surface-alt transition-colors group flex-shrink-0"
                    >
                        <X className="w-4 h-4 text-text-muted group-hover:text-text" />
                    </div>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-4 h-4 shrink-0 text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </button>

            {/* Dropdown Calendar */}
            {isOpen && typeof document !== 'undefined' && createPortal(
                <div
                    ref={dropdownRef}
                    className="fixed z-[10000] max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-lg border border-border bg-surface p-3 shadow-lg transition-all duration-200 ease-in-out sm:p-4"
                    style={dropdownStyle}
                    data-placement={isDropdownAbove ? 'top' : 'bottom'}
                >
                    <div className="flex items-center justify-between mb-4">
                        <button type="button" onClick={() => setDisplayMonth(new Date(year, month - 1, 1))} className="p-1.5 rounded-lg hover:bg-surface-alt transition text-text-muted hover:text-text">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="font-bold text-base text-text capitalize">{monthNames[month]} {year}</span>
                        <button type="button" onClick={() => setDisplayMonth(new Date(year, month + 1, 1))} className="p-1.5 rounded-lg hover:bg-surface-alt transition text-text-muted hover:text-text">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 mb-2">
                        {dayHeaders.map(d => (
                            <div key={d} className="text-center text-xs font-semibold text-text-muted py-1 capitalize">{d}</div>
                        ))}
                    </div>

                    {weeks.map((week, wi) => (
                        <div key={wi} className="grid grid-cols-7 gap-y-1">
                            {week.map((day, di) => {
                                if (!day) return <div key={di} className="h-11 sm:h-12" />;
                                
                                const dateStr = format(new Date(year, month, day), 'yyyy-MM-dd');
                                const isBeforeMinDate = !!effectiveMinDate && dateStr < effectiveMinDate;
                                const isSelected = value === dateStr;
                                const price = departurePriceMap[dateStr];
                                const hasDep = !!price;
                                const isSelectableDate = selectableDatesOnly ? hasDep : true;
                                const isCheapest = hasDep && price === monthMinPrice;

                                return (
                                    <button
                                        key={di}
                                        type="button"
                                        disabled={isBeforeMinDate || !isSelectableDate}
                                        onClick={() => handleDayClick(day)}
                                        className={`
                                            h-11 sm:h-12 flex flex-col items-center justify-center rounded-lg text-sm transition-all relative
                                            ${isSelected ? 'bg-primary text-white shadow-sm font-medium' : ''}
                                            ${isBeforeMinDate ? 'text-text-muted/40 cursor-not-allowed' : ''}
                                            ${!isSelectableDate && !isBeforeMinDate ? 'text-text-muted/50 cursor-default' : ''}
                                            ${isSelectableDate && !isSelected && !isBeforeMinDate ? 'text-text font-medium hover:bg-surface-alt cursor-pointer' : ''}
                                        `}
                                    >
                                        <span className="leading-none">{day}</span>
                                        {hasDep && (
                                            <span className={`text-[10px] leading-tight mt-1 tracking-tight ${isSelected ? 'text-white/90' : isCheapest ? 'text-emerald-500 font-bold' : 'text-text-muted'}`}>
                                                {formatShortPrice(price)}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </div>
    );
};

export default DepartureCalendar;
