import React, { useState } from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { useSettings } from '../../contexts/SettingsContext';
import { Plus, X, Coffee, ShoppingBag, Home, Car, Zap, Smartphone, MoreHorizontal, Sparkles } from 'lucide-react';
import FileUpload from '../Common/FileUpload';

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
    const { addExpense, isAddExpenseOpen, setIsAddExpenseOpen, expenses } = useExpenses();
    const { t, currency, toBaseCurrency, getCurrencySymbol, exchangeRate } = useSettings();
    // const [isOpen, setIsOpen] = useState(false); // Removed local state
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        receiptUrl: null
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.amount) return;

        const baseAmount = toBaseCurrency(Number(formData.amount));

        addExpense({
            ...formData,
            amount: baseAmount
        });

        setFormData({
            title: '',
            amount: '',
            category: 'Food',
            date: new Date().toISOString().split('T')[0],
            receiptUrl: null
        });
        setIsAddExpenseOpen(false);
    };

    const currencySymbol = getCurrencySymbol();

    // Floating Action Button - Clean Modern Design
    if (!isAddExpenseOpen) {
        // Hide FAB if expenses are empty (Clean Slate mode uses the big card instead)
        if (expenses.length === 0) return null;

        return (
            <button
                onClick={() => setIsAddExpenseOpen(true)}
                data-tour="add-expense-btn"
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
                onClick={() => setIsAddExpenseOpen(false)}
            />

            {/* Modal with border gradient */}
            <div className="relative w-full max-w-md p-[2px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-in zoom-in-95 fade-in duration-300 shadow-2xl">
                <div className="bg-[hsl(var(--bg-card))] rounded-2xl p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-xl text-main flex items-center gap-2">
                            <Sparkles size={20} className="text-yellow-400" />
                            {t('addExpenseForm.title')}
                        </h3>
                        <button
                            onClick={() => setIsAddExpenseOpen(false)}
                            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors hover:rotate-90 duration-300"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
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
                                            className={`
                                                flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all duration-300
                                                ${isSelected
                                                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-110'
                                                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200 hover:scale-105'
                                                }
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

                        {/* Receipt Upload */}
                        <FileUpload
                            onUpload={(url) => setFormData({ ...formData, receiptUrl: url })}
                            existingImage={formData.receiptUrl}
                            label="Upload Struk (Opsional)"
                        />

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 btn-shine"
                        >
                            <Plus size={20} />
                            {t('addExpenseForm.addButton')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddExpenseForm;
