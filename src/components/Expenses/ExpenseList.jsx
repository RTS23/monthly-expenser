import React, { useState } from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { useSettings } from '../../contexts/SettingsContext';
import { Trash2, Pencil, ShoppingBag, Coffee, Home, Car, Zap, Smartphone, MoreHorizontal, Download, Image as ImageIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import ConfirmModal from '../UI/ConfirmModal';
import EditExpenseModal from './EditExpenseModal';

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

const ExpenseList = () => {
    const { expenses, deleteExpense, updateExpense, exportToCSV } = useExpenses();
    const { t, formatCurrency } = useSettings();

    const [deleteModal, setDeleteModal] = useState({ isOpen: false, expense: null });
    const [editModal, setEditModal] = useState({ isOpen: false, expense: null });
    const [receiptModal, setReceiptModal] = useState({ isOpen: false, url: null });

    const handleDeleteClick = (expense) => {
        setDeleteModal({ isOpen: true, expense });
    };

    const handleEditClick = (expense) => {
        setEditModal({ isOpen: true, expense });
    };

    const handleConfirmDelete = () => {
        if (deleteModal.expense) {
            deleteExpense(deleteModal.expense.id);
        }
        setDeleteModal({ isOpen: false, expense: null });
    };

    const handleSaveEdit = (updatedExpense) => {
        updateExpense(updatedExpense.id, {
            title: updatedExpense.title,
            amount: updatedExpense.amount,
            category: updatedExpense.category,
            date: updatedExpense.date,
            receiptUrl: updatedExpense.receiptUrl
        });
    };

    if (expenses.length === 0) {
        return (
            <div className="text-center py-12 glass-panel rounded-2xl">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag size={32} className="text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-main">{t('expenses.noExpenses')}</h3>
                <p className="text-muted max-w-xs mx-auto mt-2">{t('expenses.noExpensesDesc')}</p>
            </div>
        );
    }

    return (
        <>
            <div className="glass-panel rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="p-3 sm:p-4 border-b border-white/5 flex flex-wrap justify-between items-center gap-2">
                    <h2 className="font-semibold text-base sm:text-lg text-main">{t('expenses.recentTransactions')}</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                            title={t('expenses.export')}
                        >
                            <Download size={14} />
                            <span className="hidden sm:inline">{t('expenses.export')}</span>
                        </button>
                        <span className="text-xs font-medium px-2 py-1 bg-white/5 rounded-lg text-muted">
                            {expenses.length} {t('expenses.items')}
                        </span>
                    </div>
                </div>

                {/* Expense Items */}
                <div className="divide-y divide-slate-800/50 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {expenses.map((expense) => (
                        <div key={expense.id} className="p-3 sm:p-4 hover:bg-white/5 transition-colors group">
                            <div className="flex items-start gap-2 sm:gap-3">
                                <CategoryIcon category={expense.category} />

                                <div className="flex-1 min-w-0">
                                    {/* Title and Amount Row */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-medium text-sm sm:text-base text-main truncate">{expense.title}</h4>
                                            <div className="flex flex-wrap items-center gap-1 mt-0.5">
                                                <p className="text-[10px] sm:text-xs text-muted">{format(new Date(expense.date), 'dd MMM yyyy')}</p>
                                                {expense.receiptUrl && (
                                                    <button
                                                        onClick={() => setReceiptModal({ isOpen: true, url: expense.receiptUrl })}
                                                        className="flex items-center gap-0.5 text-[10px] px-1 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium"
                                                    >
                                                        <ImageIcon size={8} />
                                                        Struk
                                                    </button>
                                                )}
                                                {expense.username && (
                                                    <span className="text-[10px] px-1 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium">
                                                        @{expense.username}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right flex-shrink-0">
                                            <p className="font-bold text-sm sm:text-base text-main">-{formatCurrency(expense.amount)}</p>
                                            <p className="text-[10px] sm:text-xs text-muted">{t(`categories.${expense.category}`) || expense.category}</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1 mt-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditClick(expense)}
                                            className="p-1 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded text-xs flex items-center gap-1"
                                        >
                                            <Pencil size={12} />
                                            <span className="sm:hidden">Edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(expense)}
                                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded text-xs flex items-center gap-1"
                                        >
                                            <Trash2 size={12} />
                                            <span className="sm:hidden">Hapus</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, expense: null })}
                onConfirm={handleConfirmDelete}
                title="Hapus Pengeluaran?"
                message={`Yakin ingin menghapus "${deleteModal.expense?.title}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Hapus"
                cancelText="Batal"
                type="danger"
            />

            {/* Edit Expense Modal */}
            <EditExpenseModal
                isOpen={editModal.isOpen}
                onClose={() => setEditModal({ isOpen: false, expense: null })}
                onSave={handleSaveEdit}
                expense={editModal.expense}
            />

            {/* Receipt Preview Modal */}
            {receiptModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setReceiptModal({ isOpen: false, url: null })}
                    />
                    <div className="relative w-full max-w-2xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-200">
                        <div className="absolute top-4 right-4 z-10">
                            <button
                                onClick={() => setReceiptModal({ isOpen: false, url: null })}
                                className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-md"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <img
                            src={receiptModal.url}
                            alt="Receipt"
                            className="w-full h-auto max-h-[80vh] object-contain bg-black"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default ExpenseList;
