import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type = 'danger' }) => {
    if (!isOpen) return null;

    const colors = {
        danger: {
            icon: 'bg-rose-500/20 text-rose-400',
            button: 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/25'
        },
        warning: {
            icon: 'bg-amber-500/20 text-amber-400',
            button: 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/25'
        }
    };

    const style = colors[type] || colors.danger;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm glass-panel p-6 rounded-2xl animate-in zoom-in-95 fade-in duration-300 shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-full ${style.icon} flex items-center justify-center mx-auto mb-4`}>
                    <AlertTriangle size={28} />
                </div>

                {/* Content */}
                <div className="text-center mb-6">
                    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                    <p className="text-sm text-slate-400">{message}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-all"
                    >
                        {cancelText || 'Batal'}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-3 px-4 rounded-xl text-white font-medium transition-all shadow-lg ${style.button}`}
                    >
                        {confirmText || 'Hapus'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
