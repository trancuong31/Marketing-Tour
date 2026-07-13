import { Languages, Loader2 } from 'lucide-react';

const LANGUAGE_OPTIONS = [
    { id: 'vi', label: 'Tiếng Việt' },
    { id: 'en', label: 'English' },
    { id: 'zh', label: '中文' },
];

const TranslationToolbar = ({ currentLang, translating, onLanguageChange, onTranslate }) => (
    <div className="px-4 sm:px-6 py-3 bg-surface-alt/50 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm z-10 relative">
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {LANGUAGE_OPTIONS.map((lang) => (
                <button
                    key={lang.id}
                    type="button"
                    onClick={() => onLanguageChange(lang.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        currentLang === lang.id
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-surface border border-border text-text-secondary hover:bg-surface-hover hover:text-text'
                    }`}
                >
                    {lang.label}
                </button>
            ))}
        </div>

        <button
            type="button"
            onClick={onTranslate}
            disabled={translating}
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-bold bg-primary/10 text-primary px-4 py-2 rounded-lg hover:bg-primary/20 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {translating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Languages className="w-4 h-4" />
            )}
            {translating ? 'Đang dịch...' : currentLang === 'vi' ? 'Dịch EN + ZH' : `Dịch sang ${currentLang.toUpperCase()}`}
        </button>
    </div>
);

export default TranslationToolbar;
