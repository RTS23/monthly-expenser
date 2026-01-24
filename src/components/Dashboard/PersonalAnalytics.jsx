import React, { useMemo } from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { useSettings } from '../../contexts/SettingsContext';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

const PersonalAnalytics = () => {
    const { expenses, budget, setIsAddExpenseOpen } = useExpenses();
    const { t, formatCurrency, language } = useSettings();

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-panel p-4 rounded-xl shadow-xl">
                    <p className="font-semibold text-main mb-1">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const categoryData = useMemo(() => {
        const categories = {};
        expenses.forEach(exp => {
            categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
        });
        return Object.entries(categories)
            .map(([name, value]) => ({ name: t(`categories.${name}`) || name, value }))
            .sort((a, b) => b.value - a.value);
    }, [expenses, t]);

    const trendData = useMemo(() => {
        const dailyMap = {};
        expenses.forEach(exp => {
            const date = new Date(exp.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
            dailyMap[date] = (dailyMap[date] || 0) + exp.amount;
        });

        const sortedDates = Object.keys(dailyMap).sort((a, b) => new Date(a) - new Date(b));

        let cumulative = 0;
        return sortedDates.map(date => {
            cumulative += dailyMap[date];
            return {
                date,
                spent: dailyMap[date],
                total: cumulative
            };
        });
    }, [expenses]);

    // Empty State: Show clear CTA instead of empty charts
    if (expenses.length === 0) {
        return (
            <div className="glass-panel p-8 sm:p-12 rounded-2xl text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto relative group cursor-pointer" onClick={() => setIsAddExpenseOpen(true)}>
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
                    <span className="text-4xl sm:text-5xl relative z-10 group-hover:scale-110 transition-transform">🚀</span>
                </div>

                <div className="max-w-md mx-auto space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-main">
                        {t('tour.welcome') || "Welcome to Etoile!"}
                    </h3>
                    <p className="text-muted text-sm sm:text-base leading-relaxed">
                        {language === 'id'
                            ? "Mulai perjalanan finansialmu sekarang. Catat pengeluaran pertamamu untuk melihat analisis di sini."
                            : "Start your financial journey. Track your first expense to unlock powerful insights and analytics here."
                        }
                    </p>
                </div>

                <button
                    onClick={() => setIsAddExpenseOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95"
                >
                    <span className="text-lg">+</span>
                    {t('dashboard.addExpense') || "Add Expense"}
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
            {/* Category Distribution */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h3 className="text-lg font-semibold text-main mb-6 relative z-10 flex items-center gap-2">
                    <div className="w-2 h-6 bg-indigo-500 rounded-full" />
                    {t('analytics.spendingByCategory')}
                </h3>
                <div className="h-[250px] w-full relative z-10 flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold text-main">
                            {categoryData.length}
                        </span>
                        <span className="text-xs text-muted uppercase tracking-wider">{t('analytics.categories')}</span>
                    </div>
                </div>
            </div>

            {/* Spending Trend */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h3 className="text-lg font-semibold text-main mb-6 relative z-10 flex items-center gap-2">
                    <div className="w-2 h-6 bg-purple-500 rounded-full" />
                    {t('analytics.spendingTrend')}
                </h3>
                <div className="h-[250px] w-full relative z-10 -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                tickFormatter={(val) => formatCurrency(val)}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="total"
                                name={t('analytics.totalSpent')}
                                stroke="#8b5cf6"
                                strokeWidth={4}
                                dot={{ fill: '#1e293b', stroke: '#8b5cf6', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 8, fill: '#8b5cf6' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default PersonalAnalytics;
