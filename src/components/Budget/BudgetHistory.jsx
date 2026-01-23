import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { useExpenses } from '../../contexts/ExpenseContext';

const BudgetHistory = () => {
    const { theme, language, currency, formatCurrency } = useSettings();
    const { allExpenses, budget } = useExpenses();
    const isDark = theme === 'dark';

    // Generate monthly summaries from expenses
    const monthlySummaries = useMemo(() => {
        const summaryMap = new Map();

        allExpenses.forEach(expense => {
            const date = new Date(expense.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const existing = summaryMap.get(monthKey) || { spent: 0, count: 0 };
            summaryMap.set(monthKey, {
                spent: existing.spent + Number(expense.amount),
                count: existing.count + 1
            });
        });

        // Convert to array and sort by date descending
        const summaries = Array.from(summaryMap.entries())
            .map(([monthKey, data]) => ({
                monthKey,
                month: new Date(monthKey + '-01'),
                spent: data.spent,
                count: data.count,
                budget: budget, // Use current budget for all months (simplified)
                remaining: budget - data.spent,
                percentage: Math.round((data.spent / budget) * 100)
            }))
            .sort((a, b) => b.month - a.month);

        return summaries;
    }, [allExpenses, budget]);

    // Current month info
    const currentMonth = new Date();
    const currentMonthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthData = monthlySummaries.find(s => s.monthKey === currentMonthKey) || {
        spent: 0,
        budget: budget,
        remaining: budget,
        percentage: 0
    };

    // Format month name
    const formatMonthName = (date) => {
        return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
            month: 'long',
            year: 'numeric'
        });
    };

    // Get status color based on percentage
    const getStatusColor = (percentage) => {
        if (percentage >= 100) return 'text-red-500';
        if (percentage >= 80) return 'text-amber-500';
        return 'text-emerald-500';
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 100) return 'bg-red-500';
        if (percentage >= 80) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    return (
        <div className="space-y-6">
            {/* Current Month Summary Card */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="text-indigo-500" size={20} />
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {language === 'id' ? 'Ringkasan Bulan Ini' : 'This Month Summary'}
                        </h3>
                    </div>
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {formatMonthName(currentMonth)}
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {language === 'id' ? 'Anggaran' : 'Budget'}
                        </p>
                        <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {formatCurrency(currentMonthData.budget)}
                        </p>
                    </div>
                    <div>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {language === 'id' ? 'Terpakai' : 'Spent'}
                        </p>
                        <p className={`text-lg font-bold ${getStatusColor(currentMonthData.percentage)}`}>
                            {formatCurrency(currentMonthData.spent)}
                        </p>
                    </div>
                    <div>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {language === 'id' ? 'Sisa' : 'Remaining'}
                        </p>
                        <p className={`text-lg font-bold ${currentMonthData.remaining >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {formatCurrency(Math.abs(currentMonthData.remaining))}
                            {currentMonthData.remaining < 0 && <span className="text-xs ml-1">{language === 'id' ? '(lebih)' : '(over)'}</span>}
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${getProgressColor(currentMonthData.percentage)}`}
                        style={{ width: `${Math.min(currentMonthData.percentage, 100)}%` }}
                    />
                </div>
                <p className={`text-xs mt-2 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {currentMonthData.percentage}% {language === 'id' ? 'terpakai' : 'used'}
                </p>
            </div>

            {/* Monthly History */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="text-indigo-500" size={20} />
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {language === 'id' ? 'Riwayat Bulanan' : 'Monthly History'}
                    </h3>
                </div>

                {monthlySummaries.length === 0 ? (
                    <p className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {language === 'id' ? 'Belum ada data pengeluaran' : 'No expense data yet'}
                    </p>
                ) : (
                    <div className="space-y-3">
                        {monthlySummaries.slice(0, 6).map((summary) => (
                            <div
                                key={summary.monthKey}
                                className={`p-3 rounded-xl border transition-colors
                                    ${isDark
                                        ? 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-900'
                                        : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        {formatMonthName(summary.month)}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {summary.percentage > 100 ? (
                                            <TrendingUp size={14} className="text-red-500" />
                                        ) : (
                                            <TrendingDown size={14} className="text-emerald-500" />
                                        )}
                                        <span className={`text-sm font-medium ${getStatusColor(summary.percentage)}`}>
                                            {summary.percentage}%
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs mb-2">
                                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                                        {formatCurrency(summary.spent)} / {formatCurrency(summary.budget)}
                                    </span>
                                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                                        {summary.count} {language === 'id' ? 'transaksi' : 'transactions'}
                                    </span>
                                </div>

                                {/* Mini Progress Bar */}
                                <div className="relative h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                    <div
                                        className={`absolute left-0 top-0 h-full rounded-full transition-all ${getProgressColor(summary.percentage)}`}
                                        style={{ width: `${Math.min(summary.percentage, 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {monthlySummaries.length > 6 && (
                    <p className={`text-center text-xs mt-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {language === 'id'
                            ? `+${monthlySummaries.length - 6} bulan lainnya`
                            : `+${monthlySummaries.length - 6} more months`
                        }
                    </p>
                )}
            </div>
        </div>
    );
};

export default BudgetHistory;
