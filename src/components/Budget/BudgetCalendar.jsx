import React, { useState } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday, addMonths, subMonths, getDate } from 'date-fns';
import { ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

const BudgetCalendar = ({ recurringExpenses }) => {
    const { isDark, language } = useSettings(); // Assuming useSettings provides isDark or theme
    // Actually useSettings provides theme ('dark' or 'light')
    const { theme } = useSettings();
    const isDarkTheme = theme === 'dark';

    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const resetMonth = () => setCurrentMonth(new Date());

    // Generate Calendar Grid
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    // Helper to find expenses for a day
    const getExpensesForDay = (day) => {
        const dayNum = getDate(day);
        // Normalize dayNum: Recurring assumes 1-31.
        // Also check if current viewing month matches (Recurring applies to ALL months, so day number is enough?)
        // Yes, recurring expenses happen every month on that day.
        // But we should visually dim them if the cell is not in currentMonth (padding days)
        if (!isSameMonth(day, currentMonth)) return [];

        return recurringExpenses.filter(r => r.dayOfMonth === dayNum);
    };

    const hasBudgetReset = (day) => {
        return getDate(day) === 1 && isSameMonth(day, currentMonth);
    };

    return (
        <div className={`p-4 sm:p-6 rounded-2xl border transition-all 
            ${isDarkTheme ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}
        `}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-main capitalize">
                    {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <div className="flex items-center gap-2">
                    <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-indigo-500/10 hover:text-indigo-500 transition-colors text-muted">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={resetMonth} className="p-2 rounded-lg hover:bg-indigo-500/10 hover:text-indigo-500 transition-colors text-muted">
                        <span className="text-xs font-medium">{language === 'id' ? 'Hari Ini' : 'Today'}</span>
                    </button>
                    <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-indigo-500/10 hover:text-indigo-500 transition-colors text-muted">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="text-center text-xs font-semibold text-muted py-2">
                        {d}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarDays.map((day, idx) => {
                    const expenses = getExpensesForDay(day);
                    const isReset = hasBudgetReset(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isTodayDate = isToday(day);

                    return (
                        <div
                            key={idx}
                            className={`
                                min-h-[60px] sm:min-h-[80px] p-1 sm:p-2 rounded-xl border flex flex-col items-start justify-start relative transition-all group
                                ${isCurrentMonth
                                    ? (isDarkTheme ? 'bg-slate-900/40 border-slate-700/30' : 'bg-slate-50 border-slate-100')
                                    : 'opacity-30 border-transparent bg-transparent'
                                }
                                ${isTodayDate ? 'ring-2 ring-indigo-500 border-indigo-500/50' : ''}
                                ${isReset && isCurrentMonth ? 'bg-indigo-900/20' : ''}
                            `}
                        >
                            <span className={`
                                text-xs font-medium mb-1
                                ${isTodayDate ? 'text-indigo-400' : 'text-muted'}
                                ${isReset ? 'text-indigo-300' : ''}
                            `}>
                                {format(day, 'd')}
                            </span>

                            {/* Reset Marker */}
                            {isReset && isCurrentMonth && (
                                <div className="absolute top-2 right-2">
                                    <RefreshCw size={12} className="text-indigo-400 animate-spin-slow" />
                                </div>
                            )}

                            {/* Expense Dots */}
                            <div className="flex flex-wrap gap-1 mt-auto w-full">
                                {expenses.map((ex, i) => (
                                    <div
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                                        title={`${ex.title} (${ex.category})`}
                                    />
                                ))}
                                {expenses.length > 3 && (
                                    <span className="text-[8px] text-muted leading-none">+</span>
                                )}
                            </div>

                            {/* Hover Tooltip (Basic) */}
                            {expenses.length > 0 && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] p-2 rounded-lg bg-slate-900 text-white text-xs z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl border border-slate-700 hidden sm:block">
                                    {expenses.map((e, i) => (
                                        <div key={i} className="truncate">• {e.title}</div>
                                    ))}
                                </div>
                            )}
                            {isReset && isCurrentMonth && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-indigo-600 text-white text-[10px] z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl">
                                    Budget Reset
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend / Info */}
            <div className="mt-4 flex items-center gap-4 text-xs text-muted flex-wrap">
                <div className="flex items-center gap-1.5">
                    <RefreshCw size={12} className="text-indigo-400" />
                    <span>Reset Date</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Recurring Expense</span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                    <AlertCircle size={12} className="text-indigo-400" />
                    <span>Notifications enabled</span>
                </div>
            </div>
        </div>
    );
};

export default BudgetCalendar;
