import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useThemeStore } from '../../../store';
import { Search, X, Loader2 } from 'lucide-react';

/**
 * Searchable Select dropdown with fuzzy search, keyboard navigation & theme support
 * Supports both local filtering and async (server-side) search via onSearchChange prop
 * 
 * Props:
 * - value: current selected value
 * - onChange: callback when option is selected
 * - options: array of { value, label }
 * - placeholder: placeholder text
 * - icon: optional icon element
 * - label: optional label text
 * - onSearchChange: (searchTerm) => void — if provided, enables async mode (skips local filtering)
 * - isLoading: boolean — shows loading spinner in async mode
 * - debounceMs: number — debounce delay for onSearchChange (default 300ms)
 */
const SearchableSelect = ({ 
    value, onChange, options, placeholder, icon, label,
    onSearchChange, isLoading = false, debounceMs = 300
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const listRef = useRef(null);
    const debounceTimer = useRef(null);
    const { theme } = useThemeStore();
    const isDark = theme === 'dark';

    const isAsync = typeof onSearchChange === 'function';

    // Filtered options: local filtering or pass-through for async
    const filteredOptions = useMemo(() => {
        if (isAsync) return options; // Server already filtered
        if (!searchTerm.trim()) return options;
        const term = searchTerm.toLowerCase().trim();
        return options.filter(opt =>
            opt.label.toLowerCase().includes(term)
        );
    }, [options, searchTerm, isAsync]);

    // Debounced async search callback
    const handleSearchTermChange = useCallback((term) => {
        setSearchTerm(term);
        if (isAsync) {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(() => {
                onSearchChange(term);
            }, debounceMs);
        }
    }, [isAsync, onSearchChange, debounceMs]);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset highlight when filtered options change
    useEffect(() => {
        setHighlightedIndex(filteredOptions.length > 0 ? 0 : -1);
    }, [filteredOptions]);

    // Scroll highlighted item into view
    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const items = listRef.current.querySelectorAll('[data-option]');
            if (items[highlightedIndex]) {
                items[highlightedIndex].scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex]);

    // Focus input when dropdown opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < filteredOptions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                    handleSelect(filteredOptions[highlightedIndex].value);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSearchTerm('');
                break;
            default:
                break;
        }
    };

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
        setSearchTerm('');
        setIsOpen(false);
        if (isAsync) onSearchChange('');
    };

    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <div ref={dropdownRef} className="relative w-full">
            {label && (
                <label className="block text-[0.7rem] uppercase tracking-wider text-text-muted font-semibold mb-2">
                    {label}
                </label>
            )}

            {/* Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                className={`
                    w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-sm
                    transition-all duration-200 ease-in-out bg-transparent text-text
                    border-border hover:border-primary/40
                    focus:outline-none 
                    ${isOpen ? 'ring-2 ring-primary/30 border-primary/50' : ''}
                `}
            >
                <span className={`flex items-center gap-2 truncate ${!selectedOption ? 'text-text-muted' : ''}`}>
                    {icon && <span className="text-text-muted shrink-0">{icon}</span>}
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                    {/* Clear button */}
                    {value && (
                        <span
                            role="button"
                            tabIndex={-1}
                            onClick={handleClear}
                            className="p-0.5 rounded-full hover:bg-error/10 text-text-muted hover:text-error transition-colors"
                            title="Xóa bộ lọc"
                        >
                            <X className="w-3.5 h-3.5" />
                        </span>
                    )}
                    {/* Chevron */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-4 h-4 text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Dropdown */}
            <div
                className={`
                    absolute z-[9999] w-full mt-1.5 rounded-xl shadow-lg overflow-hidden
                    transition-all duration-200 ease-in-out origin-top
                    bg-surface border border-border
                    ${isOpen
                        ? 'opacity-100 scale-y-100 visible'
                        : 'opacity-0 scale-y-95 max-h-0 invisible pointer-events-none'
                    }
                `}
            >
                {/* Search Input */}
                <div className="p-2 border-b border-border">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => handleSearchTermChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Nhập tên tour để tìm kiếm..."
                            className="w-full pl-8 pr-8 py-2 bg-surface-alt border border-border rounded-lg text-sm
                                focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none
                                text-text placeholder:text-text-muted transition-all"
                        />
                        {/* Loading spinner or clear button */}
                        {isAsync && isLoading ? (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                            </div>
                        ) : searchTerm ? (
                            <button
                                type="button"
                                onClick={() => { handleSearchTermChange(''); inputRef.current?.focus(); }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-surface-hover text-text-muted hover:text-text transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        ) : null}
                    </div>
                </div>

                {/* Options List */}
                <div
                    ref={listRef}
                    className="overflow-y-auto max-h-60 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-500"
                >
                    {isAsync && isLoading ? (
                        <div className="px-3 py-6 text-center text-sm text-text-muted flex flex-col items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            <span>Đang tìm kiếm...</span>
                        </div>
                    ) : filteredOptions.length > 0 ? (
                        filteredOptions.map((option, index) => {
                            const isSelected = value === option.value;
                            const isHighlighted = highlightedIndex === index;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    data-option
                                    onClick={() => handleSelect(option.value)}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                    className={`
                                        w-full px-3 py-2.5 text-left text-sm transition-colors duration-150
                                        ${isSelected
                                            ? 'bg-primary text-white font-medium'
                                            : isHighlighted
                                                ? (isDark ? 'bg-surface-hover text-text' : 'bg-surface-alt text-text')
                                                : 'text-text-secondary hover:bg-surface-alt'
                                        }
                                    `}
                                >
                                    {/* Highlight matched text */}
                                    {searchTerm.trim() ? highlightMatch(option.label, searchTerm) : option.label}
                                </button>
                            );
                        })
                    ) : (
                        <div className="px-3 py-6 text-center text-sm text-text-muted">
                            {searchTerm.trim()
                                ? `Không tìm thấy kết quả cho "${searchTerm}"`
                                : 'Nhập từ khóa để tìm tour...'
                            }
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Highlight matching text in a label
 */
function highlightMatch(text, term) {
    if (!term.trim()) return text;
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
        <span>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="bg-primary/20 text-inherit rounded-sm px-0.5">{part}</mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </span>
    );
}

export default SearchableSelect;
