import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { ChevronDown, Sun, Moon, HelpCircle } from 'lucide-react';

// Language Switcher
export const LanguageSwitcher = () => {
    const { language, setLanguage, theme } = useSettings();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-colors text-sm
                    ${theme === 'dark'
                        ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800'
                        : 'bg-white/50 border-slate-200/50 hover:bg-white text-slate-700'
                    }
                `}
            >
                <span className="text-base">{language === 'id' ? '🇮🇩' : '🇺🇸'}</span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''} ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className={`absolute top-full right-0 mt-2 w-36 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 p-1.5 border
                        ${theme === 'dark'
                            ? 'bg-slate-900/95 backdrop-blur-xl border-slate-700/50'
                            : 'bg-white/95 backdrop-blur-xl border-slate-200'
                        }
                    `}>
                        <button
                            onClick={() => { setLanguage('en'); setIsOpen(false); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 
                                ${language === 'en'
                                    ? (theme === 'dark' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600')
                                    : (theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')
                                }
                            `}
                        >
                            🇺🇸 English
                        </button>
                        <button
                            onClick={() => { setLanguage('id'); setIsOpen(false); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 
                                ${language === 'id'
                                    ? (theme === 'dark' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600')
                                    : (theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')
                                }
                            `}
                        >
                            🇮🇩 Indonesia
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

// Currency Switcher
export const CurrencySwitcher = () => {
    const { currency, setCurrency, theme } = useSettings();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-colors text-sm
                    ${theme === 'dark'
                        ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800'
                        : 'bg-white/50 border-slate-200/50 hover:bg-white text-slate-700'
                    }
                `}
            >
                <span className={`font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    {currency === 'IDR' ? 'Rp' : '$'}
                </span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''} ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className={`absolute top-full right-0 mt-2 w-32 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 p-1.5 border
                        ${theme === 'dark'
                            ? 'bg-slate-900/95 backdrop-blur-xl border-slate-700/50'
                            : 'bg-white/95 backdrop-blur-xl border-slate-200'
                        }
                    `}>
                        <button
                            onClick={() => { setCurrency('USD'); setIsOpen(false); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 
                                ${currency === 'USD'
                                    ? (theme === 'dark' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-600')
                                    : (theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')
                                }
                            `}
                        >
                            $ USD
                        </button>
                        <button
                            onClick={() => { setCurrency('IDR'); setIsOpen(false); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 
                                ${currency === 'IDR'
                                    ? (theme === 'dark' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-600')
                                    : (theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')
                                }
                            `}
                        >
                            Rp IDR
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

// Theme Switcher
export const ThemeSwitcher = () => {
    const { theme, toggleTheme } = useSettings();

    return (
        <button
            onClick={toggleTheme}
            className={`flex items-center justify-center p-2 rounded-xl border transition-all duration-300
                ${theme === 'dark'
                    ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 text-yellow-400'
                    : 'bg-white/50 border-slate-200/50 hover:bg-white text-indigo-600 shadow-sm'
                }
            `}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    );
};

// Combined Quick Settings Row
const QuickSettings = () => {
    const restartTour = () => {
        localStorage.removeItem('hasSeenTour_v1');
        window.location.reload();
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={restartTour}
                className="flex items-center justify-center p-2 rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors duration-300"
                title="Restart Tour"
            >
                <HelpCircle size={18} />
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/50 mx-1" />
            <ThemeSwitcher />
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/50 mx-1" />
            <LanguageSwitcher />
            <CurrencySwitcher />
        </div>
    );
};

export default QuickSettings;
