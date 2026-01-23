import React, { useState, useEffect } from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { useSettings } from '../../contexts/SettingsContext';
import { Save, Wallet, RefreshCw, Loader2 } from 'lucide-react';
import BudgetHistory from './BudgetHistory';

const BudgetSettings = () => {
    const { budget, updateBudget } = useExpenses();
    const { t, formatCurrency, currency, fromBaseCurrency, toBaseCurrency, exchangeRate, rateLoading, lastUpdated } = useSettings();

    const [isEditing, setIsEditing] = useState(false);
    const [localBudget, setLocalBudget] = useState(() => fromBaseCurrency(budget));
    const [saved, setSaved] = useState(false);

    // Sync local budget only when not editing, or on initial load
    useEffect(() => {
        if (!isEditing) {
            setLocalBudget(fromBaseCurrency(budget));
        }
    }, [budget, currency, exchangeRate, isEditing]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const baseAmount = toBaseCurrency(Number(localBudget));
        updateBudget(baseAmount);
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            setIsEditing(false);
        }, 1500);
    };

    const currencySymbol = currency === 'IDR' ? 'Rp' : '$';
    const hasBudget = budget > 0;

    return (
        <div className="space-y-6">
            <div className="glass-panel p-4 sm:p-8 rounded-2xl max-w-xl mx-auto transition-all duration-300">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Wallet size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-main">{t('budget.title')}</h2>
                        <p className="text-muted text-xs sm:text-sm">{t('budget.perMonth')}</p>
                    </div>
                </div>

                {/* View Mode */}
                {!isEditing && (
                    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
                        <div className={`p-4 sm:p-6 rounded-xl border ${hasBudget ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-slate-800/30 border-slate-700/30'}`}>
                            <p className="text-xs sm:text-sm text-muted mb-1">
                                {hasBudget ? t('budget.currentBudget') : t('budget.noBudget')}
                            </p>
                            <p className={`text-xl sm:text-2xl md:text-3xl font-bold ${hasBudget ? 'text-main' : 'text-slate-500'} break-all`}>
                                {hasBudget ? formatCurrency(budget) : formatCurrency(0)}
                            </p>
                        </div>

                        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                    {rateLoading ? (
                                        <Loader2 size={16} className="sm:w-[18px] sm:h-[18px] text-indigo-400 animate-spin flex-shrink-0" />
                                    ) : (
                                        <RefreshCw size={16} className="sm:w-[18px] sm:h-[18px] text-indigo-400 flex-shrink-0" />
                                    )}
                                    <div className="text-xs sm:text-sm min-w-0">
                                        <span className="text-muted">Kurs Live: </span>
                                        <span className="text-indigo-400 font-medium">
                                            $1 = Rp {exchangeRate.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                </div>
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-medium rounded-full flex-shrink-0">
                                    LIVE
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {hasBudget ? t('budget.editTitle') : t('budget.addTitle')}
                        </button>
                    </div>
                )}

                {/* Edit/Add Mode */}
                {isEditing && (
                    <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                        <div>
                            <label className="block text-sm font-medium text-main mb-2">
                                {hasBudget ? t('budget.editTitle') : t('budget.addTitle')}
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-semibold">{currencySymbol}</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={currency === 'IDR'
                                        ? Math.round(localBudget).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                                        : localBudget
                                    }
                                    onChange={(e) => {
                                        // Remove non-digit characters to get raw number
                                        const rawValue = e.target.value.replace(/\./g, '');
                                        if (!isNaN(rawValue)) {
                                            setLocalBudget(rawValue);
                                        }
                                    }}
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-12 pr-4 py-4 text-xl font-bold text-main focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                                    autoFocus
                                    placeholder="0"
                                />
                            </div>
                            {currency === 'IDR' && (
                                <p className="text-xs text-muted mt-2">
                                    ≈ ${toBaseCurrency(localBudget).toFixed(2)} USD
                                </p>
                            )}
                            {currency === 'USD' && (
                                <p className="text-xs text-muted mt-2">
                                    ≈ Rp {(localBudget * exchangeRate).toLocaleString('id-ID', { maximumFractionDigits: 0 })} IDR
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="flex-1 py-4 rounded-xl font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                            >
                                {t('budget.cancel')}
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {saved ? '✓' : t('budget.save')}
                                {!saved && <Save size={18} />}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Budget History Section */}
            <div className="max-w-xl mx-auto">
                <BudgetHistory />
            </div>
        </div>
    );
};

export default BudgetSettings;

