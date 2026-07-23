import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const languages = [
    {
        code: 'vi',
        shortName: 'VN',
        countryName: 'Việt Nam',
        languageName: 'Tiếng Việt',
    },
    {
        code: 'en',
        shortName: 'US',
        countryName: 'United States',
        languageName: 'English',
    },
    {
        code: 'zh',
        shortName: 'CN',
        countryName: 'China',
        languageName: '中文',
    },
];

const getLanguageCode = (language) => language?.split('-')[0] || 'vi';

const FlagIcon = ({ code, className = '', watermark = false }) => {
    const baseClassName = watermark
        ? 'absolute inset-0 opacity-20 blur-[1px] scale-125'
        : `relative h-6 w-10 shrink-0 overflow-hidden rounded-md shadow-sm ring-1 ring-black/5 ${className}`;

    if (code === 'vi') {
        return (
            <span className={`${baseClassName} bg-[#DA251D]`} aria-hidden="true">
                <span className="absolute left-1/2 top-1/2 text-[#FFFF00] -translate-x-1/2 -translate-y-1/2 text-[16px] leading-none">
                    ★
                </span>
            </span>
        );
    }

    if (code === 'zh') {
        return (
            <span className={`${baseClassName} bg-[#DE2910]`} aria-hidden="true">
                <span className="absolute left-[18%] top-[21%] text-[#FFDE00] text-[12px] leading-none">★</span>
                <span className="absolute left-[38%] top-[13%] text-[#FFDE00] text-[5px] leading-none">★</span>
                <span className="absolute left-[45%] top-[29%] text-[#FFDE00] text-[5px] leading-none">★</span>
                <span className="absolute left-[45%] top-[48%] text-[#FFDE00] text-[5px] leading-none">★</span>
                <span className="absolute left-[36%] top-[62%] text-[#FFDE00] text-[5px] leading-none">★</span>
            </span>
        );
    }

    return (
        <span
            className={`${baseClassName} bg-[repeating-linear-gradient(to_bottom,#B22234_0_7.69%,#FFFFFF_7.69%_15.38%)]`}
            aria-hidden="true"
        >
            <span className="absolute left-0 top-0 h-[54%] w-[42%] bg-[#3C3B6E]" />
            <span className="absolute left-[6%] top-[10%] text-white text-[5px] leading-none tracking-[1px]">★ ★</span>
            <span className="absolute left-[6%] top-[28%] text-white text-[5px] leading-none tracking-[1px]">★ ★</span>
        </span>
    );
};

const LanguageSwitcher = ({ compact = false }) => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const activeCode = getLanguageCode(i18n.language);
    const currentLang = languages.find((language) => language.code === activeCode) || languages[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (code) => {
        i18n.changeLanguage(code);
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`relative overflow-hidden bg-white text-text shadow-[0_4px_12px_rgba(30,64,175,0.10)] transition-all duration-200 hover:bg-surface-alt hover:shadow-[0_6px_16px_rgba(30,64,175,0.14)] ${
                    compact
                        ? 'h-8 w-8 rounded-lg p-0 inline-flex items-center justify-center'
                        : 'h-8 min-w-[104px] max-w-[112px] rounded-lg px-2.5'
                }`}
                aria-label="Change language"
                aria-expanded={isOpen}
            >
                {!compact && (
                    <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="relative h-12 w-16">
                            <FlagIcon code={currentLang.code} watermark />
                        </span>
                    </span>
                )}

                <span className={`relative z-10 flex h-full items-center ${compact ? 'justify-center' : 'justify-between gap-2'}`}>
                    <span className="flex min-w-0 items-center gap-2">
                        <FlagIcon code={currentLang.code} className={compact ? 'h-4 w-6 rounded-[5px]' : 'h-5 w-8 rounded'} />
                        {!compact && (
                            <span className="shrink-0 text-sm font-medium leading-none text-text-secondary">
                                {currentLang.shortName}
                            </span>
                        )}
                    </span>
                    {!compact && (
                        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    )}
                </span>
            </button>

            <div
                className={`absolute left-1/2 top-full z-50 mt-2 w-44 -translate-x-1/2 origin-top overflow-hidden rounded-xl border border-border bg-white shadow-lg transition-all duration-200 ${
                    isOpen ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0 pointer-events-none'
                }`}
            >
                {languages.map((language) => {
                    const isActive = activeCode === language.code;

                    return (
                        <button
                            key={language.code}
                            type="button"
                            onClick={() => handleSelect(language.code)}
                            className={`flex w-full items-center gap-2 px-3 py-2 text-left transition-colors duration-150 ${
                                isActive ? 'bg-primary/10 text-primary' : 'text-text hover:bg-surface-alt'
                            }`}
                        >
                            <FlagIcon code={language.code} className="h-5 w-8 rounded" />
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-xs font-medium">{language.countryName}</span>
                                <span className="block truncate text-[11px] text-text-muted">{language.languageName}</span>
                            </span>
                            {isActive && <Check className="h-3.5 w-3.5 shrink-0" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default LanguageSwitcher;
