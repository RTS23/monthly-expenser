import React, { useState, useEffect } from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { useSettings } from '../../contexts/SettingsContext';
import { Save, Wallet, RefreshCw, Loader2 } from 'lucide-react';
import BudgetHistory from './BudgetHistory';

const BudgetSettings = () => {
    const { budget, updateBudget, budgets, selectedUser, monthlyBudgets } = useExpenses();
    const { t, formatCurrency, currency, fromBaseCurrency, toBaseCurrency, exchangeRate, rateLoading, lastUpdated } = useSettings();

    const [isEditing, setIsEditing] = useState(false);
    const [localBudget, setLocalBudget] = useState('');
    const [saved, setSaved] = useState(false);
    const [mode, setMode] = useState('set'); // 'set' or 'add'
    const [isMonthly, setIsMonthly] = useState(false); // Toggle for monthly override

    // Determine which budget we are actually editing
    const targetUsername = selectedUser || 'Admin';
    const currentIsoMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Default Budget = budgets[user] || 2000
    const defaultUserBudget = (budgets && budgets[targetUsername]) || 2000;

    // Monthly Budget check
    // monthlyBudgets contains { userId, month, amount }
    // We need to match userId carefully. Backend might store 'admin' or 'Admin'.
    // We should normalize or check both? Context usually handles case-sensitivity now.
    // Let's assume fetching matches the user ID logic.
    const monthlyEntry = monthlyBudgets ? monthlyBudgets.find(mb => mb.month === currentIsoMonth && mb.userId === (selectedUser || 'admin')) : null;
    const monthlyUserBudget = monthlyEntry ? Number(monthlyEntry.amount) : defaultUserBudget;

    const editableBudget = isMonthly ? monthlyUserBudget : defaultUserBudget;



    const handleOpenModal = () => {
        setIsEditing(true);
        setMode('set');
        setIsMonthly(false);
        setLocalBudget(''); // Start empty as requested
        console.log(`Opened Budget Modal for ${targetUsername}`);
    };

    const handleToggleMonthly = (checked) => {
        setIsMonthly(checked);
        setLocalBudget(''); // Clear input when switching context
        setMode('set');
    };

    const handleSwitchToSet = () => {
        setMode('set');
        setLocalBudget(''); // Clear input
    };

    const handleSwitchToAdd = () => {
        setMode('add');
        setLocalBudget('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let finalBaseAmount;

        if (mode === 'add') {
            const additionalAmountBase = toBaseCurrency(Number(localBudget));
            finalBaseAmount = editableBudget + additionalAmountBase;
        } else {
            finalBaseAmount = toBaseCurrency(Number(localBudget));
        }

        // Pass month if isMonthly is true
        updateBudget(finalBaseAmount, isMonthly ? currentIsoMonth : null);

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
                            onClick={handleOpenModal}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {hasBudget ? t('budget.editTitle') : t('budget.addTitle')}
                        </button>
                    </div>
                )}

                {/* Edit/Add Mode */}
                {isEditing && (
                    <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">

                        {/* Monthly vs Default Toggle */}
                        <div className="bg-slate-800/10 dark:bg-slate-800/50 p-3 rounded-xl flex items-center justify-between border border-slate-700/20">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-main">
                                    {isMonthly ? `Budget for ${new Date().toLocaleString('default', { month: 'long' })}` : "Default Monthly Budget"}
                                </span>
                                <span className="text-xs text-muted">
                                    {isMonthly ? "Only affects this month" : "Applies to all new months"}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleToggleMonthly(!isMonthly)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isMonthly ? 'bg-indigo-600' : 'bg-slate-400 dark:bg-slate-600'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isMonthly ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {/* Mode Toggle */}
                        <div className="flex bg-slate-800/50 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={handleSwitchToSet}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'set' ? 'bg-indigo-600 text-white shadow-lg' : 'text-muted hover:text-white'}`}
                            >
                                {t('budget.setMode')}
                            </button>
                            <button
                                type="button"
                                onClick={handleSwitchToAdd}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'add' ? 'bg-indigo-600 text-white shadow-lg' : 'text-muted hover:text-white'}`}
                            >
                                {t('budget.addMode')}
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-main mb-2">
                                {mode === 'set' ? t('budget.editTitle') : t('budget.addTitle')}
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-semibold">{currencySymbol}</span>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={localBudget === '' ? '' : (currency === 'IDR'
                                        ? Number(localBudget).toLocaleString('id-ID')
                                        : localBudget)
                                    }
                                    onChange={(e) => {
                                        let val = e.target.value;
                                        if (currency === 'IDR') {
                                            val = val.replace(/\./g, '');
                                            if (!/^\d*$/.test(val)) return;
                                        } else {
                                            val = val.replace(/,/g, '');
                                        }

                                        if (!isNaN(val)) {
                                            setLocalBudget(val);
                                        }
                                    }}
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-12 pr-4 py-4 text-xl font-bold text-main focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                                    autoFocus
                                    placeholder="0"
                                />
                            </div>

                            {/* Preview Calculation for Add Mode */}
                            {mode === 'add' && Number(localBudget) > 0 && (
                                <div className="mt-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted">{t('budget.current')}:</span>
                                        <span className="text-main">{formatCurrency(editableBudget)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-1">
                                        <span className="text-emerald-400">+ {t('budget.add')}:</span>
                                        <span className="text-emerald-400">{formatCurrency(toBaseCurrency(localBudget), true)}</span>
                                    </div>
                                    <div className="border-t border-indigo-500/20 my-2"></div>
                                    <div className="flex justify-between font-bold">
                                        <span className="text-indigo-300">{t('budget.newTotal')}:</span>
                                        <span className="text-indigo-300">
                                            {formatCurrency(editableBudget + toBaseCurrency(Number(localBudget)), true)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {mode === 'set' && (
                                <div className="mt-3">
                                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                                        <div className="flex justify-between text-sm text-muted">
                                            <span>Current:</span>
                                            <span className="font-medium text-main">{formatCurrency(editableBudget)}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted mt-2">
                                        {currency === 'IDR'
                                            ? `≈ $${toBaseCurrency(Number(localBudget)).toFixed(2)} USD`
                                            : `≈ Rp ${(Number(localBudget) * exchangeRate).toLocaleString('id-ID', { maximumFractionDigits: 0 })} IDR`
                                        }
                                    </p>
                                </div>
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
        </div >
    );
};

export default BudgetSettings;

