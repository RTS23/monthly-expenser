import React, { useState } from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { useSettings } from '../../contexts/SettingsContext';
import { Trash2, Repeat, Plus, Coffee, ShoppingBag, Home, Car, Zap, Smartphone, MoreHorizontal, X } from 'lucide-react';
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
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colors[category] || colors['Other']}`}>
            <Icon size={16} className="sm:w-5 sm:h-5" />
        </div>
    );
};

const RecurringExpenses = () => {
    const { recurringExpenses, addRecurringExpense, deleteRecurringExpense } = useExpenses();
    const { t, formatCurrency, theme, language } = useSettings();
    const isDark = theme === 'dark';

    const [isModalOpen, setIsModalOpen] = useState(false);
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
        setIsModalOpen(false);
        setFormData({ title: '', amount: '', category: 'Housing', dayOfMonth: '1' });
    };

    const confirmDelete = () => {
        if (deleteModal.id) {
            deleteRecurringExpense(deleteModal.id);
            setDeleteModal({ isOpen: false, id: null });
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 pb-20">
            {/* Header */}
            <div>
                <h2 className="text-lg sm:text-2xl font-bold text-main flex items-center gap-2">
                    <Repeat className="text-indigo-500" size={20} />
                    {language === 'id' ? 'Pengeluaran Rutin' : 'Recurring Expenses'}
                </h2>
                <p className="text-muted text-sm">
                    {language === 'id'
                        ? 'Kelola pengeluaran yang otomatis dicatat setiap bulan'
                        : 'Manage expenses that are automatically logged every month'}
                </p>
            </div>

            {/* Recurring Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {recurringExpenses.map(rec => (
                    <div
                        key={rec.id}
                        className={`p-3 sm:p-4 rounded-2xl border transition-all hover:shadow-lg group relative
                            ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}
                        `}
                    >
                        <div className="flex justify-between items-start mb-2 sm:mb-3">
                            <CategoryIcon category={rec.category} />
                            <div className="text-right">
                                <p className="font-bold text-base sm:text-lg text-main">{formatCurrency(rec.amount)}</p>
                                <p className="text-[10px] sm:text-xs text-muted">/{language === 'id' ? 'bulan' : 'month'}</p>
                            </div>
                        </div>

                        <h3 className="font-semibold text-sm sm:text-base text-main mb-1 truncate">{rec.title}</h3>

                        <div className="flex items-center gap-2 text-xs text-muted">
                            <Repeat size={12} />
                            <span>
                                {language === 'id'
                                    ? `Tanggal ${rec.dayOfMonth}`
                                    : `Day ${rec.dayOfMonth}`}
                            </span>
                        </div>

                        <button
                            onClick={() => setDeleteModal({ isOpen: true, id: rec.id })}
                            className="absolute top-3 right-3 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}

                {recurringExpenses.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted">
                        <Repeat size={48} className="mx-auto mb-4 opacity-20" />
                        <p>{language === 'id' ? 'Belum ada pengeluaran rutin' : 'No recurring expenses yet'}</p>
                    </div>
                )}
            </div>

            {/* Floating Add Button - Fixed at bottom */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-6 right-6 flex items-center gap-2 px-4 sm:px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 z-40"
            >
                <Plus size={20} />
                <span className="font-medium text-sm">{language === 'id' ? 'Tambah Baru' : 'Add New'}</span>
            </button>

            {/* Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsModalOpen(false)}
                    />
                    <div className={`relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300
                        ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white'}
                    `}>
                        {/* Modal Header */}
                        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                            <h3 className="text-lg font-semibold text-main">
                                {language === 'id' ? 'Tambah Pengeluaran Rutin' : 'Add Recurring Expense'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                            >
                                <X size={20} className="text-muted" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-main">
                                    {language === 'id' ? 'Judul' : 'Title'}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border bg-transparent text-main
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
                                    className={`w-full px-4 py-3 rounded-xl border bg-transparent text-main
                                        ${isDark ? 'border-slate-600 focus:border-indigo-500' : 'border-slate-300 focus:border-indigo-500'}
                                    `}
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-main">
                                    {language === 'id' ? 'Kategori' : 'Category'}
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border bg-transparent text-main
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
                                    {language === 'id' ? 'Tanggal setiap Bulan' : 'Day of Month'} (1-31)
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max="31"
                                    value={formData.dayOfMonth}
                                    onChange={e => setFormData({ ...formData, dayOfMonth: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border bg-transparent text-main
                                        ${isDark ? 'border-slate-600 focus:border-indigo-500' : 'border-slate-300 focus:border-indigo-500'}
                                    `}
                                />
                            </div>

                            {/* Modal Footer */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors
                                        ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                                    `}
                                >
                                    {language === 'id' ? 'Batal' : 'Cancel'}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
                                >
                                    {language === 'id' ? 'Simpan' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
