import React, { useState } from 'react';
import { Search, X, Calendar, ChevronDown, Filter, Tag, DollarSign } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { useExpenses } from '../../contexts/ExpenseContext';

const CATEGORIES = ['Food', 'Shopping', 'Housing', 'Transport', 'Utilities', 'Entertainment', 'Other'];

const UnifiedFilterBar = () => {
    const { t, theme, language, currency } = useSettings();
    const {
        searchQuery, setSearchQuery,
        dateRange, setDateRange,
        categoryFilter, setCategoryFilter,
        amountRange, setAmountRange
    } = useExpenses();

    const isDark = theme === 'dark';
    const [isExpanded, setIsExpanded] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    // Quick date presets
    const handleQuickDate = (preset) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let start, end;

        switch (preset) {
            case 'today':
                start = end = today.toISOString().split('T')[0];
                break;
            case 'week':
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                start = weekStart.toISOString().split('T')[0];
                end = today.toISOString().split('T')[0];
                break;
            case 'month':
                start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                end = today.toISOString().split('T')[0];
                break;
            case 'last30':
                const thirtyAgo = new Date(today);
                thirtyAgo.setDate(today.getDate() - 30);
                start = thirtyAgo.toISOString().split('T')[0];
                end = today.toISOString().split('T')[0];
                break;
            default:
                return;
        }
        setDateRange({ start, end });
    };

    const clearAllFilters = () => {
        setSearchQuery('');
        setDateRange(null);
        setCategoryFilter(null);
        setAmountRange({ min: null, max: null });
    };

    // Count active filters
    const activeFilterCount = [
        searchQuery,
        dateRange,
        categoryFilter,
        amountRange.min !== null || amountRange.max !== null
    ].filter(Boolean).length;

    const hasActiveFilters = activeFilterCount > 0;

    // Format currency symbol
    const currencySymbol = currency === 'IDR' ? 'Rp' : '$';

    return (
        <div className="w-full space-y-3">
            {/* Main Filter Bar */}
            <div className={`flex flex-wrap items-center gap-2 p-3 rounded-xl border transition-all
                ${isDark
                    ? 'bg-slate-800/50 border-slate-700/50'
                    : 'bg-white/50 border-slate-200/50'
                }
            `}>
                {/* Search Input */}
                <div className={`flex items-center flex-1 min-w-[200px] px-3 py-2 rounded-lg border transition-colors
                    ${isDark
                        ? 'bg-slate-900/50 border-slate-700/50 focus-within:border-indigo-500/50'
                        : 'bg-slate-50 border-slate-200/50 focus-within:border-indigo-500/50'
                    }
                `}>
                    <Search size={16} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={language === 'id' ? 'Cari pengeluaran...' : 'Search expenses...'}
                        className={`ml-2 bg-transparent border-none outline-none text-sm flex-1
                            ${isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'}
                        `}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="p-0.5 rounded-full hover:bg-slate-700/50">
                            <X size={14} className="text-slate-400" />
                        </button>
                    )}
                </div>

                {/* Quick Date Buttons */}
                <div className="hidden sm:flex items-center gap-1">
                    {[
                        { key: 'today', label: language === 'id' ? 'Hari Ini' : 'Today' },
                        { key: 'week', label: language === 'id' ? 'Minggu Ini' : 'This Week' },
                        { key: 'month', label: language === 'id' ? 'Bulan Ini' : 'This Month' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => handleQuickDate(key)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all
                                ${isDark
                                    ? 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                }
                            `}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Expand/Filter Toggle */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all
                        ${isExpanded || hasActiveFilters
                            ? 'bg-indigo-500 text-white'
                            : isDark
                                ? 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }
                    `}
                >
                    <Filter size={14} />
                    <span className="text-xs font-medium hidden sm:inline">
                        {language === 'id' ? 'Filter' : 'Filters'}
                    </span>
                    {activeFilterCount > 0 && (
                        <span className="w-4 h-4 flex items-center justify-center text-[10px] bg-white text-indigo-600 rounded-full font-bold">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {/* Clear All */}
                {hasActiveFilters && (
                    <button
                        onClick={clearAllFilters}
                        className={`flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg transition-all
                            ${isDark
                                ? 'text-red-400 hover:bg-red-500/20'
                                : 'text-red-500 hover:bg-red-50'
                            }
                        `}
                    >
                        <X size={12} />
                        <span className="hidden sm:inline">{language === 'id' ? 'Hapus Semua' : 'Clear All'}</span>
                    </button>
                )}
            </div>

            {/* Expanded Filter Options */}
            {isExpanded && (
                <div className={`p-4 rounded-xl border transition-all animate-in slide-in-from-top-2 duration-200
                    ${isDark
                        ? 'bg-slate-800/50 border-slate-700/50'
                        : 'bg-white/50 border-slate-200/50'
                    }
                `}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Category Filter */}
                        <div className="space-y-2">
                            <label className={`flex items-center gap-1.5 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                <Tag size={12} />
                                {language === 'id' ? 'Kategori' : 'Category'}
                            </label>
                            <div className="relative">
                                <button
                                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm
                                        ${isDark
                                            ? 'bg-slate-900/50 border-slate-700/50 text-white'
                                            : 'bg-white border-slate-200 text-slate-900'
                                        }
                                    `}
                                >
                                    <span className={categoryFilter ? '' : 'text-slate-400'}>
                                        {categoryFilter
                                            ? (t(`categories.${categoryFilter}`) || categoryFilter)
                                            : (language === 'id' ? 'Semua Kategori' : 'All Categories')
                                        }
                                    </span>
                                    <ChevronDown size={14} className={`transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {showCategoryDropdown && (
                                    <div className={`absolute z-50 top-full left-0 right-0 mt-1 py-1 rounded-lg border shadow-lg max-h-48 overflow-auto
                                        ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}
                                    `}>
                                        <button
                                            onClick={() => { setCategoryFilter(null); setShowCategoryDropdown(false); }}
                                            className={`w-full text-left px-3 py-2 text-sm transition-colors
                                                ${!categoryFilter
                                                    ? 'bg-indigo-500/20 text-indigo-400'
                                                    : isDark ? 'hover:bg-slate-700 text-white' : 'hover:bg-slate-100 text-slate-900'
                                                }
                                            `}
                                        >
                                            {language === 'id' ? 'Semua Kategori' : 'All Categories'}
                                        </button>
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => { setCategoryFilter(cat); setShowCategoryDropdown(false); }}
                                                className={`w-full text-left px-3 py-2 text-sm transition-colors
                                                    ${categoryFilter === cat
                                                        ? 'bg-indigo-500/20 text-indigo-400'
                                                        : isDark ? 'hover:bg-slate-700 text-white' : 'hover:bg-slate-100 text-slate-900'
                                                    }
                                                `}
                                            >
                                                {t(`categories.${cat}`) || cat}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Date Range */}
                        <div className="space-y-2">
                            <label className={`flex items-center gap-1.5 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                <Calendar size={12} />
                                {language === 'id' ? 'Rentang Tanggal' : 'Date Range'}
                            </label>
                            <div className="flex flex-col xl:flex-row gap-2">
                                <input
                                    type="date"
                                    value={dateRange?.start || ''}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value, end: prev?.end || e.target.value }))}
                                    className={`flex-1 px-2 py-2 rounded-lg border text-xs min-w-0
                                        ${isDark
                                            ? 'bg-slate-900/50 border-slate-700/50 text-white'
                                            : 'bg-white border-slate-200 text-slate-900'
                                        }
                                    `}
                                />
                                <input
                                    type="date"
                                    value={dateRange?.end || ''}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value, start: prev?.start || e.target.value }))}
                                    className={`flex-1 px-2 py-2 rounded-lg border text-xs min-w-0
                                        ${isDark
                                            ? 'bg-slate-900/50 border-slate-700/50 text-white'
                                            : 'bg-white border-slate-200 text-slate-900'
                                        }
                                    `}
                                />
                            </div>
                        </div>

                        {/* Amount Range */}
                        <div className="space-y-2">
                            <label className={`flex items-center gap-1.5 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                <DollarSign size={12} />
                                {language === 'id' ? 'Rentang Jumlah' : 'Amount Range'}
                            </label>
                            <div className="flex flex-col xl:flex-row gap-2">
                                <div className={`flex items-center flex-1 px-2 py-2 rounded-lg border text-xs
                                    ${isDark
                                        ? 'bg-slate-900/50 border-slate-700/50'
                                        : 'bg-white border-slate-200'
                                    }
                                `}>
                                    <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{currencySymbol}</span>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={amountRange.min || ''}
                                        onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value ? Number(e.target.value) : null }))}
                                        className={`flex-1 bg-transparent border-none outline-none ml-1
                                            ${isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'}
                                        `}
                                    />
                                </div>
                                <div className={`flex items-center flex-1 px-2 py-2 rounded-lg border text-xs
                                    ${isDark
                                        ? 'bg-slate-900/50 border-slate-700/50'
                                        : 'bg-white border-slate-200'
                                    }
                                `}>
                                    <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{currencySymbol}</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={amountRange.max || ''}
                                        onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value ? Number(e.target.value) : null }))}
                                        className={`flex-1 bg-transparent border-none outline-none ml-1
                                            ${isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'}
                                        `}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Quick Date Presets (Mobile) */}
                        <div className="space-y-2 sm:hidden">
                            <label className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {language === 'id' ? 'Cepat' : 'Quick'}
                            </label>
                            <div className="flex flex-wrap gap-1">
                                {[
                                    { key: 'today', label: language === 'id' ? 'Hari Ini' : 'Today' },
                                    { key: 'week', label: language === 'id' ? 'Minggu Ini' : 'Week' },
                                    { key: 'month', label: language === 'id' ? 'Bulan Ini' : 'Month' },
                                    { key: 'last30', label: '30 ' + (language === 'id' ? 'Hari' : 'Days') },
                                ].map(({ key, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => handleQuickDate(key)}
                                        className={`px-2 py-1 text-xs font-medium rounded-md transition-all
                                            ${isDark
                                                ? 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300'
                                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                            }
                                        `}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Filter Pills */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                        <FilterPill
                            label={`"${searchQuery}"`}
                            onRemove={() => setSearchQuery('')}
                            isDark={isDark}
                        />
                    )}
                    {dateRange && (
                        <FilterPill
                            label={`${dateRange.start} → ${dateRange.end}`}
                            onRemove={() => setDateRange(null)}
                            isDark={isDark}
                            icon={<Calendar size={10} />}
                        />
                    )}
                    {categoryFilter && (
                        <FilterPill
                            label={t(`categories.${categoryFilter}`) || categoryFilter}
                            onRemove={() => setCategoryFilter(null)}
                            isDark={isDark}
                            icon={<Tag size={10} />}
                        />
                    )}
                    {(amountRange.min !== null || amountRange.max !== null) && (
                        <FilterPill
                            label={`${currencySymbol}${amountRange.min || '0'} - ${currencySymbol}${amountRange.max || '∞'}`}
                            onRemove={() => setAmountRange({ min: null, max: null })}
                            isDark={isDark}
                            icon={<DollarSign size={10} />}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

// Filter Pill Component
const FilterPill = ({ label, onRemove, isDark, icon }) => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        ${isDark
            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
            : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
        }
    `}>
        {icon}
        {label}
        <button
            onClick={onRemove}
            className={`ml-0.5 p-0.5 rounded-full transition-colors
                ${isDark ? 'hover:bg-indigo-500/30' : 'hover:bg-indigo-100'}
            `}
        >
            <X size={10} />
        </button>
    </span>
);

export default UnifiedFilterBar;
