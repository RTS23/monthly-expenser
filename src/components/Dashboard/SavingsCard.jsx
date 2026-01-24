import React from 'react';
import { PiggyBank, TrendingUp, TrendingDown } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { useExpenses } from '../../contexts/ExpenseContext';

const SavingsCard = () => {
    const { formatCurrency, theme, language } = useSettings();
    const { savings } = useExpenses();
    const isDark = theme === 'dark';

    const isPositive = savings >= 0;

    return (
        <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${isDark
            ? 'bg-slate-800/50 border-slate-700/50'
            : 'bg-white border-slate-200'
            }`}>
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPositive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                    <PiggyBank size={20} />
                </div>
                <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {language === 'id' ? 'Tabungan Akumulasi' : 'Accumulated Savings'}
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {language === 'id' ? 'Dari sisa anggaran bulan lalu' : 'From past monthly remainders'}
                    </p>
                </div>
            </div>

            <div className="flex items-baseline gap-2">
                <h2 className={`text-xl sm:text-2xl font-bold tracking-tight break-words ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {formatCurrency(Math.abs(savings))}
                </h2>
                {!isPositive && (
                    <span className="text-sm font-medium text-red-400">
                        ({language === 'id' ? 'Minus' : 'Deficit'})
                    </span>
                )}
            </div>

            <div className={`mt-4 p-3 rounded-xl border flex items-center gap-3 ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-100'
                }`}>
                {isPositive ? (
                    <TrendingUp size={18} className="text-emerald-500" />
                ) : (
                    <TrendingDown size={18} className="text-red-500" />
                )}
                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {isPositive
                        ? (language === 'id' ? 'Anda hemat!' : 'You are saving money!')
                        : (language === 'id' ? 'Anda boros!' : 'You are over budget!')
                    }
                </p>
            </div>
        </div>
    );
};

export default SavingsCard;
