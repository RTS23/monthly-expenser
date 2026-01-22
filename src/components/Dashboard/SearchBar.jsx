import React from 'react';
import { Search, X } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

const SearchBar = ({ searchQuery, onSearchChange }) => {
    const { t, theme, language } = useSettings();
    const isDark = theme === 'dark';

    return (
        <div className="relative group">
            <div className={`flex items-center px-4 py-2 rounded-xl border transition-colors
                ${isDark
                    ? 'bg-slate-800/50 border-slate-700/50 focus-within:bg-slate-800 focus-within:border-indigo-500/50'
                    : 'bg-white/50 border-slate-200/50 focus-within:bg-white focus-within:border-indigo-500/50'
                }
            `}>
                <Search size={16} className={`mr-2 transition-colors ${isDark ? 'text-slate-500 group-focus-within:text-indigo-400' : 'text-slate-400 group-focus-within:text-indigo-500'}`} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={language === 'id' ? 'Cari pengeluaran...' : 'Search expenses...'}
                    className={`bg-transparent border-none outline-none text-sm w-48 placeholder:text-slate-500
                        ${isDark ? 'text-white' : 'text-slate-900'}
                    `}
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearchChange('')}
                        className={`ml-2 p-0.5 rounded-full transition-colors
                            ${isDark ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}
                        `}
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default SearchBar;
