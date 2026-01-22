import React, { useState } from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { useSettings } from '../../contexts/SettingsContext';
import { Trash2, Repeat, Plus, Coffee, ShoppingBag, Home, Car, Zap, Smartphone, MoreHorizontal } from 'lucide-react';
import ConfirmModal from '../UI/ConfirmModal';

const CategoryIcon = ({ category }) => {
    const icons = {
        'Food': Coffee,
        'Shopping': ShoppingBag,
        'Housing': Home,
        'Transport': Car,
        'Utilities': Zap,
        'Entertainment': Smartphone,
        'Other': MoreHorizontal
    };

    const Icon = icons[category] || MoreHorizontal;

    const colors = {
        'Food': 'bg-orange-500/20 text-orange-400',
        'Shopping': 'bg-pink-500/20 text-pink-400',
        'Housing': 'bg-indigo-500/20 text-indigo-400',
        'Transport': 'bg-blue-500/20 text-blue-400',
        'Utilities': 'bg-yellow-500/20 text-yellow-400',
        'Entertainment': 'bg-purple-500/20 text-purple-400',
        'Other': 'bg-slate-500/20 text-slate-400'
    };

    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colors[category] || colors['Other']}`}>
            <Icon size={20} />
        </div>
    );
};

const RecurringExpenses = () => {
    const { recurringExpenses, addRecurringExpense, deleteRecurringExpense } = useExpenses();
    const { t, formatCurrency, theme, language } = useSettings();
    const isDark = theme === 'dark';

    const [isAdding, setIsAdding] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Housing',
        dayOfMonth: '1'
    });

    const categories = [
        { id: 'Food', label: 'Food' },
        { id: 'Shopping', label: 'Shopping' },
        { id: 'Housing', label: 'Housing' },
        { id: 'Transport', label: 'Transport' },
        { id: 'Utilities', label: 'Utilities' },
        { id: 'Entertainment', label: 'Entertainment' },
        { id: 'Other', label: 'Other' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        addRecurringExpense({
            title: formData.title,
            amount: Number(formData.amount),
            category: formData.category,
            dayOfMonth: Number(formData.dayOfMonth)
        });
        setIsAdding(false);
        setFormData({ title: '', amount: '', category: 'Housing', dayOfMonth: '1' });
    };

    const confirmDelete = () => {
        if (deleteModal.id) {
            deleteRecurringExpense(deleteModal.id);
            setDeleteModal({ isOpen: false, id: null });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-main flex items-center gap-2">
                        <Repeat className="text-indigo-500" />
                        {language === 'id' ? 'Pengeluaran Rutin' : 'Recurring Expenses'}
                    </h2>
                    <p className="text-muted">
                        {language === 'id'
                            ? 'Kelola pengeluaran yang otomatis dicatat setiap bulan'
                            : 'Manage expenses that are automatically logged every month'}
                    </p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all"
                >
                    <Plus size={18} />
                    {language === 'id' ? 'Tambah Baru' : 'Add New'}
                </button>
            </div>

            {isAdding && (
                <div className={`p-6 rounded-2xl border animate-in fade-in slide-in-from-top-4 duration-300
                    ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}
                `}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-main">
                                    {language === 'id' ? 'Judul' : 'Title'}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-main
                                        ${isDark ? 'border-slate-600 focus:border-indigo-500' : 'border-slate-300 focus:border-indigo-500'}
                                    `}
                                    placeholder="Netflix, Rent, Internet..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-main">
                                    {language === 'id' ? 'Jumlah' : 'Amount'}
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-main
                                        ${isDark ? 'border-slate-600 focus:border-indigo-500' : 'border-slate-300 focus:border-indigo-500'}
                                    `}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-main">
                                    {language === 'id' ? 'Kategori' : 'Category'}
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-main
                                        ${isDark ? 'border-slate-600 focus:border-indigo-500' : 'border-slate-300 focus:border-indigo-500'}
                                    `}
                                >
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id} className={isDark ? 'bg-slate-800' : 'bg-white'}>
                                            {t(`categories.${c.id}`) || c.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-main">
                                    {language === 'id' ? 'Hari setiap Bulan' : 'Day of Month'} (1-31)
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max="31"
                                    value={formData.dayOfMonth}
                                    onChange={e => setFormData({ ...formData, dayOfMonth: e.target.value })}
                                    className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-main
                                        ${isDark ? 'border-slate-600 focus:border-indigo-500' : 'border-slate-300 focus:border-indigo-500'}
                                    `}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 text-sm font-medium text-muted hover:text-main transition-colors"
                            >
                                {language === 'id' ? 'Batal' : 'Cancel'}
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
                            >
                                {language === 'id' ? 'Simpan' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recurringExpenses.map(rec => (
                    <div
                        key={rec.id}
                        className={`p-4 rounded-2xl border transition-all hover:shadow-lg group relative
                            ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}
                        `}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <CategoryIcon category={rec.category} />
                            <div className="text-right">
                                <p className="font-bold text-lg text-main">{formatCurrency(rec.amount)}</p>
                                <p className="text-xs text-muted">/{language === 'id' ? 'bulan' : 'month'}</p>
                            </div>
                        </div>

                        <h3 className="font-semibold text-main mb-1 truncate">{rec.title}</h3>

                        <div className="flex items-center gap-2 text-xs text-muted">
                            <Repeat size={14} />
                            <span>
                                {language === 'id'
                                    ? `Setiap tanggal ${rec.dayOfMonth}`
                                    : `Recurring on day ${rec.dayOfMonth}`}
                            </span>
                        </div>

                        <button
                            onClick={() => setDeleteModal({ isOpen: true, id: rec.id })}
                            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}

                {recurringExpenses.length === 0 && !isAdding && (
                    <div className="col-span-full py-12 text-center text-muted">
                        <Repeat size={48} className="mx-auto mb-4 opacity-20" />
                        <p>{language === 'id' ? 'Belum ada pengeluaran rutin' : 'No recurring expenses yet'}</p>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={confirmDelete}
                title={language === 'id' ? 'Hapus Pengeluaran Rutin?' : 'Delete Recurring Expense?'}
                message={language === 'id'
                    ? 'Pengeluaran ini tidak akan dibuat otomatis lagi bulan depan.'
                    : 'This expense will no longer be automatically created next month.'}
                confirmText={language === 'id' ? 'Hapus' : 'Delete'}
                cancelText={language === 'id' ? 'Batal' : 'Cancel'}
                type="danger"
            />
        </div>
    );
};

export default RecurringExpenses;
