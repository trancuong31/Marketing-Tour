import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Wallet } from 'lucide-react';
import CustomSelect from './CustomSelect/CustomSelect';
import DepartureCalendar from './DepartureCalendar';

const budgetOptions = [
  { label: 'Tất cả mức giá', value: '' },
  { label: 'Dưới 5 triệu', value: 'under_5M' },
  { label: 'Từ 5 - 10 triệu', value: '5M_10M' },
  { label: 'Từ 10 - 20 triệu', value: '10M_20M' },
  { label: 'Trên 20 triệu', value: 'over_20M' },
];

const SearchBar = ({ departurePriceMap = {} }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    date: '',
    budget: '',
  });

  const handleDateSelect = (dateStr) => {
    setSearchParams({ ...searchParams, date: dateStr });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchParams.keyword) query.append('q', searchParams.keyword);
    if (searchParams.date) query.append('date', searchParams.date);
    if (searchParams.budget) query.append('budget', searchParams.budget);
    
    // Default to /tours to show all results since tour type filter is removed
    navigate(`/tours?${query.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full bg-white/95 backdrop-blur-xl rounded-xl shadow-xl shadow-black/5 border border-white/50 p-3 sm:p-4 flex flex-col lg:flex-row items-end gap-4"
    >
      {/* Điểm đến */}
      <div className="flex-1 w-full">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">
          Bạn muốn đi đâu?
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <MapPin className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Tên tour, điểm đến..."
            className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-11 pr-4 text-sm sm:text-base text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            value={searchParams.keyword}
            onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
          />
        </div>
      </div>

      {/* Ngày khởi hành */}
      <div className="flex-1 w-full relative">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">
          Ngày khởi hành
        </label>
        <div className="[&>div>button]:py-2.5 [&>div>button]:shadow-sm">
          <DepartureCalendar
            value={searchParams.date}
            onChange={handleDateSelect}
            departurePriceMap={departurePriceMap}
          />
        </div>
      </div>

      {/* Ngân sách */}
      <div className="flex-1 w-full relative">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">
          Ngân sách
        </label>
        <div className="[&>div>button]:py-2.5 [&>div>button]:shadow-sm [&>div>button]:border-gray-200 [&>div>button]:bg-white">
          <CustomSelect
            value={searchParams.budget}
            onChange={(val) => setSearchParams({ ...searchParams, budget: val })}
            options={budgetOptions}
            placeholder="Tất cả mức giá"
            icon={<Wallet className="w-5 h-5 text-slate-400" />}
          />
        </div>
      </div>

      {/* Nút tìm kiếm */}
      <div className="w-full lg:w-auto pt-2 lg:pt-0">
        <button
          type="submit"
          className="w-full lg:w-auto flex items-center justify-center gap-2 px-8 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 shrink-0"
        >
          <Search className="w-5 h-5" />
          <span>Tìm Kiếm</span>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
