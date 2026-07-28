import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Wallet, CalendarDays, X, Loader2 } from 'lucide-react';
import CustomSelect from './CustomSelect/CustomSelect';
import DepartureCalendar from './DepartureCalendar';
import { useTranslation } from 'react-i18next';

const AdminSearchBar = ({
  t,
  value,
  onChange,
  onSearch,
  onClear,
  placeholder,
  showButton = false,
  loading = false,
  disabled = false,
  className = '',
  ...inputProps
}) => {
  const clearLabel = t('common.clearSearch', 'Clear search');

  const handleKeyDown = (event) => {
    inputProps.onKeyDown?.(event);
    if (!event.defaultPrevented && event.key === 'Enter' && onSearch) {
      event.preventDefault();
      onSearch();
    }
  };

  return (
    <div className={`flex w-full items-stretch gap-2 ${className}`}>
      <div className="group relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary" />
        <input
          {...inputProps}
          type="search"
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-10 text-sm font-medium text-text shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 [&::-webkit-search-cancel-button]:hidden"
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
        ) : value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-text-muted transition hover:bg-surface-alt hover:text-text"
            aria-label={clearLabel}
            title={clearLabel}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {showButton && (
        <button
          type="button"
          onClick={onSearch}
          disabled={disabled}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-60"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">{t('common.search', 'Search')}</span>
        </button>
      )}
    </div>
  );
};

const SearchBar = ({ variant = 'tour', departurePriceMap = {}, ...props }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    date: '',
    budget: '',
  });

  if (variant === 'admin') {
    return <AdminSearchBar t={t} {...props} />;
  }

  const budgetOptions = [
    { label: t('home.search.allPrices', 'Tất cả mức giá'), value: '' },
    { label: t('home.search.under5M', 'Dưới 5 triệu'), value: 'under_5M' },
    { label: t('home.search.5to10M', 'Từ 5 - 10 triệu'), value: '5M_10M' },
    { label: t('home.search.10to20M', 'Từ 10 - 20 triệu'), value: '10M_20M' },
    { label: t('home.search.over20M', 'Trên 20 triệu'), value: 'over_20M' },
  ];
  const handleDateSelect = (dateStr) => {
    setSearchParams({ ...searchParams, date: dateStr });
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
      className="w-full bg-white/95 backdrop-blur-xl rounded-lg shadow-xl shadow-black/5 border border-white/50 p-3 sm:p-4 flex flex-col lg:flex-row items-end gap-4"
    >
      {/* Điểm đến */}
      {/* Điểm đến */}
      <div className="flex-1 w-full">
        <label className="flex items-center gap-2 text-[0.7rem] uppercase tracking-wider text-text-secondary font-bold mb-2 ml-1">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          {t('home.search.destinationLabel', 'Bạn muốn đi đâu?')}
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder={t('home.search.destinationPlaceholder', 'Tên tour, điểm đến...')}
            className="w-full bg-white border border-gray-200 rounded-lg py-2.5 px-4 text-sm text-text font-medium placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            value={searchParams.keyword}
            onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
          />
        </div>
      </div>

      {/* Ngày khởi hành */}
      <div className="flex-1 w-full relative">
        <div className="[&>div>button]:py-2.5 [&>div>button]:shadow-sm">
          <DepartureCalendar
            label={t('home.search.departureLabel', 'Ngày khởi hành')}
            labelIcon={<CalendarDays className="w-3.5 h-3.5" />}
            value={searchParams.date}
            onChange={handleDateSelect}
            departurePriceMap={departurePriceMap}
          />
        </div>
      </div>

      {/* Ngân sách */}
      <div className="flex-1 w-full relative">
        <div className="[&>div>button]:py-2.5 [&>div>button]:shadow-sm [&>div>button]:border-gray-200 [&>div>button]:bg-white">
          <CustomSelect
            label={t('home.search.budgetLabel', 'Ngân sách')}
            labelIcon={<Wallet className="w-3.5 h-3.5" />}
            value={searchParams.budget}
            onChange={(val) => setSearchParams({ ...searchParams, budget: val })}
            options={budgetOptions}
            placeholder={t('home.search.allPrices', 'Tất cả mức giá')}
          />
        </div>
      </div>

      {/* Nút tìm kiếm */}
      <div className="w-full lg:w-auto pt-2 lg:pt-0">
        <button
          type="submit"
          className="w-full lg:w-auto flex items-center justify-center gap-2 px-8 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold text-sm sm:text-base rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 shrink-0"
        >
          <Search className="w-5 h-5" />
          <span>{t('home.search.button', 'Tìm Kiếm')}</span>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
