import React from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { useSettings } from '../../contexts/SettingsContext';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import SavingsCard from './SavingsCard';

const Overview = () => {
    const { expenses, budget } = useExpenses();
    const { t, formatCurrency } = useSettings();

    const totalSpent = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const remaining = budget - totalSpent;
    const percentage = Math.min((totalSpent / budget) * 100, 100);

    const getProgressColor = () => {
        if (percentage < 50) return 'bg-emerald-500';
        if (percentage < 80) return 'bg-yellow-500';
        return 'bg-rose-500';
    };

    const getProgressGlow = () => {
        if (percentage < 50) return 'shadow-emerald-500/50';
        if (percentage < 80) return 'shadow-yellow-500/50';
        return 'shadow-rose-500/50';
    };

    return (
        <div data-tour="dashboard-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8 perspective-1000">
            {/* Total Budget Card */}
            <div className="glass-panel tilt-3d p-4 sm:p-6 rounded-2xl relative overflow-hidden group stagger-1">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-all duration-500 group-hover:scale-110">
                    <Wallet size={60} className="sm:w-20 sm:h-20 text-indigo-400" />
                </div>
                <div className="relative z-10">
                    <h3 className="text-muted text-xs sm:text-sm font-medium mb-1">{t('dashboard.monthlyBudget')}</h3>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-main count-up break-words">{formatCurrency(budget)}</p>
                    <div className="mt-2 sm:mt-4 text-xs text-muted">
                        {t('dashboard.definedLimit')}
                    </div>
                </div>
            </div>

            {/* Spent Card */}
            <div className="glass-panel tilt-3d p-4 sm:p-6 rounded-2xl relative overflow-hidden group stagger-2">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-all duration-500 group-hover:scale-110 text-rose-500">
                    <TrendingDown size={60} className="sm:w-20 sm:h-20" />
                </div>
                <div className="relative z-10">
                    <h3 className="text-muted text-xs sm:text-sm font-medium mb-1">{t('dashboard.totalSpent')}</h3>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-main count-up break-words">{formatCurrency(totalSpent)}</p>
                    <div className="mt-2 sm:mt-4 text-xs text-rose-300 flex items-center">
                        <TrendingDown size={14} className="mr-1" />
                        <span className={percentage >= 80 ? 'animate-pulse' : ''}>{percentage.toFixed(1)}% {t('dashboard.budgetUsed')}</span>
                    </div>
                </div>
            </div>

            {/* Remaining Card */}
            <div className="glass-panel tilt-3d p-4 sm:p-6 rounded-2xl relative overflow-hidden group stagger-3">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-all duration-500 group-hover:scale-110 text-emerald-500">
                    <TrendingUp size={60} className="sm:w-20 sm:h-20" />
                </div>
                <div className="relative z-10">
                    <h3 className="text-muted text-xs sm:text-sm font-medium mb-1">{t('dashboard.remaining')}</h3>
                    <p className={`text-lg sm:text-xl md:text-2xl font-bold count-up break-words ${remaining < 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                        {formatCurrency(remaining)}
                    </p>

                    {/* Animated Progress Bar */}
                    <div className="mt-2 sm:mt-4 w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor()} shadow-lg ${getProgressGlow()}`}
                            style={{ width: `${percentage}%` }}
                        >
                            <div className="w-full h-full shimmer" />
                        </div>
                    </div>
                </div>
            </div>
            {/* Savings Card */}
            <div className="stagger-4">
                <SavingsCard />
            </div>
        </div>
    );
};

export default Overview;
