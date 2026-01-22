import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

const MonthFilter = ({ selectedMonth, onSelectMonth }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t, language } = useSettings();

    // Generate last 12 months with localized names
    const months = [];
    const now = new Date();
    const locale = language === 'id' ? 'id-ID' : 'en-US';

    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
            label: d.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
        });
    }

    const currentLabel = months.find(m => m.value === selectedMonth)?.label || t('filters.allTime');

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors text-sm text-slate-300"
            >
                <Calendar size={16} className="text-indigo-400" />
                <span>{currentLabel}</span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-80 overflow-y-auto">
                        <button
                            onClick={() => { onSelectMonth(null); setIsOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-800 transition-colors ${!selectedMonth ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-300'}`}
                        >
                            {t('filters.allTime')}
                        </button>
                        {months.map(month => (
                            <button
                                key={month.value}
                                onClick={() => { onSelectMonth(month.value); setIsOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-800 transition-colors ${selectedMonth === month.value ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-300'}`}
                            >
                                {month.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default MonthFilter;
