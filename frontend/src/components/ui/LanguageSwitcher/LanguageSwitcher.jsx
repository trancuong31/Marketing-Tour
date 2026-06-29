import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const languages = [
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
];

/**
 * Language switcher dropdown for the header
 */
const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
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
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-alt hover:bg-border transition-colors duration-200 shadow-sm border border-border/50 text-[18px] leading-none select-none"
                aria-label="Change language"
                title={currentLang.label}
            >
                {currentLang.flag}
            </button>

            {/* Dropdown */}
            <div
                className={`
                    absolute right-0 top-full mt-1.5 w-40 rounded-xl shadow-lg overflow-hidden
                    bg-surface border border-border z-50
                    transition-all duration-200 origin-top-right
                    ${isOpen
                        ? 'opacity-100 scale-100 visible'
                        : 'opacity-0 scale-95 invisible pointer-events-none'
                    }
                `}
            >
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => handleSelect(lang.code)}
                        className={`
                            w-full px-3 py-2.5 flex items-center gap-2.5 text-sm transition-colors duration-150
                            ${i18n.language === lang.code
                                ? 'bg-primary text-white font-medium'
                                : 'text-text-secondary hover:bg-surface-alt'
                            }
                        `}
                    >
                        <span className="text-base leading-none">{lang.flag}</span>
                        <span>{lang.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LanguageSwitcher;
