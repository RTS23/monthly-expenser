import React, { useState } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { format } from 'date-fns';

const DateRangeFilter = ({ dateRange, onDateRangeChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t, theme, language } = useSettings();

    const [startDate, setStartDate] = useState(dateRange?.start || '');
    const [endDate, setEndDate] = useState(dateRange?.end || '');

    const handleApply = () => {
        if (startDate && endDate) {
            onDateRangeChange({ start: startDate, end: endDate });
        }
        setIsOpen(false);
    };

    const handleClear = () => {
        setStartDate('');
        setEndDate('');
        onDateRangeChange(null);
        setIsOpen(false);
    };

    const handleQuickSelect = (days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        
        const startStr = format(start, 'yyyy-MM-dd');
        const endStr = format(end, 'yyyy-MM-dd');
        
        setStartDate(startStr);
        setEndDate(endStr);
        onDateRangeChange({ start: startStr, end: endStr });
        setIsOpen(false);
    };

    const handleThisMonth = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const startStr = format(start, 'yyyy-MM-dd');
        const endStr = format(end, 'yyyy-MM-dd');
        
        setStartDate(startStr);
        setEndDate(endStr);
        onDateRangeChange({ start: startStr, end: endStr });
        setIsOpen(false);
    };

    const handleLastMonth = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        
        const startStr = format(start, 'yyyy-MM-dd');
        const endStr = format(end, 'yyyy-MM-dd');
        
        setStartDate(startStr);
        setEndDate(endStr);
        onDateRangeChange({ start: startStr, end: endStr });
        setIsOpen(false);
    };

    // Format display label
    const getDisplayLabel = () => {
        if (!dateRange?.start || !dateRange?.end) {
            return t('filters.allTime');
        }
        const locale = language === 'id' ? 'id-ID' : 'en-US';
        const startFormatted = new Date(dateRange.start).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
        const endFormatted = new Date(dateRange.end).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
        return `${startFormatted} - ${endFormatted}`;
    };

    const isDark = theme === 'dark';

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors text-sm
                    ${isDark 
                        ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 text-slate-300' 
                        : 'bg-white/50 border-slate-200/50 hover:bg-white text-slate-700'
                    }
                `}
            >
                <Calendar size={16} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
                <span>{getDisplayLabel()}</span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className={`absolute top-full left-0 mt-2 w-72 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 border
                        ${isDark 
                            ? 'bg-slate-900/95 backdrop-blur-xl border-slate-700/50' 
                            : 'bg-white/95 backdrop-blur-xl border-slate-200'
                        }
                    `}>
                        {/* Quick Select Buttons */}
                        <div className={`p-3 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
                            <p className={`text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {language === 'id' ? 'Pilih Cepat' : 'Quick Select'}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleQuickSelect(7)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                                        ${isDark 
                                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                        }
                                    `}
                                >
                                    {language === 'id' ? '7 Hari' : '7 Days'}
                                </button>
                                <button
                                    onClick={() => handleQuickSelect(30)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                                        ${isDark 
                                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                        }
                                    `}
                                >
                                    {language === 'id' ? '30 Hari' : '30 Days'}
                                </button>
                                <button
                                    onClick={handleThisMonth}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                                        ${isDark 
                                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                        }
                                    `}
                                >
                                    {language === 'id' ? 'Bulan Ini' : 'This Month'}
                                </button>
                                <button
                                    onClick={handleLastMonth}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                                        ${isDark 
                                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                        }
                                    `}
                                >
                                    {language === 'id' ? 'Bulan Lalu' : 'Last Month'}
                                </button>
                            </div>
                        </div>

                        {/* Custom Date Range */}
                        <div className="p-3">
                            <p className={`text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {language === 'id' ? 'Rentang Kustom' : 'Custom Range'}
                            </p>
                            <div className="space-y-2">
                                <div>
                                    <label className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        {language === 'id' ? 'Dari' : 'From'}
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className={`w-full mt-1 px-3 py-2 rounded-lg text-sm border transition-colors
                                            ${isDark 
                                                ? 'bg-slate-800 border-slate-700 text-slate-300 focus:border-indigo-500' 
                                                : 'bg-white border-slate-200 text-slate-700 focus:border-indigo-500'
                                            }
                                        `}
                                    />
                                </div>
                                <div>
                                    <label className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        {language === 'id' ? 'Sampai' : 'To'}
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={startDate}
                                        className={`w-full mt-1 px-3 py-2 rounded-lg text-sm border transition-colors
                                            ${isDark 
                                                ? 'bg-slate-800 border-slate-700 text-slate-300 focus:border-indigo-500' 
                                                : 'bg-white border-slate-200 text-slate-700 focus:border-indigo-500'
                                            }
                                        `}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={handleClear}
                                    className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                        ${isDark 
                                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' 
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                        }
                                    `}
                                >
                                    <X size={14} />
                                    {language === 'id' ? 'Hapus' : 'Clear'}
                                </button>
                                <button
                                    onClick={handleApply}
                                    disabled={!startDate || !endDate}
                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                        ${startDate && endDate
                                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                            : (isDark ? 'bg-slate-800 text-slate-600' : 'bg-slate-200 text-slate-400')
                                        }
                                    `}
                                >
                                    {language === 'id' ? 'Terapkan' : 'Apply'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DateRangeFilter;
