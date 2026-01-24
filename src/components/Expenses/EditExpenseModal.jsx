import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { X, ShoppingBag, Coffee, Home, Car, Zap, Smartphone, MoreHorizontal } from 'lucide-react';

const categories = [
    { id: 'Food', icon: Coffee },
    { id: 'Shopping', icon: ShoppingBag },
    { id: 'Housing', icon: Home },
    { id: 'Transport', icon: Car },
    { id: 'Utilities', icon: Zap },
    { id: 'Entertainment', icon: Smartphone },
    { id: 'Other', icon: MoreHorizontal }
];

const EditExpenseModal = ({ isOpen, onClose, onSave, expense }) => {
    const { t, theme, language, fromBaseCurrency, toBaseCurrency, currency } = useSettings();
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Food',
        date: ''
    });

    // Helper to format amount for display (e.g. 100000 -> 100.000)
    const formatDisplayAmount = (value) => {
        if (!value && value !== 0) return '';
        // Remove existing non-numeric chars first to prevent double formatting issues during typing
        const num = Number(String(value).replace(/[^0-9.-]+/g, ''));
        if (isNaN(num)) return value; // Return original if not a number

        return new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: currency === 'IDR' ? 0 : 2,
            useGrouping: true
        }).format(num);
    };

    // Helper to parse formatted input back to number (e.g. 100.000 -> 100000)
    const parseInputAmount = (value) => {
        if (!value) return 0;
        // For IDR (uses dots for thousands), remove dots. For ISO/English (commas), remove commas.
        // Simple approach: remove all non-numeric characters except '.'(decimal) if USD, or nothing if IDR
        if (currency === 'IDR') {
            return Number(value.replace(/\./g, ''));
        }
        return Number(value.replace(/,/g, ''));
    };

    useEffect(() => {
        if (expense) {
            // Convert from base currency (USD in DB) to display currency
            const displayAmount = fromBaseCurrency(expense.amount || 0);
            const initialAmount = currency === 'IDR' ? Math.round(displayAmount) : displayAmount;

            setFormData({
                title: expense.title || '',
                amount: formatDisplayAmount(initialAmount),
                category: expense.category || 'Food',
                date: expense.date ? expense.date.split('T')[0] : ''
            });
        }
    }, [expense, currency, fromBaseCurrency]);

    const handleAmountChange = (e) => {
        const value = e.target.value;

        // Allow only numbers and separators
        const cleanValue = value.replace(/[^0-9.,]/g, '');

        // Remove separators to get raw number string
        const rawValue = currency === 'IDR'
            ? cleanValue.replace(/\./g, '')
            : cleanValue.replace(/,/g, '');

        if (rawValue === '' || !isNaN(rawValue)) {
            // For IDR, format immediately as integer. For USD, allow decimal typing
            if (currency === 'IDR') {
                setFormData({ ...formData, amount: formatDisplayAmount(rawValue) });
            } else {
                setFormData({ ...formData, amount: cleanValue });
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.amount) return;

        // Parse formatted string back to number
        const numericAmount = parseInputAmount(formData.amount);

        // Convert back to base currency (USD) for storage
        const baseAmount = toBaseCurrency(numericAmount);

        onSave({
            ...expense,
            title: formData.title,
            amount: baseAmount,
            category: formData.category,
            date: formData.date ? new Date(formData.date).toISOString() : expense.date
        });
        onClose();
    };

    if (!isOpen) return null;

    const isDark = theme === 'dark';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative w-full max-w-md mx-4 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200
                ${isDark ? 'bg-slate-900 border border-slate-700/50' : 'bg-white border border-slate-200'}
            `}>
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b
                    ${isDark ? 'border-slate-700/50' : 'border-slate-200'}
                `}>
                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {language === 'id' ? 'Edit Pengeluaran' : 'Edit Expense'}
                    </h2>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors
                            ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}
                        `}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Title */}
                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {language === 'id' ? 'Judul' : 'Title'}
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-xl border transition-colors
                                ${isDark
                                    ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                                    : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
                                }
                            `}
                            required
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {language === 'id' ? 'Jumlah' : 'Amount'}
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={formData.amount}
                            onChange={handleAmountChange}
                            placeholder={currency === 'IDR' ? '0' : '0.00'}
                            className={`w-full px-4 py-2.5 rounded-xl border transition-colors
                                ${isDark
                                    ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                                    : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
                                }
                            `}
                            required
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {language === 'id' ? 'Kategori' : 'Category'}
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {categories.map(({ id, icon: Icon }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: id })}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all text-xs
                                        ${formData.category === id
                                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                                            : isDark
                                                ? 'border-slate-700 text-slate-400 hover:border-slate-600'
                                                : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                        }
                                    `}
                                >
                                    <Icon size={18} />
                                    <span className="truncate w-full text-center">{id}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {language === 'id' ? 'Tanggal' : 'Date'}
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-xl border transition-colors
                                ${isDark
                                    ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                                    : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
                                }
                            `}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 py-2.5 rounded-xl font-medium transition-colors
                                ${isDark
                                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }
                            `}
                        >
                            {language === 'id' ? 'Batal' : 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                        >
                            {language === 'id' ? 'Simpan' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditExpenseModal;
