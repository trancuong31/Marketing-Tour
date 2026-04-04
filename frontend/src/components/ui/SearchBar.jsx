import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, CalendarDays, Wallet } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format, parse } from 'date-fns';
import { vi } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import CustomSelect from './CustomSelect/CustomSelect';

const budgetOptions = [
    { label: 'Tất cả mức giá', value: '' },
    { label: 'Dưới 5 triệu', value: 'under_5M' },
    { label: 'Từ 5 - 10 triệu', value: '5M_10M' },
    { label: 'Từ 10 - 20 triệu', value: '10M_20M' },
    { label: 'Trên 20 triệu', value: 'over_20M' }
];

const SearchBar = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useState({
        keyword: '',
        date: '',
        budget: ''
    });

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const calendarRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setIsCalendarOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedDateObj = searchParams.date ? parse(searchParams.date, 'yyyy-MM-dd', new Date()) : undefined;

    const handleDateSelect = (date) => {
        if (date) {
            setSearchParams({ ...searchParams, date: format(date, 'yyyy-MM-dd') });
        } else {
            setSearchParams({ ...searchParams, date: '' });
        }
        setIsCalendarOpen(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const query = new URLSearchParams();
        if (searchParams.keyword) query.append('q', searchParams.keyword);
        if (searchParams.date) query.append('date', searchParams.date);
        if (searchParams.budget) query.append('budget', searchParams.budget);
        navigate(`/tours?${query.toString()}`);
    };

    return (
        <form
            onSubmit={handleSearch}
            className="w-full bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/50 flex flex-col lg:flex-row items-stretch gap-1"
        >
            {/* Điểm đến */}
            <div className="group flex-1 flex items-center gap-3 px-4 py-3.5 rounded-xl sm:rounded-2xl hover:bg-primary/5 transition-colors duration-200 border-b border-slate-100 lg:border-b-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                        Bạn muốn đi đâu?
                    </label>
                    <input
                        type="text"
                        placeholder="Tên tour, điểm đến..."
                        className="w-full bg-transparent border-none outline-none ring-0 focus:ring-0 text-slate-800 font-semibold text-sm sm:text-base placeholder:text-slate-300 placeholder:font-normal p-0"
                        value={searchParams.keyword}
                        onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
                    />
                </div>
            </div>

            {/* Divider dọc - chỉ hiện trên desktop */}
            <div className="hidden lg:flex items-center">
                <div className="w-px h-10 bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
            </div>

            {/* Ngày khởi hành */}
            <div 
                ref={calendarRef}
                className="group flex-1 flex items-center gap-3 px-4 py-3.5 rounded-xl sm:rounded-2xl hover:bg-primary/5 transition-colors duration-200 border-b border-slate-100 lg:border-b-0 relative cursor-pointer"
                onClick={() => setIsCalendarOpen(true)}
            >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5 cursor-pointer">
                        Ngày khởi hành
                    </label>
                    <div className="w-full text-slate-800 font-semibold text-sm sm:text-base truncate">
                        {searchParams.date ? format(selectedDateObj, 'dd/MM/yyyy') : <span className="text-slate-300 font-normal">Ngày đi...</span>}
                    </div>
                </div>

                {/* Calendar Dropdown */}
                {isCalendarOpen && (
                    <div 
                        className="absolute top-[105%] left-0 z-[9999] bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 p-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <DayPicker
                            mode="single"
                            selected={selectedDateObj}
                            onSelect={handleDateSelect}
                            locale={vi}
                            className="bg-white m-0"
                            modifiersClassNames={{
                                selected: 'bg-primary text-white hover:bg-primary-dark font-bold hover:text-white',
                                today: 'text-primary font-bold bg-primary/10'
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Divider dọc - chỉ hiện trên desktop */}
            <div className="hidden lg:flex items-center">
                <div className="w-px h-10 bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
            </div>

            {/* Ngân sách */}
            <div className="group flex-1 flex items-center gap-3 px-4 py-3.5 rounded-xl sm:rounded-2xl hover:bg-primary/5 transition-colors duration-200 relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Ngân sách
                    </label>
                    <CustomSelect 
                        value={searchParams.budget}
                        onChange={(val) => setSearchParams({ ...searchParams, budget: val })}
                        options={budgetOptions}
                        placeholder="Tất cả mức giá"
                    />
                </div>
            </div>

            {/* Nút tìm kiếm */}
            <div className="p-2 lg:p-2 lg:pl-0 flex items-center justify-center w-full lg:w-auto">
                <button
                    type="submit"
                    className="w-full lg:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold text-sm sm:text-base rounded-xl shadow-md hover:shadow-xl shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shrink-0"
                >
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Tìm Kiếm</span>
                </button>
            </div>
        </form>
    );
};

export default SearchBar;