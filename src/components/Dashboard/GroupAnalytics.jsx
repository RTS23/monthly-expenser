import React from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { useSettings } from '../../contexts/SettingsContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const GroupAnalytics = () => {
    const { allExpenses } = useExpenses();
    const { t, formatCurrency, theme } = useSettings();

    const chartTextColor = theme === 'dark' ? '#cbd5e1' : '#475569'; // slate-300 vs slate-600

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-panel p-3 rounded-xl shadow-xl">
                    <p className="text-muted text-sm font-medium mb-1">{label}</p>
                    <p className="text-main text-lg font-bold">
                        {formatCurrency(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    const categoryData = allExpenses.reduce((acc, curr) => {
        const translatedName = t(`categories.${curr.category}`) || curr.category;
        const existing = acc.find(item => item.name === translatedName);
        if (existing) existing.value += curr.amount;
        else acc.push({ name: translatedName, value: curr.amount });
        return acc;
    }, []);

    const userData = allExpenses.reduce((acc, curr) => {
        const name = curr.username || 'Unknown';
        const existing = acc.find(item => item.name === name);
        if (existing) existing.value += curr.amount;
        else acc.push({ name, value: curr.amount });
        return acc;
    }, []).sort((a, b) => b.value - a.value);

    const COLORS = [
        '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#ef4444',
    ];

    if (allExpenses.length === 0) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Spending by Category */}
            <div className="glass-panel p-6 rounded-2xl min-h-[400px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-main">{t('analytics.spendingByCategory')}</h3>
                    <div className="bg-white/5 px-3 py-1 rounded-full text-xs text-muted">
                        {categoryData.length} {t('analytics.categories')}
                    </div>
                </div>
                <div className="flex-1 w-full min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={4}
                                dataKey="value"
                                stroke="none"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        className="hover:opacity-80 transition-opacity cursor-pointer"
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                formatter={(value) => <span className="text-muted text-sm ml-1">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Spenders */}
            <div className="glass-panel p-6 rounded-2xl min-h-[400px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-main">{t('analytics.topSpenders')}</h3>
                    <div className="bg-white/5 px-3 py-1 rounded-full text-xs text-muted">
                        {userData.length} Users
                    </div>
                </div>
                <div className="flex-1 w-full min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={userData}
                            layout="vertical"
                            margin={{ top: 0, right: 40, left: 40, bottom: 0 }}
                            barSize={32}
                        >
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="name"
                                tick={{ fill: chartTextColor, fontSize: 13, fontWeight: 500 }}
                                width={100}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 8 }}
                                content={<CustomTooltip />}
                            />
                            <Bar
                                dataKey="value"
                                radius={[0, 6, 6, 0]}
                                animationDuration={1000}
                            >
                                {userData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};

export default GroupAnalytics;
