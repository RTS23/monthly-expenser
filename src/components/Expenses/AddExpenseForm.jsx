import React, { useState } from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { useSettings } from '../../contexts/SettingsContext';
import { Plus, X, Coffee, ShoppingBag, Home, Car, Zap, Smartphone, MoreHorizontal, Sparkles } from 'lucide-react';
import FileUpload from '../Common/FileUpload';
import { useToast } from '../UI/Toast';

const CATEGORIES = [
    { id: 'Food', icon: Coffee },
    { id: 'Shopping', icon: ShoppingBag },
    { id: 'Housing', icon: Home },
    { id: 'Transport', icon: Car },
    { id: 'Utilities', icon: Zap },
    { id: 'Entertainment', icon: Smartphone },
    { id: 'Other', icon: MoreHorizontal }
];

const AddExpenseForm = () => {
    const { addExpense, isAddExpenseOpen, setIsAddExpenseOpen, expenses, savings, budget, updateBudget } = useExpenses();
    const { t, currency, toBaseCurrency, getCurrencySymbol, exchangeRate, formatCurrency } = useSettings();
    const { showToast } = useToast();
    // const [isOpen, setIsOpen] = useState(false); // Removed local state
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        receiptUrl: null
    });
    const [newBudget, setNewBudget] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.amount) return;

        setIsSubmitting(true);
        const baseAmount = toBaseCurrency(Number(formData.amount));

        // If new user (0 budget) sets a budget
        if (budget === 0 && newBudget) {
            const baseBudget = toBaseCurrency(Number(newBudget));
            await updateBudget(baseBudget);
        }

        const success = await addExpense({
            ...formData,
            amount: baseAmount
        });

        if (success) {
            showToast('Expense added successfully! 🚀', 'success');
            setFormData({
                title: '',
                amount: '',
                category: 'Food',
                date: new Date().toISOString().split('T')[0],
                receiptUrl: null
            });
            setNewBudget('');
            setIsAddExpenseOpen(false);
        } else {
            showToast('Failed to add expense. Please try again.', 'error');
        }
        setIsSubmitting(false);
    };

    const currencySymbol = getCurrencySymbol();

    // Floating Action Button - Clean Modern Design
    if (!isAddExpenseOpen) {
        // Hide FAB if expenses are empty (Clean Slate mode uses the big card instead)
        if (expenses.length === 0) return null;

        return (
            <button
                onClick={() => setIsAddExpenseOpen(true)}
                data-tour="add-expense-trigger"
                className="fixed bottom-6 right-6 group z-40"
            >
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-full bg-indigo-500/30 blur-xl group-hover:bg-indigo-400/40 transition-all duration-500 scale-75 group-hover:scale-110" />

                {/* Main button */}
                <div className="relative flex items-center gap-2.5 px-5 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-indigo-500/40">
                    <Plus size={20} strokeWidth={2.5} className="transition-transform duration-300 group-hover:rotate-90" />
                    <span className="font-semibold text-sm">{t('addExpenseForm.addButton')}</span>
                </div>
            </button>
        );
    }

    // Modal Overlay
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
                onClick={() => !isSubmitting && setIsAddExpenseOpen(false)}
            />

            {/* Modal with border gradient */}
            <div className="relative w-full max-w-md p-[2px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-in zoom-in-95 fade-in duration-300 shadow-2xl">
                <div className="bg-[hsl(var(--bg-card))] rounded-2xl p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-xl text-main flex items-center gap-2">
                            <Sparkles size={20} className="text-yellow-400" />
                            {budget === 0 ? (currency === 'IDR' ? 'Mulai Berhemat' : 'Get Started') : t('addExpenseForm.title')}
                        </h3>
                        <button
                            onClick={() => !isSubmitting && setIsAddExpenseOpen(false)}
                            disabled={isSubmitting}
                            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors hover:rotate-90 duration-300 disabled:opacity-50"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* FIRST TIME USER: Set Budget Input */}
                        {budget === 0 && (
                            <div className="animate-in slide-in-from-top-2 duration-500">
                                <label className="block text-sm font-medium text-indigo-400 mb-2 flex items-center gap-2">
                                    <Sparkles size={14} />
                                    {currency === 'IDR' ? 'Set Anggaran Bulanan' : 'Set Monthly Budget'}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium">{currencySymbol}</span>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder={currency === 'IDR' ? '5.000.000' : '2000'}
                                        className="w-full bg-indigo-500/10 border border-indigo-500/50 rounded-xl pl-12 pr-4 py-3 text-white placeholder-indigo-300/30 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                                        value={newBudget ? (currency === 'IDR' ? Number(newBudget).toLocaleString('id-ID') : newBudget) : ''}
                                        onChange={(e) => {
                                            let val = e.target.value;
                                            if (currency === 'IDR') {
                                                val = val.replace(/\./g, '');
                                                if (!/^\d*$/.test(val)) return;
                                            }
                                            setNewBudget(val);
                                        }}
                                        required
                                        autoFocus
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-2 ml-1">
                                    {currency === 'IDR' ? 'Tentukan batas pengeluaran bulananmu.' : 'Set your spending limit for the month.'}
                                </p>
                            </div>
                        )}
                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-main mb-2">
                                {t('addExpenseForm.description')}
                            </label>
                            <input
                                type="text"
                                placeholder={t('addExpenseForm.placeholder.description')}
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-main placeholder-muted focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all focus:scale-[1.02]"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                autoFocus
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Amount & Date Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    {t('addExpenseForm.amount')} ({currency})
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium">{currencySymbol}</span>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder={currency === 'IDR' ? '50.000' : '10.00'}
                                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3 text-main placeholder-muted focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                                        value={(() => {
                                            if (!formData.amount) return '';
                                            if (currency === 'IDR') {
                                                return Number(formData.amount).toLocaleString('id-ID');
                                            }
                                            return formData.amount;
                                        })()}
                                        onChange={(e) => {
                                            let val = e.target.value;
                                            if (currency === 'IDR') {
                                                // Remove existing dots to get raw number
                                                val = val.replace(/\./g, '');
                                                // Allow only numbers
                                                if (!/^\d*$/.test(val)) return;
                                            }
                                            setFormData({ ...formData, amount: val });
                                        }}
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {formData.amount && (
                                    <p className="text-xs text-slate-500 mt-1">
                                        {currency === 'IDR'
                                            ? `≈ $${toBaseCurrency(formData.amount).toFixed(2)}`
                                            : `≈ Rp ${(formData.amount * exchangeRate).toLocaleString('id-ID')}`
                                        }
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Tanggal
                                </label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        {/* Category Grid */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-3">
                                {t('addExpenseForm.category')}
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {CATEGORIES.map((cat, index) => {
                                    const Icon = cat.icon;
                                    const isSelected = formData.category === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, category: cat.id })}
                                            disabled={isSubmitting}
                                            className={`
                                                flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all duration-300
                                                ${isSelected
                                                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-110'
                                                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200 hover:scale-105'
                                                }
                                                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <Icon size={20} />
                                            <span className="text-[10px] font-medium truncate w-full text-center">
                                                {t(`categories.${cat.id}`)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Budget Preview Calculation */}
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-400">{currency === 'IDR' ? 'Sisa Anggaran' : 'Remaining Budget'}</span>
                                <span className="font-medium text-white">
                                    {budget === 0 && newBudget
                                        ? formatCurrency(toBaseCurrency(Number(newBudget)))
                                        : formatCurrency(savings)
                                    }
                                </span>
                            </div>

                            {formData.amount && (
                                <>
                                    <div className="h-px bg-slate-700/50 w-full" />
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400">{currency === 'IDR' ? 'Setelah Pengeluaran' : 'After Expense'}</span>
                                        <span className={`font-bold transition-all duration-300 ${((budget === 0 && newBudget ? toBaseCurrency(Number(newBudget)) : savings) - toBaseCurrency(Number(formData.amount))) < 0
                                                ? 'text-red-400 scale-105'
                                                : 'text-emerald-400'
                                            }`}>
                                            {formatCurrency(
                                                (budget === 0 && newBudget ? toBaseCurrency(Number(newBudget)) : savings) - toBaseCurrency(Number(formData.amount))
                                            )}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Receipt Upload */}
                        <FileUpload
                            onUpload={(url) => setFormData({ ...formData, receiptUrl: url })}
                            existingImage={formData.receiptUrl}
                            label="Upload Struk (Opsional)"
                        />

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 btn-shine disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                            ) : (
                                <Plus size={20} />
                            )}
                            {isSubmitting ? 'Saving...' : (budget === 0 ? (currency === 'IDR' ? 'Mulai & Simpan' : 'Start Journey') : t('addExpenseForm.addButton'))}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddExpenseForm;
